// Archivo: scripts/verify_task089_block9_l3_split_and_toggle.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5189, PORT_CDP = 9250, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const TOUCHED = [
  'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_staff.js',
  'public/js/admin_l3/view_telemetry.js', 'public/js/admin_l3/view_system.js',
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 9 (<=180L, AST, 0 INDIGO/EMOJI, SHA-256) ===');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), eng = path.join(ENGINE, rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L)`);
    ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo/emojis: ${rel}`);
    ok(fs.existsSync(eng) && sha256(src) === sha256(eng), `Paridad SHA-256: ${rel}`);
  }
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-089'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

    console.log('\n=== 2. VERIFICACIÓN E2E BLOQUE 9 (ALINEACIÓN 2DO T. & SWITCH MAESTRO L3) ===');
    await cdp.goto('/admin_l3.html');
    await cdp.evalJs(`localStorage.clear(); sessionStorage.setItem('tucu_admin_auth','1'); location.reload();`);
    await wait(450);

    const splitAlign = await cdp.evalJs(`(() => {
      document.querySelector('[data-tab="staff"]')?.click();
      AdminL3Staff.openEditModal('st-1');
      const chk = document.getElementById('dh-split-1');
      chk.checked = true; chk.dispatchEvent(new Event('change', { bubbles: true }));
      const r1 = document.getElementById('dh-start-1').getBoundingClientRect();
      const r2 = document.getElementById('dh-open2-1').getBoundingClientRect();
      const e1 = document.getElementById('dh-end-1').getBoundingClientRect();
      const e2 = document.getElementById('dh-close2-1').getBoundingClientRect();
      const lbl1 = !document.getElementById('dh-lbl1-1')?.classList.contains('hidden');
      document.getElementById('admin-modal-root')?.classList.add('hidden');
      return { dxStart: Math.abs(r1.left - r2.left), dxEnd: Math.abs(e1.left - e2.left), lbl1 };
    })()`);
    ok(splitAlign.lbl1 && splitAlign.dxStart <= 2 && splitAlign.dxEnd <= 2, `Alineación simétrica Mañana/Tarde en 2do T. (dxStart=${splitAlign.dxStart}px, dxEnd=${splitAlign.dxEnd}px)`);

    const toggleOff = await cdp.evalJs(`(() => {
      document.querySelector('[data-tab="telemetry"]')?.click();
      document.getElementById('btn-l3-auto-confirm-toggle')?.click();
      const badge = document.getElementById('l3-auto-confirm-badge')?.innerText || '';
      const runDis = document.getElementById('btn-l3-run-review-now')?.disabled === true;
      const viewTxt = document.getElementById('admin-view-root')?.innerText || '';
      const sideTxt = document.getElementById('cron-telemetry-badge')?.innerText || '';
      document.querySelector('[data-tab="system"]')?.click();
      const rem2Checked = document.getElementById('l3-rem-2h')?.checked;
      return { badge, runDis, pausedCard: viewTxt.includes('Pausada por el usuario'), sidePaused: sideTxt.includes('PAUSADO'), rem2Checked };
    })()`);
    ok(toggleOff.badge === 'AUTOMATIZACIÓN PAUSADA' && toggleOff.runDis && toggleOff.pausedCard && toggleOff.sidePaused && toggleOff.rem2Checked === false, 'Switch Maestro pausa Confirmación 2hs, deshabilita botón, actualiza sidebar y sincroniza #l3-rem-2h');

    const toggleOnFromSys = await cdp.evalJs(`(() => {
      const cb = document.getElementById('l3-rem-2h');
      cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true }));
      const sideAct = (document.getElementById('cron-telemetry-badge')?.innerText || '').includes('ACTIVO');
      document.querySelector('[data-tab="telemetry"]')?.click();
      const badge = document.getElementById('l3-auto-confirm-badge')?.innerText || '';
      const runEnabled = document.getElementById('btn-l3-run-review-now')?.disabled === false;
      return { sideAct, badge, runEnabled };
    })()`);
    ok(toggleOnFromSys.sideAct && toggleOnFromSys.badge === 'AUTOMATIZACIÓN ACTIVA' && toggleOnFromSys.runEnabled, 'Reactivación desde #l3-rem-2h sincroniza Switch Maestro, badge y botón');
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpFails.length})`);
    cdp.close();
  } finally {
    try { chrome.kill('SIGKILL'); } catch {}
    try { preview.kill('SIGKILL'); } catch {}
    await wait(300);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }

  console.log(`\nRESULTADO BLOQUE 9: ${pass}/${pass + fail} PASS | FAIL=${fail}\n`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
