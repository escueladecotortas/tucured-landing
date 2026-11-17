// Archivo: scripts/verify_task080_block1_cancel_address_wa.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5181, PORT_CDP = 9242, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const TOUCHED = [
  'public/js/admin_shared/ticket_modal.js', 'public/js/admin_shared/ticket_portal.js',
  'public/js/admin_shared/turnero_catalog.js', 'public/js/admin_shared/turnero_app.js',
  'public/js/admin_shared/admin_demo_seed.js', 'public/js/admin_shared/admin_wa_templates.js',
  'public/admin_l1.html', 'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l1/admin_l1_config.js', 'public/js/admin_l1/admin_l1_agenda.js',
  'public/admin_l2.html', 'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_config.js', 'public/js/admin_l2/admin_l2_calendar.js',
  'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_system.js', 'public/js/admin_l3/view_agenda.js',
  'js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_booking_sync.js', 'js/showcase_v11/showcase_mockup.js', 'js/showcase_v11/showcase_core.js'
];

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 1 (<=180L, AST, PARIDAD SHA-256) ===');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L, header OK)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    if (rel.startsWith('public/')) ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo ni emojis: ${rel}`);
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
      else if (m.method === 'Network.responseReceived' && m.params.response.url.startsWith(BASE) && m.params.response.status >= 400 && !m.params.response.url.includes('favicon')) this.httpFails.push(`${m.params.response.status} ${m.params.response.url}`);
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); await this.send('Network.enable'); await this.send('Page.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result?.value; }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(100); const st = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (st && st.h.startsWith(BASE) && st.r === 'complete') break; } await wait(300); }
  close() { this.ws.close(); }
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-080'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });

  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }
    const tab = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await cdp.goto('/index.html');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem("tucured_pin_ok_L1","1"); sessionStorage.setItem("tucured_pin_ok_L2","1");');

    console.log('\n=== 2. SHOWROOM L2: MENSAJE WA MULTILÍNEA + DIRECCIÓN + CANCELACIÓN REAL ===');
    const l2Res = await cdp.evalJs(`(async () => {
      const w = (ms=130) => new Promise(r => setTimeout(r, ms));
      ShowcaseCore.selectLevel('l2'); ShowcaseCore.selectRubro('estetica'); await w();
      ShowcaseCore.nextStep(); await w(); ShowcaseCore.nextStep(); await w(); ShowcaseCore.confirmBooking(); await w(180);
      const code = ShowcaseState.lastBookingCode, waUrl = ShowcaseCore.getLastWaUrl(), decoded = decodeURIComponent(waUrl.split('text=')[1] || '');
      const dom4 = document.getElementById('mockup-container')?.innerText || '';
      document.getElementById('btn-showroom-cancel-ticket')?.click(); await w(150);
      const modalAddr = document.getElementById('modal-ticket-address')?.innerText || '';
      const askVisible = !!document.getElementById('btn-confirm-cancel');
      document.getElementById('btn-confirm-cancel')?.click(); await w(160);
      const recPart = (JSON.parse(localStorage.getItem('tucu_l2_bookings_estetica') || '[]')).find(b => b.id === code);
      const recMain = (JSON.parse(localStorage.getItem('tucu_l2_bookings') || '[]')).find(b => b.id === code);
      const badgeTxt = document.getElementById('modal-status-badge')?.innerText || '';
      document.getElementById('btn-close-ticket-modal')?.click(); await w(100);
      return { code, hasLineBreakUrl: waUrl.includes('%0A'), decoded, domHasAddr: dom4.includes('Av. Aconquija 1320, Yerba Buena'), modalAddr, askVisible, recPart, recMain, badgeTxt, step4Cancelled: (document.getElementById('mockup-container')?.innerText || '').includes('TURNO CANCELADO') };
    })()`);
    ok(l2Res.hasLineBreakUrl && l2Res.decoded.includes(`#${l2Res.code}`) && l2Res.decoded.includes('*Dirección:* Av. Aconquija 1320, Yerba Buena') && l2Res.decoded.includes('*Código:*'), `Showroom L2 WA URL (%0A, #${l2Res.code}, negritas y dirección real)`);
    ok(l2Res.domHasAddr && l2Res.modalAddr === 'Av. Aconquija 1320, Yerba Buena' && l2Res.askVisible, 'Showroom Paso 4 y TucuTicketModal muestran dirección y abren confirmación directa de cancelación');
    ok(l2Res.recPart?.status === 'CANCELLED' && l2Res.recMain?.status === 'CANCELLED' && l2Res.recPart?.prevStatus === 'PENDING_DEPOSIT' && l2Res.badgeTxt === 'Cancelado' && l2Res.step4Cancelled, `Cancelación L2 real persistida en localStorage (${l2Res.code}: status=CANCELLED, prevStatus=${l2Res.recPart?.prevStatus})`);

    console.log('\n=== 3. SHOWROOM L1 & L3: CANCELACIÓN REAL + DIRECCIÓN ===');
    for (const [lvl, rub, key, expStatus, expAddr] of [
      ['l1', 'deportes', 'tucu_l1_bookings_deportes', 'cancelado', 'Av. Perón 1850, Yerba Buena'],
      ['l3', 'salud', 'tucu_l3_bookings_salud_consultorio', 'CANCELLED', 'San Martín 845, S. M. de Tucumán']
    ]) {
      const r = await cdp.evalJs(`(async () => {
        const w = (ms=130) => new Promise(r => setTimeout(r, ms));
        ShowcaseCore.selectStep(1); ShowcaseCore.selectLevel('${lvl}'); ShowcaseCore.selectRubro('${rub}'); await w();
        ShowcaseCore.nextStep(); await w(); ShowcaseCore.nextStep(); await w(); ShowcaseCore.confirmBooking(); await w(160);
        const code = ShowcaseState.lastBookingCode;
        document.getElementById('btn-showroom-cancel-ticket')?.click(); await w(140);
        document.getElementById('btn-confirm-cancel')?.click(); await w(140);
        const saved = (JSON.parse(localStorage.getItem('${key}') || '[]')).find(b => b.id === code);
        document.getElementById('btn-close-ticket-modal')?.click();
        return { code, status: saved?.status, prev: saved?.prevStatus, addr: saved?.address };
      })()`);
      ok(r.status === expStatus && r.prev && r.addr === expAddr, `Showroom ${lvl.toUpperCase()} (${rub}): cancelado real (${r.code} -> ${r.status}, prev=${r.prev}, addr=${r.addr})`);
    }

    console.log('\n=== 4. MIGRACIÓN WA + CONSOLAS ADMIN L1/L2/L3 + PORTAL /t/TK-XXXX ===');
    await cdp.evalJs(`localStorage.setItem('tucu_l2_wa_templates_v2', JSON.stringify({ waNumber: '5493815551234', t1a: '¡Hola {{cliente}}! Registramos tu reserva en {{comercio}} para el {{fecha}} a las {{hora}} hs ({{servicio}}). {{link_ticket}}', t1b: '¡Hola {{cliente}}! Tu turno en {{comercio}} quedó confirmado para el {{fecha}}. {{link_ticket}}' })); localStorage.setItem('tucu_l1_wa_templates_v2', JSON.stringify({ waNumber: '5493815551234', t1a: 'Mi saludo propio sin direccion', customManual: true }));`);
    await cdp.goto('/admin_l2.html?rubro=estetica');
    const a2 = await cdp.evalJs(`(async () => {
      document.getElementById('main-view-btn-config')?.click(); await new Promise(r=>setTimeout(r,120));
      const inp = document.getElementById('cfg-biz-address'); const initVal = inp?.value || '';
      inp.value = 'Av. Aconquija 2100, Yerba Buena'; inp.dispatchEvent(new Event('input'));
      document.getElementById('tab-btn-wa')?.click(); await new Promise(r=>setTimeout(r,100));
      document.getElementById('btn-save-global-config')?.click(); await new Promise(r=>setTimeout(r,120));
      const prev1a = document.getElementById('cfg-preview-1a')?.innerText || '';
      const stored = JSON.parse(localStorage.getItem('tucu_l2_wa_templates_v2') || '{}');
      return { initVal, prev1a, migrated: stored.migratedV3, hasNl: (stored.t1a || '').includes('\\n') };
    })()`);
    ok(a2.initVal === 'Av. Aconquija 1320, Yerba Buena' && a2.migrated && a2.hasNl && a2.prev1a.includes('Av. Aconquija 2100, Yerba Buena') && a2.prev1a.includes('#TK-'), 'Admin L2: #cfg-biz-address funcional + migración automática de plantilla vieja WA');

    await cdp.goto('/admin_l1.html?rubro=peluqueria');
    const a1 = await cdp.evalJs(`(() => { document.getElementById('main-view-btn-configuracion')?.click(); return { addr: document.getElementById('cfg-biz-address')?.value || '', customKept: AdminWaTemplates.getTemplates('l1').t1a === 'Mi saludo propio sin direccion' }; })()`);
    ok(a1.addr === '25 de Mayo 480, S. M. de Tucumán' && a1.customKept, 'Admin L1: #cfg-biz-address OK y respeta plantillas personalizadas manualmente');

    await cdp.goto('/admin_l3.html?rubro=deportes_clubes');
    const a3 = await cdp.evalJs(`(async () => { AdminL3Core.switchTab('system'); await new Promise(r=>setTimeout(r,120)); return { addr: document.getElementById('cfg-biz-address')?.value || '', prev: document.getElementById('cfg-preview-1b')?.innerText || '' }; })()`);
    ok(a3.addr === 'Av. Perón 1850, Yerba Buena' && a3.prev.includes('Av. Perón 1850, Yerba Buena'), 'Admin L3: #cfg-biz-address visible y reflejado en vista previa WA');

    await cdp.goto(`/t/${l2Res.code}`);
    const pt = await cdp.evalJs(`({ addr: document.getElementById('portal-ticket-address')?.innerText || '', badge: document.getElementById('portal-status-badge')?.innerText || '' })`);
    ok(pt.addr === 'Av. Aconquija 1320, Yerba Buena' && pt.badge === 'Cancelado', `Portal /t/${l2Res.code} muestra Dirección y estado Cancelado`);
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, `Consola limpia (0 JS errors, 0 HTTP >=400)`);
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESUMEN [TASK-080 BLOQUE 1]: PASS=${pass} | FAIL=${fail}`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });