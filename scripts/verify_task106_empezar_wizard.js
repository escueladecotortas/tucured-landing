// Archivo: scripts/verify_task106_empezar_wizard.js
// Compuerta QA + E2E [TASK-106]: /empezar.html, Preview Vivo, Akismet FormData, Centinela y /api/wa-welcome

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4206, PORT_CDP = 9261, BASE = `http://127.0.0.1:${PORT_APP}`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const FILES = [
  ['public/empezar-ok.html', 30], ['public/empezar.html', 120],
  ['public/js/empezar/empezar_state.js', 190], ['public/js/empezar/empezar_media.js', 190],
  ['public/js/empezar/empezar_preview.js', 190], ['public/js/empezar/empezar_steps.js', 190],
  ['public/js/empezar/empezar_submit.js', 190], ['public/js/empezar/empezar_app.js', 190],
  ['scripts/verify_task106_empezar_wizard.js', 190]
];
let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));
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
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-106]: <200L, AST, CERO EMOJIS/font-mono & NETLIFY FORMS ===');
  for (const [rel, maxL] of FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < maxL && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < ${maxL}L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!EMOJI_RX.test(txt) && !txt.includes('font-mono'), `Limpio (0 emojis, 0 font-mono): ${rel}`);
  }
  const distOk = fs.readFileSync(path.resolve('dist/empezar-ok.html'), 'utf8');
  const distEmp = fs.readFileSync(path.resolve('dist/empezar.html'), 'utf8');
  ok(distOk.includes('NETLIFY_FORM_ACCEPTED'), 'dist/empezar-ok.html incluye marcador NETLIFY_FORM_ACCEPTED');
  const fields = ['name="alta-empezar-tucured"', 'name="name"', 'name="comercio"', 'name="slug"', 'name="rubro"', 'name="bajada"', 'name="accent"', 'name="plan"', 'name="localidad"', 'name="direccion"', 'name="direccion_lat"', 'name="direccion_lng"', 'name="horario_modalidad"', 'name="horario_resumen"', 'name="titular_nombre"', 'name="titular_apellido"', 'name="whatsapp"', 'name="email"', 'name="instagram"', 'name="logo_file"', 'name="cover_file"'];
  ok(fields.every(f => distEmp.includes(f)), 'dist/empezar.html declara los 20 campos de alta-empezar-tucured');
}

async function runDesktop(cdp) {
  console.log('\n=== 2. E2E DESKTOP 1280x800 (PRESELECCIÓN URL + REACTIVIDAD + AKISMET + CENTINELA + WA) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/empezar.html?plan=L2&rubro=estetica');
  for (let t = 0; t < 35; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('emp-comercio') && document.getElementById('preview-cta-btn') && getComputedStyle(document.getElementById('empezar-live-preview')).display !== 'none')`)) break; await wait(120); }

  const init = await cdp.evalJs(`(() => {
    const f = document.getElementById('empezar-step-mount').getBoundingClientRect(), p = document.getElementById('empezar-live-preview').getBoundingClientRect();
    const st = window.TucuEmpezarApp.getState(), cta = document.getElementById('preview-cta-btn');
    return { splitOk: f.width > 400 && p.width > 250 && p.left >= f.right, plan: st.plan, rubro: st.rubro, accent: cta?.dataset?.accent, bg: getComputedStyle(cta).backgroundColor, serif: getComputedStyle(document.getElementById('preview-biz-name')).fontFamily, ov: document.documentElement.scrollWidth > window.innerWidth };
  })()`);
  ok(init.splitOk && init.plan === 'l2' && init.rubro === 'estetica' && init.accent === '#8C6D46' && init.bg === 'rgb(140, 109, 70)' && init.serif.includes('Playfair') && !init.ov,
    'Desktop 1280x800: Split visible, ?plan=L2&rubro=estetica reflejado (#8C6D46 + Playfair) y 0 overflow');

  const flow = await cdp.evalJs(`(async () => {
    const w = (ms=80) => new Promise(r => setTimeout(r, ms));
    document.getElementById('btn-emp-next').click();
    const errEmpty = document.getElementById('emp-error')?.innerText || '';
    const inp = document.getElementById('emp-comercio'); inp.value = 'Barbería Don Julio'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('[data-emp-rubro="peluqueria"]').click(); await w();
    document.querySelector('[data-emp-accent="deportes"]').click(); await w();
    const liveOk = document.getElementById('preview-biz-name')?.innerText === 'Barbería Don Julio' && document.getElementById('preview-cta-btn')?.dataset?.accent === '#15803D' && document.getElementById('preview-domain-pill')?.innerText.includes('barberia-don-julio.tucured.com.ar');

    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#15803D'; ctx.fillRect(0, 0, 64, 64);
    const pngBlob = await new Promise(r => c.toBlob(r, 'image/png'));
    const dt = new DataTransfer(); dt.items.add(new File([pngBlob], 'logo.png', { type: 'image/png' }));
    const lInp = document.getElementById('emp-logo-input'); lInp.files = dt.files; lInp.dispatchEvent(new Event('change', { bubbles: true }));
    for (let i = 0; i < 25; i++) { if (window.TucuEmpezarMedia.getSlot('logo').file) break; await w(60); }

    document.getElementById('btn-emp-next').click(); await w();
    const slugTxt = document.getElementById('emp-slug')?.value;
    document.getElementById('btn-emp-next').click(); await w();
    document.getElementById('btn-emp-next').click();
    const errStep3 = document.getElementById('emp-error')?.innerText || '';

    const setVal = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); };
    setVal('emp-direccion', '25 de Mayo 480'); setVal('emp-first', 'Julio'); setVal('emp-last', 'Sosa'); setVal('emp-whatsapp', '3815554321'); setVal('emp-email', 'julio@donjulio.com');
    document.getElementById('btn-emp-next').click(); await w();

    window.__calls = []; window.__waCalls = [];
    window.fetch = async (url, opts = {}) => {
      if (String(url).includes('/empezar-ok.html')) {
        window.__calls.push({ url, method: opts.method, keys: [...opts.body.keys()], nameVal: opts.body.get('name'), formName: opts.body.get('form-name'), hasBot: opts.body.has('bot-field'), logoType: opts.body.get('logo_file')?.type });
        if (window.__calls.length === 1) return new Response('<html>SPA sin centinela</html>', { status: 200 });
        return new Response('<!-- NETLIFY_FORM_ACCEPTED -->', { status: 200 });
      }
      if (String(url).includes('/api/wa-welcome')) {
        window.__waCalls.push({ url, method: opts.method, keepalive: opts.keepalive, body: JSON.parse(opts.body) });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
      return new Response('{}', { status: 200 });
    };

    document.getElementById('btn-empezar-submit').click(); await w(120);
    const fake200Blocked = Boolean(document.getElementById('emp-error')?.innerText) && !document.getElementById('emp-success-view') && window.__waCalls.length === 0;

    document.getElementById('btn-empezar-submit').click(); await w(150);
    const c1 = window.__calls[1], wa = window.__waCalls[0];
    return { errEmpty, liveOk, slugTxt, errStep3, fake200Blocked, c1, wa, succ: Boolean(document.getElementById('emp-success-view')), domain: document.getElementById('emp-success-domain')?.innerText };
  })()`);

  ok(Boolean(flow.errEmpty) && Boolean(flow.errStep3), 'Validación inline bloquea pasos 1 y 3 con campos obligatorios vacíos');
  ok(flow.liveOk && flow.slugTxt === 'barberia-don-julio', 'Reactividad en vivo: título Playfair, color #15803D y slug barberia-don-julio');
  ok(flow.fake200Blocked, 'Anti falso-200: HTTP 200 sin NETLIFY_FORM_ACCEPTED muestra error y bloquea éxito/WA');
  ok(flow.c1?.keys[0] === 'form-name' && flow.c1.formName === 'alta-empezar-tucured' && flow.c1.keys[1] === 'name' && flow.c1.nameVal === 'Barbería Don Julio — Julio Sosa' && !flow.c1.hasBot && flow.c1.logoType === 'image/webp',
    'FormData Akismet-safe: form-name[0], name[1], sin bot-field vacío y logo WebP adjunto');
  ok(flow.succ && flow.domain === 'https://barberia-don-julio.tucured.com.ar' && flow.wa?.keepalive === true && flow.wa?.body?.nombre === 'Barbería Don Julio' && flow.wa?.body?.whatsapp === '3815554321' && flow.wa?.body?.activarUrl?.startsWith('https://tucured.ar/activar.html'),
    'Éxito tras centinela + POST /api/wa-welcome (keepalive: true) con contrato exacto de wa-welcome.js');
}

async function runMobile(cdp) {
  console.log('\n=== 3. E2E MÓVIL 375x667 (DRAWER PREVIEW + 0 OVERFLOW) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/empezar.html?plan=L3&rubro=salud');
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-open-mobile-preview'))`)) break; await wait(120); }
  const mob = await cdp.evalJs(`(async () => {
    const w = (ms=80) => new Promise(r => setTimeout(r, ms));
    const ov1 = document.documentElement.scrollWidth > window.innerWidth;
    document.getElementById('btn-open-mobile-preview').click(); await w();
    const openOk = !document.getElementById('empezar-preview-drawer').classList.contains('hidden') && Boolean(document.querySelector('#empezar-mobile-preview-mount #preview-cta-btn'));
    const ov2 = document.documentElement.scrollWidth > window.innerWidth;
    document.getElementById('btn-close-mobile-preview').click(); await w();
    const closedOk = document.getElementById('empezar-preview-drawer').classList.contains('hidden');
    return { ov1, ov2, openOk, closedOk };
  })()`);
  ok(mob.openOk && mob.closedOk && !mob.ov1 && !mob.ov2, 'Móvil 375x667: drawer de vista previa abre/cierra limpio y 0 overflow');
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-106'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await runDesktop(cdp); await runMobile(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-106]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });