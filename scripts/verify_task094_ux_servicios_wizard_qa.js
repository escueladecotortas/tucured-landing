// Archivo: scripts/verify_task094_ux_servicios_wizard_qa.js
// Compuerta QA + E2E [TASK-094]: Hero Logo, Foto Servicios, FAQ, Instagram, Wizard Refinado & Paridad SHA-256

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4194, PORT_CDP = 9249, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FILES = [
  'index.html', 'css/components.css', 'js/components/hero_markup.js', 'js/components/stage_rubros_zone.js',
  'js/showcase_v11/showcase_state.js', 'js/components/stage_value_zone.js', 'js/components/pricing.js',
  'js/components/faq_accordion.js', 'js/components/footer.js', 'js/components/funnel_data.js',
  'js/utils/whatsapp_link.js', 'js/components/funnel_checkout_markup.js', 'js/components/funnel_markup.js',
  'js/components/funnel.js', 'scripts/verify_task094_ux_servicios_wizard_qa.js'
];
const ENGINE_SYNC = [
  ['js/components/hero_markup.js', 'js/components/hero_markup.js'],
  ['js/components/pricing.js', 'js/components/pricing.js'],
  ['js/components/stage_value_zone.js', 'js/components/stage_value_zone.js'],
  ['js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_state.js'],
  ['js/showcase_v11/showcase_state.js', 'public/js/showcase_v11/showcase_state.js'],
  ['public/assets/rubro_servicios.webp', 'public/assets/rubro_servicios.webp'],
  ['public/assets/rubro_servicios.webp', 'assets/rubro_servicios.webp']
];
const EXPECTED_CITIES = [
  'San Miguel de Tucumán', 'Aguilares', 'Alderetes', 'Banda del Río Salí', 'Concepción',
  'El Manantial', 'Famaillá', 'Las Talitas', 'Lules', 'Monteros', 'San Pablo', 'Simoca', 'Tafí del Valle', 'Tafí Viejo', 'Yerba Buena'
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-094]: <=180L, AST, SIN CLICHÉS, WEBP & PARIDAD SHA-256 ===');
  for (const rel of FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.endsWith('verify_task094_ux_servicios_wizard_qa.js')) ok(!/Cero Fricci[oó]n|24\/7|\bbaileys\b/i.test(txt), `Sin clichés/Baileys: ${rel}`);
  }
  for (const w of ['public/assets/rubro_servicios.webp', 'assets/rubro_servicios.webp']) {
    const buf = fs.existsSync(w) ? fs.readFileSync(w) : null;
    ok(Boolean(buf && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP' && buf.length > 20000), `WebP válido: ${w} (${buf ? buf.length : 0} bytes)`);
  }
  ok(sha('public/assets/rubro_servicios.webp') === sha('assets/rubro_servicios.webp'), 'Paridad SHA-256 local public/assets vs assets/ rubro_servicios.webp');
  const idx = fs.readFileSync('index.html', 'utf8');
  for (const f of ['rubro', 'plan', 'horario', 'nombre', 'ciudad', 'nombre_titular', 'apellido_titular', 'email', 'whatsapp', 'material_pdf']) ok(idx.includes(`name="${f}"`), `Netlify <form hidden> declara "${f}"`);
  for (const [srcRel, engRel] of ENGINE_SYNC) { const a = path.resolve(srcRel), b = path.join(ENGINE, engRel); ok(fs.existsSync(b) && sha(a) === sha(b), `Paridad SHA-256: ${srcRel} === engine/${engRel}`); }
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-094'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();

    console.log('\n=== 2. E2E DESKTOP (1280x800) & MÓVIL (375x667): HERO, SERVICIOS, FAQ, FOOTER, CIUDADES ===');
    for (const vp of [{ n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }, { n: 'Móvil 375x667', w: 375, h: 667, mob: true }]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await cdp.goto('/');
      for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('hero-mockup-brand-logo')?.complete && document.getElementById('fn-city') && document.getElementById('footer-instagram-link'))`)) break; await wait(150); }
      await cdp.evalJs(`window.ShowcaseCore.selectRubro('servicios'); document.querySelectorAll('#faq details').forEach(d => { d.open = true; });`);
      await wait(350);
      const dom = await cdp.evalJs(`(() => {
        const logo = document.getElementById('hero-mockup-brand-logo'), mockImg = document.querySelector('#mockup-container img');
        const faqTxt = document.getElementById('faq')?.innerText || '', q1 = document.querySelectorAll('#faq details')[0]?.innerText || '';
        const q3 = document.querySelectorAll('#faq details')[2]?.innerText || '', q7 = document.querySelectorAll('#faq details')[6]?.innerText || '';
        const ig = document.getElementById('footer-instagram-link'), sel = document.getElementById('fn-city'), pricing = document.getElementById('precios')?.innerText || '';
        return {
          logoOk: Boolean(logo && logo.getAttribute('src') === '/assets/tucu_red_logo.svg' && logo.complete && logo.naturalWidth > 0),
          srvImgOk: Boolean(mockImg && mockImg.getAttribute('src') === '/assets/rubro_servicios.webp' && mockImg.complete && mockImg.naturalWidth > 0),
          faqBadge: /Respuestas Claras y Directas/i.test(faqTxt), noCeroFriccion: !/Cero Fricci[oó]n/i.test(document.body.innerText),
          q1NoComm: !q1.includes('(0% comisión)'), q3Auto: q3.includes('año tras año automáticamente'),
          q7Ok: q7.includes('24 hs') && q7.includes('2 hs') && q7.includes('1 a 25') && q7.includes('80') && q7.includes('Términos y Condiciones') && q7.includes('aviso manual en 1 clic'),
          igOk: Boolean(ig && ig.href === 'https://instagram.com/tucured.ar' && ig.target === '_blank' && ig.rel.includes('noopener') && ig.innerText.includes('@tucured.ar')),
          noPreBadge: !document.getElementById('funnel-preselected-plan-badge'), cityBgNone: sel ? getComputedStyle(sel).backgroundImage === 'none' : false,
          citySvgCount: sel?.parentElement ? sel.parentElement.querySelectorAll('svg').length : 0, cities: sel ? [...sel.options].map(o => o.value) : [],
          cityDef: sel?.value || '', step2Btn: document.getElementById('btn-goto-step-2')?.innerText || '',
          plansOk: pricing.includes('Turnero Autónomo') && pricing.includes('Central Pro Multi-Box') && pricing.includes('Multi-Staff & Recursos'),
          overflow: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`);
      ok(dom.logoOk, `${vp.n}: Mockup Hero exhibe /assets/tucu_red_logo.svg`);
      ok(dom.srvImgOk, `${vp.n}: Showroom Servicios carga /assets/rubro_servicios.webp`);
      ok(dom.faqBadge && dom.noCeroFriccion && dom.q1NoComm && dom.q3Auto && dom.q7Ok, `${vp.n}: Badge FAQ, Q1, Q3 y Q7 verificados`);
      ok(dom.igOk, `${vp.n}: Footer incluye Instagram @tucured.ar con target=_blank`);
      ok(dom.noPreBadge && dom.cityBgNone && dom.citySvgCount === 1, `${vp.n}: Paso 1 sin badge preseleccionado y select sin doble flecha`);
      ok(JSON.stringify(dom.cities) === JSON.stringify(EXPECTED_CITIES) && dom.cityDef === 'San Miguel de Tucumán', `${vp.n}: 15 localidades ordenadas con San Miguel primero por defecto`);
      ok(dom.step2Btn.includes('Siguiente: Horarios y Modalidad') && dom.plansOk && !dom.overflow, `${vp.n}: CTA Paso 1, planes unificados y 0 overflow`);
    }

    console.log('\n=== 3. FLUJO WIZARD COMPLETO (PASOS 1->4, NOMBRE/APELLIDO, MP ACLARACIÓN & @tucured.ar ÉXITO) ===');
    const wiz = await cdp.evalJs(`(async () => {
      sessionStorage.clear(); localStorage.clear();
      document.getElementById('fn-nombre').value = 'Estudio Norte'; document.querySelector('[data-f-rubro="servicios"]').click();
      document.getElementById('btn-goto-step-2').click();
      const s2Title = document.querySelector('#funnel-step-2 h3')?.innerText || '', s2Sub = document.querySelector('#funnel-levels-grid')?.previousElementSibling?.innerText || '', s2Lvls = document.getElementById('funnel-levels-grid')?.innerText || '';
      document.querySelector('[data-f-level="l3"]').click(); document.getElementById('btn-goto-step-3').click();
      document.getElementById('fn-first-name').value = 'Sofía'; document.getElementById('fn-last-name').value = '';
      document.getElementById('fn-email').value = 'sofia@estudionorte.com'; document.getElementById('fn-phone').value = '3815554321';
      document.getElementById('btn-goto-step-4').click();
      const blockedEmptyLast = !document.getElementById('funnel-step3-error').classList.contains('hidden') && document.getElementById('funnel-step-4').classList.contains('hidden');
      document.getElementById('fn-last-name').value = 'Mendoza'; document.getElementById('btn-goto-step-4').click();
      const s4Txt = document.getElementById('funnel-step-4')?.innerText || '', s4Svgs = document.querySelectorAll('#funnel-step-4 svg').length;
      document.getElementById('funnel-submit-btn').click();
      return { s2Title, s2Sub, s2Lvls, blockedEmptyLast, s4Txt, s4Svgs, s4Vis: !document.getElementById('funnel-step-4').classList.contains('hidden') };
    })()`);
    await wait(350);
    const succ = await cdp.evalJs(`({
      vis: !document.getElementById('funnel-success-card')?.classList.contains('hidden'),
      igHref: document.getElementById('success-instagram-link')?.href || '', igTarget: document.getElementById('success-instagram-link')?.target || '',
      turnero: document.getElementById('success-turnero-link')?.href || '', admin: document.getElementById('success-admin-link')?.href || ''
    })`);
    ok(wiz.s2Title.includes('Paso 2: Horarios y Modalidad de Trabajo') && /elegí la modalidad según tu equipo/i.test(wiz.s2Sub), 'Paso 2 exhibe título y subtítulo actualizados');
    ok(wiz.s2Lvls.includes('Nivel 1: Turnero Autónomo') && wiz.s2Lvls.includes('Nivel 2: Central Pro Multi-Box') && wiz.s2Lvls.includes('Nivel 3: Multi-Staff & Recursos'), 'Paso 2 muestra nombres unificados');
    ok(wiz.blockedEmptyLast && wiz.s4Vis, 'Paso 3 valida Nombre y Apellido separados antes de Paso 4');
    ok(wiz.s4Txt.includes('pasarela oficial segura de Mercado Pago en una pestaña nueva; al finalizar, volvé acá para confirmar tu alta.') && wiz.s4Svgs === 0, 'Paso 4 incluye aclaración Mercado Pago y 0 SVG decorativos');
    ok(succ.vis && succ.igHref === 'https://instagram.com/tucured.ar' && succ.igTarget === '_blank' && succ.turnero.includes('/turnero.html?level=l3&rubro=servicios') && succ.admin.includes('/admin_l3.html?rubro=servicios'), 'Tarjeta de éxito incluye @tucured.ar y links reales');
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally {
    chrome.kill('SIGKILL'); preview.kill('SIGKILL');
    await wait(250);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESULTADO FINAL [TASK-094]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
