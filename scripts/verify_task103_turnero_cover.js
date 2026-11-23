// Archivo: scripts/verify_task103_turnero_cover.js
// Compuerta QA + E2E [TASK-103]: Portada App Full-Screen /turnero.html, 6 Rubros, URL Overrides & Paridad

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4203, PORT_CDP = 9258, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const COVER_MODS = ['public/js/admin_shared/turnero_cover_data.js', 'public/js/admin_shared/turnero_cover_ui.js'];
const SYNC_FILES = ['public/turnero.html', 'public/js/admin_shared/turnero_app.js', ...COVER_MODS];
const RUBROS = ['peluqueria', 'estetica', 'gastronomia', 'deportes', 'salud', 'servicios'];
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-103]: <200L/<170L, AST, CERO EMOJIS & PARIDAD ===');
  for (const rel of [...SYNC_FILES, 'scripts/verify_task103_turnero_cover.js']) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    const maxL = COVER_MODS.includes(rel) ? 170 : (rel.startsWith('scripts/') ? 180 : 200);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt), `Cero emojis en ${rel}`);
  }
  const distTurnero = fs.readFileSync(path.resolve('dist/turnero.html'), 'utf8');
  ok(distTurnero.includes('turnero_cover_data.js') && distTurnero.includes('turnero_cover_ui.js'), 'dist/turnero.html incluye scripts de Portada App');
  for (const rel of SYNC_FILES) {
    const engPath = path.join(ENGINE, rel);
    ok(fs.existsSync(engPath) && sha(path.resolve(rel)) === sha(engPath), `Paridad SHA-256: ${rel} === engine/${rel}`);
  }
}

