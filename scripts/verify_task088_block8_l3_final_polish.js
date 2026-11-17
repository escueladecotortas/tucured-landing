// Archivo: scripts/verify_task088_block8_l3_final_polish.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5188, PORT_CDP = 9249, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const TOUCHED = [
  'public/admin_l3.html', 'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js',
  'public/js/admin_l3/view_clients.js', 'public/js/admin_l3/view_services.js',
  'public/js/admin_l3/view_staff.js', 'public/js/admin_l3/view_telemetry.js',
  'public/js/admin_shared/admin_manual_data_l3.js'
];

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); });
  q.on('error', rej); q.end();
});

class Cdp {
  constructor(ws) {
    this.ws = new WebSocket(ws); this.id = 1; this.p = new Map(); this.errors = []; this.httpFails = [];
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const x = this.p.get(m.id); this.p.delete(m.id); m.error ? x.rej(new Error(m.error.message)) : x.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params.exceptionDetails.text);
      else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !(m.params.entry.url || '').includes('favicon')) this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params.response.url.startsWith(BASE) && m.params.response.status >= 400 && !m.params.response.url.includes('favicon')) this.httpFails.push(`${m.params.response.status} ${m.params.response.url}`);
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); await this.send('Network.enable'); await this.send('Page.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result?.value; }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(100); const st = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (st && st.h.startsWith(BASE) && st.r === 'complete') break; } await wait(350); }
  close() { this.ws.close(); }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 8 (<=180L, AST, 0 INDIGO/EMOJI, SHA-256) ===');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), eng = path.join(ENGINE, rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo/emojis: ${rel}`);
    ok(fs.existsSync(eng) && sha256(src) === sha256(eng), `Paridad SHA-256: ${rel}`);
  }
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-088'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

    console.log('\n=== 2. VERIFICACIÓN E2E L3 BLOQUE 8 (1280x800 & 375x667) ===');
    await cdp.goto('/admin_l3.html');
    await cdp.evalJs(`sessionStorage.setItem('tucu_admin_auth','1'); location.reload();`);
    await wait(450);

    const staffRes = await cdp.evalJs(`(() => {
      document.querySelector('[data-tab="staff"]')?.click();
      AdminL3Staff.openEditModal('st-1');
      const card = document.querySelector('#admin-modal-root > div');
      const hrs = document.getElementById('staff-hours-list');
      const cRect = card.getBoundingClientRect(), hRect = hrs.getBoundingClientRect();
      const splitChk = document.getElementById('dh-split-1')?.closest('label')?.getBoundingClientRect();
      const contained = hRect.right <= cRect.right + 1 && (!splitChk || splitChk.right <= cRect.right + 1) && card.scrollWidth <= card.clientWidth + 1;
      card.querySelector('button')?.click();
      return { contained, modalW: Math.round(cRect.width), hoursRight: Math.round(hRect.right), cardRight: Math.round(cRect.right) };
    })()`);
    ok(staffRes.contained, `Modal Staff L3 1280x800 contenido sin desborde (${JSON.stringify(staffRes)})`);

    const srvRes = await cdp.evalJs(`(() => {
      document.querySelector('[data-tab="services"]')?.click();
      AdminL3Services.openEditModal('srv-1');
      const modalTxt = document.getElementById('admin-modal-root')?.innerText || '';
      const clean = !modalTxt.includes('Ver Precio Web') && !modalTxt.includes('Ver Duración Web') && !document.getElementById('sv-showprice') && !document.getElementById('sv-showdur');
      document.getElementById('admin-modal-root')?.classList.add('hidden');
      return clean;
    })()`);
    ok(srvRes, 'Servicios L3 sin campos obsoletos "Ver Precio Web" ni "Ver Duración Web"');

    const telRes = await cdp.evalJs(`(() => {
      const sideTxt = document.getElementById('admin-sidebar')?.innerText || '';
      document.querySelector('[data-tab="telemetry"]')?.click();
      const viewTxt = document.getElementById('admin-view-root')?.innerText || '';
      const noTech = !/Daemon|Hash Idempotencia|Microservicio|Cron T-2hs|Telemetría Cron/i.test(sideTxt + ' ' + viewTxt);
      const hasCom = viewTxt.includes('Confirmación Automática de Turnos (2 hs antes)') && viewTxt.includes('AUTOMATIZACIÓN ACTIVA') && viewTxt.includes('Ejecutar Revisión Ahora') && viewTxt.includes('Historial de Revisiones Automáticas');
      return { noTech, hasCom };
    })()`);
    ok(telRes.noTech && telRes.hasCom, 'Confirmación Automática (2 hs antes) L3 sin jerga técnica y con lenguaje comercial claro');

    const cliRes = await cdp.evalJs(`(() => {
      document.querySelector('[data-tab="clients"]')?.click();
      const txt = document.getElementById('admin-view-root')?.innerText || '';
      return !txt.includes('Clientes VIP') && txt.includes('Clientes y Contactos');
    })()`);
    ok(cliRes, 'Contactos & CRM L3 sin etiqueta legacy "Clientes VIP (>= 3 citas)"');

    const manRes = await cdp.evalJs(`(() => {
      document.querySelector('[data-tab="manual"]')?.click();
      document.querySelector('[data-manual-nav="l3-sistema"]')?.click();
      const txt = document.getElementById('manual-content-l3')?.innerText || '';
      return txt.includes('Confirmación Automática (2 hs antes)') && txt.includes('Ejecutar Revisión Ahora') && !/Telemetría Cron/i.test(txt);
    })()`);
    ok(manRes, 'Manual de Uso L3 explica claramente la Confirmación Automática (2 hs antes)');

    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    const mobStaff = await cdp.evalJs(`(() => {
      document.querySelector('[data-tab="staff"]')?.click();
      AdminL3Staff.openEditModal('st-1');
      const card = document.querySelector('#admin-modal-root > div');
      const okW = card.scrollWidth <= card.clientWidth + 1;
      document.getElementById('admin-modal-root')?.classList.add('hidden');
      return okW;
    })()`);
    ok(mobStaff, 'Modal Staff L3 375x667 sin desborde horizontal');
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpFails.length})`);
    cdp.close();
  } finally {
    try { chrome.kill('SIGKILL'); } catch {}
    try { preview.kill('SIGKILL'); } catch {}
    await wait(300);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }

  console.log(`\nRESULTADO BLOQUE 8: ${pass}/${pass + fail} PASS | FAIL=${fail}\n`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
