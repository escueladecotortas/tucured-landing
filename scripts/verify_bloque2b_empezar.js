// Archivo: scripts/verify_bloque2b_empezar.js
// Compuerta local Micro-Pulido C: P1 saludo, P2 especialidad única/multi, persistencia foto, P10 proporcional/modal, P11 (< 165L)

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { BASE, PORT_CDP, CHROME, wait, reqJson, Cdp, assertLumiVisible, runStaticAudit } from './verify_bloque2b_helpers.js';

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));

async function runDesktopE2E(cdp) {
  console.log('\n=== 2. E2E DESKTOP 1280x800 (PULIDO B + MICRO-PULIDO C + LUMI GATE) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/', "document.readyState==='complete' && Boolean(document.getElementById('btn-funnel-launch'))");
  const land = await cdp.evalJs("(()=>{const b=document.getElementById('btn-funnel-launch'),t=document.getElementById('funnel')?.innerText||'';return{href:b?.getAttribute('href')||'',hasTono:/tono de voz/i.test(t),hasZero:/0% comisi/i.test(t)};})()");
  ok(land.href === '/empezar.html' && !land.hasTono && !land.hasZero, `Landing CTA=${land.href}, sin tono de voz ni 0% comisiones`);

  await cdp.goto('/empezar.html'); await cdp.evalJs('localStorage.clear(); sessionStorage.clear();'); await cdp.goto('/empezar.html');
  await assertLumiVisible(cdp, 'Desktop Acto 1', 72, ok);
  await cdp.evalJs("document.getElementById('btn-skip-lumi-intro')?.click()"); await wait(280);
  await assertLumiVisible(cdp, 'Desktop Paso 1', 72, ok);
  const p1Line = await cdp.evalJs("document.getElementById('tucu-mascot-line')?.innerText||''");
  ok(!/Hola, soy Lumi/i.test(p1Line) && p1Line.length > 10, `P1 saludo directo sin "Hola, soy Lumi." ("${p1Line}")`);

  await cdp.evalJs("const i=document.getElementById('emp-comercio');i.value='Estudio Sur';i.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('btn-emp-next').click();"); await wait(200);
  await cdp.evalJs("document.querySelector('[data-emp-rubro=\"servicios\"]')?.click()"); await wait(100);
  await cdp.evalJs("document.querySelector('[data-emp-spec=\"Diseño\"]')?.click()"); await wait(80);
  await cdp.evalJs("document.querySelector('[data-emp-spec=\"Abogacía\"]')?.click()"); await wait(100);
  const srvSpec = await cdp.evalJs("({sp:window.TucuEmpezarApp.getState().specialties,lbl:document.getElementById('empezar-step-mount').innerText.includes('ELEGÍ UNA')})");
  await cdp.evalJs("document.querySelector('[data-emp-rubro=\"deportes\"]')?.click()"); await wait(100);
  await cdp.evalJs("document.querySelector('[data-emp-spec=\"Pádel\"]')?.click()"); await wait(80);
  await cdp.evalJs("document.querySelector('[data-emp-spec=\"Tenis\"]')?.click()"); await wait(100);
  const depSpec = await cdp.evalJs("window.TucuEmpezarApp.getState().specialties");
  ok(srvSpec.lbl && srvSpec.sp.length === 1 && srvSpec.sp[0] === 'Abogacía' && depSpec.length === 2, `P2 selección única servicios=${JSON.stringify(srvSpec.sp)} y multi deportes=${JSON.stringify(depSpec)}`);

  await cdp.evalJs("document.getElementById('btn-emp-next').click()"); await wait(250);
  await assertLumiVisible(cdp, 'Desktop Paso 3', 72, ok);

  // Persistencia foto propia en localStorage tras recarga + salvaguarda sin caché
  const tinyWebp = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  await cdp.evalJs(`(()=>{localStorage.setItem('tucu_empezar_media_v1',JSON.stringify({cover:{dataUrl:'${tinyWebp}',kb:1,width:900,height:1600,name:'propia.webp'}}));const s=window.TucuEmpezarApp.getState();s.coverMode='custom';s.coverId='custom';window.TucuEmpezarMicroSteps.saveDraft(s);})()`);
  await cdp.goto('/empezar.html');
  const persistedCustom = await cdp.evalJs("(()=>{const img=document.querySelector('#preview-phone-chassis img');return{mode:window.TucuEmpezarApp.getState().coverMode,ok:Boolean(img&&img.complete&&img.naturalWidth>0),card:Boolean(document.getElementById('btn-emp-select-custom-cover'))};})()");
  await cdp.evalJs("(()=>{localStorage.removeItem('tucu_empezar_media_v1');})()");
  await cdp.goto('/empezar.html');
  const guardCleared = await cdp.evalJs("window.TucuEmpezarApp.getState().coverMode");
  ok(persistedCustom.mode === 'custom' && persistedCustom.ok && persistedCustom.card && guardCleared === 'temp', `Persistencia foto propia tras reload=${persistedCustom.ok} y salvaguarda sin caché->${guardCleared}`);

  await cdp.evalJs("(()=>{const s=window.TucuEmpezarApp.getState();Object.assign(s,{direccion:'25 de Mayo 480',direccionLat:'-26.82',direccionLng:'-65.20',geoVerified:true,titularNombre:'Julio',titularApellido:'Sosa',whatsapp:'3815554321',instagram:'@brava',step:10});window.TucuEmpezarApp.renderAll();})()"); await wait(220);
  await assertLumiVisible(cdp, 'Desktop Paso 10', 72, ok);
  await cdp.evalJs("const t=document.getElementById('emp-terms');t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('btn-empezar-submit')?.click();"); await wait(550);
  await assertLumiVisible(cdp, 'Desktop Paso 11', 72, ok);
  const p11 = await cdp.evalJs("({advHidden:document.getElementById('btn-lumi-advice')?.classList.contains('hidden'),copyBtn:Boolean(document.querySelector('#emp-transfer-24h-box #btn-emp-copy-alias')),olTxt:document.querySelector('#emp-success-view ol')?.innerText||''})");
  ok(p11.advHidden && p11.copyBtn && !p11.olTxt.includes('$4.999') && !p11.olTxt.includes('tucured'), 'P11 oculta Pedime un consejo, agrega Copiar Alias en caja 24h y sin repetición en pasos');
}

