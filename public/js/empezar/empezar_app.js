// Archivo: public/js/empezar/empezar_app.js
// Orquestador Pasos 1-11: scrollTop al avanzar, auto-portada en P5/P6, luminancia Póster Cristal y moderación (< 180L)

(function () {
  const S = () => window.TucuEmpezarState, M = () => window.TucuEmpezarMedia, P = () => window.TucuEmpezarPreview;
  const UI = () => window.TucuEmpezarSteps, C = () => window.TucuEmpezarCovers, Pay = () => window.TucuEmpezarCheckoutUI;
  const Micro = () => window.TucuEmpezarMicroSteps, Srv = () => window.TucuEmpezarServicesStep, Mascot = () => window.TucuMascot;
  const ColorExt = () => window.TucuEmpezarColorExtract, Assist = () => window.TucuEmpezarTaglineAssist, Slug = () => window.TucuEmpezarSlugCheck;
  const Mp = () => window.TucuEmpezarMpBrick, Step11 = () => window.TucuEmpezarStep11, Styles = () => window.TucuEmpezarPreviewStyles;

  let state = null, geoTimer = null;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const PIN_SVG = '<svg class="w-3.5 h-3.5 text-stone-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'auto' });

  function syncPreview(highlightSel = '') {
    P().render(document.getElementById('empezar-live-preview'), state, highlightSel);
    const mob = document.getElementById('empezar-mobile-preview-mount');
    if (mob && !document.getElementById('empezar-preview-drawer')?.classList.contains('hidden')) P().render(mob, state, highlightSel, { inModal: true });
    const step10Mob = document.getElementById('emp-step10-mobile-style-preview');
    if (step10Mob && state.step === 10 && Styles()?.renderCoverStyle) step10Mob.innerHTML = Styles().renderCoverStyle(state);
  }

  async function refreshAutoAccent() {
    if (!ColorExt()?.resolveAutoAccent || !state) return;
    const cov = C()?.getCoverById?.(state.coverId) || C()?.getDefaultCoverForRubro?.(state.rubro || 'peluqueria');
    const coverSlot = M()?.getSlot?.('cover'), logoSlot = M()?.getSlot?.('logo');
    const coverPosterUrl = state.coverMode === 'custom' && coverSlot?.url ? coverSlot.url : (state.coverMode === 'temp' ? C()?.getTempCoverPath?.(state.rubro || 'peluqueria') : cov?.poster);
    state.autoAccent = await ColorExt().resolveAutoAccent({ logoUrl: logoSlot?.url || '', coverPosterUrl, fallbackHex: S().getAccentMeta(state.rubro, state.rubro).bg });
    if (ColorExt().measureTopLuminance) state.posterTone = await ColorExt().measureTopLuminance(coverPosterUrl, 'dark');
    const sw = document.getElementById('emp-auto-swatch');
    if (sw && state.autoAccent?.bg) sw.style.backgroundColor = state.autoAccent.bg;
    syncPreview('#preview-cta-btn');
  }

  function triggerSlugCheck(slugVal) {
    Slug()?.scheduleCheck?.(slugVal, (res) => {
      state.slugCheck = res;
      const wrap = document.getElementById('emp-slug-status-wrap');
      if (wrap && Slug()?.renderSlugStatus) wrap.innerHTML = Slug().renderSlugStatus(state.slugCheck, state.slug);
      if (state.step === 8 && res.status === 'available') Mascot()?.setMood?.('celebrate', `¡Genial! ${state.slug}.tucured.com.ar está disponible para vos.`);
    });
  }

  function renderAll(activarHref = '', opts = {}) {
    const mount = document.getElementById('empezar-step-mount');
    if (!mount || !state) return;
    Micro()?.renderStageBar?.(state.step, state.submitted);
    mount.innerHTML = UI().renderStep(state, activarHref);
    if (opts.animateStep && mount.firstElementChild) {
      mount.classList.add('tucu-step-enter');
      requestAnimationFrame(() => { mount.classList.add('tucu-step-enter-active'); mount.classList.remove('tucu-step-enter'); });
    }
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
      const items = await window.TucuActivarGeo.queryPhoton(v, state.localidad);
      if (!dd || !items.length) { dd?.classList.add('hidden'); return; }
      dd.innerHTML = items.map((it, i) => `<button type="button" data-geo-i="${i}" class="w-full text-left px-3 py-2 text-xs text-stone-800 hover:bg-orange-50 border-b border-stone-100 last:border-b-0 flex items-center gap-2 cursor-pointer">${PIN_SVG}<span class="truncate">${esc(it.formattedAddress || it.address)}</span></button>`).join('');
      dd.classList.remove('hidden');
      dd.querySelectorAll('[data-geo-i]').forEach((btn, idx) => btn.addEventListener('mousedown', (ev) => {
        ev.preventDefault(); const p = items[idx];
        state.direccion = p.address || p.formattedAddress; state.direccionLat = String(p.lat || ''); state.direccionLng = String(p.lng || '');
        state.geoVerified = Boolean(state.direccionLat && state.direccionLng);
        dd.classList.add('hidden'); renderAll('', { updateMascot: true, highlightSelector: '#preview-address' });
      }));
    }, 250);
  }

  function handleInput(e) {
    const t = e.target; if (!t) return;
    showInlineError('');
    if (Srv()?.handleInput?.(e, state)?.handled) { syncPreview('#preview-service-chip'); return Micro()?.saveDraft?.(state); }
    const directMap = { 'emp-first': 'titularNombre', 'emp-last': 'titularApellido', 'emp-instagram': 'instagram', 'emp-piso-depto': 'pisoDepto', 'emp-open1': 'open1', 'emp-close1': 'close1', 'emp-open2': 'open2', 'emp-close2': 'close2' };
    if (t.id === 'emp-comercio') { state.comercio = t.value; if (!state.slugTouched) state.slug = S().slugifySubdomain(t.value); }
    else if (t.id === 'emp-bajada') {
      state.bajada = Assist().clipTagline(t.value); if (t.value !== state.bajada) t.value = state.bajada;
      state.bajadaManual = Boolean(state.bajada.trim()); state.taglineFromAi = false;
      const cnt = document.getElementById('emp-tagline-counter'); if (cnt) cnt.textContent = `${state.bajada.length}/${Assist().MAX_LEN}`;
    } else if (t.id === 'emp-slug') { state.slugTouched = true; state.slug = Slug().sanitizeSlug(t.value); if (t.value !== state.slug) t.value = state.slug; triggerSlugCheck(state.slug); }
    else if (t.id === 'emp-direccion') { state.direccion = t.value; state.direccionLat = ''; state.direccionLng = ''; state.geoVerified = false; attachGeoSearch(t); }
    else if (t.id === 'emp-whatsapp') { state.whatsapp = S().sanitizePhone10(t.value); t.value = state.whatsapp; }
    else if (directMap[t.id]) state[directMap[t.id]] = t.value;
    syncPreview(Micro()?.getHighlightSelector?.(state.step) || ''); Micro()?.saveDraft?.(state);
  }

  async function handleChange(e) {
    const t = e.target; if (!t?.id) return;
    const srvChg = Srv()?.handleChange?.(e, state);
    if (srvChg?.handled) { Pay()?.saveWizardSnapshot?.(state); return renderAll('', { updateMascot: false, highlightSelector: '#preview-service-chip' }); }
    if (t.id === 'emp-logo-input' || t.id === 'emp-cover-input') {
      const slot = t.id === 'emp-cover-input' ? 'cover' : 'logo', file = t.files?.[0]; if (!file) return;
      try {
        await M().setMedia(slot, file);
        if (slot === 'cover') { state.coverMode = 'custom'; state.coverId = 'custom'; state.coverTouched = true; }
        if (slot === 'logo') state.previewMode = 'turnero';
        state.error = ''; Pay()?.saveWizardSnapshot?.(state); renderAll('', { updateMascot: false });
        Mascot()?.setMood?.('celebrate', slot === 'logo' ? '¡Excelente logo! Mirá cómo luce sobre blanco en tu turnero.' : '¡Tu foto quedó cargada y activa en la portada!');
        return await refreshAutoAccent();
      } catch (err) {
        const msg = err?.message || 'No pudimos procesar la imagen.';
        showInlineError(msg);
        return Mascot()?.setMood?.('advisor', msg);
      }
    }
    const map = { 'emp-localidad': 'localidad', 'emp-sched-days': 'horarioDias', 'emp-open1': 'open1', 'emp-close1': 'close1', 'emp-open2': 'open2', 'emp-close2': 'close2' };
    if (map[t.id]) { state[map[t.id]] = t.value; if (t.id === 'emp-localidad') { state.geoVerified = false; renderAll('', { updateMascot: true }); return; } return renderAll('', { updateMascot: state.step === 6, highlightSelector: '#preview-schedule' }); }
    if (t.id === 'emp-terms') { state.termsAccepted = t.checked; state.termsAcceptedAt = t.checked ? new Date().toISOString() : ''; if (t.checked) showInlineError(''); }
    syncPreview(Micro()?.getHighlightSelector?.(state.step) || ''); Micro()?.saveDraft?.(state);
  }

  function handleFocusOut(e) {
    if (e.target?.id !== 'emp-piso-depto') return;
    const formatted = S().formatPisoDepto(e.target.value);
    if (formatted !== state.pisoDepto || formatted !== e.target.value) {
      state.pisoDepto = formatted; e.target.value = formatted;
      syncPreview('#preview-address'); Micro()?.saveDraft?.(state);
    }
  }

  function mountMpIfNeeded() {
    if (state.step !== 10 || state.paymentMethod !== 'mp') return;
    Mp()?.mountPaymentBrick?.({
      containerId: 'emp-mp-brick-container', getState: () => state,
      onTermsMissing: () => { showInlineError('Aceptá los Términos y Condiciones para abonar.'); Mascot()?.setMood?.('advisor', 'Tildá la casilla de Términos y Condiciones arriba antes de abonar.'); },
      onCoverConflict: () => { showInlineError('Esa portada fue reservada recién. Elegí otra libre.'); Mascot()?.setMood?.('advisor', 'Usá Cambiar en Portada para elegir otra foto libre.'); },
      onApproved: async (data) => { state.mpPaymentId = String(data?.paymentId || data?.id || ''); await window.TucuEmpezarEvents.finalizeOrder({ state, renderAll }, true); }
    });
  }

  function goNext() {
    if (state.step === 6 && state.pisoDepto) state.pisoDepto = S().formatPisoDepto(state.pisoDepto);
    if (state.step === 7 && state.asistenciaCarga !== 'whatsapp_email') state.servicios = Srv()?.cleanServices?.(state.servicios) || [];
    const err = Micro()?.validateStep?.(state.step, state) || '';
    if (err) { if (state.step === 6) Mascot()?.setMood?.('advisor', err); return showInlineError(err); }
    if (state.step === 1 && !state.slugTouched) state.slug = S().slugifySubdomain(state.comercio);
    state.error = ''; state.stepDir = 'next'; state.step = Math.min(11, state.step + 1);
    if (state.step === 5 || state.step === 6) state.previewMode = 'cover';
    scrollTop(); Pay()?.saveWizardSnapshot?.(state); renderAll('', { animateStep: true, highlightSelector: Micro()?.getHighlightSelector?.(state.step) || '' });
    if (state.step === 8) triggerSlugCheck(state.slug);
    mountMpIfNeeded();
  }

  async function init() {
    M()?.restoreFromStorage?.();
    const params = new URLSearchParams(window.location.search), hasDraft = Boolean(Micro()?.loadDraft?.());
    state = S().createInitialState(window.location.search);
    if ((state.coverMode === 'custom' || state.coverId === 'custom' || state.coverId === 'custom_upload') && !M()?.getSlot?.('cover')?.url) {
      const fallbackRub = state.rubro || 'peluqueria';
      state.coverMode = 'temp';
      state.coverId = `temp_${fallbackRub}`;
    }
    const willPlayIntro = !hasDraft && state.step === 1 && !state.comercio;
    const adviceApi = { setCoverStyle: (n) => { state.coverStyle = n; renderAll('', { updateMascot: false }); }, applyAccentHex: (h) => { state.accentMode = 'manual'; state.customAccentHex = h; renderAll('', { updateMascot: true }); } };
    Mascot()?.init?.(document.getElementById('empezar-mascot-mount'), { adviceApi, deferIdle: willPlayIntro, onAdviceClick: () => Mascot()?.triggerAdvice?.(state.step, state) });
    const mount = document.getElementById('empezar-step-mount'), drawer = document.getElementById('empezar-preview-drawer');
    const ctx = { state, renderAll, refreshAutoAccent, goNext, showInlineError, mountMpIfNeeded };
    mount?.addEventListener('input', handleInput); mount?.addEventListener('change', handleChange); mount?.addEventListener('focusout', handleFocusOut);
    mount?.addEventListener('click', (e) => window.TucuEmpezarEvents.handleClick(e, ctx));
    mount?.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target?.tagName === 'INPUT' && e.target.type !== 'checkbox' && !state.submitted && state.step < 10) { e.preventDefault(); goNext(); } });
    document.addEventListener('click', (e) => {
      const pm = e.target?.closest?.('[data-emp-preview-mode]'); if (pm) { state.previewMode = pm.dataset.empPreviewMode; syncPreview(); return; }
      const ms = e.target?.closest?.('[data-emp-modal-cover-style]'); if (ms) { state.coverStyle = ms.dataset.empModalCoverStyle; renderAll('', { updateMascot: false }); }
    });
    document.getElementById('btn-open-mobile-preview')?.addEventListener('click', () => { drawer?.classList.remove('hidden'); P().render(document.getElementById('empezar-mobile-preview-mount'), state, '', { inModal: true }); });
    document.getElementById('btn-close-mobile-preview')?.addEventListener('click', () => drawer?.classList.add('hidden'));
    window.TucuEmpezarApp = { getState: () => state, renderAll, refreshAutoAccent, mountMpIfNeeded };
    C()?.hydrateFromCatalog?.().then(() => { if (!state.submitted && state.step >= 3) refreshAutoAccent(); });
    if (params.get('mp_return') === '1' && params.get('slug')) {
      const stMp = await Mp()?.checkReturnStatus?.(params.get('slug'));
      if (stMp?.paid) { state.slug = params.get('slug'); state.paidViaMp = true; state.paymentStatus = 'paid'; state.paymentMethod = 'mp'; state.mpPaymentId = String(stMp.paymentId || ''); state.submitted = true; state.step = 11; renderAll(window.TucuEmpezarSubmit.buildLocalActivarHref(state), { animateStep: true }); Step11()?.launchConfetti?.(S().getEffectiveAccent(state).bg); return; }
    }
    syncPreview();
    if (willPlayIntro) Mascot()?.playIntroSequence?.(mount, false, () => { scrollTop(); renderAll('', { animateStep: true }); refreshAutoAccent(); });
    else { renderAll(); refreshAutoAccent(); mountMpIfNeeded(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();