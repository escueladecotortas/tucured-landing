// Archivo: scripts/verify_task110c_logos_vocab_compact.js
// Compuerta QA + E2E [TASK-110C]: Logos WebP en header, vocabulario por rubro, fix Obra Social y sin scroll (< 195L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4212, PORT_CDP = 9267, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const RUBROS = [
  ['peluqueria', 'Brava Barbería', 'Reservar turno', true], ['estetica', 'Siena Estética', 'Reservar turno', true],
  ['gastronomia', 'Brama Café & Bistró', 'Reservar mesa', false], ['deportes', 'Norte Pádel Club', 'Reservar cancha', false],
  ['salud', 'Alba Centro Médico', 'Reservar turno', true], ['servicios', 'Vértice Estudio', 'Agendar consulta', false]
];
const CODE_FILES = [
  ['public/turnero.html', 100], ['public/js/admin_shared/turnero_catalog.js', 165], ['public/js/admin_shared/turnero_cover_data.js', 195],
  ['public/js/admin_shared/turnero_cover_ui.js', 150], ['public/js/admin_shared/turnero_steps_ui.js', 180], ['public/js/admin_shared/turnero_ticket_inline.js', 185],
  ['public/js/admin_shared/turnero_modals_v2.js', 130], ['public/js/admin_shared/turnero_ticket_lookup.js', 195], ['public/js/admin_shared/turnero_app.js', 195],
  ['scripts/verify_task110c_logos_vocab_compact.js', 195]
];
const WEBP_LOGOS = RUBROS.map(([r]) => `public/assets/logos/demo_${r}.webp`);
const SYNC_FILES = [...WEBP_LOGOS, ...CODE_FILES.slice(0, 9).map(x => x[0])];
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
      else if (m.method === 'Network.responseReceived') {
        const r = m.params?.response;
        if (r?.url?.startsWith(BASE) && !r.url.endsWith('/favicon.ico') && r.status >= 400) this.httpBad.push(`${r.status} ${r.url}`);
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, LOGOS <=25KB & PARIDAD SHA-256 [TASK-110C] ===');
  for (const [rel, maxL] of CODE_FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono') && !txt.includes('#800000'), `Sin emojis/font-mono/#800000: ${rel}`);
  }
  for (const rel of WEBP_LOGOS) {
    const sz = fs.existsSync(rel) ? fs.statSync(rel).size : 99999;
    ok(sz > 0 && sz <= 25600, `Logo optimizado <= 25KB: ${rel} (${(sz / 1024).toFixed(2)} KB)`);
  }
  const svgLeft = [...fs.readdirSync('public/assets/logos'), ...fs.readdirSync(path.join(ENGINE, 'public/assets/logos'))].filter(f => f.endsWith('.svg'));
  ok(svgLeft.length === 0 && !fs.existsSync('dist/temp') && fs.readFileSync('public/turnero.html', 'utf8').includes('Conectamos tu negocio'), '0 demo_*.svg residuales, sin dist/temp, pie "Conectamos tu negocio"');
  let synced = 0; for (const rel of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function enterStep1(cdp, mob) {
  if (!mob) return;
  await cdp.evalJs(`document.getElementById('btn-cover-reservar')?.click()`);
  for (let i = 0; i < 15; i++) { if (await cdp.evalJs(`!document.getElementById('turnero-booking-stage')?.classList.contains('hidden')`)) break; await wait(60); }
}

async function runViewport(cdp, vp) {
  await cdp.goto('/turnero.html'); await cdp.evalJs('localStorage.clear()');
  for (const [r, bizExp, ctaExp, usesTurno] of RUBROS) {
    await cdp.goto(`/turnero.html?rubro=${r}&level=l1&motion=0`);
    for (let i = 0; i < 20; i++) { if (await cdp.evalJs(`Boolean(document.getElementById('turnero-header-logo')?.complete || !document.getElementById('turnero-header-logo'))`)) break; await wait(60); }
    const cov = await cdp.evalJs(`(() => ({
      noCovLogo: !document.getElementById('cover-brand-logo'), biz: document.getElementById('cover-biz-name')?.textContent?.trim() || '',
      tagLen: (document.getElementById('cover-tagline')?.textContent?.trim() || '').length, cta: document.getElementById('btn-cover-reservar')?.textContent?.trim() || '',
      lk: document.getElementById('btn-cover-lookup')?.textContent?.trim() || '', foot: document.getElementById('turnero-brand-link')?.textContent?.replace(/\\s+/g,' ').trim() || '',
      noWord: !/\\b(pase|ticket)\\b/i.test(document.body.innerText), covTurno: /\\bturno(s)?\\b/i.test(document.getElementById('turnero-cover-stage')?.innerText || ''),
      ov: document.documentElement.scrollWidth > window.innerWidth
    }))()`);
    ok(cov.noCovLogo && cov.biz === bizExp && cov.tagLen <= 52 && cov.cta === ctaExp && cov.lk === '¿Ya reservaste?' && cov.foot === '· Conectamos tu negocio' && cov.noWord && !cov.ov && (usesTurno || !cov.covTurno),
      `${vp.n} [${r}] "${bizExp}", portada limpia, bajada ${cov.tagLen}c, CTA "${ctaExp}"`);

    await enterStep1(cdp, vp.mob);
    const s1 = await cdp.evalJs(`(() => {
      const h = document.getElementById('turnero-service-heading'), lg = document.getElementById('turnero-header-logo');
      return {
        lgSrc: lg?.getAttribute('src') || '', lgOk: Boolean(lg?.naturalWidth > 0), hFont: h ? getComputedStyle(h).fontFamily : '',
        s1Turno: /\\bturno(s)?\\b/i.test(document.getElementById('turnero-root')?.innerText || '')
      };
    })()`);
    ok(s1.lgSrc.endsWith(`demo_${r}.webp`) && s1.lgOk && s1.hFont.toLowerCase().includes('plus jakarta sans') && (usesTurno || !s1.s1Turno), `${vp.n} [${r}] Logo WebP en header + preguntas Plus Jakarta Sans`);
  }
  await cdp.goto('/turnero.html?rubro=peluqueria&logo=none&motion=0'); await enterStep1(cdp, vp.mob);
  ok(await cdp.evalJs(`!document.getElementById('turnero-header-logo')`), `${vp.n} ?logo=none oculta logo en header`);

  await cdp.evalJs(`localStorage.setItem('tucu_client_profile_v1', JSON.stringify({ nombre: 'Martín', apellido: 'Rodríguez', whatsapp: '3815554321', obraSocial: 'OSDE' }))`);
  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0'); await enterStep1(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click()`); await wait(100);
  const s2Pel = await cdp.evalJs(`!document.getElementById('inp-client-cov') && !/Obra Social|OSDE/i.test(document.getElementById('turnero-root').innerText)`);
  await cdp.evalJs(`document.getElementById('btn-confirm-booking').click()`); await wait(160);
  const finPel = await cdp.evalJs(`(() => {
    const t = document.getElementById('turnero-ticket-view')?.textContent || '', ec = document.getElementById('ticket-econ-grid')?.textContent || '';
    const cR = document.getElementById('btn-smart-calendar')?.getBoundingClientRect(), rR = document.getElementById('btn-reschedule-booking')?.getBoundingClientRect();
    const st = document.getElementById('turnero-booking-stage');
    return {
      s2: ${s2Pel}, noOs: !/Obra Social|OSDE/i.test(t), econ: /Total/i.test(ec) && /Seña/i.test(ec) && /Saldo en local/i.test(ec),
      sameRow: Boolean(cR && rR && Math.abs(cR.top - rR.top) < 8), sh: st?.scrollHeight || 0, ch: st?.clientHeight || 0,
      noWord: !/\\b(pase|ticket)\\b/i.test(document.body.innerText)
    };
  })()`);
  ok(finPel.s2 && finPel.noOs && finPel.econ && finPel.noWord, `${vp.n} [peluqueria] 0 fuga OSDE, Total|Seña|Saldo y 0 pase/ticket`);
  if (!vp.mob) ok(finPel.sameRow && finPel.sh <= finPel.ch + 24, `${vp.n} Comprobante compacto en fila sin scroll (${finPel.sh} <= ${finPel.ch})`);

  await cdp.goto('/turnero.html?rubro=salud&level=l3&motion=0'); await enterStep1(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click();setTimeout(()=>document.getElementById('btn-confirm-booking').click(),60);`);
  await wait(180);
  ok(await cdp.evalJs(`/Obra Social.*OSDE/i.test(document.getElementById('turnero-ticket-view')?.innerText || '')`), `${vp.n} [salud/l3] SÍ muestra Obra Social`);

  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0');
  const covSeed = await cdp.evalJs(`({ bdr: getComputedStyle(document.getElementById('btn-cover-active-ticket')).borderColor, hist: document.getElementById('btn-cover-history')?.textContent?.trim(), noLookup: !document.getElementById('btn-cover-lookup') })`);
  await cdp.evalJs(`document.getElementById('btn-cover-history').click()`); await wait(80);
  const histTxt = await cdp.evalJs(`document.getElementById('history-bookings-list')?.innerText || ''`);
  await cdp.evalJs(`document.getElementById('btn-close-history-modal').click()`); await wait(60);
  ok(covSeed.bdr.includes('212, 175, 55') && covSeed.hist === 'Mis turnos' && covSeed.noLookup && histTxt.includes('Finalizado') && histTxt.includes('Cancelado'), `${vp.n} Semillita: borde champagne, Mis turnos con estados variados y sin Consultar otro`);

  await cdp.goto('/turnero.html?rubro=gastronomia&level=l1&motion=0');
  const gasSeed = await cdp.evalJs(`({ hist: document.getElementById('btn-cover-history')?.textContent?.trim(), noTurno: !/\\bturno(s)?\\b/i.test(document.getElementById('turnero-cover-stage')?.innerText || '') })`);
  ok(gasSeed.hist === 'Mis reservas' && gasSeed.noTurno, `${vp.n} [gastronomia] Semillita muestra "Mis reservas" sin "turno"`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-110c'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
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
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('ERRORS:', cdp.errors, 'HTTP:', cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-110C]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });