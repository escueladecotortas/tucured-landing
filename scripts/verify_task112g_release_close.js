// Archivo: scripts/verify_task112g_release_close.js
// Compuerta QA + E2E [TASK-112G]: Bloqueos L3, Limpieza Showroom, Docs & Dist (< 150L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4221, PORT_CDP = 9276, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN_RX = /#800000|#991B1B|#A82222|128,\s*0,\s*0|\bfont-mono\b/i;

const SYNC_FILES = ['public/js/admin_shared/admin_blocks_ui.js', 'public/admin_l3.html', 'public/js/admin_l3/view_system.js'];

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
  async goto(u) {
    await this.send('Page.navigate', { url: BASE + u });
    for (let i = 0; i < 40; i++) {
      await wait(150);
      try { if (await this.evalJs(`document.readyState==='complete' && (!location.pathname.includes('admin_l3') || Boolean(window.AdminL3Core))`)) break; } catch {}
    }
    await wait(150);
  }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStaticAndDist() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, DOCS, PARIDAD SHA-256 & DIST ===');
  const all = [...SYNC_FILES, 'js/showcase_v11/showcase_admin_ui.js', '.agent/audit/audit_features_l1_l2_l3.md', 'scripts/verify_task112g_release_close.js'];
  const badLen = [], badAst = [], badStyle = [];
  for (const rel of all) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    const maxL = rel.endsWith('admin_blocks_ui.js') ? 160 : (rel.endsWith('view_system.js') ? 165 : (rel.endsWith('admin_l3.html') ? 95 : (rel.startsWith('scripts/') ? 150 : 200)));
    if (lines.length >= maxL || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L/${maxL}`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
    if (!rel.startsWith('scripts/') && !rel.endsWith('.md') && (EMOJI_RX.test(txt) || FORBIDDEN_RX.test(txt))) badStyle.push(rel);
  }
  ok(badLen.length === 0, `Todos bajo límite (<95/<150/<160/<165/<200L) y header Archivo OK (fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0 && badStyle.length === 0, `AST OK, 0 emojis y 0 #800000/font-mono (${badAst.concat(badStyle).join(',') || '0'})`);
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
  ok(!fs.existsSync('.agent/specs/turneros_v15_matrix.md') && /TASK-112G/.test(fs.readFileSync('.agent/audit/audit_features_l1_l2_l3.md', 'utf8')), 'Specs turneros_v15_matrix.md consolidada y eliminada');
  const distHtml = fs.readFileSync('dist/index.html', 'utf8');
  const distJs = fs.readdirSync('dist/assets').filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join('dist/assets', f), 'utf8')).join('\n');
  ok(!/Módulos enchufables a medida|Mercado Pago/i.test(distHtml) && !/Módulos enchufables a medida|cobro online con Mercado Pago/i.test(distJs) && !fs.existsSync('dist/temp'), 'dist/index.html y bundle JS limpios sin copy de módulos futuros ni temp/');
}

async function checkL3Blocks(cdp, vp) {
  await cdp.goto('/admin_l3.html'); await cdp.evalJs("AdminL3Core.switchTab('system'); document.getElementById('tab-btn-agenda')?.click();"); await wait(260);
  const res = await cdp.evalJs(`(() => {
    const hol = document.querySelector('[data-holidays-card]'), c1 = document.querySelector('[data-blocks-service-card="l3"]'), c2 = document.querySelector('[data-blocks-date-card="l3"]');
    if (!hol || !c1 || !c2) return { ok: false };
    const hR = hol.getBoundingClientRect(), r1 = c1.getBoundingClientRect(), r2 = c2.getBoundingClientRect(), lbls = [...c1.querySelectorAll('label'), ...c2.querySelectorAll('label')].map(l => l.textContent.trim());
    const clipped = [];
    for (const [card, cr] of [[c1, r1], [c2, r2]]) {
      for (const el of card.querySelectorAll('input, select, button')) {
        const er = el.getBoundingClientRect();
        if (er.width <= 0 || er.left < cr.left - 1 || er.right > cr.right + 1) clipped.push(el.id || el.tagName);
      }
    }
    return { ok: true, sep: r1.bottom < r2.top - 4 && hR.bottom <= r1.top + 2, lbls, clipped, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  })()`);
  ok(res.ok && res.sep && ['Prestación', 'Fecha', 'Desde', 'Hasta', 'Motivo'].every(l => res.lbls.includes(l)), `${vp} [l3] 2 tarjetas Bloqueos separadas con etiquetas limpias`);
  ok(res.clipped.length === 0 && !res.ov, `${vp} [l3] 0 recorte en Bloqueos y 0 overflow-x (${res.clipped.join(',') || 'OK'})`);
}

async function checkLandingClean(cdp, vp) {
  await cdp.goto('/'); await wait(350);
  const chk = await cdp.evalJs(`(() => {
    const lvls = ['l1', 'l2', 'l3'], dirty = [];
    for (const id of lvls) {
      document.getElementById('btn-showroom-level-' + id)?.click();
      const txt = document.getElementById('showroom-admin')?.innerText || '';
      if (/Módulos enchufables a medida|Mercado Pago/i.test(txt)) dirty.push(id);
    }
    return { dirty, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  })()`);
  ok(chk.dirty.length === 0 && !chk.ov, `${vp} [/] Showroom Admin sin "Módulos enchufables"/"Mercado Pago" (3 planes) y 0 overflow-x`);
}

async function main() {
  runStaticAndDist();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-112g'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const [vp, w, h, mob] of [['Mobile 375', 375, 667, true], ['Showroom 600', 600, 760, false], ['Desktop 1280', 1280, 800, false]]) {
      console.log(`\n=== 2. E2E ${vp} (BLOQUEOS L3 + SHOWROOM LIMPIO) ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
      await checkL3Blocks(cdp, vp); await checkLandingClean(cdp, vp);
    }
    await cdp.goto('/admin_l3.html');
    const fnOk = await cdp.evalJs(`(() => {
      AdminL3Core.switchTab('system'); document.getElementById('tab-btn-agenda')?.click();
      const tom = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      document.getElementById('sb-date').value = tom; document.getElementById('btn-add-service-block')?.click();
      const sCount = document.querySelectorAll('#l3-blocks-list [data-blocks-action="deleteServiceBlock"]').length;
      document.getElementById('new-hol-date').value = tom; document.getElementById('new-hol-desc').value = 'Prueba QA';
      document.getElementById('btn-add-date-block')?.click();
      const dCount = document.querySelectorAll('#l3-date-blocks-list [data-blocks-action="deleteDateBlock"]').length;
      return sCount >= 1 && dCount >= 1;
    })()`);
    ok(fnOk, 'Desktop [l3] alta funcional de bloqueo por prestación y cierre por fecha OK');
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-112G]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
