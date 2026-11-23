// Archivo: public/js/empezar/empezar_app.js
// Orquestador Wizard /empezar.html: Preview vivo, Geo Photon, WebP Media y 4 pasos (< 170L)

(function () {
  const S = () => window.TucuEmpezarState;
  const M = () => window.TucuEmpezarMedia;
  const P = () => window.TucuEmpezarPreview;
  const UI = () => window.TucuEmpezarSteps;
  const Sub = () => window.TucuEmpezarSubmit;

  let state = null, geoTimer = null;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const PIN_SVG = '<svg class="w-3.5 h-3.5 text-stone-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';

  function syncPreview() {
    P().render(document.getElementById('empezar-live-preview'), state);
    const mob = document.getElementById('empezar-mobile-preview-mount');
    if (mob && !document.getElementById('empezar-preview-drawer')?.classList.contains('hidden')) P().render(mob, state);
  }

  function syncProgress() {
    const lbl = document.getElementById('emp-progress-label'), bar = document.getElementById('emp-progress-bar');
    if (lbl) lbl.textContent = state.submitted ? 'Listo' : `Paso ${state.step} de 4`;
    if (bar) bar.style.width = `${state.submitted ? 100 : (state.step / 4) * 100}%`;
  }

  function renderAll(activarUrl = '') {
    const mount = document.getElementById('empezar-step-mount');
    if (!mount || !state) return;
    syncProgress();
    if (state.submitted) mount.innerHTML = UI().renderSuccess(state, activarUrl);
    else if (state.step === 4) mount.innerHTML = UI().renderStep4(state);
    else if (state.step === 3) mount.innerHTML = UI().renderStep3(state);
    else if (state.step === 2) mount.innerHTML = UI().renderStep2(state);
    else mount.innerHTML = UI().renderStep1(state);
    syncPreview();
  }

  function showInlineError(msg) {
    state.error = msg;
    const errEl = document.getElementById('emp-error');
    if (errEl) { errEl.textContent = msg; errEl.classList.toggle('hidden', !msg); }
  }

  function validateStep(step) {
    if (step === 1 && !state.comercio.trim()) return 'Ingresá el nombre de tu comercio para continuar.';
    if (step === 2 && state.slug.length < 3) return 'Elegí una dirección web de al menos 3 caracteres.';
    if (step === 3) {
      if (!state.direccion.trim()) return 'Ingresá la dirección del local.';
      if (!state.titularNombre.trim()) return 'Ingresá el nombre del titular.';
      if (!state.titularApellido.trim()) return 'Ingresá el apellido del titular.';
      if (state.whatsapp.length !== 10) return 'Ingresá un número de WhatsApp válido de 10 dígitos (ej. 3815554321).';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) return 'Ingresá un correo electrónico válido.';
    }
    if (step === 4 && !state.termsAccepted) return 'Aceptá los Términos y Condiciones para confirmar la activación.';
    return '';
  }

  function handleInput(e) {
    const t = e.target;
    if (!t?.id) return;
    showInlineError('');
    if (t.id === 'emp-comercio') {
      state.comercio = t.value;
      if (!state.slugTouched) state.slug = S().slugifySubdomain(t.value);
    } else if (t.id === 'emp-bajada') state.bajada = t.value;
    else if (t.id === 'emp-slug') {
      state.slugTouched = true;
      state.slug = S().slugifySubdomain(t.value);
      const pv = document.getElementById('emp-slug-preview');
      if (pv) pv.textContent = `Enlace: https://${state.slug}.tucured.com.ar`;
    } else if (t.id === 'emp-direccion') {
      state.direccion = t.value; state.direccionLat = ''; state.direccionLng = '';
      clearTimeout(geoTimer);
      const dd = document.getElementById('emp-geo-dropdown');
      const v = t.value.trim();
      if (v.length < 2 || !window.TucuActivarGeo?.queryPhoton) { dd?.classList.add('hidden'); }
      else {
        geoTimer = setTimeout(async () => {
          const items = await window.TucuActivarGeo.queryPhoton(v);
          if (!dd || !items.length) { dd?.classList.add('hidden'); return; }
          dd.innerHTML = items.map((it, i) => `<button type="button" data-geo-i="${i}" class="w-full text-left px-3 py-2 text-xs text-stone-800 hover:bg-stone-100 border-b border-stone-100 last:border-b-0 flex items-center gap-2 cursor-pointer">${PIN_SVG}<span class="truncate">${esc(it.formattedAddress || it.address)}</span></button>`).join('');
          dd.classList.remove('hidden');
          dd.querySelectorAll('[data-geo-i]').forEach((btn, idx) => btn.addEventListener('mousedown', (ev) => {
            ev.preventDefault();
            const picked = items[idx];
            state.direccion = picked.address || picked.formattedAddress;
            state.direccionLat = String(picked.lat || ''); state.direccionLng = String(picked.lng || '');
            t.value = state.direccion; dd.classList.add('hidden'); syncPreview();
          }));
        }, 250);
      }
    } else if (t.id === 'emp-first') state.titularNombre = t.value;
    else if (t.id === 'emp-last') state.titularApellido = t.value;
    else if (t.id === 'emp-whatsapp') { state.whatsapp = S().sanitizePhone10(t.value); t.value = state.whatsapp; }
    else if (t.id === 'emp-email') state.email = t.value;
    else if (t.id === 'emp-instagram') state.instagram = t.value;
    syncPreview();
  }

  async function handleChange(e) {
    const t = e.target;
    if (!t?.id) return;
    if (t.id === 'emp-logo-input' || t.id === 'emp-cover-input') {
      const slot = t.id === 'emp-cover-input' ? 'cover' : 'logo', file = t.files?.[0];
      if (!file) return;
      try {
        await M().setMedia(slot, file);
        if (slot === 'cover') state.coverMode = 'custom';
        state.error = ''; renderAll();
      } catch (err) { showInlineError(err?.message || 'No pudimos procesar la imagen.'); }
      return;
    }
    if (t.id === 'emp-localidad') state.localidad = t.value;
    else if (t.id === 'emp-sched-days') state.horarioDias = t.value;
    else if (t.id === 'emp-open1') state.open1 = t.value;
    else if (t.id === 'emp-close1') state.close1 = t.value;
    else if (t.id === 'emp-open2') state.open2 = t.value;
    else if (t.id === 'emp-close2') state.close2 = t.value;
    else if (t.id === 'emp-terms') state.termsAccepted = t.checked;
    syncPreview();
  }

  async function handleClick(e) {
    const rubroBtn = e.target.closest('[data-emp-rubro]');
    if (rubroBtn) { state.rubro = rubroBtn.dataset.empRubro; if (!state.accentTouched) state.accent = state.rubro; state.error = ''; return renderAll(); }
    const accBtn = e.target.closest('[data-emp-accent]');
    if (accBtn) { state.accent = accBtn.dataset.empAccent; state.accentTouched = true; state.error = ''; return renderAll(); }
    const covBtn = e.target.closest('[data-emp-cover-mode="rubro"]');
    if (covBtn) { state.coverMode = 'rubro'; return renderAll(); }
    if (e.target.closest('#btn-clear-logo')) { M().clearMedia('logo'); return renderAll(); }
    if (e.target.closest('#btn-clear-cover')) { M().clearMedia('cover'); state.coverMode = 'rubro'; return renderAll(); }
    const planBtn = e.target.closest('[data-emp-plan]');
    if (planBtn) { state.plan = planBtn.dataset.empPlan; return renderAll(); }
    const schedBtn = e.target.closest('[data-emp-sched]');
    if (schedBtn) { state.horarioModalidad = schedBtn.dataset.empSched; return renderAll(); }
    if (e.target.closest('#btn-emp-prev')) { state.error = ''; state.step = Math.max(1, state.step - 1); return renderAll(); }
    if (e.target.closest('#btn-emp-next')) {
      const err = validateStep(state.step);
      if (err) return showInlineError(err);
      if (state.step === 1 && !state.slugTouched) state.slug = S().slugifySubdomain(state.comercio);
      state.error = ''; state.step = Math.min(4, state.step + 1); return renderAll();
    }
    if (e.target.closest('#btn-empezar-submit')) {
      const err = validateStep(4);
      if (err) return showInlineError(err);
      state.submitting = true; state.error = ''; renderAll();
      try {
        const res = await Sub().submitLead(state, M().getFiles());
        state.submitting = false; state.submitted = true; renderAll(res.activarUrl);
      } catch (ex) {
        state.submitting = false; state.error = ex?.message || 'No pudimos completar el envío. Intentá nuevamente.'; renderAll();
      }
    }
  }

  function init() {
    state = S().createInitialState(window.location.search);
    const mount = document.getElementById('empezar-step-mount'), drawer = document.getElementById('empezar-preview-drawer');
    mount?.addEventListener('input', handleInput);
    mount?.addEventListener('change', handleChange);
    mount?.addEventListener('click', handleClick);
    document.getElementById('btn-open-mobile-preview')?.addEventListener('click', () => { drawer?.classList.remove('hidden'); P().render(document.getElementById('empezar-mobile-preview-mount'), state); });
    document.getElementById('btn-close-mobile-preview')?.addEventListener('click', () => drawer?.classList.add('hidden'));
    window.TucuEmpezarApp = { getState: () => state, renderAll };
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();