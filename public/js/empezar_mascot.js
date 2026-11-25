// Archivo: public/js/empezar_mascot.js
// Orquestador de subtítulos tipeados y estados de la mascota flotante en /empezar.html (< 145L)

window.TucuMascot = (function () {
  const Stage = () => window.TucuMascotStage;
  let lineEl = null;
  let typeTimer = null;
  let currentMood = 'wake';
  let userInteracted = false;

  const isReducedMotion = () =>
    typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  function getScriptForStep(stepIndex, state = {}) {
    const rawName = (state.comercio || '').trim();
    const biz = rawName || 'tu comercio';
    const hasName = Boolean(rawName);
    const scripts = {
      1: '¡Hola! Qué bueno verte por acá. Contame cómo se llama tu negocio y lo hacemos brillar juntos.',
      2: hasName
        ? `Hermoso nombre, ${biz}. ¿En qué rubro recibís a tus clientes todos los días?`
        : '¿En qué rubro recibís a tus clientes todos los días? Elegí el que mejor te represente.',
      3: hasName
        ? `Ahora elegí el clima de ${biz}: tenés 12 portadas vivas de día o noche, o podés subir tu propia foto.`
        : 'Elegí el clima visual de tu App: tenés 12 portadas vivas o podés subir tu foto favorita.',
      4: 'Si querés sumar tu logo, tomamos su color principal en automático para que todo combine.',
      5: hasName
        ? `¿Cómo le habla ${biz} a su gente? Elegí un tono o probá frases nuevas hasta encontrar la tuya.`
        : '¿Cómo querés recibir a tus clientes? Elegí tu tono y una frase que te represente.',
      6: hasName
        ? `Contame dónde queda ${biz} y en qué horarios atendés para que tus clientes reserven al toque.`
        : 'Sumá tu dirección y tus horarios habituales para que tu agenda quede lista.',
      7: 'Armá tus primeros servicios en segundos. Con uno solo ya podés arrancar, o mandarnos tu lista después.',
      8: hasName
        ? `¡Ya casi estamos! Elegí la dirección web de ${biz} y el plan que mejor acompañe tu ritmo.`
        : 'Elegí la dirección web propia de tu comercio y el plan ideal para empezar.',
      9: 'Dejame tus datos de contacto así te enviamos los accesos directos apenas terminemos.',
      10: hasName
        ? `Todo listo para que ${biz} cobre vida. Revisá tu resumen y activá tu Mes Fundador.`
        : 'Todo listo para lanzar tu App. Revisá tu resumen y activá tu Mes Fundador.',
      ready: hasName
        ? `¡Felicitaciones! ${biz} ya tiene su lugar reservado. Ahora podés seguir sumando detalles o seguir tranquilo más tarde.`
        : '¡Felicitaciones! Tu App ya tiene su lugar reservado y podés seguir personalizándola cuando quieras.'
    };
    return scripts[stepIndex] || scripts[1];
  }

  function typeText(text) {
    if (!lineEl) return;
    clearInterval(typeTimer);
    const clean = String(text || '');
    if (isReducedMotion()) { lineEl.textContent = clean; return; }
    let idx = 0;
    lineEl.textContent = '';
    typeTimer = setInterval(() => {
      idx += 1;
      lineEl.textContent = clean.slice(0, idx);
      if (idx >= clean.length) clearInterval(typeTimer);
    }, 26);
  }

  function setMood(mood, customLine = '') {
    const nextMood = mood || 'attentive';
    if (nextMood !== 'wake' && nextMood !== 'intro') userInteracted = true;
    currentMood = nextMood;
    if (customLine) typeText(customLine);

    if (nextMood === 'wake' || nextMood === 'intro') {
      Stage()?.setClip?.('intro', {
        anchor: window.innerWidth >= 1024 ? 'intro' : 'guide',
        onEnded: () => { if (currentMood === nextMood) setMood('attentive'); }
      });
      return;
    }
    if (nextMood === 'thinking') {
      Stage()?.setClip?.('thinking', { anchor: 'guide' });
      return;
    }
    if (nextMood === 'celebrate' || nextMood === 'ready') {
      Stage()?.setClip?.('celebrate', {
        anchor: nextMood === 'celebrate' ? 'celebrate' : 'guide',
        onEnded: () => { if (currentMood === nextMood) setMood('attentive'); }
      });
      return;
    }
    Stage()?.setClip?.('idle', { anchor: 'guide' });
  }

  function setStep(stepIndex, state = {}) {
    const key = state?.submitted ? 'ready' : stepIndex;
    const line = getScriptForStep(key, state);
    if (state?.submitted) return setMood('ready', line);
    if (!userInteracted && stepIndex === 1 && (currentMood === 'wake' || currentMood === 'intro')) {
      typeText(line);
      Stage()?.schedulePosition?.();
      return;
    }
    setMood('attentive', line);
  }

  function init(container) {
    if (!container) return;
    userInteracted = false;
    currentMood = 'wake';
    container.innerHTML = `<div class="flex items-center gap-3 sm:gap-4 py-1">
      <div id="tucu-mascot-slot" class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 pointer-events-none" aria-hidden="true"></div>
      <div class="min-w-0 flex-1 bg-white/95 border border-stone-200 rounded-3xl px-4 py-3 shadow-xs">
        <span class="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-700 mb-0.5">
          <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          <span>Tu asistente TucuRed</span>
        </span>
        <p id="tucu-mascot-line" class="text-xs sm:text-sm font-semibold text-stone-800 leading-snug min-h-[2.4em]"></p>
      </div>
    </div>`;
    lineEl = document.getElementById('tucu-mascot-line');
    Stage()?.mountLayer?.();
    setMood('wake');
  }

  return { init, setStep, setMood };
})();
