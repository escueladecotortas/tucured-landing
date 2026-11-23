// Archivo: scripts/verify_task110b_turnero_polish.js
// Compuerta QA + E2E [TASK-110B]: 6 tipografías, 6 logos SVG, Siena Estética, sin pase/ticket, ficha, CBU colapsable, reprogramación, KPI e historial (< 195L)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4211, PORT_CDP = 9266, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const SYNC_FILES = [
  ['public/assets/covers/cover_catalog.json', 195], ['public/assets/logos/demo_peluqueria.svg', 30], ['public/assets/logos/demo_estetica.svg', 30],
  ['public/assets/logos/demo_gastronomia.svg', 30], ['public/assets/logos/demo_deportes.svg', 30], ['public/assets/logos/demo_salud.svg', 30],
  ['public/assets/logos/demo_servicios.svg', 30], ['public/turnero.html', 100], ['public/js/admin_shared/turnero_catalog.js', 160],
  ['public/js/admin_shared/turnero_cover_data.js', 195], ['public/js/admin_shared/turnero_cover_ui.js', 170], ['public/js/admin_shared/turnero_steps_ui.js', 195],
  ['public/js/admin_shared/turnero_ticket_inline.js', 195], ['public/js/admin_shared/turnero_modals_v2.js', 190],
  ['public/js/admin_shared/turnero_ticket_lookup.js', 195], ['public/js/admin_shared/turnero_app.js', 195]
];
const RUBROS = [
  ['peluqueria', 'l1', 'Instrument Serif'], ['estetica', 'l2', 'Cormorant Garamond'], ['gastronomia', 'l1', 'Bricolage Grotesque'],
  ['deportes', 'l3', 'Barlow Condensed'], ['salud', 'l3', 'Outfit'], ['servicios', 'l2', 'Newsreader']
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA & PARIDAD SHA-256 [TASK-110B] ===');
  const all = [...SYNC_FILES, ['scripts/verify_task110b_turnero_polish.js', 195]];
  for (const [rel, maxL] of all) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && (rel.endsWith('.json') || /Archivo:/i.test(lines[0])), `${rel} (${lines.length}L < ${maxL}L)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono') && !txt.includes('#800000') && !/aura/i.test(txt), `Sin emojis/font-mono/#800000/Aura: ${rel}`);
  }
  const cat = JSON.parse(fs.readFileSync('public/assets/covers/cover_catalog.json', 'utf8'));
  ok(cat.covers?.length === 12 && cat.covers.every(c => typeof c.subcategoria === 'string' && c.subcategoria.length >= 4), 'cover_catalog.json: 12 fichas con subcategoria');
  let synced = 0; for (const [rel] of SYNC_FILES) if (fs.existsSync(path.join(ENGINE, rel)) && sha(path.resolve(rel)) === sha(path.join(ENGINE, rel))) synced++;
  ok(synced === SYNC_FILES.length, `Paridad SHA-256 100% MATCH con tucured-engine (${synced}/${SYNC_FILES.length})`);
}

async function enterStep1(cdp, mob) {
  if (!mob) return;
  await cdp.evalJs(`document.getElementById('btn-cover-reservar')?.click()`);
  for (let i = 0; i < 15; i++) { if (await cdp.evalJs(`!document.getElementById('turnero-booking-stage')?.classList.contains('hidden')`)) break; await wait(60); }
}

async function runViewport(cdp, vp) {
  await cdp.goto('/turnero.html'); await cdp.evalJs('localStorage.clear()');
  const seenFonts = new Set();
  for (const [r, lvl, font] of RUBROS) {
    await cdp.goto(`/turnero.html?rubro=${r}&level=${lvl}&motion=0`);
    for (let i = 0; i < 20; i++) { if (await cdp.evalJs(`Boolean(document.getElementById('cover-brand-logo')?.complete && document.getElementById('turnero-brand-logo')?.complete)`)) break; await wait(80); }
    const cov = await cdp.evalJs(`(() => {
      const h1 = document.getElementById('cover-biz-name'), lg = document.getElementById('cover-brand-logo'), st = document.getElementById('cover-status-line');
      return {
        biz: h1?.textContent?.trim() || '', h1Font: getComputedStyle(h1).fontFamily, lgSrc: lg?.getAttribute('src') || '', lgW: lg?.getBoundingClientRect().width || 0, lgOk: Boolean(lg?.naturalWidth > 0),
        stCol: getComputedStyle(st).color, foot: document.getElementById('turnero-brand-link')?.textContent?.replace(/\\s+/g, ' ').trim() || '',
        noWord: !/\\b(pase|ticket)\\b/i.test(document.body.innerText), ov: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
    seenFonts.add(font);
    ok(cov.h1Font.toLowerCase().includes(font.toLowerCase()) && cov.lgSrc.endsWith(`demo_${r}.svg`) && cov.lgOk && cov.lgW >= 64 && cov.stCol !== 'rgb(255, 255, 255)', `${vp.n} [${r}/${lvl}] Fuente ${font}, logo >=64px y acento claro`);
    ok(cov.foot === '· Turnero online' && cov.noWord && !cov.ov && (r !== 'estetica' || cov.biz === 'Siena Estética & Spa'), `${vp.n} [${r}/${lvl}] Pie sin Tucu Red repetido, 0 pase/ticket${r === 'estetica' ? ', Siena' : ''}`);
    await enterStep1(cdp, vp.mob);
    const s1 = await cdp.evalJs(`({ noNums: !/\\b01\\b|\\b02\\b|\\b03\\b/.test(document.getElementById('turnero-root')?.innerText || ''), noWord: !/\\b(pase|ticket)\\b/i.test(document.body.innerText) })`);
    ok(s1.noNums && s1.noWord, `${vp.n} [${r}/${lvl}] Paso 1 sin 01/02/03 ni pase/ticket`);
  }
  ok(seenFonts.size === 6, `${vp.n} 6 tipografías display únicas cargadas (${seenFonts.size}/6)`);
  await cdp.goto('/turnero.html?rubro=peluqueria&logo=none&motion=0');
  ok(await cdp.evalJs(`!document.getElementById('cover-brand-logo')`), `${vp.n} ?logo=none oculta logo sin círculo de iniciales`);

  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0'); await enterStep1(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click()`); await wait(100);
  const s2New = await cdp.evalJs(`({ hasTotal: Boolean(document.getElementById('turnero-service-total')?.textContent?.includes('Total del servicio')), tuRes: document.getElementById('turnero-boarding-pass')?.innerText?.includes('TU RESERVA'), hasBday: Boolean(document.getElementById('inp-client-birthday') && document.getElementById('inp-client-email')), noWord: !/\\b(pase|ticket)\\b/i.test(document.body.innerText) })`);
  ok(s2New.hasTotal && s2New.tuRes && s2New.hasBday && s2New.noWord, `${vp.n} Paso 2 TU RESERVA: Total del servicio + ficha cumpleaños/email`);

  await cdp.evalJs(`document.getElementById('inp-client-first').value='Martín';document.getElementById('inp-client-last').value='Rodríguez';document.getElementById('inp-client-phone').value='3815554321';document.getElementById('inp-client-birthday').value='1992-05-14';document.getElementById('inp-client-email').value='martin@tucured.ar';document.getElementById('btn-confirm-booking').click();`);
  await wait(160);
  const tk1 = await cdp.evalJs(`({ code: document.getElementById('ticket-code-badge')?.textContent?.trim(), alias: Boolean(document.getElementById('ticket-alias-row')), cbuHid: !document.getElementById('ticket-cbu-row'), tog: Boolean(document.getElementById('btn-toggle-cbu')), cal: document.querySelectorAll('#btn-smart-calendar').length, count: JSON.parse(localStorage.getItem('tucu_l1_bookings_peluqueria')||'[]').length, noWord: !/\\b(pase|ticket)\\b/i.test(document.body.innerText) })`);
  await cdp.evalJs(`document.getElementById('btn-toggle-cbu').click()`); await wait(60);
  ok(/^#TK-/.test(tk1.code) && tk1.alias && tk1.cbuHid && tk1.tog && tk1.cal === 1 && tk1.noWord && await cdp.evalJs(`Boolean(document.getElementById('ticket-cbu-row'))`), `${vp.n} Comprobante (${tk1.code}): Alias + CBU colapsable + 1 cal + 0 pase/ticket`);

  await cdp.evalJs(`document.getElementById('btn-reschedule-booking').click()`); await wait(100);
  const ban = await cdp.evalJs(`document.getElementById('turnero-reschedule-banner')?.textContent?.trim() || ''`);
  await cdp.evalJs(`const chips=[...document.querySelectorAll('[data-time-slot]')];if(chips[1])chips[1].click();setTimeout(()=>{document.getElementById('btn-step1-next').click();setTimeout(()=>document.getElementById('btn-confirm-booking').click(),60);},60);`);
  await wait(240);
  const tk2 = await cdp.evalJs(`({ code: document.getElementById('ticket-code-badge')?.textContent?.trim(), count: JSON.parse(localStorage.getItem('tucu_l1_bookings_peluqueria')||'[]').length, toast: document.getElementById('ticket-inline-toast')?.textContent || '' })`);
  ok(ban.includes(tk1.code) && tk2.code === tk1.code && tk2.count === tk1.count && tk2.toast.includes('reprogramado'), `${vp.n} Reprogramación mantiene ${tk2.code} sin duplicar (${tk2.count})`);

  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0');
  const covRet = await cdp.evalJs(`({ greet: document.getElementById('cover-client-greeting')?.textContent?.trim(), card: document.getElementById('btn-cover-active-ticket')?.textContent?.replace(/\\s+/g,' ').trim()||'', hist: Boolean(document.getElementById('btn-cover-history')), noWord: !/\\b(pase|ticket)\\b/i.test(document.body.innerText) })`);
  await cdp.evalJs(`document.getElementById('btn-cover-history').click()`); await wait(80);
  const histOk = await cdp.evalJs(`Boolean(document.getElementById('tucu-history-modal')) && !/\\b(pase|ticket)\\b/i.test(document.body.innerText)`);
  await cdp.evalJs(`document.getElementById('btn-close-history-modal').click()`); await wait(60);
  ok(covRet.greet === 'Hola, Martín' && covRet.card.includes('Tu próximo turno') && covRet.card.includes('Ver detalle') && covRet.hist && covRet.noWord && histOk, `${vp.n} Portada semillita + Mis turnos historial`);

  await enterStep1(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click();setTimeout(()=>document.getElementById('btn-edit-client-profile').click(),60);`);
  await wait(160);
  const ro = await cdp.evalJs(`({ ro: document.getElementById('inp-client-phone')?.readOnly, bday: document.getElementById('inp-client-birthday')?.value, mail: document.getElementById('inp-client-email')?.value })`);
  await cdp.evalJs(`document.getElementById('btn-unlock-phone').click()`); await wait(60);
  ok(ro.ro === true && ro.bday === '1992-05-14' && ro.mail === 'martin@tucured.ar' && await cdp.evalJs(`document.getElementById('inp-client-phone')?.readOnly === false`), `${vp.n} Ficha Paso 2: WhatsApp readonly hasta "Usar otro número" + cumpleaños/email`);

  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0');
  await cdp.evalJs(`document.getElementById('btn-cover-active-ticket').click();setTimeout(()=>document.getElementById('btn-cancel-booking').click(),60);`);
  await wait(160);
  const kpiModal = await cdp.evalJs(`document.querySelectorAll('[data-cancel-reason]').length === 4`);
  await cdp.evalJs(`document.getElementById('btn-cancel-reason-0').click()`); await wait(120);
  const afterCan = await cdp.evalJs(`({ txt: document.getElementById('inline-cancelled-banner')?.textContent || '', rec: JSON.parse(localStorage.getItem('tucu_l1_bookings_peluqueria')||'[]')[0]?.cancelReason, seed: localStorage.getItem('tucu_client_seed_l1_peluqueria') })`);
  ok(kpiModal && afterCan.txt.includes('Me surgió un imprevisto') && afterCan.rec === 'Me surgió un imprevisto' && afterCan.seed === null, `${vp.n} Cancelación KPI guarda motivo y limpia semillita`);

  await cdp.evalJs(`localStorage.removeItem('tucu_client_profile_v1');`);
  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0'); await enterStep1(cdp, vp.mob);
  await cdp.evalJs(`document.getElementById('btn-step1-next').click();setTimeout(()=>{document.getElementById('inp-client-first').value='Lucía';document.getElementById('inp-client-last').value='Fernández';document.getElementById('inp-client-phone').value='3814449988';document.getElementById('btn-confirm-booking').click();},60);`);
  await wait(180);
  await cdp.evalJs(`localStorage.removeItem('tucu_client_profile_v1');localStorage.removeItem('tucu_client_seed_l1_peluqueria');`);
  await cdp.goto('/turnero.html?rubro=peluqueria&level=l1&motion=0');
  await cdp.evalJs(`document.getElementById('btn-cover-lookup').click();`); await wait(80);
  const lkUi = await cdp.evalJs(`({ s: Boolean(document.getElementById('inp-lookup-lastname') && document.getElementById('inp-lookup-last4')), noAlt: !document.getElementById('inp-lookup-wa') && !document.getElementById('inp-resend-phone'), noWord: !/\\b(pase|ticket)\\b/i.test(document.body.innerText) })`);
  await cdp.evalJs(`document.getElementById('inp-lookup-lastname').value='fernandez';document.getElementById('inp-lookup-last4').value='9988';document.getElementById('btn-lookup-submit').click();`);
  await wait(140);
  ok(lkUi.s && lkUi.noAlt && lkUi.noWord && await cdp.evalJs(`Boolean(document.getElementById('turnero-ticket-view'))`), `${vp.n} Consulta Apellido + 4 dígitos (sin tildes, sin número destino alternativo)`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-110b'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
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
  console.log(`\nRESULTADO FINAL [TASK-110B]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });