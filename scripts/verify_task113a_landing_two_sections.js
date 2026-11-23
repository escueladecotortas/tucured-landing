// Archivo: scripts/verify_task113a_landing_two_sections.js
// Compuerta QA + E2E [TASK-113A]: Landing en 2 Secciones + Renombre Esencial / Gestion / Equipos (< 190L)

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4218, PORT_CDP = 9273, BASE = `http://127.0.0.1:${PORT_APP}`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN_STYLE_RX = /#800000|#991B1B|#A82222|128,\s*0,\s*0|\bfont-mono\b/i;
const OLD_NAMES_RX = /Aut[oó]nomo|Central\s+Pro|Multi[\s-]Staff|Ticket\s+Online/i;

const TOUCHED_FILES = [
  'index.html', 'js/components/pricing.js', 'js/components/faq_accordion.js', 'js/components/features.js',
  'js/components/funnel_data.js', 'js/components/funnel.js', 'js/components/funnel_markup.js',
  'js/components/funnel_checkout_markup.js', 'js/components/hero_markup.js', 'js/components/navbar.js',
  'js/utils/whatsapp_link.js', 'js/components/stage_unified.js',
  'js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_v2_ui.js', 'js/showcase_v11/showcase_admin_ui.js',
  'js/showcase_v11/showcase_controller.js', 'js/showcase_v11/showcase_modal_mobile.js'
];

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); }); q.on('error', rej); q.end(); });

const maxLinesFor = (rel) => {
  if (rel.endsWith('showcase_state.js')) return 165;
  if (rel.endsWith('showcase_admin_ui.js')) return 160;
  if (rel.endsWith('showcase_v2_ui.js') || rel.startsWith('scripts/')) return 190;
  if (rel.endsWith('showcase_controller.js')) return 180;
  if (rel.endsWith('showcase_modal_mobile.js')) return 130;
  return 200;
};

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params.response.url.endsWith('/favicon.ico') && m.params.response.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) {
    await this.send('Page.navigate', { url: BASE + u });
    for (let i = 0; i < 40; i++) {
      await wait(120);
      const ready = await this.evalJs("document.readyState === 'complete' && Boolean(document.getElementById('showroom-admin'))").catch(() => false);
      if (ready) break;
    }
    await wait(180);
  }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA + BUNDLE RENOMBRE GLOBAL (17 ARCHIVOS + QA) ===');
  const all = [...TOUCHED_FILES, 'scripts/verify_task113a_landing_two_sections.js'];
  const badLen = [], badAst = [], badEmoji = [], badStyle = [];
  for (const rel of all) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    if (lines.length >= maxLinesFor(rel) || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
    if (!rel.startsWith('scripts/') && EMOJI_RX.test(txt)) badEmoji.push(rel);
    if (!rel.startsWith('scripts/') && FORBIDDEN_STYLE_RX.test(txt)) badStyle.push(rel);
  }
  ok(badLen.length === 0, `Todos dentro del límite (<130/<160/<180/<190/<200L) y header Archivo OK (${all.length} archivos; fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `Sintaxis AST node --check OK (fallos=${badAst.join(',') || '0'})`);
  ok(badEmoji.length === 0 && badStyle.length === 0, `0 emojis y 0 #800000/font-mono en landing (emojis=${badEmoji.length}, style=${badStyle.length})`);

  const distHtml = fs.readFileSync(path.resolve('dist/index.html'), 'utf8');
  const distAssets = fs.readdirSync(path.resolve('dist/assets')).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.resolve('dist/assets', f), 'utf8')).join('\n');
  const hasOldBundle = OLD_NAMES_RX.test(distHtml) || OLD_NAMES_RX.test(distAssets) || /\bpase\b|\bticket\b/i.test(distAssets);
  ok(!hasOldBundle, '0 ocurrencias de Autónomo / Central Pro / Multi-Staff / pase / ticket en dist/index.html y bundle JS');
}

