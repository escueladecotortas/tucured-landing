// Archivo: scripts/verify_task076_inapp_ticket_ux.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5176, PORT_CDP = 9238, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const MODIFIED = [
  'public/gestion_turno.html', 'public/js/admin_shared/ticket_portal.js',
  'public/js/admin_shared/turnero_app.js', 'public/js/admin_shared/turnero_catalog.js',
  'js/showcase_v11/showcase_mockup.js'
];
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FORBIDDEN = [/wa\.me/i, /Copia WhatsApp/i, /Enviar por WhatsApp/i, /Enviar comprobante por WhatsApp/i, /target="_blank"/i, /window\.open\s*\(/i];

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA TASK-076 (<=180L, AST, CERO WA.ME/_BLANK, SHA-256) ===');
  const vc = path.resolve('vite.config.js');
  ok(fs.existsSync(vc) && fs.readFileSync(vc, 'utf8').split(/\r?\n/).length <= 180 && spawnSync('node', ['--check', vc]).status === 0, 'vite.config.js OK (<=180L, AST OK)');
  for (const rel of MODIFIED) {
    const src = path.resolve(rel);
    const eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    const uiOnly = lines.filter(l => !['//', '/*', '*'].some(p => l.trim().startsWith(p))).join('\n');
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L, header OK)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    if (rel.startsWith('public/')) ok(!/\bindigo\b/i.test(txt), `Sin indigo en ${rel}`);
    ok(!EMOJI_RE.test(uiOnly), `Cero emojis UI en ${rel}`);
    ok(FORBIDDEN.every(rx => !rx.test(txt)), `Sin wa.me, target="_blank" ni botones WA externos en ${rel}`);
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
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await this.waitReady(); }
  async waitReady(matchPath = '') {
    for (let i = 0; i < 40; i++) {
      await wait(120);
      const st = await this.evalJs('({ r: document.readyState, h: location.href })').catch(() => null);
      if (st && st.h.startsWith(BASE) && st.r === 'complete' && (!matchPath || st.h.includes(matchPath))) break;
    }
    await wait(350);
  }
  close() { this.ws.close(); }
}

async function main() {
  runStatic();
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  const preview = spawn('node', [viteBin, 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-076'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });

  try {
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); break; } catch { await wait(200); } }
    const tab = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?${encodeURIComponent(BASE + '/index.html')}`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await cdp.goto('/index.html');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear();');
    await cdp.goto('/index.html');

    console.log('\n=== 2. SHOWROOM CONFIRMACIÓN & NAVEGACIÓN IN-PLACE (375x667) ===');
    const tabsBefore = (await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`)).filter(t => t.type === 'page').length;
    const sr = await cdp.evalJs(`(async () => {
      const w = (ms=140) => new Promise(r => setTimeout(r, ms));
      window.ShowcaseCore.selectLevel('l2'); window.ShowcaseCore.selectRubro('estetica'); await w();
      window.ShowcaseCore.nextStep(); await w(); window.ShowcaseCore.nextStep(); await w(); window.ShowcaseCore.confirmBooking(); await w(220);
      const txt = document.getElementById('mockup-container')?.innerText || '';
      const a = document.getElementById('btn-showroom-open-ticket');
      return {
        notice: txt.includes('Comprobante y enlace enviados automáticamente a tu WhatsApp'),
        noCopyWa: !/Copia WhatsApp/i.test(txt) && document.querySelectorAll('#mockup-container a[href*="wa.me"]').length === 0,
        sameTabLink: Boolean(a && a.getAttribute('target') !== '_blank'),
        ov: document.documentElement.scrollWidth > 375
      };
    })()`);
    if (!(sr.notice && sr.noCopyWa && sr.sameTabLink && !sr.ov)) console.log('    DEBUG SR:', sr);
    ok(sr.notice && sr.noCopyWa && sr.sameTabLink && !sr.ov, 'Showroom Paso 4: aviso WA automático, sin Copia WhatsApp/wa.me, enlace in-place, 375px OK');

    await cdp.evalJs(`document.getElementById('btn-showroom-open-ticket')?.click()`);
    await wait(160);
    const tabsAfterSr = (await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`)).filter(t => t.type === 'page').length;
    const srModal = await cdp.evalJs(`({ modal: !!document.getElementById('tucu-ticket-modal-overlay'), url: location.pathname, retBtn: !!document.getElementById('btn-modal-return-turnero') })`);
    ok(tabsAfterSr === tabsBefore && srModal.modal && srModal.retBtn && !srModal.url.includes('gestion_turno'), 'Showroom "Ver Ticket Online" abre modal in-place sin cambiar URL ni abrir pestañas');
    await cdp.evalJs(`document.getElementById('btn-modal-return-turnero')?.click()`);
    await wait(120);
    ok(!(await cdp.evalJs(`!!document.getElementById('tucu-ticket-modal-overlay')`)), '"Volver al Turnero" cierra modal limpiamente en Showroom');

    console.log('\n=== 3. TURNERO AUTÓNOMO (/turnero.html) -> MODAL + /t/TK-XXXX & REPORTE COMPROBANTE ===');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear();');
    await cdp.goto('/turnero.html?level=l2&slug=demo-central&rubro=estetica');
    const tr = await cdp.evalJs(`(async () => {
      const w = (ms=140) => new Promise(r => setTimeout(r, ms));
      document.querySelector('[data-srv-id]')?.click(); await w();
      document.getElementById('btn-step1-next')?.click(); await w();
      document.getElementById('btn-step2-next')?.click(); await w();
      document.getElementById('inp-client-name').value = 'Sofía Méndez';
      document.getElementById('inp-client-phone').value = '3815551122';
      document.getElementById('btn-confirm-booking')?.click(); await w(200);
      const txt = document.body.innerText, b = document.getElementById('btn-open-ticket');
      return {
        notice: txt.includes('Comprobante y enlace enviados automáticamente a tu WhatsApp'),
        noWa: !/Enviar por WhatsApp/i.test(txt) && document.querySelectorAll('a[href*="wa.me"]').length === 0,
        path: b?.dataset?.ticketPath || '', sameTab: b?.getAttribute('target') !== '_blank',
        ov: document.documentElement.scrollWidth > 375
      };
    })()`);
    ok(tr.notice && tr.noWa && /^\/t\/TK-/.test(tr.path) && tr.sameTab && !tr.ov, `Turnero Paso 4: aviso WA automático, modal en ${tr.path}, 0 wa.me, 375px OK`);

    await cdp.evalJs(`document.getElementById('btn-open-ticket')?.click()`);
    await wait(160);
    const modalOpenTr = await cdp.evalJs(`Boolean(document.getElementById('tucu-ticket-modal-overlay')) && location.pathname === '/turnero.html'`);
    ok(modalOpenTr && (await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`)).filter(t => t.type === 'page').length === tabsBefore, 'Turnero "Ver Ticket Online" abre modal overlay en misma pantalla');

    await cdp.goto(tr.path);
    const tabsAtTicket = (await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`)).filter(t => t.type === 'page').length;
    const tk = await cdp.evalJs(`(async () => {
      const w = (ms=120) => new Promise(r => setTimeout(r, ms));
      const noWaBtn = !document.body.innerText.includes('Enviar comprobante por WhatsApp') && document.querySelectorAll('a[href*="wa.me"]').length === 0;
      document.getElementById('btn-copy-alias')?.click(); await w();
      const aliasToast = document.getElementById('portal-toast')?.innerText || '';
      document.getElementById('btn-copy-cbu')?.click(); await w();
      const cbuToast = document.getElementById('portal-toast')?.innerText || '';
      const fileInp = document.getElementById('inp-receipt-file');
      const hasFileInp = Boolean(fileInp && fileInp.type === 'file' && fileInp.accept === 'image/*,.pdf');
      document.getElementById('btn-report-receipt')?.click(); await w(150);
      const bks = JSON.parse(localStorage.getItem('tucu_l2_bookings') || '[]');
      const rec = bks.find(x => location.pathname.includes(x.id));
      const banner = document.getElementById('receipt-reported-banner')?.innerText || '';
      return { path: location.pathname, noWaBtn, aliasToast, cbuToast, hasFileInp, reported: rec?.depositReceiptReported === true, hasAt: Boolean(rec?.depositReceiptAt), banner, ov: document.documentElement.scrollWidth > 375 };
    })()`);
    ok(tabsAtTicket === tabsBefore && tk.path.startsWith('/t/TK-') && tk.noWaBtn && !tk.ov, `Portal ${tk.path}: navegación misma pestaña, sin WhatsApp/wa.me, 375px OK`);
    ok(tk.aliasToast.includes('Alias copiado') && tk.cbuToast.includes('CBU copiado') && tk.hasFileInp, 'Bloque seña: copia Alias/CBU OK y selector input[accept="image/*,.pdf"] presente');
    ok(tk.reported && tk.hasAt && tk.banner.includes('Comprobante informado — en validación por el comercio'), 'Informar transferencia persiste depositReceiptReported/At en localStorage y actualiza UI');

    await cdp.evalJs(`document.getElementById('btn-return-turnero')?.click()`);
    await cdp.waitReady('/turnero.html');
    const backTr = await cdp.evalJs('location.pathname + location.search');
    ok(backTr === '/turnero.html?level=l2&slug=demo-central&rubro=estetica' && (await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`)).filter(t => t.type === 'page').length === tabsBefore, `Volver al Turnero retorna in-place a ${backTr}`);
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >=400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\n=== RESUMEN TASK-076: PASS=${pass} | FAIL=${fail} ===`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
