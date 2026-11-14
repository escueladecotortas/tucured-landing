// Archivo: scripts/verify_task072_full_journey_e2e.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn, spawnSync } from 'child_process';

const BASE = 'http://localhost:5174';
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9234;
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));

const FILES = [
  'public/css/admin_unified.css', 'public/admin_l1.html', 'public/admin_l2.html', 'public/admin_l3.html',
  'public/js/admin_shared/admin_pin_gate.js', 'public/js/admin_shared/admin_wa_templates.js',
  'public/js/admin_shared/admin_shell.js', 'public/js/admin_shared/admin_booking_engine.js',
  'public/js/admin_l1/admin_l1_auth.js', 'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l1/admin_l1_agenda.js', 'public/js/admin_l1/admin_l1_config.js',
  'public/js/admin_l2/admin_l2_calendar.js', 'public/js/admin_l2/admin_l2_config.js',
  'public/js/admin_l3/view_agenda.js', 'public/js/admin_l3/view_system.js'
];
const SC_FILES = ['js/showcase_v11/showcase_admin_preview.js', 'js/showcase_v11/showcase_mockup.js'];

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, AST (<180L) Y PARIDAD BLUEPRINT ===');
  const emojiRx = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
  for (const rel of FILES) {
    const src = path.resolve(rel), eng = path.join(ENGINE, rel), txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180, `${rel} <=180L (${lines.length}L)`);
    ok(lines[0].includes('Archivo:') && !/\bindigo\b/i.test(txt), `${rel} encabezado PEAC & 0 indigo`);
    const ui = lines.filter(l => !['//', '/*', '*'].some(p => l.trim().startsWith(p))).join('\n');
    ok(!emojiRx.test(ui), `${rel} 0 emojis UI`);
    ok(fs.existsSync(eng) && fs.readFileSync(eng, 'utf8') === txt, `Paridad byte-exacta: ${rel}`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
  }
  for (const rel of SC_FILES) {
    const src = path.resolve(rel), eng = path.join(ENGINE, 'public', rel), txt = fs.readFileSync(src, 'utf8');
    ok(txt.split(/\r?\n/).length <= 180 && fs.existsSync(eng) && fs.readFileSync(eng, 'utf8') === txt, `Showcase paridad <=180L: ${rel}`);
  }
}

const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const req = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); });
  req.on('error', rej); req.end();
});

class Cdp {
  constructor(ws) {
    this.ws = new WebSocket(ws); this.id = 1; this.p = new Map(); this.errors = [];
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const x = this.p.get(m.id); this.p.delete(m.id); m.error ? x.rej(new Error(m.error.message)) : x.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params.exceptionDetails.text);
      else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !(m.params.entry.url || '').includes('favicon')) this.errors.push(m.params.entry.text);
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expression) { const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result?.value; }
  close() { this.ws.close(); }
}

