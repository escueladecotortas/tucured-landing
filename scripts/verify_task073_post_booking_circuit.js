// Archivo: scripts/verify_task073_post_booking_circuit.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn, spawnSync } from 'child_process';

const BASE = 'http://localhost:5174', ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine', CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', PORT = 9235;
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 220) => new Promise(r => setTimeout(r, ms));
const PUB_FILES = ['public/gestion_turno.html', 'public/js/admin_shared/admin_wa_templates.js', 'public/js/admin_shared/admin_booking_engine.js', 'public/js/admin_shared/ticket_portal.js', 'public/js/admin_l1/admin_l1_agenda.js', 'public/js/admin_l2/admin_l2_calendar.js', 'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js'];
const SC_FILES = ['js/showcase_v11/showcase_booking_sync.js', 'js/showcase_v11/showcase_core.js', 'js/showcase_v11/showcase_mockup.js', 'js/showcase_v11/showcase_admin_preview.js'];

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, AST (<180L), REDIRECTS Y PARIDAD BLUEPRINT ===');
  const emojiRx = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
  for (const rel of PUB_FILES) {
    const src = path.resolve(rel), eng = path.join(ENGINE, rel), txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    const ui = lines.filter(l => !['//', '/*', '*'].some(p => l.trim().startsWith(p))).join('\n');
    ok(lines.length <= 180 && lines[0].includes('Archivo:') && !/\bindigo\b/i.test(txt) && !emojiRx.test(ui), `${rel} (${lines.length}L, PEAC, 0 indigo, 0 emojis)`);
    ok(fs.existsSync(eng) && fs.readFileSync(eng, 'utf8') === txt, `Paridad byte-exacta: ${rel}`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
  }
  for (const rel of SC_FILES) {
    const src = path.resolve(rel), eng = path.join(ENGINE, 'public', rel), txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && lines[0].includes('Archivo:') && fs.existsSync(eng) && fs.readFileSync(eng, 'utf8') === txt, `Showcase (${lines.length}L) + Paridad: ${rel}`);
    ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
  }
  const rLand = fs.readFileSync(path.resolve('public/_redirects'), 'utf8'), rEng = fs.readFileSync(path.join(ENGINE, 'public/_redirects'), 'utf8');
  ok(rLand.includes('/t/*') && rLand.includes('/gestion_turno.html?token=:splat'), 'Landing _redirects contiene regla corta /t/* -> /gestion_turno.html');
  ok(rEng.includes('/t/*') && rEng.includes('/clients/mamatila/*') && rEng.indexOf('/t/*') < rEng.indexOf('\n/*'), 'Blueprint _redirects conserva Mamatila y antepone /t/* a wildcard');
}

const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const req = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); });
  req.on('error', rej); req.end();
});

class Cdp {
  constructor(ws) {
    this.ws = new WebSocket(ws); this.id = 1; this.p = new Map(); this.errors = [];
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const x = this.p.get(m.id); this.p.delete(m.id); m.error ? x.rej(new Error(m.error.message)) : x.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params.exceptionDetails.text);
      else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !(m.params.entry.url || '').includes('favicon')) this.errors.push(m.params.entry.text);
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result?.value; }
  close() { this.ws.close(); }
}

async function openTab(q, w = 1280, h = 900) {
  const t = await reqJson(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE + q)}`, 'PUT');
  const cdp = new Cdp(t.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
  for (let i = 0; i < 40; i++) { if ((await cdp.evalJs('document.readyState').catch(() => '')) === 'complete') break; await wait(120); }
  await wait(450); return cdp;
}

async function runCdp() {
  console.log('\n=== 2. CIRCUITO E2E POST-RESERVA CDP (SHOWROOM -> ADMIN -> PORTAL -> PLANTILLAS WA) ===');
  const tmp = path.resolve('.tmp-cdp-073'); fs.mkdirSync(tmp, { recursive: true });
  const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${tmp}`], { stdio: 'ignore' });
  let ready = false;
  for (let i = 0; i < 25; i++) { try { await reqJson(`http://127.0.0.1:${PORT}/json/version`); ready = true; break; } catch (_) { await wait(200); } }
  if (!ready) { chrome.kill('SIGKILL'); ok(false, 'Chrome CDP no respondió'); return; }

  try {
    // A. Plantillas WA 1A/1B/2 + botones homologados en L1/L2/L3
    for (const [lvl, url, cfgClick] of [['L1', '/admin_l1.html?slug=demo-peluqueria', "document.getElementById('main-view-btn-configuracion')?.click();"], ['L2', '/admin_l2.html', "document.getElementById('main-view-btn-config')?.click(); await wait(80); document.getElementById('tab-btn-wa')?.click();"], ['L3', '/admin_l3.html', "document.querySelector('[data-tab=\"system\"]')?.click();"]]) {
      const cdp = await openTab(url, 1280, 900);
      await cdp.evalJs('localStorage.clear(); sessionStorage.clear(); location.reload();').catch(() => null); await wait(550);
      const r = await cdp.evalJs(`(async () => {
        const wait = (ms=180) => new Promise(r => setTimeout(r, ms));
        for (const d of ['4','2','4','2']) document.querySelector('[data-pin-digit="' + d + '"]')?.click();
        await wait(250);
        const ticketLinks = [...document.querySelectorAll('a[href*="gestion_turno.html"]')].filter(a => a.innerText.includes('Ver Ticket Online')).length;
        const waLinks = [...document.querySelectorAll('a[href^="https://wa.me/"]')].filter(a => a.innerText.includes('Enviar WhatsApp') && decodeURIComponent(a.href).includes('tucured.ar/t/')).length;
        ${cfgClick}
        await wait(220);
        const prev1a = document.getElementById('cfg-preview-1a')?.textContent || '';
        document.querySelector('[data-watab="1b"]')?.click(); await wait(80);
        const prev1b = document.getElementById('cfg-preview-1b')?.textContent || '';
        document.querySelector('[data-watab="2"]')?.click(); await wait(80);
        const prev2 = document.getElementById('cfg-preview-2')?.textContent || '';
        return { ticketLinks, waLinks, prev1a, prev1b, prev2 };
      })()`);
      ok(r.ticketLinks > 0 && r.waLinks > 0, `${lvl} Agenda homologa botones Ver Ticket Online (${r.ticketLinks}) + Enviar WhatsApp (${r.waLinks})`);
      const expAlias = lvl === 'L1' ? 'peluqueria.central.mp' : 'tucured.estudio.mp';
      const natRx = /(domingo|lunes|martes|miércoles|jueves|viernes|sábado)\s\d{2}\/\d{2}/i;
      const emojiRx = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
      ok(r.prev1a.includes('0000003100012345678901') && r.prev1a.includes(expAlias) && natRx.test(r.prev1a) && !r.prev1a.includes('el Mañana') && r.prev1a.includes('tucured.ar/t/') && !r.prev1a.includes('{{') && !emojiRx.test(r.prev1a + r.prev1b + r.prev2), `${lvl} Plantilla 1A CBU/Alias/fecha natural y 1A/1B/2 sin {{}} ni emojis`);
      ok(cdp.errors.length === 0, `${lvl} 0 errores de consola`);
      cdp.close();
    }

    // B. Showroom L3 Reserva -> Preview Admin -> Portal -> Admin badge + cancel + restore
    const cdp = await openTab('/', 1280, 900);
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear(); location.reload();').catch(() => null); await wait(650);
    const step4 = await cdp.evalJs(`(async () => {
      const wait = (ms=180) => new Promise(r => setTimeout(r, ms));
      window.ShowcaseCore.selectLevel('l3'); window.ShowcaseCore.selectRubro('estetica'); await wait(120);
      window.ShowcaseCore.nextStep(); await wait(120);
      window.ShowcaseCore.nextStep(); await wait(120);
      window.ShowcaseCore.confirmBooking(); await wait(200);
      const st = window.ShowcaseCore.getState(), code = st.lastBookingCode;
      const tkHref = document.querySelector('a[href*="gestion_turno.html"]')?.getAttribute('href') || '';
      const waHref = decodeURIComponent(document.querySelector('a[href^="https://wa.me/5493815551234"]')?.getAttribute('href') || '');
      window.ShowcaseCore.setViewMode('admin'); await wait(850);
      const doc = document.getElementById('showcase-admin-frame')?.contentDocument;
      for (const d of ['4','2','4','2']) doc?.querySelector('[data-pin-digit="' + d + '"]')?.click();
      await wait(300);
      const adminTxt = doc?.body?.innerText || '';
      return { code, date: st.lastBookingRecord?.date || '', tkHref, waHref, inAdmin: Boolean(code && adminTxt.includes(st.clientFirstName) && doc?.querySelector('a[href*="' + code + '"]')) };
    })()`);
    ok(step4.code && step4.tkHref.includes(step4.code), `Showroom L3 genera código persistente #${step4.code} y link al portal`);
    ok(step4.waHref.includes('0000003100012345678901') && step4.waHref.includes(`tucured.ar/t/${step4.code}`) && !step4.waHref.includes('{{'), 'Showroom Paso 4 botón Copia WhatsApp interpola CBU + link /t/:token');
    ok(step4.inAdmin, `Reserva #${step4.code} aparece al instante al conmutar a Panel de Dueño`);
    cdp.close();

    // C. Portal Ticket Unificado: copiar CBU, Confirmar Asistencia -> Reflejo Admin -> Cancelar -> Reabrir
    const portal = await openTab(`/gestion_turno.html?token=${step4.code}`, 410, 860);
    const pRes = await portal.evalJs(`(async () => {
      const wait = (ms=160) => new Promise(r => setTimeout(r, ms));
      const initTxt = document.body.innerText;
      document.getElementById('btn-copy-cbu')?.click(); await wait(80);
      document.getElementById('btn-confirm-attendance')?.click(); await wait(160);
      const afterConf = document.body.innerText;
      document.getElementById('btn-ask-cancel')?.click(); await wait(100);
      const cancelInline = Boolean(document.getElementById('btn-confirm-cancel'));
      return { hasCbu: initTxt.includes('0000003100012345678901'), hasBack: Boolean(document.querySelector('a[href="/#showroom"]')), confirmed: afterConf.includes('Asistencia confirmada'), cancelInline };
    })()`);
    ok(pRes.hasCbu && pRes.hasBack && pRes.confirmed && pRes.cancelInline, 'Portal Warm Studio muestra CBU, Volver al Turnero, confirma asistencia y abre confirmación inline de cancelación');
    ok(portal.errors.length === 0, 'Portal 0 errores consola');
    portal.close();

    const qAdm = `/admin_l3.html?rubro=peluqueria_estetica${step4.date ? '&date=' + step4.date : ''}`;
    const admA = await openTab(qAdm, 1280, 900);
    const seenBadge = await admA.evalJs(`(async () => { const w=(m=150)=>new Promise(r=>setTimeout(r,m)); for(const d of ['4','2','4','2']) document.querySelector('[data-pin-digit="'+d+'"]')?.click(); await w(220); return document.body.innerText.includes('Asistencia confirmada por cliente'); })()`);
    ok(seenBadge, 'Admin L3 muestra badge "Asistencia confirmada por cliente" sincronizado desde el Portal');
    admA.close();

    const p2 = await openTab(`/gestion_turno.html?token=${step4.code}`, 410, 860);
    await p2.evalJs(`(async () => { const w=(m=140)=>new Promise(r=>setTimeout(r,m)); document.getElementById('btn-ask-cancel')?.click(); await w(100); document.getElementById('btn-confirm-cancel')?.click(); await w(150); })()`);
    p2.close();

    const admB = await openTab(qAdm, 1280, 900);
    const afterCancel = await admB.evalJs(`(async () => {
      const w=(m=180)=>new Promise(r=>setTimeout(r,m));
      for(const d of ['4','2','4','2']) document.querySelector('[data-pin-digit="'+d+'"]')?.click(); await w(220);
      const isCancelled = document.body.innerText.includes('Cancelado');
      const reabrir = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Reabrir turno'));
      reabrir?.click(); await w(180);
      return { isCancelled, hadReabrir: Boolean(reabrir), reopened: document.body.innerText.includes('Pendiente Seña') };
    })()`);
    ok(afterCancel.isCancelled && afterCancel.hadReabrir && afterCancel.reopened, 'Cancelación desde Portal refleja Cancelado en Admin y botón Reabrir turno lo restaura');
    admB.close();
  } finally {
    chrome.kill('SIGKILL'); await wait(300);
    try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 4, retryDelay: 120 }); } catch (_) {}
  }
}

(async () => {
  runStatic(); await runCdp();
  console.log(`\n=== RESUMEN TASK-073 POST-RESERVA E2E: ${pass} PASSED / ${fail} FAILED ===`);
  process.exit(fail > 0 ? 1 : 0);
})();
