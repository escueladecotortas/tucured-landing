// Archivo: scripts/verify_task104_turnero_split.js
// Compuerta QA + E2E [TASK-104]: Split 50/50 Escritorio, Móvil App Cover, 6 Rubros Warm Studio y Paridad

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4204, PORT_CDP = 9259, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SYNC_FILES = [
  ['public/turnero.html', 100], ['public/js/admin_shared/turnero_cover_data.js', 170],
  ['public/js/admin_shared/turnero_cover_ui.js', 170], ['public/js/admin_shared/turnero_steps_ui.js', 190],
  ['public/js/admin_shared/turnero_app.js', 195]
];
const RUBRO_COLORS = [
  ['peluqueria', '#B45309', '/assets/showcase/hero_peluqueria.webp'], ['estetica', '#8C6D46', '/assets/showcase/hero_unas.webp'],
  ['gastronomia', '#C85A3F', '/assets/showcase/gastronomia.webp'], ['deportes', '#15803D', '/assets/showcase/deportes.webp'],
  ['salud', '#0F766E', '/assets/showcase/hero_salud.webp'], ['servicios', '#4338CA', '/assets/rubro_servicios.webp']
];
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
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
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(650); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-104]: LÍNEAS, AST, LIMPIEZA & PARIDAD ===');
  for (const [rel, maxL] of [...SYNC_FILES, ['scripts/verify_task104_turnero_split.js', 180]]) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono') && !txt.includes('#800000'), `Limpio (0 emojis, 0 font-mono, 0 #800000): ${rel}`);
  }
  const distT = fs.readFileSync(path.resolve('dist/turnero.html'), 'utf8');
  ok(distT.includes('Playfair+Display') && distT.includes('Plus+Jakarta+Sans') && distT.includes('turnero_steps_ui.js'), 'dist/turnero.html incluye fuentes editoriales y turnero_steps_ui.js');
  for (const [rel] of SYNC_FILES) { const ep = path.join(ENGINE, rel); ok(fs.existsSync(ep) && sha(path.resolve(rel)) === sha(ep), `Paridad SHA-256: ${rel} === engine/${rel}`); }
}

async function runDesktop(cdp) {
  console.log('\n=== 2. E2E DESKTOP 1280x800 (SPLIT 50/50 + 6 RUBROS + RESERVA SERVICIOS L2) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  for (const [rubro, color, bg] of RUBRO_COLORS) {
    await cdp.goto(`/turnero.html?level=l1&rubro=${rubro}`);
    for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('turnero-services-list') && document.getElementById('cover-bg-img')?.complete)`)) break; await wait(120); }
    const d = await cdp.evalJs(`(() => {
      const c = document.getElementById('turnero-cover-stage')?.getBoundingClientRect(), b = document.getElementById('turnero-booking-stage')?.getBoundingClientRect();
      const cta = document.getElementById('btn-cover-reservar'), img = document.getElementById('cover-bg-img'), h1 = document.getElementById('cover-biz-name');
      return { splitOk: Boolean(c && b && c.width >= 600 && b.width >= 600 && b.left >= c.right - 2), ctaHidden: !cta || cta.offsetParent === null, step1Ready: Boolean(document.querySelector('[data-srv-id]') && document.getElementById('btn-step1-next')), primary: document.documentElement.style.getPropertyValue('--tucu-primary'), serif: h1 ? getComputedStyle(h1).fontFamily : '', imgSrc: img?.getAttribute('src') || '', imgLoaded: Boolean(img?.complete && img?.naturalWidth > 0), overflow: document.documentElement.scrollWidth > window.innerWidth };
    })()`);
    ok(d.splitOk && d.ctaHidden && d.step1Ready && d.primary === color && d.serif.includes('Playfair') && d.imgSrc === bg && d.imgLoaded && cdp.webp200.has(bg) && !d.overflow, `Desktop [${rubro}]: Split 50/50, CTA oculto, Paso 1 listo, color ${color}, Playfair, .webp HTTP 200`);
  }
  await cdp.goto('/turnero.html?level=l2&rubro=servicios');
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-step1-next'))`)) break; await wait(100); }
  const res = await cdp.evalJs(`(async () => {
    const w = (ms=120) => new Promise(r => setTimeout(r, ms));
    document.getElementById('btn-step1-next')?.click(); await w();
    const noCov = !document.getElementById('inp-client-cov');
    document.getElementById('inp-client-phone').value = '3815551100'; document.getElementById('inp-client-first').value = 'Sofía'; document.getElementById('inp-client-last').value = 'Paz';
    document.getElementById('btn-step2-next')?.click(); await w(); document.getElementById('btn-confirm-booking')?.click(); await w(180);
    const btnTkt = document.getElementById('btn-open-ticket'), bgTkt = btnTkt ? getComputedStyle(btnTkt).backgroundColor : '', code = (document.body.innerText.match(/TK-[A-Z0-9]{4}/) || [''])[0];
    btnTkt?.click(); await w(140); const modal = Boolean(document.getElementById('tucu-ticket-modal-overlay')); document.getElementById('btn-modal-return-turnero')?.click();
    return { noCov, code, bgTkt, modal, overflow: document.documentElement.scrollWidth > window.innerWidth };
  })()`);
  ok(res.noCov && /^TK-/.test(res.code) && res.bgTkt === 'rgb(24, 24, 27)' && res.modal && !res.overflow, `Desktop [servicios L2]: 4 pasos (${res.code}), sin Obra Social, botón carbón #18181B, Ticket Modal OK`);
}

