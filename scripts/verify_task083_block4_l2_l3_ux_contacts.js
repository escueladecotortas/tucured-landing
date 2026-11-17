// Archivo: scripts/verify_task083_block4_l2_l3_ux_contacts.js
import fs from 'fs'; import path from 'path'; import http from 'http'; import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';
const PORT_APP = 5184, PORT_CDP = 9245, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const TOUCHED = [
  'public/js/admin_shared/admin_holidays.js', 'public/js/admin_shared/admin_contacts_parser.js', 'public/js/admin_shared/admin_contacts_manager.js',
  'public/admin_l2.html', 'public/js/admin_l2/admin_l2_config.js', 'public/js/admin_l2/admin_l2_schedule.js',
  'public/admin_l3.html', 'public/js/admin_l3/view_system.js', 'public/js/admin_l3/view_clients.js',
  'public/js/admin_shared/turnero_app.js', 'js/showcase_v11/showcase_templates_l2.js', 'js/showcase_v11/showcase_templates_l3.js'
];
function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 4 (<=180L, AST, SIN INTERVAL, SHA-256) ===');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L, header OK)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    if (rel.startsWith('public/')) ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo ni emojis: ${rel}`);
    ok(fs.existsSync(eng) && sha256(src) === sha256(eng), `Paridad SHA-256: ${rel}`);
  }
  const l2Html = fs.readFileSync('public/admin_l2.html', 'utf8'), sysL3 = fs.readFileSync('public/js/admin_l3/view_system.js', 'utf8');
  ok(!/cfg-interval/.test(l2Html) && !/cfg-interval/.test(fs.readFileSync('public/js/admin_l2/admin_l2_config.js', 'utf8')) && !/cfg-interval/.test(sysL3), 'TAREA 4.1: Eliminado #cfg-interval de L2 y L3');
  ok(l2Html.indexOf('id="config-content-agenda"') < l2Html.indexOf('id="l2-occupied-slots-panel"') && l2Html.indexOf('id="l2-occupied-slots-panel"') < l2Html.indexOf('id="config-content-wa"'), 'TAREA 4.2: #l2-occupied-slots-panel reubicado dentro de #config-content-agenda');
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
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(100); const st = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (st && st.h.startsWith(BASE) && st.r === 'complete') break; } await wait(320); }
  close() { this.ws.close(); }
}
const mockPickerExpr = `Object.defineProperty(navigator, 'contacts', { configurable: true, value: { select: async () => [{ name: ['Contacto Celular'], tel: ['155112233'] }] } })`;
async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-083'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }
    const tab = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await cdp.goto('/admin_l2.html');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem("tucured_pin_ok_L2","1"); sessionStorage.setItem("tucured_pin_ok_L3","1");');
    await cdp.goto('/admin_l2.html');
    console.log('\n=== 2. TAREA 4.1 & 4.2 L2: IDENTIDAD LIMPIA, SLOTS EN HORARIOS & FERIADOS 2026 POR MES ===');
    const l2Setup = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      adminL2Core.switchMainView('config'); adminL2Config.switchConfigTab('identidad'); await w();
      const noInt = !document.getElementById('cfg-interval') && !document.getElementById('cfg-interval-custom');
      const idOk = !!document.getElementById('cfg-biz-name') && !!document.getElementById('cfg-biz-address') && !!document.getElementById('cfg-max-days');
      adminL2Config.switchConfigTab('agenda'); await w();
      const occEl = document.getElementById('l2-occupied-slots-panel'), agEl = document.getElementById('config-content-agenda');
      const occInside = !!occEl && !!agEl && agEl.contains(occEl) && !agEl.classList.contains('hidden');
      document.getElementById('new-occupied-time').value = '15:00'; document.getElementById('btn-add-occupied-slot')?.click(); await w(80);
      const months = document.querySelectorAll('#holidays-container [data-holiday-month]').length;
      const novTxt = document.querySelector('#holidays-container [data-holiday-toggle="2026-11-23"]')?.innerText?.trim();
      const decTxt = document.querySelector('#holidays-container [data-holiday-toggle="2026-12-08"]')?.innerText?.trim();
      return { noInt, idOk, occInside, has1500: (localStorage.getItem('tucu_l2_occupied_slots_estetica') || '').includes('15:00'), months, novTxt, decTxt };
    })()`);
    ok(l2Setup.noInt && l2Setup.idOk, 'L2 Identidad sin #cfg-interval y conservando comercio/dirección/días');
    ok(l2Setup.occInside && l2Setup.has1500, 'L2 Slots Bloqueados dentro de Horarios agrega 15:00');
    ok(l2Setup.months >= 10 && l2Setup.novTxt === 'Bloqueado' && l2Setup.decTxt === 'Bloqueado', `L2 Feriados 2026 agrupados por mes (${l2Setup.months} meses, 2026-11-23 Bloqueado)`);
    await cdp.goto('/index.html');
    const srL2Closed = await cdp.evalJs(`(async () => {
      const w = (ms=110) => new Promise(r => setTimeout(r, ms));
      ShowcaseCore.selectLevel('l2'); ShowcaseCore.selectRubro('estetica'); await w();
      for (let i = 0; i < 4 && ![...document.querySelectorAll('#mockup-container button')].some(b => b.innerText.includes('23')); i++) {
        [...document.querySelectorAll('#mockup-container button')].find(b => b.innerText.trim() === '›')?.click(); await w(80);
      }
      [...document.querySelectorAll('#mockup-container button')].find(b => b.innerText.includes('23'))?.click(); await w();
      return document.getElementById('mockup-container')?.innerText || '';
    })()`);
    ok(srL2Closed.toLowerCase().includes('feriado nacional'), 'Showroom L2 respeta feriado nacional 2026-11-23 cerrado por defecto');
    await cdp.goto('/turnero.html?level=l2&rubro=estetica');
    const trL2Closed = await cdp.evalJs(`(async () => { const w=(ms=90)=>new Promise(r=>setTimeout(r,ms)); document.getElementById('btn-step1-next')?.click(); await w(); document.querySelector('[data-date-iso="2026-11-23"]')?.click(); await w(); return document.querySelectorAll('[data-time-slot]').length; })()`);
    ok(trL2Closed === 0, 'Turnero L2 bloquea turnos para 2026-11-23 cuando feriado está Bloqueado');
    await cdp.goto('/admin_l2.html');
    const l2OpenRes = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      adminL2Core.switchMainView('config'); adminL2Config.switchConfigTab('agenda'); await w();
      document.querySelector('#holidays-container [data-holiday-toggle="2026-11-23"]')?.click(); await w(80);
      return {
        nov: document.querySelector('#holidays-container [data-holiday-toggle="2026-11-23"]')?.innerText?.trim(),
        dec: document.querySelector('#holidays-container [data-holiday-toggle="2026-12-08"]')?.innerText?.trim()
      };
    })()`);
    ok(l2OpenRes.nov === 'Abierto' && l2OpenRes.dec === 'Bloqueado', 'L2 toggle individual abre 2026-11-23 sin desbloquear 2026-12-08');
    await cdp.goto('/turnero.html?level=l2&rubro=estetica');
    const trL2Open = await cdp.evalJs(`(async () => { const w=(ms=90)=>new Promise(r=>setTimeout(r,ms)); document.getElementById('btn-step1-next')?.click(); await w(); document.querySelector('[data-date-iso="2026-11-23"]')?.click(); await w(); const sl=[...document.querySelectorAll('[data-time-slot]')].map(b=>b.dataset.timeSlot); return { cnt: sl.length, no1500: !sl.includes('15:00') }; })()`);
    ok(trL2Open.cnt > 0 && trL2Open.no1500, `Turnero L2 abre 2026-11-23 (${trL2Open.cnt} slots) y mantiene bloqueado 15:00`);
    console.log('\n=== 3. TAREA 4.3 L2: PESTAÑA CONTACTOS (MANUAL, DEDUP VCF, PICKER CELULAR, SEARCH & SOFT DELETE) ===');
    await cdp.goto('/admin_l2.html');
    const l2Ct = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      const noCfgTab = !document.getElementById('tab-btn-l2');
      adminL2Core.switchMainView('crm'); await w();
      document.getElementById('btn-contacts-new-l2')?.click();
      document.getElementById('ct-name-l2').value = 'Lucía Manual'; document.getElementById('ct-phone-l2').value = '3815557788';
      document.getElementById('ct-email-l2').value = 'lucia@tucured.ar'; document.getElementById('ct-notes-l2').value = 'Cliente VIP';
      document.getElementById('btn-ct-save-l2')?.click(); await w(80);
      document.querySelector('[data-ct-edit="+5493815557788"]')?.click();
      document.getElementById('ct-name-l2').value = 'Lucía Editada'; document.getElementById('btn-ct-save-l2')?.click(); await w(80);
      const dt = new DataTransfer();
      dt.items.add(new File(['BEGIN:VCARD\\nFN:Dup Lucia\\nTEL:381-555-7788\\nEND:VCARD\\nBEGIN:VCARD\\nFN:Marta VCF\\nTEL:0381 154 223344\\nEND:VCARD'], 'agenda.vcf', { type: 'text/vcard' }));
      const inp = document.getElementById('inp-contacts-file-l2'); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true })); await w(150);
      ${mockPickerExpr}; await AdminContactsManager.importFromDevice('l2'); await w(80);
      const srch = document.getElementById('contacts-search-l2'); srch.value = 'Celular'; srch.dispatchEvent(new Event('input')); await w(50);
      const searchHit = (document.getElementById('contacts-list-l2')?.innerText || '').includes('Contacto Celular');
      srch.value = ''; srch.dispatchEvent(new Event('input')); await w(50);
      document.querySelector('[data-ct-del="+5493815112233"]')?.click(); await w(60);
      document.getElementById('admin-confirm-ok')?.click(); await w(100);
      const stored = JSON.parse(localStorage.getItem('tucu_l2_contacts_estetica') || '[]');
      return { tabLabel: noCfgTab ? 'Contactos' : 'Config', searchHit, hasLucia: stored.some(c => c.phone === '+5493815557788' && c.name === 'Lucía Editada'), hasMarta: stored.some(c => c.phone === '+5493814223344'), softDel: stored.find(c => c.phone === '+5493815112233')?.deletedAt != null, dupCheck: stored.filter(c => c.phone === '+5493815557788').length === 1 };
    })()`);
    ok(l2Ct.tabLabel === 'Contactos' && l2Ct.hasLucia && l2Ct.dupCheck, 'L2 Contactos manual ABM, normalización +549381 y deduplicación VCF sin duplicados');
    ok(l2Ct.hasMarta && l2Ct.searchHit && l2Ct.softDel, 'L2 Contactos VCF/CSV + Picker Celular + búsqueda + soft delete');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }); await wait(120);
    const mobSw = await cdp.evalJs('document.documentElement.scrollWidth');
    ok(mobSw <= 375, `Mobile 375px sin desborde horizontal en Contactos L2 (${mobSw}px <= 375px)`);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    console.log('\n=== 4. TAREA 4.1, 4.2 & 4.3 L3: SIN INTERVAL, FERIADOS POR MES & CONTACTOS CRM ===');
    await cdp.goto('/admin_l3.html?rubro=barberia');
    const l3Res = await cdp.evalJs(`(async () => {
      const w = (ms=100) => new Promise(r => setTimeout(r, ms));
      AdminL3Core.switchTab('system'); await w();
      const noInt = !document.getElementById('cfg-interval');
      const unified = (document.getElementById('l3-holidays-label')?.innerText || '').includes('Horarios') && !!document.getElementById('sb-srv') && !!document.getElementById('l3-holidays-monthly-container');
      const months = document.querySelectorAll('#l3-holidays-monthly-container [data-holiday-month]').length;
      document.querySelector('#l3-holidays-monthly-container [data-holiday-toggle="2026-11-23"]')?.click(); await w(80);
      const novOpen = document.querySelector('#l3-holidays-monthly-container [data-holiday-toggle="2026-11-23"]')?.innerText?.trim() === 'Abierto';
      AdminL3Core.switchTab('clients'); await w();
      document.getElementById('btn-contacts-new-l3')?.click();
      document.getElementById('ct-name-l3').value = 'Marcos L3'; document.getElementById('ct-phone-l3').value = '3816009900';
      document.getElementById('btn-ct-save-l3')?.click(); await w(80);
      ${mockPickerExpr}; await AdminContactsManager.importFromDevice('l3'); await w(80);
      const stored = JSON.parse(localStorage.getItem('tucu_l3_contacts_barberia') || '[]');
      return { noInt, unified, months, novOpen, hasMarcos: stored.some(c => c.phone === '+5493816009900'), hasCel: stored.some(c => c.phone === '+5493815112233') };
    })()`);
    ok(l3Res.noInt && l3Res.unified && l3Res.months >= 10 && l3Res.novOpen, `L3 Configuración sin #cfg-interval, tarjeta unificada Horarios/Bloqueos/Feriados (${l3Res.months} meses) y toggle 2026-11-23`);
    ok(l3Res.hasMarcos && l3Res.hasCel, 'L3 Contactos & CRM monta ABM manual E.164 y Contact Picker del celular');
    await cdp.goto('/turnero.html?level=l3&rubro=barberia');
    const trL3Open = await cdp.evalJs(`(async () => { const w=(ms=90)=>new Promise(r=>setTimeout(r,ms)); document.getElementById('btn-step1-next')?.click(); await w(); document.querySelector('[data-date-iso="2026-11-23"]')?.click(); await w(); return document.querySelectorAll('[data-time-slot]').length; })()`);
    ok(trL3Open > 0, `Turnero L3 habilita 2026-11-23 al marcarse Abierto en Admin L3 (${trL3Open} slots)`);
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >=400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESUMEN [TASK-083 BLOQUE 4]: PASS=${pass} | FAIL=${fail}`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
