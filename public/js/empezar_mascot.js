// Archivo: public/js/empezar_mascot.js
// Controlador conversacional de Lumi v2 (LUMI · TU GUIA TUCURED, Acto 1->2 y mapeo exacto 1-11) (< 170L)

(function (global) {
  const SESSION_INTRO_KEY = 'tucu_lumi_intro_played_v2';
  const STEP_LINES = {
    1: 'Hola, soy Lumi. Contame el nombre de tu negocio para empezar.',
    2: 'Elegí tu rubro y especialidades para adaptar el diseño a tu actividad.',
    3: 'Elegí una portada exclusiva para tu negocio o subí tu propia foto.',
    4: 'Sumá tu logo sobre blanco y definí el color que te identifica.',
    5: 'Definí una frase corta que cuente lo que hace especial a tu lugar.',
    6: 'Contame dónde está tu local y en qué horarios recibís turnos.',
    7: 'Sumá tus primeros servicios o elegí mandarnos tu lista por WhatsApp.',
    8: 'Elegí solo lo que tu negocio necesita hoy; si más adelante crecés, podés cambiar de plan sin perder nada.',
    9: 'Dejanos tu nombre y WhatsApp para activar tu portada y enviarte los accesos.',
    10: 'Revisá el resumen completo, elegí cómo abonar y activá tu Mes Fundador.',
    11: '¡Felicitaciones! Tu App ya está en marcha y lista para compartir.'
  };

  let typingTimer = null;
  let moodRevertTimer = null;
  let currentLineText = '';
  let currentAction = null;
  let adviceApiRef = null;

  function renderDock(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="wg-card rounded-3xl px-4 py-3.5 flex items-center gap-3 sm:gap-4">
        <div id="tucu-mascot-anchor" class="w-[74px] h-[74px] sm:w-[92px] sm:h-[92px] shrink-0 relative"></div>
        <div class="min-w-0 flex-1 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#EA580C]">LUMI · TU GUÍA TUCURED</span>
            <button type="button" id="btn-lumi-advice" class="wg-pill px-3 py-1 rounded-full text-[11px] font-semibold text-stone-700 hover:bg-[#EAE1D6] cursor-pointer transition-colors">
              Pedime un consejo
            </button>
          </div>
          <p id="tucu-mascot-line" class="text-sm sm:text-[15px] font-medium text-stone-800 leading-snug min-h-[2.4em]"></p>
          <div id="lumi-advice-action" class="hidden pt-0.5"></div>
        </div>
      </div>`;
  }

  function typeText(text) {
    const el = document.getElementById('tucu-mascot-line');
    if (!el || !text) return;
    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
    if (currentLineText === text && el.textContent === text) return;
    currentLineText = text;
    let idx = 0;
    el.textContent = '';
    typingTimer = setInterval(() => {
      idx += 3;
      el.textContent = text.slice(0, idx);
      if (idx >= text.length) {
        el.textContent = text;
        clearInterval(typingTimer);
        typingTimer = null;
      }
    }, 18);
  }

  function setAdviceAction(label, handler) {
    const host = document.getElementById('lumi-advice-action');
    if (!host) return;
    currentAction = typeof handler === 'function' ? handler : null;
    if (!label || !currentAction) {
      host.classList.add('hidden');
      host.innerHTML = '';
      return;
    }
    host.classList.remove('hidden');
    host.innerHTML = `<button type="button" id="btn-lumi-apply-advice" class="wg-btn-ai px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">${label}</button>`;
    document.getElementById('btn-lumi-apply-advice')?.addEventListener('click', () => {
      if (currentAction) currentAction(adviceApiRef);
    });
  }

  function setMood(mood, customLine) {
    if (moodRevertTimer) { clearTimeout(moodRevertTimer); moodRevertTimer = null; }
    const stage = global.TucuMascotStage;
    const isTransient = mood === 'intro' || mood === 'celebrate' || mood === 'wink';
    if (stage) {
      stage.setClip(mood || 'idle', {
        anchor: 'header',
        onEnded: isTransient ? () => stage.setClip('idle', { anchor: 'header' }) : null
      });
    }
    if (customLine) typeText(customLine);
    if (isTransient) {
      moodRevertTimer = setTimeout(() => { stage?.setClip('idle', { anchor: 'header' }); }, 3200);
    }
  }

  function setStep(stepIndex, state) {
    const step = Number(stepIndex) || 1;
    const radar = global.TucuLumiAdvisor?.evaluateRadar?.(step, state);
    const line = radar?.line || STEP_LINES[step] || STEP_LINES[1];
    setAdviceAction(radar?.actionLabel || '', radar?.apply || null);
    setMood(radar?.mood === 'advisor' && step === 6 ? 'advisor' : 'idle', line);
  }

  function triggerAdvice(stepIndex, state) {
    const step = Number(stepIndex) || 1;
    const radar = global.TucuLumiAdvisor?.evaluateRadar?.(step, state);
    const text = radar?.advice || STEP_LINES[step] || STEP_LINES[1];
    setAdviceAction(radar?.actionLabel || '', radar?.apply || null);
    setMood('advisor', text);
  }

  function playIntroSequence(stepMountEl, hasSavedDraft, onFinish) {
    const dockMount = document.getElementById('empezar-mascot-mount');
    const already = sessionStorage.getItem(SESSION_INTRO_KEY) === '1';
    if (hasSavedDraft || already || !stepMountEl) {
      dockMount?.classList.remove('hidden');
      global.TucuMascotStage?.setClip('idle', { anchor: 'header' });
      onFinish?.();
      return;
    }
    sessionStorage.setItem(SESSION_INTRO_KEY, '1');
    dockMount?.classList.add('hidden');
    stepMountEl.innerHTML = `
      <div id="lumi-intro-stage-anchor" class="wg-card rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-3.5">
        <img src="/assets/tucu_red_logo.svg" alt="TucuRed" class="h-7 sm:h-8 w-auto mx-auto" />
        <div id="lumi-intro-media-slot" class="w-36 h-36 sm:w-44 sm:h-44 mx-auto relative lumi-intro-emerge"></div>
        <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#EA580C]">LUMI · TU GUÍA TUCURED</span>
        <h2 class="font-headline font-extrabold text-xl sm:text-2xl text-stone-900">Hola, vamos a crear el turnero de tu negocio</h2>
        <p class="text-sm text-stone-600 max-w-md">Avanzamos con una decisión simple por pantalla mientras ves todo en vivo en tu celular.</p>
        <button type="button" id="btn-skip-lumi-intro" class="wg-btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold cursor-pointer">Empezar ahora</button>
      </div>`;
    global.TucuMascotStage?.setClip('intro', { anchor: 'center' });
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      dockMount?.classList.remove('hidden');
      stepMountEl.classList.add('tucu-step-enter');
      global.TucuMascotStage?.setClip('idle', { anchor: 'header' });
      onFinish?.();
    };
    document.getElementById('btn-skip-lumi-intro')?.addEventListener('click', finish);
    setTimeout(finish, 3100);
  }

  function init(container, opts) {
    adviceApiRef = opts?.adviceApi || null;
    renderDock(container);
    global.TucuMascotStage?.mountLayer();
    global.TucuMascotStage?.setClip('idle', { anchor: 'header' });
    document.getElementById('btn-lumi-advice')?.addEventListener('click', () => {
      opts?.onAdviceClick?.();
    });
  }

  global.TucuMascot = { init, setStep, setMood, typeText, setAdviceAction, triggerAdvice, playIntroSequence };
})(window);