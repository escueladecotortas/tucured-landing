// Archivo: public/js/activar/activar_markup.js
// Markup Responsivo 5 Bloques Operativos de Ficha Rápida de Activación (< 170L)

window.TucuActivarMarkup = (function () {
  const D = () => window.TucuActivarData;
  const INP = 'w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D5CEC2] focus:border-[#EA580C] focus:bg-white outline-none text-xs sm:text-sm text-[#1C1917]';
  const SEL = `tucu-clean-select ${INP} pr-9 cursor-pointer`;
  const ARROW = '<svg class="w-4 h-4 text-stone-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4"/></svg>';
  const CARD = 'bg-white rounded-3xl border border-[#D5CEC2] p-5 sm:p-6 shadow-xs space-y-4';
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  function renderServiceRow(idx, item = {}) {
    return `<div class="act-service-row p-3 rounded-2xl bg-[#FAF7F2] border border-[#D5CEC2] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center" data-srv-idx="${idx}">
      <input type="text" class="act-srv-name sm:col-span-5 ${INP} !bg-white" placeholder="Nombre del servicio (ej: Corte Clásico)" value="${esc(item.name || '')}" />
      <input type="number" min="0" class="act-srv-price sm:col-span-2 ${INP} !bg-white font-mono" placeholder="Precio $" value="${esc(item.price || '')}" />
      <select class="act-srv-dur sm:col-span-2 ${INP} !bg-white">${[15, 30, 45, 60, 90, 120].map(m => `<option value="${m}" ${Number(item.duration || 30) === m ? 'selected' : ''}>${m} min</option>`).join('')}</select>
      <label class="sm:col-span-2 flex items-center gap-1.5 text-xs font-semibold text-[#1C1917] cursor-pointer"><input type="checkbox" class="act-srv-sena w-4 h-4 accent-[#EA580C] rounded" ${item.sena !== false ? 'checked' : ''} /><span>Exige seña</span></label>
      <button type="button" class="btn-del-srv sm:col-span-1 py-2 px-2.5 rounded-xl bg-white hover:bg-rose-50 border border-[#D5CEC2] text-rose-600 text-xs font-bold cursor-pointer" title="Quitar servicio">✕</button>
    </div>`;
  }

  function renderStaffRow(idx, item = {}) {
    return `<div class="act-staff-row p-3 rounded-2xl bg-[#FAF7F2] border border-[#D5CEC2] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center" data-st-idx="${idx}">
      <input type="text" class="act-st-name sm:col-span-5 ${INP} !bg-white" placeholder="Nombre profesional (ej: Sofía Mendoza)" value="${esc(item.name || '')}" />
      <input type="text" class="act-st-hours sm:col-span-6 ${INP} !bg-white" placeholder="Turnos / días (ej: Lun a Sáb 09:00-13:00 y 17:00-20:30)" value="${esc(item.hours || '')}" />
      <button type="button" class="btn-del-staff sm:col-span-1 py-2 px-2.5 rounded-xl bg-white hover:bg-rose-50 border border-[#D5CEC2] text-rose-600 text-xs font-bold cursor-pointer" title="Quitar profesional">✕</button>
    </div>`;
  }

  function renderForm(pre = {}) {
    const d = D();
    const isL2 = pre.plan === 'l2', isL3 = pre.plan === 'l3';
    return `<form id="activar-live-form" class="space-y-5" novalidate>
      <section class="${CARD}">
        <h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">storefront</span><span>1. Identidad y Acceso</span></h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label class="block text-xs font-bold mb-1">Nombre comercial *</label><input id="act-comercio" type="text" required class="${INP}" placeholder="Ej: Estudio Norte" value="${esc(pre.comercio)}" /></div>
          <div><label class="block text-xs font-bold mb-1">Titular o responsable *</label><input id="act-titular" type="text" required class="${INP}" placeholder="Nombre y Apellido" value="${esc(pre.titular)}" /></div>
          <div><label class="block text-xs font-bold mb-1">Rubro *</label><div class="relative"><select id="act-rubro" class="${SEL}">${d.RUBROS.map(r => `<option value="${r.id}" ${pre.rubro === r.id ? 'selected' : ''}>${r.label}</option>`).join('')}</select>${ARROW}</div></div>
          <div><label class="block text-xs font-bold mb-1">Localidad *</label><div class="relative"><select id="act-localidad" class="${SEL}">${d.LOCALIDADES.map(c => `<option value="${c}" ${pre.localidad === c ? 'selected' : ''}>${c}</option>`).join('')}</select>${ARROW}</div></div>
          <div class="sm:col-span-2"><label class="block text-xs font-bold mb-1">Dirección física exacta *</label><input id="act-direccion" type="text" required class="${INP}" placeholder="Calle, altura y referencia (ej: Laprida 310, Piso 2)" /></div>
          <div><label class="block text-xs font-bold mb-1">PIN de acceso al panel (4 dígitos) *</label><input id="act-pin" type="text" inputmode="numeric" maxlength="4" required class="${INP} font-mono tracking-widest" placeholder="Ej: 4820" /></div>
          <div><label class="block text-xs font-bold mb-1">Enlace a tu logo (opcional)</label><input id="act-logo-url" type="url" class="${INP}" placeholder="Link de Drive / Instagram / web" /></div>
          <div class="sm:col-span-2"><label class="block text-xs font-bold mb-1">Nota sobre el logo (opcional)</label><input id="act-logo-nota" type="text" class="${INP}" placeholder="Ej: Lo envío ahora por WhatsApp / usar iniciales" /></div>
        </div>
      </section>

      <section class="${CARD}">
        <h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">schedule</span><span>2. Días y Horarios Reales</span></h2>
        <div><span class="block text-xs font-bold mb-2">Días de atención *</span><div class="flex flex-wrap gap-2">${d.DAYS.map(day => `<label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D5CEC2] text-xs font-semibold cursor-pointer"><input type="checkbox" data-act-day="${day}" ${day !== 'Dom' ? 'checked' : ''} class="w-4 h-4 accent-[#EA580C] rounded" /><span>${day}</span></label>`).join('')}</div></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="p-3 rounded-2xl bg-[#FAF7F2] border border-[#D5CEC2] flex items-center gap-2.5 cursor-pointer text-xs font-bold"><input type="radio" name="modalidad_horario" value="corrido" checked class="accent-[#EA580C]" /><span>Horario corrido</span></label>
          <label class="p-3 rounded-2xl bg-[#FAF7F2] border border-[#D5CEC2] flex items-center gap-2.5 cursor-pointer text-xs font-bold"><input type="radio" name="modalidad_horario" value="partido" class="accent-[#EA580C]" /><span>Horario partido (corte de siesta)</span></label>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div><label class="block text-xs font-bold mb-1">Apertura / Mañana</label><input id="act-m-from" type="time" value="09:00" class="${INP} font-mono" /></div>
          <div><label class="block text-xs font-bold mb-1">Cierre / Mediodía</label><input id="act-m-to" type="time" value="18:00" class="${INP} font-mono" /></div>
          <div class="col-span-2 sm:col-span-1"><label class="block text-xs font-bold mb-1">Duración base de turnos</label><div class="relative"><select id="act-intervalo" class="${SEL}">${d.INTERVALS.map(i => `<option value="${i}" ${i === 30 ? 'selected' : ''}>Cada ${i} min</option>`).join('')}</select>${ARROW}</div></div>
        </div>
        <div id="act-tarde-wrap" class="hidden grid grid-cols-2 gap-3 pt-2 border-t border-[#D5CEC2]/60">
          <div><label class="block text-xs font-bold mb-1">Tarde desde</label><input id="act-t-from" type="time" value="17:00" class="${INP} font-mono" /></div>
          <div><label class="block text-xs font-bold mb-1">Tarde hasta</label><input id="act-t-to" type="time" value="21:00" class="${INP} font-mono" /></div>
        </div>
      </section>

      <section class="${CARD}">
        <div class="flex items-center justify-between gap-2 flex-wrap"><h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">design_services</span><span>3. Catálogo de Servicios</span></h2><button type="button" id="btn-add-service" class="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer">+ Agregar servicio</button></div>
        <div id="act-services-list" class="space-y-2.5">${renderServiceRow(0, { name: '', price: '', duration: 30, sena: true })}</div>
      </section>

      <section class="${CARD}">
        <h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">payments</span><span>4. Señas y WhatsApp</span></h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label class="block text-xs font-bold mb-1">Modalidad de seña web</label><div class="relative"><select id="act-sena-mode" class="${SEL}"><option value="porcentaje">Porcentaje (%)</option><option value="fijo">Monto fijo ($)</option><option value="sin_sena">Sin seña web</option></select>${ARROW}</div></div>
          <div id="act-sena-val-wrap"><label class="block text-xs font-bold mb-1">Valor de seña *</label><input id="act-sena-val" type="number" min="1" value="50" class="${INP} font-mono" /></div>
          <div><label class="block text-xs font-bold mb-1">Alias para recibir señas</label><input id="act-alias" type="text" class="${INP} font-mono" placeholder="Ej: milocal.mp" /></div>
          <div><label class="block text-xs font-bold mb-1">CBU / CVU (opcional)</label><input id="act-cbu" type="text" maxlength="22" class="${INP} font-mono" placeholder="22 dígitos" /></div>
          <div class="sm:col-span-2"><span class="block text-xs font-bold mb-2">Medios de pago aceptados en el local</span><div class="flex flex-wrap gap-2">${d.PAYMENT_METHODS.map(pm => `<label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D5CEC2] text-xs font-semibold cursor-pointer"><input type="checkbox" data-act-pm="${pm}" checked class="w-4 h-4 accent-[#EA580C] rounded" /><span>${pm}</span></label>`).join('')}</div></div>
          <div class="sm:col-span-2"><label class="block text-xs font-bold mb-1">WhatsApp oficial del local *</label><div class="flex items-center gap-2"><input id="act-whatsapp" type="tel" required class="${INP} font-mono" placeholder="Ej: 3815554321" /><span id="act-wa-e164" class="text-[11px] font-mono font-bold text-stone-500 shrink-0">+549</span></div></div>
        </div>
      </section>

      <section class="${CARD}">
        <h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">groups</span><span>5. Modalidad de Equipo / Espacios</span></h2>
        <div><label class="block text-xs font-bold mb-1">Plan contratado</label><div class="relative"><select id="act-plan" class="${SEL}">${d.LEVELS.map(l => `<option value="${l.id}" ${pre.plan === l.id ? 'selected' : ''}>${l.label}</option>`).join('')}</select>${ARROW}</div></div>
        <div id="act-l2-box" class="${isL2 ? '' : 'hidden'} grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D5CEC2]/60">
          <div><label class="block text-xs font-bold mb-1">Cantidad de boxes / canchas / mesas *</label><input id="act-l2-spaces" type="number" min="1" value="2" class="${INP} font-mono" /></div>
          <div><label class="block text-xs font-bold mb-1">Capacidad máxima por turno *</label><input id="act-l2-cap" type="number" min="1" value="4" class="${INP} font-mono" /></div>
        </div>
        <div id="act-l3-box" class="${isL3 ? '' : 'hidden'} space-y-2.5 pt-2 border-t border-[#D5CEC2]/60">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold">Profesionales del equipo y sus horarios *</span><button type="button" id="btn-add-staff" class="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer">+ Agregar profesional</button></div>
          <div id="act-staff-list" class="space-y-2">${renderStaffRow(0, {})}</div>
        </div>
      </section>

      <p id="activar-error" class="hidden text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3" role="alert"></p>
      <button type="submit" id="btn-activar-submit" class="w-full py-4 px-6 rounded-2xl bg-[#EA580C] hover:bg-orange-700 text-white font-title font-extrabold text-sm sm:text-base shadow-lg transition-colors cursor-pointer">
        Enviar ficha para configurar mi turnero
      </button>
    </form>`;
  }

  function renderSuccessCard(payload = {}, waUrl = '#') {
    return `<div class="bg-white rounded-3xl border border-[#D5CEC2] p-6 sm:p-10 text-center space-y-5 shadow-sm">
      <div class="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600"><span class="material-symbols-outlined text-4xl">check_circle</span></div>
      <h2 class="font-title text-2xl font-extrabold text-[#1C1917]">¡Ficha recibida para ${esc(payload.comercio)}!</h2>
      <p class="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">Nuestro equipo ya cuenta con tus horarios, servicios y reglas de seña. En breve te enviaremos por WhatsApp los enlaces oficiales de tu Turnero y Panel de Control.</p>
      <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a id="btn-activar-wa-confirm" href="${waUrl}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-title font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"><span class="material-symbols-outlined text-lg">chat</span><span>Avisar por WhatsApp que completé mi ficha</span></a>
        <a href="/" class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-stone-200 border border-[#D5CEC2] text-[#1C1917] font-title font-bold text-sm transition-colors">Volver a tucured.ar</a>
      </div>
    </div>`;
  }

  return { renderServiceRow, renderStaffRow, renderForm, renderSuccessCard };
})();
