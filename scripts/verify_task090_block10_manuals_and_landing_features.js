// Archivo: scripts/verify_task090_block10_manuals_and_landing_features.js
// Compuerta QA + E2E Bloque 10 [TASK-090]: Manuales L1/L2/L3 y Características Landing

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4190;
const PORT_CDP = 9240;
const BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FILES = [
  'public/js/admin_shared/admin_manual_data_l1.js',
  'public/js/admin_shared/admin_manual_data_l2.js',
  'public/js/admin_shared/admin_manual_data_l3.js',
  'js/components/pricing.js',
  'js/components/stage_value_zone.js',
  'js/showcase_v11/showcase_state.js',
  'js/components/hero_markup.js'
];
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const BAD_WORDS_RE = /\b(baileys|vip)\b/i;

let pass = 0, fail = 0;
const ok = (cond, msg) => {
  if (cond) { pass++; console.log(`  [PASS] ${msg}`); }
  else { fail++; console.error(`  [FAIL] ${msg}`); }
};
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const reqJson = (url, method = 'GET') => new Promise((res, rej) => {
  const req = http.request(url, { method }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); });
  req.on('error', rej); req.end();
});

class Cdp {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((res, rej) => { this.ws.addEventListener('open', res, { once: true }); this.ws.addEventListener('error', rej, { once: true }); });
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params?.response?.url?.endsWith('/favicon.ico') && m.params?.response?.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable');
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(700); }
  async evalJs(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error');
    return r.result?.value;
  }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 10 (<=180L, AST, 0 BAILEYS/VIP, SHA-256) ===');
  for (const rel of FILES) {
    const abs = path.resolve(rel), eng = path.join(ENGINE, rel);
    const txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/).length;
    ok(lines <= 180, `${rel} (${lines}L <= 180L)`);
    let astOk = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { astOk = false; }
    ok(astOk, `AST OK: ${rel}`);
    ok(!BAD_WORDS_RE.test(txt), `Sin Baileys/VIP: ${rel}`);
    if (rel.startsWith('public/')) {
      ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo/emojis Admin: ${rel}`);
    }
    ok(fs.existsSync(eng) && sha(abs) === sha(eng), `Paridad SHA-256: ${rel}`);
  }
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-090'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

    console.log('\n=== 2. VERIFICACIÓN E2E MANUALES L1/L2/L3 ===');
    const keywords = ['cumpleanos', 'celular', 'feriados', 'direccion', 'confirmacion'];
    for (const lvl of ['l1', 'l2', 'l3']) {
      await cdp.goto(`/admin_${lvl}.html`);
      await cdp.evalJs(`localStorage.clear(); sessionStorage.setItem('tucu_admin_auth','1'); location.reload();`);
      await wait(450);
      await cdp.evalJs(`document.querySelector('[data-tab="manual"]')?.click();`);
      await wait(200);
      for (const kw of keywords) {
        const res = await cdp.evalJs(`(() => {
          const inp = document.querySelector('input[id^="manual-search-"]');
          if (!inp) return { ok: false, marks: 0 };
          inp.value = '${kw}';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          const box = document.querySelector('[id^="manual-content-"]');
          const marks = box ? box.querySelectorAll('mark').length : 0;
          return { ok: marks > 0, marks };
        })()`);
        ok(res.ok, `${lvl.toUpperCase()} Manual búsqueda "${kw}" (${res.marks} <mark>)`);
      }
    }

    console.log('\n=== 3. VERIFICACIÓN E2E LANDING PLANES & COMPARATIVA ===');
    await cdp.goto('/');
    await wait(500);
    const landing = await cdp.evalJs(`(() => {
      const precios = document.getElementById('precios')?.innerText || '';
      const stage = document.getElementById('app-stage')?.innerText || '';
      const hero = document.getElementById('app-hero')?.innerText || '';
      const all = precios + ' ' + stage + ' ' + hero;
      return {
        hasL1: precios.includes('Seña configurable') && precios.includes('Feriados Nacionales 2026'),
        hasL2: precios.includes('CRM & Contactos') && precios.includes('Fecha de Cumpleaños') && precios.includes('papelera restaurable'),
        hasL3: precios.includes('Multi-Staff') && precios.includes('sillones, boxes') && precios.includes('Confirmación y Liberación Automática'),
        noBaileys: !/baileys/i.test(all),
        noVip: !/\\bvip\\b/i.test(precios + ' ' + hero)
      };
    })()`);
    ok(landing.hasL1, 'Landing #precios refleja capacidades reales L1');
    ok(landing.hasL2, 'Landing #precios refleja capacidades reales L2 (CRM, Cumpleaños, Papelera)');
    ok(landing.hasL3, 'Landing #precios refleja capacidades reales L3 (Multi-Staff, Boxes, Confirmación 2hs)');
    ok(landing.noBaileys && landing.noVip, 'Landing sin menciones a Baileys ni VIP en planes/hero');
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally {
    chrome.kill('SIGKILL'); preview.kill('SIGKILL');
    await wait(250);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESULTADO BLOQUE 10: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
