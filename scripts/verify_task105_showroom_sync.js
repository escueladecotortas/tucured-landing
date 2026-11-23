// Archivo: scripts/verify_task105_showroom_sync.js
// Compuerta QA + E2E [TASK-105]: Showroom Portada App, 6 Rubros Sólidos, Servicios #4338CA y Ticket Carbón

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4205, PORT_CDP = 9260, BASE = `http://127.0.0.1:${PORT_APP}`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CHECK_FILES = [
  ['index.html', 120], ['css/showroom.css', 180], ['js/showcase_v11/showcase_cover.js', 150],
  ['js/showcase_v11/showcase_state.js', 180], ['js/showcase_v11/showcase_core.js', 200],
  ['js/showcase_v11/showcase_mockup.js', 200], ['js/showcase_v11/showcase_templates_l1.js', 200],
  ['js/showcase_v11/showcase_templates_l2.js', 200], ['js/showcase_v11/showcase_templates_l3.js', 200],
  ['scripts/verify_task105_showroom_sync.js', 180]
];
const CLEAN_UI = [
  'js/showcase_v11/showcase_cover.js', 'js/showcase_v11/showcase_mockup.js',
  'js/showcase_v11/showcase_templates_l1.js', 'js/showcase_v11/showcase_templates_l2.js', 'js/showcase_v11/showcase_templates_l3.js'
];
const RUBROS = [
  ['barberia', '#B45309', 'rgb(180, 83, 9)', 'Peluquería & Barbería Central', '/assets/showcase/hero_peluqueria.webp'],
  ['estetica', '#8C6D46', 'rgb(140, 109, 70)', 'Aura Estética & Spa', '/assets/showcase/hero_unas.webp'],
  ['resto', '#C85A3F', 'rgb(200, 90, 63)', 'Bistró & Parrilla El Encuentro', '/assets/showcase/gastronomia.webp'],
  ['deportes', '#15803D', 'rgb(21, 128, 61)', 'Complejo Deportivo & Pádel Norte', '/assets/showcase/deportes.webp'],
  ['salud', '#0F766E', 'rgb(15, 118, 110)', 'Consultorios Médicos San Martín', '/assets/showcase/hero_salud.webp'],
  ['servicios', '#4338CA', 'rgb(67, 56, 202)', 'Estudio Jurídico & Contable Norte', '/assets/rubro_servicios.webp']
];
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); }); q.on('error', rej); q.end(); });

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; this.webp200 = new Set(); }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived') {
        const res = m.params?.response;
        if (res?.url?.startsWith(BASE) && !res.url.endsWith('/favicon.ico') && res.status >= 400) this.httpBad.push(`${res.status} ${res.url}`);
        if (res?.url?.startsWith(BASE) && res.url.includes('.webp') && (res.status === 200 || res.status === 304)) this.webp200.add(new URL(res.url).pathname);
      }
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(750); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-105]: LÍNEAS, AST & CERO font-mono/#800000/GRADIENTES ===');
  for (const [rel, maxL] of CHECK_FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
  }
  for (const rel of CLEAN_UI) {
    const txt = fs.readFileSync(path.resolve(rel), 'utf8');
    ok(!txt.includes('font-mono') && !txt.includes('#800000') && !txt.includes('bg-gradient-to-r'), `Limpio (0 font-mono, 0 #800000, 0 gradientes): ${rel}`);
  }
  const distIdx = fs.readFileSync(path.resolve('dist/index.html'), 'utf8');
  ok(distIdx.includes('Playfair+Display') && distIdx.includes('Plus+Jakarta+Sans'), 'dist/index.html carga Playfair Display y Plus Jakarta Sans');
}

