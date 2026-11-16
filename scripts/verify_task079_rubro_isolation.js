// Archivo: scripts/verify_task079_rubro_isolation.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5180, PORT_CDP = 9241, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const TOUCHED = [
  'public/js/admin_shared/admin_demo_seed.js', 'public/js/admin_shared/turnero_catalog.js',
  'public/js/admin_shared/ticket_portal.js', 'public/js/admin_shared/ticket_modal.js',
  'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l1/admin_l1_pricing.js', 'public/js/admin_l1/admin_l1_agenda.js',
  'public/js/admin_l2/admin_l2_core.js', 'public/js/admin_l2/admin_l2_services.js', 'public/js/admin_l2/admin_l2_calendar.js',
  'public/js/admin_l3/admin_core.js', 'public/js/admin_l3/view_agenda.js',
  'js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_booking_sync.js', 'js/showcase_v11/showcase_admin_preview.js'
];

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA TASK-079 (<=180L, AST, SHA-256) ===');
  for (const h of ['dist/index.html', 'dist/admin_l1.html', 'dist/admin_l2.html', 'dist/admin_l3.html', 'dist/turnero.html', 'dist/gestion_turno.html']) {
    ok(fs.existsSync(h), `Build presente: ${h}`);
  }
  for (const rel of TOUCHED) {
    const src = path.resolve(rel), eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/).length;
    ok(lines <= 180 && /Archivo:/i.test(txt.split(/\r?\n/)[0]), `${rel} (${lines}L <= 180L, header OK)`);
    ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    if (rel.startsWith('public/')) ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo ni emojis UI: ${rel}`);
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
  async goto(u) {
    await this.send('Page.navigate', { url: BASE + u });
    for (let i = 0; i < 40; i++) { await wait(100); const st = await this.evalJs('({ r: document.readyState, h: location.href })').catch(() => null); if (st && st.h.startsWith(BASE) && st.r === 'complete') break; }
    await wait(320);
  }
  close() { this.ws.close(); }
}

async function openTab(w = 375, h = 667) {
  const t = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
  const cdp = new Cdp(t.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
  return cdp;
}

const RUBRO_EXPECT = [
  ['barberia', 'Corte Clásico', false],
  ['resto', 'Reserva Mesa 2 Personas', true],
  ['estetica', 'Limpieza Facial Profunda', true],
  ['deportes', 'Alquiler Cancha Pádel Cristal', true],
  ['salud', 'Consulta Clínica General', true]
];

async function main() {
  runStatic();
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  const preview = spawn('node', [viteBin, 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-079'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });

  try {
    let up = false;
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); up = true; break; } catch { await wait(200); } }
    if (!up) throw new Error('CDP no inició');

    const cdp = await openTab(375, 667);
    await cdp.goto('/index.html');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem("tucured_pin_ok_L1","1"); sessionStorage.setItem("tucured_pin_ok_L2","1");');

    console.log('\n=== 2. SHOWROOM MISMA SESIÓN (SIN CLEAR) L1/L2/L3 x 5 RUBROS ===');
    for (const lvl of ['l1', 'l2', 'l3']) {
      for (const [r, expectSrv, forbidBarber] of RUBRO_EXPECT) {
        const res = await cdp.evalJs(`(() => { window.ShowcaseCore.selectLevel('${lvl}'); window.ShowcaseCore.selectRubro('${r}'); const btns = [...document.querySelectorAll('#mockup-container button[onclick*="selectOption"]')].map(b => b.innerText); return { txt: btns.join(' | '), hasExp: btns.some(t => t.includes('${expectSrv}')), hasBarber: btns.some(t => t.includes('Corte Clásico') || t.includes('Barba Toalla Caliente')) }; })()`);
        ok(res.hasExp && (!forbidBarber || !res.hasBarber), `Showroom ${lvl.toUpperCase()} -> ${r}: contiene '${expectSrv}'${forbidBarber ? ' y cero fuga Peluquería' : ''}`);
      }
    }

    console.log('\n=== 3. CONSOLAS ADMIN L1/L2/L3 SECUENCIAL (SIN CLEAR) ===');
    for (const [url, tabBtn, biz, srv, forbidBarber] of [
      ['/admin_l1.html?rubro=peluqueria', 'main-view-btn-catalogo', 'Peluquería & Barbería Central', 'Corte Clásico', false],
      ['/admin_l1.html?rubro=gastronomia', 'main-view-btn-catalogo', 'Bistró & Parrilla El Encuentro', 'Reserva Mesa 2 Personas', true],
      ['/admin_l1.html?rubro=deportes', 'main-view-btn-catalogo', 'Complejo Deportivo & Pádel Norte', 'Alquiler Cancha Pádel Cristal', true],
      ['/admin_l2.html?rubro=peluqueria', 'main-view-btn-catalogo', 'Peluquería & Barbería Central', 'Corte Clásico', false],
      ['/admin_l2.html?rubro=deportes', 'main-view-btn-catalogo', 'Complejo Deportivo & Pádel Norte', 'Alquiler Cancha Pádel Cristal', true],
      ['/admin_l3.html?rubro=deportes_clubes', null, 'Complejo Deportivo & Pádel Norte', 'Alquiler Cancha Pádel Cristal', true]
    ]) {
      await cdp.goto(url);
      if (tabBtn) await cdp.evalJs(`document.getElementById('${tabBtn}')?.click();`);
      await wait(160);
      const st = await cdp.evalJs('({ t: document.body.innerText, ov: document.documentElement.scrollWidth > 375 })');
      ok(st.t.includes(biz) && st.t.includes(srv) && (!forbidBarber || (!st.t.includes('Corte Clásico') && !st.t.includes('Barba Toalla Caliente'))) && !st.ov, `${url} -> '${biz}' + '${srv}', 375px OK${forbidBarber ? ', cero contaminación' : ''}`);
    }

    console.log('\n=== 4. TURNERO AUTÓNOMO & TICKET EN MISMA SESIÓN (SIN CLEAR) ===');
    for (const [lvl, r, expSrv, client] of [
      ['l1', 'gastronomia', 'Reserva Mesa 2 Personas', 'Cliente Gastro L1'],
      ['l2', 'deportes', 'Alquiler Cancha Pádel Cristal', 'Cliente Padel L2']
    ]) {
      await cdp.goto(`/turnero.html?level=${lvl}&rubro=${r}`);
      const tRes = await cdp.evalJs(`(async () => {
        const w = (ms=120) => new Promise(r => setTimeout(r, ms));
        const txt1 = document.body.innerText;
        document.querySelector('[data-srv-id]')?.click(); await w();
        document.getElementById('btn-step1-next')?.click(); await w();
        document.getElementById('btn-step2-next')?.click(); await w();
        document.getElementById('inp-client-name').value = '${client}';
        document.getElementById('inp-client-phone').value = '3815557900';
        document.getElementById('btn-confirm-booking')?.click(); await w(180);
        const m = document.body.innerText.match(/TK-[A-Z0-9]{4}/);
        return { hasSrv: txt1.includes('${expSrv}'), noBarber: !txt1.includes('Corte Clásico'), code: m ? m[0] : '', ov: document.documentElement.scrollWidth > 375 };
      })()`);
      await cdp.goto(`/gestion_turno.html?token=${tRes.code}`);
      const pOk = await cdp.evalJs(`document.body.innerText.includes('${client}') && document.body.innerText.includes('${expSrv}')`);
      ok(tRes.hasSrv && tRes.noBarber && /^TK-/.test(tRes.code) && pOk && !tRes.ov, `Turnero ${lvl.toUpperCase()} (${r}) -> '${expSrv}' aislado + ticket ${tRes.code} resuelto`);
    }

    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >= 400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESUMEN [TASK-079]: PASS=${pass} | FAIL=${fail}`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
