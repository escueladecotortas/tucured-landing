// Archivo: public/js/empezar/empezar_steps.js
// Renderizadores de los 4 micro-pasos y pantalla de confirmación para /empezar.html (< 185L)

window.TucuEmpezarSteps = (function () {
  const S = () => window.TucuEmpezarState;
  const M = () => window.TucuEmpezarMedia;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const SVG = {
    ok: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    nxt: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>',
    up: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>'
  };
  const TIME_OPTS = ['07:00', '08:00', '08:30', '09:00', '09:30', '10:00', '12:00', '13:00', '13:30', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '23:30'];
  const DAY_OPTS = ['Lunes a viernes', 'Lunes a sábado', 'Todos los días', 'Martes a domingo'];

  const errBox = (msg) => `<p id="emp-error" class="${msg ? '' : 'hidden '}text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">${esc(msg)}</p>`;
  const navBtns = (hasPrev, nextLabel) => `
    <div class="flex gap-2.5 pt-2">
      ${hasPrev ? '<button type="button" id="btn-emp-prev" class="w-1/3 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer">Volver</button>' : ''}
      <button type="button" id="btn-emp-next" class="${hasPrev ? 'w-2/3' : 'w-full'} py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
        <span>${esc(nextLabel)}</span>${SVG.nxt}
      </button>
    </div>`;

  function renderStep1(st) {
    const logoSlot = M().getSlot('logo'), coverSlot = M().getSlot('cover');
    const rubrosHtml = S().RUBROS.map(r => {
      const on = st.rubro === r.id;
      return `<button type="button" data-emp-rubro="${r.id}" class="p-2.5 rounded-xl border text-left text-xs font-bold cursor-pointer transition-all ${on ? 'bg-stone-900 border-stone-900 text-white shadow-xs' : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:bg-stone-100'}">${esc(r.short)}</button>`;
    }).join('');
    const accentsHtml = S().ACCENT_OPTIONS.map(a => {
      const on = st.accent === a.id;
      return `<button type="button" data-emp-accent="${a.id}" title="${esc(a.label)}" aria-label="${esc(a.label)}" style="background-color:${a.bg}" class="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer transition-transform ${on ? 'ring-2 ring-offset-2 ring-stone-900 scale-105' : 'opacity-85 hover:opacity-100'}">${on ? SVG.ok : ''}</button>`;
    }).join('');

    return `<div class="space-y-4">
      <div><h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Diseñá tu App de turnos</h1><p class="text-xs text-stone-500 mt-0.5">Personalizá la portada y mirá los cambios en tiempo real.</p></div>
      <div><label for="emp-comercio" class="block text-xs font-bold text-stone-700 mb-1">Nombre de tu comercio</label><input id="emp-comercio" type="text" maxlength="60" placeholder="Ej. Barbería Don Julio" value="${esc(st.comercio)}" class="w-full p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 focus:border-stone-900 text-sm text-stone-900 outline-none" /></div>
      <div><span class="block text-xs font-bold text-stone-700 mb-1.5">Rubro principal</span><div class="grid grid-cols-2 sm:grid-cols-3 gap-2">${rubrosHtml}</div></div>
      <div><label for="emp-bajada" class="block text-xs font-bold text-stone-700 mb-1">Frase de presentación (opcional)</label><input id="emp-bajada" type="text" maxlength="110" placeholder="Ej. Cortes clásicos, barba y atención con turno previo." value="${esc(st.bajada)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 focus:border-stone-900 text-xs text-stone-900 outline-none" /></div>
      <div><span class="block text-xs font-bold text-stone-700 mb-2">Color de acento</span><div class="flex flex-wrap items-center gap-2.5">${accentsHtml}</div></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div class="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-stone-800">Logo (opcional)</span>${logoSlot.file ? '<button type="button" id="btn-clear-logo" class="text-[11px] font-bold text-rose-600 cursor-pointer">Quitar</button>' : ''}</div>
          <label for="emp-logo-input" class="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 cursor-pointer">${SVG.up}<span>${logoSlot.file ? `WebP · ${logoSlot.kb} KB` : 'Subir logo'}</span></label>
          <input id="emp-logo-input" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" />
        </div>
        <div class="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-stone-800">Foto de portada</span>${coverSlot.file ? '<button type="button" id="btn-clear-cover" class="text-[11px] font-bold text-rose-600 cursor-pointer">Usar rubro</button>' : ''}</div>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" data-emp-cover-mode="rubro" class="py-1.5 px-2 rounded-lg text-[11px] font-bold border cursor-pointer ${st.coverMode === 'rubro' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'}">Del rubro</button>
            <label for="emp-cover-input" data-emp-cover-mode="custom" class="py-1.5 px-2 rounded-lg text-[11px] font-bold border text-center cursor-pointer ${st.coverMode === 'custom' && coverSlot.file ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'}">${coverSlot.file ? `${coverSlot.kb} KB` : 'Subir foto'}</label>
          </div>
          <input id="emp-cover-input" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" />
        </div>
      </div>
      ${errBox(st.error)}
      ${navBtns(false, 'Continuar a Dirección Web y Plan')}
    </div>`;
  }

  function renderStep2(st) {
    const plansHtml = S().PLANS.map(p => {
      const on = st.plan === p.id;
      return `<button type="button" data-emp-plan="${p.id}" class="w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${on ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'bg-[#FAF8F5] border-stone-200 text-stone-800 hover:bg-stone-100'}">
        <div class="flex items-center justify-between gap-2"><span class="text-[11px] font-bold uppercase tracking-wider ${on ? 'text-stone-300' : 'text-stone-500'}">${esc(p.badge)}</span><span class="text-xs font-extrabold tabular-nums">${esc(p.promo)} Mes Fundador</span></div>
        <div class="flex items-baseline justify-between gap-2 mt-0.5"><strong class="text-sm font-extrabold">${esc(p.name)}</strong><span class="text-[11px] tabular-nums ${on ? 'text-stone-300' : 'text-stone-500'}">Luego ${esc(p.regular)}</span></div>
        <p class="text-[11px] mt-1 ${on ? 'text-stone-300' : 'text-stone-500'}">${esc(p.desc)}</p>
      </button>`;
    }).join('');

    return `<div class="space-y-4">
      <div><h2 class="text-xl font-extrabold tracking-tight text-stone-900">Tu dirección web y plan</h2><p class="text-xs text-stone-500 mt-0.5">Elegí el enlace propio para compartir con tus clientes.</p></div>
      <div class="space-y-1.5">
        <label for="emp-slug" class="block text-xs font-bold text-stone-700">Dirección web deseada</label>
        <div class="flex items-center rounded-xl bg-[#FAF8F5] border border-stone-200 focus-within:border-stone-900 overflow-hidden">
          <input id="emp-slug" type="text" maxlength="32" value="${esc(st.slug)}" class="flex-1 p-3 bg-transparent text-sm font-semibold text-stone-900 tabular-nums outline-none min-w-0" />
          <span class="px-3 py-3 text-xs font-bold text-stone-500 bg-stone-100 border-l border-stone-200 shrink-0">.tucured.com.ar</span>
        </div>
        <p id="emp-slug-preview" class="text-[11px] font-semibold text-emerald-700 tabular-nums">Enlace: https://${esc(st.slug)}.tucured.com.ar</p>
      </div>
      <div class="space-y-2"><span class="block text-xs font-bold text-stone-700">Elegí tu plan de lanzamiento</span><div class="space-y-2">${plansHtml}</div></div>
      ${errBox(st.error)}
      ${navBtns(true, 'Continuar a Ubicación y Titular')}
    </div>`;
  }

  function renderStep3(st) {
    const locOpts = S().LOCALIDADES.map(l => `<option value="${esc(l)}" ${st.localidad === l ? 'selected' : ''}>${esc(l)}</option>`).join('');
    const dayOpts = DAY_OPTS.map(d => `<option value="${esc(d)}" ${st.horarioDias === d ? 'selected' : ''}>${esc(d)}</option>`).join('');
    const tOpts = (cur) => TIME_OPTS.map(t => `<option value="${t}" ${cur === t ? 'selected' : ''}>${t} hs</option>`).join('');
    return `<div class="space-y-3.5">
      <div><h2 class="text-xl font-extrabold tracking-tight text-stone-900">Ubicación, horarios y titular</h2><p class="text-xs text-stone-500 mt-0.5">Datos para activar tu App y enviarte tus accesos.</p></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div><label for="emp-localidad" class="block text-xs font-bold text-stone-700 mb-1">Localidad</label><select id="emp-localidad" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none">${locOpts}</select></div>
        <div class="relative"><label for="emp-direccion" class="block text-xs font-bold text-stone-700 mb-1">Dirección del local</label><input id="emp-direccion" type="text" autocomplete="off" placeholder="Ej. 25 de Mayo 480" value="${esc(st.direccion)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none" /><input id="emp-dir-lat" type="hidden" value="${esc(st.direccionLat)}" /><input id="emp-dir-lng" type="hidden" value="${esc(st.direccionLng)}" /><div id="emp-geo-dropdown" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto"></div></div>
      </div>
      <div class="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
        <div class="flex items-center justify-between gap-2 flex-wrap"><span class="text-xs font-bold text-stone-800">Horarios base</span><div class="flex gap-1.5"><button type="button" data-emp-sched="corrido" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${st.horarioModalidad === 'corrido' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'}">Corrido</button><button type="button" data-emp-sched="partido" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${st.horarioModalidad === 'partido' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200'}">Partido</button></div></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 tabular-nums">
          <select id="emp-sched-days" class="p-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none">${dayOpts}</select>
          <select id="emp-open1" class="p-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none">${tOpts(st.open1)}</select>
          <select id="emp-close1" class="p-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none">${tOpts(st.close1)}</select>
        </div>
        ${st.horarioModalidad === 'partido' ? `<div class="grid grid-cols-2 gap-2 tabular-nums"><select id="emp-open2" class="p-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none">${tOpts(st.open2)}</select><select id="emp-close2" class="p-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 outline-none">${tOpts(st.close2)}</select></div>` : ''}
      </div>
      <div class="grid grid-cols-2 gap-2.5">
        <div><label for="emp-first" class="block text-xs font-bold text-stone-700 mb-1">Nombre del titular</label><input id="emp-first" type="text" placeholder="Ej. Julio" value="${esc(st.titularNombre)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none" /></div>
        <div><label for="emp-last" class="block text-xs font-bold text-stone-700 mb-1">Apellido</label><input id="emp-last" type="text" placeholder="Ej. Sosa" value="${esc(st.titularApellido)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none" /></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div><label for="emp-whatsapp" class="block text-xs font-bold text-stone-700 mb-1">WhatsApp (10 dígitos)</label><input id="emp-whatsapp" type="tel" inputmode="numeric" maxlength="14" placeholder="Ej. 3815554321" value="${esc(st.whatsapp)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs tabular-nums text-stone-900 outline-none" /></div>
        <div><label for="emp-email" class="block text-xs font-bold text-stone-700 mb-1">Email</label><input id="emp-email" type="email" placeholder="contacto@tulocal.com" value="${esc(st.email)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none" /></div>
      </div>
      <div><label for="emp-instagram" class="block text-xs font-bold text-stone-700 mb-1">Instagram del comercio (opcional)</label><input id="emp-instagram" type="text" placeholder="@tucomercio" value="${esc(st.instagram)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none" /></div>
      ${errBox(st.error)}
      ${navBtns(true, 'Revisar y Activar')}
    </div>`;
  }

  function renderStep4(st) {
    const rubro = S().getRubroMeta(st.rubro), plan = S().PLANS.find(p => p.id === st.plan) || S().PLANS[1];
    return `<div class="space-y-4">
      <div><h2 class="text-xl font-extrabold tracking-tight text-stone-900">Resumen y activación</h2><p class="text-xs text-stone-500 mt-0.5">Verificá los datos antes de confirmar tu alta Mes Fundador.</p></div>
      <div class="rounded-2xl bg-[#F5F2EC] border border-stone-200 p-4 space-y-2 text-xs tabular-nums">
        <div class="flex justify-between gap-2"><span class="text-stone-500">Comercio</span><strong class="text-stone-900 text-right">${esc(st.comercio)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Dirección web</span><strong class="text-emerald-700 text-right">https://${esc(st.slug)}.tucured.com.ar</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Plan elegido</span><strong class="text-stone-900 text-right">${esc(plan.badge)} · ${esc(plan.name)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Rubro</span><strong class="text-stone-900 text-right">${esc(rubro.label)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Ubicación</span><strong class="text-stone-900 text-right">${esc(st.direccion)}, ${esc(st.localidad)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Horarios</span><strong class="text-stone-900 text-right">${esc(S().buildScheduleSummary(st))}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Titular</span><strong class="text-stone-900 text-right">${esc(st.titularNombre)} ${esc(st.titularApellido)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">WhatsApp / Email</span><strong class="text-stone-900 text-right">${esc(st.whatsapp)} · ${esc(st.email)}</strong></div>
        <div class="flex justify-between gap-2 pt-2 border-t border-stone-200"><span class="text-stone-700 font-bold">Activación Mes Fundador</span><strong class="text-sm font-extrabold text-stone-900">$4.999</strong></div>
      </div>
      <label class="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer"><input id="emp-terms" type="checkbox" ${st.termsAccepted ? 'checked' : ''} class="mt-0.5 w-4 h-4 rounded border-stone-300 accent-stone-900" /><span>Acepto los <a href="/terminos.html" target="_blank" rel="noopener noreferrer" class="underline font-semibold text-stone-900">Términos y Condiciones</a> del servicio TucuRed.</span></label>
      ${errBox(st.error)}
      <div class="flex gap-2.5"><button type="button" id="btn-emp-prev" class="w-1/3 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 cursor-pointer">Volver</button><button type="button" id="btn-empezar-submit" ${st.submitting ? 'disabled' : ''} class="w-2/3 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">${st.submitting ? 'Enviando solicitud...' : 'Activar mi Mes Fundador — $4.999'}</button></div>
    </div>`;
  }

  function renderSuccess(st, activarUrl) {
    const plan = S().PLANS.find(p => p.id === st.plan) || S().PLANS[1];
    return `<div id="emp-success-view" class="space-y-4 text-center py-2">
      <div class="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">${SVG.ok}</div>
      <div><h2 class="text-xl font-extrabold text-stone-900">Solicitud recibida con éxito</h2><p class="text-xs text-stone-600 mt-1">Registramos la configuración inicial de <strong>${esc(st.comercio)}</strong>.</p></div>
      <div class="rounded-2xl bg-[#F5F2EC] border border-stone-200 p-4 text-left space-y-1.5 text-xs tabular-nums">
        <div class="flex justify-between gap-2"><span class="text-stone-500">Tu futura App</span><strong id="emp-success-domain" class="text-emerald-700">https://${esc(st.slug)}.tucured.com.ar</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Plan seleccionado</span><strong id="emp-success-plan" class="text-stone-900">${esc(plan.badge)} · ${esc(plan.name)}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Próximo paso</span><strong class="text-stone-900 text-right">Te escribimos por WhatsApp para finalizar tu alta hoy</strong></div>
      </div>
      <div class="flex flex-col sm:flex-row gap-2.5 pt-1">
        <a href="${esc(activarUrl)}" class="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold text-center">Completar catálogo de servicios</a>
        <a href="/" class="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold text-center">Volver al inicio</a>
      </div>
    </div>`;
  }

  return { renderStep1, renderStep2, renderStep3, renderStep4, renderSuccess };
})();