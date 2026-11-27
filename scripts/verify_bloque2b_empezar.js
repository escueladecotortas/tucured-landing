// Archivo: scripts/verify_bloque2b_empezar.js
// Compuerta local Pulido B: Landing CTA, Acto 1 manual, Pasos 1-11, Lumi Gate Desktop+Mobile (< 180L)

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { BASE, PORT_CDP, CHROME, wait, reqJson, Cdp, assertLumiVisible, runStaticAudit } from './verify_bloque2b_helpers.js';

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));

async function runDesktopE2E(cdp) {
  console.log('\n=== 2. E2E DESKTOP 1280x800 (LANDING + ACTO 1 MANUAL + PASOS 1-11 + LUMI GATE) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/', "document.readyState==='complete' && Boolean(document.getElementById('btn-funnel-launch'))");
  const land = await cdp.evalJs("(()=>{const b=document.getElementById('btn-funnel-launch'),t=document.getElementById('funnel')?.innerText||'';return{href:b?.getAttribute('href')||'',hasTono:/tono de voz/i.test(t),hasZero:/0% comisi/i.test(t)};})()");
  ok(land.href === '/empezar.html' && !land.hasTono && !land.hasZero, `Landing CTA=${land.href}, sin tono de voz ni 0% comisiones`);

  await cdp.goto('/empezar.html'); await cdp.evalJs('localStorage.clear(); sessionStorage.clear();'); await cdp.goto('/empezar.html');
  await assertLumiVisible(cdp, 'Desktop Acto 1', 72, ok);
  await wait(5200);
  const stillAct1 = await cdp.evalJs("Boolean(document.getElementById('btn-skip-lumi-intro')) && !document.getElementById('emp-comercio')");
  ok(stillAct1, 'Acto 1 NO salta automáticamente tras 5.2s (avance 100% manual)');
  await cdp.evalJs("document.getElementById('btn-skip-lumi-intro')?.click()"); await wait(250);
  await assertLumiVisible(cdp, 'Desktop Paso 1', 72, ok);

  await cdp.evalJs("const i=document.getElementById('emp-comercio');i.value='La Barbería de Don Julio';i.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('btn-emp-next').click();"); await wait(200);
  await cdp.evalJs("document.querySelector('[data-emp-rubro=\"deportes\"]').click();"); await wait(120);
  await cdp.evalJs("document.querySelector('[data-emp-spec=\"Pádel\"]')?.click();"); await wait(100);
  const p2Clean = await cdp.evalJs("document.querySelectorAll('#preview-phone-chassis .rounded-full').length === 0");
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(250);
  await assertLumiVisible(cdp, 'Desktop Paso 3', 72, ok);

  const p3 = await cdp.evalJs("({hasStyle:Boolean(document.querySelector('[data-emp-cover-style]')),excl:document.body.innerText.includes('queda reservada solo para tu marca'),cta:document.getElementById('preview-cta-btn')?.innerText||''})");
  await cdp.evalJs("document.getElementById('btn-emp-cover-temp')?.click()"); await wait(280);
  const tempImg = await cdp.evalJs("(()=>{const img=document.querySelector('#preview-phone-chassis img[data-temp-cover=\"1\"]');return{src:img?.getAttribute('src')||'',ok:Boolean(img&&img.complete&&img.naturalWidth>0),ph:document.getElementById('preview-phone-chassis').innerText.includes('Portada temporal')};})()");
  ok(p2Clean && !p3.hasStyle && p3.excl && p3.cta.includes('Reservar cancha') && tempImg.src.endsWith('temp_deportes.webp') && tempImg.ok && !tempImg.ph, `P2-P3 sin badge rubro, sin Estilo en P3, CTA "${p3.cta}", temporal=${tempImg.src} ok=${tempImg.ok}`);

  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  await cdp.evalJs("document.querySelector('[data-emp-preview-mode=\"turnero\"]')?.click()"); await wait(120);
  const bandBg = await cdp.evalJs("getComputedStyle(document.getElementById('preview-turnero-header-band')).backgroundColor");
  ok(bandBg === 'rgb(255, 255, 255)', `P4 banda superior Turnero blanco puro (${bandBg})`);

  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(220);
  const p5a = await cdp.evalJs("({mode:window.TucuEmpezarApp.getState().previewMode,count:document.querySelectorAll('[data-emp-tagline-idea]').length,first:document.querySelector('[data-emp-tagline-idea]')?.dataset?.empTaglineIdea||''})");
  await cdp.evalJs("document.getElementById('btn-emp-phrases-next')?.click()"); await wait(120);
  const p5b = await cdp.evalJs("({first:document.querySelector('[data-emp-tagline-idea]')?.dataset?.empTaglineIdea||'',rem:window.TucuEmpezarTaglineAssist.getRemaining()})");
  await cdp.evalJs("document.querySelectorAll('[data-emp-tagline-kw]')[0]?.click();document.getElementById('btn-emp-ai-run')?.click();");
  for (let i = 0; i < 40; i++) { await wait(150); if (await cdp.evalJs("Boolean(document.getElementById('btn-emp-ai-use'))")) break; }
  await cdp.evalJs("document.getElementById('btn-emp-ai-use')?.click()"); await wait(120);
  const p5used = await cdp.evalJs("document.getElementById('emp-bajada')?.value||''");
  ok(p5a.mode === 'cover' && p5a.count === 3 && p5b.first !== p5a.first && p5b.rem === 5 && p5used.length > 0, `P5 auto-portada, 3 ideas + Ver otras 3 gratis (rem=${p5b.rem}), IA separada "${p5used}"`);

  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  await assertLumiVisible(cdp, 'Desktop Paso 6', 72, ok);
  await cdp.evalJs("(()=>{const d=document.getElementById('emp-direccion');d.value='25 de Mayo 480';d.dispatchEvent(new Event('input',{bubbles:true}));const p=document.getElementById('emp-piso-depto');p.value='2, A';p.dispatchEvent(new Event('input',{bubbles:true}));p.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));})()");
  for (let i = 0; i < 30; i++) { await wait(150); if (await cdp.evalJs("Boolean(document.querySelector('#emp-geo-dropdown [data-geo-i]'))")) break; }
  await cdp.evalJs("const o=document.querySelector('#emp-geo-dropdown [data-geo-i]');if(o)o.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));"); await wait(200);
  const p6Fmt = await cdp.evalJs("document.getElementById('emp-piso-depto')?.value||''");
  ok(p6Fmt === 'Piso 2, Depto A', `P6 autoformateo piso/depto -> "${p6Fmt}"`);

  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  await cdp.evalJs("document.getElementById('emp-srv-nopr-0')?.click();"); await wait(100);
  await cdp.evalJs("document.getElementById('emp-srv-notm-0')?.click();"); await wait(100);
  await cdp.evalJs("document.querySelector('[data-emp-preview-mode=\"turnero\"]')?.click()"); await wait(120);
  const p7Res = await cdp.evalJs("(()=>{const r0=document.querySelector('#preview-service-chip > div');return{waTxt:document.getElementById('empezar-step-mount').innerText.includes('Despreocupate ahora'),prev:r0?.innerText||'',spans:r0?r0.querySelectorAll('span').length:0};})()");
  ok(p7Res.waTxt && p7Res.prev.includes('Consultar') && p7Res.spans === 2, `P7 Sin precio/tiempo (spans=${p7Res.spans}) y nuevo copy WA`);

  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  const p8Bullets = await cdp.evalJs("[...document.querySelectorAll('[data-emp-plan]')].map(b=>b.querySelectorAll('li').length)");
  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(200);
  await cdp.evalJs("document.querySelector('[data-emp-preview-mode=\"cover\"]')?.click()"); await wait(100);
  await cdp.evalJs("for(const [id,v] of [['emp-first','Julio'],['emp-last','Sosa'],['emp-whatsapp','3815554321'],['emp-instagram','@brava']]){const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));}"); await wait(120);
  const p9 = await cdp.evalJs("({ttl:document.getElementById('empezar-step-mount').innerText.includes('Tus datos de contacto'),glass:document.querySelectorAll('#empezar-live-preview .wg-social-glass').length})");
  ok(p8Bullets.every((n) => n === 4) && p9.ttl && p9.glass === 2, `P8 4 beneficios/plan, P9 contacto + ${p9.glass} botones glass`);

  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(250);
  await assertLumiVisible(cdp, 'Desktop Paso 10', 72, ok);
  await cdp.evalJs("document.querySelector('[data-emp-cover-style=\"poster\"]')?.click()"); await wait(150);
  await cdp.evalJs("document.getElementById('btn-open-terms-modal')?.click()"); await wait(120);
  const modalTxt = await cdp.evalJs("document.getElementById('emp-terms-modal')?.innerText||''");
  await cdp.evalJs("document.getElementById('btn-close-terms-modal')?.click()"); await wait(120);
  const p10Btn = await cdp.evalJs("({hasStyle:Boolean(document.getElementById('emp-step10-style-selector')),tone:document.getElementById('preview-poster-card')?.dataset?.posterTone||'',btnOk:document.getElementById('btn-empezar-submit')?.classList?.contains('wg-btn-emerald')})");
  await cdp.evalJs("document.querySelector('[data-emp-pay-method=\"mp\"]')?.click()");
  let mpMounted = false;
  for (let i = 0; i < 40; i++) { await wait(250); mpMounted = await cdp.evalJs("Boolean(document.querySelector('#emp-mp-brick-container iframe, #emp-mp-brick-container form, #emp-mp-brick-container [data-testid]'))"); if (mpMounted) break; }
  ok(p10Btn.hasStyle && ['dark', 'light'].includes(p10Btn.tone) && modalTxt.includes('v1.1') && p10Btn.btnOk && mpMounted, `P10 Estilo, Póster (${p10Btn.tone}), Modal T&C v1.1, botón verde y Brick MP=${mpMounted}`);

  await cdp.evalJs("document.querySelector('[data-emp-pay-method=\"transfer\"]')?.click()"); await wait(150);
  await cdp.evalJs("const t=document.getElementById('emp-terms');t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('btn-empezar-submit')?.click();"); await wait(600);
  await assertLumiVisible(cdp, 'Desktop Paso 11', 72, ok);
  const p11 = await cdp.evalJs("({txt:document.getElementById('empezar-step-mount').innerText,waTarget:document.getElementById('btn-open-wa-now')?.getAttribute('target')||'',domCls:document.getElementById('emp-success-domain')?.className||'',back:Boolean(document.getElementById('btn-emp-back-home'))})");
  ok(p11.txt.includes('Reserva pendiente') && p11.txt.includes('¡Tu diseño y link están reservados!') && p11.waTarget === '_blank' && p11.domCls.includes('break-all') && p11.back, 'P11 estado Transferencia 24hs, link break-all, WA _blank y Volver a tucured.ar');
}

async function runMobileCheck(cdp) {
  console.log('\n=== 3. E2E MOBILE 375x667 (NO STICKY, LUMI GATE ACTO1->P1->P3->P6->P10->P11, OVERFLOW 0) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/empezar.html'); await cdp.evalJs('localStorage.clear(); sessionStorage.clear();'); await cdp.goto('/empezar.html');
  await assertLumiVisible(cdp, 'Mobile Acto 1', 60, ok);
  await cdp.evalJs("document.getElementById('btn-skip-lumi-intro')?.click()"); await wait(250);
  await assertLumiVisible(cdp, 'Mobile Paso 1', 60, ok);
  const mobP1 = await cdp.evalJs("({ov:document.documentElement.scrollWidth<=document.documentElement.clientWidth,pos:getComputedStyle(document.getElementById('empezar-mascot-mount')).position,hint:getComputedStyle(document.querySelector('.emp-enter-hint')).display})");
  ok(mobP1.ov && mobP1.pos !== 'sticky' && mobP1.hint === 'none', `Mobile 375 overflow=0, mascot pos=${mobP1.pos}, enterHint=${mobP1.hint}`);

  for (const [stNum, lbl] of [[3, 'Mobile Paso 3'], [6, 'Mobile Paso 6'], [10, 'Mobile Paso 10']]) {
    await cdp.evalJs(`(()=>{window.scrollTo(0,0);const s=window.TucuEmpezarApp.getState();Object.assign(s,{comercio:'Barberia Norte',slug:'barberia-norte',rubro:'peluqueria',coverMode:'temp',coverId:'temp_peluqueria',direccion:'25 de Mayo 480',direccionLat:'-26.82',direccionLng:'-65.20',geoVerified:true,titularNombre:'Julio',titularApellido:'Sosa',whatsapp:'3815554321',step:${stNum}});window.TucuEmpezarApp.renderAll();})()`);
    await wait(220); await assertLumiVisible(cdp, lbl, 60, ok);
  }
  const mobStylePrev = await cdp.evalJs("Boolean(document.querySelector('#emp-step10-mobile-style-preview img[data-temp-cover=\"1\"]'))");
  ok(mobStylePrev, 'Mobile P10 renderiza mini-preview inline de estilo con portada temporal .webp');
  await cdp.evalJs("const t=document.getElementById('emp-terms');t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('btn-empezar-submit')?.click();"); await wait(600);
  await assertLumiVisible(cdp, 'Mobile Paso 11', 60, ok);
}

async function main() {
  runStaticAudit(ok);
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