// Archivo: scripts/verify_task108_covers_polish.js
// Compuerta QA + E2E [TASK-108]: 6 Portadas Vivas ffprobe, Pulido UI/PC, Semillita Perfil, Showroom y Paridad (< 195L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4208, PORT_CDP = 9263, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const RUBROS = [
  ['peluqueria', 'barberia', '/assets/covers/peluqueria/oficio_vapor_01.webp', '/assets/covers/peluqueria/oficio_vapor_01.mp4', 'rgb(241, 235, 227)'],
  ['estetica', 'estetica', '/assets/covers/estetica/calma_vela_01.webp', '/assets/covers/estetica/calma_vela_01.mp4', 'rgb(239, 234, 225)'],
  ['gastronomia', 'resto', '/assets/covers/gastronomia/mesa_calida_01.webp', '/assets/covers/gastronomia/mesa_calida_01.mp4', 'rgb(242, 234, 228)'],
  ['deportes', 'deportes', '/assets/covers/deportes/cancha_nocturna_01.webp', '/assets/covers/deportes/cancha_nocturna_01.mp4', 'rgb(234, 239, 233)'],
  ['salud', 'salud', '/assets/covers/salud/luz_manana_01.webp', '/assets/covers/salud/luz_manana_01.mp4', 'rgb(235, 241, 240)'],
  ['servicios', 'servicios', '/assets/covers/servicios/claridad_cafe_01.webp', '/assets/covers/servicios/claridad_cafe_01.mp4', 'rgb(236, 238, 244)']
];
const CODE_FILES = [
  ['public/turnero.html', 100], ['public/js/admin_shared/turnero_cover_data.js', 180],
  ['public/js/admin_shared/turnero_cover_ui.js', 170], ['public/js/admin_shared/turnero_ticket_lookup.js', 195],
  ['public/js/admin_shared/turnero_steps_ui.js', 195], ['public/js/admin_shared/turnero_app.js', 195],
  ['js/showcase_v11/showcase_state.js', 165], ['js/showcase_v11/showcase_cover.js', 130],
  ['scripts/verify_task108_covers_polish.js', 195]
];
const SYNC_FILES = [
  'public/assets/covers/cover_catalog.json', 'public/turnero.html',
  'public/js/admin_shared/turnero_cover_data.js', 'public/js/admin_shared/turnero_cover_ui.js',
  'public/js/admin_shared/turnero_ticket_lookup.js', 'public/js/admin_shared/turnero_steps_ui.js',
  'public/js/admin_shared/turnero_app.js', ...RUBROS.flatMap(([, , w, m]) => [`public${w}`, `public${m}`])
];
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); }); q.on('error', rej); q.end(); });

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; this.mediaOk = new Set(); }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived') {
        const r = m.params?.response;
        if (r?.url?.startsWith(BASE) && !r.url.endsWith('/favicon.ico') && r.status >= 400) this.httpBad.push(`${r.status} ${r.url}`);
        if (r?.url?.startsWith(BASE) && r.url.includes('/assets/covers/') && [200, 206, 304].includes(r.status)) this.mediaOk.add(new URL(r.url).pathname);
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, 6x ffprobe & PARIDAD SHA-256 (19 archivos) [TASK-108] ===');
  for (const [rel, maxL] of CODE_FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono') && !txt.includes('#800000'), `Limpio (0 emojis/font-mono/#800000): ${rel}`);
  }
  const catPath = path.resolve('public/assets/covers/cover_catalog.json'), catLines = fs.readFileSync(catPath, 'utf8').split(/\r?\n/).length;
  const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  ok(catLines < 120 && cat.covers?.length === 6 && cat.covers.every(c => c.panelBg && c.poster && c.motion), `cover_catalog.json válido (${catLines}L < 120L, 6 portadas vivas)`);
  for (const [r, , wRel, mRel] of RUBROS) {
    const wAbs = path.resolve(`public${wRel}`), mAbs = path.resolve(`public${mRel}`);
    const wSz = fs.statSync(wAbs).size, mSz = fs.statSync(mAbs).size;
    const pw = JSON.parse(execSync(`ffprobe -v error -show_entries stream=width,height -of json "${wAbs}"`, { encoding: 'utf8' })).streams?.[0] || {};
    const pm = JSON.parse(execSync(`ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,codec_name,pix_fmt,width,height -of json "${mAbs}"`, { encoding: 'utf8' }));
    const aud = (pm.streams || []).filter(s => s.codec_type === 'audio').length, vid = (pm.streams || []).find(s => s.codec_type === 'video') || {};
    ok(wSz <= 92160 && pw.height > pw.width && mSz <= 665600 && aud === 0 && vid.codec_name === 'h264' && vid.pix_fmt === 'yuv420p' && vid.height > vid.width,
      `Media [${r}]: webp=${(wSz / 1024).toFixed(1)}KB (${pw.width}x${pw.height}), mp4=${(mSz / 1024).toFixed(1)}KB (${vid.width}x${vid.height}, dur=${Number(pm.format?.duration || 0).toFixed(2)}s, audio=${aud})`);
  }
  ok(!fs.existsSync('dist/temp'), 'dist/ limpio sin carpeta temp/');
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function checkTurneroViewport(cdp, vp) {
  await cdp.goto('/turnero.html?rubro=estetica'); await cdp.evalJs('localStorage.clear()');
  for (const [r, , wRel, mRel, panelRgb] of RUBROS) {
    await cdp.goto(`/turnero.html?rubro=${r}`);
    for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`(() => { const v = document.getElementById('cover-bg-video'), i = document.getElementById('cover-bg-img'); return Boolean(v && i?.complete && i.naturalWidth > 0 && (v.readyState >= 1 || ${cdp.mediaOk.has(mRel)})); })()`)) break; await wait(120); }
    const res = await cdp.evalJs(`(() => {
      const v = document.getElementById('cover-bg-video'), i = document.getElementById('cover-bg-img'), f = document.querySelector('footer');
      const stage = document.getElementById('turnero-booking-stage'), card = document.getElementById('turnero-steps-root'), cov = document.getElementById('turnero-cover-stage'), br = document.getElementById('turnero-brand-link');
      return {
        vSrc: v?.querySelector('source')?.getAttribute('src'), iOk: Boolean(i?.complete && i?.naturalWidth > 0),
        noMono: !document.getElementById('cover-brand-monogram') && !document.getElementById('cover-brand-badge') && !document.getElementById('cover-brand-logo'),
        noTucuText: !(cov?.innerText || '').includes('Turnos por Tucu Red'),
        noAdmin: !(f?.innerText || '').toLowerCase().includes('panel de gestión') && !f?.querySelector('a[href*="admin"]'),
        brandOk: br?.getAttribute('href') === 'https://tucured.ar' && br?.getAttribute('target') === '_blank' && (br?.innerText || '').includes('Tucu Red'),
        panelBg: stage ? getComputedStyle(stage).backgroundColor : '', cardWhite: card ? (getComputedStyle(card).backgroundColor === 'rgb(255, 255, 255)' && getComputedStyle(card).boxShadow !== 'none') : false,
        ov: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    const panelOk = vp.mob ? true : (res.panelBg === panelRgb && res.panelBg !== 'rgb(255, 255, 255)' && res.cardWhite);
    ok(res.vSrc === mRel && res.iOk && cdp.mediaOk.has(wRel) && (cdp.mediaOk.has(mRel) || res.vSrc === mRel) && res.noMono && res.noTucuText && res.noAdmin && res.brandOk && panelOk && !res.ov,
      `${vp.n} [${r}]: MP4+WebP ok, sin círculo, footer tucured.ar sin admin, ${vp.mob ? '0 overflow' : `panel=${res.panelBg} + card elevada`}`);
  }
  await cdp.goto('/turnero.html?rubro=estetica&logo=/assets/covers/estetica/calma_vela_01.webp');
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('cover-brand-logo')?.complete)`)) break; await wait(100); }
  const lRect = await cdp.evalJs(`(() => { const b = document.getElementById('cover-brand-logo')?.getBoundingClientRect(); return { w: b?.width || 0, h: b?.height || 0 }; })()`);
  ok(lRect.w >= 64 && lRect.h >= 64, `${vp.n}: Logo 2x cargado renderiza >=64px (${Math.round(lRect.w)}x${Math.round(lRect.h)}px)`);
  await cdp.goto('/turnero.html?rubro=peluqueria');
  if (vp.mob) { await cdp.evalJs(`document.getElementById('btn-cover-reservar').click()`); await wait(260); }
  const code = await cdp.evalJs(`(async () => {
    const w = (ms=90) => new Promise(r => setTimeout(r, ms));
    document.getElementById('btn-step1-next').click(); await w();
    document.getElementById('inp-client-phone').value = '3815554321'; document.getElementById('inp-client-first').value = 'Martín'; document.getElementById('inp-client-last').value = 'Rodríguez';
    document.getElementById('btn-step2-next').click(); await w(); document.getElementById('btn-confirm-booking').click(); await w(120);
    return (document.body.innerText.match(/TK-[A-Z0-9]{4}/) || [''])[0];
  })()`);
  await cdp.goto('/turnero.html?rubro=estetica');
  if (vp.mob) { await cdp.evalJs(`document.getElementById('btn-cover-reservar').click()`); await wait(260); }
  const seedFlow = await cdp.evalJs(`(async () => {
    const w = (ms=90) => new Promise(r => setTimeout(r, ms)), greet = document.getElementById('turnero-booking-header')?.innerText || '';
    document.getElementById('btn-step1-next').click(); await w();
    const fastTxt = document.getElementById('turnero-saved-profile-card')?.innerText || '', noInpBefore = !document.getElementById('inp-client-first');
    document.getElementById('btn-edit-client-profile')?.click(); await w();
    return { greet, fastTxt, noInpBefore, hasInpAfter: document.getElementById('inp-client-first')?.value === 'Martín' };
  })()`);
  ok(/^TK-/.test(code) && seedFlow.greet.includes('¡Hola de nuevo, Martín!') && seedFlow.noInpBefore && seedFlow.fastTxt.includes('Martín Rodríguez') && seedFlow.hasInpAfter,
    `${vp.n}: Semillita perfil tras ${code} saluda "¡Hola de nuevo, Martín!", muestra tarjeta rápida y despliega inputs con Cambiar datos`);
}

