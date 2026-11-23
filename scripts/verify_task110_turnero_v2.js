// Archivo: scripts/verify_task110_turnero_v2.js
// Compuerta QA + E2E [TASK-110]: Turnero V2 Editorial Stitch + 2 Pasos + Ticket Unificado + Paridad SHA-256 (< 190L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4210, PORT_CDP = 9265, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FILES = [
  ['public/assets/tucu_red_logo.svg', 35], ['public/turnero.html', 105], ['public/js/admin_shared/turnero_cover_data.js', 195],
  ['public/js/admin_shared/turnero_cover_ui.js', 170], ['public/js/admin_shared/turnero_steps_ui.js', 195],
  ['public/js/admin_shared/turnero_ticket_inline.js', 195], ['public/js/admin_shared/turnero_app.js', 195], ['scripts/verify_task110_turnero_v2.js', 195]
];
const RUBROS = [
  ['peluqueria', 'l1', 'Fraunces', '¿Qué te querés hacer?'], ['estetica', 'l2', 'Cormorant Garamond', '¿Qué te querés hacer?'],
  ['gastronomia', 'l1', 'Fraunces', '¿Qué reservamos?'], ['deportes', 'l3', 'Space Grotesk', '¿Qué reservamos?'],
  ['salud', 'l3', 'Cormorant Garamond', '¿Qué consulta necesitás?'], ['servicios', 'l2', 'Space Grotesk', '¿Qué consulta necesitás?']
];
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); }); q.on('error', rej); q.end(); });

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; this.svgOk = false; }
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
        if (r?.url?.startsWith(BASE) && r.url.includes('/assets/tucu_red_logo.svg') && [200, 304].includes(r.status)) this.svgOk = true;
      }
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(600); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA & PARIDAD SHA-256 [TASK-110] ===');
  for (const [rel, maxL] of FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono') && !txt.includes('#800000') && !/Banco Galicia|30 minutos|30-71829384-9|24\/7|material-symbols/i.test(txt), `Limpio sin prohibidos: ${rel}`);
  }
  const html = fs.readFileSync('public/turnero.html', 'utf8');
  ok(!/<a[^>]+href\s*=\s*["'][^"']*admin|\/admin(?:_l[123])?\.html|\/admin["/?#\s]|Panel de gestión/i.test(html) && html.includes('/assets/tucu_red_logo.svg'), 'turnero.html usa /assets/tucu_red_logo.svg y cero enlaces /admin');
  ok(sha('assets/tucu_red_logo.svg') === sha('public/assets/tucu_red_logo.svg'), 'SVG public/assets/tucu_red_logo.svg idéntico al original');
  const syncList = FILES.slice(0, 7).map(x => x[0]);
  let synced = 0; for (const rel of syncList) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === syncList.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${syncList.length})`);
}

async function enterStep1(cdp, mob) {
  if (!mob) return;
  await cdp.evalJs(`document.getElementById('btn-cover-reservar')?.click()`);
  for (let i = 0; i < 15; i++) { if (await cdp.evalJs(`!document.getElementById('turnero-booking-stage')?.classList.contains('hidden')`)) break; await wait(60); }
}

async function runViewport(cdp, vp) {
  await cdp.goto('/turnero.html'); await cdp.evalJs('localStorage.clear()');
  for (const [r, lvl, font, qExp] of RUBROS) {
    await cdp.goto(`/turnero.html?rubro=${r}&level=${lvl}&motion=0`);
    for (let i = 0; i < 20; i++) { if (await cdp.evalJs(`Boolean(document.getElementById('cover-status-line') && document.getElementById('turnero-brand-logo')?.complete)`)) break; await wait(80); }
    const cov = await cdp.evalJs(`(() => ({
      noPill: !document.getElementById('cover-status-pill') && !document.querySelector('#turnero-cover-stage .bg-emerald-400'),
      line: document.getElementById('cover-status-line')?.textContent?.trim() || '', fontCss: getComputedStyle(document.documentElement).getPropertyValue('--tucu-display-font'),
      h1Font: getComputedStyle(document.getElementById('cover-biz-name')).fontFamily, svgOk: Boolean(document.getElementById('turnero-brand-logo')?.naturalWidth > 0),
      foot: document.getElementById('turnero-brand-link')?.textContent?.replace(/\\s+/g, ' ').trim() || '', lookup: document.getElementById('btn-cover-lookup')?.textContent?.trim() || '',
      greet: Boolean(document.getElementById('cover-client-greeting')), ov: document.documentElement.scrollWidth > window.innerWidth
    }))()`);
    ok(cov.noPill && /^(ABIERTO HASTA LAS|ABRE A LAS)/.test(cov.line) && cov.fontCss.includes(font) && cov.h1Font.toLowerCase().includes(font.toLowerCase()), `${vp.n} [${r}/${lvl}] Portada editorial (${font}) + "${cov.line}"`);
    ok(cov.svgOk && cov.foot.includes('Tucu Red · Turnero online') && !cov.foot.includes('24/7') && !cov.greet && cov.lookup === '¿Ya tenés turno?' && !cov.ov, `${vp.n} [${r}/${lvl}] Pie SVG real + 0 overflow`);
    await enterStep1(cdp, vp.mob);
    const s1 = await cdp.evalJs(`({ ind: document.getElementById('turnero-step-indicator')?.textContent?.trim(), q: document.getElementById('turnero-service-heading')?.textContent?.trim(), mes: document.getElementById('turnero-month-label')?.textContent?.trim(), nav: Boolean(document.getElementById('btn-date-prev') && document.getElementById('btn-date-next')), ov: document.documentElement.scrollWidth > window.innerWidth })`);
    ok(s1.ind === 'PASO 1 DE 2' && s1.q === qExp && Boolean(s1.mes) && s1.nav && !s1.ov, `${vp.n} [${r}/${lvl}] Paso 1 conversacional ("${qExp}", "${s1.mes}")`);
    if (r === 'salud') {
      await cdp.evalJs(`document.getElementById('btn-step1-next').click()`); await wait(100);
      ok(await cdp.evalJs(`Boolean(document.getElementById('inp-client-cov'))`), `${vp.n} [salud/l3] Paso 2 incluye selector Obra Social`);
    }
  }
  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0'); await enterStep1(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click()`); await wait(100);
  const s2New = await cdp.evalJs(`({ ind: document.getElementById('turnero-step-indicator')?.textContent?.trim(), ins: Boolean(document.getElementById('inp-client-phone') && document.getElementById('inp-client-first') && document.getElementById('inp-client-last')), pass: Boolean(document.getElementById('turnero-boarding-pass')), noIdent: !document.getElementById('turnero-pass-identity') })`);
  ok(s2New.ind === 'PASO 2 DE 2' && s2New.ins && s2New.pass && s2New.noIdent, `${vp.n} Paso 2 cliente nuevo: inputs + PASE DE TURNO`);
  await cdp.evalJs(`document.getElementById('inp-client-phone').value='3815554321';document.getElementById('inp-client-first').value='Martín';document.getElementById('inp-client-last').value='Rodríguez';document.getElementById('btn-confirm-booking').click();`);
  await wait(160);
  const tkPend = await cdp.evalJs(`(() => {
    const v = document.getElementById('turnero-ticket-view'), txt = v?.textContent || '', aR = document.getElementById('ticket-alias-row')?.getBoundingClientRect(), cR = document.getElementById('ticket-cbu-row')?.getBoundingClientRect(), aV = document.getElementById('ticket-alias-val'), cV = document.getElementById('ticket-cbu-val');
    return {
      ok: Boolean(v), code: document.getElementById('ticket-code-badge')?.textContent?.trim() || '', badge: document.getElementById('ticket-status-badge')?.textContent?.trim() || '',
      bal: (txt.match(/Saldo en local/gi) || []).length, cal: document.querySelectorAll('#btn-smart-calendar, #btn-turnero-ics, #btn-turnero-gcal').length,
      stacked: Boolean(aR && cR && cR.top >= aR.bottom - 2 && aV.scrollWidth <= aV.clientWidth + 2 && cV.scrollWidth <= cV.clientWidth + 2),
      clean: !/Banco Galicia|30 minutos|30-71829384-9/i.test(txt),
      apple: TucuTicketInline.isAppleDevice('iPhone') && TucuTicketInline.isAppleDevice('Macintosh') && !TucuTicketInline.isAppleDevice('Android') && !TucuTicketInline.isAppleDevice('Windows')
    };
  })()`);
  ok(tkPend.ok && /^#TK-/.test(tkPend.code) && tkPend.badge.includes('Pendiente de seña') && tkPend.bal === 1 && tkPend.cal === 1 && tkPend.stacked && tkPend.clean && tkPend.apple, `${vp.n} Ticket Unificado (${tkPend.code}): Saldo x1, Cal x1 inteligente, Alias/CBU apilados sin truncar`);
  await cdp.evalJs(`document.getElementById('btn-copy-alias').click();const dt=new DataTransfer();dt.items.add(new File(['ok'],'seña.png',{type:'image/png'}));const i=document.getElementById('inp-inline-receipt');i.files=dt.files;i.dispatchEvent(new Event('change'));document.getElementById('btn-inline-report-receipt').click();`);
  await wait(100);
  ok(await cdp.evalJs(`Boolean(document.getElementById('inline-receipt-reported'))`), `${vp.n} Subida e informe de comprobante en Ticket Unificado`);
  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0');
  const covRet = await cdp.evalJs(`({ greet: document.getElementById('cover-client-greeting')?.textContent?.trim(), pase: document.getElementById('btn-cover-active-ticket')?.textContent?.replace(/\\s+/g,' ').trim()||'', lookup: document.getElementById('btn-cover-lookup')?.textContent?.trim() })`);
  ok(covRet.greet === 'Hola, Martín' && covRet.pase.includes('Tenés un turno · Ver mi pase') && covRet.lookup === 'Consultar otro turno', `${vp.n} Portada recurrente: saludo + Ver mi pase + Consultar otro turno`);
  await enterStep1(cdp, vp.mob);
  const s1Btn = await cdp.evalJs(`document.getElementById('btn-step1-next')?.textContent?.trim()`);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click()`); await wait(100);
  const s2Fast = await cdp.evalJs(`({ noInputs: !document.getElementById('inp-client-first'), ident: document.getElementById('turnero-pass-identity')?.textContent?.replace(/\\s+/g,' ').trim()||'' })`);
  await cdp.evalJs(`document.getElementById('btn-edit-client-profile').click()`); await wait(80);
  ok(s1Btn?.includes('Revisar y confirmar') && s2Fast.noInputs && s2Fast.ident.includes('Reservando como Martín (381...321)') && await cdp.evalJs(`Boolean(document.getElementById('inp-client-first'))`), `${vp.n} Paso 2 recurrente oculta inputs y "Cambiar" los despliega`);
  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0');
  await cdp.evalJs(`document.getElementById('btn-cover-active-ticket').click();setTimeout(()=>document.getElementById('btn-inline-cancel')?.click(),60);setTimeout(()=>document.getElementById('btn-confirm-inline-cancel')?.click(),120);`);
  await wait(240);
  const cRes = await cdp.evalJs(`({ banner: Boolean(document.getElementById('inline-cancelled-banner')), seed: localStorage.getItem('tucu_client_seed_l1_peluqueria') })`);
  ok(cRes.banner && cRes.seed === null, `${vp.n} Cancelar turno marca cancelado y limpia semillita`);
  await cdp.evalJs(`localStorage.setItem('tucu_l1_cfg_ext', JSON.stringify({ requireDeposit: false }))`);
  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0'); await enterStep1(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click(); setTimeout(() => document.getElementById('btn-confirm-booking').click(), 40);`);
  await wait(180);
  const tkConf = await cdp.evalJs(`({ badge: document.getElementById('ticket-status-badge')?.textContent?.trim(), cal: document.querySelectorAll('#btn-smart-calendar').length, noSeedBtn: !document.getElementById('btn-cover-active-ticket') })`);
  ok(tkConf.badge === 'Turno confirmado' && tkConf.cal === 1, `${vp.n} Ticket confirmado directo (sin seña) unificado`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-110'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const vp of [{ n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }, { n: 'Móvil 375x667', w: 375, h: 667, mob: true }]) {
      console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await runViewport(cdp, vp);
    }
    ok(cdp.svgOk && cdp.errors.length === 0 && cdp.httpBad.length === 0, `SVG HTTP 200 + 0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-110]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });