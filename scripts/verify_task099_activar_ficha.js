// Archivo: scripts/verify_task099_activar_ficha.js
// Compuerta QA + E2E [TASK-099]: Ficha Rápida activar.html, Prefill URL, Dinámicos, Validación & Wizard Link

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4199, PORT_CDP = 9254, BASE = `http://127.0.0.1:${PORT_APP}`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FILES = [
  'public/activar.html', 'public/js/activar/activar_data.js', 'public/js/activar/activar_markup.js',
  'public/js/activar/activar_app.js', 'js/utils/whatsapp_link.js', 'js/components/funnel_checkout_markup.js',
  'js/components/funnel.js', 'scripts/verify_task099_activar_ficha.js'
];
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
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
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params?.response?.url?.endsWith('/favicon.ico') && m.params?.response?.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(700); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-099]: <=180L, AST & NETLIFY FORMS ===');
  for (const rel of FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
  }
  const distAct = fs.readFileSync(path.resolve('dist/activar.html'), 'utf8');
  const reqFields = ['name="ficha-activacion-tucured"', 'method="POST"', 'data-netlify="true"', 'name="form-name" value="ficha-activacion-tucured"', 'name="comercio"', 'name="servicios_detalle"', 'name="whatsapp_local"', 'name="profesionales_detalle"'];
  for (const f of reqFields) ok(distAct.includes(f), `dist/activar.html incluye ${f}`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-099'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();

    for (const vp of [{ n: 'Móvil 375x667', w: 375, h: 667, mob: true }, { n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }]) {
      console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await cdp.goto('/activar.html?comercio=Estudio%20Norte&rubro=servicios&plan=l3&titular=Sof%C3%ADa%20Mendoza');
      for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('activar-live-form'))`)) break; await wait(150); }
      const act = await cdp.evalJs(`(async () => {
        const preOk = document.getElementById('act-comercio').value === 'Estudio Norte' && document.getElementById('act-rubro').value === 'servicios' && document.getElementById('act-plan').value === 'l3' && document.getElementById('act-titular').value === 'Sofía Mendoza' && !document.getElementById('act-l3-box').classList.contains('hidden');
        document.getElementById('act-plan').value = 'l2'; document.getElementById('act-plan').dispatchEvent(new Event('change'));
        const l2Ok = !document.getElementById('act-l2-box').classList.contains('hidden') && document.getElementById('act-l3-box').classList.contains('hidden');
        document.getElementById('act-plan').value = 'l3'; document.getElementById('act-plan').dispatchEvent(new Event('change'));
        document.getElementById('btn-add-service').click();
        const srvAfterAdd = document.querySelectorAll('.act-service-row').length;
        document.querySelectorAll('.btn-del-srv')[1].click();
        const srvAfterDel = document.querySelectorAll('.act-service-row').length;
        document.querySelectorAll('.btn-del-srv')[0].click();
        const srvMinOne = document.querySelectorAll('.act-service-row').length;
        document.querySelector('input[name="modalidad_horario"][value="partido"]').click();
        const tardeShow = !document.getElementById('act-tarde-wrap').classList.contains('hidden');
        document.querySelector('input[name="modalidad_horario"][value="corrido"]').click();
        const tardeHide = document.getElementById('act-tarde-wrap').classList.contains('hidden');
        document.getElementById('btn-activar-submit').click();
        const errBlock = !document.getElementById('activar-error').classList.contains('hidden');
        document.getElementById('act-direccion').value = 'Laprida 310'; document.getElementById('act-pin').value = '4820';
        document.querySelector('.act-srv-name').value = 'Asesoría'; document.querySelector('.act-srv-price').value = '22000';
        document.getElementById('act-alias').value = 'estudio.norte.mp'; document.getElementById('act-whatsapp').value = '3815554321';
        document.querySelector('.act-st-name').value = 'Dr. Mariano Paz';
        document.getElementById('btn-activar-submit').click();
        return { preOk, l2Ok, srvAfterAdd, srvAfterDel, srvMinOne, tardeShow, tardeHide, errBlock, overflow: document.documentElement.scrollWidth > window.innerWidth };
      })()`);
      await wait(250);
      const succAct = await cdp.evalJs(`({ vis: !document.getElementById('activar-success-root').classList.contains('hidden'), waHref: document.getElementById('btn-activar-wa-confirm')?.href || '', waTxt: document.getElementById('btn-activar-wa-confirm')?.innerText || '' })`);
      ok(act.preOk && act.l2Ok, `${vp.n}: Prefill URL + bloques condicionales L2/L3`);
      ok(act.srvAfterAdd === 2 && act.srvAfterDel === 1 && act.srvMinOne === 1, `${vp.n}: Alta/baja servicios con mínimo 1`);
      ok(act.tardeShow && act.tardeHide && act.errBlock && !act.overflow, `${vp.n}: Horario partido dinámico, validación inline y 0 overflow`);
      ok(succAct.vis && succAct.waHref.startsWith('https://wa.me/5493814132154') && succAct.waTxt.includes('Avisar por WhatsApp que completé mi ficha'), `${vp.n}: Pantalla éxito activar.html con CTA WhatsApp`);

      await cdp.goto('/');
      for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('fn-nombre'))`)) break; await wait(150); }
      const wizLink = await cdp.evalJs(`(() => {
        sessionStorage.clear();
        document.getElementById('fn-nombre').value = 'Estudio Norte'; document.getElementById('btn-goto-step-2').click();
        document.getElementById('btn-goto-step-3').click();
        document.getElementById('fn-first-name').value = 'Sofía'; document.getElementById('fn-last-name').value = 'Mendoza';
        document.getElementById('fn-email').value = 'sofia@norte.com'; document.getElementById('fn-phone').value = '3815554321';
        document.getElementById('btn-goto-step-4').click(); document.getElementById('funnel-submit-btn').click();
        return { actLink: document.getElementById('success-activar-link')?.href || '', waLink: decodeURIComponent(document.getElementById('success-wa-btn')?.href || '') };
      })()`);
      ok(wizLink.actLink.includes('/activar.html') && wizLink.actLink.includes('Estudio+Norte') && wizLink.waLink.includes('activar.html'), `${vp.n}: Wizard final enlaza a activar.html con datos prellenados`);
    }
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-099]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
