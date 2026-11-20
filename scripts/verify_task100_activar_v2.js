// Archivo: scripts/verify_task100_activar_v2.js
// Compuerta QA + E2E [TASK-100]: Ficha Rápida v2, Centinela activar-ok, FormData & Anti Falso-200

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

const PORT_APP = 4200, PORT_CDP = 9255, BASE = `http://127.0.0.1:${PORT_APP}`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FILES = [
  'js/utils/whatsapp_link.js', 'public/activar.html', 'public/activar-ok.html',
  'public/js/activar/activar_data.js', 'public/js/activar/activar_geo.js', 'public/js/activar/activar_logo.js',
  'public/js/activar/activar_schedule.js', 'public/js/activar/activar_markup.js',
  'public/js/activar/activar_app.js', 'scripts/verify_task100_activar_v2.js'
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
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(650); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-100]: <200L, AST & NETLIFY FORMS ===');
  for (const rel of FILES) {
    const abs = path.resolve(rel), lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
    ok(lines.length < 200 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < 200L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
  }
  const distOkPath = path.resolve('dist/activar-ok.html');
  ok(fs.existsSync(distOkPath) && fs.readFileSync(distOkPath, 'utf8').includes('NETLIFY_FORM_ACCEPTED'), 'dist/activar-ok.html existe con marcador NETLIFY_FORM_ACCEPTED');
  const distAct = fs.readFileSync(path.resolve('dist/activar.html'), 'utf8');
  const mustHave = [
    'name="ficha-activacion-tucured"', 'action="/activar-ok.html"', 'enctype="multipart/form-data"', 'name="nombre_titular"',
    'name="apellido_titular"', 'name="email"', 'name="instagram"', 'name="direccion_referencia"', 'name="direccion_lat"',
    'name="direccion_lng"', 'type="file" name="logo_archivo"', 'name="horarios_detalle"', 'name="nombres_espacios"', 'name="profesionales_detalle"'
  ];
  const mustPurge = ['name="pin_acceso"', 'name="logo_url"', 'name="logo_nota"', 'name="titular"', 'name="dias_atencion"', 'name="modalidad_horario"', 'name="horario_manana_desde"'];
  mustHave.forEach(s => ok(distAct.includes(s), `dist/activar.html contiene ${s}`));
  mustPurge.forEach(s => ok(!distAct.includes(s), `dist/activar.html purgó ${s}`));
}

async function runViewport(cdp, vp) {
  console.log(`\n=== 2. E2E ${vp.n.toUpperCase()} ===`);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mob });

  await cdp.goto('/activar.html?comercio=Estudio%20Norte&rubro=peluqueria&plan=l2&nombre=Sof%C3%ADa&apellido=Mendoza&localidad=Yerba%20Buena&whatsapp=3815554321&email=sofia%40norte.com&horario=cortado');
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('activar-live-form'))`)) break; await wait(120); }

  const resA = await cdp.evalJs(`(async () => {
    const preUrl = document.getElementById('act-comercio').value === 'Estudio Norte'
      && document.getElementById('act-nombre-titular').value === 'Sofía' && document.getElementById('act-apellido-titular').value === 'Mendoza'
      && document.getElementById('act-email').value === 'sofia@norte.com' && document.getElementById('act-whatsapp').value === '3815554321';
    const noLegacy = !document.getElementById('act-pin') && !document.getElementById('act-logo-url') && document.getElementById('act-plan')?.type === 'hidden';
    const l2Pelu = document.getElementById('act-block5-body').innerText.includes('Sillones / Puestos') && !document.getElementById('act-cap-turno');
    document.getElementById('act-rubro').value = 'deportes'; document.getElementById('act-rubro').dispatchEvent(new Event('change'));
    const l2Dep = document.getElementById('act-block5-body').innerText.includes('Canchas / Espacios') && Boolean(document.getElementById('act-cap-turno'));
    document.getElementById('act-rubro').value = 'peluqueria'; document.getElementById('act-rubro').dispatchEvent(new Event('change'));

    const mon = document.querySelector('.act-day-row[data-day-key="Lun"]');
    mon.querySelector('.act-m-from').value = '08:30'; mon.querySelector('.act-m-to').value = '12:30';
    document.getElementById('btn-copy-mon-fri').click();
    const sab = document.querySelector('.act-day-row[data-day-key="Sáb"]');
    sab.querySelector('.act-day-mode').value = 'corrido'; sab.querySelector('.act-day-mode').dispatchEvent(new Event('change'));
    sab.querySelector('.act-m-from').value = '09:00'; sab.querySelector('.act-m-to').value = '14:00';
    const schedOk = window.TucuActivarSchedule.serializeSchedule().text.includes('Mar: 08:30-12:30 y 17:00-21:00')
      && window.TucuActivarSchedule.serializeSchedule().text.includes('Sáb: 09:00-14:00');

    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const ctx = c.getContext('2d'); ctx.fillStyle = '#EA580C'; ctx.fillRect(0, 0, 64, 64);
    const pngBlob = await new Promise(r => c.toBlob(r, 'image/png'));
    const dt = new DataTransfer(); dt.items.add(new File([pngBlob], 'test.png', { type: 'image/png' }));
    const logoInp = document.getElementById('act-logo-input'); logoInp.files = dt.files; logoInp.dispatchEvent(new Event('change'));
    for (let i = 0; i < 20; i++) { if (window.TucuActivarLogo.getLogoFile()) break; await new Promise(r => setTimeout(r, 80)); }
    const lf = window.TucuActivarLogo.getLogoFile();
    const webpOk = Boolean(lf && lf.type === 'image/webp' && lf.name === 'logo-comercio.webp');

    document.getElementById('act-sena-mode').value = 'sin_sena'; document.getElementById('act-sena-mode').dispatchEvent(new Event('change'));
    const noSenaHide = document.getElementById('act-sena-fields-wrap').classList.contains('hidden');
    document.getElementById('act-direccion').value = 'Laprida 310';
    document.getElementById('act-dir-lat').value = '-26.8241'; document.getElementById('act-dir-lng').value = '-65.2226';
    document.querySelector('.act-srv-name').value = 'Corte Clásico'; document.querySelector('.act-srv-price').value = '12000';
    const overflow = document.documentElement.scrollWidth > window.innerWidth;

    // Test rechazo ante falso 200 sin marcador NETLIFY_FORM_ACCEPTED
    const origFetch = window.fetch;
    window.__forceRemoteActivar = true;
    window.fetch = async () => new Response('<html><body>SPA genérico sin centinela</body></html>', { status: 200 });
    document.getElementById('btn-activar-submit').click();
    await new Promise(r => setTimeout(r, 150));
    const false200Rejected = !document.getElementById('activar-error').classList.contains('hidden')
      && document.getElementById('activar-success-root').classList.contains('hidden')
      && !document.getElementById('activar-form-root').classList.contains('hidden');

    // Test aceptación real con marcador NETLIFY_FORM_ACCEPTED + orden estricto FormData
    window.fetch = async () => new Response('<!-- NETLIFY_FORM_ACCEPTED -->', { status: 200 });
    document.getElementById('btn-activar-submit').click();
    await new Promise(r => setTimeout(r, 150));
    window.fetch = origFetch; window.__forceRemoteActivar = false;
    const fd = window.__lastActivarFormData;
    const keys = fd ? [...fd.keys()] : [];
    const orderOk = keys[0] === 'form-name' && fd.get('form-name') === 'ficha-activacion-tucured'
      && keys[1] === 'bot-field' && fd.get('bot-field') === '' && keys[keys.length - 1] === 'logo_archivo'
      && fd.get('logo_archivo')?.type === 'image/webp';
    const succVis = !document.getElementById('activar-success-root').classList.contains('hidden');
    return { preUrl, noLegacy, l2Pelu, l2Dep, schedOk, webpOk, noSenaHide, overflow, false200Rejected, orderOk, succVis };
  })()`);

  ok(resA.preUrl && resA.noLegacy && resA.l2Pelu && resA.l2Dep, `${vp.n}: Prefill URL + sin legacy + Bloque 5 L2 dinámico`);
  ok(resA.schedOk && resA.webpOk && resA.noSenaHide && !resA.overflow, `${vp.n}: 7 días + WebP + sin_sena + 0 overflow`);
  ok(resA.false200Rejected, `${vp.n}: Anti Falso-200 bloquea éxito si falta NETLIFY_FORM_ACCEPTED`);
  ok(resA.orderOk && resA.succVis, `${vp.n}: Orden estricto FormData (form-name[0], bot-field[1], logo_archivo[last]) + éxito con centinela`);

  await cdp.evalJs(`localStorage.setItem('local_db_wizard', JSON.stringify({ nombre: 'Resto Norte', nombreTitular: 'Juan', apellidoTitular: 'Pérez', email: 'juan@resto.com', whatsapp: '3814445566', ciudad: 'Tafí Viejo', rubro: 'peluqueria', level: 'l1', horario: 'corrido' }))`);
  await cdp.goto('/activar.html');
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('activar-live-form'))`)) break; await wait(120); }
  const resB = await cdp.evalJs(`(() => {
    const lsOk = document.getElementById('act-comercio').value === 'Resto Norte' && document.getElementById('act-whatsapp').value === '3814445566';
    const l1Pelu = document.getElementById('act-block5-body').innerText.includes('agenda individual 1 a 1');
    document.getElementById('act-rubro').value = 'gastronomia'; document.getElementById('act-rubro').dispatchEvent(new Event('change'));
    const l1Gastro = Boolean(document.getElementById('act-cap-turno'));
    return { lsOk, l1Pelu, l1Gastro };
  })()`);
  ok(resB.lsOk && resB.l1Pelu && resB.l1Gastro, `${vp.n}: Fallback localStorage + Bloque 5 L1 (Peluquería vs Gastronomía)`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-100'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    for (const vp of [{ n: 'Móvil 375x667', w: 375, h: 667, mob: true }, { n: 'Desktop 1280x800', w: 1280, h: 800, mob: false }]) await runViewport(cdp, vp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-100]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
