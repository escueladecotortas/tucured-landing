// Archivo: scripts/verify_task107_cover_motion_lookup.js
// Compuerta QA + E2E [TASK-107]: Portada Viva Calma de Vela, Semillita, Lookup Seguro y Paridad

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4207, PORT_CDP = 9262, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const CODE_FILES = [
  ['public/turnero.html', 100], ['public/js/admin_shared/turnero_ticket_lookup.js', 185],
  ['public/js/admin_shared/turnero_cover_data.js', 180], ['public/js/admin_shared/turnero_cover_ui.js', 170],
  ['public/js/admin_shared/turnero_app.js', 195], ['js/showcase_v11/showcase_state.js', 160],
  ['js/showcase_v11/showcase_cover.js', 130], ['scripts/verify_task107_cover_motion_lookup.js', 190]
];
const SYNC_FILES = [
  'public/assets/covers/cover_catalog.json', 'public/assets/covers/estetica/calma_vela_01.webp',
  'public/assets/covers/estetica/calma_vela_01.mp4', 'public/turnero.html',
  'public/js/admin_shared/turnero_cover_data.js', 'public/js/admin_shared/turnero_cover_ui.js',
  'public/js/admin_shared/turnero_ticket_lookup.js', 'public/js/admin_shared/turnero_app.js'
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
        if (r?.url?.startsWith(BASE) && (r.url.includes('calma_vela_01') || r.url.includes('.webp')) && [200, 206, 304].includes(r.status)) this.mediaOk.add(new URL(r.url).pathname);
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, MEDIA ffprobe & PARIDAD SHA-256 [TASK-107] ===');
  for (const [rel, maxL] of CODE_FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/') && !rel.endsWith('showcase_state.js')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono') && !txt.includes('#800000'), `Limpio (0 emojis, 0 font-mono, 0 #800000): ${rel}`);
  }
  const cat = JSON.parse(fs.readFileSync(path.resolve('public/assets/covers/cover_catalog.json'), 'utf8'));
  const pilot = cat.covers?.find(c => c.id === 'estetica-calma-vela-01');
  ok(cat.covers?.length === 6 && pilot?.motion === '/assets/covers/estetica/calma_vela_01.mp4', 'cover_catalog.json válido (6 fichas + piloto Calma de Vela)');

  const wSize = fs.statSync('public/assets/covers/estetica/calma_vela_01.webp').size;
  const mSize = fs.statSync('public/assets/covers/estetica/calma_vela_01.mp4').size;
  const probe = JSON.parse(execSync('ffprobe -v error -show_entries stream=codec_type,codec_name,pix_fmt -of json "public/assets/covers/estetica/calma_vela_01.mp4"', { encoding: 'utf8' }));
  const audioCnt = (probe.streams || []).filter(s => s.codec_type === 'audio').length;
  const v = (probe.streams || []).find(s => s.codec_type === 'video');
  ok(wSize <= 92160 && mSize <= 665600 && audioCnt === 0 && v?.codec_name === 'h264' && v?.pix_fmt === 'yuv420p',
    `Media OK: webp=${Math.round(wSize / 1024)}KB <=90KB, mp4=${Math.round(mSize / 1024)}KB <=650KB, audio=${audioCnt}, h264/yuv420p`);
  ok(!fs.existsSync('dist/temp'), 'dist/ limpio sin carpeta temp/');
  for (const rel of SYNC_FILES) ok(fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel)), `Paridad SHA-256: ${rel}`);
}

async function runTurneroFlow(cdp, vp, lvl) {
  await cdp.goto(`/turnero.html?rubro=estetica&level=${lvl}`);
  await cdp.evalJs('localStorage.clear()');
  await cdp.goto(`/turnero.html?rubro=estetica&level=${lvl}`);
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('cover-bg-video') && document.getElementById('cover-bg-img')?.complete)`)) break; await wait(120); }
  const cov = await cdp.evalJs(`(() => {
    const v = document.getElementById('cover-bg-video'), img = document.getElementById('cover-bg-img');
    return { vOk: Boolean(v && v.muted && v.loop && v.playsInline), src: v?.querySelector('source')?.getAttribute('src'), pOk: Boolean(img?.complete && img?.naturalWidth > 0), ov: document.documentElement.scrollWidth > window.innerWidth };
  })()`);
  ok(cov.vOk && cov.src === '/assets/covers/estetica/calma_vela_01.mp4' && cov.pOk && cdp.mediaOk.has('/assets/covers/estetica/calma_vela_01.webp') && !cov.ov,
    `${vp.n} [${lvl}]: Portada Viva (<video> muted/loop/playsinline + poster HTTP 200 + 0 overflow)`);

  await cdp.goto(`/turnero.html?rubro=estetica&level=${lvl}&motion=0`);
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('cover-bg-img'))`)) break; await wait(100); }
  ok(await cdp.evalJs(`!document.getElementById('cover-bg-video') && Boolean(document.getElementById('cover-bg-img'))`), `${vp.n} [${lvl}]: ?motion=0 suprime <video> y deja poster`);

  await cdp.goto(`/turnero.html?rubro=estetica&level=${lvl}`);
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-step1-next') || document.getElementById('btn-cover-reservar'))`)) break; await wait(100); }
  if (vp.mob) { await cdp.evalJs(`document.getElementById('btn-cover-reservar').click()`); await wait(260); }
  const code = await cdp.evalJs(`(async () => {
    const w = (ms=100) => new Promise(r => setTimeout(r, ms));
    document.getElementById('btn-step1-next').click(); await w();
    document.getElementById('inp-client-phone').value = '3815557788'; document.getElementById('inp-client-first').value = 'Sofía'; document.getElementById('inp-client-last').value = 'Mora';
    document.getElementById('btn-step2-next').click(); await w();
    document.getElementById('btn-confirm-booking').click(); await w(150);
    return (document.body.innerText.match(/TK-[A-Z0-9]{4}/) || [''])[0];
  })()`);
  ok(/^TK-/.test(code), `${vp.n} [${lvl}]: Reserva confirmada (${code})`);

  await cdp.goto(`/turnero.html?rubro=estetica&level=${lvl}`);
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-cover-active-ticket'))`)) break; await wait(100); }
  const seedModal = await cdp.evalJs(`(async () => {
    const w = (ms=120) => new Promise(r => setTimeout(r, ms));
    document.getElementById('btn-cover-active-ticket')?.click(); await w();
    const okTxt = document.getElementById('tucu-ticket-modal-overlay')?.innerText.includes('${code}');
    document.getElementById('btn-close-ticket-modal')?.click(); await w();
    return okTxt;
  })()`);
  ok(seedModal, `${vp.n} [${lvl}]: Semillita abre TucuTicketModal (${code})`);

  const lkp = await cdp.evalJs(`(async () => {
    const w = (ms=120) => new Promise(r => setTimeout(r, ms));
    document.getElementById('btn-cover-lookup')?.click(); await w(80);
    document.getElementById('inp-lookup-code').value = '${code}'; document.getElementById('inp-lookup-last4').value = '0000';
    document.getElementById('btn-lookup-submit').click(); await w(80);
    const rejErr = document.getElementById('lookup-code-error')?.innerText || '';
    document.getElementById('tab-lookup-resend').click(); await w(60);
    document.getElementById('inp-lookup-wa').value = '3819991111'; document.getElementById('btn-lookup-resend').click(); await w(60);
    const waMsg = document.getElementById('lookup-resend-notice')?.innerText || '';
    document.getElementById('tab-lookup-code').click(); await w(60);
    document.getElementById('inp-lookup-last4').value = '7788'; document.getElementById('btn-lookup-submit').click(); await w(120);
    const opened = document.getElementById('tucu-ticket-modal-overlay')?.innerText.includes('${code}');
    document.getElementById('btn-ask-cancel')?.click(); await w(60);
    document.getElementById('btn-confirm-cancel')?.click(); await w(100);
    document.getElementById('btn-close-ticket-modal')?.click(); await w(140);
    return { rejErr, waMsg, opened, seedGone: !document.getElementById('btn-cover-active-ticket') };
  })()`);
  ok(lkp.rejErr.includes('No encontramos') && lkp.waMsg.includes('Si tenés un turno activo') && lkp.opened && lkp.seedGone,
    `${vp.n} [${lvl}]: Lookup valida código+4 dígitos, WA neutro y cancelación limpia semillita`);
}

async function runShowroomCheck(cdp, vp) {
  await cdp.goto('/');
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(window.ShowcaseCore)`)) break; await wait(120); }
  await cdp.evalJs(`window.ShowcaseCore.selectRubro('estetica')`);
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('showroom-cover-video'))`)) break; await wait(100); }
  const sr = await cdp.evalJs(`(() => { const v = document.getElementById('showroom-cover-video'); return Boolean(v && v.muted && v.loop && v.playsInline && v.querySelector('source')?.getAttribute('src') === '/assets/covers/estetica/calma_vela_01.mp4'); })()`);
  ok(sr, `${vp.n}: Showroom landing monta video Calma de Vela al elegir Estética`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-107'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const vp of [{ n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }, { n: 'Móvil 375x667', w: 375, h: 667, mob: true }]) {
      console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      for (const lvl of (vp.mob ? ['l1', 'l2', 'l3'] : ['l1'])) await runTurneroFlow(cdp, vp, lvl);
      await runShowroomCheck(cdp, vp);
    }
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-107]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });