// Archivo: scripts/verify_task075_autonomous_booking_catalog.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5175, PORT_CDP = 9237, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const TOUCHED = [
  'public/turnero.html', 'public/admin_l1.html', 'public/admin_l2.html', 'public/admin_l3.html',
  'public/js/admin_shared/admin_shell.js', 'public/js/admin_shared/turnero_catalog.js',
  'public/js/admin_shared/turnero_app.js', 'public/js/admin_l1/admin_l1_pricing.js',
  'public/js/admin_l1/admin_l1_core.js', 'public/js/admin_l2/admin_l2_core.js',
  'public/js/admin_l2/admin_l2_services.js', 'public/js/admin_l3/admin_core.js',
  'js/showcase_v11/showcase_state.js', 'js/showcase_v11/showcase_templates_l1.js', 'js/showcase_v11/showcase_templates_l2.js'
];
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, AST, <200L Y PARIDAD SHA-256 ===');
  ok(fs.existsSync('dist/turnero.html'), 'Build dist/turnero.html generado');
  const html = fs.readFileSync('dist/turnero.html', 'utf8');
  const missing = [...html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)].map(m => m[1]).filter(r => r !== '/t/' && !fs.existsSync(path.resolve('dist', r.slice(1))));
  ok(missing.length === 0, 'dist/turnero.html sin enlaces rotos');
  for (const rel of TOUCHED) {
    const src = path.resolve(rel);
    const eng = rel.startsWith('public/') ? path.join(ENGINE, rel) : path.join(ENGINE, 'public', rel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/).length;
    ok(lines <= 180 && /Archivo:/i.test(txt.split(/\r?\n/)[0]), `${rel} (${lines}L <= 180L, header OK)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
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
      else if (m.method === 'Network.responseReceived' && m.params.response.url.startsWith(BASE) && m.params.response.status >= 400 && !m.params.response.url.includes('favicon')) {
        this.httpFails.push(`${m.params.response.status} ${m.params.response.url}`);
      }
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); await this.send('Network.enable'); await this.send('Page.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result?.value; }
  async goto(u) {
    await this.send('Page.navigate', { url: BASE + u });
    for (let i = 0; i < 40; i++) {
      await wait(110);
      const st = await this.evalJs('({ r: document.readyState, h: location.href })').catch(() => null);
      if (st && st.h.startsWith(BASE) && st.r === 'complete') break;
    }
    await wait(350);
  }
  close() { this.ws.close(); }
}

async function openTab(w = 375, h = 667) {
  const t = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
  const cdp = new Cdp(t.webSocketDebuggerUrl); await cdp.connect();
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
  return cdp;
}

async function main() {
  runStatic();
  const viteBin = path.resolve('node_modules/vite/bin/vite.js');
  const preview = spawn('node', [viteBin, 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-075'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });

  try {
    let up = false;
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const req = http.get(BASE + '/', res => { res.resume(); r(); }); req.on('error', j); }); break; } catch { await wait(200); } }
    for (let i = 0; i < 30; i++) { try { await reqJson(`http://127.0.0.1:${PORT_CDP}/json/version`); up = true; break; } catch { await wait(200); } }
    if (!up) throw new Error('CDP no inició');

    console.log('\n=== 2. ENLACE "VER TURNERO DEL CLIENTE" & SINCRONIZACIÓN LIVE /admin ===');
    const cdp = await openTab(375, 667);
    await cdp.goto('/admin_l1.html');
    await cdp.evalJs('localStorage.clear(); sessionStorage.clear();');
    const adminChecks = [];
    for (const [lvl, page, key, href] of [
      ['l1', '/admin_l1.html', 'tucu_l1_services', '/turnero.html?level=l1&slug=demo-peluqueria&rubro=peluqueria'],
      ['l2', '/admin_l2.html', 'tucu_l2_services', '/turnero.html?level=l2&slug=demo-central&rubro=estetica'],
      ['l3', '/admin_l3.html', 'tucu_l3_services_barberia', '/turnero.html?level=l3&slug=demo-staff&rubro=peluqueria']
    ]) {
      await cdp.evalJs(`sessionStorage.setItem('tucured_pin_ok_${lvl.toUpperCase()}', '1');`);
      await cdp.goto(page);
      const noLink = await cdp.evalJs(`!document.getElementById('btn-view-client-turnero')`);
      ok(noLink, `${page} -> sidebar sin #btn-view-client-turnero (TASK-078)`);

      const customName = `Servicio VIP ${lvl.toUpperCase()}`, pausedName = `Servicio Pausado ${lvl.toUpperCase()}`;
      await cdp.evalJs(`localStorage.setItem('${key}', JSON.stringify([{ id: 'vip_${lvl}', name: '${customName}', duration: 50, price: 29000, desc: 'Prueba viva', isActive: true, activo: true }, { id: 'off_${lvl}', name: '${pausedName}', duration: 30, price: 15000, isActive: false, activo: false }, { id: 'del_${lvl}', name: 'Servicio Borrado', duration: 20, price: 9000, isActive: true, deletedAt: '2026-01-01' }]))`);
      await cdp.goto(href);
      const st1 = await cdp.evalJs('({ t: document.body.innerText, ov: document.documentElement.scrollWidth > 375 })');
      ok(st1.t.includes(customName) && !st1.t.includes(pausedName) && !st1.t.includes('Servicio Borrado') && !st1.ov, `Sync vivo ${lvl.toUpperCase()} -> muestra '${customName}', oculta pausado/borrado, 375px sin overflow`);

      const bk = await cdp.evalJs(`(async () => {
        const w = (ms=120) => new Promise(r => setTimeout(r, ms));
        document.querySelector('[data-srv-id]')?.click(); await w();
        document.getElementById('btn-step1-next')?.click(); await w();
        const s2 = document.body.innerText.includes('Fecha y Horario');
        document.getElementById('btn-step2-next')?.click(); await w();
        const s3 = !!document.getElementById('inp-client-name');
        document.getElementById('inp-client-name').value = 'Paciente Test ${lvl.toUpperCase()}';
        document.getElementById('inp-client-phone').value = '3815559900';
        document.getElementById('btn-confirm-booking')?.click(); await w(180);
        const txt4 = document.body.innerText, m = txt4.match(/TK-[A-Z0-9]{4}/);
        const portal = document.getElementById('btn-open-ticket')?.getAttribute('href') || '';
        const k = '${lvl}' === 'l1' ? 'tucu_l1_bookings_demo-peluqueria' : 'tucu_${lvl}_bookings';
        const saved = (JSON.parse(localStorage.getItem(k) || '[]')).find(x => x.id === (m ? m[0] : ''));
        return { s2, s3, dateIso: saved?.date || saved?.dateStr || '', code: m ? m[0] : '', portal, hasShort: txt4.includes('/t/TK-'), ov: document.documentElement.scrollWidth > 375 };
      })()`);
      await cdp.goto(bk.portal || `/gestion_turno.html?token=${bk.code}`);
      const pOk = await cdp.evalJs(`document.body.innerText.includes('Paciente Test ${lvl.toUpperCase()}')`);
      ok(bk.s2 && bk.s3 && /^TK-/.test(bk.code) && bk.hasShort && pOk && !bk.ov, `${lvl.toUpperCase()} Turnero 3 pasos -> /t/${bk.code} (${bk.dateIso}) resuelto en portal`);
      adminChecks.push({ lvl, page, code: bk.code, date: bk.dateIso });
    }

    for (const ac of adminChecks) {
      await cdp.goto(ac.page);
      const res = await cdp.evalJs(`(async () => {
        if ('${ac.lvl}' === 'l1') document.querySelector('[data-tfilter="semana"]')?.click();
        else { const id = '${ac.lvl}' === 'l2' ? 'cal-filter-date' : 'admin-date-picker'; const el = document.getElementById(id); if (el) { el.value = '${ac.date}'; el.dispatchEvent(new Event('change')); } }
        await new Promise(r => setTimeout(r, 200));
        return { found: document.body.innerText.includes('Paciente Test ${ac.lvl.toUpperCase()}') };
      })()`);
      ok(res.found, `${ac.page} refleja reserva autónoma 'Paciente Test ${ac.lvl.toUpperCase()}' (${ac.code})`);
    }

    console.log('\n=== 3. MATRIZ MULTI-RUBRO AUTÓNOMA (5 RUBROS X 3 NIVELES = 15) ===');
    for (const lvl of ['l1', 'l2', 'l3']) {
      for (const rubro of ['peluqueria', 'estetica', 'gastronomia', 'salud', 'servicios']) {
        await cdp.evalJs('localStorage.clear()');
        await cdp.goto(`/turnero.html?level=${lvl}&rubro=${rubro}&slug=demo-${rubro}`);
        const res = await cdp.evalJs(`({ cards: document.querySelectorAll('[data-srv-id]').length, hasStep1: document.body.innerText.includes('Elegir Servicio'), ov: document.documentElement.scrollWidth > 375 })`);
        ok(res.cards >= 2 && res.hasStep1 && !res.ov, `Turnero ${lvl.toUpperCase()} x ${rubro}: ${res.cards} servicios activos, Paso 1 OK, 375px OK`);
      }
    }

    console.log('\n=== 4. SHOWROOM LANDING (index.html) L1/L2/L3 x 5 RUBROS ===');
    await cdp.evalJs('localStorage.clear()');
    await cdp.goto('/index.html');
    for (const lvl of ['l1', 'l2', 'l3']) {
      for (const r of ['barberia', 'estetica', 'resto', 'deportes', 'salud']) {
        const sr = await cdp.evalJs(`(() => { window.ShowcaseCore.selectLevel('${lvl}'); window.ShowcaseCore.selectRubro('${r}'); return { opts: document.querySelectorAll('#mockup-container button[onclick*="selectOption"]').length }; })()`);
        ok(sr.opts >= 2, `Showroom ${lvl.toUpperCase()} x ${r}: ${sr.opts} servicios seleccionables en mockup`);
      }
    }
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, 'Consola limpia (0 JS errors, 0 HTTP >=400)');
    cdp.close();
  } finally {
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-chrome.pid); } catch {}
    try { process.platform === 'win32' ? spawnSync('taskkill', ['/PID', String(preview.pid), '/T', '/F'], { stdio: 'ignore' }) : process.kill(-preview.pid); } catch {}
    await wait(300); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESUMEN [TASK-075]: PASS=${pass} | FAIL=${fail}`);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
