// Archivo: scripts/verify_task112e_config_tabs_sidebar.js
// Compuerta QA + E2E [TASK-112E]: Configuración 3 Pestañas Unificada L1/L2/L3 & Sidebar L3 (< 170L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4219, PORT_CDP = 9274, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN_RX = /#800000|#991B1B|#A82222|128,\s*0,\s*0|\bfont-mono\b/i;
const EXPECTED_LABELS = ['Negocio & Pagos', 'Horarios & Feriados', 'WhatsApp & Mensajes'];

const SYNC_FILES = [
  'public/admin_l1.html', 'public/js/admin_l1/admin_l1_config.js',
  'public/admin_l2.html', 'public/js/admin_l2/admin_l2_config.js',
  'public/admin_l3.html', 'public/js/admin_l3/admin_core.js',
  'public/js/admin_l3/view_system.js', 'public/js/admin_l3/view_telemetry.js'
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA + PARIDAD SHA-256 (8 ARCHIVOS + QA) ===');
  const all = [...SYNC_FILES, 'scripts/verify_task112e_config_tabs_sidebar.js'];
  const badLen = [], badAst = [], badEmoji = [], badStyle = [];
  for (const rel of all) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    const maxL = rel === 'public/admin_l3.html' ? 95 : (rel === 'public/js/admin_l3/admin_core.js' ? 185 : (rel.startsWith('scripts/') ? 170 : 200));
    if (lines.length >= maxL || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L/${maxL}`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
    if (!rel.startsWith('scripts/') && EMOJI_RX.test(txt)) badEmoji.push(rel);
    if (!rel.startsWith('scripts/') && FORBIDDEN_RX.test(txt)) badStyle.push(rel);
  }
  ok(badLen.length === 0, `Todos bajo límite (<95/<185/<170/<200L) y header Archivo OK (fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `Sintaxis AST node --check OK (fallos=${badAst.join(',') || '0'})`);
  ok(badEmoji.length === 0 && badStyle.length === 0, `0 emojis y 0 #800000/font-mono (${badEmoji.concat(badStyle).join(',') || '0'})`);
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function verifyConfigTabs(cdp, lvl, openJs, vp) {
  await cdp.goto(`/admin_${lvl}.html`); await cdp.evalJs(openJs); await wait(250);
  const s1 = await cdp.evalJs(`(() => {
    const bar = document.getElementById('config-tabs-bar');
    const btns = [...(bar?.querySelectorAll('.config-tab-btn') || [])];
    const labels = btns.map(b => b.textContent.trim()), hasChips = btns.every(b => b.classList.contains('tucu-chip'));
    const p1 = document.getElementById('config-content-identidad'), p2 = document.getElementById('config-content-agenda'), p3 = document.getElementById('config-content-wa');
    const coords = document.getElementById('cfg-biz-coords');
    return { labels, hasChips, b1Act: document.getElementById('tab-btn-identidad')?.classList.contains('is-active'), p1Vis: (p1?.offsetHeight || 0) > 0 && !p1?.classList.contains('hidden'), coordsVis: (coords?.offsetHeight || 0) > 0, p2Hid: p2?.classList.contains('hidden') && (p2?.offsetHeight || 0) === 0, p3Hid: p3?.classList.contains('hidden') && (p3?.offsetHeight || 0) === 0, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  })()`);
  ok(JSON.stringify(s1.labels) === JSON.stringify(EXPECTED_LABELS) && s1.hasChips, `${vp} [${lvl}] barra 3 pestañas .tucu-chip (${s1.labels.join(' | ')})`);
  ok(s1.b1Act && s1.p1Vis && s1.coordsVis && s1.p2Hid && s1.p3Hid && !s1.ov, `${vp} [${lvl}] Tab 1 Negocio & Pagos activo, #cfg-biz-coords visible, otros ocultos, 0 overflow`);

  await cdp.evalJs("document.getElementById('tab-btn-agenda').click()"); await wait(180);
  const s2 = await cdp.evalJs(`(() => {
    const p1 = document.getElementById('config-content-identidad'), p2 = document.getElementById('config-content-agenda'), p3 = document.getElementById('config-content-wa');
    const hol = document.querySelector('[data-holidays-card="${lvl}"]');
    return { b2Act: document.getElementById('tab-btn-agenda')?.classList.contains('is-active'), p2Vis: (p2?.offsetHeight || 0) > 0 && !p2?.classList.contains('hidden'), holVis: (hol?.offsetHeight || 0) > 0, p1Hid: p1?.classList.contains('hidden') && (p1?.offsetHeight || 0) === 0, p3Hid: p3?.classList.contains('hidden') && (p3?.offsetHeight || 0) === 0, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  })()`);
  ok(s2.b2Act && s2.p2Vis && s2.holVis && s2.p1Hid && s2.p3Hid && !s2.ov, `${vp} [${lvl}] Tab 2 Horarios & Feriados activo, Feriados 2026 visible, otros ocultos, 0 overflow`);

  await cdp.evalJs("document.getElementById('tab-btn-wa').click()"); await wait(180);
  const s3 = await cdp.evalJs(`(() => {
    const p1 = document.getElementById('config-content-identidad'), p2 = document.getElementById('config-content-agenda'), p3 = document.getElementById('config-content-wa');
    const waM = document.getElementById('${lvl}-wa-config-mount');
    return { b3Act: document.getElementById('tab-btn-wa')?.classList.contains('is-active'), p3Vis: (p3?.offsetHeight || 0) > 0 && !p3?.classList.contains('hidden'), waVis: (waM?.offsetHeight || 0) > 0, p1Hid: p1?.classList.contains('hidden') && (p1?.offsetHeight || 0) === 0, p2Hid: p2?.classList.contains('hidden') && (p2?.offsetHeight || 0) === 0, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  })()`);
  ok(s3.b3Act && s3.p3Vis && s3.waVis && s3.p1Hid && s3.p2Hid && !s3.ov, `${vp} [${lvl}] Tab 3 WhatsApp & Mensajes activo, plantillas visibles, otros ocultos, 0 overflow`);
}

async function verifyL3SidebarBadge(cdp, vp, mob) {
  await cdp.goto('/admin_l3.html?rubro=barberia'); await wait(250);
  if (mob) { await cdp.evalJs("document.getElementById('btn-open-sidebar')?.click()"); await wait(340); }
  const pos = await cdp.evalJs(`(() => {
    const card = document.getElementById('l3-reception-card'), badge = document.getElementById('cron-telemetry-badge');
    const wa = document.getElementById('wa-status-pill'), footer = document.querySelector('.admin-sidebar-footer');
    const bR = badge?.getBoundingClientRect(), wR = wa?.getBoundingClientRect();
    return { inCard: Boolean(card && badge && card.contains(badge)), belowWa: Boolean(bR && wR && bR.top >= wR.bottom - 1 && bR.left >= 0), notFooter: Boolean(footer && !footer.contains(badge) && !/Confirmación/.test(footer.innerText || '')), text: badge?.innerText?.trim() };
  })()`);
  ok(pos.inCard && pos.belowWa && pos.notFooter, `${vp} [l3] Confirmación 2hs dentro Recepción Web debajo de WhatsApp y ausente sobre Apariencia (${pos.text})`);
  await cdp.evalJs("document.getElementById('cron-telemetry-badge').click()"); await wait(220);
  const navOk = await cdp.evalJs(`({ hasBtn: Boolean(document.getElementById('btn-l3-auto-confirm-toggle')), closedMob: ${mob ? "!document.getElementById('admin-sidebar')?.classList.contains('is-open')" : 'true'} })`);
  ok(navOk.hasBtn && navOk.closedMob, `${vp} [l3] click en badge navega a Confirmación 2 hs`);
  if (!mob) {
    const sync = await cdp.evalJs(`(() => {
      document.getElementById('btn-l3-auto-confirm-toggle').click();
      const offTxt = document.getElementById('cron-telemetry-badge')?.innerText?.trim();
      document.getElementById('btn-l3-auto-confirm-toggle').click();
      const onTxt = document.getElementById('cron-telemetry-badge')?.innerText?.trim();
      return { offTxt, onTxt };
    })()`);
    ok(sync.offTxt === 'Confirmación 2 hs: Pausado' && sync.onTxt === 'Confirmación 2 hs: Activo', `${vp} [l3] badge sincroniza en vivo (${sync.offTxt} <-> ${sync.onTxt})`);
  }
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-112e'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    const cfgOpen = [['l1', "adminL1Core.switchView('configuracion')"], ['l2', "adminL2Core.switchMainView('config')"], ['l3', "AdminL3Core.switchTab('system')"]];
    for (const [vp, w, h, mob] of [['Desktop 1280', 1280, 800, false], ['Mobile 375', 375, 667, true]]) {
      console.log(`\n=== 2. E2E ${vp} (3 PESTAÑAS CONFIG L1/L2/L3 + SIDEBAR L3) ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
      for (const [lvl, js] of cfgOpen) await verifyConfigTabs(cdp, lvl, js, vp);
      await verifyL3SidebarBadge(cdp, vp, mob);
    }
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-112E]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