async function runViewport(cdp, vp) {
  console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });

  for (const r of RUBROS) {
    await cdp.goto(`/turnero.html?level=l1&rubro=${r}`);
    for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-cover-reservar') && document.getElementById('cover-bg-img')?.complete)`)) break; await wait(120); }
    const res = await cdp.evalJs(`(() => {
      const img = document.getElementById('cover-bg-img'), maps = document.getElementById('cover-maps-link'), sched = document.getElementById('cover-schedule-label');
      const pill = document.getElementById('cover-status-pill'), btn = document.getElementById('btn-cover-reservar');
      const cover = document.getElementById('turnero-cover-stage'), book = document.getElementById('turnero-booking-stage');
      return {
        imgSrc: img?.getAttribute('src') || '', imgLoaded: Boolean(img?.complete && img?.naturalWidth > 0),
        pillOk: Boolean(pill && (pill.innerText.includes('Abierto') || pill.innerText.includes('Cerrado'))),
        btnOk: Boolean(btn && btn.innerText.includes('Reservar turno')),
        mapsOk: Boolean(maps?.href?.startsWith('https://www.google.com/maps/search/?api=1&query=')),
        schedOk: Boolean(sched && sched.innerText.trim().length > 5),
        stageOk: Boolean(cover && !cover.classList.contains('hidden') && book?.classList.contains('hidden')),
        overflow: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    ok(res.imgLoaded && cdp.webp200.has(res.imgSrc) && res.pillOk && res.btnOk && res.mapsOk && res.schedOk && res.stageOk && !res.overflow,
      `${vp.n} [${r}]: .webp (${res.imgSrc}) HTTP 200, pill, CTA, Maps, horario y 0 overflow`);
  }

  await cdp.goto('/turnero.html?rubro=peluqueria&biz=Barberia+El+Faro&accent=gold&tagline=Cortes+clasicos');
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-cover-reservar'))`)) break; await wait(100); }
  const ovRes = await cdp.evalJs(`({
    biz: document.getElementById('cover-biz-name')?.innerText,
    tag: document.getElementById('cover-tagline')?.innerText,
    mono: document.getElementById('cover-brand-monogram')?.innerText,
    ctaBg: document.getElementById('btn-cover-reservar')?.style.getPropertyValue('--cover-cta-bg')
  })`);
  ok(ovRes.biz === 'Barberia El Faro' && ovRes.tag === 'Cortes clasicos' && ovRes.mono === 'BE' && ovRes.ctaBg === '#C89B3C',
    `${vp.n}: URL overrides (?biz, ?tagline, ?accent=gold) reflejados en vivo`);

  await cdp.evalJs(`document.getElementById('btn-cover-reservar').click()`);
  await wait(300);
  const step1 = await cdp.evalJs(`({
    coverHidden: document.getElementById('turnero-cover-stage')?.classList.contains('hidden'),
    bookVis: !document.getElementById('turnero-booking-stage')?.classList.contains('hidden'),
    hasStep1: document.body.innerText.includes('Elegir Servicio'),
    accentVar: document.documentElement.style.getPropertyValue('--tucu-accent')
  })`);
  ok(step1.coverHidden && step1.bookVis && step1.hasStep1 && step1.accentVar === '#C89B3C',
    `${vp.n}: Transición Portada -> Paso 1 visible + --tucu-accent aplicado`);

  await cdp.evalJs(`document.getElementById('btn-back-cover').click()`);
  await wait(120);
  const backCover = await cdp.evalJs(`Boolean(!document.getElementById('turnero-cover-stage')?.classList.contains('hidden') && document.getElementById('btn-cover-reservar'))`);
  ok(backCover, `${vp.n}: Botón "Portada" (#btn-back-cover) regresa a Pantalla 0`);

  await cdp.goto('/turnero.html?rubro=estetica&skipCover=1');
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.querySelector('[data-srv-id]'))`)) break; await wait(100); }
  const skip = await cdp.evalJs(`Boolean(document.getElementById('turnero-cover-stage')?.classList.contains('hidden') && !document.getElementById('turnero-booking-stage')?.classList.contains('hidden') && document.querySelector('[data-srv-id]'))`);
  ok(skip, `${vp.n}: ?skipCover=1 ingresa directo al Paso 1 sin mostrar portada`);

  await cdp.evalJs(`localStorage.setItem('tucu_turnero_open', 'false')`);
  await cdp.goto('/turnero.html?level=l1&rubro=peluqueria');
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`document.body.innerText.includes('Turnero en Pausa Temporal')`)) break; await wait(100); }
  const paused = await cdp.evalJs(`document.body.innerText.includes('Turnero en Pausa Temporal') && document.getElementById('turnero-cover-stage')?.classList.contains('hidden')`);
  await cdp.evalJs(`localStorage.removeItem('tucu_turnero_open')`);
  ok(paused, `${vp.n}: Estado de pausa Admin respetado sobre portada`);

  await cdp.goto('/turnero.html?level=l2&rubro=estetica');
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-cover-reservar'))`)) break; await wait(100); }
  await cdp.evalJs(`document.getElementById('btn-cover-reservar').click()`);
  await wait(280);
  const flow = await cdp.evalJs(`(async () => {
    const w = (ms=120) => new Promise(r => setTimeout(r, ms));
    document.querySelector('[data-srv-id]')?.click(); await w();
    document.getElementById('btn-step1-next')?.click(); await w();
    document.getElementById('btn-step2-next')?.click(); await w();
    document.getElementById('inp-client-name').value = 'Lucía Peralta';
    document.getElementById('inp-client-phone').value = '3815551100';
    document.getElementById('btn-confirm-booking')?.click(); await w(180);
    const code = (document.body.innerText.match(/TK-[A-Z0-9]{4}/) || [''])[0];
    document.getElementById('btn-open-ticket')?.click(); await w(150);
    const modal = Boolean(document.getElementById('tucu-ticket-modal-overlay'));
    document.getElementById('btn-modal-return-turnero')?.click();
    return { code, modal, overflow: document.documentElement.scrollWidth > window.innerWidth };
  })()`);
  ok(/^TK-/.test(flow.code) && flow.modal && !flow.overflow, `${vp.n}: Reserva 3 pasos (${flow.code}) + Ticket Online sin regresiones ni overflow`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-103'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const vp of [{ n: 'Móvil 375x667', w: 375, h: 667, mob: true }, { n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }]) await runViewport(cdp, vp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-103]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
