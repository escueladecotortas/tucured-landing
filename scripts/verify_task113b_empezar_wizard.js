// Archivo: scripts/verify_task113b_empezar_wizard.js
// Suite QA + E2E [TASK-113B]: Mascota flotante real (.webm/.webp), header pulido, 10 micro-pantallas y herencia (< 170L)

import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import { PORT_APP, PORT_CDP, BASE, CHROME, wait, reqJson, Cdp, runStaticAudit, runIndexFunnelCheck, runMobile } from './verify_task113b_helpers.js';

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));

async function runDesktop(cdp) {
  console.log('\n=== 3. E2E DESKTOP 1280x800 (HEADER + MASCOT FLOTANTE + 10 MICRO-PANTALLAS + HERENCIA) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/empezar.html?plan=l2&rubro=estetica');
  for (let t = 0; t < 35; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('emp-comercio') && document.getElementById('tucu-mascot-layer'))`)) break; await wait(120); }

  const res = await cdp.evalJs(`(async () => {
    const w = (ms=80) => new Promise(r => setTimeout(r, ms));
    localStorage.removeItem('tucu_empezar_draft_v2'); localStorage.removeItem('local_db_wizard');
    const hdr = document.getElementById('emp-header'), barWrap = document.getElementById('emp-progress-bar')?.parentElement;
    const hdrRect = hdr.getBoundingClientRect(), barRect = barWrap.getBoundingClientRect();
    const headerDupText = hdr.innerText.includes('TucuRed');
    const layer = document.getElementById('tucu-mascot-layer'), actor = document.getElementById('tucu-mascot-actor');
    const oldSvg = Boolean(document.getElementById('tucu-mascot-svg'));
    const clipSrcs = [...actor.querySelectorAll('.tucu-m-clip source, .tucu-m-clip')].map(el => el.getAttribute('src') || '').filter(Boolean);
    const introActive = actor.querySelector('[data-clip="intro"]')?.classList.contains('is-active');
    window.TucuMascot.setMood('thinking', 'Verificando prueba...'); await w(40);
    const thinkingActive = actor.querySelector('[data-clip="thinking"]')?.classList.contains('is-active');
    window.TucuMascot.setMood('attentive'); await w(40);
    const idleActive = actor.querySelector('[data-clip="idle"]')?.classList.contains('is-active');
    await w(380);
    const mascotLine1 = document.getElementById('tucu-mascot-line')?.innerText || '';
    const stageBarText = document.getElementById('emp-stage-bar')?.innerText || '';
    const hasPaso10Text = document.body.innerText.includes('Paso 1 de 10');
    const bizInp = document.getElementById('emp-comercio');
    bizInp.value = 'Siena Spa'; bizInp.dispatchEvent(new Event('input', { bubbles: true }));
    bizInp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await w(80);
    const step2Heading = document.querySelector('#empezar-step-mount h2')?.innerText || '';
    document.querySelector('[data-emp-rubro="estetica"]').click(); await w(60);
    const celebrateActive = actor.querySelector('[data-clip="celebrate"]')?.classList.contains('is-active');
    document.getElementById('btn-emp-next').click(); await w(80);
    document.querySelector('[data-emp-cover-tab="dia"]').click(); await w(40); const dayCount = document.querySelectorAll('[data-emp-cover-id]').length;
    document.querySelector('[data-emp-cover-tab="nocturno"]').click(); await w(40); const nightCount = document.querySelectorAll('[data-emp-cover-id]').length;
    document.querySelector('[data-emp-cover-tab="custom"]').click(); await w(40);
    const mkImg = async (W, H, fill) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d'); cx.fillStyle = fill; cx.fillRect(0, 0, W, H); return await new Promise(r => cv.toBlob(r, 'image/png')); };
    const up = async (id, W, H, fill, name) => { const b = await mkImg(W, H, fill), dt = new DataTransfer(); dt.items.add(new File([b], name, { type: 'image/png' })); const el = document.getElementById(id); el.files = dt.files; el.dispatchEvent(new Event('change', { bubbles: true })); };
    await up('emp-cover-input', 200, 200, '#15803D', 'small.png'); await w(120);
    const smallErr = document.getElementById('emp-error')?.innerText || '';
    await up('emp-cover-input', 900, 600, '#0F766E', 'cover.png'); await w(180);
    const coverSlot = window.TucuEmpezarMedia.getSlot('cover');
    document.getElementById('btn-emp-next').click(); await w(60);
    const autoOn = document.querySelector('[data-emp-accent="auto"]')?.getAttribute('aria-pressed');
    const cAuto1 = document.getElementById('preview-cta-btn')?.dataset?.accent;
    await up('emp-logo-input', 400, 400, '#4338CA', 'logo.png'); await w(220);
    const cAutoLogo = document.getElementById('preview-cta-btn')?.dataset?.accent;
    document.getElementById('btn-emp-next').click(); await w(60);
    const f0 = document.getElementById('emp-bajada')?.value;
    document.getElementById('btn-emp-next-phrase').click(); await w(40);
    const f1 = document.getElementById('emp-bajada')?.value;
    document.getElementById('btn-emp-toggle-ai').click(); await w(40);
    const aiCounterBefore = document.getElementById('emp-ai-remaining')?.innerText || '';
    const origFetch = window.fetch; window.__adopted = null;
    window.fetch = async (url, opts = {}) => {
      const u = String(url);
      if (u.includes('/api/ai/tagline/adopt')) { window.__adopted = JSON.parse(opts.body); return new Response('{"ok":true}', { status: 200 }); }
      if (u.includes('/api/ai/tagline')) return new Response(JSON.stringify({ ok: true, tagline: 'Tu estética boutique con agenda online al instante.', source: 'groq', remaining: 4 }), { status: 200 });
      if (u.includes('/api/portal/check-slug/')) {
        if (u.endsWith('/ocupado-demo')) return new Response(JSON.stringify({ ok: true, slug: 'ocupado-demo', available: false, reason: 'taken', suggestions: ['ocupado-demo-tuc', 'ocupado-demo-ar'] }), { status: 200 });
        return new Response(JSON.stringify({ ok: true, slug: u.split('/').pop(), available: true, reason: null, suggestions: [] }), { status: 200 });
      }
      if (u.includes('/empezar-ok.html')) return new Response('<!-- NETLIFY_FORM_ACCEPTED -->', { status: 200 });
      if (u.includes('/api/wa-welcome')) return new Response('{"ok":true}', { status: 200 });
      return origFetch(url, opts);
    };
    document.getElementById('btn-emp-ai-run').click(); await w(120);
    const aiText = document.getElementById('emp-bajada')?.value || '', aiCounterAfter = document.getElementById('emp-ai-remaining')?.innerText || '';
    document.getElementById('btn-emp-next').click(); await w(60);
    const dirInp = document.getElementById('emp-direccion'); dirInp.value = 'Laprida 310'; dirInp.dispatchEvent(new Event('input', { bubbles: true }));
    const openInp = document.getElementById('emp-open1'), closeInp = document.getElementById('emp-close1');
    const isTimeInp = openInp?.type === 'time' && closeInp?.type === 'time';
    openInp.value = '07:30'; openInp.dispatchEvent(new Event('input', { bubbles: true }));
    closeInp.value = '21:30'; closeInp.dispatchEvent(new Event('input', { bubbles: true }));
    const prevSched = document.getElementById('preview-schedule')?.innerText || '', prevStatus = document.getElementById('preview-status-line')?.innerText || '';
    document.getElementById('btn-emp-next').click(); await w(60);
    const initialSrvCount = document.querySelectorAll('.emp-srv-row').length;
    document.querySelector('[data-emp-del-srv]')?.click(); await w(30);
    document.querySelector('[data-emp-del-srv]')?.click(); await w(30);
    const singleSrvCount = document.querySelectorAll('.emp-srv-row').length;
    const srvName = document.getElementById('emp-srv-name-0'); srvName.value = 'Limpieza VIP'; srvName.dispatchEvent(new Event('input', { bubbles: true }));
    const srvPrice = document.getElementById('emp-srv-price-0'); srvPrice.value = '18500'; srvPrice.dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('emp-assist-check')?.click(); await w(30);
    const assistFlagOn = window.TucuEmpezarApp.getState().asistenciaCarga === 'whatsapp_email';
    document.getElementById('emp-assist-check')?.click(); await w(30);
    document.getElementById('btn-emp-prev').click(); await w(50);
    document.getElementById('btn-emp-next').click(); await w(50);
    const srvPersisted = document.getElementById('emp-srv-name-0')?.value === 'Limpieza VIP' && document.querySelectorAll('.emp-srv-row').length === 1;
    const previewChip = document.getElementById('preview-service-chip')?.innerText || '';
    document.getElementById('btn-emp-next').click(); await w(60);
    const slugEl = document.getElementById('emp-slug'), slugMaxAttr = slugEl?.getAttribute('maxlength');
    slugEl.value = 'ocupado-demo'; slugEl.dispatchEvent(new Event('input', { bubbles: true })); await w(520);
    const takenMsg = document.getElementById('emp-slug-status')?.innerText || '';
    const suggBtn = document.querySelector('[data-emp-slug-suggestion]'), suggVal = suggBtn?.dataset?.empSlugSuggestion || '';
    suggBtn?.click(); await w(40);
    const slugAfterSugg = document.getElementById('emp-slug')?.value;
    document.getElementById('btn-emp-next').click(); await w(60);
    const setV = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
    setV('emp-first', 'Sofía'); setV('emp-last', 'Paz'); setV('emp-whatsapp', '3815554321'); setV('emp-email', 'sofia@siena.ar');
    document.getElementById('btn-emp-next').click(); await w(60);
    document.getElementById('btn-empezar-submit').click(); await w(120);
    const laterTxt = document.getElementById('btn-emp-later')?.innerText || '', gotoTxt = document.getElementById('btn-goto-activar')?.innerText || '';
    const hasHomeLeak = document.getElementById('emp-success-view')?.innerText.includes('Volver al inicio');
    document.getElementById('btn-emp-later')?.click(); await w(30);
    return {
      headerDupText, barAtBottom: Math.abs(barRect.bottom - hdrRect.bottom) <= 2 && barRect.width >= hdrRect.width - 2,
      layerNoPointer: getComputedStyle(layer).pointerEvents === 'none' && getComputedStyle(actor).pointerEvents === 'none',
      oldSvg, hasClips: clipSrcs.some(s => s.includes('/assets/mascot/')), introActive, thinkingActive, idleActive, celebrateActive,
      mascotLine1, stageBarText, hasPaso10Text, step2Heading, dayCount, nightCount, smallErr,
      coverSlotType: coverSlot?.file?.type, coverKb: coverSlot?.kb, autoOn, cAuto1, cAutoLogo,
      f0, f1, aiCounterBefore, aiText, aiCounterAfter, isTimeInp, prevSched, prevStatus,
      initialSrvCount, singleSrvCount, assistFlagOn, srvPersisted, previewChip,
      slugMaxAttr, takenMsg, suggVal, slugAfterSugg, adopted: window.__adopted,
      laterTxt, gotoTxt, hasHomeLeak, laterNoticeVisible: !document.getElementById('emp-later-notice')?.classList.contains('hidden'),
      actHref: document.getElementById('btn-goto-activar')?.getAttribute('href') || ''
    };
  })()`);

  ok(!res.headerDupText && res.barAtBottom, 'Header sin texto TucuRed duplicado y barra de progreso en borde inferior');
  ok(res.layerNoPointer && !res.oldSvg && res.hasClips && res.introActive && res.thinkingActive && res.idleActive && res.celebrateActive, 'Mascota flotante pointer-events:none (0 SVG viejo) con intro/idle/thinking/celebrate reales');
  ok(res.mascotLine1.length > 10 && res.stageBarText.includes('1. Tu Marca') && res.stageBarText.includes('4. Tu Lanzamiento') && !res.hasPaso10Text, 'Subtítulo tipeado + barra 4 etapas humanas (sin Paso 1 de 10)');
  ok(res.step2Heading.includes('rubro'), 'Enter en pantalla 1 avanza a micro-pantalla 2');
  ok(res.dayCount === 6 && res.nightCount === 6 && res.smallErr.includes('800x450') && res.coverSlotType === 'image/webp' && res.coverKb <= 120, 'Portadas 6 Día / 6 Nocturno + rechazo 200x200 + WebP <= 120KB');
  ok(res.autoOn === 'true' && res.cAuto1 && res.cAutoLogo && res.cAutoLogo !== res.cAuto1, 'Color Automático activo y reacciona al logo');
  ok(res.f0 !== res.f1 && res.aiCounterBefore.includes('5 de 5') && res.aiText.includes('boutique') && res.aiCounterAfter.includes('4 de 5'), 'Banco 360 rota frases y Panel IA cuota 5->4');
  ok(res.isTimeInp && res.prevSched.includes('07:30 a 21:30') && res.prevStatus.includes('21:30'), 'Horarios <input type="time"> reflejados en vivo');
  ok(res.initialSrvCount === 3 && res.singleSrvCount === 1 && res.assistFlagOn && res.srvPersisted && res.previewChip.includes('Limpieza VIP'), 'Servicios flexibles (1 solo servicio + respaldo WhatsApp/Email + persistencia Atrás)');
  ok(res.slugMaxAttr === '24' && res.takenMsg.includes('Ya está en uso') && res.slugAfterSugg === res.suggVal, 'Slug max 24, ocupado + sugerencia clicable');
  ok(res.adopted?.tagline === res.aiText && res.gotoTxt.includes('Configurar más detalles ahora') && res.laterTxt === 'Completar más tarde' && !res.hasHomeLeak && res.laterNoticeVisible, 'Post-alta /adopt, CTAs oficiales y Completar más tarde sin fuga');

  await cdp.goto(res.actHref);
  for (let t = 0; t < 20; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('activar-inherited-banner'))`)) break; await wait(100); }
  const actCheck = await cdp.evalJs(`({ banner: document.getElementById('activar-inherited-banner')?.innerText || '', srvVal: document.querySelector('#act-services-list .act-srv-name')?.value || '' })`);
  ok(actCheck.banner.includes('Siena Spa') && actCheck.srvVal === 'Limpieza VIP', 'Puente hacia /activar.html hereda comercio y servicios iniciales');
}

async function isPortUp() {
  return new Promise(r => { const q = http.get(BASE + '/', res => { res.resume(); r(true); }); q.on('error', () => r(false)); });
}

async function main() {
  runStaticAudit(ok);
  const alreadyUp = await isPortUp();
  const preview = alreadyUp ? null : spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-113b'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { if (await isPortUp()) break; await wait(200); }
    let targets = []; for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl); await cdp.connect();
    await runIndexFunnelCheck(cdp, ok); await runDesktop(cdp); await runMobile(cdp, ok);
    ok(cdp.errors.length === 0 && cdp.httpBad.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpBad.length})`);
    cdp.close();
  } finally { chrome.kill('SIGKILL'); if (preview) preview.kill('SIGKILL'); await wait(250); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {} }
  console.log(`\nRESULTADO FINAL [TASK-113B]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
