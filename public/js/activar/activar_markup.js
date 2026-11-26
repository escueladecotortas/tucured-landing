// Archivo: public/js/activar/activar_markup.js
// Markup Warm Studio 5 Bloques Responsivos, Banner Heredado y Planes Oficiales (< 165L)

window.TucuActivarMarkup = (function () {
  const D = () => window.TucuActivarData;
  const INP = 'w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D5CEC2] focus:border-[#EA580C] focus:bg-white outline-none text-xs sm:text-sm text-[#1C1917]';
  const SEL = `tucu-clean-select ${INP} pr-9 cursor-pointer`;
  const ARROW = '<svg class="w-4 h-4 text-stone-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4"/></svg>';
  const CARD = 'bg-white rounded-3xl border border-[#D5CEC2] p-4 sm:p-6 shadow-xs space-y-4';
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  function renderServiceRow(idx, item = {}) {
    return `<div class="act-service-row p-3 rounded-2xl bg-[#FAF7F2] border border-[#D5CEC2] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center" data-srv-idx="${idx}">
      <input type="text" class="act-srv-name sm:col-span-5 ${INP} !bg-white" placeholder="Nombre del servicio (ej: Corte Clásico)" value="${esc(item.name || '')}" />
      <input type="number" min="0" class="act-srv-price sm:col-span-2 ${INP} !bg-white tabular-nums" placeholder="Precio $" value="${esc(item.price || '')}" />
      <select class="act-srv-dur sm:col-span-2 ${INP} !bg-white">${[15, 20, 30, 45, 60, 90, 120].map(m => `<option value="${m}" ${Number(item.duration || 30) === m ? 'selected' : ''}>${m} min</option>`).join('')}</select>
      <label class="sm:col-span-2 flex items-center gap-1.5 text-xs font-semibold text-[#1C1917] cursor-pointer"><input type="checkbox" class="act-srv-sena w-4 h-4 accent-[#EA580C] rounded" ${item.sena !== false ? 'checked' : ''} /><span>Exige seña</span></label>
      <button type="button" class="btn-del-srv sm:col-span-1 py-2 px-2.5 rounded-xl bg-white hover:bg-rose-50 border border-[#D5CEC2] text-rose-600 text-xs font-bold cursor-pointer" title="Quitar servicio">&times;</button>
    </div>`;
  }

  function renderStaffRow(idx, item = {}) {
    return `<div class="act-staff-row p-3 rounded-2xl bg-[#FAF7F2] border border-[#D5CEC2] grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center" data-st-idx="${idx}">
      <input type="text" class="act-st-name sm:col-span-4 ${INP} !bg-white" placeholder="Nombre profesional" value="${esc(item.name || '')}" />
      <input type="text" class="act-st-spec sm:col-span-4 ${INP} !bg-white" placeholder="Especialidad (ej: Color, Barba)" value="${esc(item.spec || '')}" />
      <select class="act-st-sched sm:col-span-3 ${INP} !bg-white"><option value="Horario general del local">Horario general del local</option><option value="Horario propio a coordinar">Horario propio a coordinar</option></select>
      <button type="button" class="btn-del-staff sm:col-span-1 py-2 px-2.5 rounded-xl bg-white hover:bg-rose-50 border border-[#D5CEC2] text-rose-600 text-xs font-bold cursor-pointer" title="Quitar profesional">&times;</button>
    </div>`;
  }

  function renderBlock5Body(plan, rubro) {
    const cfg = D().RUBRO_SPACE_CONFIG[rubro] || D().RUBRO_SPACE_CONFIG.servicios;
    if (plan === 'l1') {
      if (cfg.needsCapacity) {
        return `<div class="space-y-3 pt-2 border-t border-[#D5CEC2]/60">
          <p class="text-xs text-stone-600">Tu Plan Turnos gestiona la agenda individual de tu local. Indicá el cupo máximo por turno:</p>
          <div><label class="block text-xs font-bold mb-1">${esc(cfg.capLabel)} *</label><input id="act-cap-turno" type="number" min="1" value="4" class="${INP} tabular-nums sm:max-w-xs" /></div>
        </div>`;
      }
      return `<div class="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D5CEC2] text-xs text-stone-700 leading-relaxed flex items-start gap-2.5">
        <span class="material-symbols-outlined text-[#EA580C] text-lg shrink-0">check_circle</span>
        <span>Tu <strong>Plan Turnos</strong> opera con agenda individual 1 a 1. Solo cargá tus horarios, servicios y Alias propio.</span>
      </div>`;
    }
    if (plan === 'l2') {
      return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D5CEC2]/60">
        <div><label class="block text-xs font-bold mb-1">Cantidad de ${esc(cfg.plural)} *</label><input id="act-l2-spaces" type="number" min="1" value="2" class="${INP} tabular-nums" /></div>
        <div><label class="block text-xs font-bold mb-1">Nombres de ${esc(cfg.plural)} (opcional)</label><input id="act-l2-names" type="text" class="${INP}" placeholder="${esc(cfg.placeholder)}" /></div>
        ${cfg.needsCapacity ? `<div class="sm:col-span-2"><label class="block text-xs font-bold mb-1">${esc(cfg.capLabel)} *</label><input id="act-cap-turno" type="number" min="1" value="4" class="${INP} tabular-nums sm:max-w-xs" /></div>` : ''}
      </div>`;
    }
    return `<div class="space-y-2.5 pt-2 border-t border-[#D5CEC2]/60">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <span class="text-xs font-bold text-[#1C1917]">Profesionales del equipo *</span>
        <button type="button" id="btn-add-staff" class="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer">+ Agregar profesional</button>
      </div>
      <div id="act-staff-list" class="space-y-2">${renderStaffRow(0, {})}</div>
    </div>`;
  }

  function renderInheritedBanner(pre, planObj) {
    if (!pre.hasInherited) return '';
    const chips = [
      pre.comercio ? `Comercio: <strong>${esc(pre.comercio)}</strong>` : '',
      `Plan: <strong>${esc(planObj.label)}</strong>`,
      pre.slug ? `Web: <strong class="tabular-nums">${esc(pre.slug)}.tucured.com.ar</strong>` : '',
      pre.tonoLabel ? `Tono: <strong>${esc(pre.tonoLabel)}</strong>` : '',
      pre.coverLabel ? `Portada: <strong>${esc(pre.coverLabel)}</strong>` : ''
    ].filter(Boolean).map(c => `<span class="px-2.5 py-1 rounded-full bg-white border border-orange-200 text-[11px] text-stone-800">${c}</span>`).join('');
    return `<section id="activar-inherited-banner" class="rounded-3xl bg-orange-50/85 border border-orange-200 p-4 sm:p-5 space-y-2">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <span class="text-xs font-extrabold uppercase tracking-wider text-[#EA580C]">Datos heredados de tu alta</span>
        <span class="text-[11px] font-semibold text-stone-600">Completá agenda, servicios y Alias propio para salir en vivo</span>
      </div>
      <div class="flex flex-wrap gap-1.5">${chips}</div>
    </section>`;
  }

  function renderForm(pre = {}) {
    const d = D();
    const planObj = d.LEVELS.find(l => l.id === pre.plan) || d.LEVELS[1];
    const waInit = d.formatE164Ar(pre.whatsapp || '');
    return `<form id="activar-live-form" class="space-y-5" novalidate>
      ${renderInheritedBanner(pre, planObj)}
      <section class="${CARD}">
        <h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">storefront</span><span>1. Identidad y Contacto</span></h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2"><label class="block text-xs font-bold mb-1">Nombre comercial *</label><input id="act-comercio" type="text" required class="${INP}" placeholder="Ej: Estudio Norte" value="${esc(pre.comercio)}" /></div>
          <div><label class="block text-xs font-bold mb-1">Nombre del titular *</label><input id="act-nombre-titular" type="text" required class="${INP}" placeholder="Nombre" value="${esc(pre.nombreTitular)}" /></div>
          <div><label class="block text-xs font-bold mb-1">Apellido del titular *</label><input id="act-apellido-titular" type="text" required class="${INP}" placeholder="Apellido" value="${esc(pre.apellidoTitular)}" /></div>
          <div><label class="block text-xs font-bold mb-1">Email del local *</label><input id="act-email" type="email" required class="${INP}" placeholder="contacto@tulocal.com" value="${esc(pre.email)}" /></div>
          <div><label class="block text-xs font-bold mb-1">Instagram (opcional)</label><input id="act-instagram" type="text" class="${INP}" placeholder="@milocal" value="${esc(pre.instagram || '')}" /></div>
          <div><label class="block text-xs font-bold mb-1">Rubro *</label><div class="relative"><select id="act-rubro" class="${SEL}">${d.RUBROS.map(r => `<option value="${r.id}" ${pre.rubro === r.id ? 'selected' : ''}>${r.label}</option>`).join('')}</select>${ARROW}</div></div>
          <div><label class="block text-xs font-bold mb-1">Localidad *</label><div class="relative"><select id="act-localidad" class="${SEL}">${d.LOCALIDADES.map(c => `<option value="${c}" ${pre.localidad === c ? 'selected' : ''}>${c}</option>`).join('')}</select>${ARROW}</div></div>
          <div class="relative">
            <label class="block text-xs font-bold mb-1">Dirección física (calle y altura) *</label>
            <input id="act-direccion" type="text" autocomplete="off" required class="${INP}" placeholder="Ej: Laprida 310" value="${esc(pre.direccion || '')}" />
            <div id="act-geo-dropdown" class="hidden absolute left-0 right-0 top-[calc(100%+4px)] z-40 bg-white border border-[#D5CEC2] rounded-2xl shadow-xl max-h-52 overflow-y-auto"></div>
            <p id="act-geo-height-notice" class="hidden text-[11px] font-semibold text-amber-700 mt-1">Agregá la altura/número de calle</p>
            <p id="act-geo-badge" class="hidden text-[11px] font-bold text-emerald-700 mt-1"></p>
            <input type="hidden" id="act-dir-norm" /><input type="hidden" id="act-dir-lat" /><input type="hidden" id="act-dir-lng" />
          </div>
          <div><label class="block text-xs font-bold mb-1">Referencia adicional (opcional)</label><input id="act-dir-ref" type="text" class="${INP}" placeholder="Piso 2, Local B / Esquina" /></div>
        </div>
        <div id="act-logo-mount"></div>
      </section>
      <section class="${CARD}">
        <h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">schedule</span><span>2. Días y Horarios Reales</span></h2>
        <div id="act-schedule-mount" class="space-y-3"></div>
      </section>
      <section class="${CARD}">
        <div class="flex items-center justify-between gap-2 flex-wrap"><h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">design_services</span><span>3. Catálogo de Servicios</span></h2><button type="button" id="btn-add-service" class="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-xs font-bold cursor-pointer">+ Agregar servicio</button></div>
        <div id="act-services-list" class="space-y-2.5">${renderServiceRow(0, { name: '', price: '', duration: 30, sena: true })}</div>
      </section>
      <section class="${CARD}">
        <h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">payments</span><span>4. Señas y WhatsApp</span></h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2"><label class="block text-xs font-bold mb-1">Modalidad de seña web</label><div class="relative"><select id="act-sena-mode" class="${SEL}"><option value="porcentaje">Porcentaje (%)</option><option value="fijo">Monto fijo ($)</option><option value="sin_sena">Sin seña — confirmación directa</option></select>${ARROW}</div></div>
          <div id="act-sena-fields-wrap" class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label class="block text-xs font-bold mb-1">Valor de seña *</label><input id="act-sena-val" type="number" min="1" value="50" class="${INP} tabular-nums" /></div>
            <div><label class="block text-xs font-bold mb-1">Alias para recibir señas *</label><input id="act-alias" type="text" class="${INP} tabular-nums" placeholder="Ej: milocal.mp" /></div>
            <div><label class="block text-xs font-bold mb-1">CBU / CVU (opcional)</label><input id="act-cbu" type="text" maxlength="22" class="${INP} tabular-nums" placeholder="22 dígitos" /></div>
          </div>
          <div class="sm:col-span-2"><span class="block text-xs font-bold mb-2">Medios de pago aceptados en el local</span><div class="flex flex-wrap gap-2">${d.PAYMENT_METHODS.map(pm => `<label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D5CEC2] text-xs font-semibold cursor-pointer"><input type="checkbox" data-act-pm="${pm}" checked class="w-4 h-4 accent-[#EA580C] rounded" /><span>${pm}</span></label>`).join('')}</div></div>
          <div class="sm:col-span-2"><label class="block text-xs font-bold mb-1">WhatsApp oficial del local *</label><div class="flex items-center gap-2"><input id="act-whatsapp" type="tel" required class="${INP} tabular-nums" placeholder="Ej: 3815554321" value="${esc(waInit.digits10)}" /><span id="act-wa-e164" class="text-[11px] tabular-nums font-bold shrink-0 ${waInit.e164 ? 'text-emerald-700' : 'text-stone-400'}">${waInit.e164 || '+549...'}</span></div></div>
        </div>
      </section>
      <section class="${CARD}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 class="font-title text-base sm:text-lg font-bold text-[#1C1917] flex items-center gap-2"><span class="material-symbols-outlined text-[#EA580C]">groups</span><span>5. Modalidad de Equipo / Espacios</span></h2>
          <span id="act-plan-badge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-[11px] font-bold">Plan contratado: ${esc(planObj.label)}</span>
          <input type="hidden" id="act-plan" name="plan" value="${esc(planObj.id)}" />
        </div>
        <div id="act-block5-body">${renderBlock5Body(planObj.id, pre.rubro)}</div>
      </section>
      <p id="activar-error" class="hidden text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3" role="alert"></p>
      <button type="submit" id="btn-activar-submit" class="w-full py-4 px-6 rounded-2xl bg-[#EA580C] hover:bg-orange-700 text-white font-title font-extrabold text-sm sm:text-base shadow-lg transition-colors cursor-pointer">Enviar ficha para configurar mi turnero</button>
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

  return { renderServiceRow, renderStaffRow, renderBlock5Body, renderForm, renderSuccessCard };
})();
