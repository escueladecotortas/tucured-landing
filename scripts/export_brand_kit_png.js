// Archivo: scripts/export_brand_kit_png.js
// Generador oficial del Kit PNG de Marca Tucu Red vía Chrome Headless CDP (<= 180L)

import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT_CDP = 9244;
const OUT_DIR = path.resolve('assets/brand_kit_png');
const LOGO_SVG = fs.readFileSync(path.resolve('assets/tucu_red_logo.svg'), 'utf8');
const FULL_SVG = fs.readFileSync(path.resolve('assets/tucu_red_logo_full.svg'), 'utf8');
const PROFILE_SVG = LOGO_SVG.replace('width="360" height="100" viewBox="0 0 360 100"', 'width="256" height="82" viewBox="52 5 256 82"');
const STACKED_SVG = `<svg width="240" height="200" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradStacked" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F97316"/><stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
    <style>
      .brand-wordmark{font-family:'Plus Jakarta Sans','Outfit',system-ui,sans-serif;font-weight:800;letter-spacing:-0.025em}
    </style>
  </defs>
  <text x="120" y="84" text-anchor="middle" font-size="68" class="brand-wordmark brand-word-primary" fill="#1C1917">Tucu</text>
  <path d="M 181 95 C 181 114, 80 94, 80 113" fill="none" stroke="url(#gradStacked)" stroke-width="5.6" stroke-linecap="round"/>
  <circle cx="181" cy="95" r="5.2" fill="#F97316" stroke="#FFFFFF" stroke-width="1.8" class="brand-cut-stroke"/>
  <text x="120" y="170" text-anchor="middle" font-size="68" class="brand-wordmark" fill="#EA580C">Red</text>
</svg>`;
const ICON_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="24" fill="#1C1917"/>
  <text x="50" y="73" text-anchor="middle" font-family="'Plus Jakarta Sans','Outfit',sans-serif" font-weight="800" font-size="46" letter-spacing="-2">
    <tspan fill="#FFFFFF">T</tspan><tspan fill="#EA580C">R</tspan>
  </text>
  <path d="M 38 34 C 44 18, 59 18, 66 29" fill="none" stroke="#F97316" stroke-width="5" stroke-linecap="round"/>
  <circle cx="38" cy="34" r="4.4" fill="#F97316" stroke="#1C1917" stroke-width="1.6"/>
</svg>`;

const SPECS = [
  { name: 'ig_perfil_claro_1080x1080.png', w: 1080, h: 1080, bg: '#FFFFFF', svg: 'profile', pct: 88 },
  { name: 'ig_perfil_oscuro_1080x1080.png', w: 1080, h: 1080, bg: '#1C1917', svg: 'profile', pct: 88, dark: true },
  { name: 'ig_perfil_transparente_1080x1080.png', w: 1080, h: 1080, bg: 'transparent', svg: 'profile', pct: 88 },
  { name: 'ig_perfil_apilado_claro_1080x1080.png', w: 1080, h: 1080, bg: '#FFFFFF', svg: 'stacked', pct: 74 },
  { name: 'ig_perfil_apilado_oscuro_1080x1080.png', w: 1080, h: 1080, bg: '#1C1917', svg: 'stacked', pct: 74, dark: true },
  { name: 'ig_post_eslogan_claro_1080x1080.png', w: 1080, h: 1080, bg: '#FFFFFF', svg: 'full', pct: 78 },
  { name: 'ig_post_eslogan_oscuro_1080x1080.png', w: 1080, h: 1080, bg: '#1C1917', svg: 'full', pct: 78, dark: true },
  { name: 'fb_perfil_1080x1080.png', w: 1080, h: 1080, bg: '#FFFFFF', svg: 'profile', pct: 88 },
  { name: 'fb_portada_clara_1640x924.png', w: 1640, h: 924, bg: '#FFFFFF', svg: 'full', pct: 56 },
  { name: 'fb_portada_oscura_1640x924.png', w: 1640, h: 924, bg: '#1C1917', svg: 'full', pct: 56, dark: true },
  { name: 'wa_perfil_claro_640x640.png', w: 640, h: 640, bg: '#FFFFFF', svg: 'profile', pct: 88 },
  { name: 'wa_perfil_oscuro_640x640.png', w: 640, h: 640, bg: '#1C1917', svg: 'profile', pct: 88, dark: true },
  { name: 'web_header_transparente_claro_1600x440.png', w: 1600, h: 440, bg: 'transparent', svg: 'logo', pct: 92 },
  { name: 'web_header_transparente_oscuro_1600x440.png', w: 1600, h: 440, bg: 'transparent', svg: 'logo', pct: 92, dark: true },
  { name: 'web_header_eslogan_transparente_1600x440.png', w: 1600, h: 440, bg: 'transparent', svg: 'full', pct: 92 },
  { name: 'app_icon_512x512.png', w: 512, h: 512, bg: 'transparent', svg: 'icon', pct: 92 },
  { name: 'app_icon_192x192.png', w: 192, h: 192, bg: 'transparent', svg: 'icon', pct: 92 },
  { name: 'app_icon_32x32.png', w: 32, h: 32, bg: 'transparent', svg: 'icon', pct: 96 }
];

const SVG_MAP = { logo: LOGO_SVG, full: FULL_SVG, profile: PROFILE_SVG, stacked: STACKED_SVG, icon: ICON_SVG };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const req = http.request(u, { method: m }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); });
  req.on('error', rej); req.end();
});
const readIhdr = (buf) => ({ w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) });

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    });
    await this.send('Page.enable'); await this.send('Runtime.enable');
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  close() { try { this.ws.close(); } catch {} }
}

function buildHtml(spec) {
  const rawSvg = SVG_MAP[spec.svg];
  const darkCss = spec.dark
    ? `.brand-word-primary { fill: #FFFFFF !important; } .brand-slogan { fill: #FDBA74 !important; } .brand-cut-stroke { stroke: ${spec.bg === 'transparent' ? 'transparent' : '#1C1917'} !important; }`
    : (spec.bg === 'transparent' ? `.brand-cut-stroke { stroke-opacity: 0 !important; }` : '');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      html,body{width:100%;height:100%;overflow:hidden;background:${spec.bg};display:flex;align-items:center;justify-content:center}
      .stage{width:${spec.pct}%;height:${spec.pct}%;display:flex;align-items:center;justify-content:center}
      .stage svg{width:100%;height:100%;max-width:100%;max-height:100%;display:block}
      ${darkCss}
    </style></head><body><div class="stage">${rawSvg}</div></body></html>`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const userDataDir = path.resolve('.tmp-cdp-export');
  try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some((t) => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find((t) => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();
    const { frameTree } = await cdp.send('Page.getFrameTree');
    const frameId = frameTree.frame.id;

    for (const s of SPECS) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: 1, mobile: false });
      const bg = s.bg === 'transparent' ? { r: 0, g: 0, b: 0, a: 0 } : (s.bg === '#1C1917' ? { r: 28, g: 25, b: 23, a: 1 } : { r: 255, g: 255, b: 255, a: 1 });
      await cdp.send('Emulation.setDefaultBackgroundColorOverride', { color: bg });
      await cdp.send('Page.setDocumentContent', { frameId, html: buildHtml(s) });
      await cdp.send('Runtime.evaluate', {
        expression: `document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))`,
        awaitPromise: true
      });
      await wait(s.name === SPECS[0].name ? 450 : 160);
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(shot.data, 'base64');
      const dim = readIhdr(buf);
      if (dim.w !== s.w || dim.h !== s.h) throw new Error(`Dimensión inválida en ${s.name}: ${dim.w}x${dim.h}`);
      fs.writeFileSync(path.join(OUT_DIR, s.name), buf);
      console.log(`  [PNG OK] ${s.name.padEnd(44)} ${dim.w}x${dim.h} (${buf.length} bytes)`);
    }
    fs.copyFileSync(path.join(OUT_DIR, 'app_icon_32x32.png'), path.resolve('public/favicon.png'));
    console.log('  [COPY OK] public/favicon.png <- app_icon_32x32.png');
    cdp.close();
  } finally {
    chrome.kill('SIGKILL');
    await wait(250);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
