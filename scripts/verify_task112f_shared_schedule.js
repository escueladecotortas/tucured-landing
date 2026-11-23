// Archivo: scripts/verify_task112f_shared_schedule.js
// Compuerta QA + E2E [TASK-112F]: Módulo Compartido de Horarios Semanales L1/L2/L3 (< 160L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4220, PORT_CDP = 9275, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN_RX = /#800000|#991B1B|#A82222|128,\s*0,\s*0|\bfont-mono\b/i;

const SYNC_FILES = [
  'public/js/admin_shared/admin_weekly_schedule.js', 'public/admin_l1.html', 'public/js/admin_l1/admin_l1_config.js',
  'public/admin_l2.html', 'public/js/admin_l2/admin_l2_schedule.js', 'public/admin_l3.html', 'public/js/admin_l3/view_system.js'
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA + PARIDAD SHA-256 (7 ARCHIVOS + QA) ===');
  const all = [...SYNC_FILES, 'scripts/verify_task112f_shared_schedule.js'];
  const badLen = [], badAst = [], badEmoji = [], badStyle = [];
  for (const rel of all) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    const maxL = rel.endsWith('admin_weekly_schedule.js') ? 185 : (rel === 'public/admin_l3.html' ? 95 : (rel.startsWith('scripts/') ? 160 : 200));
    if (lines.length >= maxL || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L/${maxL}`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
    if (!rel.startsWith('scripts/') && EMOJI_RX.test(txt)) badEmoji.push(rel);
    if (!rel.startsWith('scripts/') && FORBIDDEN_RX.test(txt)) badStyle.push(rel);
  }
  ok(badLen.length === 0, `Todos bajo límite (<95/<160/<185/<200L) y header Archivo OK (fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `Sintaxis AST node --check OK (fallos=${badAst.join(',') || '0'})`);
  ok(badEmoji.length === 0 && badStyle.length === 0, `0 emojis y 0 #800000/font-mono (${badEmoji.concat(badStyle).join(',') || '0'})`);
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function checkViewportBounds(cdp, lvl, openJs, vp) {
  await cdp.goto(`/admin_${lvl}.html`); await cdp.evalJs(`${openJs}; document.getElementById('tab-btn-agenda')?.click();`); await wait(240);
  const res = await cdp.evalJs(`(() => {
    const monBtn = document.querySelector('[data-sched-action="toggleSplit"][data-day="1"]');
    if (monBtn && monBtn.textContent.trim() === 'Horario Corrido') monBtn.click();
    const card = document.querySelector('[data-weekly-schedule-card]'), hol = document.querySelector('[data-holidays-card]');
    const cardR = card?.getBoundingClientRect(), holR = hol?.getBoundingClientRect();
    const inputs = [...(card?.querySelectorAll('input[type="time"]') || [])], clipped = [];
    for (const inp of inputs) {
      const r = inp.getBoundingClientRect(), dayR = inp.closest('[data-schedule-day]')?.getBoundingClientRect();
      if (r.width <= 0 || r.left < cardR.left - 1 || r.right > cardR.right + 1 || (dayR && r.right > dayR.right + 1)) {
        clipped.push(inp.dataset.day + ':' + inp.dataset.field + '(' + Math.round(r.right) + '>' + Math.round(cardR.right) + ')');
      }
    }
    return { hasCard: Boolean(card), aboveHol: Boolean(cardR && holR && cardR.bottom <= holR.top + 2), inputs: inputs.length, clipped, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  })()`);
  ok(res.hasCard && res.aboveHol, `${vp} [${lvl}] [data-weekly-schedule-card] arriba de Feriados 2026`);
  ok(res.inputs >= 10 && res.clipped.length === 0 && !res.ov, `${vp} [${lvl}] 0 recorte en ${res.inputs} inputs time y 0 overflow-x (${res.clipped.join(',') || 'OK'})`);
}

async function checkPersistAndClone(cdp, lvl, openJs, testHour) {
  await cdp.goto(`/admin_${lvl}.html`); await cdp.evalJs(`${openJs}; document.getElementById('tab-btn-agenda')?.click();`); await wait(200);
  const cloned = await cdp.evalJs(`(() => {
    const inp = document.querySelector('[data-sched-action="updateHour"][data-day="1"][data-field="open"]');
    if (!inp) return [];
    inp.value = '${testHour}'; inp.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('[data-clone-lun-vie]')?.click();
    return [1, 2, 3, 4, 5].map(d => document.querySelector('[data-sched-action="updateHour"][data-day="' + d + '"][data-field="open"]')?.value || '');
  })()`);
  ok(cloned.length === 5 && cloned.every(v => v === testHour), `Persist [${lvl}] Clonar Lun a Vie aplica ${testHour} en Lun-Vie`);
  await cdp.goto(`/admin_${lvl}.html`); await cdp.evalJs(`${openJs}; document.getElementById('tab-btn-agenda')?.click();`); await wait(220);
  const reloaded = await cdp.evalJs(`[1, 2, 3, 4, 5].map(d => document.querySelector('[data-sched-action="updateHour"][data-day="' + d + '"][data-field="open"]')?.value || '')`);
  ok(reloaded.length === 5 && reloaded.every(v => v === testHour), `Persist [${lvl}] horario ${testHour} persiste en Lun-Vie tras recargar`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-112f'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    const lvls = [['l1', "adminL1Core.switchView('configuracion')", '08:15'], ['l2', "adminL2Core.switchMainView('config')", '08:30'], ['l3', "AdminL3Core.switchTab('system')", '08:45']];
    for (const [vp, w, h, mob] of [['Mobile 375', 375, 667, true], ['Showroom 600', 600, 760, false], ['Desktop 1280', 1280, 800, false]]) {
      console.log(`\n=== 2. E2E ${vp} (CERO RECORTE DE INPUTS + ORDEN EN TAB 2) ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
      for (const [lvl, js] of lvls) await checkViewportBounds(cdp, lvl, js, vp);
    }
    console.log('\n=== 3. E2E CLONAR LUN A VIE + PERSISTENCIA TRAS RECARGA (L1/L2/L3) ===');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    for (const [lvl, js, hr] of lvls) await checkPersistAndClone(cdp, lvl, js, hr);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-112F]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
