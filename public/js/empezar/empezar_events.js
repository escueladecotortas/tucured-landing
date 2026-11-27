// Archivo: public/js/empezar/empezar_events.js
// Manejadores de eventos Pasos 1-11: ideas gratuitas, IA separada, T&C modal, scroll top y 2 estados P11 (< 170L)

window.TucuEmpezarEvents = (function () {
  const S = () => window.TucuEmpezarState, M = () => window.TucuEmpezarMedia, C = () => window.TucuEmpezarCovers;
  const Pay = () => window.TucuEmpezarCheckoutUI, Srv = () => window.TucuEmpezarServicesStep, Mascot = () => window.TucuMascot;
  const Assist = () => window.TucuEmpezarTaglineAssist, Sub = () => window.TucuEmpezarSubmit, Micro = () => window.TucuEmpezarMicroSteps;
  const Mp = () => window.TucuEmpezarMpBrick, Step11 = () => window.TucuEmpezarStep11;
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'auto' });

  async function finalizeOrder(ctx, viaMp) {
    const { state, renderAll } = ctx;
    state.submitting = true; state.error = '';
    if (viaMp) {
      state.paidViaMp = true; state.paymentStatus = 'paid';
      if (state.coverMode !== 'custom' && state.coverMode !== 'temp') await C()?.lockCover?.(state.coverId, state.slug, state.comercio, state.rubro, 'mp');
    } else {
      state.paidViaMp = false; state.paymentStatus = 'pending_transfer';
    }
    if (!viaMp) renderAll('', { updateMascot: false });
    try {
      const res = await Sub().submitLead(state, M().getFiles());
      state.submitting = false; state.submitted = true; state.step = 11;
      scrollTop();
      renderAll(res.localActivarHref || res.activarUrl, { animateStep: true });
      if (viaMp) {
        Step11()?.launchConfetti?.(S().getEffectiveAccent(state).bg);
        Mascot()?.setMood?.('celebrate', '¡Pago acreditado! Tu App ya está en marcha.');
      } else {
        Mascot()?.setMood?.('wink', '¡Tu diseño y link quedaron reservados por 24 horas!');
      }
    } catch (ex) {
      state.submitting = false; state.error = ex?.message || 'No pudimos completar el envío. Intentá nuevamente.';
      renderAll('', { updateMascot: false });
    }
  }

  async function handleTaglineClick(el, ctx) {
    const { state, renderAll } = ctx;
    if (el.closest('[data-emp-tagline-kw]')) {
      const kw = el.closest('[data-emp-tagline-kw]').dataset.empTaglineKw, list = Array.isArray(state.keywords) ? [...state.keywords] : [];
      const i = list.indexOf(kw); if (i >= 0) list.splice(i, 1); else if (list.length < 3) list.push(kw);
      state.keywords = list; return renderAll('', { updateMascot: false });
    }
    if (el.closest('#btn-emp-phrases-next')) {
      state.phrasePage = (Number(state.phrasePage) || 0) + 1;
      return renderAll('', { updateMascot: false });
    }
    if (el.closest('#btn-emp-ai-run')) {
      if (Assist().getRemaining() <= 0) {
        Mascot()?.setMood?.('advisor', 'Usaste tus 5 ideas con IA; podés elegir ideas curadas o escribir tu frase.');
        return renderAll('', { updateMascot: false });
      }
      state.aiLoading = true; state.aiFeedback = ''; renderAll('', { updateMascot: false });
      Mascot()?.setMood?.('thinking', 'Estoy pensando una frase corta con tu identidad...');
      const res = await Assist().requestAiTagline(state);
      state.aiLoading = false;
      if (res.ok && res.tagline) {
        state.aiSuggestion = res.tagline;
        state.aiHistory = [...new Set([...(state.aiHistory || []), res.tagline])].slice(-12);
        state.aiFeedback = `Propuesta lista · te quedan ${res.remaining} de 5.`;
        renderAll('', { updateMascot: false });
        return Mascot()?.setMood?.('wink', 'Compará la propuesta de la IA y tocá "Usar esta frase" si te gusta.');
      }
      renderAll('', { updateMascot: false });
      return Mascot()?.setMood?.('advisor', 'Usaste tus 5 ideas con IA; podés elegir ideas curadas o escribir tu propia frase.');
    }
    if (el.closest('#btn-emp-ai-use')) {
      if (!state.aiSuggestion) return;
      state.previousBajada = state.bajada || state.previousBajada || '';
      state.bajada = Assist().clipTagline(state.aiSuggestion);
      state.bajadaManual = false; state.taglineFromAi = true; state.noTagline = false;
      renderAll('', { updateMascot: false, highlightSelector: '#preview-tagline' });
      return Mascot()?.setMood?.('celebrate', '¡Listo! Aplicamos la frase sugerida en tu portada.');
    }
    if (el.closest('#btn-emp-no-tagline')) { state.noTagline = !state.noTagline; return renderAll('', { updateMascot: false, highlightSelector: '#preview-phone-chassis' }); }
    if (el.closest('[data-emp-tagline-idea]')) {
      state.previousBajada = state.bajada || state.previousBajada || '';
      state.bajada = el.closest('[data-emp-tagline-idea]').dataset.empTaglineIdea;
      state.bajadaManual = false; state.taglineFromAi = false; state.noTagline = false;
      return renderAll('', { updateMascot: false, highlightSelector: '#preview-tagline' });
    }
  }

  async function handleClick(e, ctx) {
    const { state, renderAll, refreshAutoAccent, goNext, showInlineError, mountMpIfNeeded } = ctx;
    const el = e.target, b = (sel) => el.closest(sel);
    if (b('[data-emp-tagline-kw], #btn-emp-phrases-next, #btn-emp-ai-run, #btn-emp-ai-use, #btn-emp-no-tagline, [data-emp-tagline-idea]')) return handleTaglineClick(el, ctx);
    const srvRes = Srv()?.handleClick?.(e, state);
    if (srvRes?.handled) { Pay()?.saveWizardSnapshot?.(state); if (srvRes.rerender) renderAll('', { updateMascot: false, highlightSelector: '#preview-service-chip' }); return; }
    if (b('#btn-open-terms-modal')) { window.TucuEmpezarTermsModal?.open?.(); return; }
    if (b('[data-emp-rubro]')) {
      const nextRubro = b('[data-emp-rubro]').dataset.empRubro;
      if (state.rubro !== nextRubro) { state.keywords = []; state.bajada = ''; state.previousBajada = ''; state.aiSuggestion = ''; state.aiHistory = []; state.phrasePage = 0; state.taglineFromAi = false; state.coverTouched = false; }
      state.rubro = nextRubro; state.rubroSelected = true; state.specialties = [];
      if (state.accentMode === 'manual') { state.accent = state.rubro; state.customAccentHex = ''; }
      C().resetPage(); state.coverId = C().getDefaultCoverForRubro(state.rubro)?.id || ''; state.coverMode = 'live';
      Srv()?.ensureServicesForRubro?.(state); state.error = ''; renderAll('', { updateMascot: true }); return refreshAutoAccent();
    }
    if (b('[data-emp-spec]')) {
      const sp = b('[data-emp-spec]').dataset.empSpec, list = [...(state.specialties || [])], i = list.indexOf(sp);
      if (i >= 0) list.splice(i, 1); else list.push(sp);
      state.specialties = list; state.phrasePage = 0;
      if (!state.serviciosTouched) state.servicios = Srv()?.getDefaultServices?.(state.rubro, state.specialties) || state.servicios;
      return renderAll('', { updateMascot: false });
    }
    if (b('#btn-emp-cover-prev')) { C().stepPage(-1, state.rubro, state.specialties); return renderAll('', { updateMascot: false }); }
    if (b('#btn-emp-cover-next')) { C().stepPage(1, state.rubro, state.specialties); return renderAll('', { updateMascot: false }); }
    if (b('[data-emp-cover-media]')) { state.coverMode = b('[data-emp-cover-media]').dataset.empCoverMedia; return renderAll('', { updateMascot: false }); }
    if (b('[data-emp-select-custom]')) { state.coverMode = 'custom'; state.coverId = 'custom'; state.coverTouched = true; renderAll('', { updateMascot: false, highlightSelector: '#preview-phone-chassis' }); return refreshAutoAccent(); }
    if (b('[data-emp-cover-style]')) { state.coverStyle = b('[data-emp-cover-style]').dataset.empCoverStyle; return renderAll('', { updateMascot: false, highlightSelector: '#preview-phone-chassis' }); }
    if (b('#btn-emp-cover-temp')) { state.coverMode = 'temp'; state.coverId = `temp_${state.rubro || 'negocio'}`; state.coverTouched = true; renderAll('', { updateMascot: true, highlightSelector: '#preview-phone-chassis' }); return refreshAutoAccent(); }
    if (b('[data-emp-cover-id]')) { state.coverId = b('[data-emp-cover-id]').dataset.empCoverId; state.coverMode = state.coverMode === 'still' ? 'still' : 'live'; state.coverTouched = true; renderAll('', { updateMascot: false, highlightSelector: '#preview-phone-chassis' }); Mascot()?.setMood?.('celebrate', '¡Hermosa portada! Queda reservada para tu marca al confirmar.'); return refreshAutoAccent(); }
    if (b('[data-emp-accent]')) { const v = b('[data-emp-accent]').dataset.empAccent; state.accentMode = v === 'auto' ? 'auto' : 'manual'; if (v !== 'auto') { state.accent = v; state.customAccentHex = ''; } state.error = ''; return renderAll('', { updateMascot: true, highlightSelector: '#preview-cta-btn' }); }
    if (b('#btn-clear-logo')) { M().clearMedia('logo'); renderAll('', { updateMascot: false }); return refreshAutoAccent(); }
    if (b('[data-emp-sched]')) {
      const m = b('[data-emp-sched]').dataset.empSched; state.horarioModalidad = m;
      if (m === 'partido') { state.open1 = '09:00'; state.close1 = '13:00'; state.open2 = '17:00'; state.close2 = '21:00'; }
      else { state.open1 = '09:00'; state.close1 = '20:00'; }
      return renderAll('', { updateMascot: true, highlightSelector: '#preview-schedule' });
    }
    if (b('[data-emp-plan]')) { state.plan = b('[data-emp-plan]').dataset.empPlan; return renderAll('', { updateMascot: false, highlightSelector: '#preview-plan-badge' }); }
    if (b('[data-emp-slug-suggestion]')) { state.slug = b('[data-emp-slug-suggestion]').dataset.empSlugSuggestion; state.slugTouched = true; state.slugCheck = { status: 'available', slug: state.slug, suggestions: [] }; return renderAll('', { updateMascot: false, highlightSelector: '#preview-domain-pill' }); }
    if (b('[data-emp-jump-step]')) { state.returnToSummary = true; state.step = Number(b('[data-emp-jump-step]').dataset.empJumpStep) || 1; state.error = ''; Mp()?.unmount?.(); scrollTop(); return renderAll('', { animateStep: true }); }
    if (b('#btn-emp-return-summary')) { const err = Micro()?.validateStep?.(state.step, state) || ''; if (err) return showInlineError(err); state.returnToSummary = false; state.step = 10; state.error = ''; scrollTop(); renderAll('', { animateStep: true }); return mountMpIfNeeded(); }
    if (b('[data-emp-pay-method]')) { state.paymentMethod = b('[data-emp-pay-method]').dataset.empPayMethod === 'mp' ? 'mp' : 'transfer'; if (state.paymentMethod !== 'mp') Mp()?.unmount?.(); renderAll('', { updateMascot: false }); return mountMpIfNeeded(); }
    if (b('#btn-emp-copy-alias')) return Pay()?.copyAlias?.(b('#btn-emp-copy-alias'));
    if (b('#btn-emp-copy-link')) { try { await navigator.clipboard.writeText(`https://${state.slug}.tucured.com.ar`); } catch {} const l = document.getElementById('emp-copy-link-label'); if (l) { l.textContent = 'Link copiado'; setTimeout(() => { l.textContent = 'Copiar mi link'; }, 2200); } return; }
    if (b('#btn-emp-prev')) { state.error = ''; state.stepDir = 'prev'; state.step = Math.max(1, state.step - 1); if (state.step === 5 || state.step === 6) state.previewMode = 'cover'; Mp()?.unmount?.(); scrollTop(); return renderAll('', { animateStep: true }); }
    if (b('#btn-emp-next')) return goNext();
    if (b('#btn-empezar-submit')) {
      const err = Micro()?.validateStep?.(10, state) || '';
      if (err) { showInlineError(err); return Mascot()?.setMood?.('advisor', 'Tildá la casilla de Términos y Condiciones justo arriba para confirmar tu reserva.'); }
      if (state.coverMode !== 'custom' && state.coverMode !== 'temp') {
        const lock = await C().lockCover(state.coverId, state.slug, state.comercio, state.rubro, 'transfer');
        if (!lock.ok && lock.conflict) { showInlineError('Esa portada acaba de reservarse recién. Elegí otra para tu marca en el Paso 3.'); return Mascot()?.setMood?.('advisor', 'Esa portada ya fue tomada recién; usá Cambiar en Portada para elegir otra libre.'); }
      }
      return finalizeOrder(ctx, false);
    }
  }

  return { handleClick, finalizeOrder };
})();