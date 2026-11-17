// Archivo: scripts/verify_task084_block5_polish_manuals.js
import fs from 'fs'; import path from 'path'; import http from 'http'; import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';
const PORT_APP = 5185, PORT_CDP = 9246, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const TOUCHED = [
  'public/css/admin_unified.css', 'public/js/admin_shared/admin_shell.js', 'public/js/admin_shared/admin_manual_viewer.js',
  'public/js/admin_shared/admin_manual_data_l1.js', 'public/js/admin_shared/admin_manual_data_l2.js', 'public/js/admin_shared/admin_manual_data_l3.js',
  'public/js/admin_shared/admin_contacts_manager.js', 'public/admin_l1.html', 'public/js/admin_l1/admin_l1_core.js',
  'public/js/admin_l1/admin_l1_config.js', 'public/js/admin_l1/admin_l1_pricing.js', 'public/admin_l2.html',
  'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_crm.js', 'public/js/admin_l2/admin_l2_config.js',
  'public/js/admin_l2/admin_l2_services.js', 'public/js/admin_l2/admin_l2_schedule.js', 'public/js/admin_l2/admin_l2_baileys_modal.js',
  'public/admin_l3.html', 'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js',
  'public/js/admin_l3/view_staff.js', 'public/js/admin_l3/view_resources.js', 'public/js/admin_l3/view_services.js', 'public/js/admin_l3/view_system.js'
];
function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 5 (<=180L, AST, 0 INDIGO/EMOJI, 0 BAILEYS UI, SHA-256) ===');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), eng = path.join(ENGINE, rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L, header OK)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo ni emojis: ${rel}`);
    ok(fs.existsSync(eng) && sha256(src) === sha256(eng), `Paridad SHA-256: ${rel}`);
  }
  const stripJsIds = (s) => s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/onclick="[^"]*"/gi, '');
  const bChk = ['public/admin_l1.html', 'public/admin_l2.html', 'public/admin_l3.html'].every(f => !/baileys/i.test(stripJsIds(fs.readFileSync(f, 'utf8'))));
  const css = fs.readFileSync('public/css/admin_unified.css', 'utf8');
  ok(bChk && css.includes('::-webkit-scrollbar-thumb'), 'HTMLs sin "Baileys" y CSS con scrollbars estilizados');
}
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }); q.on('error', rej); q.end(); });
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
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(100); const st = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (st && st.h.startsWith(BASE) && st.r === 'complete') break; } await wait(300); }
  close() { this.ws.close(); }
}
async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-084'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }
    const tab = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await cdp.goto('/admin_l1.html?rubro=peluqueria');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem("tucured_pin_ok_L1","1"); sessionStorage.setItem("tucured_pin_ok_L2","1"); sessionStorage.setItem("tucured_pin_ok_L3","1");');
    await cdp.goto('/admin_l1.html?rubro=peluqueria');
    console.log('\n=== 2. CONSOLA L1: CERO BAILEYS, CONFIRM MODAL + BAJA LÓGICA & MANUAL INTERACTIVO ===');
    const l1Res = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      adminL1Config.openBaileysModal(); await w(60);
      const qrTxt = document.getElementById('baileysModal')?.innerText || ''; adminL1Config.closeBaileysModal();
      adminL1Core.switchView('catalogo'); await w();
      const firstId = adminL1Pricing.getServices(false)[0].id;
      adminL1Pricing.deleteService(firstId); await w(60);
      const modalOn = !!document.getElementById('admin-confirm-modal');
      document.getElementById('admin-confirm-cancel')?.click(); await w(60);
      const keptAfterCancel = adminL1Pricing.getServices(false).some(s => s.id === firstId);
      adminL1Pricing.deleteService(firstId); await w(60);
      document.getElementById('admin-confirm-ok')?.click(); await w(80);
      const delItem = adminL1Pricing.getServices(true).find(s => s.id === firstId);
      document.getElementById('main-view-btn-manual')?.click(); await w();
      const inp = document.getElementById('manual-search-input-l1'); inp.value = 'sena'; inp.dispatchEvent(new Event('input')); await w(60);
      const marks = document.querySelectorAll('#manual-content-l1 mark').length, steps = document.querySelectorAll('#manual-content-l1 article').length;
      return { qrClean: qrTxt.includes('WhatsApp') && !/baileys/i.test(qrTxt), modalOn, keptAfterCancel, logicalDel: Boolean(delItem?.deletedAt) && delItem.isActive === false, marks, steps };
    })()`);
    ok(l1Res.qrClean, 'L1 sin menciones de "Baileys" en UI ni modal QR WhatsApp');
    ok(l1Res.modalOn && l1Res.keptAfterCancel && l1Res.logicalDel, 'L1 modal confirmación Aura Light + baja lógica en servicios');
    ok(l1Res.marks > 0 && l1Res.steps > 0, `L1 Manual de Uso busca sin tilde ("sena" -> ${l1Res.marks} <mark>, ${l1Res.steps} secciones)`);
    console.log('\n=== 3. CONSOLA L2: CONTACTOS EN CRM, CERO BAILEYS, BAJA LÓGICA SLOTS & MANUAL ===');
    await cdp.goto('/admin_l2.html?rubro=estetica');
    const l2Res = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      const noCfgContact = !document.getElementById('tab-btn-l2') && !document.getElementById('config-content-l2');
      const inCrm = !!document.getElementById('view-section-crm')?.contains(document.getElementById('l2-contacts-mount'));
      adminL2Core.switchMainView('crm'); await w();
      const scrollOk = document.getElementById('contacts-list-l2')?.className.includes('custom-scrollbar');
      adminL2Core.switchMainView('config'); adminL2Config.switchConfigTab('wa'); await w();
      const waTxt = document.getElementById('config-content-wa')?.innerText || '';
      document.getElementById('btn-open-qr-modal')?.click(); await w(60);
      const qrTxt = document.getElementById('wa-qr-wizard-modal')?.innerText || '';
      document.getElementById('btn-close-qr-wizard')?.click();
      adminL2Config.switchConfigTab('agenda'); await w();
      adminL2Config.removeOccupiedSlot(0); await w(60);
      const slotModal = !!document.getElementById('admin-confirm-modal');
      document.getElementById('admin-confirm-ok')?.click(); await w(80);
      const occHist = JSON.parse(localStorage.getItem('tucu_l2_occupied_slots_history_estetica') || '[]');
      document.getElementById('main-view-btn-manual')?.click(); await w();
      const inp = document.getElementById('manual-search-input-l2'); inp.value = 'feriados'; inp.dispatchEvent(new Event('input')); await w(60);
      return { noCfgContact, inCrm, scrollOk, waClean: /whatsapp/i.test(waTxt) && /whatsapp/i.test(qrTxt) && !/baileys/i.test(waTxt + qrTxt), slotModal, occLog: occHist.length > 0 && !!occHist[0].deletedAt, marks: document.querySelectorAll('#manual-content-l2 mark').length };
    })()`);
    ok(l2Res.noCfgContact && l2Res.inCrm && l2Res.scrollOk, 'L2 Contactos integrado en CRM & Clientes con .custom-scrollbar y ausente de Configuración');
    ok(l2Res.waClean && l2Res.slotModal && l2Res.occLog, `L2 sin "Baileys" en UI + baja lógica confirmada de Slots Bloqueados en histórico (${JSON.stringify(l2Res)})`);
    ok(l2Res.marks > 0, `L2 Manual de Uso filtra "feriados" y resalta ${l2Res.marks} <mark>`);
    console.log('\n=== 4. CONSOLA L3: SIDEBAR SIN RUBROS, FECHA EN AGENDA, BAJA LÓGICA & MANUAL ===');
    await cdp.goto('/admin_l3.html?rubro=salud_consultorio');
    const l3Res = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      const noRubros = document.querySelectorAll('.rubro-tab').length === 0;
      const brand = document.getElementById('l3-brand-title')?.innerText || '';
      const dpInFooter = !!document.querySelector('.admin-sidebar-footer #admin-date-picker');
      const dpInAgenda = !!document.querySelector('#admin-view-root #admin-date-picker');
      AdminL3Core.switchTab('staff'); await w();
      const stId = AdminL3Core.state.staff[0].id;
      AdminL3Staff.deleteStaff(stId); await w(60);
      const stModal = !!document.getElementById('admin-confirm-modal');
      document.getElementById('admin-confirm-cancel')?.click(); await w(60);
      const keptSt = AdminL3Core.state.staff.find(s => s.id === stId && !s.deletedAt);
      AdminL3Core.switchTab('system'); await w();
      const sysTxt = document.getElementById('admin-view-root')?.innerText || '';
      AdminL3System.openBaileysModal(); await w(60);
      const qrTxt = document.getElementById('l3-qr-modal')?.innerText || ''; AdminL3System.closeBaileysModal();
      document.querySelector('[data-tab="manual"]')?.click(); await w();
      const inp = document.getElementById('manual-search-input-l3'); inp.value = 'sena'; inp.dispatchEvent(new Event('input')); await w(60);
      return { noRubros, inherited: brand.includes('Consultorios') && AdminL3Core.state.rubro === 'salud_consultorio', dpMoved: !dpInFooter && dpInAgenda, stModal, keptSt: !!keptSt, noBaileys: !/baileys/i.test(sysTxt) && !/baileys/i.test(qrTxt), marks: document.querySelectorAll('#manual-content-l3 mark').length };
    })()`);
    ok(l3Res.noRubros && l3Res.inherited, 'L3 sidebar sin selector .rubro-tab y hereda rubro desde URL (?rubro=salud_consultorio)');
    ok(l3Res.dpMoved, 'L3 #admin-date-picker retirado arriba de Cron T-2hs y reubicado dentro de Agenda');
    ok(l3Res.stModal && l3Res.keptSt && l3Res.noBaileys, 'L3 modal confirmación funcional y 0 menciones de "Baileys" en Configuración/QR');
    ok(l3Res.marks > 0, `L3 Manual de Uso operativo con búsqueda sin tildes (${l3Res.marks} <mark>)`);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }); await wait(100);
    ok((await cdp.evalJs('document.documentElement.scrollWidth')) <= 375, 'Mobile 375px sin desborde horizontal en Manual L3');
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >=400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESUMEN [TASK-084 BLOQUE 5]: PASS=${pass} | FAIL=${fail}`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
