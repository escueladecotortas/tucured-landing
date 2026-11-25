// Archivo: public/js/empezar/empezar_steps.js
// Renderizador de micro-pantallas 6-10, vista de éxito y navegación con botón Atrás (< 175L)

window.TucuEmpezarSteps = (function () {
  const S = () => window.TucuEmpezarState, T = () => window.TucuEmpezarTones;
  const C = () => window.TucuEmpezarCovers, Pay = () => window.TucuEmpezarCheckoutUI;
  const Slug = () => window.TucuEmpezarSlugCheck, Micro = () => window.TucuEmpezarMicroSteps;
  const Srv = () => window.TucuEmpezarServicesStep;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const SVG = {
    ok: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    nxt: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>',
    up: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>'
  };
  const DAY_OPTS = ['Lunes a viernes', 'Lunes a sábado', 'Todos los días', 'Martes a domingo'];
  const errBox = (msg) => `<p id="emp-error" class="${msg ? '' : 'hidden '}text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">${esc(msg)}</p>`;
  const navBtns = (hasPrev, nextLabel) => `
    <div class="flex gap-2.5 pt-2">
      ${hasPrev ? '<button type="button" id="btn-emp-prev" class="w-1/3 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer">Atrás</button>' : ''}
      <button type="button" id="btn-emp-next" class="${hasPrev ? 'w-2/3' : 'w-full'} py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"><span>${esc(nextLabel)}</span>${SVG.nxt}</button>
    </div>`;

  function renderStep6(st) {
    const locOpts = S().LOCALIDADES.map(l => `<option value="${esc(l)}" ${st.localidad === l ? 'selected' : ''}>${esc(l)}</option>`).join('');
    const dayOpts = DAY_OPTS.map(d => `<option value="${esc(d)}" ${st.horarioDias === d ? 'selected' : ''}>${esc(d)}</option>`).join('');
    const tInp = (id, val, lbl) => `<div class="min-w-0"><label for="${id}" class="block text-[10px] font-bold text-stone-500 mb-0.5">${lbl}</label><input id="${id}" type="time" step="900" value="${esc(val)}" class="w-full p-2 rounded-xl bg-white border border-stone-200 text-xs tabular-nums text-stone-900 outline-none" /></div>`;
    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Ubicación y horarios de atención</h2><p class="text-xs text-stone-500 mt-1">Contanos dónde está tu local y en qué franja atendés habitualmente.</p></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div><label for="emp-localidad" class="block text-xs font-bold text-stone-700 mb-1">Localidad</label><select id="emp-localidad" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none">${locOpts}</select></div>
        <div class="relative"><label for="emp-direccion" class="block text-xs font-bold text-stone-700 mb-1">Dirección del local</label><input id="emp-direccion" type="text" autocomplete="off" placeholder="Ej. 25 de Mayo 480" value="${esc(st.direccion)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none" /><input id="emp-dir-lat" type="hidden" value="${esc(st.direccionLat)}" /><input id="emp-dir-lng" type="hidden" value="${esc(st.direccionLng)}" /><div id="emp-geo-dropdown" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto"></div></div>
      </div>
      <div class="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
        <div class="flex items-center justify-between gap-2 flex-wrap"><span class="text-xs font-bold text-stone-800">Horarios base</span><div class="flex gap-1.5"><button type="button" data-emp-sched="corrido" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${st.horarioModalidad === 'corrido' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'}">Corrido</button><button type="button" data-emp-sched="partido" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${st.horarioModalidad === 'partido' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'}">Partido</button></div></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 tabular-nums">
          <div class="min-w-0"><label for="emp-sched-days" class="block text-[10px] font-bold text-stone-500 mb-0.5">Días</label><select id="emp-sched-days" class="w-full p-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none">${dayOpts}</select></div>
          ${tInp('emp-open1', st.open1, st.horarioModalidad === 'partido' ? 'Abre mañana' : 'Abre')}
          ${tInp('emp-close1', st.close1, st.horarioModalidad === 'partido' ? 'Cierra mañana' : 'Cierra')}
        </div>
        ${st.horarioModalidad === 'partido' ? `<div class="grid grid-cols-2 gap-2 tabular-nums">${tInp('emp-open2', st.open2, 'Abre tarde')}${tInp('emp-close2', st.close2, 'Cierra tarde')}</div>` : ''}
      </div>
      ${errBox(st.error)}${navBtns(true, 'Continuar a Servicios')}
    </div>`;
  }

  function renderStep7(st) {
    return `<div class="space-y-4">
      ${Srv()?.renderStep?.(st) || ''}
      ${errBox(st.error)}${navBtns(true, 'Continuar a Dirección Web y Plan')}
    </div>`;
  }

  function renderStep8(st) {
    const plansHtml = S().PLANS.map(p => {
      const on = st.plan === p.id;
      return `<button type="button" data-emp-plan="${p.id}" class="w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${on ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'bg-[#FAF8F5] border-stone-200 text-stone-800 hover:bg-stone-100'}">
        <div class="flex items-center justify-between gap-2"><span class="text-[11px] font-bold uppercase tracking-wider ${on ? 'text-stone-300' : 'text-stone-500'}">${esc(p.badge)}</span><span class="text-xs font-extrabold tabular-nums">${esc(p.promo)} Mes Fundador</span></div>
        <div class="flex items-baseline justify-between gap-2 mt-0.5"><strong class="text-sm font-extrabold">${esc(p.name)}</strong><span class="text-[11px] tabular-nums ${on ? 'text-stone-300' : 'text-stone-500'}">Luego ${esc(p.regular)}</span></div>
        <p class="text-[11px] mt-1 ${on ? 'text-stone-300' : 'text-stone-500'}">${esc(p.desc)}</p>
      </button>`;
    }).join('');
    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tu dirección web y plan</h2><p class="text-xs text-stone-500 mt-1">Elegí el enlace propio de tu App (3 a 24 caracteres). Todo con 0% comisiones por turno.</p></div>
      <div class="space-y-1.5">
        <label for="emp-slug" class="block text-xs font-bold text-stone-700">Dirección web deseada</label>
        <div class="flex items-center rounded-xl bg-[#FAF8F5] border border-stone-200 focus-within:border-stone-900 overflow-hidden"><input id="emp-slug" type="text" maxlength="24" value="${esc(st.slug)}" class="flex-1 p-3 bg-transparent text-sm font-semibold text-stone-900 tabular-nums outline-none min-w-0" /><span class="px-3 py-3 text-xs font-bold text-stone-500 bg-stone-100 border-l border-stone-200 shrink-0">.tucured.com.ar</span></div>
        <div id="emp-slug-status-wrap">${Slug()?.renderSlugStatus?.(st.slugCheck, st.slug) || ''}</div>
      </div>
      <div class="space-y-2"><span class="block text-xs font-bold text-stone-700">Elegí el plan ideal para tu ritmo</span><div class="space-y-2">${plansHtml}</div></div>
      ${errBox(st.error)}${navBtns(true, 'Continuar a Tus Datos')}
    </div>`;
  }

  function renderStep9(st) {
    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tus datos de contacto</h2><p class="text-xs text-stone-500 mt-1">Con estos datos te enviamos tus accesos y acompañamos tu puesta en marcha.</p></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div><label for="emp-first" class="block text-xs font-bold text-stone-700 mb-1">Tu nombre</label><input id="emp-first" type="text" placeholder="Ej. Julio" value="${esc(st.titularNombre)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none" /></div>
        <div><label for="emp-last" class="block text-xs font-bold text-stone-700 mb-1">Tu apellido</label><input id="emp-last" type="text" placeholder="Ej. Sosa" value="${esc(st.titularApellido)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none" /></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div><label for="emp-whatsapp" class="block text-xs font-bold text-stone-700 mb-1">WhatsApp (10 dígitos)</label><input id="emp-whatsapp" type="tel" inputmode="numeric" maxlength="14" placeholder="Ej. 3815554321" value="${esc(st.whatsapp)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs sm:text-sm tabular-nums text-stone-900 outline-none" /></div>
        <div><label for="emp-email" class="block text-xs font-bold text-stone-700 mb-1">Email</label><input id="emp-email" type="email" placeholder="contacto@tulocal.com" value="${esc(st.email)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none" /></div>
      </div>
      <div><label for="emp-instagram" class="block text-xs font-bold text-stone-700 mb-1">Instagram del comercio (opcional)</label><input id="emp-instagram" type="text" placeholder="@tucomercio" value="${esc(st.instagram)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs sm:text-sm text-stone-900 outline-none" /></div>
      ${errBox(st.error)}${navBtns(true, 'Ver Resumen y Activar')}
    </div>`;
  }

  function renderStep10(st) {
    const rubro = S().getRubroMeta(st.rubro), plan = S().getPlanMeta(st.plan), toneLbl = T().getToneMeta(st.tonoVoz).label;
    const covLbl = st.coverMode === 'custom' ? 'Foto propia' : (C().getCoverById(st.coverId)?.nombre || 'Portada del rubro');
    const cleanSrvs = Srv()?.cleanServices?.(st.servicios) || [];
    const srvTxt = st.asistenciaCarga === 'whatsapp_email' ? 'Envío asistido por WhatsApp / Email' : `${cleanSrvs.length} ${cleanSrvs.length === 1 ? 'servicio inicial' : 'servicios iniciales'}`;
    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Activación Mes Fundador</h2><p class="text-xs text-stone-500 mt-1">Revisá cómo quedó tu App, activá tu primer mes y sumá más detalles cuando quieras.</p></div>
      <div class="rounded-2xl bg-[#F5F2EC] border border-stone-200 p-4 space-y-1.5 text-xs tabular-nums">
        <div class="flex justify-between gap-2"><span class="text-stone-500">Comercio</span><strong class="text-stone-900 text-right">${esc(st.comercio)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Dirección web</span><strong class="text-emerald-700 text-right">https://${esc(st.slug)}.tucured.com.ar</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Plan elegido</span><strong class="text-stone-900 text-right">${esc(plan.name)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Rubro · Tono · Portada</span><strong class="text-stone-900 text-right">${esc(rubro.short)} · ${esc(toneLbl)} · ${esc(covLbl)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Ubicación</span><strong class="text-stone-900 text-right">${esc(st.direccion)}, ${esc(st.localidad)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Servicios</span><strong class="text-stone-900 text-right">${esc(srvTxt)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Titular</span><strong class="text-stone-900 text-right">${esc(st.titularNombre)} ${esc(st.titularApellido)} · ${esc(st.whatsapp)}</strong></div>
      </div>
      ${Pay().renderPaymentCards()}
      <label class="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer"><input id="emp-terms" type="checkbox" ${st.termsAccepted ? 'checked' : ''} class="mt-0.5 w-4 h-4 rounded border-stone-300 accent-stone-900" /><span>Acepto los <a href="/terminos.html" target="_blank" rel="noopener noreferrer" class="underline font-semibold text-stone-900">Términos y Condiciones</a> del servicio TucuRed.</span></label>
      ${errBox(st.error)}
      <div class="flex gap-2.5"><button type="button" id="btn-emp-prev" class="w-1/3 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer">Atrás</button><button type="button" id="btn-empezar-submit" ${st.submitting ? 'disabled' : ''} class="w-2/3 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">${st.submitting ? 'Registrando alta...' : 'Activar mi Mes Fundador — $4.999'}</button></div>
    </div>`;
  }

  function renderSuccess(st, activarHref) {
    const plan = S().getPlanMeta(st.plan);
    return `<div id="emp-success-view" class="space-y-4 text-center py-2">
      <div class="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">${SVG.ok}</div>
      <div><h2 class="text-xl font-extrabold text-stone-900">¡Tu App ya está en marcha!</h2><p class="text-xs text-stone-600 mt-1">Tu espacio para <strong>${esc(st.comercio)}</strong> ya tiene portada, dirección web y acceso reservado.</p></div>
      <div class="rounded-2xl bg-[#F5F2EC] border border-stone-200 p-4 text-left space-y-1.5 text-xs tabular-nums">
        <div class="flex justify-between gap-2"><span class="text-stone-500">Tu futura App</span><strong id="emp-success-domain" class="text-emerald-700">https://${esc(st.slug)}.tucured.com.ar</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Plan seleccionado</span><strong id="emp-success-plan" class="text-stone-900">${esc(plan.name)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Siguiente paso</span><strong class="text-stone-900 text-right">Sumá detalles finos y tu Alias propio</strong></div>
      </div>
      <div class="flex flex-col sm:flex-row gap-2.5 pt-1">
        <a id="btn-goto-activar" href="${esc(activarHref)}" class="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold text-center">Configurar más detalles ahora</a>
        <button type="button" id="btn-emp-later" class="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold text-center cursor-pointer">Completar más tarde</button>
      </div>
      <p id="emp-later-notice" class="hidden text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-left">Guardamos todo tu avance y te enviamos el enlace directo por WhatsApp para que completes más detalles cuando quieras.</p>
    </div>`;
  }

  function renderStep(st, activarHref = '') {
    if (st.submitted) return renderSuccess(st, activarHref);
    if (st.step <= 5) return Micro().renderBrandStyleStep(st.step, st, { SVG, errBox, navBtns });
    const views = { 6: renderStep6, 7: renderStep7, 8: renderStep8, 9: renderStep9, 10: renderStep10 };
    return (views[st.step] || renderStep6)(st);
  }

  return { renderStep, renderSuccess };
})();
