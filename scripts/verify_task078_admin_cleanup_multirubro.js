// Archivo: scripts/verify_task078_admin_cleanup_multirubro.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5179, PORT_CDP = 9240, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const TOUCHED = [
  'public/js/admin_shared/admin_demo_seed.js', 'public/js/admin_shared/admin_booking_engine.js',
  'public/js/admin_shared/admin_shell.js', 'public/admin_l1.html', 'public/js/admin_l1/admin_l1_core.js',
  'public/js/admin_l1/admin_l1_pricing.js', 'public/js/admin_l1/admin_l1_agenda.js', 'public/admin_l2.html',
  'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_services.js', 'public/js/admin_l2/admin_l2_calendar.js',
  'public/admin_l3.html', 'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js',
  'js/showcase_v11/showcase_admin_preview.js'
];

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA TASK-078 (<=180L, AST, 0 EMOJIS, PARIDAD SHA-256) ===');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    const ui = lines.filter(l => !['//', '/*', '*'].some(p => l.trim().startsWith(p))).join('\n');
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L, header OK)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    if (rel.startsWith('public/')) ok(!/\bindigo\b/i.test(txt), `Sin indigo en ${rel}`);
    ok(!EMOJI_RE.test(ui), `Cero emojis UI en ${rel}`);
    ok(fs.existsSync(eng) && sha256(src) === sha256(eng), `Paridad SHA-256 Blueprint: ${rel}`);
  }
}

const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const req = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); });
  req.on('error', rej); req.end();
});

class Cdp {
  constructor(ws) {
    this.ws = new WebSocket(ws); this.id = 1; this.p = new Map(); this.errors = []; this.httpFails = [];
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const x = this.p.get(m.id); this.p.delete(m.id); m.error ? x.rej(new Error(m.error.message)) : x.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params.exceptionDetails.text);
      else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !(m.params.entry.url || '').includes('favicon')) this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params.response.url.startsWith(BASE) && m.params.response.status >= 400 && !m.params.response.url.includes('favicon')) {
        this.httpFails.push(`${m.params.response.status} ${m.params.response.url}`);
      }
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); await this.send('Network.enable'); await this.send('Page.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result?.value; }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(110); const s = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (s && s.h.startsWith(BASE) && s.r === 'complete') break; } await wait(350); }
  close() { this.ws.close(); }
}

const EXPECT = [
  ['peluqueria', 'Peluquería & Barbería Central', 'Corte Clásico'],
  ['estetica', 'Aura Estética & Spa', 'Limpieza Facial Profunda'],
  ['gastronomia', 'Bistró & Parrilla El Encuentro', 'Reserva Mesa 2 Personas'],
  ['salud', 'Consultorios Médicos San Martín', 'Consulta Clínica General'],
  ['servicios', 'Estudio Jurídico & Contable Norte', 'Asesoría Inicial 45 min']
];

async function checkCardsAndSidebar(cdp, lvl, boxSel, url) {
  await cdp.evalJs('localStorage.clear();');
  await cdp.goto(url);
  await cdp.evalJs("for (const d of ['4','2','4','2']) document.querySelector('[data-pin-digit=\"' + d + '\"]')?.click();");
  await wait(320);
  return await cdp.evalJs(`(async () => {
    const sb = document.getElementById('admin-sidebar')?.innerText || '';
    const noTurneroLink = document.getElementById('btn-view-client-turnero') === null && !/Ver Turnero del cliente/i.test(sb);
    const box = document.querySelector('${boxSel}');
    const txt = box?.innerText || '';
    const noJunkBtns = !/Ver Ticket Online|Enviar WhatsApp/i.test(txt) && box?.querySelectorAll('a[href*="wa.me"]').length === 0;
    const btn = box?.querySelector('[data-toggle-detail]');
    const dId = btn?.dataset?.toggleDetail;
    const det = dId ? document.getElementById('bk-detail-' + dId) : null;
    const hiddenInit = Boolean(det && det.classList.contains('hidden'));
    btn?.click(); await new Promise(r => setTimeout(r, 80));
    const shownAfter = Boolean(det && !det.classList.contains('hidden') && det.innerText.includes('Tel:') && det.innerText.includes('#') && det.innerText.includes('Saldo local:'));
    const toggledTxt = btn?.innerText?.trim() === 'Ocultar';
    return { noTurneroLink, noJunkBtns, hiddenInit, shownAfter, toggledTxt, ov: document.documentElement.scrollWidth <= 375, bodyTxt: txt };
  })()`);
}

