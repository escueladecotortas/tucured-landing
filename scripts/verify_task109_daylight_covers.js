// Archivo: scripts/verify_task109_daylight_covers.js
// Compuerta QA + E2E [TASK-109]: Luz de Día 6 Rubros, Catálogo Dual 12 Portadas, Scrim y Paridad (< 190L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4209, PORT_CDP = 9264, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const RUBROS_DIA = [
  ['peluqueria', 'barberia', '/assets/covers/peluqueria/salon_luminoso_02.webp', '/assets/covers/peluqueria/salon_luminoso_02.mp4'],
  ['estetica', 'estetica', '/assets/covers/estetica/brillo_natural_02.webp', '/assets/covers/estetica/brillo_natural_02.mp4'],
  ['gastronomia', 'resto', '/assets/covers/gastronomia/cafe_sol_02.webp', '/assets/covers/gastronomia/cafe_sol_02.mp4'],
  ['deportes', 'deportes', '/assets/covers/deportes/padel_sol_02.webp', '/assets/covers/deportes/padel_sol_02.mp4'],
  ['salud', 'salud', '/assets/covers/salud/clinica_luminosa_02.webp', '/assets/covers/salud/clinica_luminosa_02.mp4'],
  ['servicios', 'servicios', '/assets/covers/servicios/estudio_moderno_02.webp', '/assets/covers/servicios/estudio_moderno_02.mp4']
];
const CODE_FILES = [
  ['public/js/admin_shared/turnero_cover_data.js', 195], ['public/js/admin_shared/turnero_cover_ui.js', 170],
  ['js/showcase_v11/showcase_state.js', 165], ['js/showcase_v11/showcase_cover.js', 130],
  ['scripts/verify_task109_daylight_covers.js', 190]
];
const SYNC_FILES = [
  'public/assets/covers/cover_catalog.json', 'public/js/admin_shared/turnero_cover_data.js',
  'public/js/admin_shared/turnero_cover_ui.js', ...RUBROS_DIA.flatMap(([, , w, m]) => [`public${w}`, `public${m}`])
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

function runStaticAndFfprobe() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, CATÁLOGO DUAL 12 PORTADAS, ffprobe & PARIDAD SHA-256 [TASK-109] ===');
  for (const [rel, maxL] of CODE_FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono') && !txt.includes('#800000'), `Limpio (0 emojis/font-mono/#800000): ${rel}`);
  }
  const catPath = path.resolve('public/assets/covers/cover_catalog.json'), catLines = fs.readFileSync(catPath, 'utf8').split(/\r?\n/).length;
  const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  const diaCnt = (cat.covers || []).filter(c => c.estilo === 'dia').length, nocCnt = (cat.covers || []).filter(c => c.estilo === 'nocturno').length;
  ok(catLines < 180 && cat.covers?.length === 12 && diaCnt === 6 && nocCnt === 6 && cat.covers.every(c => c.panelBg && c.poster && c.motion && c.status === 'available'),
    `cover_catalog.json válido (${catLines}L < 180L, 12 portadas: ${diaCnt} dia + ${nocCnt} nocturno)`);

  for (const [r, , wRel, mRel] of RUBROS_DIA) {
    const wAbs = path.resolve(`public${wRel}`), mAbs = path.resolve(`public${mRel}`);
    const wSz = fs.statSync(wAbs).size, mSz = fs.statSync(mAbs).size;
    const pw = JSON.parse(execSync(`ffprobe -v error -show_entries stream=width,height -of json "${wAbs}"`, { encoding: 'utf8' })).streams?.[0] || {};
    const pm = JSON.parse(execSync(`ffprobe -v error -show_entries format=duration -show_entries stream=codec_type,codec_name,pix_fmt,width,height -of json "${mAbs}"`, { encoding: 'utf8' }));
    const aud = (pm.streams || []).filter(s => s.codec_type === 'audio').length, vid = (pm.streams || []).find(s => s.codec_type === 'video') || {};
    ok(wSz <= 92160 && pw.height > pw.width && mSz <= 665600 && aud === 0 && vid.codec_name === 'h264' && vid.pix_fmt === 'yuv420p' && vid.height > vid.width,
      `Media Día [${r}]: webp=${(wSz / 1024).toFixed(1)}KB (${pw.width}x${pw.height}), mp4=${(mSz / 1024).toFixed(1)}KB (${vid.width}x${vid.height}, dur=${Number(pm.format?.duration || 0).toFixed(2)}s, audio=${aud})`);
  }
  ok(!fs.existsSync('dist/temp'), 'dist/ limpio sin carpeta temp/');
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function checkViewport(cdp, vp) {
  await cdp.goto('/');
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(window.ShowcaseCore)`)) break; await wait(120); }
  for (const [r, sr, wRel, mRel] of RUBROS_DIA) {
    await cdp.evalJs(`window.ShowcaseCore.selectRubro('${sr}')`);
    for (let t = 0; t < 25; t++) {
      if (await cdp.evalJs(`(() => { const i = document.getElementById('showroom-cover-bg'), s = document.querySelector('#showroom-cover-video source'); return Boolean(i?.complete && i.naturalWidth > 0 && i.getAttribute('src') === '${wRel}' && s?.getAttribute('src') === '${mRel}'); })()`)) break;
      await wait(100);
    }
    const sRes = await cdp.evalJs(`(() => {
      const i = document.getElementById('showroom-cover-bg'), v = document.getElementById('showroom-cover-video'), sc = document.getElementById('showroom-cover-scrim');
      return {
        wSrc: i?.getAttribute('src'), iOk: Boolean(i?.complete && i?.naturalWidth > 0),
        mSrc: v?.querySelector('source')?.getAttribute('src'), vOk: Boolean(v?.muted && v?.loop && v?.playsInline),
        scrim: sc?.className || '', ov: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    ok(sRes.wSrc === wRel && sRes.iOk && sRes.mSrc === mRel && sRes.vOk && cdp.mediaOk.has(wRel) && sRes.scrim.includes('to-transparent') && !sRes.ov,
      `${vp.n} Showroom [${r}]: Luz de Día *_02 WebP+MP4 ok, scrim luminoso, 0 overflow`);
  }

  for (const [r, , wRel, mRel] of RUBROS_DIA) {
    await cdp.goto(`/turnero.html?rubro=${r}`);
    for (let t = 0; t < 25; t++) {
      if (await cdp.evalJs(`(() => { const v = document.getElementById('cover-bg-video'), i = document.getElementById('cover-bg-img'); return Boolean(v && i?.complete && i.naturalWidth > 0 && (v.readyState >= 1 || ${cdp.mediaOk.has(mRel)})); })()`)) break;
      await wait(120);
    }
    const tRes = await cdp.evalJs(`(() => {
      const i = document.getElementById('cover-bg-img'), v = document.getElementById('cover-bg-video'), sc = document.getElementById('cover-scrim');
      return {
        wSrc: i?.getAttribute('src'), iOk: Boolean(i?.complete && i?.naturalWidth > 0),
        mSrc: v?.querySelector('source')?.getAttribute('src'), vOk: Boolean(v?.muted && v?.loop && v?.playsInline),
        scrim: sc?.className || '', ov: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    ok(tRes.wSrc === wRel && tRes.iOk && tRes.mSrc === mRel && tRes.vOk && cdp.mediaOk.has(wRel) && tRes.scrim.includes('to-transparent') && !tRes.ov,
      `${vp.n} Turnero [${r}]: default dia *_02 WebP+MP4 ok, scrim to-transparent, 0 overflow`);
  }

  for (const [label, url, expW, expM] of [
    ['?estilo=nocturno', '/turnero.html?rubro=peluqueria&estilo=nocturno', '/assets/covers/peluqueria/oficio_vapor_01.webp', '/assets/covers/peluqueria/oficio_vapor_01.mp4'],
    ['?cover=estetica-calma-vela-01', '/turnero.html?cover=estetica-calma-vela-01', '/assets/covers/estetica/calma_vela_01.webp', '/assets/covers/estetica/calma_vela_01.mp4']
  ]) {
    await cdp.goto(url);
    for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`document.getElementById('cover-bg-img')?.getAttribute('src') === '${expW}'`)) break; await wait(100); }
    const vr = await cdp.evalJs(`(() => ({ w: document.getElementById('cover-bg-img')?.getAttribute('src'), m: document.querySelector('#cover-bg-video source')?.getAttribute('src') }))()`);
    ok(vr.w === expW && vr.m === expM, `${vp.n} Variante ${label}: carga ${expW} + ${expM}`);
  }
}

async function main() {
  runStaticAndFfprobe();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-109'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const vp of [{ n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }, { n: 'Móvil 375x667', w: 375, h: 667, mob: true }]) {
      console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await checkViewport(cdp, vp);
    }
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-109]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });