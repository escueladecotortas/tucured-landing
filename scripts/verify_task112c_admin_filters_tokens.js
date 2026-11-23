// Archivo: scripts/verify_task112c_admin_filters_tokens.js
// Compuerta QA + E2E [TASK-112C]: Logo Real, Barra Compacta, Drawer Etiquetado y Tokens UI (< 195L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4216, PORT_CDP = 9271, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN_RX = /#800000|#991B1B|#A82222|128,\s*0,\s*0|\bfont-mono\b/i;

const SYNC_FILES = [
  'public/css/admin_unified.css', 'public/js/admin_shared/admin_theme_sync.js',
  'public/js/admin_shared/admin_booking_engine.js', 'public/js/admin_shared/admin_shell.js',
  'public/admin_l1.html', 'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l1/admin_l1_agenda.js',
  'public/admin_l2.html', 'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_calendar.js', 'public/js/admin_l2/admin_l2_config.js',
  'public/admin_l3.html', 'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js'
];

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
    await this.send('Page.addScriptToEvaluateOnNewDocument', { source: "try{sessionStorage.setItem('tucu_admin_auth','1');}catch(_){}" });
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(650); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA + PARIDAD SHA-256 (14 ARCHIVOS + QA) ===');
  const all = [...SYNC_FILES, 'scripts/verify_task112c_admin_filters_tokens.js'];
  const badLen = [], badAst = [], badEmoji = [], badStyle = [];
  for (const rel of all) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    const maxL = rel.endsWith('admin_unified.css') ? 185 : (rel.endsWith('admin_theme_sync.js') ? 130 : (rel.startsWith('scripts/') ? 195 : 200));
    if (lines.length >= maxL || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
    if (!rel.startsWith('scripts/') && EMOJI_RX.test(txt)) badEmoji.push(rel);
    if (!rel.startsWith('scripts/') && FORBIDDEN_RX.test(txt)) badStyle.push(rel);
  }
  ok(badLen.length === 0, `Todos dentro del límite (<185/<130/<200L) y header Archivo OK (${all.length} archivos; fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `Sintaxis AST node --check OK (fallos=${badAst.join(',') || '0'})`);
  ok(badEmoji.length === 0 && badStyle.length === 0, `0 emojis y 0 #800000/font-mono (emojis=${badEmoji.length}, style=${badStyle.length})`);
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function checkConsole(cdp, spec, vp, rubro, mob) {
  const qRubro = spec.lvl === 'l3' ? (rubro === 'salud' ? 'salud_consultorio' : 'barberia') : rubro;
  await cdp.goto(`/admin_${spec.lvl}.html?rubro=${qRubro}`);
  await wait(250);
  const slotKind = mob ? 'mobile' : 'sidebar';
  const r = await cdp.evalJs(`(() => {
    const slot = document.querySelector('[data-admin-brand-slot="${slotKind}"]');
    const img = slot?.querySelector('[data-admin-brand-logo]'), init = slot?.querySelector('[data-admin-brand-initials]');
    const card = document.getElementById('admin-controls-card')?.getBoundingClientRect();
    const list = document.getElementById('admin-agenda-list')?.getBoundingClientRect();
    const dw = document.getElementById('admin-filters-drawer');
    const strip = document.querySelector('.tucu-quick-strip')?.getBoundingClientRect();
    const chip = document.querySelector('.tucu-chip'), btn = document.querySelector('#admin-controls-card .tucu-btn'), badge = document.querySelector('.tucu-badge');
    const cInp = document.querySelector('.tucu-input'), cCard = document.querySelector('.tucu-card');
    return {
      ov: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      logoOk: Boolean(img && !img.classList.contains('hidden') && img.complete && img.naturalWidth > 0 && img.getAttribute('src')?.includes('demo_${rubro}.webp') && init?.classList.contains('hidden')),
      drawerHidden: Boolean(dw && dw.classList.contains('hidden')),
      cardH: Math.round(card?.height || 0), listTop: Math.round(list?.top || 0), stripH: Math.round(strip?.height || 0),
      chipR: chip ? parseFloat(getComputedStyle(chip).borderRadius) : 0,
      btnR: btn ? getComputedStyle(btn).borderRadius : '',
      badgeR: badge ? parseFloat(getComputedStyle(badge).borderRadius) : 0,
      inpR: cInp ? getComputedStyle(cInp).borderRadius : '',
      cardR: cCard ? getComputedStyle(cCard).borderRadius : ''
    };
  })()`);
  ok(!r.ov, `${vp} [${spec.lvl}/${rubro}] 0 overflow horizontal`);
  ok(r.logoOk, `${vp} [${spec.lvl}/${rubro}] logo real demo_${rubro}.webp cargado e iniciales ocultas`);
  ok(r.chipR >= 999 && r.btnR === '12px' && r.badgeR >= 999 && r.inpR === '12px' && r.cardR === '16px',
    `${vp} [${spec.lvl}/${rubro}] tokens UI uniformes (chip=${r.chipR}, btn=${r.btnR}, badge=${r.badgeR}, inp=${r.inpR}, card=${r.cardR})`);
  if (mob) {
    ok(r.drawerHidden && r.cardH > 0 && r.cardH <= 220 && r.stripH <= 44 && r.listTop < 600,
      `${vp} [${spec.lvl}/${rubro}] barra compacta <=220px (${r.cardH}px), quick strip 1 renglón (${r.stripH}px), lista arriba del pliegue (top=${r.listTop}px)`);
  }

  await cdp.evalJs(`document.getElementById('btn-toggle-filters')?.click()`);
  await wait(120);
  await cdp.evalJs(`document.querySelector('${spec.confSel}')?.click()`);
  await wait(150);
  const dInfo = await cdp.evalJs(`(() => {
    const dw = document.getElementById('admin-filters-drawer'), txt = dw?.innerText || '';
    const btnTxt = document.getElementById('btn-toggle-filters')?.textContent?.replace(/\\s+/g, ' ').trim() || '';
    const hasLabels = /PER[ÍI]ODO/i.test(txt) && /ESTADO DEL TURNO/i.test(txt) && (${spec.lvl === 'l3'} ? /MODO DE VISTA/i.test(txt) : true);
    return { open: Boolean(dw && !dw.classList.contains('hidden')), hasLabels, btnTxt };
  })()`);
  ok(dInfo.open && dInfo.hasLabels && /Filtros\s*·\s*1/.test(dInfo.btnTxt),
    `${vp} [${spec.lvl}/${rubro}] drawer etiquetado visible y contador "${dInfo.btnTxt}"`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-112c'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    const specs = [
      { lvl: 'l1', confSel: '[data-sfilter="confirmado"]' },
      { lvl: 'l2', confSel: '[data-l2filter="CONFIRMED"]' },
      { lvl: 'l3', confSel: '[data-l3sfilter="CONFIRMED"]' }
    ];
    for (const [vp, w, h, mob] of [['Desktop 1280', 1280, 800, false], ['Mobile 375', 375, 667, true]]) {
      console.log(`\n=== 2. E2E ${vp} (LOGO REAL + BARRA COMPACTA + DRAWER + TOKENS) ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: mob });
      for (const sp of specs) for (const r of ['peluqueria', 'salud']) await checkConsole(cdp, sp, vp, r, mob);
    }
    await cdp.goto('/admin_l1.html?rubro=peluqueria&logo=none');
    await wait(150);
    const fb = await cdp.evalJs(`(() => { const s = document.querySelector('[data-admin-brand-slot="mobile"]'); return !s?.querySelector('[data-admin-brand-initials]')?.classList.contains('hidden') && s?.querySelector('[data-admin-brand-logo]')?.classList.contains('hidden'); })()`);
    ok(fb, 'Fallback ?logo=none muestra iniciales y oculta imagen');
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-112C]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