async function main() {
  runStatic();
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  const preview = spawn('node', [viteBin, 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-078'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });

  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }
    const tab = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await cdp.goto('/admin_l1.html');

    console.log('\n=== 2. SEMILLAS MULTI-RUBRO COMPLETAS L1 (5/5 RUBROS) ===');
    for (const [rubro, biz, srv] of EXPECT) {
      await cdp.evalJs('localStorage.clear(); sessionStorage.clear();');
      await cdp.goto(`/admin_l1.html?rubro=${rubro}`);
      await cdp.evalJs("for (const d of ['4','2','4','2']) document.querySelector('[data-pin-digit=\"' + d + '\"]')?.click();");
      await wait(300);
      const res = await cdp.evalJs(`(() => ({ title: document.getElementById('brand-title')?.innerText, agenda: document.getElementById('bookingsListContainer')?.innerText || '', cat: document.getElementById('services-pricing-container')?.innerText || '' }))()`);
      ok(res.title === biz && res.agenda.includes(srv) && res.cat.includes(srv), `L1 ?rubro=${rubro}: comercio '${biz}', agenda y catálogo con '${srv}'`);
    }

    console.log('\n=== 3. JERARQUÍA LIMPIA, DETALLE COLAPSABLE Y SIDEBAR SIN TURNERO (L1, L2, L3) ===');
    const rL1 = await checkCardsAndSidebar(cdp, 'L1', '#bookingsListContainer', '/admin_l1.html?rubro=estetica');
    ok(rL1.noTurneroLink && rL1.noJunkBtns && rL1.hiddenInit && rL1.shownAfter && rL1.toggledTxt && rL1.ov, 'L1 (375x667): sidebar limpio, sin Ticket/WA, detalle colapsable OK');

    const rL2 = await checkCardsAndSidebar(cdp, 'L2', '#calendar-bookings-container', '/admin_l2.html?rubro=gastronomia');
    const l2Extra = await cdp.evalJs(`({ title: document.getElementById('l2-brand-title')?.innerText, cat: document.getElementById('l2-services-container')?.innerText || '' })`);
    ok(l2Extra.title === 'Bistró & Parrilla El Encuentro' && l2Extra.cat.includes('Reserva Mesa 2 Personas') && rL2.bodyTxt.includes('Reserva Mesa 2 Personas'), 'L2 ?rubro=gastronomia adapta marca, catálogo y agenda');
    ok(rL2.noTurneroLink && rL2.noJunkBtns && rL2.hiddenInit && rL2.shownAfter && rL2.toggledTxt && rL2.ov, 'L2 (375x667): sidebar limpio, sin Ticket/WA, detalle colapsable OK');

    const rL3 = await checkCardsAndSidebar(cdp, 'L3', '#admin-view-root', '/admin_l3.html?rubro=salud_consultorio');
    const l3Title = await cdp.evalJs(`document.getElementById('l3-brand-title')?.innerText`);
    ok(l3Title === 'Consultorios Médicos San Martín' && rL3.bodyTxt.includes('Consulta Clínica General'), 'L3 ?rubro=salud_consultorio adapta marca y agenda');
    ok(rL3.noTurneroLink && rL3.noJunkBtns && rL3.hiddenInit && rL3.shownAfter && rL3.toggledTxt && rL3.ov, 'L3 (375x667): sidebar limpio, sin Ticket/WA, detalle colapsable OK');

    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >=400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\n=== RESUMEN TASK-078: PASS=${pass} | FAIL=${fail} ===`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
