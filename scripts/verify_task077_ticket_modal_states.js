// Archivo: scripts/verify_task077_ticket_modal_states.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5178, PORT_CDP = 9239, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const BLUEPRINT_SYNCED = [
  'public/js/admin_shared/ticket_modal.js', 'public/js/admin_shared/ticket_portal.js',
  'public/js/admin_shared/turnero_app.js', 'public/turnero.html', 'js/showcase_v11/showcase_mockup.js'
];

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA TASK-077 (<=180L, AST, 0 EMOJIS, PARIDAD SHA-256) ===');
  for (const rel of [...BLUEPRINT_SYNCED, 'index.html']) {
    const src = path.resolve(rel), txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    const ui = lines.filter(l => !['//', '/*', '*'].some(p => l.trim().startsWith(p))).join('\n');
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L, header OK)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    if (rel.startsWith('public/')) ok(!/\bindigo\b/i.test(txt), `Sin indigo en ${rel}`);
    ok(!EMOJI_RE.test(ui), `Cero emojis UI en ${rel}`);
    if (rel !== 'index.html') {
      const eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
      ok(fs.existsSync(eng) && sha256(src) === sha256(eng), `Paridad SHA-256 Blueprint: ${rel}`);
    }
  }
}

const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const req = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); });
  req.on('error', rej); req.end();
});

class Cdp {
  constructor(ws) {
    this.ws = new WebSocket(ws); this.id = 1; this.p = new Map(); this.errors = []; this.httpFails = [];
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const x = this.p.get(m.id); this.p.delete(m.id); m.error ? x.rej(new Error(m.error.message)) : x.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params.exceptionDetails.text);
      else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !(m.params.entry.url || '').includes('favicon')) this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params.response.url.startsWith(BASE) && m.params.response.status >= 400 && !m.params.response.url.includes('favicon')) {
        this.httpFails.push(`${m.params.response.status} ${m.params.response.url}`);
      }
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); await this.send('Network.enable'); await this.send('Page.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result?.value; }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(110); const s = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (s && s.h.startsWith(BASE) && s.r === 'complete') break; } await wait(350); }
  close() { this.ws.close(); }
}

async function main() {
  runStatic();
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  const preview = spawn('node', [viteBin, 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-077'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });

  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }
    const tab = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await cdp.goto('/index.html');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear();');
    await cdp.goto('/index.html');

    console.log('\n=== 2. SHOWROOM MODAL IN-PLACE + CIERRES (X / BACKDROP / VOLVER) ===');
    const tabsBase = (await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`)).filter(t => t.type === 'page').length;
    await cdp.evalJs(`(async () => { const w=(ms=120)=>new Promise(r=>setTimeout(r,ms)); ShowcaseCore.selectLevel('l2'); ShowcaseCore.selectRubro('estetica'); await w(); ShowcaseCore.nextStep(); await w(); ShowcaseCore.nextStep(); await w(); ShowcaseCore.confirmBooking(); })()`);
    await wait(240);
    await cdp.evalJs(`document.getElementById('btn-showroom-open-ticket')?.click()`); await wait(160);
    const tabsSr = (await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`)).filter(t => t.type === 'page').length;
    const srM = await cdp.evalJs(`({ ov: !!document.getElementById('tucu-ticket-modal-overlay'), noAtt: document.getElementById('btn-confirm-attendance') === null, repEmerald: (document.getElementById('btn-report-receipt')?.className || '').includes('bg-emerald-700'), cancelDiscreet: (document.getElementById('btn-ask-cancel')?.className || '').includes('text-rose-700'), scrollOk: document.documentElement.scrollWidth <= 375, path: location.pathname })`);
    ok(tabsSr === tabsBase && srM.ov && srM.path === '/index.html' && srM.scrollOk, 'Showroom abre modal superpuesto sin cambiar URL ni abrir pestañas (375px OK)');
    ok(srM.noAtt && srM.repEmerald && srM.cancelDiscreet, 'Modal Pendiente Seña: oculta Confirmar asistencia, Informar en verde esmeralda y Cancelar discreto');

    await cdp.evalJs(`document.getElementById('btn-close-ticket-modal')?.click()`); await wait(100);
    const closedX = !(await cdp.evalJs(`!!document.getElementById('tucu-ticket-modal-overlay')`));
    await cdp.evalJs(`document.getElementById('btn-showroom-open-ticket')?.click()`); await wait(120);
    await cdp.evalJs(`document.getElementById('tucu-ticket-modal-overlay')?.click()`); await wait(100);
    const closedBg = !(await cdp.evalJs(`!!document.getElementById('tucu-ticket-modal-overlay')`));
    await cdp.evalJs(`document.getElementById('btn-showroom-open-ticket')?.click()`); await wait(120);
    await cdp.evalJs(`document.getElementById('btn-modal-return-turnero')?.click()`); await wait(100);
    const closedRet = !(await cdp.evalJs(`!!document.getElementById('tucu-ticket-modal-overlay')`));
    ok(closedX && closedBg && closedRet, 'Modal cierra fluidamente vía X, backdrop y "Volver al Turnero"');

    console.log('\n=== 3. TURNERO AUTÓNOMO PENDIENTE SEÑA + REPORTE IN-MODAL & /t/:token ===');
    await cdp.evalJs('localStorage.clear();');
    await cdp.goto('/turnero.html?level=l2&slug=demo-central&rubro=estetica');
    const tkPend = await cdp.evalJs(`(async () => {
      const w=(ms=120)=>new Promise(r=>setTimeout(r,ms));
      document.querySelector('[data-srv-id]')?.click(); await w();
      document.getElementById('btn-step1-next')?.click(); await w();
      document.getElementById('btn-step2-next')?.click(); await w();
      document.getElementById('inp-client-name').value = 'Ana Torres';
      document.getElementById('inp-client-phone').value = '3815557788';
      document.getElementById('btn-confirm-booking')?.click(); await w(180);
      const code = (document.body.innerText.match(/TK-[A-Z0-9]{4}/) || [''])[0];
      document.getElementById('btn-open-ticket')?.click(); await w(150);
      const noAtt = document.getElementById('btn-confirm-attendance') === null;
      document.getElementById('btn-report-receipt')?.click(); await w(140);
      const repOk = !!document.getElementById('receipt-reported-banner') && JSON.parse(localStorage.getItem('tucu_l2_bookings')||'[]')[0]?.depositReceiptReported === true;
      return { code, path: location.pathname, noAtt, repOk, ov: document.documentElement.scrollWidth > 375 };
    })()`);
    ok(tkPend.path === '/turnero.html' && tkPend.noAtt && tkPend.repOk && !tkPend.ov, `Modal Turnero Pendiente Seña (${tkPend.code}): sin Confirmar asistencia y reporta comprobante in-modal`);

    await cdp.goto(`/t/${tkPend.code}`);
    const portPend = await cdp.evalJs(`({ noAtt: document.getElementById('btn-confirm-attendance') === null, emerald: (document.getElementById('btn-report-receipt')?.className || '').includes('bg-emerald-700'), banner: !!document.getElementById('receipt-reported-banner'), ov: document.documentElement.scrollWidth > 375 })`);
    ok(portPend.noAtt && portPend.emerald && portPend.banner && !portPend.ov, `Portal /t/${tkPend.code} Pendiente Seña: sin Confirmar asistencia, botón esmeralda y persistencia OK`);

    console.log('\n=== 4. ESTADO CONFIRMADO: ALTA INMEDIATA VS MODO RECORDATORIO ===');
    await cdp.evalJs(`localStorage.clear(); localStorage.setItem('tucu_l1_services', JSON.stringify([{ id: 's_free', name: 'Corte Sin Seña', duration: 30, price: 8000, isActive: true, requireDeposit: false }]));`);
    await cdp.goto('/turnero.html?level=l1&slug=demo-peluqueria&rubro=peluqueria');
    const tkConf = await cdp.evalJs(`(async () => {
      const w=(ms=120)=>new Promise(r=>setTimeout(r,ms));
      document.querySelector('[data-srv-id]')?.click(); await w();
      document.getElementById('btn-step1-next')?.click(); await w();
      document.getElementById('btn-step2-next')?.click(); await w();
      document.getElementById('inp-client-name').value = 'Luis Paz';
      document.getElementById('inp-client-phone').value = '3815556677';
      document.getElementById('btn-confirm-booking')?.click(); await w(180);
      const code = (document.body.innerText.match(/TK-[A-Z0-9]{4}/) || [''])[0];
      document.getElementById('btn-open-ticket')?.click(); await w(150);
      const badge = document.getElementById('modal-status-badge')?.innerText || '';
      const imm = !!document.getElementById('immediate-confirmed-banner');
      const noAtt = document.getElementById('btn-confirm-attendance') === null;
      return { code, badge, imm, noAtt };
    })()`);
    ok(tkConf.badge.includes('Reserva Confirmada') && tkConf.imm && tkConf.noAtt, `Alta Confirmada in-modal (${tkConf.code}): insignia verde "Reserva Confirmada", sin reconfirmación redundante`);

    await cdp.goto(`/t/${tkConf.code}`);
    const rem = await cdp.evalJs(`(async () => {
      const btn = document.getElementById('btn-confirm-attendance');
      const cls = btn?.className || '';
      const askTxt = document.body.innerText.includes('¿Confirmás que vas a asistir a tu turno?');
      const isEmeraldNotRed = cls.includes('bg-emerald-700') && !cls.includes('800000') && !cls.includes('admin-glass-primary');
      btn?.click(); await new Promise(r => setTimeout(r, 150));
      const confirmedOk = document.body.innerText.includes('Asistencia confirmada por cliente');
      return { askTxt, isEmeraldNotRed, confirmedOk, ov: document.documentElement.scrollWidth > 375 };
    })()`);
    ok(rem.askTxt && rem.isEmeraldNotRed && rem.confirmedOk && !rem.ov, `Modo recordatorio /t/${tkConf.code}: microcopy + botón esmeralda "Confirmar asistencia" (nunca rojo) OK`);
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >=400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\n=== RESUMEN TASK-077: PASS=${pass} | FAIL=${fail} ===`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
