// Archivo: public/js/empezar_services_step.js
// Micro-pantalla flexible de servicios iniciales (desde 1 servicio o respaldo WhatsApp/Email) (< 175L)

window.TucuEmpezarServicesStep = (function () {
  const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
  const RUBRO_DEFAULTS = {
    peluqueria: [
      { name: 'Corte clásico', duration: 30, price: 8500 },
      { name: 'Corte y barba', duration: 45, price: 12000 },
      { name: 'Perfilado de barba', duration: 20, price: 6000 }
    ],
    estetica: [
      { name: 'Limpieza facial profunda', duration: 60, price: 18000 },
      { name: 'Esmaltado semipermanente', duration: 45, price: 14000 },
      { name: 'Masaje descontracturante', duration: 60, price: 19500 }
    ],
    gastronomia: [
      { name: 'Reserva de mesa salón', duration: 90, price: 0 },
      { name: 'Mesa en patio / terraza', duration: 90, price: 0 },
      { name: 'Merienda para dos', duration: 60, price: 16000 }
    ],
    deportes: [
      { name: 'Alquiler de cancha 60 min', duration: 60, price: 24000 },
      { name: 'Turno doble 90 min', duration: 90, price: 34000 },
      { name: 'Clase personalizada', duration: 60, price: 15000 }
    ],
    salud: [
      { name: 'Consulta inicial', duration: 30, price: 20000 },
      { name: 'Control y seguimiento', duration: 20, price: 15000 },
      { name: 'Sesión terapéutica', duration: 45, price: 22000 }
    ],
    servicios: [
      { name: 'Asesoramiento inicial', duration: 30, price: 12000 },
      { name: 'Servicio estándar', duration: 60, price: 20000 },
      { name: 'Revisión técnica', duration: 45, price: 16000 }
    ]
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function getDefaultServices(rubro) {
    const list = RUBRO_DEFAULTS[rubro] || RUBRO_DEFAULTS.peluqueria;
    return list.map(s => ({ ...s }));
  }

  function ensureServicesForRubro(state) {
    if (!state) return;
    if (!state.serviciosTouched || !Array.isArray(state.servicios)) {
      state.servicios = getDefaultServices(state.rubro);
    }
  }

  function cleanServices(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map(s => ({
        name: String(s?.name || '').trim(),
        duration: Math.max(15, Number(s?.duration || 30) || 30),
        price: Math.max(0, Number(s?.price || 0) || 0)
      }))
      .filter(s => s.name.length > 0);
  }

  function serializeServices(state) {
    return JSON.stringify(cleanServices(state?.servicios));
  }

  function renderServiceItem(srv, idx, canDelete) {
    const durOpts = DURATIONS.map(m => `<option value="${m}" ${Number(srv.duration || 30) === m ? 'selected' : ''}>${m} min</option>`).join('');
    return `<div class="emp-srv-row p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2" data-emp-srv-idx="${idx}">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Servicio ${idx + 1}</span>
        ${canDelete ? `<button type="button" data-emp-del-srv="${idx}" class="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer">Quitar</button>` : ''}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div class="sm:col-span-6">
          <label class="sr-only" for="emp-srv-name-${idx}">Nombre del servicio</label>
          <input id="emp-srv-name-${idx}" type="text" maxlength="64" data-emp-srv-field="name" data-idx="${idx}" value="${esc(srv.name)}" placeholder="Ej. Corte clásico" class="w-full p-2.5 rounded-xl bg-white border border-stone-200 focus:border-stone-900 text-xs sm:text-sm text-stone-900 outline-none" />
        </div>
        <div class="sm:col-span-3">
          <label class="sr-only" for="emp-srv-dur-${idx}">Duración</label>
          <select id="emp-srv-dur-${idx}" data-emp-srv-field="duration" data-idx="${idx}" class="w-full p-2.5 rounded-xl bg-white border border-stone-200 focus:border-stone-900 text-xs text-stone-900 tabular-nums outline-none">${durOpts}</select>
        </div>
        <div class="sm:col-span-3 relative">
          <label class="sr-only" for="emp-srv-price-${idx}">Precio</label>
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 pointer-events-none">$</span>
          <input id="emp-srv-price-${idx}" type="number" min="0" step="100" data-emp-srv-field="price" data-idx="${idx}" value="${srv.price === '' ? '' : Number(srv.price || 0)}" placeholder="0" class="w-full p-2.5 pl-6 rounded-xl bg-white border border-stone-200 focus:border-stone-900 text-xs sm:text-sm text-stone-900 tabular-nums outline-none" />
        </div>
      </div>
    </div>`;
  }

  function renderStep(state) {
    ensureServicesForRubro(state);
    const list = state.servicios || [];
    const assistOn = state.asistenciaCarga === 'whatsapp_email';
    const canDelete = list.length > 1 || assistOn;
    const rowsHtml = list.map((s, i) => renderServiceItem(s, i, canDelete)).join('');

    return `<div class="space-y-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tus primeros servicios</h2>
        <p class="text-xs text-stone-500 mt-1">Te sugerimos algunos para empezar, editá lo que quieras o dejá solo uno. Después podés sumar todo tu catálogo.</p>
      </div>
      <div id="emp-services-list" class="space-y-2.5">${rowsHtml}</div>
      <button type="button" id="btn-emp-add-service" class="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 border border-dashed border-stone-300 text-xs font-bold text-stone-800 cursor-pointer transition-colors">
        + Agregar otro servicio
      </button>
      <label for="emp-assist-check" class="flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${assistOn ? 'bg-orange-50 border-orange-300' : 'bg-[#FAF8F5] border-stone-200 hover:bg-stone-100'}">
        <input id="emp-assist-check" type="checkbox" ${assistOn ? 'checked' : ''} class="mt-0.5 w-4 h-4 rounded border-stone-300 accent-orange-600 cursor-pointer" />
        <span class="text-xs leading-snug text-stone-800">
          <strong class="block font-bold text-stone-900">Prefiero mandar mi lista, fotos o un audio por WhatsApp o Email</strong>
          <span class="text-[11px] text-stone-600">Nuestro equipo carga tu lista completa por vos sin frenar tu lanzamiento.</span>
        </span>
      </label>
    </div>`;
  }

  function handleInput(e, state) {
    const t = e.target;
    if (!t || t.dataset?.empSrvField === undefined) return { handled: false };
    const idx = Number(t.dataset.idx);
    const field = t.dataset.empSrvField;
    if (!Array.isArray(state.servicios) || !state.servicios[idx]) return { handled: false };
    state.serviciosTouched = true;
    state.servicios[idx][field] = field === 'name' ? t.value : (Number(t.value) || 0);
    return { handled: true, rerender: false, celebrate: false };
  }

  function handleClick(e, state) {
    const el = e.target;
    if (el.closest('#btn-emp-add-service')) {
      if (!Array.isArray(state.servicios)) state.servicios = [];
      state.serviciosTouched = true;
      state.servicios.push({ name: '', duration: 30, price: 0 });
      return { handled: true, rerender: true, celebrate: true };
    }
    const delBtn = el.closest('[data-emp-del-srv]');
    if (delBtn) {
      const idx = Number(delBtn.dataset.empDelSrv);
      const minLen = state.asistenciaCarga === 'whatsapp_email' ? 0 : 1;
      if (Array.isArray(state.servicios) && state.servicios.length > minLen) {
        state.serviciosTouched = true;
        state.servicios.splice(idx, 1);
      }
      return { handled: true, rerender: true, celebrate: false };
    }
    return { handled: false };
  }

  function handleChange(e, state) {
    if (e.target?.id !== 'emp-assist-check') return { handled: false };
    state.asistenciaCarga = e.target.checked ? 'whatsapp_email' : '';
    return { handled: true, rerender: true, celebrate: e.target.checked };
  }

  function validate(state) {
    if (state?.asistenciaCarga === 'whatsapp_email') return '';
    const valid = cleanServices(state?.servicios);
    if (valid.length >= 1) return '';
    return 'Sumá al menos un servicio con nombre, o marcá la opción para mandarnos tu lista por WhatsApp o Email.';
  }

  return {
    getDefaultServices, ensureServicesForRubro, cleanServices, serializeServices,
    renderStep, handleInput, handleClick, handleChange, validate
  };
})();