async function runMobileCheck(cdp) {
  console.log('\n=== 3. E2E MOBILE 375x667 (PREVIEW PROPORCIONAL P10 + MODAL SELECTOR ESTILO + LUMI GATE) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/empezar.html'); await cdp.evalJs('localStorage.clear(); sessionStorage.clear();'); await cdp.goto('/empezar.html');
  await assertLumiVisible(cdp, 'Mobile Acto 1', 60, ok);
  await cdp.evalJs("document.getElementById('btn-skip-lumi-intro')?.click()"); await wait(250);
  await assertLumiVisible(cdp, 'Mobile Paso 1', 60, ok);
  await cdp.evalJs("(()=>{window.scrollTo(0,0);const s=window.TucuEmpezarApp.getState();Object.assign(s,{comercio:'Barberia Norte',slug:'barberia-norte',rubro:'peluqueria',coverMode:'temp',coverId:'temp_peluqueria',direccion:'25 de Mayo 480',direccionLat:'-26.82',direccionLng:'-65.20',geoVerified:true,titularNombre:'Julio',titularApellido:'Sosa',whatsapp:'3815554321',step:10});window.TucuEmpezarApp.renderAll();})()"); await wait(240);
  await assertLumiVisible(cdp, 'Mobile Paso 10', 60, ok);
  const mobP10 = await cdp.evalJs("(()=>{const c=document.getElementById('emp-step10-mobile-style-preview');const r=c?.getBoundingClientRect();return{tf:getComputedStyle(c).transform,w:Math.round(r?.width||0),h:Math.round(r?.height||0),ov:document.documentElement.scrollWidth<=document.documentElement.clientWidth};})()");
  await cdp.evalJs("document.getElementById('btn-open-mobile-preview')?.click()"); await wait(160);
  await cdp.evalJs("document.querySelector('[data-emp-modal-cover-style=\"bento\"]')?.click()"); await wait(140);
  const modalSync = await cdp.evalJs("({chips:document.querySelectorAll('#emp-modal-style-bar [data-emp-modal-cover-style]').length,style:window.TucuEmpezarApp.getState().coverStyle})");
  await cdp.evalJs("document.getElementById('btn-close-mobile-preview')?.click()"); await wait(100);
  ok(mobP10.ov && mobP10.tf.includes('matrix') && mobP10.h > 300 && modalSync.chips === 3 && modalSync.style === 'bento', `Mobile P10 proporcional (${mobP10.w}x${mobP10.h}), modal 3 estilos y sync=${modalSync.style}`);

  await cdp.evalJs("const t=document.getElementById('emp-terms');t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('btn-empezar-submit')?.click();"); await wait(550);
  await assertLumiVisible(cdp, 'Mobile Paso 11', 60, ok);
  ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 local (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
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
    if (cdp.errors.length || cdp.httpBad.length) console.error('DETAILS:', cdp.errors, cdp.httpBad);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO BLOQUE 2B: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });