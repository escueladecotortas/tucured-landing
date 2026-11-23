// Archivo: public/js/admin_shared/turnero_steps_ui.js
// Paso 1 y Paso 2 en Plus Jakarta Sans limpia con logo protagonista (52-56px) y Obra Social exclusiva de salud (< 185L)

window.TucuStepsUI = (function () {
  const SVG = {
    clk: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/></svg>',
    usr: '<svg class="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    ok: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    cal: '<svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    pin: '<svg class="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="2.5"/></svg>',
    calOk: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm4-5l2 2 4-4"/></svg>'
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const maskPhone = (raw) => { const d = String(raw || '').replace(/\D/g, ''); return d.length >= 6 ? `${d.slice(0, 3)}...${d.slice(-3)}` : (d || '---'); };

  function renderMiniHeader(c, stepNum) {
    const pct = stepNum === 1 ? '50%' : '100%';
    const logoImg = c.logoUrl ? `<img id="turnero-header-logo" src="${esc(c.logoUrl)}" alt="Logo ${esc(c.bizName)}" onerror="this.remove()" class="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-xl object-contain bg-white shrink-0">` : '';
    return `<header id="turnero-mini-header" class="space-y-2 pb-2.5 mb-3 border-b border-stone-200/70">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 min-w-0">
          <button type="button" id="btn-back-cover" onclick="TucuTurneroApp.backToCover()" class="lg:hidden px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-[11px] font-semibold text-stone-700 inline-flex items-center gap-1 shrink-0 cursor-pointer"><span>&#8249;</span><span>Portada</span></button>
          ${logoImg}<span id="turnero-biz-name" class="text-sm sm:text-[15px] font-semibold text-stone-800 truncate">${esc(c.bizName)}</span>
        </div>
        <span id="turnero-step-indicator" class="text-[11px] font-bold uppercase tracking-wider tucu-primary-text tabular-nums shrink-0">PASO ${stepNum} DE 2</span>
      </div>
      <div class="w-full h-1 bg-stone-200/80 rounded-full overflow-hidden"><div id="turnero-progress-bar" class="h-full rounded-full transition-all duration-300" style="width:${pct};background-color:var(--tucu-primary)"></div></div>
    </header>`;
  }

  function renderRescheduleBanner(c) {
    if (!c.reschedulingCode) return '';
    const v = c.vocab || { singular: 'turno' };
    return `<div id="turnero-reschedule-banner" class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-2">
      <span class="font-semibold tabular-nums">Cambiando fecha u horario de tu ${esc(v.singular)} #${esc(c.reschedulingCode)}</span>
      <button type="button" id="btn-cancel-reschedule" onclick="TucuTurneroApp.cancelReschedule()" class="font-bold underline underline-offset-2 shrink-0 cursor-pointer">Cancelar cambio</button>
    </div>`;
  }

  function renderStep1(c) {
    const staffBlock = c.level === 'l3' && c.staffList.length
      ? `<section class="space-y-2"><h3 class="font-semibold text-[15px] text-stone-800">${c.rubro === 'deportes' ? '¿Qué cancha o espacio preferís?' : '¿Con quién te querés atender?'}</h3><div class="grid grid-cols-1 gap-1.5">${c.staffList.map(st => {
        const on = st.id === c.selectedStaffId;
        return `<button type="button" data-staff-id="${esc(st.id)}" onclick="TucuTurneroApp.pickStaff('${esc(st.id)}')" class="p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${on ? 'tucu-soft-active font-semibold shadow-2xs' : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:bg-stone-100'}"><span class="flex items-center gap-2 truncate">${SVG.usr}<span class="truncate">${esc(st.name)}</span></span>${on ? SVG.ok : ''}</button>`;
      }).join('')}</div></section>` : '';

    const srvCards = c.services.map(s => {
      const on = s.id === c.selectedServiceId, dep = c.calcDeposit(s);
      const checkDot = on ? `<span class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white" style="background-color:var(--tucu-primary)">${SVG.ok}</span>` : '<span class="w-5 h-5 rounded-full border border-stone-300 bg-white shrink-0"></span>';
      const depTag = dep > 0 ? `<span class="inline-block self-start px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums bg-amber-50 text-amber-800 border border-amber-200">Seña ${c.fmt(dep)}</span>` : '';
      return `<button type="button" data-srv-id="${esc(s.id)}" onclick="TucuTurneroApp.pickService('${esc(s.id)}')" class="p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${on ? 'tucu-soft-active shadow-2xs' : 'bg-[#FAF8F5] border-stone-200 hover:border-stone-300'}"><div class="flex items-start justify-between gap-2 w-full"><span class="text-xs sm:text-[13px] font-semibold text-stone-900 leading-snug">${esc(s.name)}</span>${checkDot}</div><div class="flex flex-wrap items-center justify-between gap-1.5 w-full"><span class="text-[11px] font-medium text-stone-600 tabular-nums">${s.duration} min · ${c.fmt(s.price)}</span>${depTag}</div></button>`;
    }).join('');

    const daysHtml = c.days.map(d => {
      const on = d.iso === c.selectedDate;
      return `<button type="button" data-date-iso="${d.iso}" onclick="TucuTurneroApp.pickDate('${d.iso}')" class="min-h-[56px] rounded-xl border p-2 flex flex-col items-center justify-center cursor-pointer transition-all tabular-nums ${on ? 'tucu-slot-active font-bold shadow-xs' : 'bg-[#FAF8F5] border-stone-200 text-stone-700 hover:bg-stone-100'}"><span class="text-[10px] font-semibold uppercase tracking-wider ${on ? 'opacity-90' : 'text-stone-500'}">${d.label}</span><span class="text-base font-bold ${on ? 'text-white' : 'text-stone-900'}">${d.num}</span></button>`;
    }).join('');

    const slotsHtml = c.slotState.closedReason
      ? `<div class="p-3.5 rounded-xl bg-[#F5F2EC] border border-stone-200 text-center text-xs font-medium text-stone-600">${esc(c.slotState.closedReason)}</div>`
      : `<div class="grid grid-cols-3 gap-2">${c.slotState.items.map(it => {
        if (it.isPast) return `<button type="button" disabled class="py-2 px-2 rounded-xl border border-dashed border-stone-200 bg-stone-100 text-stone-400 opacity-50 line-through text-xs tabular-nums cursor-not-allowed">${it.time}</button>`;
        if (it.isBlocked) return `<button type="button" disabled class="py-2 px-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-400 text-[11px] tabular-nums flex items-center justify-center gap-1 cursor-not-allowed"><span class="line-through">${it.time}</span><span class="text-[9px] font-bold text-rose-700">Ocupado</span></button>`;
        const on = it.time === c.selectedTime;
        return `<button type="button" data-time-slot="${it.time}" onclick="TucuTurneroApp.pickTime('${it.time}')" class="py-2 px-2 rounded-xl border text-xs font-semibold tabular-nums flex items-center justify-center gap-1 cursor-pointer transition-all ${on ? 'tucu-slot-active font-bold shadow-xs' : 'bg-[#FAF8F5] border-stone-200 text-stone-800 hover:border-stone-300'}">${SVG.clk}<span>${it.time}</span></button>`;
      }).join('')}</div>`;

    const ctaText = c.reschedulingCode ? 'Revisar nuevo horario' : (c.hasSavedProfile ? 'Revisar y confirmar' : 'Reservar este horario');
    return `<div>${renderMiniHeader(c, 1)}<div class="space-y-4">
      ${renderRescheduleBanner(c)}${staffBlock}
      <section class="space-y-2"><h2 id="turnero-service-heading" class="font-semibold text-[15px] text-stone-800 leading-tight">${esc(c.serviceQuestion)}</h2><div id="turnero-services-list" class="grid grid-cols-1 sm:grid-cols-2 gap-2">${srvCards || '<div class="sm:col-span-2 p-4 text-center text-xs text-stone-500 bg-[#FAF8F5] rounded-xl border border-stone-200">Sin servicios disponibles</div>'}</div></section>
      <section class="space-y-2">
        <div class="flex items-center justify-between gap-2"><h2 class="font-semibold text-[15px] text-stone-800 leading-tight">¿Qué día te queda cómodo?</h2><div class="flex items-center gap-1.5 shrink-0"><span id="turnero-month-label" class="text-[11px] sm:text-xs font-semibold text-stone-600 tabular-nums whitespace-nowrap">${esc(c.monthYearLabel)}</span><button type="button" id="btn-date-prev" aria-label="Días anteriores" onclick="TucuTurneroApp.prevDatePage()" ${c.canPrev ? '' : 'disabled'} class="w-7 h-7 rounded-lg border border-stone-200 bg-[#FAF8F5] text-xs font-bold flex items-center justify-center ${c.canPrev ? 'text-stone-700 hover:bg-stone-100 cursor-pointer' : 'text-stone-300 opacity-50 cursor-not-allowed'}">&#8249;</button><button type="button" id="btn-date-next" aria-label="Días siguientes" onclick="TucuTurneroApp.nextDatePage()" ${c.canNext ? '' : 'disabled'} class="w-7 h-7 rounded-lg border border-stone-200 bg-[#FAF8F5] text-xs font-bold flex items-center justify-center ${c.canNext ? 'text-stone-700 hover:bg-stone-100 cursor-pointer' : 'text-stone-300 opacity-50 cursor-not-allowed'}">&#8250;</button></div></div>
        <div class="grid grid-cols-4 gap-2">${daysHtml}</div>
      </section>
      <section class="space-y-2"><h2 class="font-semibold text-[15px] text-stone-800 leading-tight">¿A qué hora pasás?</h2>${slotsHtml}</section>
      <button type="button" id="btn-step1-next" onclick="TucuTurneroApp.goStep(2)" ${c.services.length && c.selectedTime ? '' : 'disabled'} class="tucu-btn-primary w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"><span>${ctaText}</span><span aria-hidden="true">&#8594;</span></button>
    </div></div>`;
  }

  function renderStep2(c) {
    const price = Number(c.service?.price || 0), dep = c.calcDeposit(c.service), bal = Math.max(0, price - dep), isHealth = c.rubro === 'salud';
    const fastMode = Boolean(c.hasSavedProfile && !c.editingProfile && c.clientFirstName && c.clientLastName && c.clientPhone);
    const lockPhone = Boolean(c.hasSavedProfile && !c.phoneUnlocked);
    const covVal = c.coverage || 'OSDE';
    const insHtml = isHealth ? `<div><label for="inp-client-cov" class="block text-xs font-semibold text-stone-700 mb-1">Obra Social / Cobertura</label><select id="inp-client-cov" onchange="const el=document.getElementById('turnero-pass-cov-val');if(el)el.textContent=this.value;" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none">${['OSDE', 'Swiss Medical', 'Subsidio de Salud', 'Particular'].map(o => `<option value="${o}" ${covVal === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>` : '';
    const errHtml = c.step2Error ? `<div id="turnero-step2-error" class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">${esc(c.step2Error)}</div>` : '';
    const warnHtml = c.restrictedNotice ? `<div id="turnero-restricted-notice" class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">${esc(c.restrictedNotice)}</div>` : '';

    const clientFieldsHtml = fastMode ? '' : `<section id="turnero-client-fields" class="space-y-2.5">
      <div class="flex items-baseline justify-between gap-2"><h2 class="font-semibold text-[15px] text-stone-800">Tus datos</h2><span class="text-[11px] font-medium text-stone-500">Confirmación por WhatsApp</span></div>
      <div class="grid grid-cols-2 gap-2.5">
        <div><label for="inp-client-first" class="block text-xs font-semibold text-stone-700 mb-1">Nombre</label><input id="inp-client-first" type="text" required placeholder="Ej. Martín" value="${esc(c.clientFirstName)}" class="w-full p-2 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none"></div>
        <div><label for="inp-client-last" class="block text-xs font-semibold text-stone-700 mb-1">Apellido</label><input id="inp-client-last" type="text" required placeholder="Ej. Rodríguez" value="${esc(c.clientLastName)}" class="w-full p-2 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none"></div>
      </div>
      <div>
        <div class="flex items-center justify-between gap-2 mb-1"><label for="inp-client-phone" class="block text-xs font-semibold text-stone-700">WhatsApp</label>${lockPhone ? '<button type="button" id="btn-unlock-phone" onclick="TucuTurneroApp.unlockPhone()" class="text-[11px] font-semibold tucu-primary-text hover:underline cursor-pointer">Usar otro número</button>' : ''}</div>
        <input id="inp-client-phone" type="tel" required inputmode="numeric" ${lockPhone ? 'readonly' : ''} placeholder="Ej. 3815554321" value="${esc(c.clientPhone)}" class="w-full p-2 rounded-xl border border-stone-200 text-xs tabular-nums outline-none ${lockPhone ? 'bg-stone-100 text-stone-600' : 'bg-[#FAF8F5] text-stone-900'}">
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div><label for="inp-client-birthday" class="block text-xs font-semibold text-stone-700 mb-1">Fecha de cumpleaños (opcional)</label><input id="inp-client-birthday" type="date" value="${esc(c.clientBirthday || '')}" class="w-full p-2 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs tabular-nums text-stone-900 outline-none"></div>
        <div><label for="inp-client-email" class="block text-xs font-semibold text-stone-700 mb-1">Correo electrónico (opcional)</label><input id="inp-client-email" type="email" placeholder="Ej. nombre@correo.com" value="${esc(c.clientEmail || '')}" class="w-full p-2 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-900 outline-none"></div>
      </div>${insHtml}
    </section>`;

    const totalRow = `<div id="turnero-service-total" class="flex items-center justify-between gap-2 pb-2 border-b border-stone-200/80"><span class="text-xs font-semibold text-stone-600">Total del servicio</span><strong class="text-base font-bold text-stone-900 tabular-nums">${c.fmt(price)}</strong></div>`;
    const moneyBlocks = dep > 0
      ? `<div class="grid grid-cols-2 gap-2.5"><div class="p-2.5 rounded-xl bg-white border border-stone-200/70"><span class="block text-[11px] font-medium text-stone-500">Seña ahora</span><strong class="block text-base font-bold tucu-primary-text tabular-nums">${c.fmt(dep)}</strong></div><div class="p-2.5 rounded-xl bg-white border border-stone-200/70"><span class="block text-[11px] font-medium text-stone-500">Saldo en local</span><strong class="block text-base font-bold text-stone-900 tabular-nums">${c.fmt(bal)}</strong></div></div>`
      : '<p class="text-xs text-stone-600">Abonás el total al asistir al local.</p>';
    const identityRow = fastMode ? `<div id="turnero-pass-identity" class="flex items-center justify-between gap-2 pt-1 text-xs text-stone-600 tabular-nums"><span class="truncate">Reservando como <strong class="font-semibold text-stone-900">${esc(c.clientFirstName)}</strong> (${esc(maskPhone(c.clientPhone))})</span><button type="button" id="btn-edit-client-profile" onclick="TucuTurneroApp.editClientProfile()" class="font-semibold tucu-primary-text hover:underline underline-offset-4 shrink-0 cursor-pointer">Cambiar</button></div>` : '';

    const passHtml = `<section id="turnero-boarding-pass" class="rounded-2xl border border-stone-200/80 overflow-hidden bg-[#FAF8F5]">
      <div class="p-3.5 sm:p-4 space-y-2">
        <div class="flex items-start justify-between gap-3"><div class="min-w-0"><span class="text-[10px] font-bold uppercase tracking-[0.16em] tucu-primary-text block">TU RESERVA</span><h3 class="text-lg font-semibold text-stone-900 leading-tight mt-0.5 break-words">${esc(c.service?.name || '')}</h3></div><span class="w-9 h-9 rounded-full bg-white border border-stone-200/80 flex items-center justify-center shrink-0 tucu-primary-text">${SVG.calOk}</span></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
          <div class="flex items-start gap-2">${SVG.cal}<div class="min-w-0"><span class="block text-[11px] text-stone-500">Fecha y hora</span><strong class="font-semibold text-stone-900 tabular-nums">${esc(c.dateLabel)} · ${esc(c.selectedTime)} hs</strong></div></div>
          <div class="flex items-start gap-2">${SVG.pin}<div class="min-w-0"><span class="block text-[11px] text-stone-500">Dirección</span><strong class="font-semibold text-stone-900 break-words">${esc(c.address)}</strong></div></div>
          ${c.level === 'l3' && c.staff ? `<div class="sm:col-span-2 text-stone-600">${c.rubro === 'deportes' ? 'Cancha' : 'Especialista'}: <strong class="font-semibold text-stone-900">${esc(c.staff.name)}</strong></div>` : ''}
          ${isHealth ? `<div id="turnero-pass-coverage" class="sm:col-span-2 text-stone-600">Obra Social: <strong id="turnero-pass-cov-val" class="font-semibold text-stone-900">${esc(covVal)}</strong></div>` : ''}
        </div>
      </div>
      <div class="relative flex items-center bg-[#FAF8F5]"><div class="w-4 h-4 -ml-2 rounded-full bg-white border-r border-stone-200/80 shrink-0"></div><div class="w-full border-t border-dashed border-stone-300 mx-1"></div><div class="w-4 h-4 -mr-2 rounded-full bg-white border-l border-stone-200/80 shrink-0"></div></div>
      <div class="p-3.5 sm:p-4 bg-[#F4F0E8]/70 space-y-2">${totalRow}${moneyBlocks}${identityRow}</div>
    </section>`;

    return `<div>${renderMiniHeader(c, 2)}<form id="turnero-step2-form" onsubmit="TucuTurneroApp.confirmFromStep2(event)" class="space-y-3">
      ${renderRescheduleBanner(c)}${errHtml}${clientFieldsHtml}${passHtml}${warnHtml}
      <div class="flex flex-col-reverse sm:flex-row gap-2.5 pt-0.5">
        <button type="button" id="btn-step2-back" onclick="TucuTurneroApp.goStep(1)" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer">&#8592; Volver</button>
        <button type="submit" id="btn-confirm-booking" class="tucu-btn-primary w-full sm:flex-1 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"><span>${c.reschedulingCode ? 'Confirmar nuevo horario' : 'Confirmar mi lugar'}</span><span aria-hidden="true">&#8594;</span></button>
      </div>
    </form></div>`;
  }

  function renderPaused() {
    return '<div class="p-2 text-center space-y-2"><h2 class="text-base font-semibold text-stone-900">Reservas en pausa temporal</h2><p class="text-xs text-stone-500">El comercio pausó momentáneamente la agenda web.</p></div>';
  }

  return { renderStep1, renderStep2, renderPaused };
})();