async function openTab(q, w = 390, h = 844) {
  const t = await reqJson(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + q)}`, 'PUT');
  const cdp = new Cdp(t.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
  for (let i = 0; i < 40; i++) { if ((await cdp.evalJs('document.readyState').catch(() => '')) === 'complete') break; await new Promise(r => setTimeout(r, 150)); }
  await new Promise(r => setTimeout(r, 550)); return cdp;
}

const wait = (ms = 220) => new Promise(r => setTimeout(r, ms));

async function verifyConsole(pathUrl, lvl, cfgAction, undoSelectorText = 'Reabrir turno') {
  const cdp = await openTab(pathUrl, 390, 844);
  await cdp.evalJs('sessionStorage.clear(); localStorage.clear(); location.reload();').catch(() => null);
  await wait(700);
  const res = await cdp.evalJs(`(async () => {
    const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
    const pinOpen1 = !document.getElementById('pinAuthModal')?.classList.contains('hidden');
    for (const d of ['4','2','4','2']) document.querySelector('[data-pin-digit="' + d + '"]')?.click();
    await wait(260);
    const unlocked = document.getElementById('pinAuthModal')?.classList.contains('hidden') && sessionStorage.getItem('tucu_admin_auth') === '1';
    const pill = document.getElementById('mobile-turnero-pill');
    const pillInit = pill?.textContent.trim();
    pill?.click(); await wait(100);
    const pillPaused = pill?.textContent.trim();
    pill?.click(); await wait(100);
    const kpiCards = [...document.querySelectorAll('.admin-kpi-grid > div')].filter(el => el.offsetParent !== null);
    const kpiYs = kpiCards.map(el => Math.round(el.getBoundingClientRect().top));
    const singleRowKpi = kpiCards.length === 3 && Math.max(...kpiYs) - Math.min(...kpiYs) <= 4;
    const creditBtn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Acreditar Seña'));
    creditBtn?.click(); await wait(150);
    document.getElementById('pm-confirm')?.click(); await wait(200);
    const finBtn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Marcar Finalizado'));
    finBtn?.click(); await wait(200);
    const hasReabrir = [...document.querySelectorAll('button')].some(b => b.innerText.includes('${undoSelectorText}') && b.querySelector('svg') && !b.innerText.includes('\u21A9'));
    [...document.querySelectorAll('button')].find(b => b.innerText.includes('${undoSelectorText}'))?.click(); await wait(180);
    const bodyAfterUndo = document.body.innerText;
    ${cfgAction}
    await wait(220);
    const waInp = document.getElementById('cfg-wa-number');
    const waLocked = Boolean(waInp && waInp.value === '5493815551234' && waInp.readOnly && waInp.disabled);
    const p1 = document.getElementById('cfg-preview-confirm')?.textContent || '';
    const p2 = document.getElementById('cfg-preview-reminder')?.textContent || '';
    const tplsOk = Boolean(p1.includes('Martín') && p2.includes('Martín') && !p1.includes('{{') && !p2.includes('{{'));
    document.getElementById('btn-open-sidebar')?.click(); await wait(220);
    const appRect = document.getElementById('btnThemeToggle')?.getBoundingClientRect();
    const outBtn = document.getElementById('btn-logout-session');
    const outRect = outBtn?.getBoundingClientRect();
    const drawerFit = Boolean(appRect && outRect && outRect.bottom <= window.innerHeight + 2 && outRect.width > 0);
    outBtn?.click(); await wait(200);
    const relocked = !document.getElementById('pinAuthModal')?.classList.contains('hidden') && sessionStorage.getItem('tucu_admin_auth') === null;
    return { pinOpen1, unlocked, pillInit, pillPaused, singleRowKpi, kpiCount: kpiCards.length, hasReabrir, bodyAfterUndo, waLocked, tplsOk, drawerFit, relocked };
  })()`);
  ok(res.pinOpen1 && res.unlocked, `${lvl} mobile: PIN 4 dígitos abre y desbloquea con 4242`);
  ok(res.pillInit === 'Turnero Abierto' && res.pillPaused === 'Turnero Pausado', `${lvl} mobile: Píldora Turnero Abierto <-> Turnero Pausado`);
  ok(res.singleRowKpi, `${lvl} mobile: Exactamente 3 KPIs en 1 sola fila horizontal (${res.kpiCount})`);
  ok(res.hasReabrir && res.bodyAfterUndo.includes('Turno reabierto'), `${lvl}: Botón [SVG] Reabrir turno y toast de confirmación`);
  ok(res.waLocked && res.tplsOk, `${lvl} Config: WA demo readonly disabled + 2 plantillas en vivo`);
  ok(res.drawerFit && res.relocked, `${lvl} Sidebar: Apariencia + Cerrar Sesión visibles y logout vuelve a PIN`);
  ok(cdp.errors.length === 0, `${lvl}: 0 errores de consola${cdp.errors.length ? ' -> ' + cdp.errors.join(' | ') : ''}`);
  cdp.close();
}

async function runCdp() {
  console.log('\n=== 2. SUITE JOURNEY E2E CHROME HEADLESS CDP (TASK-072) ===');
  const tmp = path.resolve('.tmp-cdp-t072'); fs.mkdirSync(tmp, { recursive: true });
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, '--disable-gpu', '--no-sandbox', `--user-data-dir=${tmp}`, 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT}/json/version`); break; } catch { await wait(250); } }
    // A. Customer Journey & Embed Frame Showroom
    const land = await openTab('/', 1280, 900);
    await land.evalJs('sessionStorage.clear(); localStorage.clear(); location.reload();').catch(() => null);
    await wait(900);
    const landRes = await land.evalJs(`(async () => {
      const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
      window.ShowcaseCore?.selectStep(1); await wait(120);
      window.ShowcaseCore?.nextStep(); await wait(120);
      window.ShowcaseCore?.nextStep(); await wait(120);
      window.ShowcaseCore?.confirmBooking(); await wait(200);
      const tkText = document.getElementById('mockup-container')?.innerText || '';
      const hasTk = /#TK-[A-Z0-9]{4}/.test(tkText) && tkText.includes('Agendar en mi Calendario');
      window.ShowcaseCore?.setViewMode('admin');
      for (let i = 0; i < 20; i++) {
        await wait(150);
        if (document.querySelector('#mockup-container iframe')?.contentDocument?.querySelector('[data-pin-digit="1"]')) break;
      }
      const frame = document.querySelector('#mockup-container iframe');
      const wrapH = frame?.parentElement?.getBoundingClientRect().height || 0;
      const doc = frame?.contentDocument;
      for (const d of ['1','3','5','7']) doc?.querySelector('[data-pin-digit="' + d + '"]')?.click();
      await wait(300);
      const embUn = Boolean(doc?.getElementById('pinAuthModal')?.classList.contains('hidden'));
      doc?.getElementById('btn-open-sidebar')?.click(); await wait(250);
      const app = doc?.getElementById('btnThemeToggle')?.getBoundingClientRect();
      const out = doc?.getElementById('btn-logout-session')?.getBoundingClientRect();
      const embFit = Boolean(app && out && out.bottom <= wrapH + 2 && out.width > 0);
      return { hasTk, wrapH, embUn, embFit, appB: app?.bottom, outB: out?.bottom, outW: out?.width };
    })()`);
    ok(landRes.hasTk, 'Journey Cliente Showroom: 4 pasos completos -> comprobante #TK y calendario');
    ok(landRes.wrapH >= 700 && landRes.embUn && landRes.embFit, `Showroom Admin Embed (${JSON.stringify(landRes)}): PIN 4 dígitos + Apariencia & Cerrar Sesión completos sin recorte`);
    ok(land.errors.length === 0, `Landing + Showroom Embed: 0 errores de consola${land.errors.length ? ' -> ' + land.errors.join(' | ') : ''}`);
    land.close();

    await verifyConsole('/admin_l1.html?slug=demo-peluqueria', 'L1', "document.getElementById('main-view-btn-configuracion')?.click();");
    await verifyConsole('/admin_l2.html', 'L2', "document.getElementById('main-view-btn-config')?.click(); await wait(100); document.getElementById('tab-btn-wa')?.click();");
    await verifyConsole('/admin_l3.html', 'L3', "document.querySelector('[data-tab=\"system\"]')?.click();");
  } finally {
    chrome.kill('SIGKILL');
    await wait(350);
    try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 150 }); } catch (_) {}
  }
}

(async () => {
  runStatic();
  await runCdp();
  console.log(`\n=== RESUMEN TASK-072 JOURNEY E2E: ${pass} PASSED / ${fail} FAILED ===`);
  process.exit(fail > 0 ? 1 : 0);
})();

