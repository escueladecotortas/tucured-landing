// Archivo: scripts/verify_task070_states_deposits_sync.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn, spawnSync } from 'child_process';

const BASE_URL = 'http://localhost:5174';
const ENGINE_ROOT = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9232;
let passed = 0, failed = 0;
const assert = (c, m) => c ? (console.log(`  [PASS] ${m}`), passed++) : (console.error(`  [FAIL] ${m}`), failed++);

const SYNC_FILES = [
  'public/css/admin_unified.css', 'public/admin_l1.html', 'public/admin_l2.html', 'public/admin_l3.html',
  'public/js/admin_shared/admin_shell.js', 'public/js/admin_shared/admin_booking_engine.js', 'public/js/admin_shared/admin_demo_seed.js',
  'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l1/admin_l1_agenda.js', 'public/js/admin_l1/admin_l1_pricing.js',
  'public/js/admin_l1/admin_l1_config.js', 'public/js/admin_l1/admin_l1_auth.js',
  'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_calendar.js', 'public/js/admin_l2/admin_l2_config.js',
  'public/js/admin_l2/admin_l2_crm.js', 'public/js/admin_l2/admin_l2_schedule.js',
  'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js', 'public/js/admin_l3/view_clients.js',
  'public/js/admin_l3/view_resources.js', 'public/js/admin_l3/view_services.js', 'public/js/admin_l3/view_staff.js',
  'public/js/admin_l3/view_system.js', 'public/js/admin_l3/view_telemetry.js'
];

function runStaticAndParityAudit() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA + AST + PARIDAD EXACTA CON tucured-engine ===');
  const emojiRx = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
  const legacyRx = /\b(en_atencion|En Atención|deleteBooking)\b/;
  for (const rel of SYNC_FILES) {
    const srcPath = path.resolve(rel), engPath = path.join(ENGINE_ROOT, rel);
    const srcTxt = fs.readFileSync(srcPath, 'utf8'), lines = srcTxt.split(/\r?\n/);
    assert(lines.length <= 180, `${rel} <= 180L (${lines.length}L)`);
    assert(lines[0].includes('Archivo:'), `${rel} encabezado PEAC`);
    assert(!/\bindigo\b/i.test(srcTxt), `${rel} 0 clases indigo`);
    const ui = lines.filter(l => !['//', '/*', '*'].some(p => l.trim().startsWith(p)) && !l.includes('defaultTpl')).join('\n');
    assert(!emojiRx.test(ui), `${rel} 0 emojis UI`);
    assert(!legacyRx.test(srcTxt), `${rel} libre de En Atención / deleteBooking`);
    assert(fs.existsSync(engPath) && fs.readFileSync(engPath, 'utf8') === srcTxt, `Paridad byte-exacta Blueprint: ${rel}`);
    if (rel.endsWith('.js')) {
      const r1 = spawnSync('node', ['--check', srcPath]), r2 = spawnSync('node', ['--check', engPath]);
      assert(r1.status === 0 && r2.status === 0, `AST node --check OK (landing + engine): ${rel}`);
    }
  }
}

