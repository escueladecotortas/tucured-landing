// Archivo: scripts/verify_task097_mobile_audit_fixes.js
// Compuerta QA + E2E [TASK-097]: Calendario RFC 5545 + GCal, Comprobante Ticket, Paso 4 Móvil, Wizard Éxito & Términos

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4197, PORT_CDP = 9252, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FILES = [
  'index.html', 'public/gestion_turno.html', 'public/turnero.html', 'public/terminos.html',
  'public/js/admin_shared/calendar_links.js', 'public/js/admin_shared/ticket_modal.js', 'public/js/admin_shared/ticket_portal.js',
  'js/showcase_v11/showcase_core.js', 'js/showcase_v11/showcase_mockup.js', 'js/components/features.js',
  'js/components/funnel_data.js', 'js/components/pricing.js', 'js/components/stage_value_zone.js',
  'js/utils/whatsapp_link.js', 'js/components/funnel_checkout_markup.js', 'js/components/funnel.js',
  'js/components/footer.js', 'js/components/funnel_markup.js', 'scripts/verify_task097_mobile_audit_fixes.js'
];
const ENGINE_SYNC = [
  ['public/js/admin_shared/calendar_links.js', 'public/js/admin_shared/calendar_links.js'],
  ['public/js/admin_shared/ticket_modal.js', 'public/js/admin_shared/ticket_modal.js'],
  ['public/js/admin_shared/ticket_portal.js', 'public/js/admin_shared/ticket_portal.js'],
  ['public/gestion_turno.html', 'public/gestion_turno.html'], ['public/turnero.html', 'public/turnero.html'], ['public/terminos.html', 'public/terminos.html'],
  ['js/showcase_v11/showcase_core.js', 'public/js/showcase_v11/showcase_core.js'], ['js/showcase_v11/showcase_mockup.js', 'public/js/showcase_v11/showcase_mockup.js'],
  ['js/components/pricing.js', 'js/components/pricing.js'], ['js/components/stage_value_zone.js', 'js/components/stage_value_zone.js']
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
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params?.response?.url?.endsWith('/favicon.ico') && m.params?.response?.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(700); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-097]: <=180L, AST & PARIDAD SHA-256 ===');
  for (const rel of FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
  }
  for (const [srcRel, engRel] of ENGINE_SYNC) { const a = path.resolve(srcRel), b = path.join(ENGINE, engRel); ok(fs.existsSync(b) && sha(a) === sha(b), `Paridad SHA-256: ${srcRel} === engine/${engRel}`); }
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-097'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();

    for (const vp of [{ n: 'Móvil 375x667', w: 375, h: 667, mob: true }, { n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }]) {
      console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });
      await cdp.goto('/');
      for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(window.ShowcaseCore && window.TucuCalendar && document.getElementById('footer-terms-link'))`)) break; await wait(150); }
      const landing = await cdp.evalJs(`(() => {
        const body = document.body.innerText || '';
        window.ShowcaseCore.selectLevel('l2'); window.ShowcaseCore.confirmBooking();
        const ics = window.ShowcaseCore.addToCalendar();
        const gcal = document.getElementById('btn-showroom-gcal')?.href || '';
        const list = JSON.parse(localStorage.getItem('tucu_l2_bookings_barberia') || '[]');
        const code = window.ShowcaseState.lastBookingCode;
        if (list[0]) { list[0].depositAmount = 5000; list[0].depositPaid = false; list[0].status = 'PENDING_DEPOSIT'; localStorage.setItem('tucu_l2_bookings_barberia', JSON.stringify(list)); }
        window.TucuTicketModal.open(code, 'l2', 'barberia', { origin: 'showroom', immediate: true });
        const btn = document.getElementById('btn-report-receipt');
        const initDis = Boolean(btn?.disabled && btn.className.includes('opacity-50') && btn.className.includes('cursor-not-allowed'));
        const inp = document.getElementById('inp-receipt-file');
        const dt = new DataTransfer(); dt.items.add(new File(['img'], 'comprobante_mp.jpg', { type: 'image/jpeg' }));
        inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
        const enAfter = Boolean(btn && !btn.disabled && document.getElementById('receipt-file-name')?.innerText.includes('comprobante_mp.jpg'));
        const modIcs = window.TucuTicketModal.downloadCalendar(code), modGcal = document.getElementById('btn-ticket-gcal')?.href || '';
        btn.click();
        const bannerOk = Boolean(document.getElementById('receipt-reported-banner'));
        window.TucuTicketModal.close();
        return {
          copyOk: body.includes('desde 15 minutos hasta 8 horas') && !body.includes('480 min') && body.includes('selector de cantidad de personas o lugares') && !body.includes('selector de Pax'),
          termsLinks: document.getElementById('footer-terms-link')?.getAttribute('href') === '/terminos.html' && Boolean(document.querySelector('#funnel-terms-notice a[href="/terminos.html"]')),
          icsOk: ics.includes('\\r\\n') && ics.includes('METHOD:PUBLISH') && ics.includes('UID:') && ics.includes('DTSTAMP:') && ics.includes('DTSTART:') && ics.includes('DTEND:') && modIcs.includes('METHOD:PUBLISH'),
          gcalOk: gcal.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE') && modGcal.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'),
          receiptOk: initDis && enAfter && bannerOk, overflow: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`);
      ok(landing.copyOk, `${vp.n}: Copy "desde 15 minutos hasta 8 horas" y "selector de cantidad de personas o lugares"`);
      ok(landing.termsLinks, `${vp.n}: Enlaces /terminos.html presentes en Footer y Paso 3`);
      ok(landing.icsOk && landing.gcalOk, `${vp.n}: RFC 5545 (.ics CRLF/PUBLISH/UID/DTSTAMP) + Google Calendar`);
      ok(landing.receiptOk && !landing.overflow, `${vp.n}: Modal Ticket valida comprobante (disabled -> enabled) y 0 overflow`);

      const wiz = await cdp.evalJs(`(() => {
        sessionStorage.clear();
        document.getElementById('fn-nombre').value = 'Barbería Norte'; document.getElementById('btn-goto-step-2').click();
        document.getElementById('btn-goto-step-3').click();
        document.getElementById('fn-first-name').value = 'Leo'; document.getElementById('fn-last-name').value = 'Paz';
        document.getElementById('fn-email').value = 'leo@barberia.com'; document.getElementById('fn-phone').value = '3815554321';
        document.getElementById('btn-goto-step-4').click();
        const aliasR = document.getElementById('checkout-alias-input').getBoundingClientRect(), btnR = document.getElementById('btn-copy-alias').getBoundingClientRect();
        document.getElementById('funnel-submit-btn').click();
        return { btnInBounds: btnR.left >= 0 && btnR.right <= window.innerWidth, stackedMob: window.innerWidth < 640 ? btnR.top >= aliasR.bottom - 2 : true };
      })()`);
      await wait(300);
      const succ = await cdp.evalJs(`(() => {
        const card = document.getElementById('funnel-success-card'), txt = card?.innerText || '', wa = document.getElementById('success-wa-btn');
        return {
          noOld: !document.getElementById('success-turnero-link') && !document.getElementById('success-admin-link') && !/Local-First/i.test(txt),
          textOk: txt.includes('Verificaremos tu transferencia de $4.999 para habilitar el turnero oficial de Barbería Norte durante el día.') && txt.includes('ficha rápida de configuración'),
          waOk: Boolean(wa && wa.innerText.includes('Enviar comprobante por WhatsApp') && decodeURIComponent(wa.href).includes('Barbería Norte') && decodeURIComponent(wa.href).includes('Leo Paz')),
          igOk: document.getElementById('success-instagram-link')?.href === 'https://instagram.com/tucured.ar'
        };
      })()`);
      ok(wiz.btnInBounds && wiz.stackedMob, `${vp.n}: Paso 4 "Copiar Alias" contenido dentro de ${vp.w}px`);
      ok(succ.noOld && succ.textOk && succ.waOk && succ.igOk, `${vp.n}: Pantalla final limpia sin links/Local-First y con CTA WhatsApp completo`);

      await cdp.goto('/gestion_turno.html');
      for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(window.TucuTicketPortal && window.AdminDemoSeed)`)) break; await wait(150); }
      await cdp.evalJs(`localStorage.clear(); window.TucuTicketPortal.render('');`);
      await cdp.goto('/gestion_turno.html?token=TK-8493');
      for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('inp-receipt-file') && window.TucuCalendar)`)) break; await wait(150); }
      const portal = await cdp.evalJs(`(() => {
        const btn = document.getElementById('btn-report-receipt'), initDis = Boolean(btn?.disabled && btn.className.includes('opacity-50'));
        const inp = document.getElementById('inp-receipt-file'), dt = new DataTransfer();
        dt.items.add(new File(['pdf'], 'ticket.pdf', { type: 'application/pdf' })); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
        const en = Boolean(btn && !btn.disabled), ics = window.TucuTicketPortal.downloadCalendar('TK-8493'), gcal = document.getElementById('btn-ticket-gcal')?.href || '';
        return { initDis, en, icsOk: ics.includes('\\r\\n') && ics.includes('METHOD:PUBLISH'), gcalOk: gcal.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE') };
      })()`);
      ok(portal.initDis && portal.en && portal.icsOk && portal.gcalOk, `${vp.n}: Portal /gestion_turno.html valida comprobante y genera calendario RFC 5545 + GCal`);

      await cdp.goto('/terminos.html');
      for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.querySelector('h1'))`)) break; await wait(150); }
      const terms = await cdp.evalJs(`({ h1: document.querySelector('h1')?.innerText || '', txt: document.body.innerText || '', overflow: document.documentElement.scrollWidth > window.innerWidth })`);
      ok(terms.h1.includes('Términos y Condiciones') && terms.txt.includes('Ley N° 25.326') && terms.txt.includes('1 a 25') && !terms.overflow, `${vp.n}: /terminos.html carga OK sin overflow`);
    }
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-097]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
