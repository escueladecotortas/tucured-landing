// Archivo: scripts/verify_task074_prelaunch.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5177, PORT_CDP = 9236, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));

const SHARED_MODULES = [
  'public/js/admin_shared/admin_shell.js',
  'public/js/admin_shared/admin_booking_engine.js',
  'public/js/admin_shared/admin_pin_gate.js',
  'public/js/admin_shared/admin_wa_templates.js',
  'public/js/admin_shared/ticket_portal.js',
  'js/showcase_v11/showcase_booking_sync.js'
];
const HTML_PAGES = ['index.html', 'admin_l1.html', 'admin_l2.html', 'admin_l3.html', 'gestion_turno.html'];

function runStaticAudit() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BUILD dist/, ENLACES LOCALES, AST Y PARIDAD ===');
  for (const page of HTML_PAGES) {
    const distFile = path.resolve('dist', page);
    ok(fs.existsSync(distFile), `Build dist/${page} existe`);
    const html = fs.readFileSync(distFile, 'utf8');
    const refs = [...html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)].map(m => m[1]);
    const missing = refs.filter(r => r !== '/t/' && !fs.existsSync(path.resolve('dist', r.slice(1))));
    ok(missing.length === 0, `dist/${page}: 0 enlaces locales rotos (${refs.length} refs verificadas)`);
  }
  const redir = fs.readFileSync(path.resolve('dist/_redirects'), 'utf8');
  const engRedir = fs.readFileSync(path.join(ENGINE, 'public/_redirects'), 'utf8');
  ok(redir.includes('/t/*') && redir.includes('/gestion_turno.html?token=:splat'), 'dist/_redirects contiene regla /t/* -> /gestion_turno.html');
  ok(engRedir.includes('/t/*') && engRedir.indexOf('/t/*') < engRedir.indexOf('\n/*'), 'Blueprint _redirects mantiene /t/* antes de wildcard');

  for (const rel of SHARED_MODULES) {
    const src = path.resolve(rel);
    const eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8');
    const lines = txt.split(/\r?\n/).length;
    ok(lines <= 180 && spawnSync('node', ['--check', src]).status === 0, `${rel} (${lines}L <= 180L, AST OK)`);
    ok(fs.existsSync(eng) && fs.readFileSync(eng, 'utf8') === txt, `Paridad byte-exacta con Blueprint: ${rel}`);
  }
}

const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const req = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); });
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
      else if (m.method === 'Network.responseReceived') {
        const r = m.params.response;
        if (r.url.startsWith(BASE) && r.status >= 400 && !r.url.includes('favicon')) this.httpFails.push(`${r.status} ${r.url}`);
      }
    });
  }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    await this.send('Runtime.enable'); await this.send('Log.enable'); await this.send('Network.enable');
  }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expression) { const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result?.value; }
  close() { this.ws.close(); }
}

async function openTab(q, w = 375, h = 667) {
  const t = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?${encodeURIComponent(BASE + q)}`, 'PUT');
  const cdp = new Cdp(t.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
  for (let i = 0; i < 40; i++) { if ((await cdp.evalJs('document.readyState').catch(() => '')) === 'complete') break; await wait(120); }
  await wait(450); return cdp;
}

async function auditAdminMobile375(url, lvl) {
  const cdp = await openTab(url, 375, 667);
  await cdp.evalJs('sessionStorage.clear(); localStorage.clear(); location.reload();').catch(() => null);
  for (let i = 0; i < 40; i++) { await wait(120); if (await cdp.evalJs("document.readyState==='complete' && !!document.querySelector('[data-pin-digit=\"4\"]')").catch(() => false)) break; }
  await wait(250);
  const r = await cdp.evalJs(`(async () => {
    const w = (ms=160) => new Promise(res => setTimeout(res, ms));
    const mods = Boolean(window.AdminPinGate && window.AdminShell && window.AdminBookingEngine && window.AdminWaTemplates);
    for (const d of ['4','2','4','2']) document.querySelector('[data-pin-digit="' + d + '"]')?.click();
    await w(380);
    const unlocked = Boolean(document.getElementById('pinAuthModal')?.classList.contains('hidden'));
    const overflowX = document.documentElement.scrollWidth > window.innerWidth;
    const pill = document.getElementById('mobile-turnero-pill');
    const pillOpen = pill?.textContent.trim() === 'Turnero Abierto' && pill.getBoundingClientRect().width > 0;
    pill?.click(); await w(100);
    const pillPaused = pill?.textContent.trim() === 'Turnero Pausado';
    pill?.click(); await w(100);
    const cards = [...document.querySelectorAll('.admin-kpi-grid > div')].filter(el => el.offsetParent !== null);
    const rects = cards.map(el => el.getBoundingClientRect());
    const kpi1Row = cards.length === 3 && (Math.max(...rects.map(x => x.top)) - Math.min(...rects.map(x => x.top)) <= 4) && Math.max(...rects.map(x => x.right)) <= window.innerWidth + 1;
    document.getElementById('btn-open-sidebar')?.click(); await w(240);
    const outBtn = document.getElementById('btn-logout-session');
    const outR = outBtn?.getBoundingClientRect();
    const logoutVisible = Boolean(outR && outR.width > 0 && outR.bottom <= window.innerHeight + 2 && outR.right <= window.innerWidth + 2);
    outBtn?.click(); await w(180);
    const relocked = !document.getElementById('pinAuthModal')?.classList.contains('hidden');
    return { mods, unlocked, overflowX, scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, pillOpen, pillPaused, kpiCount: cards.length, kpi1Row, logoutVisible, relocked };
  })()`);
  ok(r.mods && r.unlocked, `${lvl} (375x667): Módulos compartidos cargados y PIN 4242 desbloquea`);
  ok(!r.overflowX, `${lvl} (375x667): Sin desborde horizontal (${r.scrollW} <= ${r.innerW})`);
  ok(r.pillOpen && r.pillPaused, `${lvl} (375x667): Píldora Turnero Abierto / Pausado visible e interactiva`);
  ok(r.kpi1Row, `${lvl} (375x667): 3 KPIs en fila compacta sin desbordar (${r.kpiCount} cards)`);
  ok(r.logoutVisible && r.relocked, `${lvl} (375x667): Drawer móvil muestra Cerrar Sesión accesible y relockea PIN`);
  ok(cdp.httpFails.length === 0 && cdp.errors.length === 0, `${lvl} (375x667): 0 errores HTTP/404 y 0 errores JS`);
  cdp.close();
}

async function runHeadlessAudit() {
  console.log('\n=== 2. CERTIFICACIÓN HEADLESS 375x667 SOBRE BUILD VITE PREVIEW ===');
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  const srv = spawn('node', [viteBin, 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const tmp = path.resolve('.tmp-cdp-074'); fs.mkdirSync(tmp, { recursive: true });
  const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${tmp}`], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await reqJson(`${BASE}/`); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }

    const home = await openTab('/', 375, 667);
    await home.evalJs('localStorage.clear(); sessionStorage.clear(); location.reload();').catch(() => null);
    await wait(700);
    const hRes = await home.evalJs(`(async () => {
      const w = (ms=160) => new Promise(r => setTimeout(r, ms));
      const overflowX = document.documentElement.scrollWidth > window.innerWidth;
      window.ShowcaseCore?.selectLevel('l3'); window.ShowcaseCore?.selectRubro('estetica'); await w(120);
      window.ShowcaseCore?.nextStep(); await w(120); window.ShowcaseCore?.nextStep(); await w(120);
      window.ShowcaseCore?.confirmBooking(); await w(220);
      const st = window.ShowcaseCore?.getState() || {};
      const code = st.lastBookingCode || '';
      return { overflowX, scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, code, synced: Boolean(st.lastBookingRecord?.createdFromShowcase) };
    })()`);
    ok(!hRes.overflowX, `Landing index.html (375x667): Sin overflow-x (${hRes.scrollW} <= ${hRes.innerW})`);
    ok(hRes.synced && /^TK-[A-Z0-9]{4}$/.test(hRes.code), `Showroom genera ticket #${hRes.code} vía showcase_booking_sync.js`);
    ok(home.httpFails.length === 0 && home.errors.length === 0, 'Landing index.html (375x667): 0 errores HTTP/404 y 0 JS');
    home.close();

    const portal = await openTab(`/gestion_turno.html?token=${hRes.code}`, 375, 667);
    const pRes = await portal.evalJs(`(() => ({
      overflowX: document.documentElement.scrollWidth > window.innerWidth,
      scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth,
      hasPortalMod: Boolean(window.TucuTicketPortal && window.AdminBookingEngine && window.AdminShell),
      hasCode: document.body.innerText.includes('${hRes.code}'),
      hasActions: Boolean((document.getElementById('btn-report-receipt') || document.getElementById('btn-confirm-attendance')) && document.getElementById('btn-ask-cancel'))
    }))()`);
    ok(!pRes.overflowX && pRes.hasPortalMod && pRes.hasCode && pRes.hasActions, `Portal /gestion_turno.html (375x667): Sin overflow-x (${pRes.scrollW} <= ${pRes.innerW}), módulos y ticket #${hRes.code} OK`);
    ok(portal.httpFails.length === 0 && portal.errors.length === 0, 'Portal /gestion_turno.html (375x667): 0 errores HTTP/404 y 0 JS');
    portal.close();

    await auditAdminMobile375('/admin_l1.html?slug=demo-peluqueria', 'Admin L1');
    await auditAdminMobile375('/admin_l2.html', 'Admin L2');
    await auditAdminMobile375('/admin_l3.html', 'Admin L3');
  } finally {
    chrome.kill('SIGKILL'); srv.kill('SIGKILL');
    await wait(350);
    try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 3 }); } catch (_) {}
  }
}

runStaticAudit();
await runHeadlessAudit();
console.log(`\n=== RESUMEN FINAL TASK-074: ${pass} PASSED / ${fail} FAILED ===\n`);
process.exit(fail > 0 ? 1 : 0);
