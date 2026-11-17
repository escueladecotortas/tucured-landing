// Archivo: scripts/verify_task067_checkout_pricing.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5186, PORT_CDP = 9247, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TOUCHED = [
  'js/components/faq_accordion.js', 'js/components/funnel.js',
  'js/components/funnel_checkout_markup.js', 'js/components/funnel_data.js',
  'js/components/funnel_markup.js', 'js/components/hero_markup.js',
  'js/components/navbar.js', 'js/components/pricing.js',
  'js/components/stage_value_zone.js', 'js/showcase_v11/showcase_benefits.js',
  'js/utils/whatsapp_link.js'
];

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); });
  q.on('error', rej); q.end();
});

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
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(100); const st = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (st && st.h.startsWith(BASE) && st.r === 'complete') break; } await wait(400); }
  close() { this.ws.close(); }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA TASK-067 (AST, <=180L, CERO LEGACY, SHA-256) ===');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L)`);
    ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    ok(!/1\.000|tucured\.mp|mpago\.la\/pos\/tucured/i.test(txt), `Sin precios/alias/links legacy: ${rel}`);
  }
  const sbSrc = path.resolve('js/showcase_v11/showcase_benefits.js');
  const sbEng = path.join(ENGINE, 'public/js/showcase_v11/showcase_benefits.js');
  ok(fs.existsSync(sbEng) && sha256(sbSrc) === sha256(sbEng), 'Paridad SHA-256 showcase_benefits.js con tucured-engine');
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-067'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await cdp.goto('/index.html');

    console.log('\n=== 2. VERIFICACIÓN E2E MÓVIL (375x667) PRECIOS & CHECKOUT ===');
    const dom = await cdp.evalJs(`(() => {
      const body = document.body.innerText || '';
      return {
        hasLegacy: /1\\.000|tucured\\.mp|mpago\\.la\\/pos\\/tucured/i.test(body),
        has4999: body.includes('$4.999'),
        has14900: body.includes('$14.900'),
        has24900: body.includes('$24.900'),
        has34900: body.includes('$34.900'),
        aliasVal: document.getElementById('checkout-alias-input')?.value || '',
        mpHref: document.getElementById('btn-mp-direct-pay')?.getAttribute('href') || '',
        submitTxt: document.getElementById('funnel-submit-btn')?.innerText || ''
      };
    })()`);
    ok(!dom.hasLegacy, 'DOM móvil 375x667 sin $1.000, tucured.mp ni mpago.la/pos/tucured');
    ok(dom.has4999 && dom.has14900 && dom.has24900 && dom.has34900, 'Precios oficiales ($4.999, $14.900, $24.900, $34.900) visibles en DOM');
    ok(dom.aliasVal === 'tucured', `Alias en checkout exactamente "tucured" (actual: "${dom.aliasVal}")`);
    ok(dom.mpHref === 'https://mpago.la/2CTGHu2', `Botón pago electrónico apunta a "https://mpago.la/2CTGHu2" (actual: "${dom.mpHref}")`);
    ok(dom.submitTxt.includes('$4.999'), `Botón submit muestra $4.999 (actual: "${dom.submitTxt.trim()}")`);

    await cdp.evalJs(`(async () => {
      document.getElementById('fn-nombre').value = 'Barbería Norte';
      document.getElementById('btn-goto-step-2').click();
      document.getElementById('btn-goto-step-3').click();
      document.getElementById('fn-titular').value = 'Leo Test';
      document.getElementById('fn-phone').value = '3815554321';
      document.getElementById('btn-goto-step-4').click();
      document.getElementById('btn-copy-alias').click();
    })()`);
    await wait(250);
    const step4 = await cdp.evalJs(`({
      visible: !document.getElementById('funnel-step-4')?.classList.contains('hidden'),
      alias: document.getElementById('checkout-alias-input')?.value,
      href: document.getElementById('btn-mp-direct-pay')?.href
    })`);
    ok(step4.visible && step4.alias === 'tucured' && step4.href === 'https://mpago.la/2CTGHu2', 'Flujo Wizard Paso 1->4 en 375x667 operativo con alias y link MP real');
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpFails.length})`);
    cdp.close();
  } finally {
    try { chrome.kill('SIGKILL'); } catch {}
    try { preview.kill('SIGKILL'); } catch {}
    await wait(300);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }

  console.log('\n--- HASHES SHA-256 ARCHIVOS MODIFICADOS ---');
  for (const rel of TOUCHED) console.log(`SHA256 | ${sha256(path.resolve(rel))} | ${rel}`);
  console.log(`\nRESULTADO TASK-067: ${pass}/${pass + fail} PASS | FAIL=${fail}\n`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