const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const req = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); });
  req.on('error', rej); req.end();
});
class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl); this.id = 1; this.pending = new Map(); this.errors = [];
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params.exceptionDetails.text);
      else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !(m.params.entry.url || '').includes('favicon')) this.errors.push(m.params.entry.text);
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Page.enable'); await this.send('Log.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((r, j) => { this.pending.set(id, { resolve: r, reject: j }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result?.value; }
  close() { this.ws.close(); }
}

async function openTab(q, w = 1280, h = 800) {
  const t = await reqJson(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(BASE_URL + q)}`, 'PUT');
  const cdp = new CdpSession(t.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
  await cdp.send('Page.navigate', { url: BASE_URL + q });
  for (let i = 0; i < 40; i++) { if ((await cdp.evalJs('document.readyState').catch(() => '')) === 'complete') break; await new Promise(r => setTimeout(r, 150)); }
  await new Promise(r => setTimeout(r, 450)); return cdp;
}

const parseNum = (s) => parseInt(String(s || '0').replace(/\D/g, ''), 10) || 0;

async function testFlow(cdp, { tag, pendingClick, kpiId, targetText, showAllClick, extraCheck }) {
  const res = await cdp.evalJs(`(() => {
    localStorage.clear(); location.reload();
  })()`).catch(() => null);
  await new Promise(r => setTimeout(r, 550));
  const out = await cdp.evalJs(`(async () => {
    const wait = (ms = 120) => new Promise(r => setTimeout(r, ms));
    const btnByText = (t) => [...document.querySelectorAll('button')].find(b => b.innerText.includes(t) && b.offsetParent !== null);
    const kpi0 = document.getElementById('${kpiId}')?.innerText || '0';
    ${pendingClick}
    await wait();
    const hasPendingRow = document.body.innerText.includes('${targetText}');
    const creditBtn = btnByText('Acreditar Seña');
    creditBtn?.click();
    await wait();
    const modal = document.getElementById('tucuPaymentModal');
    const radios = modal ? [...modal.querySelectorAll('input[name="tucu-pm"]')].map(i => i.value) : [];
    modal?.querySelector('#pm-confirm')?.click();
    await wait();
    ${showAllClick}
    await wait();
    const kpi1 = document.getElementById('${kpiId}')?.innerText || '0';
    const findCard = () => [...document.querySelectorAll('#bookingsListContainer > article, #calendar-bookings-container > div, #admin-view-root .admin-card')].find(el => el.innerText.includes('${targetText}'));
    const card = findCard();
    const finBtn = card ? [...card.querySelectorAll('button')].find(b => b.innerText.includes('Marcar Finalizado')) : null;
    finBtn?.click();
    await wait();
    const cardAfterFin = findCard();
    const hasFinalizado = !!cardAfterFin && cardAfterFin.innerText.includes('Finalizado');
    const undoBtn = cardAfterFin ? [...cardAfterFin.querySelectorAll('button')].find(b => b.innerText.includes('Deshacer')) : null;
    undoBtn?.click();
    await wait();
    const cardAfterUndo = findCard();
    const restoredConfirm = !!cardAfterUndo && cardAfterUndo.innerText.includes('Confirmado');
    ${extraCheck}
    return { kpi0, kpi1, hasPendingRow, radios, hasFinalizado, restoredConfirm, extra };
  })()`);
  const diffKpi = parseNum(out.kpi1) > parseNum(out.kpi0);
  assert(out.hasPendingRow && out.radios.length >= 2 && diffKpi, `${tag} Pendiente Seña -> Acreditar Seña (KPI ${out.kpi0} -> ${out.kpi1}, medios=${out.radios.length})`);
  assert(out.hasFinalizado && out.restoredConfirm, `${tag} Confirmado -> Finalizado -> Deshacer -> Confirmado`);
  assert(out.extra, `${tag} Config medios de pago dinámicos + Restaurar Demo + 0 En Atención`);
  assert(cdp.errors.length === 0, `${tag} 0 errores consola/runtime (${cdp.errors.join(' | ')})`);
}

async function runCdpAudit() {
  console.log('\n=== 2. AUDITORÍA CHROME HEADLESS CDP E2E (L1, L2, L3 + MOBILE + EMBED) ===');
  const tmpDir = path.resolve('.tmp-cdp-t070'); fs.mkdirSync(tmpDir, { recursive: true });
  const chrome = spawn(CHROME_PATH, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, '--disable-gpu', '--no-sandbox', `--user-data-dir=${tmpDir}`, 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${CDP_PORT}/json/version`); break; } catch { await new Promise(r => setTimeout(r, 250)); } }
    const l1 = await openTab('/admin_l1.html?slug=demo-peluqueria', 1280, 800);
    await testFlow(l1, {
      tag: 'L1 Desktop', kpiId: 'kpi-deposit-total', targetText: 'Sofía Núñez',
      pendingClick: `document.querySelector('[data-sfilter="pendiente"]')?.click();`,
      showAllClick: `document.querySelector('[data-sfilter="todos"]')?.click();`,
      extraCheck: `document.getElementById('tabConfig')?.click(); await wait(); const cb = document.querySelector('#l1-payment-methods-mount [data-pm-method="mercadopago"]'); if (cb) { cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true })); } await wait(); document.getElementById('tabAgenda')?.click(); await wait(); [...document.querySelectorAll('button')].find(b => b.innerText.includes('Nueva Cita'))?.click(); await wait(); const opts = [...document.querySelectorAll('#nb-method option')].map(o => o.value); document.getElementById('btnCloseModal')?.click(); document.getElementById('tabConfig')?.click(); await wait(); document.getElementById('btn-reset-demo-l1')?.click(); await wait(); const extra = !opts.includes('Mercado Pago') && !document.body.innerText.includes('En Atención');`
    });
    l1.close();
    const l2 = await openTab('/admin_l2.html?slug=demo-central', 1280, 800);
    await testFlow(l2, {
      tag: 'L2 Desktop', kpiId: 'metric-deposit-total', targetText: 'Sofía Navarro',
      pendingClick: `document.querySelector('#l2-status-filters [data-st="PENDING_DEPOSIT"]')?.click();`,
      showAllClick: `document.querySelector('#l2-status-filters [data-st="ALL"]')?.click();`,
      extraCheck: `document.getElementById('main-view-btn-config')?.click(); await wait(); const resetOk = !!document.getElementById('btn-reset-demo-l2'); const extra = resetOk && !document.body.innerText.includes('En Atención');`
    });
    l2.close();
    const l3 = await openTab('/admin_l3.html?slug=demo-staff', 1280, 800);
    await testFlow(l3, {
      tag: 'L3 Desktop', kpiId: 'l3-kpi-deposit-total', targetText: 'Sofía Núñez',
      pendingClick: `[...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Pendiente Seña')?.click();`,
      showAllClick: `[...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Todos')?.click();`,
      extraCheck: `document.querySelector('.nav-tab[data-tab="system"]')?.click(); await wait(); const extra = !!document.getElementById('btn-reset-demo-l3') && !document.body.innerText.includes('En Atención');`
    });
    l3.close();
    for (const [tag, url, w, h] of [['L1 Mob', '/admin_l1.html?slug=demo-peluqueria', 390, 844], ['L1 Emb', '/admin_l1.html?slug=demo-peluqueria&embed=true', 1024, 600], ['L2 Mob', '/admin_l2.html?slug=demo-central', 390, 844], ['L2 Emb', '/admin_l2.html?slug=demo-central&embed=true', 1024, 600], ['L3 Mob', '/admin_l3.html?slug=demo-staff', 390, 844], ['L3 Emb', '/admin_l3.html?slug=demo-staff&embed=true', 1024, 600]]) {
      const t = await openTab(url, w, h); assert(t.errors.length === 0, `${tag} 0 errores`); t.close();
    }
  } finally { chrome.kill(); setTimeout(() => fs.rmSync(tmpDir, { recursive: true, force: true }), 400); }
}

(async () => {
  runStaticAndParityAudit();
  await runCdpAudit();
  console.log(`\n========================================\nRESULTADO TASK-070: ${passed} PASSED / ${failed} FAILED\n========================================`);
  process.exit(failed > 0 ? 1 : 0);
})();

