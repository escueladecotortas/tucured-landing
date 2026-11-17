// Archivo: public/js/admin_shared/turnero_app.js
// Orquestador UI del Turnero Autónomo L1/L2/L3 (3 Pasos, Feriados Granulares + /t/TK-XXXX < 170 líneas)

window.TucuTurneroApp = (function () {
  const cat = () => window.TucuTurneroCatalog, eng = () => window.AdminBookingEngine;
  const fmt = (n) => (eng() ? eng().fmt(n) : '$' + Number(n || 0).toLocaleString('es-AR'));
  const SVG = {
    cal: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    clk: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/></svg>',
    ok: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    nxt: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>'
  };
  const SLOTS = ['09:00', '10:00', '11:00', '12:00', '15:00', '16:30', '18:00', '19:30', '21:00'];
  const state = { level: 'l1', slug: 'demo-peluqueria', rubro: 'peluqueria', step: 1, services: [], staffList: [], resList: [], selectedServiceId: '', selectedStaffId: '', selectedResId: '', selectedDate: '', selectedTime: '', clientName: '', clientPhone: '', coverage: 'OSDE', restrictedNotice: '', result: null };
  const readJson = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (_) { return fb; } };

  function localIso(offset = 0) {
    if (window.AdminShell?.localTodayStr) return window.AdminShell.localTodayStr(offset);
    const d = new Date(); d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getUpcomingDays() {
    const days = [], names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 0; days.length < 9 && i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      if (d.getDay() === 0 && state.rubro !== 'gastronomia') continue;
      days.push({ iso: localIso(i), label: i === 0 ? 'Hoy' : names[d.getDay()], num: d.getDate() });
    }
    return days;
  }

  function getAvailableSlots(dateStr) {
    const list = window.AdminShell?.filterFutureSlots ? window.AdminShell.filterFutureSlots(SLOTS, dateStr) : SLOTS;
    if (state.level === 'l2') {
      if (window.AdminHolidays?.isDateBlocked?.('l2', state.rubro, dateStr)) return [];
      const activeR = localStorage.getItem('tucu_l2_rubro') || '', sameR = !activeR || activeR === state.rubro;
      const vacs = readJson(`tucu_l2_vacations_${state.rubro}`, sameR ? readJson('tucu_l2_vacations', []) : []);
      if (Array.isArray(vacs) && vacs.some(v => v && !v.deletedAt && dateStr >= v.from && dateStr <= v.to)) return [];
      const occ = readJson(`tucu_l2_occupied_slots_${state.rubro}`, sameR ? readJson('tucu_l2_occupied_slots', []) : []);
      const bks = [...readJson(`tucu_l2_bookings_${state.rubro}`, []), ...readJson('tucu_l2_bookings', []).filter(b => b && (b.rubroId === state.rubro || (!b.rubroId && sameR)))];
      const busy = new Set([...(Array.isArray(occ) ? occ : []), ...bks.filter(b => b && !b.deletedAt && (b.date || b.dateStr) === dateStr && !['CANCELLED', 'CANCELADO'].includes(String(b.status || '').toUpperCase())).map(b => b.time)]);
      return list.filter(t => !busy.has(t));
    }
    if (state.level === 'l3') {
      const rL3 = cat().RUBRO_META[state.rubro]?.l3 || 'barberia';
      if (window.AdminHolidays?.isDateBlocked?.('l3', rL3, dateStr)) return [];
      if (!window.AdminHolidays?.isDateBlocked) {
        const hols = readJson('tucu_l3_holidays', []);
        if (Array.isArray(hols) && hols.some(h => h && !h.deletedAt && !h.isException && h.date === dateStr)) return [];
      }
      const staff = state.staffList.find(s => s.id === state.selectedStaffId), dayKey = String(new Date(`${dateStr}T12:00:00`).getDay()), wh = staff?.workingHours?.[dayKey];
      if (wh && !wh.active) return [];
      const blocks = readJson(`tucu_l3_blocks_${rL3}`, []);
      const bks = [...readJson(`tucu_l3_bookings_${rL3}`, []), ...readJson('tucu_l3_bookings', []).filter(b => b && (!b.rubroId || b.rubroId === rL3))];
      const busy = new Set(bks.filter(b => b && !b.deletedAt && (b.date || b.dateStr) === dateStr && !['CANCELLED', 'CANCELADO'].includes(String(b.status || '').toUpperCase()) && (!b.staffId || !state.selectedStaffId || b.staffId === state.selectedStaffId)).map(b => b.time));
      return list.filter(t => {
        if (busy.has(t)) return false;
        if (Array.isArray(blocks) && blocks.some(bl => bl && !bl.deletedAt && bl.date === dateStr && t >= bl.start && t <= bl.end && (!bl.serviceId || !state.selectedServiceId || bl.serviceId === state.selectedServiceId))) return false;
        if (!wh) return true;
        return (t >= (wh.start || '09:00') && t < (wh.end || '19:00')) || Boolean(wh.isSplit && t >= (wh.open2 || '16:00') && t < (wh.close2 || '21:00'));
      });
    }
    return list;
  }

  function loadContext() {
    const p = new URLSearchParams(window.location.search);
    state.level = ['l1', 'l2', 'l3'].includes((p.get('level') || '').toLowerCase()) ? p.get('level').toLowerCase() : 'l1';
    state.slug = (p.get('slug') || localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria').trim();
    state.rubro = cat().normalizeRubro(p.get('rubro') || 'peluqueria');
    state.services = cat().getActiveServices(state);
    const sr = cat().getStaffAndResources(state);
    state.staffList = sr.staff; state.resList = sr.resources;
    if (!state.services.some(s => s.id === state.selectedServiceId)) state.selectedServiceId = state.services[0]?.id || '';
    if (!state.staffList.some(s => s.id === state.selectedStaffId)) state.selectedStaffId = state.staffList[0]?.id || '';
    if (!state.resList.some(r => r.id === state.selectedResId)) state.selectedResId = state.resList[0]?.id || '';
    const days = getUpcomingDays();
    if (!state.selectedDate || !days.some(d => d.iso === state.selectedDate)) {
      state.selectedDate = days[0]?.iso || '';
      if (!getAvailableSlots(state.selectedDate).length && days[1]) state.selectedDate = days[1].iso;
    }
    const validSlots = getAvailableSlots(state.selectedDate);
    if (!validSlots.includes(state.selectedTime)) state.selectedTime = validSlots[0] || '';
  }

  function renderHeader(info) {
    const bizEl = document.getElementById('turnero-biz-name'), subEl = document.getElementById('turnero-rubro-label'), backEl = document.getElementById('btn-back-admin');
    if (bizEl) bizEl.textContent = info.bizName;
    if (subEl) subEl.textContent = `${info.meta.label} · ${info.address}`;
    if (backEl) backEl.href = cat().buildAdminReturnUrl(state.level, state.slug, state.rubro);
  }

  function renderStep1() {
    const cards = state.services.map(s => {
      const sel = s.id === state.selectedServiceId, dep = eng() ? eng().calcDeposit(s.price, state.level, s.requireDeposit) : Math.round(s.price * 0.5);
      return `<button type="button" data-srv-id="${s.id}" onclick="TucuTurneroApp.pickService('${s.id}')" class="w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${sel ? 'border-[#800000] bg-[#800000]/5 ring-1 ring-[#800000]/30 shadow-xs' : 'border-[#D5CEC2] dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400'}"><div class="flex items-start justify-between gap-2"><strong class="text-sm font-bold text-stone-900 dark:text-stone-100">${s.name}</strong><span class="font-mono text-sm font-extrabold text-[#800000] dark:text-red-300 shrink-0">${fmt(s.price)}</span></div><p class="text-xs text-stone-500 dark:text-stone-400 mt-1">${s.description}</p><div class="flex items-center gap-2 mt-2 text-[11px] font-semibold text-stone-600 dark:text-stone-300"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800">${SVG.clk}<span>${s.duration} min</span></span><span class="px-2 py-0.5 rounded-lg ${dep > 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'}">${dep > 0 ? `Seña ${fmt(dep)}` : 'Sin seña previa'}</span></div></button>`;
    }).join('');
    return `<div class="space-y-3"><div class="flex items-center justify-between"><span class="text-[11px] font-bold uppercase tracking-wider text-stone-500">Paso 1 de 3</span><span class="text-xs font-bold text-[#800000] dark:text-red-300">Elegir Servicio</span></div><div id="turnero-services-list" class="space-y-2.5">${cards || '<div class="p-6 text-center text-xs text-stone-500 rounded-2xl border border-[#D5CEC2]">No hay servicios activos en este catálogo.</div>'}</div><button type="button" id="btn-step1-next" onclick="TucuTurneroApp.goStep(2)" ${state.services.length ? '' : 'disabled'} class="w-full py-3 rounded-xl admin-glass-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"><span>Continuar a Fecha y Horario</span>${SVG.nxt}</button></div>`;
  }

  function renderStep2() {
    const days = getUpcomingDays(), slots = getAvailableSlots(state.selectedDate);
    const staffHtml = state.staffList.length ? `<div class="space-y-1.5"><label class="block text-[11px] font-bold uppercase tracking-wider text-stone-500">Profesional / Asignación</label><div class="grid grid-cols-1 gap-1.5">${state.staffList.map(st => `<button type="button" onclick="TucuTurneroApp.pickStaff('${st.id}')" class="p-2.5 rounded-xl border text-left text-xs font-semibold cursor-pointer ${state.selectedStaffId === st.id ? 'border-[#800000] bg-[#800000]/5 text-[#800000] dark:text-red-300 font-bold' : 'border-[#D5CEC2] dark:border-stone-800 bg-white dark:bg-stone-900'}">${st.name}</button>`).join('')}</div></div>` : '';
    const resHtml = state.level === 'l3' && state.resList.length ? `<div class="space-y-1.5"><label class="block text-[11px] font-bold uppercase tracking-wider text-stone-500">Box / Recurso</label><select onchange="TucuTurneroApp.pickRes(this.value)" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs font-semibold outline-none">${state.resList.map(r => `<option value="${r.id}" ${state.selectedResId === r.id ? 'selected' : ''}>${r.name}</option>`).join('')}</select></div>` : '';
    return `<div class="space-y-3.5"><div class="flex items-center justify-between"><span class="text-[11px] font-bold uppercase tracking-wider text-stone-500">Paso 2 de 3</span><span class="text-xs font-bold text-[#800000] dark:text-red-300">Fecha y Horario</span></div>${staffHtml}${resHtml}<div class="space-y-1.5"><label class="block text-[11px] font-bold uppercase tracking-wider text-stone-500">Fecha</label><div class="grid grid-cols-3 gap-1.5">${days.map(d => `<button type="button" data-date-iso="${d.iso}" onclick="TucuTurneroApp.pickDate('${d.iso}')" class="p-2 rounded-xl border text-center cursor-pointer ${state.selectedDate === d.iso ? 'border-[#800000] bg-[#800000]/10 text-[#800000] dark:text-red-300 font-bold' : 'border-[#D5CEC2] dark:border-stone-800 bg-white dark:bg-stone-900'}"><span class="block text-[10px] opacity-75">${d.label}</span><span class="text-sm font-extrabold">${d.num}</span></button>`).join('')}</div></div><div class="space-y-1.5"><label class="block text-[11px] font-bold uppercase tracking-wider text-stone-500">Horarios Disponibles</label><div class="grid grid-cols-3 gap-1.5">${slots.map(t => `<button type="button" data-time-slot="${t}" onclick="TucuTurneroApp.pickTime('${t}')" class="py-2 rounded-xl border font-mono text-xs font-bold cursor-pointer ${state.selectedTime === t ? 'border-[#800000] bg-[#800000] text-white' : 'border-[#D5CEC2] dark:border-stone-800 bg-white dark:bg-stone-900'}">${t}</button>`).join('') || '<p class="col-span-3 text-xs text-stone-500 py-2">Sin horarios libres hoy, elegí otro día.</p>'}</div></div><div class="flex gap-2 pt-1"><button type="button" onclick="TucuTurneroApp.goStep(1)" class="w-1/3 py-2.5 rounded-xl admin-glass-btn text-xs font-semibold">Volver</button><button type="button" id="btn-step2-next" onclick="TucuTurneroApp.goStep(3)" ${slots.length ? '' : 'disabled'} class="w-2/3 py-2.5 rounded-xl admin-glass-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"><span>Tus Datos</span>${SVG.nxt}</button></div></div>`;
  }

  function renderStep3(info) {
    const srv = state.services.find(s => s.id === state.selectedServiceId) || state.services[0];
    const insHtml = info.meta.requireInsurance ? `<div><label class="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">Obra Social / Cobertura</label><select id="inp-client-cov" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs outline-none"><option>OSDE</option><option>Swiss Medical</option><option>Subsidio de Salud</option><option>Particular</option></select></div>` : '';
    const warnHtml = state.restrictedNotice ? `<div id="turnero-restricted-notice" class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold">${state.restrictedNotice}</div>` : '';
    return `<form id="turnero-confirm-form" onsubmit="TucuTurneroApp.submitBooking(event)" class="space-y-3"><div class="flex items-center justify-between"><span class="text-[11px] font-bold uppercase tracking-wider text-stone-500">Paso 3 de 3</span><span class="text-xs font-bold text-[#800000] dark:text-red-300">Confirmar Reserva</span></div><div class="rounded-2xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 p-3 text-xs space-y-1"><div class="flex justify-between"><strong>${srv?.name || ''}</strong><strong class="font-mono text-[#800000] dark:text-red-300">${fmt(srv?.price)}</strong></div><div class="text-stone-500 flex items-center gap-1.5">${SVG.cal}<span>${state.selectedDate} · ${state.selectedTime} hs (${srv?.duration || 30} min)</span></div><div class="text-[11px] text-stone-500">Dirección: <strong class="text-stone-700 dark:text-stone-300">${info.address}</strong></div></div>${warnHtml}<div><label class="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">Nombre y Apellido</label><input id="inp-client-name" type="text" required placeholder="Ej. Martín Rodríguez" value="${state.clientName}" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs outline-none"></div><div><label class="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">WhatsApp</label><input id="inp-client-phone" type="tel" required inputmode="numeric" placeholder="Ej. 3815554321" value="${state.clientPhone}" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs font-mono outline-none"></div>${insHtml}<div class="flex gap-2 pt-1"><button type="button" onclick="TucuTurneroApp.goStep(2)" class="w-1/3 py-2.5 rounded-xl admin-glass-btn text-xs font-semibold">Volver</button><button type="submit" id="btn-confirm-booking" class="w-2/3 py-2.5 rounded-xl admin-glass-primary text-xs font-bold">Confirmar Turno</button></div></form>`;
  }

  function renderStep4() {
    const r = state.result;
    return `<div class="space-y-3.5 text-center py-2"><div class="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">${SVG.ok}</div><div><h2 class="font-title text-base font-extrabold text-stone-900 dark:text-stone-100">Turno Registrado en Agenda</h2><p class="text-xs text-stone-500 mt-0.5">Ticket generado y sincronizado con el comercio.</p></div><div class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 space-y-2 text-xs"><span id="ticket-code-badge" class="inline-block font-mono text-sm font-extrabold px-3 py-1 rounded-xl bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-700">#${r.code}</span><p class="font-mono text-[11px] text-stone-500">Enlace corto: <strong id="ticket-short-path">${r.ticketUrl}</strong></p><div id="turnero-wa-auto-notice" class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 text-left">${SVG.ok}<span>Comprobante y enlace enviados automáticamente a tu WhatsApp</span></div></div><button type="button" id="btn-open-ticket" data-ticket-path="/t/${r.code}" onclick="window.TucuTicketModal && window.TucuTicketModal.open('${r.code}', { origin: 'turnero', immediate: true })" class="w-full py-2.5 rounded-xl admin-glass-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"><span>Ver Ticket Online</span></button><button type="button" onclick="TucuTurneroApp.resetFlow()" class="w-full py-2 rounded-xl admin-glass-btn text-xs font-semibold">Reservar otro turno</button></div>`;
  }

  function render() {
    const root = document.getElementById('turnero-root'); if (!root) return;
    loadContext();
    const info = cat().resolveBizInfo(state); renderHeader(info);
    const l2F = state.level === 'l2' ? localStorage.getItem(`tucu_l2_turnero_active_${state.rubro}`) : null;
    const rL3 = cat().RUBRO_META[state.rubro]?.l3 || state.rubro;
    const l3F = state.level === 'l3' ? (localStorage.getItem(`tucu_l3_turnero_active_${rL3}`) ?? localStorage.getItem(`tucu_l3_turnero_active_${state.rubro}`)) : null;
    const isPaused = l2F !== null ? l2F === 'false' : (l3F !== null ? l3F === 'false' : localStorage.getItem('tucu_turnero_open') === 'false');
    if (isPaused) { root.innerHTML = '<div class="py-8 text-center space-y-2"><h2 class="font-title text-base font-extrabold">Turnero en Pausa Temporal</h2><p class="text-xs text-stone-500">El comercio pausó momentáneamente las reservas web.</p></div>'; return; }
    if (state.step === 4 && state.result) root.innerHTML = renderStep4();
    else if (state.step === 3) root.innerHTML = renderStep3(info);
    else if (state.step === 2) root.innerHTML = renderStep2();
    else root.innerHTML = renderStep1();
  }

  function submitBooking(ev) {
    ev.preventDefault();
    const name = document.getElementById('inp-client-name')?.value.trim(), phone = (document.getElementById('inp-client-phone')?.value || '').replace(/\D/g, '');
    if (!name || phone.length < 6) return;
    state.clientName = name; state.clientPhone = phone; state.coverage = document.getElementById('inp-client-cov')?.value || '';
    const rKey = state.level === 'l3' ? (cat().RUBRO_META[state.rubro]?.l3 || state.rubro) : state.rubro;
    if (window.AdminContactsStore?.isRestrictedPhone?.(state.level, rKey, phone)) {
      state.restrictedNotice = 'Para coordinar este turno, comunicate directamente con el local.';
      render(); return;
    }
    state.restrictedNotice = '';
    const service = state.services.find(s => s.id === state.selectedServiceId) || state.services[0], staff = state.staffList.find(s => s.id === state.selectedStaffId) || state.staffList[0], resource = state.resList.find(r => r.id === state.selectedResId) || state.resList[0];
    state.result = cat().saveBooking({ ...state, date: state.selectedDate, time: state.selectedTime, service, staff, resource });
    state.step = 4; render();
  }

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', render);
  return {
    render, submitBooking,
    pickService: (id) => { state.selectedServiceId = id; render(); },
    pickStaff: (id) => { state.selectedStaffId = id; state.selectedTime = getAvailableSlots(state.selectedDate)[0] || ''; render(); },
    pickRes: (id) => { state.selectedResId = id; },
    pickDate: (iso) => { state.selectedDate = iso; state.selectedTime = getAvailableSlots(iso)[0] || ''; render(); },
    pickTime: (t) => { state.selectedTime = t; render(); },
    goStep: (n) => { state.step = n; render(); },
    resetFlow: () => { state.step = 1; state.result = null; render(); }
  };
})();