// Archivo: scripts/verify_task092_wizard_and_landing_alignment.js
// Compuerta QA + E2E [TASK-092]: Wizard de Alta 6 Rubros, Alineación Landing & Paridad SHA-256

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4192;
const PORT_CDP = 9246;
const BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const FILES = [
  'index.html', 'js/components/hero_markup.js', 'js/components/stage_rubros_zone.js',
  'js/components/stage_value_zone.js', 'js/components/features.js', 'js/components/pricing.js',
  'js/components/faq_accordion.js', 'js/components/funnel_data.js', 'js/components/funnel_markup.js',
  'js/components/funnel_checkout_markup.js', 'js/components/funnel.js', 'js/utils/whatsapp_link.js',
  'js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_benefits.js'
];
const ENGINE_SYNC = [
  ['js/components/hero_markup.js', 'js/components/hero_markup.js'],
  ['js/components/pricing.js', 'js/components/pricing.js'],
  ['js/components/stage_value_zone.js', 'js/components/stage_value_zone.js'],
  ['js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_state.js'],
  ['js/showcase_v11/showcase_state.js', 'public/js/showcase_v11/showcase_state.js'],
  ['js/showcase_v11/showcase_benefits.js', 'public/js/showcase_v11/showcase_benefits.js']
];

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
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
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params?.response?.url?.endsWith('/favicon.ico') && m.params?.response?.status >= 400) {
        this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
      }
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(700); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-092]: <=180L, AST, CERO 24/7, PARIDAD SHA-256 ===');
  for (const rel of FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/).length;
    ok(lines <= 180, `${rel} (${lines}L <= 180L)`);
    if (rel.endsWith('.js')) {
      let astOk = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { astOk = false; }
      ok(astOk, `AST OK: ${rel}`);
    }
    ok(!/24\/7/.test(txt), `Sin menciones "24/7": ${rel}`);
  }
  const idx = fs.readFileSync(path.resolve('index.html'), 'utf8');
  for (const f of ['rubro', 'plan', 'horario', 'nombre', 'ciudad', 'titular', 'email', 'whatsapp', 'material_pdf']) {
    ok(idx.includes(`name="${f}"`), `Netlify <form hidden> incluye campo "${f}"`);
  }
  for (const [srcRel, engRel] of ENGINE_SYNC) {
    const a = path.resolve(srcRel), b = path.join(ENGINE, engRel);
    ok(fs.existsSync(b) && sha(a) === sha(b), `Paridad SHA-256: ${srcRel} === engine/${engRel}`);
  }
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-092'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();

    console.log('\n=== 2. VERIFICACIÓN E2E DESKTOP (1280x800) & MÓVIL (375x667) ===');
    for (const vp of [{ n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }, { n: 'Móvil 375x667', w: 375, h: 667, mob: true }]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await cdp.goto('/');
      for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('funnel-rubros-grid') && document.getElementById('certezas'))`)) break; await wait(150); }
      const dom = await cdp.evalJs(`(() => ({
        showroomRubros: document.querySelectorAll('#stage-rubros-container button[onclick*="selectRubro"]').length,
        funnelRubros: [...document.querySelectorAll('[data-f-rubro]')].map(b => b.dataset.fRubro),
        certezasCount: document.querySelectorAll('#certezas h3').length,
        faqCount: document.querySelectorAll('#faq details').length,
        faq4Text: document.querySelectorAll('#faq details')[3]?.innerText || '',
        has247: document.body.innerText.includes('24/7'),
        overflow: document.documentElement.scrollWidth > window.innerWidth
      }))()`);
      ok(dom.showroomRubros === 6, `${vp.n}: Showroom exhibe los 6 rubros canónicos`);
      ok(dom.funnelRubros.length === 6 && dom.funnelRubros.includes('servicios') && !dom.funnelRubros.includes('hogar'), `${vp.n}: Wizard exhibe 6 rubros reales`);
      ok(dom.certezasCount === 6 && dom.faqCount === 7, `${vp.n}: 6 tarjetas #certezas y 7 FAQs`);
      ok(!/link de Mercado Pago/i.test(dom.faq4Text) && !dom.has247 && !dom.overflow, `${vp.n}: FAQ 4 alineada, sin 24/7 y 0 overflow`);
    }

    console.log('\n=== 3. FLUJO WIZARD COMPLETO (EMAIL VALIDACIÓN + MP + ALIAS + LINKS REALES) ===');
    await cdp.evalJs(`(() => { sessionStorage.clear(); localStorage.clear(); window.ShowcaseCore.selectRubro('servicios'); })()`);
    await wait(150);
    const stepTests = await cdp.evalJs(`(async () => {
      document.getElementById('btn-goto-step-2').click();
      const err1 = !document.getElementById('funnel-step1-error').classList.contains('hidden');
      document.querySelector('[data-f-rubro="servicios"]').click();
      document.getElementById('fn-nombre').value = 'Estudio Norte';
      document.getElementById('btn-goto-step-2').click();
      document.querySelector('[data-f-level="l1"]').click();
      document.getElementById('btn-goto-step-3').click();
      document.getElementById('fn-titular').value = 'Jonas Admin';
      document.getElementById('fn-email').value = 'correo-invalido';
      document.getElementById('fn-phone').value = '3815554321';
      document.getElementById('btn-goto-step-4').click();
      const blockedEmail = !document.getElementById('funnel-step3-error').classList.contains('hidden') && !document.getElementById('funnel-step-4').classList.contains('hidden') === false;
      document.getElementById('fn-email').value = 'jonas@estudionorte.com';
      document.getElementById('btn-goto-step-4').click();
      const step4Visible = !document.getElementById('funnel-step-4').classList.contains('hidden');
      const aliasVal = document.getElementById('checkout-alias-input')?.value;
      const mpHref = document.getElementById('btn-mp-direct-pay')?.getAttribute('href');
      const hasFakeQr = document.querySelectorAll('#funnel-step-4 svg').length > 0;
      document.getElementById('btn-copy-alias').click();
      document.getElementById('funnel-submit-btn').click();
      return { err1, blockedEmail, step4Visible, aliasVal, mpHref, hasFakeQr };
    })()`);
    await wait(500);
    const links = await cdp.evalJs(`(() => ({
      successVisible: !document.getElementById('funnel-success-card')?.classList.contains('hidden'),
      turnero: document.getElementById('success-turnero-link')?.getAttribute('href') || '',
      admin: document.getElementById('success-admin-link')?.getAttribute('href') || ''
    }))()`);

    ok(stepTests.err1 && stepTests.blockedEmail && stepTests.step4Visible, 'Validación inline Paso 1 y Paso 3 (incl. email requerido) verificada');
    ok(stepTests.aliasVal === 'tucured' && stepTests.mpHref === 'https://mpago.la/2CTGHu2' && !stepTests.hasFakeQr, 'Paso 4 sin QR falso, con alias tucured y link Mercado Pago oficial');
    ok(links.successVisible && links.turnero.includes('/turnero.html?level=l1&rubro=servicios&slug=estudio-norte') && links.admin.includes('/admin_l1.html?rubro=servicios&slug=estudio-norte'), `Links reales generados en Tarjeta de Éxito (${links.turnero})`);

    for (const u of [links.turnero.replace(BASE, ''), links.admin.replace(BASE, '')]) {
      await cdp.goto(u);
      const len = await cdp.evalJs('document.body.innerText.trim().length');
      ok(len > 40, `Ruta real de éxito carga OK (${u})`);
    }
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.log('  [INFO]', JSON.stringify({ errors: cdp.errors, httpBad: cdp.httpBad }));
    cdp.close();
  } finally {
    chrome.kill('SIGKILL'); preview.kill('SIGKILL');
    await wait(250);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESULTADO FINAL [TASK-092]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
