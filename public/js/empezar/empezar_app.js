// Archivo: public/js/empezar/empezar_app.js
// Orquestador 10 micro-pantallas /empezar.html: TucuMascot, Servicios, IA Taglines, Color Auto y Slug (< 170L)

(function () {
  const S = () => window.TucuEmpezarState, M = () => window.TucuEmpezarMedia, P = () => window.TucuEmpezarPreview;
  const UI = () => window.TucuEmpezarSteps, Sub = () => window.TucuEmpezarSubmit, T = () => window.TucuEmpezarTones;
  const C = () => window.TucuEmpezarCovers, Pay = () => window.TucuEmpezarCheckoutUI, Micro = () => window.TucuEmpezarMicroSteps;
  const Srv = () => window.TucuEmpezarServicesStep, Mascot = () => window.TucuMascot;
  const ColorExt = () => window.TucuEmpezarColorExtract, Assist = () => window.TucuEmpezarTaglineAssist, Slug = () => window.TucuEmpezarSlugCheck;

  let state = null, geoTimer = null;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const PIN_SVG = '<svg class="w-3.5 h-3.5 text-stone-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';

  function syncPreview(highlightSel = '') {
    P().render(document.getElementById('empezar-live-preview'), state, highlightSel);
    const mob = document.getElementById('empezar-mobile-preview-mount');
    if (mob && !document.getElementById('empezar-preview-drawer')?.classList.contains('hidden')) P().render(mob, state, highlightSel);
  }

  async function refreshAutoAccent() {
    if (!ColorExt()?.resolveAutoAccent || !state) return;
    const cov = C()?.getCoverById?.(state.coverId) || C()?.getDefaultCoverForRubro?.(state.rubro);
    const coverSlot = M()?.getSlot?.('cover'), logoSlot = M()?.getSlot?.('logo');
    const coverPosterUrl = state.coverMode === 'custom' && coverSlot?.url ? coverSlot.url : cov?.poster;
    state.autoAccent = await ColorExt().resolveAutoAccent({ logoUrl: logoSlot?.url || '', coverPosterUrl, fallbackHex: S().getAccentMeta(state.rubro, state.rubro).bg });
    const sw = document.getElementById('emp-auto-swatch');
    if (sw && state.autoAccent?.bg) sw.style.backgroundColor = state.autoAccent.bg;
    syncPreview('#preview-cta-btn');
  }

  function triggerSlugCheck(slugVal) {
    Mascot()?.setMood?.('thinking', 'Estoy verificando si esa dirección web está libre para tu local...');
    Slug()?.scheduleCheck?.(slugVal, (res) => {
      state.slugCheck = res;
      const wrap = document.getElementById('emp-slug-status-wrap');
      if (wrap && Slug()?.renderSlugStatus) wrap.innerHTML = Slug().renderSlugStatus(state.slugCheck, state.slug);
      if (res.status === 'available') Mascot()?.setMood?.('celebrate', `¡Genial! ${state.slug}.tucured.com.ar está disponible para vos.`);
      else if (['taken', 'reserved'].includes(res.status)) Mascot()?.setMood?.('attentive', 'Ese nombre ya está en uso, pero te dejé alternativas buenísimas abajo.');
    });
  }

  function renderAll(activarHref = '', opts = {}) {
    const mount = document.getElementById('empezar-step-mount');
    if (!mount || !state) return;
    Micro()?.renderStageBar?.(state.step, state.submitted);
    mount.innerHTML = UI().renderStep(state, activarHref);
    if (opts.animateStep && mount.firstElementChild) mount.firstElementChild.classList.add(state.stepDir === 'prev' ? 'tucu-step-enter-prev' : 'tucu-step-enter-next');
    syncPreview(opts.highlightSelector || '');
    if (opts.updateMascot !== false) Mascot()?.setStep?.(state.step, state);
    Micro()?.saveDraft?.(state);
  }

  function showInlineError(msg) {
    state.error = msg;
    const errEl = document.getElementById('emp-error');
    if (errEl) { errEl.textContent = msg; errEl.classList.toggle('hidden', !msg); }
  }

  function attachGeoSearch(inputEl) {
    clearTimeout(geoTimer);
    const dd = document.getElementById('emp-geo-dropdown'), v = inputEl.value.trim();
    if (v.length < 2 || !window.TucuActivarGeo?.queryPhoton) { dd?.classList.add('hidden'); return; }
    geoTimer = setTimeout(async () => {
      const items = await window.TucuActivarGeo.queryPhoton(v);
      if (!dd || !items.length) { dd?.classList.add('hidden'); return; }
      dd.innerHTML = items.map((it, i) => `<button type="button" data-geo-i="${i}" class="w-full text-left px-3 py-2 text-xs text-stone-800 hover:bg-stone-100 border-b border-stone-100 last:border-b-0 flex items-center gap-2 cursor-pointer">${PIN_SVG}<span class="truncate">${esc(it.formattedAddress || it.address)}</span></button>`).join('');
      dd.classList.remove('hidden');
      dd.querySelectorAll('[data-geo-i]').forEach((btn, idx) => btn.addEventListener('mousedown', (ev) => {
        ev.preventDefault(); const p = items[idx];
        state.direccion = p.address || p.formattedAddress; state.direccionLat = String(p.lat || ''); state.direccionLng = String(p.lng || '');
        inputEl.value = state.direccion; dd.classList.add('hidden'); syncPreview('#preview-address'); Micro()?.saveDraft?.(state);
      }));
    }, 250);
  }

  function handleInput(e) {
    const t = e.target; if (!t) return;
    showInlineError('');
    if (Srv()?.handleInput?.(e, state)?.handled) { syncPreview('#preview-service-chip'); return Micro()?.saveDraft?.(state); }
    const directMap = { 'emp-first': 'titularNombre', 'emp-last': 'titularApellido', 'emp-email': 'email', 'emp-instagram': 'instagram', 'emp-open1': 'open1', 'emp-close1': 'close1', 'emp-open2': 'open2', 'emp-close2': 'close2' };
    if (t.id === 'emp-comercio') { state.comercio = t.value; if (!state.slugTouched) state.slug = S().slugifySubdomain(t.value); }
    else if (t.id === 'emp-bajada') { state.bajada = t.value; state.bajadaManual = Boolean(t.value.trim()); state.taglineFromAi = false; const h = document.getElementById('emp-bajada-hint'); if (h) h.textContent = state.bajadaManual ? 'Editada por vos' : 'Sugerida según tono'; }
    else if (t.id === 'emp-slug') { state.slugTouched = true; state.slug = Slug().sanitizeSlug(t.value); if (t.value !== state.slug) t.value = state.slug; triggerSlugCheck(state.slug); }
    else if (t.id === 'emp-direccion') { state.direccion = t.value; state.direccionLat = ''; state.direccionLng = ''; attachGeoSearch(t); }
    else if (t.id === 'emp-whatsapp') { state.whatsapp = S().sanitizePhone10(t.value); t.value = state.whatsapp; }
    else if (directMap[t.id]) state[directMap[t.id]] = t.value;
    syncPreview(Micro()?.getHighlightSelector?.(state.step) || ''); Micro()?.saveDraft?.(state);
  }

  async function handleChange(e) {
    const t = e.target; if (!t?.id) return;
    if (Srv()?.handleChange?.(e, state)?.handled) {
      Pay()?.saveWizardSnapshot?.(state); renderAll('', { updateMascot: false });
      if (state.asistenciaCarga === 'whatsapp_email') Mascot()?.setMood?.('celebrate', '¡Anotado! Nos mandás tu lista por WhatsApp o Email y la cargamos por vos.');
      return;
    }
    if (t.id === 'emp-logo-input' || t.id === 'emp-cover-input') {
      const slot = t.id === 'emp-cover-input' ? 'cover' : 'logo', file = t.files?.[0]; if (!file) return;
      try {
        await M().setMedia(slot, file);
        if (slot === 'cover') { state.coverMode = 'custom'; state.coverTab = 'custom'; state.coverTouched = true; }
        state.error = ''; Pay()?.saveWizardSnapshot?.(state); renderAll('', { updateMascot: false });
        Mascot()?.setMood?.('celebrate', slot === 'logo' ? '¡Quedó buenísimo tu logo! Ya tomamos sus colores para tu App.' : '¡Hermosa foto! Tu portada ya luce en vivo en tu App.');
        return await refreshAutoAccent();
      } catch (err) { return showInlineError(err?.message || 'No pudimos procesar la imagen.'); }
    }
    const map = { 'emp-localidad': 'localidad', 'emp-sched-days': 'horarioDias', 'emp-open1': 'open1', 'emp-close1': 'close1', 'emp-open2': 'open2', 'emp-close2': 'close2' };
    if (map[t.id]) state[map[t.id]] = t.value; else if (t.id === 'emp-terms') state.termsAccepted = t.checked;
    syncPreview(Micro()?.getHighlightSelector?.(state.step) || ''); Micro()?.saveDraft?.(state);
  }

  async function handleAiAction(el) {
    if (el.closest('#btn-emp-next-phrase')) { await Assist()?.loadPool?.(); state.bajada = Assist().pickNextPhrase(state.rubro, state.tonoVoz, state.bajada); state.bajadaManual = false; state.taglineFromAi = false; state.aiFeedback = ''; return renderAll('', { updateMascot: false, highlightSelector: '#preview-tagline' }); }
    if (el.closest('#btn-emp-toggle-ai')) { state.aiPanelOpen = !state.aiPanelOpen; state.aiFeedback = ''; return renderAll('', { updateMascot: false }); }
    const chip = el.closest('[data-emp-ai-chip]');
    if (chip) { state.aiIntention = chip.dataset.empAiChip; return renderAll('', { updateMascot: false }); }
    if (el.closest('#btn-emp-ai-run')) {
      state.aiLoading = true; state.aiFeedback = ''; renderAll('', { updateMascot: false });
      Mascot()?.setMood?.('thinking', 'Estoy redactando una frase pensada especialmente para tu negocio...');
      const res = await Assist().requestAiTagline({ rubro: state.rubro, tono: state.tonoVoz, comercio: state.comercio, intention: state.aiIntention, draftText: state.bajada });
      state.aiLoading = false;
      if (res.ok && res.tagline) { state.bajada = res.tagline; state.bajadaManual = false; state.taglineFromAi = true; state.aiFeedback = 'Frase aplicada a tu portada'; renderAll('', { updateMascot: false, highlightSelector: '#preview-tagline' }); Mascot()?.setMood?.('celebrate', '¡Listo! Probé esta frase en tu portada. Si querés, podés ajustarla a gusto.'); }
      else { state.aiFeedback = 'Alcanzaste el máximo de 5 generaciones por sesión. Podés seguir rotando frases sugeridas.'; renderAll('', { updateMascot: false }); Mascot()?.setMood?.('attentive'); }
    }
  }

  function goNext() {
    const err = Micro()?.validateStep?.(state.step, state) || '';
    if (err) return showInlineError(err);
    if (state.step === 1 && !state.slugTouched) state.slug = S().slugifySubdomain(state.comercio);
    state.error = ''; state.stepDir = 'next'; state.step = Math.min(10, state.step + 1);
    Pay()?.saveWizardSnapshot?.(state); renderAll('', { animateStep: true, highlightSelector: Micro()?.getHighlightSelector?.(state.step) || '' });
    if (state.step === 8) triggerSlugCheck(state.slug);
  }

  async function handleClick(e) {
    const el = e.target;
    if (el.closest('#btn-emp-next-phrase, #btn-emp-toggle-ai, [data-emp-ai-chip], #btn-emp-ai-run')) return handleAiAction(el);
    const srvRes = Srv()?.handleClick?.(e, state);
    if (srvRes?.handled) { Pay()?.saveWizardSnapshot?.(state); if (srvRes.rerender) renderAll('', { updateMascot: false, highlightSelector: '#preview-service-chip' }); if (srvRes.celebrate) Mascot()?.setMood?.('celebrate', '¡Sumado! Tu App ya muestra ese nuevo servicio.'); return; }
    const b = (sel) => el.closest(sel);
    if (b('[data-emp-rubro]')) {
      state.rubro = b('[data-emp-rubro]').dataset.empRubro; if (state.accentMode === 'manual') state.accent = state.rubro;
      if (!state.bajadaManual) { state.bajada = T().getSuggestedTagline(state.rubro, state.tonoVoz); state.taglineFromAi = false; }
      if (!state.coverTouched && state.coverMode !== 'custom') state.coverId = C().getDefaultCoverForRubro(state.rubro).id;
      Srv()?.ensureServicesForRubro?.(state); state.error = ''; Pay()?.saveWizardSnapshot?.(state);
      renderAll('', { updateMascot: false, highlightSelector: '#preview-cta-btn' }); Mascot()?.setMood?.('celebrate', '¡Excelente! Ya adaptamos portadas, textos y servicios a tu rubro.'); return refreshAutoAccent();
    }
    if (b('[data-emp-tone]')) { state.tonoVoz = T().normalizeTone(b('[data-emp-tone]').dataset.empTone); state.bajadaManual = false; state.taglineFromAi = false; state.bajada = T().getSuggestedTagline(state.rubro, state.tonoVoz); state.error = ''; Pay()?.saveWizardSnapshot?.(state); return renderAll('', { updateMascot: false, highlightSelector: '#preview-tagline' }); }
    if (b('[data-emp-cover-tab]')) { state.coverTab = b('[data-emp-cover-tab]').dataset.empCoverTab; if (state.coverTab !== 'custom') state.coverMode = 'live'; return renderAll('', { updateMascot: false }); }
    if (b('[data-emp-cover-id]')) { state.coverId = b('[data-emp-cover-id]').dataset.empCoverId; state.coverMode = 'live'; state.coverTouched = true; Pay()?.saveWizardSnapshot?.(state); renderAll('', { updateMascot: false, highlightSelector: '#preview-phone-chassis' }); Mascot()?.setMood?.('celebrate', '¡Hermosa portada! Mirá cómo cobra vida en la vista previa.'); return refreshAutoAccent(); }
    if (b('[data-emp-accent]')) { const v = b('[data-emp-accent]').dataset.empAccent; state.accentMode = v === 'auto' ? 'auto' : 'manual'; if (v !== 'auto') state.accent = v; state.error = ''; return renderAll('', { updateMascot: false, highlightSelector: '#preview-cta-btn' }); }
    if (b('#btn-clear-logo')) { M().clearMedia('logo'); renderAll('', { updateMascot: false }); return refreshAutoAccent(); }
    if (b('#btn-clear-cover')) { M().clearMedia('cover'); state.coverMode = 'live'; state.coverTab = 'rubro'; renderAll('', { updateMascot: false }); return refreshAutoAccent(); }
    if (b('[data-emp-plan]')) { state.plan = b('[data-emp-plan]').dataset.empPlan; Pay()?.saveWizardSnapshot?.(state); return renderAll('', { updateMascot: false, highlightSelector: '#preview-plan-badge' }); }
    if (b('[data-emp-slug-suggestion]')) { state.slug = b('[data-emp-slug-suggestion]').dataset.empSlugSuggestion; state.slugTouched = true; state.slugCheck = { status: 'available', slug: state.slug, suggestions: [] }; state.error = ''; renderAll('', { updateMascot: false, highlightSelector: '#preview-domain-pill' }); Mascot()?.setMood?.('celebrate', `¡Perfecto! ${state.slug}.tucured.com.ar queda reservado para vos.`); return; }
    if (b('[data-emp-sched]')) { state.horarioModalidad = b('[data-emp-sched]').dataset.empSched; return renderAll('', { updateMascot: false, highlightSelector: '#preview-schedule' }); }
    if (b('#btn-emp-copy-alias')) return Pay()?.copyAlias?.(b('#btn-emp-copy-alias'));
    if (b('#btn-emp-later')) { Pay()?.saveWizardSnapshot?.(state); return document.getElementById('emp-later-notice')?.classList.remove('hidden'); }
    if (b('#btn-emp-prev')) { state.error = ''; state.stepDir = 'prev'; state.step = Math.max(1, state.step - 1); return renderAll('', { animateStep: true, highlightSelector: Micro()?.getHighlightSelector?.(state.step) || '' }); }
    if (b('#btn-emp-next')) return goNext();
    if (b('#btn-empezar-submit')) {
      const err = Micro()?.validateStep?.(10, state) || ''; if (err) return showInlineError(err);
      state.submitting = true; state.error = ''; renderAll('', { updateMascot: false });
      try { const res = await Sub().submitLead(state, M().getFiles()); state.submitting = false; state.submitted = true; renderAll(res.localActivarHref || res.activarUrl, { animateStep: true }); }
      catch (ex) { state.submitting = false; state.error = ex?.message || 'No pudimos completar el envío. Intentá nuevamente.'; renderAll('', { updateMascot: false }); }
    }
  }

  function init() {
    state = S().createInitialState(window.location.search); Mascot()?.init?.(document.getElementById('empezar-mascot-mount'));
    const mount = document.getElementById('empezar-step-mount'), drawer = document.getElementById('empezar-preview-drawer');
    mount?.addEventListener('input', handleInput); mount?.addEventListener('change', handleChange); mount?.addEventListener('click', handleClick);
    mount?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target?.tagName === 'INPUT' && e.target.type !== 'checkbox' && !state.submitted && state.step < 10) { e.preventDefault(); goNext(); } });
    document.getElementById('btn-open-mobile-preview')?.addEventListener('click', () => { drawer?.classList.remove('hidden'); P().render(document.getElementById('empezar-mobile-preview-mount'), state); });
    document.getElementById('btn-close-mobile-preview')?.addEventListener('click', () => drawer?.classList.add('hidden'));
    window.TucuEmpezarApp = { getState: () => state, renderAll, refreshAutoAccent };
    Assist()?.loadPool?.(); C()?.hydrateFromCatalog?.().then(() => { if (!state.submitted && state.step <= 3) syncPreview(); });
    renderAll(); refreshAutoAccent();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
