// Archivo: scripts/verify_task112d_admin_mobile_parity.js
// Compuerta QA + E2E [TASK-112D]: Coordenadas, Feriados Únicos, Sidebar Uniforme y Fixes Móvil L3 (< 195L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4217, PORT_CDP = 9272, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN_RX = /#800000|#991B1B|#A82222|128,\s*0,\s*0|\bfont-mono\b/i;

const SYNC_FILES = [
  'public/css/admin_unified.css', 'public/js/admin_shared/admin_holidays.js', 'public/js/admin_shared/admin_manual_viewer.js',
  'public/admin_l1.html', 'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l1/admin_l1_config.js',
  'public/admin_l2.html', 'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_config.js', 'public/js/admin_l2/admin_l2_schedule.js',
  'public/admin_l3.html', 'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_system.js',
  'public/js/admin_l3/view_services.js', 'public/js/admin_l3/view_staff.js', 'public/js/admin_l3/view_telemetry.js'
];

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); }); q.on('error', rej); q.end(); });

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params.response.url.endsWith('/favicon.ico') && m.params.response.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
    await this.send('Page.addScriptToEvaluateOnNewDocument', { source: "try{sessionStorage.setItem('tucu_admin_auth','1');}catch(_){}" });
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(650); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA + PARIDAD SHA-256 (16 ARCHIVOS + QA) ===');
  const all = [...SYNC_FILES, 'scripts/verify_task112d_admin_mobile_parity.js'];
  const badLen = [], badAst = [], badEmoji = [], badStyle = [], badLabel = [];
  for (const rel of all) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    const maxL = rel.endsWith('admin_holidays.js') ? 180 : ((rel.endsWith('admin_unified.css') || /view_(services|staff|telemetry)\.js$/.test(rel) || rel.startsWith('scripts/')) ? 195 : 200);
    if (lines.length >= maxL || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
    if (!rel.startsWith('scripts/') && EMOJI_RX.test(txt)) badEmoji.push(rel);
    if (!rel.startsWith('scripts/') && FORBIDDEN_RX.test(txt)) badStyle.push(rel);
    if (rel.includes('admin_l3') && /Barberos/.test(txt)) badLabel.push(rel);
  }
  ok(badLen.length === 0, `Todos dentro del límite (<180/<195/<200L) y header Archivo OK (${all.length} archivos; fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `Sintaxis AST node --check OK (fallos=${badAst.join(',') || '0'})`);
  ok(badEmoji.length === 0 && badStyle.length === 0 && badLabel.length === 0, `0 emojis, 0 #800000/font-mono y 0 "Barberos" en L3 (${badLabel.join(',') || 'OK'})`);
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function checkAllTabsOverflow(cdp, lvl, tabs, vp) {
  const ovTabs = [];
  for (const t of tabs) {
    await cdp.evalJs(t.go); await wait(160);
    if (await cdp.evalJs('document.documentElement.scrollWidth > document.documentElement.clientWidth')) ovTabs.push(t.name);
  }
  ok(ovTabs.length === 0, `${vp} [${lvl}] 0 overflow-x en todas las pestañas (${tabs.length} vistas; fallos=${ovTabs.join(',') || '0'})`);
}

async function verifyConfigCoordsAndHolidays(cdp, lvl, openCfgJs, openHolJs, saveJs, vp) {
  await cdp.evalJs(openCfgJs); await wait(180);
  const pos = await cdp.evalJs(`(() => { const a = document.getElementById('cfg-biz-address')?.getBoundingClientRect(), c = document.getElementById('cfg-biz-coords')?.getBoundingClientRect(); return { ok: Boolean(a && c && c.top >= a.bottom - 1), noOldMaster: !document.getElementById('cfg-feriados-toggle') && !document.getElementById('cfg-block-holidays') }; })()`);
  ok(pos.ok && pos.noOldMaster, `${vp} [${lvl}] input Coordenadas debajo de Dirección y sin checkbox maestro`);
  await cdp.evalJs(`(() => { const el = document.getElementById('cfg-biz-coords'); el.value = '-26.8301, -65.2044'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); ${saveJs} })()`);
  await wait(140);
  if (openHolJs) { await cdp.evalJs(openHolJs); await wait(160); }
  const hol = await cdp.evalJs(`(() => { const card = document.querySelector('[data-holidays-card="${lvl}"]'), txt = card?.innerText || '', cb = card?.querySelector('[data-holiday-toggle]'), before = cb ? cb.checked : null; if (cb) cb.click(); return { hasCard: Boolean(card), hasSub: /Destildá los días que abras/i.test(txt), sep: !txt.includes('Bloqueos / Vacaciones') && !txt.includes('Horarios Semanales'), toggled: before !== null && document.querySelector('[data-holidays-card="${lvl}"] [data-holiday-toggle]')?.checked === !before }; })()`);
  ok(hol.hasCard && hol.hasSub && hol.sep && hol.toggled, `${vp} [${lvl}] Feriados 2026 único/separado con toggle individual`);
  await cdp.goto(`/admin_${lvl}.html`); await wait(250); await cdp.evalJs(openCfgJs); await wait(150);
  ok(await cdp.evalJs(`document.getElementById('cfg-biz-coords')?.value === '-26.8301, -65.2044'`), `${vp} [${lvl}] coordenadas persisten tras recarga`);
}

async function checkL3MobileFixes(cdp) {
  await cdp.goto('/admin_l3.html?rubro=barberia'); await wait(220);
  const sideInfo = await cdp.evalJs(`({ label: document.getElementById('tab-staff-label')?.textContent?.trim(), hasOld: /Barberos/.test(document.body.innerText) })`);
  ok(sideInfo.label === 'Personal' && !sideInfo.hasOld, 'Mobile 375 [l3] menú lateral muestra "Personal" y 0 "Barberos"');
  await cdp.evalJs("AdminL3Core.switchTab('services')"); await wait(160);
  const srv = await cdp.evalJs(`({ cards: document.querySelectorAll('[data-service-card]').length, tables: document.querySelectorAll('#l3-services-list table').length, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth })`);
  ok(srv.cards >= 3 && srv.tables === 0 && !srv.ov, `Mobile 375 [l3] Servicios en tarjetas (${srv.cards}), sin tabla (${srv.tables}) y 0 overflow-x`);
  await cdp.evalJs("AdminL3Core.switchTab('staff'); AdminL3Staff.openEditModal();"); await wait(160);
  const stf = await cdp.evalJs(`(() => {
    const sp = document.getElementById('dh-split-1'); if (sp && !sp.checked) sp.click();
    const wrapOpen = !document.getElementById('dh-split-wrap-1')?.classList.contains('hidden');
    const rects = ['dh-active-1', 'dh-split-1', 'dh-start-1', 'dh-end-1', 'dh-open2-1', 'dh-close2-1'].map(id => { const r = document.getElementById(id)?.getBoundingClientRect(); return { id, l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; });
    const inVp = rects.every(x => x.w > 0 && x.h > 0 && x.l >= 0 && x.r <= 375), overlaps = [];
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) { const a = rects[i], b = rects[j]; if (!(a.r <= b.l + 0.5 || b.r <= a.l + 0.5 || a.b <= b.t + 0.5 || b.b <= a.t + 0.5)) overlaps.push(a.id + '+' + b.id); }
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    return { wrapOpen, inVp, overlaps };
  })()`);
  ok(stf.wrapOpen && stf.inVp && stf.overlaps.length === 0, `Mobile 375 [l3] modal Personal 2do T. sin solapamientos (${stf.overlaps.join(',') || '0'})`);
  await cdp.evalJs("AdminL3Core.switchTab('telemetry')"); await wait(160);
  const tel = await cdp.evalJs(`(() => { const b1 = document.getElementById('btn-l3-auto-confirm-toggle')?.getBoundingClientRect(), b2 = document.getElementById('btn-l3-run-review-now')?.getBoundingClientRect(); return { b1Ok: b1 && b1.left >= 0 && b1.right <= 375, b2Ok: b2 && b2.left >= 0 && b2.right <= 375, mobH: document.getElementById('l3-telemetry-cards-mobile')?.offsetHeight || 0, deskH: document.getElementById('l3-telemetry-table-desktop')?.offsetHeight || 0, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth }; })()`);
  ok(tel.b1Ok && tel.b2Ok && tel.mobH > 0 && tel.deskH === 0 && !tel.ov, `Mobile 375 [l3] Confirmación 2hs apilada e historial en tarjetas (${tel.mobH}px) sin overflow`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-112d'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    const l1Tabs = ['citas', 'catalogo', 'configuracion', 'manual'].map(v => ({ name: v, go: `adminL1Core.switchView('${v}')` }));
    const l2Tabs = [{ name: 'calendar', go: "adminL2Core.switchMainView('calendar')" }, { name: 'services', go: "adminL2Core.switchMainView('services')" }, { name: 'crm', go: "adminL2Core.switchMainView('crm')" }, { name: 'cfg-id', go: "adminL2Core.switchMainView('config');adminL2Config.switchConfigTab('identidad')" }, { name: 'cfg-ag', go: "adminL2Core.switchMainView('config');adminL2Config.switchConfigTab('agenda')" }, { name: 'cfg-wa', go: "adminL2Core.switchMainView('config');adminL2Config.switchConfigTab('wa')" }, { name: 'manual', go: "adminL2Core.switchMainView('manual')" }];
    const l3Tabs = ['agenda', 'services', 'clients', 'staff', 'resources', 'telemetry', 'system', 'manual'].map(t => ({ name: t, go: `AdminL3Core.switchTab('${t}')` }));
    for (const [vp, w, h, mob] of [['Desktop 1280', 1280, 800, false], ['Mobile 375', 375, 667, true]]) {
      console.log(`\n=== 2. E2E ${vp} (SIDEBAR + OVERFLOW TOTAL + COORDENADAS + FERIADOS ÚNICOS) ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
      for (const [lvl, tabs] of [['l1', l1Tabs], ['l2', l2Tabs], ['l3', l3Tabs]]) {
        await cdp.goto(`/admin_${lvl}.html`);
        const navR = await cdp.evalJs("getComputedStyle(document.querySelector('.tucu-sidebar-item.is-active') || document.body).borderRadius");
        ok(navR === '12px', `${vp} [${lvl}] sidebar .tucu-sidebar-item.is-active uniforme (${navR})`);
        await checkAllTabsOverflow(cdp, lvl, tabs, vp);
      }
      await cdp.goto('/admin_l1.html'); await verifyConfigCoordsAndHolidays(cdp, 'l1', "adminL1Core.switchView('configuracion')", '', 'adminL1Config.saveConfig()', vp);
      await cdp.goto('/admin_l2.html'); await verifyConfigCoordsAndHolidays(cdp, 'l2', "adminL2Core.switchMainView('config');adminL2Config.switchConfigTab('identidad')", "adminL2Config.switchConfigTab('agenda')", 'adminL2Config.saveGlobalConfig()', vp);
      await cdp.goto('/admin_l3.html'); await verifyConfigCoordsAndHolidays(cdp, 'l3', "AdminL3Core.switchTab('system')", '', 'AdminL3System.saveConfig()', vp);
    }
    console.log('\n=== 3. FIXES CRÍTICOS MÓVIL L3 (375x667) ===');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
    await checkL3MobileFixes(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-112D]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
