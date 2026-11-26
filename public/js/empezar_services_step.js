// Archivo: public/js/empezar_services_step.js
// Paso 7 Servicios de Turnos: 5 rubros, colapso al elegir WhatsApp y archivo <= 8 MB (< 170L)

window.TucuEmpezarServicesStep = (function () {
  const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
  const RUBRO_DEFAULTS = {
    peluqueria: [{ name: 'Corte clásico', duration: 30, price: 8500 }, { name: 'Corte y barba', duration: 45, price: 12000 }, { name: 'Perfilado de barba', duration: 20, price: 6000 }],
    estetica: [{ name: 'Limpieza facial profunda', duration: 60, price: 18000 }, { name: 'Esmaltado semipermanente', duration: 45, price: 14000 }, { name: 'Masaje descontracturante', duration: 60, price: 19500 }],
    deportes: [{ name: 'Alquiler de cancha 60 min', duration: 60, price: 24000 }, { name: 'Turno doble 90 min', duration: 90, price: 34000 }, { name: 'Clase personalizada', duration: 60, price: 15000 }],
    salud: [{ name: 'Consulta inicial', duration: 30, price: 20000 }, { name: 'Control y seguimiento', duration: 20, price: 15000 }, { name: 'Sesión terapéutica', duration: 45, price: 22000 }],
    servicios: [{ name: 'Asesoramiento inicial', duration: 30, price: 12000 }, { name: 'Servicio estándar', duration: 60, price: 20000 }, { name: 'Revisión técnica', duration: 45, price: 16000 }]
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const getDefaultServices = (rubro) => (RUBRO_DEFAULTS[rubro] || RUBRO_DEFAULTS.peluqueria).map((s) => ({ ...s }));

  function ensureServicesForRubro(state) {
    if (!state) return;
    if (!state.serviciosTouched || !Array.isArray(state.servicios)) state.servicios = getDefaultServices(state.rubro);
  }

  function cleanServices(list) {
    if (!Array.isArray(list)) return [];
    return list.map((s) => ({ name: String(s?.name || '').trim(), duration: Math.max(15, Number(s?.duration || 30) || 30), price: Math.max(0, Number(s?.price || 0) || 0) }))
      .filter((s) => s.name.length > 0);
  }

  const serializeServices = (state) => (state?.asistenciaCarga === 'whatsapp_email' ? '[]' : JSON.stringify(cleanServices(state?.servicios)));

  function renderServiceItem(srv, idx, canDelete) {
    const durOpts = DURATIONS.map((m) => `<option value="${m}" ${Number(srv.duration || 30) === m ? 'selected' : ''}>${m} min</option>`).join('');
    return `<div class="emp-srv-row p-3 rounded-2xl wg-option space-y-2" data-emp-srv-idx="${idx}">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Servicio ${idx + 1}</span>
        ${canDelete ? `<button type="button" data-emp-del-srv="${idx}" class="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer">Quitar</button>` : ''}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div class="sm:col-span-6"><input id="emp-srv-name-${idx}" type="text" maxlength="64" data-emp-srv-field="name" data-idx="${idx}" value="${esc(srv.name)}" placeholder="Ej. Corte clásico" class="w-full p-2.5 rounded-xl bg-white border border-[#E2D8CB] focus:border-[#EA580C] text-xs sm:text-sm text-stone-900 outline-none" /></div>
        <div class="sm:col-span-3"><select id="emp-srv-dur-${idx}" data-emp-srv-field="duration" data-idx="${idx}" class="w-full p-2.5 rounded-xl bg-white border border-[#E2D8CB] focus:border-[#EA580C] text-xs text-stone-900 tabular-nums outline-none">${durOpts}</select></div>
        <div class="sm:col-span-3 relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 pointer-events-none">$</span><input id="emp-srv-price-${idx}" type="number" min="0" step="100" data-emp-srv-field="price" data-idx="${idx}" value="${srv.price === '' ? '' : Number(srv.price || 0)}" placeholder="0" class="w-full p-2.5 pl-6 rounded-xl bg-white border border-[#E2D8CB] focus:border-[#EA580C] text-xs sm:text-sm text-stone-900 tabular-nums outline-none" /></div>
      </div>
    </div>`;
  }

  function renderStep(state) {
    ensureServicesForRubro(state);
    const list = state.servicios || [], assistOn = state.asistenciaCarga === 'whatsapp_email';
    const plSlot = window.TucuEmpezarMedia?.getSlot?.('pricelist');
    const canDelete = list.length > 1;
    const rowsBlock = assistOn ? '' : `
      <div id="emp-services-list" class="space-y-2.5">${list.map((s, i) => renderServiceItem(s, i, canDelete)).join('')}</div>
      <button type="button" id="btn-emp-add-service" class="wg-btn-secondary w-full py-2.5 px-4 rounded-xl border-dashed text-xs font-bold cursor-pointer">+ Agregar otro servicio</button>`;

    const waUploadExtra = assistOn ? `
      <div class="pt-2.5 mt-2 border-t border-orange-200/80 space-y-2">
        <p class="text-xs font-bold text-[#9A3412]">Te la mando por WhatsApp al terminar</p>
        <div class="flex flex-wrap items-center gap-2">
          <label for="emp-pricelist-input" class="wg-btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5">
            <span>${plSlot?.file ? `Archivo listo: ${esc(plSlot.name)} (Cambiar)` : 'O subir foto / PDF ahora'}</span>
            <input id="emp-pricelist-input" type="file" accept="image/*,application/pdf" class="hidden" />
          </label>
          <span class="text-[11px] text-stone-500">Máximo 8 MB</span>
        </div>
        ${state.pricelistError ? `<p class="text-[11px] font-semibold text-rose-700">${esc(state.pricelistError)}</p>` : ''}
      </div>` : '';

    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tus servicios y precios</h2><p class="text-xs text-stone-500 mt-1">Cargá tus primeros servicios o elegí mandarnos tu lista por WhatsApp.</p></div>
      <div class="p-3.5 rounded-2xl transition-colors ${assistOn ? 'wg-option-active' : 'wg-option'}">
        <label for="emp-assist-check" class="flex items-start gap-3 cursor-pointer">
          <input id="emp-assist-check" type="checkbox" ${assistOn ? 'checked' : ''} class="mt-0.5 w-4 h-4 rounded border-stone-300 accent-[#EA580C] cursor-pointer shrink-0" />
          <span class="text-xs leading-snug"><strong class="block font-bold text-stone-900">Prefiero mandar mi lista de precios por WhatsApp</strong><span class="text-[11px] text-stone-600">Colapsa las filas de muestra y nuestro equipo la carga por vos al activar.</span></span>
        </label>
        ${waUploadExtra}
      </div>
      ${rowsBlock}
    </div>`;
  }

  function handleInput(e, state) {
    const t = e.target; if (!t || t.dataset?.empSrvField === undefined) return { handled: false };
    const idx = Number(t.dataset.idx), field = t.dataset.empSrvField;
    if (!Array.isArray(state.servicios) || !state.servicios[idx]) return { handled: false };
    state.serviciosTouched = true;
    state.servicios[idx][field] = field === 'name' ? t.value : (Number(t.value) || 0);
    return { handled: true, rerender: false, celebrate: false };
  }

  function handleClick(e, state) {
    const el = e.target;
    if (el.closest('#btn-emp-add-service')) {
      if (!Array.isArray(state.servicios)) state.servicios = [];
      state.serviciosTouched = true; state.servicios.push({ name: '', duration: 30, price: 0 });
      return { handled: true, rerender: true, celebrate: true };
    }
    const delBtn = el.closest('[data-emp-del-srv]');
    if (delBtn) {
      const idx = Number(delBtn.dataset.empDelSrv);
      if (Array.isArray(state.servicios) && state.servicios.length > 1) { state.serviciosTouched = true; state.servicios.splice(idx, 1); }
      return { handled: true, rerender: true, celebrate: false };
    }
    return { handled: false };
  }

  function handleChange(e, state) {
    if (e.target?.id === 'emp-assist-check') {
      state.asistenciaCarga = e.target.checked ? 'whatsapp_email' : '';
      return { handled: true, rerender: true, celebrate: e.target.checked };
    }
    if (e.target?.id === 'emp-pricelist-input') {
      const file = e.target.files?.[0]; state.pricelistError = '';
      if (file) {
        try { window.TucuEmpezarMedia?.setPriceList?.(file); }
        catch (err) { state.pricelistError = err?.message || 'Archivo demasiado grande.'; }
      }
      return { handled: true, rerender: true, celebrate: !state.pricelistError };
    }
    return { handled: false };
  }

  function validate(state) {
    if (state?.asistenciaCarga === 'whatsapp_email') return '';
    return cleanServices(state?.servicios).length >= 1 ? '' : 'Sumá al menos un servicio con nombre, o tildá la opción para mandar tu lista por WhatsApp.';
  }

  return { getDefaultServices, ensureServicesForRubro, cleanServices, serializeServices, renderStep, handleInput, handleClick, handleChange, validate };
})();