async function runViewport(cdp, vp) {
  console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
  await cdp.goto('/');
  for (let t = 0; t < 30; t++) { if (await cdp.evalJs(`Boolean(window.ShowcaseCore && document.getElementById('showroom-cover-enter'))`)) break; await wait(120); }

  const initC = await cdp.evalJs(`(() => {
    const h = document.getElementById('showroom-cover-title'), img = document.getElementById('showroom-cover-bg');
    return { hasCta: Boolean(document.getElementById('showroom-cover-enter')), serif: h ? getComputedStyle(h).fontFamily : '', imgOk: Boolean(img?.complete && img?.naturalWidth > 0), ov: document.documentElement.scrollWidth > window.innerWidth };
  })()`);
  ok(initC.hasCta && initC.serif.includes('Playfair') && initC.imgOk && !initC.ov, `${vp.n}: Showroom arranca en Paso 0 Portada App (Playfair Display + .webp + 0 overflow)`);

  for (const [id, hex, rgb, title, bg] of RUBROS) {
    await cdp.evalJs(`window.ShowcaseCore.selectRubro('${id}')`);
    for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`document.getElementById('showroom-cover-title')?.innerText === '${title}' && document.getElementById('showroom-cover-bg')?.complete`)) break; await wait(90); }
    const r = await cdp.evalJs(`(() => {
      const btn = document.getElementById('showroom-cover-enter'), img = document.getElementById('showroom-cover-bg');
      return { title: document.getElementById('showroom-cover-title')?.innerText, accent: btn?.dataset?.accent, bgCss: btn ? getComputedStyle(btn).backgroundColor : '', imgSrc: img?.getAttribute('src'), imgOk: Boolean(img?.complete && img?.naturalWidth > 0), ov: document.documentElement.scrollWidth > window.innerWidth };
    })()`);
    ok(r.title === title && r.accent === hex && r.bgCss === rgb && r.imgSrc === bg && r.imgOk && cdp.webp200.has(bg) && !r.ov,
      `${vp.n} [${id}]: Portada '${title}', color ${hex}, .webp HTTP 200 y 0 overflow`);
  }

  await cdp.evalJs(`document.getElementById('showroom-cover-enter').click()`); await wait(140);
  const srvP1 = await cdp.evalJs(`(() => {
    const nxt = document.getElementById('btn-showroom-next');
    return { hasBack: Boolean(document.getElementById('showroom-back-cover')), hasNext: Boolean(nxt), bgCss: nxt ? getComputedStyle(nxt).backgroundColor : '', accent: nxt?.dataset?.accent };
  })()`);
  ok(srvP1.hasBack && srvP1.hasNext && srvP1.accent === '#4338CA' && srvP1.bgCss === 'rgb(67, 56, 202)', `${vp.n} [servicios]: Paso 1 usa paleta propia #4338CA (no estética)`);

  await cdp.evalJs(`document.getElementById('showroom-back-cover').click()`); await wait(120);
  ok(await cdp.evalJs(`Boolean(document.getElementById('showroom-cover-enter'))`), `${vp.n}: ‹ Portada regresa a Paso 0`);

  await cdp.evalJs(`document.getElementById('showroom-cover-enter').click()`); await wait(120);
  const flow = await cdp.evalJs(`(async () => {
    const w = (ms=120) => new Promise(r => setTimeout(r, ms));
    document.getElementById('btn-showroom-next')?.click(); await w();
    document.querySelector('button[onclick*="nextStep"]')?.click(); await w();
    document.querySelector('button[onclick*="confirmBooking"]')?.click(); await w(180);
    const btnTkt = document.getElementById('btn-showroom-open-ticket'), bgTkt = btnTkt ? getComputedStyle(btnTkt).backgroundColor : '';
    const code = (document.body.innerText.match(/TK-[A-Z0-9]{4}/) || [''])[0];
    btnTkt?.click(); await w(140);
    const modal = Boolean(document.getElementById('tucu-ticket-modal-overlay'));
    document.getElementById('btn-modal-return-turnero')?.click(); await w(80);
    document.getElementById('btn-showroom-tab-admin')?.click(); await w(140);
    const adminOk = Boolean(document.getElementById('showcase-admin-frame'));
    document.getElementById('btn-showroom-tab-client')?.click(); await w(80);
    return { code, bgTkt, modal, adminOk, ov: document.documentElement.scrollWidth > window.innerWidth };
  })()`);
  ok(/^TK-/.test(flow.code) && flow.bgTkt === 'rgb(24, 24, 27)' && flow.modal && flow.adminOk && !flow.ov,
    `${vp.n}: Flujo 0->1->2->3->4 (${flow.code}), Ticket carbón #18181B, Modal y Panel de Dueño OK`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-105'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const vp of [{ n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }, { n: 'Móvil 375x667', w: 375, h: 667, mob: true }]) await runViewport(cdp, vp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-105]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });