// Archivo: scripts/verify_bloque2b_empezar.js
// Compuerta local Bloque 2B: Pasos 1-11, Lumi Failure-to-Gate (Desktop+Mobile) y Brick (< 195L)

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn } from 'child_process';

const BASE = 'http://127.0.0.1:5174', PORT_CDP = 9286;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
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
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') { const u = m.params.entry.url || ''; if ((!u || u.startsWith(BASE)) && !/mercadopago/i.test(m.params.entry.text)) this.errors.push(m.params.entry.text); }
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params.response.url.endsWith('/favicon.ico') && m.params.response.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
    await this.send('Page.addScriptToEvaluateOnNewDocument', { source: "window.TUCU_ENGINE_URL='https://engine.tucured.com.ar';" });
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(120); if (await this.evalJs("document.readyState==='complete' && Boolean(document.getElementById('empezar-step-mount'))").catch(() => false)) break; } await wait(250); }
  async evalJs(e) { const r = await this.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

async function assertLumiVisible(cdp, label, minSize) {
  let m = {};
  for (let i = 0; i < 12; i++) {
    m = await cdp.evalJs(`(()=>{const a=document.getElementById('tucu-mascot-actor'),h=document.getElementById('emp-header');if(!a||!h)return{ok:false,reason:'missing'};const r=a.getBoundingClientRect(),hb=h.getBoundingClientRect().bottom,cs=getComputedStyle(a),m=a.querySelector('.tucu-mascot-media.is-clip-active'),mcs=m?getComputedStyle(m):null,vw=window.innerWidth,vh=window.innerHeight,dimOk=r.width>=${minSize}&&r.height>=${minSize},stOk=cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity)>0.9&&Boolean(mcs)&&mcs.display!=='none'&&mcs.visibility!=='hidden'&&parseFloat(mcs.opacity)>0.9,posOk=r.top>=hb-1&&r.left>=-1&&r.right<=vw+1&&r.bottom<=vh+1,medOk=Boolean(m&&(m.tagName==='VIDEO'?(m.readyState>=2&&m.videoWidth>0):(m.complete&&m.naturalWidth>0))),hit=(r.width>0&&r.height>0)?document.elementFromPoint(r.left+r.width/2,r.top+r.height/2):null,unocc=Boolean(hit&&(hit===a||a.contains(hit)));return{ok:dimOk&&stOk&&posOk&&medOk&&unocc,w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top),hb:Math.round(hb),op:mcs?mcs.opacity:'0',medOk,unocc,posOk,clip:m?.dataset?.clipKey||'',tag:m?.tagName||''};})()`);
    if (m.ok) break;
    await wait(100);
  }
  ok(m.ok, `Lumi visible [${label}]: ${m.w}x${m.h} op=${m.op} mediaDecoded=${m.medOk} unoccluded=${m.unocc} top(${m.top})>=hb(${m.hb}) [${m.tag}:${m.clip}]`);
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA (<200L, AST, CLICHÉS, .tucured.com.ar) ===');
  const files = ['public/css/empezar_mascot.css', 'public/js/empezar_mascot_stage.js', 'public/js/empezar_mascot.js', 'public/js/empezar_lumi_advisor.js', 'public/js/empezar_preview_styles.js', 'public/js/empezar/empezar_preview.js', 'public/js/empezar/empezar_state.js', 'public/js/empezar_covers.js', 'public/js/empezar_tagline_assist.js', 'public/js/empezar_tones.js', 'public/js/activar/activar_geo.js', 'public/js/empezar/empezar_media.js', 'public/js/empezar_services_step.js', 'public/js/empezar_micro_steps.js', 'public/js/empezar_checkout_ui.js', 'public/js/empezar_mp_brick.js', 'public/js/empezar_step11.js', 'public/js/empezar/empezar_steps.js', 'public/js/empezar/empezar_submit.js', 'public/js/empezar/empezar_events.js', 'public/js/empezar/empezar_app.js', 'public/empezar.html', 'scripts/verify_bloque2b_empezar.js'];
  const badLen = [], badAst = [];
  for (const rel of files) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    console.log(`    ${rel.padEnd(42)} ${String(lines.length).padStart(3)}L`);
    if (lines.length >= 200 || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
  }
  ok(badLen.length === 0, `Todos los archivos <200L y con cabecera Archivo (${files.length}; fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `AST node --check OK (fallos=${badAst.join(',') || '0'})`);
  const empTargets = files.filter((f) => f.startsWith('public/') && !f.endsWith('activar_geo.js'));
  const banned = /El m[aá]s elegido|Control total|24\s*hs|24\/7|0%\s*comisi|Para arrancar solo|Cierra ma[nñ]ana|Cierra tarde|Direcci[oó]n web deseada|\bclima\b|Video loop en vivo|Ver las 12|Plan Esencial|Admin · Esencial|bg-stone-900/i;
  const badCl = empTargets.filter((f) => banned.test(fs.readFileSync(path.resolve(f), 'utf8')));
  const badDom = empTargets.filter((f) => /[a-z0-9}-]+\.tucured\.ar\b/i.test(fs.readFileSync(path.resolve(f), 'utf8')));
  ok(badCl.length === 0, `0 clichés ni bg-stone-900 en /empezar (fallos=${badCl.join(',') || '0'})`);
  ok(badDom.length === 0, `0 subdominios .tucured.ar en /empezar (fallos=${badDom.join(',') || '0'})`);
  const distMascot = fs.existsSync('dist/assets/mascot') ? fs.readdirSync('dist/assets/mascot') : [];
  ok(distMascot.length === 13 && !fs.existsSync('dist/assets/mascot/raw') && !fs.existsSync('dist/lab'), 'dist/ limpio con 13 assets de Lumi sin raw ni lab');
}

async function runDesktopE2E(cdp) {
  console.log('\n=== 2. E2E DESKTOP 1280x800 (PASOS 1-11 + LUMI GATE + BRICK) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/empezar.html'); await cdp.evalJs('localStorage.clear(); sessionStorage.clear();'); await cdp.goto('/empezar.html');
  await assertLumiVisible(cdp, 'Desktop Acto 1', 72);
  await cdp.evalJs("document.getElementById('btn-skip-lumi-intro')?.click()"); await wait(250);
  await assertLumiVisible(cdp, 'Desktop Paso 1', 72);
  await cdp.evalJs("const i=document.getElementById('emp-comercio');i.value='La Barbería de Don Julio';i.dispatchEvent(new Event('input',{bubbles:true}));");
  const p1 = await cdp.evalJs("({cta:Boolean(document.getElementById('preview-cta-btn')),tabs:Boolean(document.getElementById('preview-mode-tabs'))})");
  ok(!p1.cta && !p1.tabs, 'P1 lienzo limpio sin CTA ni tabs Portada|Turnero');
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  const p2 = await cdp.evalJs("document.body.innerText.includes('DIRECCIÓN WEB SUGERIDA') || document.body.innerText.includes('Dirección web sugerida')");
  ok(!p2, 'P2 sin bloque Dirección web sugerida');
  await cdp.evalJs("document.querySelector('[data-emp-rubro=\"deportes\"]').click();"); await wait(120);
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(250);
  await cdp.evalJs("window.scrollTo(0,260);"); await wait(160);
  await assertLumiVisible(cdp, 'Desktop Paso 3 + Scroll', 72);
  await cdp.evalJs("window.scrollTo(0,0);"); await wait(100);
  const p3 = await cdp.evalJs("({first:document.querySelector('[data-emp-cover-id]')?.getAttribute('aria-label')||'',disp:document.getElementById('empezar-step-mount').innerText.includes('Disponible')})");
  await cdp.evalJs("document.querySelector('[data-emp-cover-id]').click()"); await wait(120);
  const rubAfterCov = await cdp.evalJs("window.TucuEmpezarApp.getState().rubro");
  ok(p3.first.includes('deportes') && !p3.disp && rubAfterCov === 'deportes', `P3 ordena deportes primero, sin pill Disponible y mantiene rubro=${rubAfterCov}`);
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  ok(await cdp.evalJs("Boolean(document.getElementById('preview-mode-tabs'))"), 'P4 activa switch Portada | Turnero');
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  await cdp.evalJs("document.querySelectorAll('[data-emp-tagline-kw]')[0]?.click();document.querySelectorAll('[data-emp-tagline-kw]')[1]?.click();"); await wait(120);
  const p5 = await cdp.evalJs("({kws:window.TucuEmpezarApp.getState().keywords.length,pressed:document.querySelectorAll('[data-emp-tagline-kw][aria-pressed=\"true\"]').length,ai:document.getElementById('btn-emp-ai-run')?.innerText||''})");
  ok(p5.kws === 2 && p5.pressed === 2 && p5.ai.includes('5 de 5 disponibles'), `P5 keywords activos (${p5.kws}) y cupo IA "${p5.ai}"`);
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  await assertLumiVisible(cdp, 'Desktop Paso 6', 72);
  await cdp.evalJs("const d=document.getElementById('emp-direccion');d.value='25 de Mayo 480';d.dispatchEvent(new Event('input',{bubbles:true}));");
  for (let i = 0; i < 30; i++) { await wait(150); if (await cdp.evalJs("Boolean(document.querySelector('#emp-geo-dropdown [data-geo-i]'))")) break; }
  await cdp.evalJs("const o=document.querySelector('#emp-geo-dropdown [data-geo-i]');if(o)o.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));"); await wait(200);
  await cdp.evalJs("const p=document.getElementById('emp-piso-depto');p.value='Local 2';p.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-emp-sched=\"partido\"]').click();"); await wait(180);
  const p6 = await cdp.evalJs("({ver:Boolean(document.getElementById('emp-geo-verified-pill')),o1:document.getElementById('emp-open1')?.value,c1:document.getElementById('emp-close1')?.value,o2:document.getElementById('emp-open2')?.value,c2:document.getElementById('emp-close2')?.value})");
  ok(p6.ver && p6.o1 === '09:00' && p6.c1 === '13:00' && p6.o2 === '17:00' && p6.c2 === '21:00', `P6 verificado + Partido ${p6.o1}-${p6.c1} / ${p6.o2}-${p6.c2}`);
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  await cdp.evalJs("document.getElementById('btn-emp-add-service')?.click()"); await wait(100);
  await cdp.evalJs("document.getElementById('emp-assist-check')?.click()"); await wait(100);
  const p7wa = await cdp.evalJs("!document.getElementById('emp-services-list') && document.body.innerText.includes('Te la mando por WhatsApp al terminar')");
  await cdp.evalJs("document.getElementById('emp-assist-check')?.click();document.getElementById('btn-emp-next').click()"); await wait(250);
  ok(p7wa && await cdp.evalJs("window.TucuEmpezarApp.getState().servicios.every(s=>s.name.trim().length>0)"), 'P7 colapsa ejemplos con WhatsApp y descarta filas vacías al avanzar');
  const p8 = await cdp.evalJs("({suf:document.getElementById('empezar-step-mount').innerText.includes('.tucured.com.ar'),badge:Boolean(document.getElementById('preview-plan-badge'))})");
  ok(p8.suf && p8.badge, 'P8 muestra .tucured.com.ar y badge de plan');
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  const p9noEmail = await cdp.evalJs("document.querySelectorAll('input[type=\"email\"]').length === 0");
  await cdp.evalJs("for(const [id,v] of [['emp-first','Julio'],['emp-last','Sosa'],['emp-whatsapp','3815554321'],['emp-instagram','@brava']]){const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}"); await wait(120);
  ok(p9noEmail && await cdp.evalJs("Boolean(document.querySelector('[data-preview-wa]')) && Boolean(document.querySelector('[data-preview-ig]'))"), 'P9 sin input email y activa íconos WA/IG en preview');
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(250);
  const p10 = await cdp.evalJs("({chk:document.getElementById('emp-terms')?.checked,tit:document.getElementById('empezar-step-mount').innerText.includes('Leonardo Laricchiuta')})");
  await cdp.evalJs("document.querySelector('[data-emp-jump-step=\"1\"]')?.click()"); await wait(150);
  await cdp.evalJs("document.getElementById('btn-emp-return-summary')?.click()"); await wait(150);
  const jumpedBackOk = await cdp.evalJs("window.TucuEmpezarApp.getState().step === 10");
  await cdp.evalJs("document.querySelector('[data-emp-pay-method=\"mp\"]')?.click()");
  let mpMounted = false;
  for (let i = 0; i < 45; i++) { await wait(250); mpMounted = await cdp.evalJs("Boolean(document.querySelector('#emp-mp-brick-container iframe, #emp-mp-brick-container form, #emp-mp-brick-container [data-testid]'))"); if (mpMounted) break; }
  ok(p10.chk === false && p10.tit && jumpedBackOk && mpMounted, `P10 términos destildados, Cambiar->Volver, titular Leonardo Laricchiuta y Brick MP=${mpMounted}`);
  await cdp.evalJs("document.querySelector('[data-emp-pay-method=\"transfer\"]')?.click();"); await wait(180);
  await cdp.evalJs("const st=window.TucuEmpezarApp.getState();st.coverMode='temp';st.coverId='temp_deportes';const t=document.getElementById('emp-terms');t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));"); await wait(120);
  await cdp.evalJs("document.getElementById('btn-empezar-submit')?.click()"); await wait(600);
  const p11 = await cdp.evalJs("({conf:Boolean(document.getElementById('emp-confetti-canvas')),dom:document.getElementById('emp-success-domain')?.innerText||'',wa:Boolean(document.getElementById('btn-open-wa-now'))})");
  ok(p11.conf && p11.dom.includes('.tucured.com.ar') && p11.wa, `P11 confetti + link "${p11.dom}" + botón WhatsApp`);
  await assertLumiVisible(cdp, 'Desktop Paso 11', 72);
}

async function runMobileCheck(cdp) {
  console.log('\n=== 3. E2E MOBILE 375x667 (LUMI GATE ACTO1->P1->P3->P6->P11 + OVERFLOW 0) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/empezar.html'); await cdp.evalJs('localStorage.clear(); sessionStorage.clear();'); await cdp.goto('/empezar.html');
  await assertLumiVisible(cdp, 'Mobile Acto 1', 60);
  await cdp.evalJs("document.getElementById('btn-skip-lumi-intro')?.click()"); await wait(250);
  await assertLumiVisible(cdp, 'Mobile Paso 1', 60);
  ok(await cdp.evalJs("document.documentElement.scrollWidth<=document.documentElement.clientWidth"), 'Mobile 375 sin overflow horizontal en Paso 1');
  await cdp.evalJs("(()=>{const s=window.TucuEmpezarApp.getState();s.comercio='Barberia Norte';s.slug='barberia-norte';s.step=3;window.TucuEmpezarApp.renderAll();})()"); await wait(200);
  await cdp.evalJs("window.scrollTo(0,260);"); await wait(160);
  await assertLumiVisible(cdp, 'Mobile Paso 3 + Scroll', 60);
  await cdp.evalJs("(()=>{window.scrollTo(0,0);const s=window.TucuEmpezarApp.getState();s.step=6;window.TucuEmpezarApp.renderAll();})()"); await wait(200);
  await assertLumiVisible(cdp, 'Mobile Paso 6', 60);
  await cdp.evalJs("(()=>{const s=window.TucuEmpezarApp.getState();Object.assign(s,{direccion:'25 de Mayo 480',direccionLat:'-26.82',direccionLng:'-65.20',geoVerified:true,titularNombre:'Julio',titularApellido:'Sosa',whatsapp:'3815554321',coverMode:'temp',coverId:'temp_peluqueria',termsAccepted:true,step:10});window.TucuEmpezarApp.renderAll();})()"); await wait(200);
  await cdp.evalJs("document.getElementById('btn-empezar-submit')?.click()"); await wait(600);
  await assertLumiVisible(cdp, 'Mobile Paso 11', 60);
}

async function main() {
  runStatic();
  const userDataDir = path.resolve('.tmp-cdp-2b'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some((t) => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find((t) => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await runDesktopE2E(cdp); await runMobileCheck(cdp);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 local (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    if (cdp.errors.length || cdp.httpBad.length) console.error('DETAILS:', cdp.errors, cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO BLOQUE 2B: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });