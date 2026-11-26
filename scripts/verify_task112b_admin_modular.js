// Archivo: scripts/verify_task112b_admin_modular.js
// Compuerta QA + E2E [TASK-112B]: Modularidad Admin, Normalización L1/L2/L3, Paleta, Feriados L1 y Obra Social (< 195L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4215, PORT_CDP = 9270, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN_RX = /#800000|#991B1B|#A82222|128,\s*0,\s*0|168,\s*34,\s*34|\bfont-mono\b/i;

const SYNC_FILES = [
  'public/js/admin_shared/admin_features.js', 'public/js/admin_shared/admin_theme_sync.js',
  'public/css/admin_unified.css', 'public/js/admin_shared/turnero_catalog.js', 'public/js/admin_shared/admin_holidays.js',
  'public/js/admin_shared/turnero_app.js', 'public/js/admin_shared/admin_booking_engine.js', 'public/js/admin_shared/admin_pin_gate.js',
  'public/js/admin_shared/admin_contacts_manager.js', 'public/js/admin_shared/admin_manual_viewer.js', 'public/js/admin_shared/admin_wa_templates.js',
  'public/admin_l1.html', 'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l1/admin_l1_config.js', 'public/js/admin_l1/admin_l1_agenda.js', 'public/js/admin_l1/admin_l1_pricing.js',
  'public/admin_l2.html', 'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_calendar.js', 'public/js/admin_l2/admin_l2_config.js', 'public/js/admin_l2/admin_l2_schedule.js', 'public/js/admin_l2/admin_l2_services.js', 'public/js/admin_l2/admin_l2_baileys_modal.js',
  'public/admin_l3.html', 'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js', 'public/js/admin_l3/view_clients.js', 'public/js/admin_l3/view_resources.js', 'public/js/admin_l3/view_services.js', 'public/js/admin_l3/view_staff.js', 'public/js/admin_l3/view_system.js', 'public/js/admin_l3/view_telemetry.js'
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
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params.response.url.endsWith('/favicon.ico') && m.params.response.status >= 400) {
        this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
      }
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA + PARIDAD SHA-256 (32 ARCHIVOS + QA) ===');
  const all = [...SYNC_FILES, 'scripts/verify_task112b_admin_modular.js'];
  let badLen = [], badAst = [], badEmoji = [], badStyle = [];
  for (const rel of all) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    if (lines.length >= 200 || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
    if (!rel.startsWith('scripts/') && EMOJI_RX.test(txt)) badEmoji.push(rel);
    if (!rel.startsWith('scripts/') && FORBIDDEN_RX.test(txt)) badStyle.push(rel);
  }
  ok(badLen.length === 0, `Todos < 200L y con header Archivo (${all.length} archivos; fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `Sintaxis AST node --check OK (fallos=${badAst.join(',') || '0'})`);
  ok(badEmoji.length === 0 && badStyle.length === 0, `0 emojis y 0 #800000/font-mono en admin (emojis=${badEmoji.length}, style=${badStyle.length})`);
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function inspectConsole(cdp, cfg) {
  await cdp.goto(cfg.url);
  await wait(250);
  const r = await cdp.evalJs(`(() => {
    const kpi = document.getElementById('admin-kpis-section')?.getBoundingClientRect();
    const ctl = document.getElementById('admin-controls-card')?.getBoundingClientRect();
    const lst = document.getElementById('admin-agenda-list')?.getBoundingClientRect();
    const btn = document.querySelector('${cfg.btnSel}');
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--tucu-primary').trim().toLowerCase();
    const btnBg = btn ? getComputedStyle(btn).backgroundColor : '';
    const sub = document.getElementById('${cfg.subId}')?.textContent?.trim() || '';
    const mob = document.getElementById('${cfg.mobId}')?.textContent?.trim() || '';
    const af = window.AdminFeatures ? {
      meta: window.AdminFeatures.getPlanMeta('${cfg.lvl}')?.name,
      hol: window.AdminFeatures.hasFeature('l1', 'holidays2026'),
      l1Multi: window.AdminFeatures.hasFeature('l1', 'multiStaff'),
      l3Multi: window.AdminFeatures.hasFeature('l3', 'multiStaff'),
      addon: Boolean(window.AdminFeatures.ADDONS_CATALOG?.mercadoPago)
    } : null;
    return {
      title: document.title, sub, mob, cssVar, btnBg, af,
      ov: document.documentElement.scrollWidth > window.innerWidth + 1,
      rectOk: Boolean(kpi && ctl && lst && kpi.height > 0 && ctl.height > 0 && lst.height > 0 && kpi.top < ctl.top && ctl.top < lst.top),
      tops: kpi && ctl && lst ? [Math.round(kpi.top), Math.round(ctl.top), Math.round(lst.top)] : null
    };
  })()`);
  ok(!r.ov, `${cfg.vp} [${cfg.lvl}/${cfg.rubro}] 0 overflow horizontal`);
  ok(r.rectOk, `${cfg.vp} [${cfg.lvl}/${cfg.rubro}] orden KPIs->Controls->List (tops=${r.tops?.join('<')})`);
  ok(r.title.includes(cfg.planTitle) && r.sub.includes(cfg.planTitle) && r.mob.includes(cfg.planTitle),
    `${cfg.vp} [${cfg.lvl}/${cfg.rubro}] título canónico "${cfg.planTitle}"`);
  ok(r.cssVar === cfg.hex && r.btnBg === cfg.rgb && r.btnBg !== 'rgb(128, 0, 0)',
    `${cfg.vp} [${cfg.lvl}/${cfg.rubro}] paleta heredada (${r.cssVar} / ${r.btnBg})`);
  ok(Boolean(r.af && r.af.meta === cfg.planWord && r.af.hol && !r.af.l1Multi && r.af.l3Multi && r.af.addon),
    `${cfg.vp} [${cfg.lvl}/${cfg.rubro}] AdminFeatures OK`);
}

async function runAdminE2E(cdp) {
  const specs = [
    { lvl: 'l1', planWord: 'Turnos', planTitle: 'Admin · Turnos', subId: 'brand-subtitle', mobId: 'l1-mobile-title', btnSel: '#btn-quick-new-booking' },
    { lvl: 'l2', planWord: 'Gestión', planTitle: 'Admin · Gestión', subId: 'l2-brand-subtitle', mobId: 'l2-mobile-title', btnSel: '#btn-open-new-booking-modal' },
    { lvl: 'l3', planWord: 'Equipos', planTitle: 'Admin · Equipos', subId: 'l3-brand-subtitle', mobId: 'l3-mobile-title', btnSel: '#admin-controls-card .admin-glass-primary' }
  ];
  const rubros = [['peluqueria', '#b45309', 'rgb(180, 83, 9)'], ['salud', '#0f766e', 'rgb(15, 118, 110)']];

  for (const [vp, w, h, mob] of [['Desktop 1280', 1280, 800, false], ['Mobile 375', 375, 667, true]]) {
    console.log(`\n=== 2. E2E CONSOLAS NORMALIZADAS (${vp}) ===`);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
    for (const s of specs) {
      for (const [rubro, hex, rgb] of rubros) {
        const qRubro = s.lvl === 'l3' && rubro === 'salud' ? 'salud_consultorio' : (s.lvl === 'l3' && rubro === 'peluqueria' ? 'barberia' : rubro);
        await inspectConsole(cdp, { ...s, vp, rubro, hex, rgb, url: `/admin_${s.lvl}.html?rubro=${qRubro}` });
      }
    }
  }

  console.log('\n=== 3. E2E FERIADOS 2026 EN L1 (TURNOS) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/admin_l1.html?rubro=peluqueria');
  await cdp.evalJs(`document.getElementById('main-view-btn-configuracion')?.click()`);
  await wait(300);
  const holBefore = await cdp.evalJs(`(() => {
    const btns = Array.from(document.querySelectorAll('#l1-holidays-container [data-holiday-toggle]'));
    return { count: btns.length, d0: btns[0]?.dataset.holidayToggle || '', t0: btns[0]?.closest('label')?.querySelector('.tucu-badge')?.textContent?.trim() || '', d1: btns[1]?.dataset.holidayToggle || '' };
  })()`);
  ok(holBefore.count >= 10 && holBefore.t0 === 'Bloqueado', `L1 Configuración monta ${holBefore.count} feriados 2026 por mes (1ro=${holBefore.d0} "${holBefore.t0}")`);
  await cdp.evalJs(`document.querySelector('#l1-holidays-container [data-holiday-toggle]')?.click()`);
  await wait(150);
  const holAfter = await cdp.evalJs(`({
    t0: document.querySelector('#l1-holidays-container [data-holiday-toggle]')?.closest('label')?.querySelector('.tucu-badge')?.textContent?.trim() || '',
    blk0: window.AdminHolidays.isDateBlocked('l1', 'peluqueria', '${holBefore.d0}'),
    blk1: window.AdminHolidays.isDateBlocked('l1', 'peluqueria', '${holBefore.d1}'),
    raw: localStorage.getItem('tucu_l1_holidays_state_peluqueria') || ''
  })`);
  ok(holAfter.t0 === 'Abierto' && holAfter.blk0 === false && holAfter.blk1 === true && holAfter.raw.includes(`"${holBefore.d0}":false`),
    `L1 Feriados toggle individual persiste estado (fecha=${holBefore.d0} -> Abierto/false, otra fecha sigue Bloqueado/true)`);
}

async function runCoverageE2E(cdp) {
  console.log('\n=== 4. E2E FIX OBRA SOCIAL (coverage) EN L1 Y L2 ===');
  await cdp.goto('/turnero.html?rubro=salud&level=l1&skipCover=1');
  await wait(250);
  await cdp.evalJs(`(() => {
    localStorage.removeItem('tucu_l1_bookings_salud'); localStorage.removeItem('tucu_client_profile_v1');
    TucuTurneroApp.goStep(2);
  })()`);
  await wait(120);
  await cdp.evalJs(`(() => {
    document.getElementById('inp-client-first').value = 'Lucia';
    document.getElementById('inp-client-last').value = 'Gomez';
    document.getElementById('inp-client-phone').value = '3815112233';
    const cov = document.getElementById('inp-client-cov'); if (cov) cov.value = 'OSDE';
    document.querySelector('form[onsubmit*="confirmFromStep2"] button[type="submit"]').click();
  })()`);
  await wait(200);
  const l1Saved = await cdp.evalJs(`JSON.parse(localStorage.getItem('tucu_l1_bookings_salud') || '[]')[0]?.coverage || ''`);
  ok(l1Saved === 'OSDE', `Turnero Salud L1 flujo UI persiste coverage="OSDE" (obtenido="${l1Saved}")`);

  await cdp.goto('/turnero.html?rubro=salud&level=l2&skipCover=1');
  await wait(250);
  const l2Res = await cdp.evalJs(`(() => {
    localStorage.removeItem('tucu_l2_bookings_salud');
    const srv = TucuTurneroCatalog.getActiveServices({ level: 'l2', rubro: 'salud' })[0];
    TucuTurneroCatalog.saveBooking({ level: 'l2', slug: 'demo-salud', rubro: 'salud', service: srv, date: '2026-12-01', time: '10:00', clientName: 'Carlos Paz', clientPhone: '3815223344', coverage: 'Swiss Medical' });
    return JSON.parse(localStorage.getItem('tucu_l2_bookings_salud') || '[]')[0]?.coverage || '';
  })()`);
  const nonHealth = await cdp.evalJs(`TucuTurneroCatalog.saveBooking({ level: 'l1', slug: 'demo-peluqueria', rubro: 'peluqueria', service: { id: 's1', name: 'Corte', duration: 30, price: 8000 }, clientName: 'Ana Ruiz', clientPhone: '3815000001', coverage: 'OSDE' }).record.coverage`);
  ok(l2Res === 'Swiss Medical' && nonHealth === '', `Turnero Salud L2 persiste coverage="Swiss Medical" y peluquería limpia coverage=""`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-112b'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await runAdminE2E(cdp); await runCoverageE2E(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-112B]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
