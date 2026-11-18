// Archivo: scripts/verify_task091_official_brand_promotion.js
// Compuerta QA + E2E [TASK-091]: Promoción Propuesta A, Kit PNG 16 archivos & Paridad SHA-256

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { spawn } from 'child_process';

const PORT_APP = 4191;
const PORT_CDP = 9245;
const BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const PNG_SPECS = [
  ['ig_perfil_claro_1080x1080.png', 1080, 1080], ['ig_perfil_oscuro_1080x1080.png', 1080, 1080],
  ['ig_perfil_transparente_1080x1080.png', 1080, 1080], ['ig_perfil_apilado_claro_1080x1080.png', 1080, 1080],
  ['ig_perfil_apilado_oscuro_1080x1080.png', 1080, 1080], ['ig_post_eslogan_claro_1080x1080.png', 1080, 1080],
  ['ig_post_eslogan_oscuro_1080x1080.png', 1080, 1080], ['fb_perfil_1080x1080.png', 1080, 1080],
  ['fb_portada_clara_1640x924.png', 1640, 924], ['fb_portada_oscura_1640x924.png', 1640, 924],
  ['wa_perfil_claro_640x640.png', 640, 640], ['wa_perfil_oscuro_640x640.png', 640, 640],
  ['web_header_transparente_claro_1600x440.png', 1600, 440], ['web_header_transparente_oscuro_1600x440.png', 1600, 440],
  ['web_header_eslogan_transparente_1600x440.png', 1600, 440], ['app_icon_512x512.png', 512, 512],
  ['app_icon_192x192.png', 192, 192], ['app_icon_32x32.png', 32, 32]
];

const SYNC_FILES = [
  'assets/legacy/tucu_red_logo_legacy.svg', 'assets/tucu_red_logo.svg', 'public/assets/tucu_red_logo.svg',
  'assets/tucu_red_logo_full.svg', 'public/assets/tucu_red_logo_full.svg', 'public/favicon.png',
  'public/assets/brand_kit_png/app_icon_192x192.png', 'public/admin_l1.html', 'public/admin_l2.html',
  'public/admin_l3.html', 'public/turnero.html', 'public/gestion_turno.html',
  ...PNG_SPECS.map(([n]) => `assets/brand_kit_png/${n}`)
];

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const req = http.request(u, { method: m }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); });
  req.on('error', rej); req.end();
});

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && m.params?.response?.status >= 400) {
        this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
      }
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(650); }
  async evalJs(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error');
    return r.result?.value;
  }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, LIMPIEZA, LEY 200L Y KIT PNG ===');
  ok(!fs.existsSync(path.resolve('assets/brand_proposals')), 'Eliminada carpeta temporal assets/brand_proposals/');
  ok(!fs.existsSync(path.resolve('public/brand_preview.html')), 'Eliminado temporal public/brand_preview.html');
  ok(!fs.existsSync(path.resolve('scripts/verify_task091_brand_proposals.js')), 'Eliminado script exploratorio previo');

  const codeFiles = [
    'index.html', 'js/components/navbar.js', 'js/components/footer.js', 'scripts/export_brand_kit_png.js',
    'public/admin_l1.html', 'public/admin_l2.html', 'public/admin_l3.html', 'public/turnero.html', 'public/gestion_turno.html',
    'assets/legacy/tucu_red_logo_legacy.svg', 'assets/tucu_red_logo.svg', 'public/assets/tucu_red_logo.svg',
    'assets/tucu_red_logo_full.svg', 'public/assets/tucu_red_logo_full.svg'
  ];
  for (const rel of codeFiles) {
    const abs = path.resolve(rel), lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/).length;
    ok(lines <= 180, `${rel} cumple Ley 200L (${lines}L <= 180L)`);
  }
  for (const [name, w, h] of PNG_SPECS) {
    const p = path.resolve('assets/brand_kit_png', name);
    const buf = fs.existsSync(p) ? fs.readFileSync(p) : null;
    const iw = buf ? buf.readUInt32BE(16) : 0, ih = buf ? buf.readUInt32BE(20) : 0;
    ok(Boolean(buf) && iw === w && ih === h && buf.length > 900, `PNG ${name}: ${iw}x${ih} (${buf ? buf.length : 0} bytes)`);
  }
  console.log('\n=== 2. PARIDAD SHA-256 CON TUCURED-ENGINE ===');
  for (const rel of SYNC_FILES) {
    const a = path.resolve(rel), b = path.join(ENGINE, rel);
    ok(fs.existsSync(a) && fs.existsSync(b) && sha(a) === sha(b), `Paridad SHA-256: ${rel}`);
  }
  ok(sha(path.resolve('public/assets/tucu_red_logo_full.svg')) === sha(path.join(ENGINE, 'public/tucu_red_logo_full.svg')), 'Paridad SHA-256: engine/public/tucu_red_logo_full.svg');
}

async function main() {
  runStatic();
  console.log('\n=== 3. AUDITORÍA E2E EN VITE PREVIEW (DESKTOP + MÓVIL 375x667) ===');
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-091-final');
  try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', (res) => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some((t) => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find((t) => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();

    for (const vp of [{ n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }, { n: 'Móvil 375x667', w: 375, h: 667, mob: true }]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await cdp.goto('/');
      for (let t = 0; t < 20; t++) {
        const ready = await cdp.evalJs(`Boolean(document.querySelector('#app-navbar img')?.complete && document.querySelector('#app-footer img')?.complete)`);
        if (ready) break;
        await wait(200);
      }
      const res = await cdp.evalJs(`(() => {
        const nav = document.querySelector('#app-navbar img');
        const foot = document.querySelector('#app-footer img');
        const fav = document.querySelector('link[rel="icon"][type="image/png"]')?.getAttribute('href') || '';
        return {
          navOk: Boolean(nav && nav.getAttribute('src') === '/assets/tucu_red_logo.svg' && nav.complete && nav.naturalWidth > 0),
          footOk: Boolean(foot && foot.getAttribute('src') === '/assets/tucu_red_logo_full.svg' && foot.complete && foot.naturalWidth > 0),
          favOk: fav === '/favicon.png', overflow: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`);
      ok(res.navOk, `${vp.n}: Navbar carga /assets/tucu_red_logo.svg`);
      ok(res.footOk, `${vp.n}: Footer carga /assets/tucu_red_logo_full.svg`);
      ok(res.favOk && !res.overflow, `${vp.n}: Favicon configurado y 0 overflow`);
    }

    for (const route of ['/admin_l1.html', '/admin_l2.html', '/admin_l3.html', '/turnero.html', '/gestion_turno.html']) {
      await cdp.goto(route);
      const okFav = await cdp.evalJs(`document.querySelector('link[rel="icon"]')?.getAttribute('href') === '/favicon.png'`);
      ok(okFav, `${route} incluye favicon oficial y carga limpia`);
    }
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.log('  [INFO]', { errors: cdp.errors, httpBad: cdp.httpBad });
    cdp.close();
  } finally {
    chrome.kill('SIGKILL'); preview.kill('SIGKILL');
    await wait(250);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESULTADO FINAL [TASK-091]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
