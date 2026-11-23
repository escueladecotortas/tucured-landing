// Archivo: scripts/verify_task111_showroom_v2.js
// Compuerta QA + E2E [TASK-111]: 4 retoques Turnero V2 + Showroom V2 Desktop/Movil (< 195L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4213, PORT_CDP = 9268, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const RUBROS = [
  ['peluqueria', 'brava.barberia.mp'], ['estetica', 'siena.estetica.mp'], ['gastronomia', 'brama.cafe.mp'],
  ['deportes', 'norte.padel.mp'], ['salud', 'alba.medico.mp'], ['servicios', 'vertice.estudio.mp']
];
const CODE_FILES = [
  ['public/turnero.html', 100], ['public/js/admin_shared/turnero_catalog.js', 165], ['public/js/admin_shared/turnero_steps_ui.js', 185],
  ['public/js/admin_shared/turnero_ticket_inline.js', 185], ['js/showcase_v11/showcase_state.js', 165], ['js/showcase_v11/showcase_carousel.js', 120],
  ['js/showcase_v11/showcase_modal_mobile.js', 140], ['js/showcase_v11/showcase_v2_ui.js', 190], ['js/showcase_v11/showcase_controller.js', 170],
  ['js/showcase_v11/showcase_core.js', 35], ['js/components/stage_unified.js', 40], ['js/main.js', 55], ['css/showroom.css', 65],
  ['scripts/verify_task111_showroom_v2.js', 195]
];
const SYNC_FILES = CODE_FILES.slice(0, 4).map(x => x[0]);
const LEGACY = ['js/showcase_v11/showcase_mockup.js', 'js/components/stage_rubros_zone.js', 'js/components/stage_value_zone.js'];
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA & PARIDAD SHA-256 [TASK-111] ===');
  for (const [rel, maxL] of CODE_FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono') && !txt.includes('#800000') && !txt.includes('Reserva garantizada'), `Limpio sin emojis/font-mono/#800000/"Reserva garantizada": ${rel}`);
    if (rel.startsWith('js/')) ok(!/\b(pase|ticket)\b/i.test(txt), `Cero "pase"/"ticket" en UI Showroom V2: ${rel}`);
  }
  ok(LEGACY.every(f => !fs.existsSync(f)) && !fs.existsSync('dist/temp'), 'Simulador divergente legacy eliminado y sin dist/temp');
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function enterBooking(cdp, mob) {
  if (!mob) return;
  await cdp.evalJs(`document.getElementById('btn-cover-reservar')?.click()`);
  for (let i = 0; i < 15; i++) { if (await cdp.evalJs(`!document.getElementById('turnero-booking-stage')?.classList.contains('hidden')`)) break; await wait(60); }
}

async function runTurneroViewport(cdp, vp) {
  await cdp.goto('/turnero.html'); await cdp.evalJs('localStorage.clear()');
  for (const [r, expAlias] of RUBROS) {
    await cdp.goto(`/turnero.html?rubro=${r}&level=l1&motion=0&embed=1`);
    await enterBooking(cdp, vp.mob);
    const m = await cdp.evalJs(`(() => {
      const lg = document.getElementById('turnero-header-logo'), f = document.getElementById('turnero-brand-tagline');
      const div = document.getElementById('turnero-brand-divider'), lnk = document.getElementById('turnero-brand-link'), st = f ? getComputedStyle(f) : null;
      return {
        w: lg ? lg.getBoundingClientRect().width : 0, emb: document.documentElement.classList.contains('tucu-embed'),
        divOk: Boolean(div && div.getBoundingClientRect().height >= 10), fTxt: lnk?.textContent?.replace(/\\s+/g,' ').trim() || '',
        fFont: st?.fontFamily || '', fWt: parseInt(st?.fontWeight || '0', 10), alias: TucuTicketInline.resolveBankData('l1', '${r}').alias
      };
    })()`);
    ok(m.w >= (vp.mob ? 48 : 52) && m.emb && m.divOk && m.fTxt === 'Conectamos tu negocio' && m.fFont.toLowerCase().includes('plus jakarta sans') && m.fWt >= 500 && m.alias === expAlias,
      `${vp.n} Turnero [${r}] logo=${Math.round(m.w)}px, alias="${m.alias}", pie "${m.fTxt}"`);
  }
  await cdp.evalJs('localStorage.clear()');
  await cdp.goto('/turnero.html?rubro=salud&level=l1&motion=0'); await enterBooking(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click()`); await wait(100);
  ok(await cdp.evalJs(`/Obra Social:\\s*OSDE/i.test(document.getElementById('turnero-boarding-pass')?.innerText || '')`), `${vp.n} [salud NUEVO] TU RESERVA muestra Obra Social`);

  await cdp.evalJs(`localStorage.setItem('tucu_client_profile_v1', JSON.stringify({ nombre: 'Martín', apellido: 'Rodríguez', whatsapp: '3815554321', obraSocial: 'OSDE' }))`);
  await cdp.goto('/turnero.html?rubro=salud&level=l3&motion=0'); await enterBooking(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click()`); await wait(100);
  ok(await cdp.evalJs(`/Obra Social:\\s*OSDE/i.test(document.getElementById('turnero-boarding-pass')?.innerText || '')`), `${vp.n} [salud recurrente] TU RESERVA muestra Obra Social`);

  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0'); await enterBooking(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click()`); await wait(100);
  const s2Pel = await cdp.evalJs(`!/Obra Social|OSDE/i.test(document.getElementById('turnero-boarding-pass')?.innerText || '')`);
  await cdp.evalJs(`document.getElementById('btn-confirm-booking').click()`); await wait(150);
  const fin = await cdp.evalJs(`(() => {
    const st = document.getElementById('turnero-booking-stage'), lg = document.getElementById('turnero-header-logo');
    return { lgW: lg ? lg.getBoundingClientRect().width : 0, al: document.getElementById('ticket-alias-val')?.textContent?.trim() || '', sh: st?.scrollHeight || 0, ch: st?.clientHeight || 0, ov: document.documentElement.scrollWidth > window.innerWidth, noW: !/\\b(pase|ticket)\\b/i.test(document.body.innerText) };
  })()`);
  ok(s2Pel && fin.al === 'brava.barberia.mp' && fin.lgW >= (vp.mob ? 48 : 52) && !fin.ov && fin.noW && (vp.mob || fin.sh <= fin.ch + 24),
    `${vp.n} [peluqueria] Paso 2 sin Obra Social, alias="${fin.al}", logo=${Math.round(fin.lgW)}px, h=${fin.sh}/${fin.ch}`);
}

async function runShowroomDesktop(cdp) {
  console.log('\n=== 2. E2E SHOWROOM V2 DESKTOP 1280x800 ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/'); await cdp.evalJs(`document.getElementById('showroom')?.scrollIntoView({ behavior: 'instant' })`); await wait(800);
  const st = await cdp.evalJs(`(() => {
    const txt = document.getElementById('showroom')?.innerText || '', fr = document.getElementById('showroom-desktop-iframe');
    const btns = [...document.querySelectorAll('[data-showroom-rubro]')].map(b => ({ t: b.textContent.replace(/\\s+/g,' ').trim(), clip: b.scrollWidth > b.clientWidth + 2 }));
    return { ov: document.documentElement.scrollWidth > window.innerWidth, btns, probalo: document.getElementById('badge-showroom-probalo')?.textContent?.trim() || '', cleanTxt: !/Reserva garantizada|Mercado Pago integrado|WhatsApp Business API|Latencia 14ms|\\b(pase|ticket)\\b/i.test(txt), frVis: Boolean(fr && fr.getBoundingClientRect().height >= 600), frSrc: fr?.getAttribute('src') || '' };
  })()`);
  ok(!st.ov && st.btns.length === 6 && st.btns.every(b => !b.clip && b.t.split(' ').length === 1) && st.probalo === 'Probalo' && st.cleanTxt,
    'Desktop: 0 overflow, 6 rubros 1-palabra sin corte, badge Probalo y cero texto ficticio');
  ok(st.frVis && st.frSrc.includes('/turnero.html?rubro=peluqueria&level=l1&embed=1'), `Desktop iframe Turnero real activo (${st.frSrc})`);

  await cdp.evalJs(`document.getElementById('showroom-rubro-btn-salud').click(); document.getElementById('btn-showroom-mode-admin').click();`);
  await wait(850);
  const sL1 = await cdp.evalJs(`document.getElementById('showroom-desktop-iframe')?.getAttribute('src') || ''`);
  await cdp.evalJs(`document.getElementById('btn-showroom-level-l3').click()`); await wait(850);
  const sL3 = await cdp.evalJs(`document.getElementById('showroom-desktop-iframe')?.getAttribute('src') || ''`);
  ok(sL1.includes('/admin_l1.html') && sL1.includes('rubro=salud') && sL3.includes('/admin_l3.html') && sL3.includes('rubro=salud_consultorio'),
    `Desktop switch Panel de Dueño real L1->L3 (${sL1} | ${sL3})`);
}

async function runShowroomMobile(cdp) {
  console.log('\n=== 3. E2E SHOWROOM V2 MÓVIL 375x667 ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/'); await cdp.evalJs(`document.getElementById('showroom')?.scrollIntoView({ behavior: 'instant' })`); await wait(700);
  const sA = await cdp.evalJs(`document.getElementById('showroom-rubro-track')?.scrollLeft || 0`);
  await cdp.evalJs(`document.getElementById('showroom-carousel-wrap').dispatchEvent(new Event('pointerdown', { bubbles: true }))`);
  const sB = await cdp.evalJs(`document.getElementById('showroom-rubro-track')?.scrollLeft || 0`);
  await wait(350);
  const sC = await cdp.evalJs(`document.getElementById('showroom-rubro-track')?.scrollLeft || 0`);
  ok(sA > 0 && Math.abs(sC - sB) <= 1, `Móvil carrusel auto-deslizante (scroll=${sA.toFixed(1)}) y pausa instantánea (${sB.toFixed(1)}->${sC.toFixed(1)})`);

  const mob = await cdp.evalJs(`({ ov: document.documentElement.scrollWidth > window.innerWidth, noDesk: document.getElementById('showroom-desktop-viewer')?.offsetParent === null, vid: Boolean(document.getElementById('showroom-mobile-video')?.querySelector('source')?.getAttribute('src')?.endsWith('.mp4')) })`);
  ok(!mob.ov && mob.noDesk && mob.vid, 'Móvil: 0 overflow, sin marco iPhone, portada viva MP4 visible');

  await cdp.evalJs(`document.getElementById('btn-showroom-open-fullscreen').click()`); await wait(800);
  const mOpen = await cdp.evalJs(`({ h: document.getElementById('showroom-mobile-modal')?.getBoundingClientRect().height || 0, lock: document.body.style.overflow, src: document.getElementById('showroom-mobile-iframe')?.getAttribute('src') || '' })`);
  await cdp.evalJs(`document.getElementById('btn-modal-mode-admin').click()`); await wait(850);
  const mAdmin = await cdp.evalJs(`document.getElementById('showroom-mobile-iframe')?.getAttribute('src') || ''`);
  await cdp.evalJs(`document.getElementById('btn-showroom-modal-close').click()`); await wait(120);
  const mCls = await cdp.evalJs(`({ gone: !document.getElementById('showroom-mobile-modal'), ov: document.body.style.overflow })`);
  ok(mOpen.h >= 640 && mOpen.lock === 'hidden' && mOpen.src.includes('/turnero.html') && mAdmin.includes('/admin_l1.html') && mCls.gone && mCls.ov === '',
    `Móvil Pop-Up 100dvh (${Math.round(mOpen.h)}px), switch Cliente/Dueño y cierre restaurando scroll`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-111'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const vp of [{ n: 'Desktop', w: 1280, h: 800, mob: false }, { n: 'Móvil', w: 375, h: 667, mob: true }]) {
      console.log(`\n=== E2E TURNERO V2 (${vp.n}) ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await runTurneroViewport(cdp, vp);
    }
    await runShowroomDesktop(cdp); await runShowroomMobile(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-111]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
