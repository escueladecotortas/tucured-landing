// Archivo: public/js/empezar/empezar_steps.js
// Renderizador Pasos 6-11: Photon, horarios, 4 beneficios por plan, Tus datos de contacto y Volver a Activación (< 140L)

window.TucuEmpezarSteps = (function () {
  const S = () => window.TucuEmpezarState, Pay = () => window.TucuEmpezarCheckoutUI;
  const Slug = () => window.TucuEmpezarSlugCheck, Micro = () => window.TucuEmpezarMicroSteps;
  const Srv = () => window.TucuEmpezarServicesStep, Step11 = () => window.TucuEmpezarStep11;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const SVG = {
    ok: '<svg class="w-4 h-4 shrink-0 text-[#EA580C] mt-0.5" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    nxt: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>',
    up: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>'
  };
  const DAY_OPTS = ['Lunes a viernes', 'Lunes a sábado', 'Todos los días', 'Martes a domingo'];
  const errBox = (msg) => `<p id="emp-error" class="${msg ? '' : 'hidden '}text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">${esc(msg)}</p>`;

  function navBtns(hasPrev, nextLabel, st) {
    const retBtn = st?.returnToSummary ? '<button type="button" id="btn-emp-return-summary" class="wg-btn-ai px-3.5 py-3 rounded-2xl text-xs font-bold cursor-pointer shrink-0">Volver a Activación</button>' : '';
    return `<div class="flex flex-wrap gap-2.5 pt-2">
      ${hasPrev ? '<button type="button" id="btn-emp-prev" class="wg-btn-secondary w-24 py-3 rounded-2xl text-xs font-bold cursor-pointer">Atrás</button>' : ''}
      <button type="button" id="btn-emp-next" class="wg-btn-primary flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"><span>${esc(nextLabel)}</span>${SVG.nxt}</button>
      ${retBtn}
    </div>`;
  }

  function renderStep6(st) {
    const locOpts = S().LOCALIDADES.map((l) => `<option value="${esc(l)}" ${st.localidad === l ? 'selected' : ''}>${esc(l)}</option>`).join('');
    const dayOpts = DAY_OPTS.map((d) => `<option value="${esc(d)}" ${st.horarioDias === d ? 'selected' : ''}>${esc(d)}</option>`).join('');
    const tInp = (id, val, lbl) => `<div class="min-w-0"><label for="${id}" class="block text-[10px] font-bold text-stone-500 mb-0.5">${lbl}</label><input id="${id}" type="time" step="900" value="${esc(val)}" class="w-full p-2 rounded-xl bg-white border border-[#E2D8CB] text-xs tabular-nums text-stone-900 outline-none" /></div>`;
    const geoBadge = st.geoVerified && st.direccionLat && st.direccionLng
      ? `<p id="emp-geo-verified-pill" class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 tabular-nums">&#10003; Ubicación confirmada en el mapa · ${Number(st.direccionLat).toFixed(4)}, ${Number(st.direccionLng).toFixed(4)}</p>`
      : (st.direccion.trim() ? '<p id="emp-geo-soft-warn" class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">Elegí una sugerencia de la lista desplegable para confirmar tu punto exacto en el mapa.</p>' : '');

    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Ubicación y horarios de atención</h2><p class="text-xs text-stone-500 mt-1">Confirmá tu dirección en la localidad elegida y tus franjas reales de atención.</p></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div><label for="emp-localidad" class="block text-xs font-bold text-stone-700 mb-1">Localidad</label><select id="emp-localidad" class="w-full p-2.5 rounded-xl bg-white/90 border border-[#E2D8CB] text-xs text-stone-900 outline-none">${locOpts}</select></div>
        <div class="relative"><label for="emp-direccion" class="block text-xs font-bold text-stone-700 mb-1">Calle y altura</label><input id="emp-direccion" type="text" autocomplete="off" placeholder="Ej. 25 de Mayo 480" value="${esc(st.direccion)}" class="w-full p-2.5 rounded-xl bg-white/90 border border-[#E2D8CB] text-xs text-stone-900 outline-none" /><div id="emp-geo-dropdown" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-[#E2D8CB] rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto"></div></div>
      </div>
      <div><label for="emp-piso-depto" class="block text-xs font-bold text-stone-700 mb-1">Piso / Depto / Local (opcional)</label><input id="emp-piso-depto" type="text" maxlength="40" placeholder="Ej. 2, A o Local 4" value="${esc(st.pisoDepto)}" class="w-full p-2.5 rounded-xl bg-white/90 border border-[#E2D8CB] text-xs text-stone-900 outline-none" /></div>
      ${geoBadge}
      <div class="p-3.5 rounded-2xl wg-option space-y-3">
        <div class="flex items-center justify-between gap-2 flex-wrap"><span class="text-xs font-bold text-stone-800">Horarios de atención</span><div class="flex gap-1.5 p-1 rounded-xl wg-pill"><button type="button" data-emp-sched="corrido" class="px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${st.horarioModalidad === 'corrido' ? 'wg-option-active' : 'text-stone-600'}">Corrido</button><button type="button" data-emp-sched="partido" class="px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${st.horarioModalidad === 'partido' ? 'wg-option-active' : 'text-stone-600'}">Partido</button></div></div>
        <div><label for="emp-sched-days" class="block text-[10px] font-bold text-stone-500 mb-0.5">Días</label><select id="emp-sched-days" class="w-full p-2 rounded-xl bg-white border border-[#E2D8CB] text-xs text-stone-900 outline-none">${dayOpts}</select></div>
        ${st.horarioModalidad === 'partido'
          ? `<div class="space-y-2.5"><div class="space-y-1"><span class="block text-[11px] font-bold text-[#C2410C]">Turno mañana</span><div class="grid grid-cols-2 gap-2">${tInp('emp-open1', st.open1, 'Desde')}${tInp('emp-close1', st.close1, 'Hasta')}</div></div><div class="space-y-1"><span class="block text-[11px] font-bold text-[#C2410C]">Turno tarde</span><div class="grid grid-cols-2 gap-2">${tInp('emp-open2', st.open2, 'Desde')}${tInp('emp-close2', st.close2, 'Hasta')}</div></div></div>`
          : `<div class="grid grid-cols-2 gap-2">${tInp('emp-open1', st.open1, 'Desde')}${tInp('emp-close1', st.close1, 'Hasta')}</div>`}
      </div>
      ${errBox(st.error)}${navBtns(true, 'Continuar a Servicios', st)}
    </div>`;
  }

  const renderStep7 = (st) => `<div class="space-y-4">${Srv()?.renderStep?.(st) || ''}${errBox(st.error)}${navBtns(true, 'Continuar a Link y Plan', st)}</div>`;

  function renderStep8(st) {
    const plansHtml = S().PLANS.map((rawPlan) => {
      const p = S().getPlanMeta(rawPlan.id, st.rubro), on = st.plan === p.id;
      const bullets = p.bullets.map((b) => `<li class="flex items-start gap-2 text-[11.5px] text-stone-700 leading-snug">${SVG.ok}<span>${esc(b)}</span></li>`).join('');
      return `<button type="button" data-emp-plan="${p.id}" aria-pressed="${on}" class="w-full p-4 rounded-2xl text-left cursor-pointer space-y-2.5 ${on ? 'wg-option-active' : 'wg-option'}">
        <div class="flex items-center justify-between gap-2"><strong class="text-sm sm:text-base font-extrabold text-stone-900">${esc(p.name)}</strong><span class="px-2.5 py-0.5 rounded-full bg-orange-100/80 text-xs font-extrabold tabular-nums text-[#C2410C]">${esc(p.promo)} Mes Fundador</span></div>
        <div class="text-[11px] font-medium text-stone-500 tabular-nums">Luego ${esc(p.regular)}</div>
        <ul class="space-y-1.5 pt-0.5">${bullets}</ul>
      </button>`;
    }).join('');
    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tu link de reservas y tu plan</h2><p class="text-xs text-stone-500 mt-1">Es el link que vas a compartir en Instagram y WhatsApp para recibir reservas directo.</p></div>
      <div class="space-y-1.5">
        <label for="emp-slug" class="block text-xs font-bold text-stone-700">Tu link propio</label>
        <div class="flex items-center rounded-xl bg-white/90 border border-[#E2D8CB] focus-within:border-[#EA580C] overflow-hidden"><input id="emp-slug" type="text" maxlength="24" value="${esc(st.slug)}" class="flex-1 p-3 bg-transparent text-sm font-semibold text-stone-900 tabular-nums outline-none min-w-0" /><span class="px-3 py-3 text-xs font-bold text-stone-500 bg-[#F1EBE3] border-l border-[#E2D8CB] shrink-0">.tucured.com.ar</span></div>
        <div id="emp-slug-status-wrap">${Slug()?.renderSlugStatus?.(st.slugCheck, st.slug) || ''}</div>
      </div>
      <div class="space-y-2.5">${plansHtml}</div>
      ${errBox(st.error)}${navBtns(true, 'Continuar a Tus Datos', st)}
    </div>`;
  }

  function renderStep9(st) {
    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tus datos de contacto</h2><p class="text-xs text-stone-500 mt-1">Para enviarte los accesos de tu App y activar el contacto en tu portada.</p></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div><label for="emp-first" class="block text-xs font-bold text-stone-700 mb-1">Nombre</label><input id="emp-first" type="text" placeholder="Ej. Julio" value="${esc(st.titularNombre)}" class="w-full p-2.5 rounded-xl bg-white/90 border border-[#E2D8CB] text-xs sm:text-sm text-stone-900 outline-none" /></div>
        <div><label for="emp-last" class="block text-xs font-bold text-stone-700 mb-1">Apellido</label><input id="emp-last" type="text" placeholder="Ej. Sosa" value="${esc(st.titularApellido)}" class="w-full p-2.5 rounded-xl bg-white/90 border border-[#E2D8CB] text-xs sm:text-sm text-stone-900 outline-none" /></div>
      </div>
      <div>
        <label for="emp-whatsapp" class="block text-xs font-bold text-stone-700 mb-1">WhatsApp (10 dígitos sin 0 ni 15)</label>
        <input id="emp-whatsapp" type="tel" inputmode="numeric" maxlength="14" placeholder="Ej. 3815554321" value="${esc(st.whatsapp)}" class="w-full p-2.5 rounded-xl bg-white/90 border border-[#E2D8CB] text-xs sm:text-sm tabular-nums text-stone-900 outline-none" />
        <p class="text-[11px] text-stone-500 mt-1">Activa el botón directo de WhatsApp en tu portada.</p>
      </div>
      <div>
        <label for="emp-instagram" class="block text-xs font-bold text-stone-700 mb-1">Instagram del comercio (opcional)</label>
        <input id="emp-instagram" type="text" placeholder="@tucomercio" value="${esc(st.instagram)}" class="w-full p-2.5 rounded-xl bg-white/90 border border-[#E2D8CB] text-xs sm:text-sm text-stone-900 outline-none" />
        <p class="text-[11px] text-stone-500 mt-1">Si lo sumás, activamos el botón de Instagram en tu portada.</p>
      </div>
      ${errBox(st.error)}${navBtns(true, 'Revisar y Activar', st)}
    </div>`;
  }

  function renderStep(st, activarHref = '') {
    if (st.submitted || Number(st.step) === 11) return Step11().render(st, activarHref);
    if (st.step <= 5) return Micro().renderBrandStyleStep(st.step, st, { SVG, errBox, navBtns });
    if (st.step === 10) return Pay().renderStep10(st, errBox(st.error));
    return ({ 6: renderStep6, 7: renderStep7, 8: renderStep8, 9: renderStep9 }[st.step] || renderStep6)(st);
  }

  return { renderStep };
})();