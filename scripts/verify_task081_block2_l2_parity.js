// Archivo: scripts/verify_task081_block2_l2_parity.js
import fs from 'fs'; import path from 'path'; import http from 'http'; import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';
const PORT_APP = 5182, PORT_CDP = 9243, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const TOUCHED = [
  'public/admin_l2.html', 'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_services.js',
  'public/js/admin_l2/admin_l2_calendar.js', 'public/js/admin_l2/admin_l2_config.js', 'public/js/admin_l2/admin_l2_schedule.js',
  'public/js/admin_l2/admin_l2_baileys_modal.js', 'public/js/admin_shared/admin_wa_templates.js',
  'public/js/admin_shared/ticket_modal.js', 'public/js/admin_shared/ticket_portal.js', 'public/js/admin_shared/turnero_app.js',
  'js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_booking_sync.js', 'js/showcase_v11/showcase_templates_l2.js'
];
function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 2 (<=180L, AST, OFFLINE QR, SHA-256) ===');
  ok(!/qrserver\.com/i.test(fs.readFileSync('public/admin_l2.html', 'utf8')), 'admin_l2.html sin dependencia externa qrserver.com');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L, header OK)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    if (rel.startsWith('public/')) ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo ni emojis: ${rel}`);
    ok(fs.existsSync(eng) && sha256(src) === sha256(eng), `Paridad SHA-256 Blueprint: ${rel}`);
  }
}
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }); q.on('error', rej); q.end(); });

class Cdp {
  constructor(ws) {
    this.ws = new WebSocket(ws); this.id = 1; this.p = new Map(); this.errors = []; this.httpFails = []; this.qrExt = [];
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const x = this.p.get(m.id); this.p.delete(m.id); m.error ? x.rej(new Error(m.error.message)) : x.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params.exceptionDetails.text);
      else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !(m.params.entry.url || '').includes('favicon')) this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.requestWillBeSent' && /qrserver/i.test(m.params.request.url)) this.qrExt.push(m.params.request.url);
      else if (m.method === 'Network.responseReceived' && m.params.response.url.startsWith(BASE) && m.params.response.status >= 400 && !m.params.response.url.includes('favicon')) this.httpFails.push(`${m.params.response.status} ${m.params.response.url}`);
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); await this.send('Network.enable'); await this.send('Page.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result?.value; }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(100); const st = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (st && st.h.startsWith(BASE) && st.r === 'complete') break; } await wait(300); }
  close() { this.ws.close(); }
}
async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-081'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }
    const tab = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await cdp.goto('/admin_l2.html?rubro=estetica');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem("tucured_pin_ok_L2","1");');
    await cdp.goto('/admin_l2.html?rubro=estetica');
    console.log('\n=== 2. TAREA 2.1: CATÁLOGO L2 (SEÑA, DURACIÓN, ORDEN E HISTORIAL) ===');
    const srvRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      document.getElementById('main-view-btn-services')?.click(); await w();
      document.getElementById('btn-l2-new-service')?.click(); await w();
      document.getElementById('l2-srv-name').value = 'Peeling Sin Seña';
      document.getElementById('l2-srv-price').value = '14000';
      document.getElementById('l2-srv-order').value = '1';
      document.getElementById('l2-srv-dur-sel').value = 'custom'; adminL2Services.onDurationChange('custom');
      document.getElementById('l2-srv-dur').value = '50';
      document.getElementById('l2-srv-require-deposit').checked = false;
      document.getElementById('btn-l2-srv-save')?.click(); await w();
      const created = adminL2Services.getServices(false).find(s => s.name === 'Peeling Sin Seña');
      const cardTxt1 = document.getElementById('l2-services-container')?.innerText || '';
      adminL2Services.openModal(created.id); await w();
      document.getElementById('l2-srv-price').value = '19500';
      document.getElementById('btn-l2-srv-save')?.click(); await w();
      const updated = adminL2Services.getServices(false).find(s => s.id === created.id);
      const cardTxt2 = document.getElementById('l2-services-container')?.innerText || '';
      adminL2Services.showPriceHistory(created.id); await w();
      const histModalTxt = document.getElementById('l2-price-history-modal')?.innerText || '';
      document.getElementById('l2-dynamic-modal-root').innerHTML = '';
      return { createdOk: !!created && created.order === 1 && created.duration === 50 && !created.requireDeposit, noSenaZero: cardTxt1.includes('Sin seña') && !cardTxt1.includes('Seña $0'), histLen: updated?.priceHistory?.length || 0, histBadge: cardTxt2.includes('Últ. ajuste'), histModalOk: histModalTxt.includes('14.000') && histModalTxt.includes('19.500') };
    })()`);
    ok(srvRes.createdOk && srvRes.noSenaZero, 'Servicio L2 con requireDeposit=false muestra "Sin seña", orden 1 y duración custom 50 min');
    ok(srvRes.histLen === 1 && srvRes.histBadge && srvRes.histModalOk, 'Cambio de precio L2 registra priceHistory y abre modal Historial ($14.000 -> $19.500)');
    console.log('\n=== 3. TAREA 2.2: TURNO MANUAL CON SELECTOR + FILTROS TEMPORALES L2 ===');
    const calRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      document.getElementById('main-view-btn-calendar')?.click(); await w();
      document.getElementById('btn-open-new-booking-modal')?.click(); await w();
      const sel = document.getElementById('l2-mbk-srv'), optCount = sel?.options?.length || 0;
      const optPaid = [...sel.options].find(o => o.dataset.req === 'true');
      sel.value = optPaid.value; sel.dispatchEvent(new Event('change')); await w(80);
      const autoPrice = document.getElementById('l2-mbk-price')?.value;
      document.getElementById('manual-book-name').value = 'Valeria Manual L2';
      document.getElementById('manual-book-phone').value = '3815551122';
      document.getElementById('manual-book-date').value = AdminShell.localTodayStr(1);
      document.getElementById('manual-book-date').dispatchEvent(new Event('change'));
      document.getElementById('manual-book-time').value = '16:30';
      document.getElementById('btn-save-manual-booking')?.click(); await w(120);
      document.querySelector('[data-l2tfilter="semana"]')?.click(); await w(100);
      const listTxt = document.getElementById('calendar-bookings-container')?.innerText || '';
      const saved = (JSON.parse(localStorage.getItem('tucu_l2_bookings_estetica') || '[]')).find(b => b.client === 'Valeria Manual L2');
      return { optCount, autoPrice, savedSrv: saved?.service, savedSrvId: saved?.serviceId, visibleInSemana: listTxt.includes('Valeria Manual L2') && listTxt.includes(saved?.service || '') };
    })()`);
    ok(calRes.optCount >= 3 && Number(calRes.autoPrice) > 0 && calRes.savedSrv && calRes.savedSrv !== 'Turno Reservado' && calRes.savedSrvId && calRes.visibleInSemana, `Turno manual L2 guarda servicio real (${calRes.savedSrv}) e importe (${calRes.autoPrice}), visible en filtro Esta Semana`);
    console.log('\n=== 4. TAREA 2.3: SIDEBAR RECEPCIÓN WEB, ALIAS/CBU, RECORDATORIOS & QR INLINE ===');
    const cfgRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      document.getElementById('btnTurneroSwitchL2')?.click(); await w(80);
      const pausedState = { flag: localStorage.getItem('tucu_l2_turnero_active_estetica'), txt: document.getElementById('turneroStatusTextL2')?.innerText };
      document.getElementById('btnTurneroSwitchL2')?.click(); await w(80);
      document.getElementById('main-view-btn-config')?.click(); await w();
      document.getElementById('l2-input-alias').value = 'estetica.yerba.mp';
      document.getElementById('l2-input-cbu').value = '0000003100099988877766';
      document.getElementById('l2-input-cbu').dispatchEvent(new Event('input'));
      document.getElementById('tab-btn-wa')?.click(); await w(80);
      const rem24 = !!document.getElementById('l2-rem-24h'), rem2 = !!document.getElementById('l2-rem-2h');
      document.getElementById('btn-save-global-config')?.click(); await w(80);
      const prev1a = document.getElementById('cfg-preview-1a')?.innerText || '';
      const payCfg = JSON.parse(localStorage.getItem('tucu_l2_pay_cfg_estetica') || '{}');
      document.getElementById('btn-open-qr-modal')?.click(); await w(80);
      document.getElementById('btn-wizard-go-qr')?.click(); await w(80);
      const hasInlineSvg = !!document.querySelector('#l2-qr-svg-container svg');
      document.getElementById('btn-close-qr-wizard')?.click();
      return { pausedState, rem24, rem2, prevHasAlias: prev1a.includes('estetica.yerba.mp'), prevHasCbu: prev1a.includes('0000003100099988877766'), payCfg, hasInlineSvg };
    })()`);
    ok(cfgRes.pausedState.flag === 'false' && cfgRes.pausedState.txt === 'En Pausa', 'Switch Recepción Web en sidebar desktop L2 pausa y reactiva por rubro');
    ok(cfgRes.rem24 && cfgRes.rem2 && cfgRes.prevHasAlias && cfgRes.prevHasCbu && cfgRes.payCfg.alias === 'estetica.yerba.mp', 'Alias/CBU y checkboxes 24h/2h sincronizan tucu_l2_pay_cfg_estetica y vista previa 1A');
    ok(cfgRes.hasInlineSvg && cdp.qrExt.length === 0, 'Modal QR Baileys L2 usa SVG inline autónomo con 0 requests externos');
    console.log('\n=== 5. SHOWROOM L2 & TURNERO L2: DISPONIBILIDAD REAL, PAUSA Y EXENCIÓN DE SEÑA ===');
    await cdp.goto('/index.html');
    const srRes = await cdp.evalJs(`(async () => {
      const w = (ms=130) => new Promise(r => setTimeout(r, ms));
      localStorage.setItem('tucu_l2_occupied_slots_estetica', JSON.stringify(['18:00']));
      ShowcaseCore.selectLevel('l2'); ShowcaseCore.selectRubro('estetica'); ShowcaseCore.selectDay(1); await w();
      const btns = [...document.querySelectorAll('#mockup-container button')];
      const slot11 = btns.find(b => b.innerText.includes('11:00')), slot18 = btns.find(b => b.innerText.includes('18:00')), slot1630 = btns.find(b => b.innerText.includes('16:30'));
      btns.find(b => b.innerText.includes('Peeling Sin Seña'))?.click(); await w(80); ShowcaseCore.nextStep(); await w(); ShowcaseCore.nextStep(); await w(); ShowcaseCore.confirmBooking(); await w(150);
      const rec = ShowcaseState.lastBookingRecord, ds = ShowcaseState.systemCalendar.diasReales;
      localStorage.setItem('tucu_l2_vacations_estetica', JSON.stringify([{ from: ds[0].dateStr, to: ds[4].dateStr, reason: 'Test' }]));
      ShowcaseCore.selectStep(1); ShowcaseCore.selectDay(1); await w();
      const vacTxt = document.getElementById('mockup-container')?.innerText || '';
      return { free11: slot11 && !slot11.disabled, blocked18: slot18?.disabled && slot18.innerText.includes('Bloqueado'), blocked1630: slot1630?.disabled && slot1630.innerText.includes('Bloqueado'), noDepBooking: rec?.depositAmount === 0 && rec?.status === 'CONFIRMED', vacShown: vacTxt.includes('vacaciones') };
    })()`);
    ok(srRes.free11 && srRes.blocked18 && srRes.blocked1630 && srRes.vacShown, 'Showroom L2: sin 11:00 hardcodeado, bloquea slot ocupado (18:00), reserva activa (16:30) y vacaciones');
    ok(srRes.noDepBooking, 'Showroom L2: servicio con requireDeposit=false genera reserva CONFIRMED sin seña ($0)');

    await cdp.evalJs(`localStorage.setItem('tucu_l2_vacations_estetica', '[]');`);
    await cdp.goto('/turnero.html?level=l2&rubro=estetica');
    const trRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      const noDepLabel = document.body.innerText.includes('Sin seña previa');
      document.getElementById('btn-step1-next')?.click(); await w();
      document.querySelector('[data-date-iso="' + AdminShell.localTodayStr(1) + '"]')?.click(); await w();
      const slots = [...document.querySelectorAll('[data-time-slot]')].map(b => b.dataset.timeSlot);
      return { noDepLabel, has1630: slots.includes('16:30'), has1800: slots.includes('18:00') };
    })()`);
    ok(trRes.noDepLabel && !trRes.has1630 && !trRes.has1800, 'Turnero L2: muestra "Sin seña previa" y excluye reservados (16:30) y bloqueados (18:00)');
    await cdp.evalJs(`localStorage.setItem('tucu_l2_turnero_active_estetica', 'false');`);
    await cdp.goto('/turnero.html?level=l2&rubro=estetica');
    const pausedTxt = await cdp.evalJs(`document.body.innerText || ''`);
    ok(pausedTxt.includes('Turnero en Pausa Temporal'), 'Turnero L2 respeta estado pausado por rubro');
    await cdp.evalJs(`localStorage.setItem('tucu_l2_turnero_active_estetica', 'true');`);
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >=400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESUMEN [TASK-081 BLOQUE 2]: PASS=${pass} | FAIL=${fail}`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });