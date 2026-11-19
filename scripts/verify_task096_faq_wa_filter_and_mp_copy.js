// Archivo: scripts/verify_task096_faq_wa_filter_and_mp_copy.js
// Compuerta QA + E2E [TASK-096]: Pregunta 2 sin .ics, Filtro WhatsApp FAQ & Copy Mercado Pago

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4196, PORT_CDP = 9251, BASE = `http://127.0.0.1:${PORT_APP}`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FILES = [
  'js/components/faq_accordion.js',
  'js/components/funnel_checkout_markup.js',
  'scripts/verify_task096_faq_wa_filter_and_mp_copy.js'
];
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); });
  q.on('error', rej); q.end();
});

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params?.response?.url?.endsWith('/favicon.ico') && m.params?.response?.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(650); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-096]: <=180L, AST & CERO .ics EN FAQ ===');
  for (const rel of FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L + encabezado)`);
    let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; }
    ok(ast, `AST OK: ${rel}`);
  }
  const faq = fs.readFileSync(path.resolve('js/components/faq_accordion.js'), 'utf8');
  ok(!/\.ics\b/i.test(faq) && !/Cero Fricci[oó]n|24\/7/i.test(faq), 'faq_accordion.js sin menciones a .ics ni clichés');
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-096'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();

    console.log('\n=== 2. E2E MÓVIL (375x667) & DESKTOP (1280x800): FAQ + FILTRO WA + PASO 4 MP ===');
    for (const vp of [{ n: 'Móvil 375x667', w: 375, h: 667, mob: true }, { n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await cdp.goto('/');
      for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-faq-wa-send') && document.getElementById('funnel-step-4'))`)) break; await wait(150); }
      const res = await cdp.evalJs(`(() => {
        document.querySelectorAll('#faq details').forEach(d => { d.open = true; });
        const q2 = document.querySelectorAll('#faq details')[1]?.innerText || '';
        const faqEl = document.getElementById('faq'), qInp = document.getElementById('faq-wa-query');
        const sendBtn = document.getElementById('btn-faq-wa-send'), errEl = document.getElementById('faq-wa-error');
        const opened = [];
        window.open = (url, target, feat) => { opened.push({ url, target, feat }); return null; };
        qInp.value = '';
        sendBtn.click();
        const errShown = !errEl.classList.contains('hidden');
        const errText = errEl.innerText.trim();
        const focused = document.activeElement === qInp;
        const emptyCalls = opened.length;
        const msg = 'Tengo 3 sillones de barbería';
        qInp.value = msg;
        qInp.dispatchEvent(new Event('input', { bubbles: true }));
        const errClearedOnInput = errEl.classList.contains('hidden');
        sendBtn.click();
        const expectedUrl = 'https://wa.me/5493814132154?text=' + encodeURIComponent('Hola Tucu Red, tengo una consulta sobre mi comercio: ' + msg);
        const s4Html = document.getElementById('funnel-step-4')?.innerHTML || '';
        return {
          q2Ok: q2.includes('botón para guardar el turno en el calendario de tu celular (compatible con Android y iPhone) y enlace para reprogramar o cancelar.') && !/\.ics/i.test(q2),
          titleOk: faqEl?.innerText.includes('¿Tenés una consulta puntual sobre tu comercio?') || false,
          emptyBlocked: errShown && errText === 'Escribí tu consulta arriba para enviarla por WhatsApp' && focused && emptyCalls === 0,
          errClearedOnInput,
          waOpenedOk: opened.length === 1 && opened[0].url === expectedUrl && opened[0].target === '_blank' && (opened[0].feat || '').includes('noopener'),
          mpCopyOk: s4Html.includes('Abre la app o web oficial de Mercado Pago para abonar al instante; al finalizar, volvé acá para confirmar tu alta.'),
          s4NoSvg: document.querySelectorAll('#funnel-step-4 svg').length === 0,
          overflow: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`);
      ok(res.q2Ok, `${vp.n}: Pregunta 2 sin .ics y con texto Android/iPhone`);
      ok(res.titleOk && res.emptyBlocked && res.errClearedOnInput, `${vp.n}: Filtro WhatsApp valida vacío con aviso suave y foco`);
      ok(res.waOpenedOk, `${vp.n}: Filtro WhatsApp abre wa.me/5493814132154 con texto codificado en _blank`);
      ok(res.mpCopyOk && res.s4NoSvg && !res.overflow, `${vp.n}: Copy Mercado Pago móvil actualizado, 0 SVG en Paso 4 y 0 overflow`);
    }

    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally {
    chrome.kill('SIGKILL'); preview.kill('SIGKILL');
    await wait(250);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESULTADO FINAL [TASK-096]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