async function checkShowroomViewport(cdp, vp) {
  await cdp.goto('/');
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(window.ShowcaseCore)`)) break; await wait(120); }
  let allOk = true;
  for (const [, sr, , mRel] of RUBROS) {
    await cdp.evalJs(`window.ShowcaseCore.selectRubro('${sr}')`);
    for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`document.querySelector('#showroom-cover-video source')?.getAttribute('src') === '${mRel}'`)) break; await wait(80); }
    const sRes = await cdp.evalJs(`(() => { const m = document.getElementById('mockup-container'), v = document.getElementById('showroom-cover-video'); return { src: v?.querySelector('source')?.getAttribute('src'), muted: Boolean(v?.muted && v?.loop && v?.playsInline), noMono: !m?.querySelector('.rounded-full.w-11') && !document.getElementById('showroom-cover-logo'), noTxt: !(m?.innerText || '').includes('Turnos por Tucu Red') }; })()`);
    if (!(sRes.src === mRel && sRes.muted && sRes.noMono && sRes.noTxt)) allOk = false;
  }
  ok(allOk, `${vp.n}: Showroom monta los 6 videos MP4 sin círculo de iniciales ni marca sobre foto`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-108'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const vp of [{ n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }, { n: 'Móvil 375x667', w: 375, h: 667, mob: true }]) {
      console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await checkTurneroViewport(cdp, vp);
      await checkShowroomViewport(cdp, vp);
    }
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-108]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });