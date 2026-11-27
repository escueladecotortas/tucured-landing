// Archivo: public/js/empezar_services_step.js
// Paso 7 Servicios: especialidad dinámica, toggles Sin precio / Sin tiempo y WhatsApp <= 8 MB (< 165L)

window.TucuEmpezarServicesStep = (function () {
  const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function getDefaultServices(rubro, specialties = []) {
    const mod = window.TucuEmpezarSpecialtyData;
    if (mod?.getInitialServices) return mod.getInitialServices(rubro, specialties);
    return [{ name: 'Servicio principal', duration: 30, price: 8500, noPrice: false, noTime: false }];
  }

  function ensureServicesForRubro(state) {
    if (!state) return;
    if (!state.serviciosTouched || !Array.isArray(state.servicios)) {
      state.servicios = getDefaultServices(state.rubro, state.specialties);
    }
  }

  function cleanServices(list) {
    if (!Array.isArray(list)) return [];
    return list.map((s) => ({
      name: String(s?.name || '').trim(),
      duration: Math.max(15, Number(s?.duration || 30) || 30),
      price: Math.max(0, Number(s?.price || 0) || 0),
      noPrice: Boolean(s?.noPrice),
      noTime: Boolean(s?.noTime)
    })).filter((s) => s.name.length > 0);
  }

  const serializeServices = (state) => (state?.asistenciaCarga === 'whatsapp_email' ? '[]' : JSON.stringify(cleanServices(state?.servicios)));

  function renderServiceItem(srv, idx, canDelete) {
    const durOpts = DURATIONS.map((m) => `<option value="${m}" ${Number(srv.duration || 30) === m ? 'selected' : ''}>${m} min</option>`).join('');
    const noPrice = Boolean(srv.noPrice), noTime = Boolean(srv.noTime);
    return `<div class="emp-srv-row p-3 rounded-2xl wg-option space-y-2.5" data-emp-srv-idx="${idx}">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Servicio ${idx + 1}</span>
        ${canDelete ? `<button type="button" data-emp-del-srv="${idx}" class="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer">Quitar</button>` : ''}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div class="sm:col-span-6"><input id="emp-srv-name-${idx}" type="text" maxlength="64" data-emp-srv-field="name" data-idx="${idx}" value="${esc(srv.name)}" placeholder="Ej. Corte clásico" class="w-full p-2.5 rounded-xl bg-white border border-[#E2D8CB] focus:border-[#EA580C] text-xs sm:text-sm text-stone-900 outline-none" /></div>
        <div class="sm:col-span-3 ${noTime ? 'opacity-45' : ''}"><select id="emp-srv-dur-${idx}" ${noTime ? 'disabled' : ''} data-emp-srv-field="duration" data-idx="${idx}" class="w-full p-2.5 rounded-xl bg-white border border-[#E2D8CB] focus:border-[#EA580C] text-xs text-stone-900 tabular-nums outline-none disabled:bg-stone-100">${durOpts}</select></div>
        <div class="sm:col-span-3 relative ${noPrice ? 'opacity-45' : ''}"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 pointer-events-none">$</span><input id="emp-srv-price-${idx}" type="number" min="0" step="100" ${noPrice ? 'disabled' : ''} data-emp-srv-field="price" data-idx="${idx}" value="${noPrice ? '' : (srv.price === '' ? '' : Number(srv.price || 0))}" placeholder="${noPrice ? 'Consultar' : '0'}" class="w-full p-2.5 pl-6 rounded-xl bg-white border border-[#E2D8CB] focus:border-[#EA580C] text-xs sm:text-sm text-stone-900 tabular-nums outline-none disabled:bg-stone-100" /></div>
      </div>
      <div class="flex flex-wrap items-center gap-4 pt-0.5 text-[11px] font-semibold text-stone-600">
        <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" id="emp-srv-nopr-${idx}" data-emp-srv-toggle="noPrice" data-idx="${idx}" ${noPrice ? 'checked' : ''} class="w-3.5 h-3.5 accent-[#EA580C] rounded" /><span>Sin precio</span></label>
        <label class="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" id="emp-srv-notm-${idx}" data-emp-srv-toggle="noTime" data-idx="${idx}" ${noTime ? 'checked' : ''} class="w-3.5 h-3.5 accent-[#EA580C] rounded" /><span>Sin tiempo</span></label>
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
          <span class="text-xs leading-snug"><strong class="block font-bold text-stone-900">Prefiero mandar mi lista de precios por WhatsApp</strong><span class="text-[11px] text-stone-600">Despreocupate ahora: nuestro equipo carga tu lista apenas confirmes tu reserva.</span></span>
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
    return { handled: true, rerender: false };
  }

  function handleClick(e, state) {
    const el = e.target;
    if (el.closest('#btn-emp-add-service')) {
      if (!Array.isArray(state.servicios)) state.servicios = [];
      state.serviciosTouched = true; state.servicios.push({ name: '', duration: 30, price: 0, noPrice: false, noTime: false });
      return { handled: true, rerender: true };
    }
    const delBtn = el.closest('[data-emp-del-srv]');
    if (delBtn) {
      const idx = Number(delBtn.dataset.empDelSrv);
      if (Array.isArray(state.servicios) && state.servicios.length > 1) { state.serviciosTouched = true; state.servicios.splice(idx, 1); }
      return { handled: true, rerender: true };
    }
    return { handled: false };
  }

  function handleChange(e, state) {
    const t = e.target;
    if (t?.dataset?.empSrvToggle) {
      const idx = Number(t.dataset.idx), key = t.dataset.empSrvToggle;
      if (Array.isArray(state.servicios) && state.servicios[idx]) {
        state.serviciosTouched = true;
        state.servicios[idx][key] = Boolean(t.checked);
      }
      return { handled: true, rerender: true };
    }
    if (t?.id === 'emp-assist-check') {
      state.asistenciaCarga = t.checked ? 'whatsapp_email' : '';
      return { handled: true, rerender: true };
    }
    if (t?.id === 'emp-pricelist-input') {
      const file = t.files?.[0]; state.pricelistError = '';
      if (file) {
        try { window.TucuEmpezarMedia?.setPriceList?.(file); }
        catch (err) { state.pricelistError = err?.message || 'Archivo demasiado grande.'; }
      }
      return { handled: true, rerender: true };
    }
    return { handled: false };
  }

  function validate(state) {
    if (state?.asistenciaCarga === 'whatsapp_email') return '';
    return cleanServices(state?.servicios).length >= 1 ? '' : 'Sumá al menos un servicio con nombre, o tildá la opción para mandar tu lista por WhatsApp.';
  }

  return { getDefaultServices, ensureServicesForRubro, cleanServices, serializeServices, renderStep, handleInput, handleClick, handleChange, validate };
})();