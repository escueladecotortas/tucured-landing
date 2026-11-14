// Archivo: scripts/verify_task071_curing_holidays_sync.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn, spawnSync } from 'child_process';

const BASE_URL = 'http://localhost:5174';
const ENGINE_ROOT = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9233;
let passed = 0, failed = 0;
const assert = (c, m) => c ? (console.log(`  [PASS] ${m}`), passed++) : (console.error(`  [FAIL] ${m}`), failed++);

const SYNC_FILES = [
  'public/css/admin_unified.css', 'public/admin_l1.html', 'public/admin_l2.html', 'public/admin_l3.html',
  'public/js/admin_shared/admin_holidays.js', 'public/js/admin_shared/admin_shell.js', 'public/js/admin_shared/admin_booking_engine.js',
  'public/js/admin_l1/admin_l1_pricing.js', 'public/js/admin_l1/admin_l1_agenda.js', 'public/js/admin_l1/admin_l1_config.js',
  'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_calendar.js', 'public/js/admin_l2/admin_l2_schedule.js', 'public/js/admin_l2/admin_l2_config.js', 'public/js/admin_l2/admin_l2_crm.js',
  'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js', 'public/js/admin_l3/view_services.js',
  'public/js/admin_l3/view_staff.js', 'public/js/admin_l3/view_resources.js', 'public/js/admin_l3/view_system.js'
];
const SC_FILES = ['js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_templates_l3.js', 'js/showcase_v11/showcase_mockup.js', 'js/showcase_v11/showcase_core.js'];

function runStaticAudit() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA + AST + PARIDAD EXACTA BLUEPRINT ===');
  const emojiRx = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
  for (const rel of SYNC_FILES) {
    const src = path.resolve(rel), eng = path.join(ENGINE_ROOT, rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    assert(lines.length <= 180, `${rel} <= 180L (${lines.length}L)`);
    assert(lines[0].includes('Archivo:'), `${rel} encabezado PEAC`);
    assert(!/\bindigo\b/i.test(txt), `${rel} 0 clases indigo`);
    const ui = lines.filter(l => !['//', '/*', '*'].some(p => l.trim().startsWith(p)) && !l.includes('defaultTpl')).join('\n');
    assert(!emojiRx.test(ui), `${rel} 0 emojis UI`);
    assert(fs.existsSync(eng) && fs.readFileSync(eng, 'utf8') === txt, `Paridad byte-exacta: ${rel}`);
    if (rel.endsWith('.js')) assert(spawnSync('node', ['--check', src]).status === 0 && spawnSync('node', ['--check', eng]).status === 0, `AST OK: ${rel}`);
  }
  for (const rel of SC_FILES) {
    const src = path.resolve(rel), eng = path.join(ENGINE_ROOT, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8');
    assert(txt.split(/\r?\n/).length <= 180 && fs.existsSync(eng) && fs.readFileSync(eng, 'utf8') === txt, `Showcase <=180L & paridad: ${rel}`);
  }
  const pricingSrc = fs.readFileSync(path.resolve('public/js/admin_l1/admin_l1_pricing.js'), 'utf8');
  assert(!/\bprompt\s*\(/.test(pricingSrc), 'L1 Pricing erradicó window.prompt()');
  const engSrc = fs.readFileSync(path.resolve('public/js/admin_shared/admin_booking_engine.js'), 'utf8');
  assert(!engSrc.includes('Base de práctica local-first'), 'BookingEngine eliminó texto "Base de práctica local-first"');
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

async function openTab(q, w = 1280, h = 800) {
  const t = await reqJson(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(BASE_URL + q)}`, 'PUT');
  const cdp = new Cdp(t.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
  for (let i = 0; i < 40; i++) { if ((await cdp.evalJs('document.readyState').catch(() => '')) === 'complete') break; await new Promise(r => setTimeout(r, 150)); }
  await new Promise(r => setTimeout(r, 550)); return cdp;
}

async function runCdpAudit() {
  console.log('\n=== 2. AUDITORÍA CHROME HEADLESS CDP E2E (TASK-071) ===');
  const tmpDir = path.resolve('.tmp-cdp-t071'); fs.mkdirSync(tmpDir, { recursive: true });
  const chrome = spawn(CHROME_PATH, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, '--disable-gpu', '--no-sandbox', `--user-data-dir=${tmpDir}`, 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${CDP_PORT}/json/version`); break; } catch { await new Promise(r => setTimeout(r, 250)); } }

    // A. L1 Desktop: Undo explicito, modal unificado + duracion libre + historial + soft-delete, citas futuras, feriados y WA pill
    const l1 = await openTab('/admin_l1.html?slug=demo-peluqueria', 1280, 800);
    await l1.evalJs('localStorage.clear(); location.reload();').catch(() => null);
    await new Promise(r => setTimeout(r, 700));
    const rL1 = await l1.evalJs(`(async () => {
      const wait = (ms = 180) => new Promise(r => setTimeout(r, ms));
      const card = [...document.querySelectorAll('#bookingsListContainer article')][0];
      card?.querySelector('button')?.click(); await wait();
      document.getElementById('pm-confirm')?.click(); await wait();
      const card2 = [...document.querySelectorAll('#bookingsListContainer article')].find(a => a.innerText.includes('Marcar Finalizado'));
      [...card2.querySelectorAll('button')].find(b => b.innerText.includes('Marcar Finalizado'))?.click(); await wait();
      const bodyFin = document.body.innerText;
      const undoExpl = bodyFin.includes('Anterior: Confirmado') && bodyFin.includes('A Confirmado');
      document.getElementById('main-view-btn-catalogo')?.click(); await wait();
      [...document.querySelectorAll('button')].find(b => b.innerText.includes('Nuevo Servicio'))?.click(); await wait();
      const modTitle = document.getElementById('service-modal-title')?.innerText || '';
      document.getElementById('edit-srv-name').value = 'Alisado Custom 50m';
      document.getElementById('edit-srv-price').value = '15000';
      const durSel = document.getElementById('edit-srv-duration'); durSel.value = 'custom'; adminL1Pricing.onDurationSelectChange('custom');
      document.getElementById('edit-srv-duration-custom').value = '50';
      adminL1Pricing.saveEditModal(); await wait();
      const newSrvCard = [...document.querySelectorAll('#services-pricing-container > div')].find(d => d.innerText.includes('Alisado Custom 50m'));
      newSrvCard?.querySelector('button[onclick*="openEditModal"]')?.click(); await wait();
      document.getElementById('edit-srv-price').value = '18500'; adminL1Pricing.saveEditModal(); await wait();
      const histVisible = document.body.innerText.includes('Últ. ajuste') && document.body.innerText.includes('50 min');
      const storedAfterEdit = JSON.parse(localStorage.getItem('tucu_l1_services') || '[]');
      const customSrv = storedAfterEdit.find(s => s.name === 'Alisado Custom 50m');
      adminL1Pricing.toggleServiceActive(customSrv.id); await wait();
      const firstSrv = storedAfterEdit[0]; adminL1Pricing.deleteService(firstSrv.id); await wait();
      const afterSoftDel = JSON.parse(localStorage.getItem('tucu_l1_services') || '[]');
      const hasSoftDel = !!afterSoftDel.find(s => s.id === firstSrv.id)?.deletedAt && !document.body.innerText.includes(firstSrv.name);
      document.getElementById('main-view-btn-citas')?.click(); await wait();
      document.getElementById('btn-quick-new-booking')?.click(); await wait();
      const nbOpts = [...document.querySelectorAll('#nb-srv option')].map(o => o.value);
      const nbDateMin = document.getElementById('nb-date')?.min;
      const nbTimeCount = document.querySelectorAll('#nb-time option').length;
      const beforeNb = JSON.parse(localStorage.getItem('tucu_l1_bookings') || '[]').length;
      document.getElementById('nb-name').value = 'Test Pasado';
      document.getElementById('nb-phone').value = '3815551234';
      document.getElementById('nb-date').value = '2020-01-01';
      adminL1Agenda.saveManualBooking({ preventDefault: () => {} }); await wait(80);
      const afterNb = JSON.parse(localStorage.getItem('tucu_l1_bookings') || '[]').length;
      const pastBlocked = afterNb === beforeNb;
      adminL1Agenda.closeModal();
      document.getElementById('main-view-btn-configuracion')?.click(); await wait();
      const holLabel = document.getElementById('l1-holidays-label')?.innerText || '';
      const waText = document.getElementById('wa-status-pill')?.innerText || '';
      const noPracticeTxt = !document.body.innerText.includes('Base de práctica local-first');
      return { undoExpl, modTitle, histVisible, priceHistLen: customSrv?.priceHistory?.length || 0, hasSoftDel, pausedHiddenInNb: !nbOpts.includes('Alisado Custom 50m'), nbDateMin, nbTimeCount, pastBlocked, holLabel, waText, noPracticeTxt };
    })()`);
    assert(rL1.undoExpl, 'L1 Reversión explícita ("Anterior: Confirmado" + "↩ A Confirmado")');
    assert(rL1.modTitle === 'Nuevo Servicio' && rL1.histVisible && rL1.priceHistLen === 1, 'L1 Modal unificado + duración custom 50 min + priceHistory');
    assert(rL1.hasSoftDel, 'L1 Soft delete (deletedAt persistido y oculto en UI)');
    assert(rL1.pausedHiddenInNb && rL1.pastBlocked && rL1.nbDateMin === new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) && rL1.nbTimeCount > 0, 'L1 Nueva Cita excluye pausados y bloquea fechas pasadas');
    assert(rL1.holLabel.includes(String(new Date().getFullYear())) && rL1.waText.includes('WhatsApp:') && rL1.noPracticeTxt, `L1 ${rL1.holLabel} + ${rL1.waText} + limpio`);
    assert(l1.errors.length === 0, `L1 Desktop 0 errores (${l1.errors.join(' | ')})`);
    l1.close();

    // B. L2 Mobile (390x844): Sidebar scroll + bottom footer visible, holidays dinámico, turno futuro
    const l2m = await openTab('/admin_l2.html?slug=demo-central', 390, 844);
    const rL2 = await l2m.evalJs(`(async () => {
      const wait = (ms = 180) => new Promise(r => setTimeout(r, ms));
      document.getElementById('btn-open-sidebar')?.click(); await wait(350);
      const side = document.getElementById('admin-sidebar');
      const backLink = side?.querySelector('a[href="/"]')?.getBoundingClientRect();
      const navBox = side?.querySelector('nav')?.getBoundingClientRect();
      document.getElementById('main-view-btn-config')?.click(); await wait();
      document.getElementById('tab-btn-agenda')?.click(); await wait();
      const holLbl = document.getElementById('l2-holidays-label')?.innerText || '';
      const holCards = document.querySelectorAll('#holidays-container > div').length;
      return { footerInView: backLink && backLink.bottom <= 844 && backLink.height > 0, navScrollOk: !!navBox, holLbl, holCards, wa: document.getElementById('wa-status-pill')?.innerText || '' };
    })()`);
    assert(rL2.footerInView && rL2.navScrollOk, 'L2 Mobile 390x844 sidebar footer 100% visible');
    assert(rL2.holLbl.includes(String(new Date().getFullYear())) && rL2.holCards >= 5 && rL2.wa.includes('WhatsApp:'), `L2 Feriados (${rL2.holCards}) + ${rL2.wa}`);
    assert(l2m.errors.length === 0, `L2 Mobile 0 errores (${l2m.errors.join(' | ')})`);
    l2m.close();

    // C. L1 Mobile (390x844) Logout visible + L3 Desktop + Landing Turnero paused service filter
    const l1m = await openTab('/admin_l1.html?slug=demo-peluqueria', 390, 844);
    const logoutOk = await l1m.evalJs(`(async () => {
      document.getElementById('btn-open-sidebar')?.click(); await new Promise(r => setTimeout(r, 350));
      const btn = [...document.querySelectorAll('#admin-sidebar button')].find(b => b.innerText.includes('Cerrar Sesión'));
      const r = btn?.getBoundingClientRect();
      return !!r && r.height > 0 && r.bottom <= 844 && r.top >= 0;
    })()`);
    assert(logoutOk && l1m.errors.length === 0, 'L1 Mobile 390x844 botón Cerrar Sesión visible dentro de viewport + 0 errores');
    l1m.close();

    const l3 = await openTab('/admin_l3.html?slug=demo-staff', 1280, 800);
    await l3.evalJs('localStorage.clear(); location.reload();').catch(() => null);
    await new Promise(r => setTimeout(r, 700));
    const rL3 = await l3.evalJs(`(async () => {
      const wait = (ms = 180) => new Promise(r => setTimeout(r, ms));
      document.querySelector('.nav-tab[data-tab="services"]')?.click(); await wait();
      AdminL3Services.toggleActive('srv-2'); await wait();
      AdminL3Services.openEditModal('srv-1'); await wait();
      document.getElementById('sv-price').value = '14500';
      document.getElementById('sv-dur-sel').value = 'custom'; AdminL3Services.onDurChange('custom');
      document.getElementById('sv-dur').value = '55';
      AdminL3Services.saveService('srv-1'); await wait();
      const srvs = JSON.parse(localStorage.getItem('tucu_l3_services_barberia') || '[]');
      const s1 = srvs.find(s => s.id === 'srv-1');
      document.querySelector('.nav-tab[data-tab="agenda"]')?.click(); await wait();
      AdminL3Agenda.openSobreturnoModal(); await wait();
      const mbkOpts = [...document.querySelectorAll('#mbk-srv option')].map(o => o.textContent);
      const mbkTimeSel = document.getElementById('mbk-time')?.tagName;
      document.getElementById('admin-modal-root')?.classList.add('hidden');
      document.querySelector('.nav-tab[data-tab="system"]')?.click(); await wait();
      const sysLbl = document.getElementById('l3-holidays-label')?.innerText || '';
      return { histLen: s1?.priceHistory?.length || 0, dur: s1?.duration, pausedExcluded: !mbkOpts.some(t => t.includes('Barba')), mbkTimeSel, sysLbl, wa: document.getElementById('wa-status-pill')?.innerText || '' };
    })()`);
    assert(rL3.histLen === 1 && rL3.dur === 55 && rL3.pausedExcluded && rL3.mbkTimeSel === 'SELECT', 'L3 Sobreturno excluye pausados + dur custom 55 + priceHistory');
    assert(rL3.sysLbl.includes(String(new Date().getFullYear())) && rL3.wa.includes('WhatsApp:') && l3.errors.length === 0, `L3 ${rL3.sysLbl} + ${rL3.wa} + 0 errores`);
    l3.close();

    // D. Landing Turnero Showroom reflects paused L3 service from localStorage
    const land = await openTab('/', 1280, 800);
    const landRes = await land.evalJs(`(async () => {
      localStorage.setItem('tucu_l3_services_barberia', JSON.stringify([
        { id: 'srv-1', name: 'Corte VIP Visible', duration: 30, price: 12000, active: true },
        { id: 'srv-2', name: 'Servicio Pausado Test', duration: 30, price: 9000, active: false }
      ]));
      window.ShowcaseCore?.selectLevel('l3'); window.ShowcaseCore?.selectRubro('barberia');
      await new Promise(r => setTimeout(r, 250));
      const txt = document.getElementById('mockup-container')?.innerText || '';
      return { showsActive: txt.includes('Corte VIP Visible'), hidesPaused: !txt.includes('Servicio Pausado Test') };
    })()`);
    assert(landRes.showsActive && landRes.hidesPaused && land.errors.length === 0, 'Showroom Turnero público oculta servicios pausados');
    land.close();
  } finally {
    chrome.kill();
    setTimeout(() => fs.rmSync(tmpDir, { recursive: true, force: true }), 400);
  }
}

(async () => {
  runStaticAudit();
  await runCdpAudit();
  console.log(`\n========================================\nRESULTADO TASK-071: ${passed} PASSED / ${failed} FAILED\n========================================`);
  process.exit(failed > 0 ? 1 : 0);
})();