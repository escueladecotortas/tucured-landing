// Archivo: scripts/verify_task069_warm_studio_v2.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const BASE_URL = 'http://localhost:5174';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9231;
let passed = 0, failed = 0;
const assert = (c, m) => c ? (console.log(`  [PASS] ${m}`), passed++) : (console.error(`  [FAIL] ${m}`), failed++);

const TARGET_FILES = [
  'public/css/admin_unified.css', 'public/js/admin_shared/admin_shell.js',
  'public/admin_l1.html', 'public/admin_l2.html', 'public/admin_l3.html',
  'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l1/admin_l1_agenda.js',
  'public/js/admin_l1/admin_l1_pricing.js', 'public/js/admin_l1/admin_l1_config.js',
  'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_calendar.js',
  'public/js/admin_l2/admin_l2_crm.js', 'public/js/admin_l2/admin_l2_schedule.js',
  'public/js/admin_l2/admin_l2_config.js', 'public/js/admin_l3/admin_core.js',
  'public/js/admin_l3/view_agenda.js', 'public/js/admin_l3/view_clients.js',
  'public/js/admin_l3/view_staff.js', 'public/js/admin_l3/view_resources.js',
  'public/js/admin_l3/view_services.js', 'public/js/admin_l3/view_telemetry.js', 'public/js/admin_l3/view_system.js'
];

function runStaticAudit() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA PEAC, <200L, ZERO INDIGO & ZERO EMOJI UI ===');
  const emojiRx = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
  for (const rel of TARGET_FILES) {
    const content = fs.readFileSync(path.resolve(rel), 'utf8'), lines = content.split(/\r?\n/);
    assert(lines.length <= 180, `${rel} <= 180L (${lines.length}L)`);
    assert(lines[0].includes('Archivo:'), `${rel} tiene encabezado PEAC`);
    assert(!/\bindigo\b/i.test(content), `${rel} libre de clases indigo`);
    const ui = lines.filter((l) => !['//', '/*', '*'].some((p) => l.trim().startsWith(p)) && !l.includes('defaultTpl')).join('\n');
    const m = ui.match(emojiRx);
    assert(!m, `${rel} libre de emojis UI${m ? ' (' + m[0] + ')' : ''}`);
  }
}

const reqJson = (url, method = 'GET') => new Promise((res, rej) => {
  const req = http.request(url, { method }, (r) => {
    let d = ''; r.on('data', (c) => d += c);
    r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error(d || e.message)); } });
  });
  req.on('error', rej); req.end();
});

async function waitForCdp() {
  for (let i = 0; i < 30; i++) {
    try { return await reqJson(`http://127.0.0.1:${CDP_PORT}/json/version`); } catch { await new Promise((r) => setTimeout(r, 250)); }
  }
  throw new Error('Chrome CDP timeout');
}

class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl); this.id = 1; this.pending = new Map(); this.errors = [];
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id); this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method === 'Runtime.exceptionThrown') this.errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
      else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
        const u = msg.params.entry.url || '';
        if (!u.endsWith('/favicon.ico')) this.errors.push(`${msg.params.entry.source} (${u}): ${msg.params.entry.text}`);
      }
    });
  }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    await this.send('Runtime.enable'); await this.send('Page.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) {
    const id = this.id++;
    return new Promise((r, j) => { this.pending.set(id, { resolve: r, reject: j }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async evalJs(expression) {
    const res = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (res.exceptionDetails) throw new Error(res.exceptionDetails.text);
    return res.result?.value;
  }
  close() { this.ws.close(); }
}

async function openTab(q, width = 1280, height = 800) {
  const t = await reqJson(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(BASE_URL + q)}`, 'PUT');
  const cdp = new CdpSession(t.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  await cdp.send('Page.navigate', { url: BASE_URL + q });
  for (let i = 0; i < 40; i++) {
    if ((await cdp.evalJs('document.readyState').catch(() => '')) === 'complete') break;
    await new Promise((r) => setTimeout(r, 150));
  }
  await new Promise((r) => setTimeout(r, 350));
  return cdp;
}

async function verifyCommon(cdp, label) {
  const r = await cdp.evalJs(`(() => {
    const bg = getComputedStyle(document.body).backgroundColor, html = document.documentElement, btn = document.getElementById('btnThemeToggle');
    const before = html.classList.contains('dark'); if (btn) btn.click();
    const after1 = html.classList.contains('dark'); if (btn) btn.click();
    return { bg, hasBtn: !!btn, before, after1, after2: html.classList.contains('dark') };
  })()`);
  assert(r.bg === 'rgb(234, 228, 218)', `${label} fondo Día #EAE4DA (${r.bg})`);
  assert(r.hasBtn && !r.before && r.after1 && !r.after2, `${label} toggle Día/Noche único`);
  assert(cdp.errors.length === 0, `${label} 0 errores consola/runtime (${cdp.errors.join(' | ')})`);
}

async function runCdpAudit() {
  console.log('\n=== 2. AUDITORÍA CHROME HEADLESS CDP (L1, L2, L3) ===');
  const tmpDir = path.resolve('.tmp-cdp-t069'); fs.mkdirSync(tmpDir, { recursive: true });
  const chrome = spawn(CHROME_PATH, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, '--disable-gpu', '--no-sandbox', `--user-data-dir=${tmpDir}`, 'about:blank'], { stdio: 'ignore' });
  try {
    await waitForCdp();
    const l1 = await openTab('/admin_l1.html?slug=demo-peluqueria', 1280, 800);
    await verifyCommon(l1, 'L1 Desktop');
    const c1 = await l1.evalJs(`(() => {
      const hasJornada = document.body.innerText.includes('Jornada Activa');
      const kpiBars = ['kpi-turnos-bar', 'kpi-deposit-bar', 'kpi-attendance-bar'].every((id) => !!document.getElementById(id));
      const newBtn = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('Nueva Cita'));
      document.querySelector('[data-tfilter="rango"]')?.click();
      const rangeOpen = !document.getElementById('filter-range-panel')?.classList.contains('hidden');
      document.querySelector('[data-tfilter="hoy"]')?.click();
      const s = document.getElementById('inputSearchBooking'); s.value = 'Martin'; s.dispatchEvent(new Event('input', { bubbles: true }));
      return { hasJornada, kpiBars, hasPlus: newBtn ? newBtn.innerText.includes('+') : true, rangeOpen, found: document.body.innerText.includes('Martín Gómez') };
    })()`);
    assert(!c1.hasJornada && c1.kpiBars && !c1.hasPlus && c1.rangeOpen && c1.found, 'L1 KPIs, Rango, buscador sin acentos y botón sin +');
    l1.close();
    for (const [tag, url, w, h] of [['L1 Mob', '/admin_l1.html?slug=demo-peluqueria', 390, 844], ['L1 Emb', '/admin_l1.html?slug=demo-peluqueria&embed=true', 1024, 600]]) {
      const t = await openTab(url, w, h); assert(t.errors.length === 0, `${tag} 0 errores`); t.close();
    }
    const l2 = await openTab('/admin_l2.html?slug=demo-central', 1280, 800);
    await verifyCommon(l2, 'L2 Desktop');
    const c2 = await l2.evalJs(`(() => {
      document.getElementById('cal-btn-range-toggle')?.click();
      const rangeOpen = !document.getElementById('cal-range-panel')?.classList.contains('hidden');
      const sc = document.getElementById('cal-search-input'); sc.value = 'Sofia'; sc.dispatchEvent(new Event('input', { bubbles: true }));
      const foundSofia = document.body.innerText.includes('Sofía Navarro');
      document.getElementById('main-view-btn-crm')?.click();
      const sr = document.getElementById('crm-search-input'); sr.value = 'Lopez'; sr.dispatchEvent(new Event('input', { bubbles: true }));
      return { rangeOpen, foundSofia, foundLopez: document.body.innerText.includes('Mariana López') };
    })()`);
    assert(c2.rangeOpen && c2.foundSofia && c2.foundLopez, 'L2 Rango + buscadores Agenda/CRM sin acentos');
    l2.close();
    for (const [tag, url, w, h] of [['L2 Mob', '/admin_l2.html?slug=demo-central', 390, 844], ['L2 Emb', '/admin_l2.html?slug=demo-central&embed=true', 1024, 600]]) {
      const t = await openTab(url, w, h); assert(t.errors.length === 0, `${tag} 0 errores`); t.close();
    }
    const l3 = await openTab('/admin_l3.html?slug=demo-staff', 1280, 800);
    await verifyCommon(l3, 'L3 Desktop');
    const c3 = await l3.evalJs(`(() => {
      [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Rango')?.click();
      const dateInputs = document.querySelectorAll('input[type="date"]').length;
      const si = [...document.querySelectorAll('input[type="text"], input[type="search"]')].find((i) => (i.placeholder || '').toLowerCase().includes('buscar'));
      if (si) { si.value = 'Gaston'; si.dispatchEvent(new Event('input', { bubbles: true })); }
      const foundGaston = document.body.innerText.includes('Gastón Ibarra');
      const navs = [...document.querySelectorAll('.nav-tab[data-tab]')]; navs.forEach((b) => b.click());
      return { dateInputs, foundGaston, tabCount: navs.length };
    })()`);
    assert(c3.dateInputs >= 2 && c3.foundGaston && c3.tabCount >= 7 && l3.errors.length === 0, `L3 Rango (${c3.dateInputs}), Gaston, ${c3.tabCount} tabs (${l3.errors.length} err)`);
    l3.close();
    for (const [tag, url, w, h] of [['L3 Mob', '/admin_l3.html?slug=demo-staff', 390, 844], ['L3 Emb', '/admin_l3.html?slug=demo-staff&embed=true', 1024, 600]]) {
      const t = await openTab(url, w, h); assert(t.errors.length === 0, `${tag} 0 errores`); t.close();
    }
  } finally { chrome.kill(); setTimeout(() => fs.rmSync(tmpDir, { recursive: true, force: true }), 400); }
}

(async () => {
  runStaticAudit();
  await runCdpAudit();
  console.log(`\n========================================\nRESULTADO TASK-069: ${passed} PASSED / ${failed} FAILED\n========================================`);
  process.exit(failed > 0 ? 1 : 0);
})();