async function runMobile(cdp) {
  console.log('\n=== 3. E2E MÓVIL 375x667 (PORTADA -> HEADER LIMPIO -> SALUD L3 OBRA SOCIAL) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/turnero.html?level=l3&rubro=salud');
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-cover-reservar'))`)) break; await wait(120); }
  const initM = await cdp.evalJs(`({ coverVis: document.getElementById('btn-cover-reservar')?.offsetParent !== null, bookHidden: document.getElementById('turnero-booking-stage')?.offsetParent === null, ov: document.documentElement.scrollWidth > window.innerWidth })`);
  ok(initM.coverVis && initM.bookHidden && !initM.ov, 'Móvil 375x667: abre en Portada App 100dvh sin overflow');

  await cdp.evalJs(`document.getElementById('btn-cover-reservar').click()`); await wait(300);
  const hdr = await cdp.evalJs(`(() => {
    const b = document.getElementById('btn-back-cover')?.getBoundingClientRect(), t = document.getElementById('turnero-biz-name')?.getBoundingClientRect(), hdrEl = document.querySelector('#turnero-booking-stage header');
    return { step1: Boolean(document.querySelector('[data-staff-id]') && document.getElementById('turnero-services-list')), cleanHdr: Boolean(b && t && !hdrEl?.querySelector('#btn-back-admin') && t.left >= b.right && Math.abs(t.top - b.top) < 16 && t.height < 30), ov: document.documentElement.scrollWidth > window.innerWidth };
  })()`);
  ok(hdr.step1 && hdr.cleanHdr && !hdr.ov, 'Móvil 375x667: Paso 1 L3 (con especialista) y header limpio en 1 línea sin Panel Admin');

  const flow = await cdp.evalJs(`(async () => {
    const w = (ms=120) => new Promise(r => setTimeout(r, ms));
    document.getElementById('btn-step1-next')?.click(); await w(); const hasCov = Boolean(document.getElementById('inp-client-cov'));
    document.getElementById('inp-client-phone').value = '3815559988'; document.getElementById('inp-client-first').value = 'Juan'; document.getElementById('inp-client-last').value = 'Gómez';
    document.getElementById('btn-step2-next')?.click(); await w(); const hasCovStep3 = document.body.innerText.includes('OSDE');
    document.getElementById('btn-confirm-booking')?.click(); await w(180); const code = (document.body.innerText.match(/TK-[A-Z0-9]{4}/) || [''])[0];
    document.getElementById('btn-open-ticket')?.click(); await w(140); const modal = Boolean(document.getElementById('tucu-ticket-modal-overlay')); document.getElementById('btn-modal-return-turnero')?.click();
    return { hasCov, hasCovStep3, code, modal, ov: document.documentElement.scrollWidth > window.innerWidth };
  })()`);
  ok(flow.hasCov && flow.hasCovStep3 && /^TK-/.test(flow.code) && flow.modal && !flow.ov, `Móvil [salud L3]: select Obra Social + resumen + reserva (${flow.code}) + Ticket Modal OK`);

  await cdp.evalJs(`document.getElementById('btn-back-cover').click()`); await wait(120);
  ok(await cdp.evalJs(`document.getElementById('btn-cover-reservar')?.offsetParent !== null`), 'Móvil: ‹ Portada regresa a Pantalla 0');

  await cdp.goto('/turnero.html?rubro=peluqueria&skipCover=1');
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-step1-next'))`)) break; await wait(100); }
  ok(await cdp.evalJs(`document.getElementById('turnero-cover-stage')?.classList.contains('hidden') && Boolean(document.getElementById('turnero-services-list'))`), 'Móvil: ?skipCover=1 entra directo a Paso 1');

  await cdp.evalJs(`localStorage.setItem('tucu_turnero_open', 'false')`); await cdp.goto('/turnero.html?level=l1&rubro=peluqueria');
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`document.body.innerText.includes('Turnero en Pausa Temporal')`)) break; await wait(100); }
  const paused = await cdp.evalJs(`document.body.innerText.includes('Turnero en Pausa Temporal')`);
  await cdp.evalJs(`localStorage.removeItem('tucu_turnero_open')`); ok(paused, 'Móvil: Estado de pausa Admin respetado');
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-104'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await runDesktop(cdp); await runMobile(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-104]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });