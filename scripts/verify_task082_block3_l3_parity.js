// Archivo: scripts/verify_task082_block3_l3_parity.js
import fs from 'fs'; import path from 'path'; import http from 'http'; import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';
const PORT_APP = 5183, PORT_CDP = 9244, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const TOUCHED = [
  'public/admin_l3.html', 'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_services.js',
  'public/js/admin_l3/view_staff.js', 'public/js/admin_l3/view_agenda.js', 'public/js/admin_l3/view_system.js',
  'public/js/admin_shared/turnero_catalog.js', 'public/js/admin_shared/turnero_app.js', 'js/showcase_v11/showcase_templates_l3.js'
];
const ORPHANS = ['public/js/admin_l3/view_staff_services.js', 'public/js/admin_l1/admin_l1_baileys.js', 'public/js/admin_l1/delivery_l1.js'];
const TRASH = ['.nexus_trash/admin_l3/view_staff_services.js', '.nexus_trash/admin_l1/admin_l1_baileys.js', '.nexus_trash/admin_l1/delivery_l1.js'];
function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 3 (<=180L, AST, HUÉRFANOS, SHA-256) ===');
  for (let i = 0; i < ORPHANS.length; i++) {
    ok(!fs.existsSync(ORPHANS[i]) && !fs.existsSync(path.join(ENGINE, ORPHANS[i])) && fs.existsSync(TRASH[i]), `Huérfano archivado: ${ORPHANS[i]}`);
  }
  ok(!/qrserver\.com/i.test(fs.readFileSync('public/js/admin_l3/view_system.js', 'utf8')), 'view_system.js sin qrserver.com');
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
  const userDataDir = path.resolve('.tmp-cdp-082'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }
    const tab = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await cdp.goto('/admin_l3.html?rubro=barberia');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem("tucured_pin_ok_L3","1");');
    await cdp.goto('/admin_l3.html?rubro=barberia');
    console.log('\n=== 2. TAREA 3.1 & 3.3: SERVICIOS L3 (SIN SEÑA, ORDEN, DESC) + AGENDA/SOBRETURNO ===');
    const srvAgRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      AdminL3Core.switchTab('services'); await w();
      AdminL3Services.openEditModal(); await w();
      document.getElementById('sv-name').value = 'Lavado Sin Seña';
      document.getElementById('sv-order').value = '1';
      document.getElementById('sv-desc').value = 'Lavado express sin seña';
      document.getElementById('sv-price').value = '7500';
      document.getElementById('sv-require-deposit').checked = false;
      AdminL3Services.saveService(''); await w();
      const srv = AdminL3Core.state.services.find(s => s.name === 'Lavado Sin Seña');
      const tblTxt = document.getElementById('admin-view-root')?.innerText || '';
      AdminL3Core.switchTab('agenda'); await w();
      document.querySelector('[data-l3tfilter="semana"]')?.click(); await w(80);
      const tFilterAct = document.querySelector('[data-l3tfilter="semana"]')?.classList.contains('is-active');
      AdminL3Agenda.openSobreturnoModal(); await w();
      const sel = document.getElementById('mbk-srv'), paid = document.getElementById('mbk-paid'), meth = document.getElementById('mbk-method');
      sel.value = srv.id; AdminL3Agenda.onMbkSrvChange(); await w(60);
      const freeHid = !paid.checked && meth.classList.contains('hidden');
      const paidOpt = [...sel.options].find(o => o.value !== srv.id);
      sel.value = paidOpt.value; AdminL3Agenda.onMbkSrvChange(); await w(60);
      const reqVis = paid.checked && !meth.classList.contains('hidden');
      paid.checked = false; AdminL3Agenda.onMbkPaidChange();
      const unchkHid = meth.classList.contains('hidden');
      document.getElementById('admin-modal-root').classList.add('hidden');
      return { okSrv: !!srv && srv.order === 1 && !srv.requireDeposit, uiSrv: tblTxt.includes('Sin seña') && tblTxt.includes('Lavado express sin seña'), tFilterAct, freeHid, reqVis, unchkHid };
    })()`);
    ok(srvAgRes.okSrv && srvAgRes.uiSrv, 'Servicio L3 con requireDeposit=false muestra badge "Sin seña", orden y descripción');
    ok(srvAgRes.tFilterAct && srvAgRes.freeHid && srvAgRes.reqVis && srvAgRes.unchkHid, 'Agenda L3 filtros temporales + Sobreturno oculta/muestra #mbk-method dinámicamente');
    console.log('\n=== 3. TAREA 3.2: STAFF L3 CON HORARIO PARTIDO + CLONAR LUN A VIE ===');
    const stRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      AdminL3Core.switchTab('staff'); await w(); AdminL3Staff.openEditModal(); await w();
      document.getElementById('sf-name').value = 'Dr. Lucas Split'; document.getElementById('sf-role').value = 'Colorista Pro';
      document.getElementById('dh-start-1').value = '09:00'; document.getElementById('dh-end-1').value = '12:00';
      document.getElementById('dh-split-1').checked = true; AdminL3Staff.toggleDaySplit('1', true);
      document.getElementById('dh-open2-1').value = '17:00'; document.getElementById('dh-close2-1').value = '20:00';
      document.getElementById('btn-l3-clone-lun-vie')?.click(); await w(60);
      const tuesOk = document.getElementById('dh-split-2').checked && document.getElementById('dh-end-2').value === '12:00' && document.getElementById('dh-open2-2').value === '17:00';
      AdminL3Staff.saveStaff(''); await w();
      const cardsTxt = document.getElementById('admin-view-root')?.innerText || '';
      return { tuesOk, hasCard: cardsTxt.includes('Dr. Lucas Split') && cardsTxt.includes('Turno partido') };
    })()`);
    ok(stRes.tuesOk && stRes.hasCard, 'Staff L3 soporta turno partido (open2/close2), "Clonar Lun a Vie" y persistencia');
    console.log('\n=== 4. TAREA 3.3 & 3.4: 6 RUBROS, RECEPCIÓN WEB, ALIAS/CBU, RECORDATORIOS & QR INLINE ===');
    const sysRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      const rTabs = Object.keys(AdminL3Core.state.presets || {});
      AdminL3Core.switchRubro('gastronomia'); await w(80); const gastroTitle = document.getElementById('l3-brand-title')?.innerText;
      AdminL3Core.switchRubro('servicios'); await w(80); const srvTitle = document.getElementById('l3-brand-title')?.innerText;
      AdminL3Core.switchRubro('peluqueria_estetica'); await w(80);
      AdminL3Core.toggleTurneroActive(); await w(60);
      const pausedSt = { flag: localStorage.getItem('tucu_l3_turnero_active_peluqueria_estetica'), txt: document.getElementById('turneroStatusTextL3')?.innerText };
      AdminL3Core.toggleTurneroActive(); await w(60);
      AdminL3Core.switchTab('system'); await w();
      document.getElementById('l3-input-alias').value = 'aura.l3.mp'; document.getElementById('l3-input-cbu').value = '0000003100088877766655';
      const remOk = !!document.getElementById('l3-rem-24h') && !!document.getElementById('l3-rem-2h');
      AdminL3System.saveConfig(); await w(80);
      const prev1a = document.getElementById('cfg-preview-1a')?.innerText || '', tom = AdminShell.localTodayStr(1), holD = AdminShell.localTodayStr(2);
      document.getElementById('sb-date').value = tom; document.getElementById('sb-start').value = '10:30'; document.getElementById('sb-end').value = '12:00'; AdminL3System.addServiceBlock(); await w(80);
      document.getElementById('new-hol-date').value = holD; document.getElementById('new-hol-desc').value = 'Feriado L3'; AdminL3System.addCustomHoliday(); await w(80);
      document.getElementById('btn-l3-open-qr')?.click(); await w(80);
      const hasSvg = !!document.querySelector('#l3-qr-svg-container svg'); document.getElementById('btn-l3-close-qr')?.click();
      return { count6: rTabs.length === 6 && rTabs.includes('gastronomia') && rTabs.includes('servicios'), gastroTitle, srvTitle, pausedSt, remOk, prevOk: prev1a.includes('aura.l3.mp') && prev1a.includes('0000003100088877766655'), hasSvg, tom, holD };
    })()`);
    ok(sysRes.count6 && sysRes.gastroTitle.includes('Encuentro') && sysRes.srvTitle.includes('Estudio'), 'Admin L3 con 6 rubros operativos (incluyendo Gastronomía y Servicios)');
    ok(sysRes.pausedSt.flag === 'false' && sysRes.pausedSt.txt === 'En Pausa', 'Switch Recepción Web L3 en sidebar desktop pausa y reactiva por rubro');
    ok(sysRes.remOk && sysRes.prevOk && sysRes.hasSvg && cdp.qrExt.length === 0, 'Alias/CBU L3, recordatorios 24h/2h y modal QR SVG inline autónomo (0 requests externos)');
    console.log('\n=== 5. SHOWROOM L3 & TURNERO L3: STAFF DINÁMICO, HORARIO PARTIDO, BLOQUEO Y FERIADO ===');
    await cdp.goto('/index.html');
    const srRes = await cdp.evalJs(`(async () => {
      const w = (ms=130) => new Promise(r => setTimeout(r, ms));
      ShowcaseCore.selectLevel('l3'); ShowcaseCore.selectRubro('barberia'); ShowcaseCore.selectDay(1); await w();
      const staffBtn = [...document.querySelectorAll('#mockup-container button')].find(b => b.innerText.includes('Dr. Lucas Split')); staffBtn?.click(); await w(100);
      const b2 = [...document.querySelectorAll('#mockup-container button')], s1630 = b2.find(b => b.innerText.includes('16:30')), s1700 = b2.find(b => b.innerText.includes('17:00'));
      ShowcaseCore.selectRubro('estetica'); ShowcaseCore.selectDay(1); await w(100);
      const est11 = [...document.querySelectorAll('#mockup-container button')].find(b => b.innerText.includes('11:00'));
      ShowcaseCore.selectDay(2); await w(100);
      const holTxt = document.getElementById('mockup-container')?.innerText || '';
      return { dynStaff: !!staffBtn, splitGapBlocked: !!s1630?.disabled && s1630.innerText.includes('Bloqueado'), splitOpenFree: !!s1700 && !s1700.disabled, estBlk11: !!est11?.disabled, holShown: holTxt.includes('feriado') };
    })()`);
    ok(srRes.dynStaff && srRes.splitGapBlocked && srRes.splitOpenFree, 'Showroom L3 sincroniza staff dinámico (Dr. Lucas Split) y respeta su turno partido');
    ok(srRes.estBlk11 && srRes.holShown, 'Showroom L3 respeta bloqueo horario (11:00) y feriado cerrado');
    await cdp.goto('/turnero.html?level=l3&rubro=estetica');
    const trRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      document.getElementById('btn-step1-next')?.click(); await w();
      document.querySelector('[data-date-iso="${sysRes.tom}"]')?.click(); await w();
      const sTom = [...document.querySelectorAll('[data-time-slot]')].map(b => b.dataset.timeSlot);
      document.querySelector('[data-date-iso="${sysRes.holD}"]')?.click(); await w();
      const sHol = [...document.querySelectorAll('[data-time-slot]')].map(b => b.dataset.timeSlot);
      return { blk11: !sTom.includes('11:00'), holEmpty: sHol.length === 0 };
    })()`);
    ok(trRes.blk11 && trRes.holEmpty, 'Turnero L3 excluye rango bloqueado (11:00) y día feriado cerrado');
    await cdp.evalJs(`localStorage.setItem('tucu_l3_turnero_active_peluqueria_estetica', 'false');`);
    await cdp.goto('/turnero.html?level=l3&rubro=estetica');
    ok((await cdp.evalJs(`document.body.innerText || ''`)).includes('Turnero en Pausa Temporal'), 'Turnero L3 respeta estado pausado por rubro');
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >=400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESUMEN [TASK-082 BLOQUE 3]: PASS=${pass} | FAIL=${fail}`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });