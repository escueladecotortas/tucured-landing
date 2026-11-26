// Archivo: scripts/verify_bloque2a_empezar.js
// Compuerta local Bloque 2A: Warm Glass, Lumi v2, Acto 1->2 y Pasos 1-5 en 1280x800 y 375x667 (< 190L)

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

const BASE = 'http://127.0.0.1:5174';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT_CDP = 9284;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); }); q.on('error', rej); q.end(); });

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));

class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params.response.url.endsWith('/favicon.ico') && m.params.response.status >= 400) {
        this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
      }
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable'); await this.send('DOM.enable');
    await this.send('Page.addScriptToEvaluateOnNewDocument', { source: "window.TUCU_ENGINE_URL = 'https://engine.tucured.com.ar';" });
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) {
    await this.send('Page.navigate', { url: BASE + u });
    for (let i = 0; i < 40; i++) {
      await wait(120);
      if (await this.evalJs("document.readyState === 'complete' && Boolean(document.getElementById('empezar-step-mount'))").catch(() => false)) break;
    }
    await wait(250);
  }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

function runStaticChecks() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA, PARIDAD PLAN TURNOS Y LISTA NEGRA ===');
  const touched = [
    'public/css/empezar_mascot.css', 'public/js/empezar_mascot_stage.js', 'public/js/empezar_lumi_advisor.js',
    'public/js/empezar_mascot.js', 'public/assets/covers/cover_catalog.json', 'public/js/empezar_covers.js',
    'public/js/empezar_tagline_assist.js', 'public/js/empezar_preview_styles.js', 'public/js/empezar/empezar_preview.js',
    'public/js/empezar/empezar_state.js', 'public/js/empezar_micro_steps.js', 'public/js/empezar/empezar_steps.js',
    'public/js/empezar_checkout_ui.js', 'public/js/empezar/empezar_events.js', 'public/js/empezar/empezar_app.js', 'public/empezar.html', 'scripts/verify_bloque2a_empezar.js'
  ];
  const badLen = [], badAst = [];
  for (const rel of touched) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    if (lines.length >= 200 || (!rel.endsWith('.json') && !/Archivo:/i.test(lines[0]))) badLen.push(`${rel}:${lines.length}L`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
  }
  ok(badLen.length === 0, `Ley <200L y cabecera Archivo OK (${touched.length} archivos; fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `AST node --check OK (fallos=${badAst.join(',') || '0'})`);

  const prodTargets = [
    'js/components/pricing.js', 'js/components/funnel_data.js', 'js/utils/whatsapp_link.js',
    'public/js/activar/activar_data.js', 'public/js/activar/activar_markup.js',
    'public/js/admin_shared/admin_features.js', 'netlify/functions/wa-welcome.js',
    'js/showcase_v11/showcase_state.js', 'js/components/faq_accordion.js',
    'js/showcase_v11/showcase_admin_ui.js', 'public/admin_l1.html', 'public/js/admin_l1/admin_l1_core.js',
    'scripts/verify_task112b_admin_modular.js', 'scripts/verify_task113a_landing_two_sections.js'
  ];
  const oldPlanHits = prodTargets.filter((f) => /Plan Esencial|Admin · Esencial/i.test(fs.readFileSync(path.resolve(f), 'utf8')));
  ok(oldPlanHits.length === 0, `0 ocurrencias de Plan Esencial / Admin · Esencial (fallos=${oldPlanHits.join(',') || '0'})`);

  const empFiles = fs.readdirSync('public/js/empezar').map((f) => `public/js/empezar/${f}`)
    .concat(['public/empezar.html', 'public/js/empezar_micro_steps.js', 'public/js/empezar_covers.js', 'public/js/empezar_tagline_assist.js', 'public/js/empezar_checkout_ui.js', 'public/js/empezar_preview_styles.js', 'public/js/empezar_mascot.js', 'public/js/empezar_lumi_advisor.js']);
  const bannedRx = /El m[aá]s elegido|Control total|24\s*hs|24\/7|0%\s*comisi|\bclima\b|Video loop en vivo|Ver las 12|bg-stone-900|Tucu Red · Conectamos tu negocio/i;
  const bannedHits = empFiles.filter((f) => bannedRx.test(fs.readFileSync(path.resolve(f), 'utf8')));
  ok(bannedHits.length === 0, `0 palabras prohibidas ni bg-stone-900 en /empezar (fallos=${bannedHits.join(',') || '0'})`);

  const distMascot = fs.existsSync('dist/assets/mascot') ? fs.readdirSync('dist/assets/mascot') : [];
  const cleanDist = !fs.existsSync('dist/assets/mascot/raw') && !fs.existsSync('dist/lab_portadas.html') && !fs.existsSync('dist/lab');
  ok(distMascot.length === 13 && cleanDist, `dist/assets/mascot tiene 13 assets (${distMascot.length}) y excluye raw/lab (${cleanDist})`);
}

async function runDesktopFlow(cdp) {
  console.log('\n=== 2. E2E DESKTOP 1280x800 (ACTO 1->2 Y PASOS 1 A 5) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/empezar.html');
  await cdp.evalJs('localStorage.clear(); sessionStorage.clear();');
  await cdp.goto('/empezar.html');

  const introShown = await cdp.evalJs("Boolean(document.getElementById('lumi-intro-stage-anchor')) && (document.querySelector('#empezar-mascot-mount')?.innerText || '').includes('LUMI · TU GUÍA TUCURED')");
  ok(introShown, 'Acto 1 Lumi intro centrado y cabecera LUMI · TU GUÍA TUCURED visibles');
  await cdp.evalJs("document.getElementById('btn-skip-lumi-intro')?.click()");
  await wait(250);

  await cdp.evalJs("const el=document.getElementById('emp-comercio'); el.value='La Barbería de Don Julio'; el.dispatchEvent(new Event('input',{bubbles:true}));");
  const slugVal = await cdp.evalJs('window.TucuEmpezarApp.getState().slug');
  const noBadgeEarly = await cdp.evalJs("!document.getElementById('preview-plan-badge') && document.documentElement.scrollWidth <= document.documentElement.clientWidth");
  ok(slugVal === 'barberia-don' && noBadgeEarly, `Paso 1 slug inteligente "${slugVal}", sin badge de plan y sin overflow`);

  await cdp.evalJs("document.getElementById('btn-emp-next')?.click()");
  await wait(250);
  const p2 = await cdp.evalJs("({ rubros: document.querySelectorAll('[data-emp-rubro]').length, gastro: Boolean(document.querySelector('[data-emp-rubro=\"gastronomia\"]')), pre: document.querySelectorAll('[data-emp-rubro][aria-pressed=\"true\"]').length })");
  ok(p2.rubros === 5 && !p2.gastro && p2.pre === 0, `Paso 2 muestra 5 rubros sin Gastronomía y sin preselección (${JSON.stringify(p2)})`);

  await cdp.evalJs("document.querySelector('[data-emp-rubro=\"peluqueria\"]')?.click()");
  await wait(120);
  await cdp.evalJs("document.querySelector('[data-emp-spec=\"Cortes\"]')?.click(); document.getElementById('btn-emp-next')?.click();");
  await wait(250);

  const p3 = await cdp.evalJs("({ cards: document.querySelectorAll('[data-emp-cover-id]').length, tabs: document.querySelectorAll('[data-emp-cover-tab]').length })");
  await cdp.evalJs("document.querySelector('[data-emp-cover-style=\"poster\"]')?.click();");
  await wait(80);
  await cdp.evalJs("document.getElementById('btn-emp-cover-temp')?.click();");
  await wait(120);
  const tempId = await cdp.evalJs('window.TucuEmpezarApp.getState().coverId');
  ok(p3.cards === 2 && p3.tabs === 0 && tempId === 'temp_peluqueria', `Paso 3 muestra 2 portadas sin tabs Día/Nocturno/12 y temporal "${tempId}"`);

  await cdp.evalJs("document.getElementById('btn-emp-next')?.click()");
  await wait(220);
  const logoPng = path.resolve('.tmp_test_logo.png');
  await cdp.evalJs(`(() => {
    const c = document.createElement('canvas'); c.width = 340; c.height = 340;
    const x = c.getContext('2d'); x.fillStyle = '#EA580C'; x.fillRect(0,0,340,340);
    window.__tmpLogoUrl = c.toDataURL('image/png');
  })()`);
  const dataUrl = await cdp.evalJs('window.__tmpLogoUrl');
  fs.writeFileSync(logoPng, Buffer.from(dataUrl.split(',')[1], 'base64'));
  const doc = await cdp.send('DOM.getDocument', { depth: -1 });
  const inp = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#emp-logo-input' });
  await cdp.send('DOM.setFileInputFiles', { files: [logoPng], nodeId: inp.nodeId });
  await wait(450);
  try { fs.unlinkSync(logoPng); } catch {}

  const p4 = await cdp.evalJs("({ txt: document.getElementById('empezar-step-mount')?.innerText || '', mode: window.TucuEmpezarApp.getState().previewMode, turneroTxt: document.getElementById('empezar-live-preview')?.innerText || '' })");
  ok(p4.txt.includes('Logo listo y optimizado') && !/\b\d+\s*KB\b/i.test(p4.txt) && p4.mode === 'turnero' && p4.turneroTxt.includes('PASO 1 DE 2'), 'Paso 4 muestra "Logo listo y optimizado" y cambia a Turnero PASO 1 DE 2');

  await cdp.evalJs("document.getElementById('btn-lumi-advice')?.click()");
  await wait(150);
  await cdp.evalJs("document.getElementById('btn-emp-next')?.click()");
  await wait(220);
  const p5 = await cdp.evalJs("({ maxLen: document.getElementById('emp-bajada')?.getAttribute('maxlength'), aiTxt: document.getElementById('btn-emp-ai-run')?.innerText?.trim(), ideas: Array.from(document.querySelectorAll('[data-emp-tagline-idea]')).map(b => b.innerText.length) })");
  ok(p5.maxLen === '55' && p5.aiTxt === 'Crear frase con IA' && p5.ideas.every((n) => n <= 55), `Paso 5 maxlength=55, botón "${p5.aiTxt}" e ideas <=55 (${p5.ideas.join(',')})`);
}

async function runMobileCheck(cdp) {
  console.log('\n=== 3. E2E MOBILE 375x667 (SIN OVERFLOW Y PREVIEW DRAWER) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/empezar.html');
  await wait(200);
  await cdp.evalJs("document.getElementById('btn-open-mobile-preview')?.click()");
  await wait(180);
  const mob = await cdp.evalJs("({ open: !document.getElementById('empezar-preview-drawer')?.classList.contains('hidden'), ov: document.documentElement.scrollWidth > document.documentElement.clientWidth, pill: Boolean(document.getElementById('preview-domain-pill')) })");
  ok(mob.open && !mob.ov && mob.pill, `Mobile 375 abre drawer preview sin overflow horizontal (${JSON.stringify(mob)})`);
}

async function main() {
  runStaticChecks();
  const userDataDir = path.resolve('.tmp-cdp-2a');
  try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    let targets = [];
    for (let i = 0; i < 30; i++) {
      try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some((t) => t.type === 'page')) break; } catch {}
      await wait(200);
    }
    const tab = targets.find((t) => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await runDesktopFlow(cdp);
    await runMobileCheck(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('DETAILS:', cdp.errors, cdp.httpBad);
    cdp.close();
  } finally {
    chrome.kill('SIGKILL');
    await wait(250);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  console.log(`\nRESULTADO BLOQUE 2A: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