async function runDesktopE2E(cdp) {
  console.log('\n=== 2. E2E DESKTOP 1280x800 (2 SECCIONES + SINCRONIZACIÓN) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/');

  const layout = await cdp.evalJs(`(() => {
    const c = document.getElementById('showroom-cliente')?.getBoundingClientRect();
    const a = document.getElementById('showroom-admin')?.getBoundingClientRect();
    const txt = document.body.innerText || '';
    const lvlsInSec1 = document.querySelectorAll('#showroom-cliente [data-showroom-level]').length;
    const cUrl = document.getElementById('showroom-client-iframe')?.getAttribute('src') || '';
    const aUrl = document.getElementById('showroom-admin-iframe')?.getAttribute('src') || '';
    const tabs = Array.from(document.querySelectorAll('#showroom-admin [data-showroom-level]')).map(b => b.textContent.trim());
    return { ov: document.documentElement.scrollWidth > document.documentElement.clientWidth, ordered: Boolean(c && a && c.bottom <= a.top + 4), badTxt: /(Aut[oó]nomo|Central\\s*Pro|Multi[- ]?Staff|\\bpase\\b|\\bticket\\b)/i.test(txt), lvlsInSec1, cUrl, aUrl, tabs };
  })()`);
  ok(!layout.ov && layout.ordered, 'Desktop 1280: 0 overflow-x y #showroom-cliente arriba de #showroom-admin');
  ok(!layout.badTxt, 'Desktop 1280: 0 textos visibles residuales (Autónomo/Central Pro/Multi-Staff/pase/ticket)');
  ok(layout.lvlsInSec1 === 0 && layout.cUrl.includes('/turnero.html?rubro=peluqueria&level=l1&embed=1'), `Desktop 1280 Sec 1 sin selector de 3 planes e iframe Turnero l1 (${layout.cUrl})`);
  ok(layout.tabs.join('|') === 'Esencial|Gestión|Equipos' && layout.aUrl.includes('/admin_l1.html'), `Desktop 1280 Sec 2 muestra Esencial|Gestión|Equipos e iframe l1 (${layout.aUrl})`);

  await cdp.evalJs("document.getElementById('chk-client-multistaff')?.click()"); await wait(200);
  const cUrlL3 = await cdp.evalJs("document.getElementById('showroom-client-iframe')?.getAttribute('src') || ''");
  ok(cUrlL3.includes('level=l3'), `Desktop 1280 Sec 1 toggle Modo Equipos cambia iframe a level=l3 (${cUrlL3})`);

  await cdp.evalJs("document.getElementById('btn-showroom-level-l2')?.click()"); await wait(180);
  const aUrlL2 = await cdp.evalJs("document.getElementById('showroom-admin-iframe')?.getAttribute('src') || ''");
  await cdp.evalJs("document.getElementById('btn-showroom-level-l3')?.click()"); await wait(180);
  const aUrlL3 = await cdp.evalJs("document.getElementById('showroom-admin-iframe')?.getAttribute('src') || ''");
  ok(aUrlL2.includes('/admin_l2.html') && aUrlL3.includes('/admin_l3.html'), 'Desktop 1280 Sec 2 alterna iframes entre admin_l2 y admin_l3');

  await cdp.evalJs("document.getElementById('showroom-rubro-btn-salud')?.click()"); await wait(220);
  const synced = await cdp.evalJs("({ c: document.getElementById('showroom-client-iframe')?.getAttribute('src') || '', a: document.getElementById('showroom-admin-iframe')?.getAttribute('src') || '' })");
  ok(synced.c.includes('rubro=salud') && synced.a.includes('rubro=salud_consultorio'), `Desktop 1280 rubro salud sincroniza ambas secciones (${synced.c} | ${synced.a})`);
}

async function runMobileE2E(cdp) {
  console.log('\n=== 3. E2E MÓVIL 375x667 (CARRUSEL + POP-UPS 100dvh TURNERO Y ADMIN) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/');

  const ov = await cdp.evalJs('document.documentElement.scrollWidth > document.documentElement.clientWidth');
  ok(!ov, 'Mobile 375: 0 overflow horizontal');

  const s0 = await cdp.evalJs("document.getElementById('showroom-rubro-track')?.scrollLeft || 0");
  await wait(700);
  const s1 = await cdp.evalJs("document.getElementById('showroom-rubro-track')?.scrollLeft || 0");
  await cdp.evalJs("document.getElementById('showroom-rubro-btn-estetica')?.click()");
  const p0 = await cdp.evalJs("document.getElementById('showroom-rubro-track')?.scrollLeft || 0");
  await wait(350);
  const p1 = await cdp.evalJs("document.getElementById('showroom-rubro-track')?.scrollLeft || 0");
  await wait(3650);
  const s2 = await cdp.evalJs("document.getElementById('showroom-rubro-track')?.scrollLeft || 0");
  ok(s1 > s0 && Math.abs(p1 - p0) <= 1 && Math.abs(s2 - p1) > 0, `Mobile 375: carrusel auto-desliza (${s0}->${s1}), pausa (${p0}->${p1}) y reanuda (${s2})`);

  await cdp.evalJs("document.getElementById('btn-open-client-fullscreen')?.click()"); await wait(250);
  const mobClient = await cdp.evalJs("({ open: Boolean(document.getElementById('showroom-mobile-modal')), src: document.getElementById('showroom-mobile-iframe')?.getAttribute('src') || '', lock: document.body.style.overflow })");
  await cdp.evalJs("document.getElementById('btn-showroom-modal-close')?.click()"); await wait(120);
  const afterClose1 = await cdp.evalJs("({ closed: !document.getElementById('showroom-mobile-modal'), ov: document.body.style.overflow })");
  ok(mobClient.open && mobClient.src.includes('/turnero.html') && mobClient.lock === 'hidden' && afterClose1.closed && afterClose1.ov === '', `Mobile 375 Sec 1 pop-up 100dvh en Turnero y restaura scroll (${mobClient.src})`);

  await cdp.evalJs("document.getElementById('btn-showroom-level-l2')?.click()"); await wait(140);
  await cdp.evalJs("document.getElementById('btn-open-admin-fullscreen')?.click()"); await wait(220);
  const srcL2 = await cdp.evalJs("document.getElementById('showroom-mobile-iframe')?.getAttribute('src') || ''");
  await cdp.evalJs("document.getElementById('btn-showroom-modal-close')?.click()"); await wait(120);

  await cdp.evalJs("document.getElementById('btn-showroom-level-l3')?.click()"); await wait(140);
  await cdp.evalJs("document.getElementById('btn-open-admin-fullscreen')?.click()"); await wait(220);
  const srcL3 = await cdp.evalJs("document.getElementById('showroom-mobile-iframe')?.getAttribute('src') || ''");
  await cdp.evalJs("document.getElementById('btn-showroom-modal-close')?.click()"); await wait(120);
  const finalBodyOv = await cdp.evalJs('document.body.style.overflow');
  ok(srcL2.includes('/admin_l2.html') && srcL3.includes('/admin_l3.html') && finalBodyOv === '', `Mobile 375 Sec 2 pop-up 100dvh abre admin_l2 y admin_l3 y restaura scroll`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-113a'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await runDesktopE2E(cdp);
    await runMobileE2E(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-113A]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
