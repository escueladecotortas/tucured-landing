// Archivo: scripts/verify_task112a_audit_showroom_fixes.js
// Compuerta QA + E2E [TASK-112A]: Auditoria L1/L2/L3 + 3 Fixes Showroom V2 (< 190L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4214, PORT_CDP = 9269, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const LEGACY_RX = /Peluquería & Barbería Central|Aura Estética|Bistró & Parrilla El Encuentro|Complejo Deportivo & Pádel Norte|Consultorios Médicos San Martín|Estudio Jurídico & Contable Norte/i;
const RUBRO_NAMES = [
  ['peluqueria', 'Brava Barbería'], ['estetica', 'Siena Estética'], ['gastronomia', 'Brama Café & Bistró'],
  ['deportes', 'Norte Pádel Club'], ['salud', 'Alba Centro Médico'], ['servicios', 'Vértice Estudio']
];
const CODE_FILES = [
  ['.agent/audit/audit_features_l1_l2_l3.md', 175], ['public/js/admin_shared/admin_demo_seed.js', 165],
  ['public/js/admin_shared/turnero_catalog.js', 165], ['public/js/admin_shared/turnero_cover_data.js', 195],
  ['js/showcase_v11/showcase_carousel.js', 120], ['js/showcase_v11/showcase_v2_ui.js', 190],
  ['js/showcase_v11/showcase_controller.js', 170], ['scripts/verify_task112a_audit_showroom_fixes.js', 190]
];
const SYNC_FILES = CODE_FILES.slice(1, 4).map(x => x[0]);
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); }); q.on('error', rej); q.end(); });

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params.response.url.endsWith('/favicon.ico') && m.params.response.status >= 400) {
        this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, DOCS & PARIDAD SHA-256 [TASK-112A] ===');
  for (const [rel, maxL] of CODE_FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt), `Sin emojis: ${rel}`);
    if (rel.startsWith('public/') || rel.startsWith('js/')) ok(!txt.includes('font-mono') && !txt.includes('#800000') && (!rel.startsWith('js/') || !/\b(pase|ticket)\b/i.test(txt)), `Sin font-mono/#800000/pase/ticket: ${rel}`);
  }
  const auditTxt = fs.readFileSync('.agent/audit/audit_features_l1_l2_l3.md', 'utf8');
  ok(!fs.existsSync('.agent/docs/audit_features_l1_l2_l3.md') && /MATRIZ DE DIFERENCIAS REALES/i.test(auditTxt) && /TASK-112B/i.test(auditTxt),
    '.agent/audit/audit_features_l1_l2_l3.md actualizado y .agent/docs/audit_features_l1_l2_l3.md eliminado');
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function readDesktopFrameBiz(cdp, rubro, lvl = 'l1') {
  for (let i = 0; i < 40; i++) {
    const res = await cdp.evalJs(`(() => {
      const fr = document.getElementById('showroom-desktop-iframe'), src = fr?.getAttribute('src') || '';
      const doc = fr?.contentDocument, href = doc?.location?.href || '', el = doc?.getElementById('cover-biz-name');
      const card = document.getElementById('showroom-commercial-card')?.innerText || '';
      if (!src.includes('rubro=${rubro}') || !src.includes('level=${lvl}') || !href.includes('rubro=${rubro}') || !href.includes('level=${lvl}') || !el || doc.readyState !== 'complete') return null;
      return { src, iframeBiz: el.textContent.trim(), bodyTxt: doc.body.innerText, cardTxt: card };
    })()`);
    if (res) return res;
    await wait(80);
  }
  return null;
}

async function runDesktop(cdp) {
  console.log('\n=== 2. E2E DESKTOP 1280x800: PARIDAD NOMBRES 6 RUBROS + L1/L2/L3 ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/');
  await cdp.evalJs(`(() => {
    localStorage.setItem('tucu_l1_biz_name', 'Peluquería & Barbería Central');
    localStorage.setItem('tucu_l1_biz_name_estetica', 'Aura Estética & Spa');
    localStorage.setItem('tucu_l1_cover_gastronomia', JSON.stringify({ bizName: 'Bistró & Parrilla El Encuentro' }));
    localStorage.setItem('tucu_l3_biz_name', 'Consultorios Médicos San Martín');
    localStorage.setItem('tucu_l3_biz_name_salud_consultorio', 'Consultorios Médicos San Martín');
  })()`);
  await cdp.goto('/'); await cdp.evalJs(`document.getElementById('showroom')?.scrollIntoView({ behavior: 'instant' })`);
  for (const [r, expBiz] of RUBRO_NAMES) {
    await cdp.evalJs(`document.getElementById('showroom-rubro-btn-${r}').click()`);
    const info = await readDesktopFrameBiz(cdp, r, 'l1');
    const clean = info && info.iframeBiz === expBiz && info.cardTxt.includes(expBiz) && !LEGACY_RX.test(info.bodyTxt);
    ok(Boolean(clean), `Desktop [${r}] Card === Iframe "${info?.iframeBiz}" (0 nombres viejos)`);
  }
  for (const lvl of ['l1', 'l2', 'l3']) {
    await cdp.evalJs(`document.getElementById('showroom-rubro-btn-peluqueria').click();document.getElementById('btn-showroom-level-${lvl}').click();document.getElementById('btn-showroom-mode-admin').click();`);
    await wait(550);
    await cdp.evalJs(`document.getElementById('btn-showroom-mode-client').click()`);
    const info = await readDesktopFrameBiz(cdp, 'peluqueria', lvl);
    ok(Boolean(info && info.iframeBiz === 'Brava Barbería' && !LEGACY_RX.test(info.bodyTxt)), `Desktop [${lvl}] vuelta desde Panel de Dueño -> "${info?.iframeBiz}"`);
  }
}

async function runMobile(cdp) {
  console.log('\n=== 3. E2E MÓVIL 375x667: CARRUSEL 3.5s + PANEL DE DUEÑO 100dvh ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/'); await cdp.evalJs(`document.getElementById('showroom')?.scrollIntoView({ behavior: 'instant' })`);
  await wait(550);
  const s1 = await cdp.evalJs(`document.getElementById('showroom-rubro-track')?.scrollLeft || 0`);
  await cdp.evalJs(`document.getElementById('showroom-carousel-wrap').dispatchEvent(new Event('pointerdown', { bubbles: true }))`);
  const s2 = await cdp.evalJs(`document.getElementById('showroom-rubro-track')?.scrollLeft || 0`);
  await wait(450);
  const s3 = await cdp.evalJs(`document.getElementById('showroom-rubro-track')?.scrollLeft || 0`);
  await wait(3650);
  const s4 = await cdp.evalJs(`document.getElementById('showroom-rubro-track')?.scrollLeft || 0`);
  ok(s1 > 0 && Math.abs(s3 - s2) <= 1 && Math.abs(s4 - s2) > 4, `Móvil carrusel: auto=${s1.toFixed(1)} -> pausa(${s2.toFixed(1)}->${s3.toFixed(1)}) -> reanuda(${s4.toFixed(1)}) tras 3.5s`);

  await cdp.evalJs(`document.getElementById('btn-showroom-mode-admin').click()`); await wait(120);
  const aL1 = await cdp.evalJs(`({ card: document.getElementById('showroom-mobile-admin-card')?.innerText || '', cta: document.getElementById('btn-showroom-open-fullscreen')?.textContent?.replace(/\\s+/g,' ').trim() || '', ov: document.documentElement.scrollWidth > window.innerWidth })`);
  ok(!aL1.ov && aL1.card.includes('Admin L1 Autónomo') && aL1.cta === 'Probar Panel de Dueño en pantalla completa', 'Móvil Panel de Dueño L1 visible con 0 overflow y CTA correcto');

  await cdp.evalJs(`document.getElementById('btn-showroom-level-l2').click()`); await wait(80);
  const aL2 = await cdp.evalJs(`document.getElementById('showroom-mobile-admin-card')?.innerText || ''`);
  await cdp.evalJs(`document.getElementById('btn-showroom-level-l3').click()`); await wait(80);
  const aL3 = await cdp.evalJs(`document.getElementById('showroom-mobile-admin-card')?.innerText || ''`);
  ok(aL2.includes('Admin L2 Central Pro') && aL3.includes('Admin L3 Multi-Staff'), 'Móvil cambio de plan actualiza card Panel de Dueño L2 -> L3');

  await cdp.evalJs(`document.getElementById('btn-showroom-open-fullscreen').click()`); await wait(750);
  const mAd = await cdp.evalJs(`({ h: document.getElementById('showroom-mobile-modal')?.getBoundingClientRect().height || 0, lock: document.body.style.overflow, src: document.getElementById('showroom-mobile-iframe')?.getAttribute('src') || '' })`);
  await cdp.evalJs(`document.getElementById('btn-modal-mode-client').click()`); await wait(650);
  const mCl = await cdp.evalJs(`document.getElementById('showroom-mobile-iframe')?.getAttribute('src') || ''`);
  await cdp.evalJs(`document.getElementById('btn-showroom-modal-close').click()`); await wait(100);
  const mRest = await cdp.evalJs(`({ gone: !document.getElementById('showroom-mobile-modal'), ov: document.body.style.overflow })`);
  ok(mAd.h >= 640 && mAd.lock === 'hidden' && mAd.src.includes('/admin_l3.html') && mCl.includes('/turnero.html') && mRest.gone && mRest.ov === '',
    `Móvil Pop-Up 100dvh (${Math.round(mAd.h)}px) abre /admin_l3.html directo, alterna /turnero.html y cierra limpiamente`);

  await cdp.evalJs(`document.getElementById('btn-showroom-mode-client').click()`); await wait(100);
  ok(await cdp.evalJs(`Boolean(document.getElementById('showroom-mobile-video') && document.getElementById('btn-showroom-open-fullscreen')?.textContent?.includes('Probar en pantalla completa'))`),
    'Móvil regreso a Vista del Cliente restaura Portada Viva MP4');
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-112a'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await runDesktop(cdp); await runMobile(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-112A]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
