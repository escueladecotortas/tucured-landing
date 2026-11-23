// Archivo: public/js/admin_shared/turnero_app.js
// Orquestador Turnero V2 (L1/L2/L3): Vocabulario nativo, logos en card, fix Obra Social y layout compacto (< 195L)

window.TucuTurneroApp = (function () {
  const cat = () => window.TucuTurneroCatalog, eng = () => window.AdminBookingEngine;
  const ui = () => window.TucuStepsUI, lk = () => window.TucuTicketLookup, tk = () => window.TucuTicketInline, md = () => window.TucuModalsV2;
  const fmt = (n) => (eng() ? eng().fmt(n) : '$' + Number(n || 0).toLocaleString('es-AR'));
  const readJson = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (_) { return fb; } };
  const state = {
    level: 'l1', slug: 'demo-peluqueria', rubro: 'peluqueria', step: 1, coverInit: false, skipCover: false, showCover: true,
    coverKey: '', coverConfig: null, services: [], staffList: [], resList: [], selectedServiceId: '', selectedStaffId: '', selectedResId: '',
    datePage: 0, selectedDate: '', selectedTime: '', clientFirstName: '', clientLastName: '', clientPhone: '', clientBirthday: '', clientEmail: '',
    coverage: 'OSDE', hasSavedProfile: false, editingProfile: false, phoneUnlocked: false, profileLoaded: false, step2Error: '',
    restrictedNotice: '', result: null, receiptFileName: '', toastMsg: '', copiedKey: '', showCbu: false, reschedulingCode: '', reschedulingRecord: null
  };

  const localIso = (offset = 0) => {
    if (window.AdminShell?.localTodayStr) return window.AdminShell.localTodayStr(offset);
    const d = new Date(); d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  function getUpcomingDays() {
    const all = [], names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], fullNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
    for (let i = 0; all.length < 12 && i < 20; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      if (d.getDay() === 0 && state.rubro !== 'gastronomia') continue;
      const mName = cap(d.toLocaleDateString('es-AR', { month: 'long' }));
      all.push({ iso: localIso(i), label: i === 0 ? 'Hoy' : names[d.getDay()], num: d.getDate(), monthYear: `${mName} ${d.getFullYear()}`, fullLabel: `${fullNames[d.getDay()]} ${d.getDate()} de ${mName}` });
    }
    state.datePage = Math.min(Math.max(0, state.datePage), Math.max(0, Math.floor((all.length - 1) / 4)));
    const visible = all.slice(state.datePage * 4, state.datePage * 4 + 4);
    return { all, visible, monthYearLabel: visible[0]?.monthYear || all[0]?.monthYear || '', canPrev: state.datePage > 0, canNext: state.datePage < Math.max(0, Math.floor((all.length - 1) / 4)) };
  }

  function getSlotState(dateStr) {
    const baseSlots = state.coverConfig?.theme?.slots || ['09:30', '11:00', '15:00', '16:30', '18:00', '19:30'];
    const futureSet = new Set(window.AdminShell?.filterFutureSlots ? window.AdminShell.filterFutureSlots(baseSlots, dateStr) : baseSlots);
    let closedReason = '', busySet = new Set();
    if (state.level === 'l1') {
      if (window.AdminHolidays?.isDateBlocked?.('l1', state.rubro, dateStr)) closedReason = 'Fecha cerrada por feriado nacional';
    } else if (state.level === 'l2') {
      if (window.AdminHolidays?.isDateBlocked?.('l2', state.rubro, dateStr)) closedReason = 'Fecha cerrada por feriado nacional';
      const activeR = localStorage.getItem('tucu_l2_rubro') || '', sameR = !activeR || activeR === state.rubro;
      const vacs = readJson(`tucu_l2_vacations_${state.rubro}`, sameR ? readJson('tucu_l2_vacations', []) : []);
      if (!closedReason && Array.isArray(vacs) && vacs.some(v => v && !v.deletedAt && dateStr >= v.from && dateStr <= v.to)) closedReason = 'Fecha cerrada por vacaciones';
      const occ = readJson(`tucu_l2_occupied_slots_${state.rubro}`, sameR ? readJson('tucu_l2_occupied_slots', []) : []);
      const bks = [...readJson(`tucu_l2_bookings_${state.rubro}`, []), ...readJson('tucu_l2_bookings', []).filter(b => b && (b.rubroId === state.rubro || (!b.rubroId && sameR)))];
      busySet = new Set([...(Array.isArray(occ) ? occ : []), ...bks.filter(b => b && !b.deletedAt && (b.date || b.dateStr) === dateStr && !['CANCELLED', 'CANCELADO'].includes(String(b.status || '').toUpperCase())).map(b => b.time)]);
    } else if (state.level === 'l3') {
      const rL3 = cat().RUBRO_META[state.rubro]?.l3 || 'barberia';
      if (window.AdminHolidays?.isDateBlocked?.('l3', rL3, dateStr)) closedReason = 'Fecha cerrada por feriado';
      else if (!window.AdminHolidays?.isDateBlocked && readJson('tucu_l3_holidays', []).some(h => h && !h.deletedAt && !h.isException && h.date === dateStr)) closedReason = 'Fecha cerrada por feriado';
      const staff = state.staffList.find(s => s.id === state.selectedStaffId), wh = staff?.workingHours?.[String(new Date(`${dateStr}T12:00:00`).getDay())];
      if (!closedReason && wh && !wh.active) closedReason = 'Sin atención para este especialista en la fecha elegida';
      const blocks = readJson(`tucu_l3_blocks_${rL3}`, []), bks = [...readJson(`tucu_l3_bookings_${rL3}`, []), ...readJson('tucu_l3_bookings', []).filter(b => b && (!b.rubroId || b.rubroId === rL3))];
      const booked = new Set(bks.filter(b => b && !b.deletedAt && (b.date || b.dateStr) === dateStr && !['CANCELLED', 'CANCELADO'].includes(String(b.status || '').toUpperCase()) && (!b.staffId || !state.selectedStaffId || b.staffId === state.selectedStaffId)).map(b => b.time));
      baseSlots.forEach(t => {
        const outWh = wh && !(t >= (wh.start || '09:00') && t < (wh.end || '19:00')) && !(wh.isSplit && t >= (wh.open2 || '16:00') && t < (wh.close2 || '21:00'));
        const srvBlk = Array.isArray(blocks) && blocks.some(bl => bl && !bl.deletedAt && bl.date === dateStr && t >= bl.start && t <= bl.end && (!bl.serviceId || !state.selectedServiceId || bl.serviceId === state.selectedServiceId));
        if (booked.has(t) || outWh || srvBlk) busySet.add(t);
      });
    }
    const items = baseSlots.map(t => ({ time: t, isPast: !futureSet.has(t), isBlocked: busySet.has(t) }));
    return { closedReason, items, available: closedReason ? [] : items.filter(it => !it.isPast && !it.isBlocked).map(it => it.time) };
  }

  function applyThemeVars(cfg) {
    const accent = cfg?.accent; if (!accent || typeof document === 'undefined') return;
    const st = document.documentElement.style;
    [['--tucu-primary', accent.bg], ['--tucu-primary-hover', accent.hover], ['--tucu-primary-text', accent.text], ['--tucu-soft-bg', accent.softBg || '#F5F2EC'], ['--tucu-soft-text', accent.softText || accent.bg], ['--tucu-soft-border', accent.softBorder || accent.bg], ['--tucu-accent', accent.bg], ['--tucu-accent-light', cfg.accentLight || '#FCD34D'], ['--tucu-panel-bg', cfg.panelBg || '#F1EBE3'], ['--tucu-display-font', cfg.displayFont || "'Instrument Serif', Georgia, serif"], ['--tucu-display-tracking', cfg.letterSpacing || '0em']].forEach(([k, v]) => st.setProperty(k, v));
  }

  function syncLayout(mode) {
    const coverEl = document.getElementById('turnero-cover-stage'), bookEl = document.getElementById('turnero-booking-stage');
    if (!coverEl || !bookEl) return;
    const full = mode === 'paused' || mode === 'skip', isCov = mode === 'cover';
    coverEl.className = full ? 'hidden' : (isCov ? 'w-full min-h-[100dvh] lg:block lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden' : 'hidden lg:block w-full lg:h-screen lg:sticky lg:top-0 lg:overflow-hidden');
    bookEl.className = `${!full && isCov ? 'hidden lg:flex' : 'flex'} flex-col justify-between w-full min-h-[100dvh] ${full ? 'lg:col-span-2 ' : ''}lg:h-screen lg:overflow-y-auto text-stone-900`;
    bookEl.style.backgroundColor = 'var(--tucu-panel-bg, #F1EBE3)';
  }

  function openInlineBookingRecord(record) {
    if (!record) return;
    Object.assign(state, { result: { code: String(record.token || record.id || 'TK-DEMO').replace(/^#/, '').toUpperCase(), record }, showCover: false, step: 3, toastMsg: '', receiptFileName: '', showCbu: false, reschedulingCode: '', reschedulingRecord: null }); render();
  }
  function openInlineTicketByCode(code, demoRec) { openInlineBookingRecord(tk()?.findBooking?.(code, state.level) || demoRec); }

  function loadContext() {
    const p = new URLSearchParams(window.location.search);
    if (!state.coverInit) { state.skipCover = p.get('skipCover') === '1'; state.showCover = !state.skipCover; state.coverInit = true; }
    if (!state.profileLoaded) {
      state.profileLoaded = true; const prof = lk()?.getClientProfile?.();
      if (prof?.nombre && prof?.whatsapp) Object.assign(state, { clientFirstName: prof.nombre, clientLastName: prof.apellido || '', clientPhone: prof.whatsapp, clientBirthday: prof.cumpleanos || '', clientEmail: prof.email || '', coverage: prof.obraSocial || state.coverage, hasSavedProfile: Boolean(prof.nombre && prof.apellido && prof.whatsapp) });
    }
    state.level = ['l1', 'l2', 'l3'].includes((p.get('level') || '').toLowerCase()) ? p.get('level').toLowerCase() : 'l1';
    state.slug = (p.get('slug') || localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria').trim();
    state.rubro = cat().normalizeRubro(p.get('rubro') || 'peluqueria');
    state.coverConfig = window.TucuCoverData?.resolveCoverConfig?.(state.rubro, state.level) || null;
    state.services = cat().getActiveServices(state);
    const sr = cat().getStaffAndResources(state); state.staffList = sr.staff; state.resList = sr.resources;
    if (!state.services.some(s => s.id === state.selectedServiceId)) state.selectedServiceId = state.services[0]?.id || '';
    if (!state.staffList.some(s => s.id === state.selectedStaffId)) state.selectedStaffId = state.staffList[0]?.id || '';
    if (!state.resList.some(r => r.id === state.selectedResId)) state.selectedResId = state.resList[0]?.id || '';
    const daysInfo = getUpcomingDays();
    if (!state.selectedDate || !daysInfo.all.some(d => d.iso === state.selectedDate)) state.selectedDate = daysInfo.all.find(d => getSlotState(d.iso).available.length > 0)?.iso || daysInfo.all[0]?.iso || '';
    const valid = getSlotState(state.selectedDate).available;
    if (!valid.includes(state.selectedTime)) state.selectedTime = valid[0] || '';
    return daysInfo;
  }

  function buildCalEvent() {
    const rec = state.result?.record || {}, srv = state.services.find(s => s.id === state.selectedServiceId) || state.services[0], code = String(state.result?.code || rec.token || rec.id || 'TK-DEMO').replace(/^#/, '');
    return { uid: code, title: `${rec.serviceName || rec.service || srv?.name || 'Reserva'} - ${rec.bizName || state.coverConfig?.bizName || 'Tucu Red'}`, location: rec.address || state.coverConfig?.address || '', description: `Reserva #${code}`, dateStr: rec.dateStr || rec.date || state.selectedDate, timeStr: rec.time || state.selectedTime, durationMin: Number(rec.duration || srv?.duration || 30) };
  }

  function render() {
    const root = document.getElementById('turnero-root'); if (!root) return;
    const daysInfo = loadContext(), info = cat().resolveBizInfo(state), bizName = state.coverConfig?.bizName || info.bizName, address = state.coverConfig?.address || info.address;
    const vocab = state.coverConfig?.vocab || { singular: 'turno', plural: 'turnos', nextLabel: 'Tu próximo turno', historyLabel: 'Mis turnos', ctaLabel: 'Reservar turno', docTitle: 'Comprobante de turno', cancelLabel: 'Cancelar turno', anotherLabel: 'Sacar otro turno' };
    applyThemeVars(state.coverConfig);
    const l2F = state.level === 'l2' ? localStorage.getItem(`tucu_l2_turnero_active_${state.rubro}`) : null, rL3 = cat().RUBRO_META[state.rubro]?.l3 || state.rubro;
    const l3F = state.level === 'l3' ? (localStorage.getItem(`tucu_l3_turnero_active_${rL3}`) ?? localStorage.getItem(`tucu_l3_turnero_active_${state.rubro}`)) : null;
    if (l2F !== null ? l2F === 'false' : (l3F !== null ? l3F === 'false' : localStorage.getItem('tucu_turnero_open') === 'false')) { syncLayout('paused'); root.innerHTML = ui().renderPaused(); return; }
    const activeSeed = lk()?.getActiveSeed?.(state.level, state.rubro) || null, prof = lk()?.getClientProfile?.() || null, hist = lk()?.getClientHistory?.(state.level, state.rubro) || [];
    const coverEl = document.getElementById('turnero-cover-stage'), cfgKey = `${state.rubro}|${state.level}|${bizName}|${state.coverConfig?.bg}|${state.coverConfig?.logo}|${state.coverConfig?.accent?.bg}|${activeSeed?.token || ''}|${activeSeed?.date || ''}|${activeSeed?.time || ''}|${prof?.nombre || ''}|${hist.length}`;
    if (!state.skipCover && coverEl && window.TucuCoverUI && state.coverConfig && state.coverKey !== cfgKey) {
      state.coverKey = cfgKey;
      window.TucuCoverUI.mount(coverEl, state.coverConfig, () => { state.showCover = false; render(); }, {
        activeSeed, clientProfile: prof, historyCount: hist.length, onOpenSeed: (s) => openInlineTicketByCode(s?.token),
        onOpenHistory: () => md()?.openHistoryModal?.({ bookings: hist, vocab, fmt, onSelectBooking: (bk) => openInlineTicketByCode(bk.token || bk.id, bk) }),
        onOpenLookup: () => lk()?.openLookupModal?.({ lvl: state.level, norm: state.rubro, accent: state.coverConfig?.accent?.bg, vocab, onFoundBooking: (bk) => openInlineTicketByCode(bk.token || bk.id, bk) })
      });
    }
    syncLayout(state.skipCover ? 'skip' : (state.showCover ? 'cover' : 'booking'));
    const service = state.services.find(s => s.id === state.selectedServiceId) || state.services[0], staff = state.staffList.find(s => s.id === state.selectedStaffId) || state.staffList[0], dayObj = daysInfo.all.find(d => d.iso === state.selectedDate) || daysInfo.all[0];
    const ctx = {
      ...state, bizName, address, vocab, logoUrl: state.coverConfig?.logo || '', service, staff, days: daysInfo.visible, monthYearLabel: daysInfo.monthYearLabel, canPrev: daysInfo.canPrev, canNext: daysInfo.canNext, dateLabel: dayObj?.fullLabel || state.selectedDate,
      slotState: getSlotState(state.selectedDate), serviceQuestion: state.coverConfig?.theme?.serviceQuestion || '¿Qué te querés hacer?',
      fmt, calcDeposit: (s) => (s ? (eng() ? eng().calcDeposit(s.price, state.level, s.requireDeposit) : Math.round(s.price * 0.5)) : 0)
    };
    root.innerHTML = state.step === 3 && state.result ? tk().renderTicket(ctx) : (state.step === 2 ? ui().renderStep2(ctx) : ui().renderStep1(ctx));
  }

  function confirmFromStep2(ev) {
    ev.preventDefault();
    const fast = Boolean(state.hasSavedProfile && !state.editingProfile && state.clientFirstName && state.clientLastName && state.clientPhone);
    const first = fast ? state.clientFirstName : (document.getElementById('inp-client-first')?.value.trim() || ''), last = fast ? state.clientLastName : (document.getElementById('inp-client-last')?.value.trim() || '');
    const phone = fast ? state.clientPhone : (document.getElementById('inp-client-phone')?.value || '').replace(/\D/g, '');
    if (!first || !last || phone.length < 6) { state.step2Error = 'Completá tu nombre, apellido y WhatsApp válido.'; render(); return; }
    const bday = fast ? state.clientBirthday : (document.getElementById('inp-client-birthday')?.value || '').trim(), mail = fast ? state.clientEmail : (document.getElementById('inp-client-email')?.value || '').trim();
    const covEl = document.getElementById('inp-client-cov'), isHealth = state.rubro === 'salud'; if (isHealth && covEl) state.coverage = covEl.value || 'OSDE';
    Object.assign(state, { clientFirstName: first, clientLastName: last, clientPhone: phone, clientBirthday: bday, clientEmail: mail });
    const rKey = state.level === 'l3' ? (cat().RUBRO_META[state.rubro]?.l3 || state.rubro) : state.rubro;
    if (window.AdminContactsStore?.isRestrictedPhone?.(state.level, rKey, phone)) { state.restrictedNotice = 'Para coordinar este horario, comunicate directamente con el local.'; render(); return; }
    const service = state.services.find(s => s.id === state.selectedServiceId) || state.services[0], staff = state.staffList.find(s => s.id === state.selectedStaffId) || state.staffList[0], resource = state.resList.find(r => r.id === state.selectedResId) || state.resList[0];
    const patch = { ...state, coverage: isHealth ? state.coverage : '', clientName: `${first} ${last}`.trim(), date: state.selectedDate, time: state.selectedTime, service, staff, resource };
    state.result = state.reschedulingCode && state.reschedulingRecord ? tk().rescheduleBooking(state.level, state.rubro, state.reschedulingRecord, patch) : cat().saveBooking(patch);
    lk()?.saveSeed?.(state.result.record, { level: state.level, rubro: state.rubro });
    lk()?.saveClientProfile?.({ nombre: first, apellido: last, whatsapp: phone, cumpleanos: bday, email: mail, obraSocial: isHealth ? state.coverage : undefined });
    const wasResched = Boolean(state.reschedulingCode);
    Object.assign(state, { hasSavedProfile: true, editingProfile: false, phoneUnlocked: false, step2Error: '', restrictedNotice: '', receiptFileName: '', toastMsg: wasResched ? 'Horario actualizado correctamente' : '', copiedKey: '', showCbu: false, reschedulingCode: '', reschedulingRecord: null, coverKey: '', step: 3 });
    render();
  }

  function startReschedule() {
    const rec = state.result?.record; if (!rec || rec.isDemoSample) return;
    const srv = state.services.find(s => s.id === rec.serviceId || s.name === (rec.serviceName || rec.service)), stf = state.staffList.find(s => s.id === rec.staffId || s.name === rec.staffName);
    Object.assign(state, { reschedulingCode: state.result.code, reschedulingRecord: rec, selectedServiceId: srv?.id || state.selectedServiceId, selectedStaffId: stf?.id || state.selectedStaffId, step: 1, toastMsg: '' }); render();
  }

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', render);
  return {
    render, confirmFromStep2, openInlineTicketByCode, startReschedule,
    openCancelModal: () => { const rec = state.result?.record; if (rec && !rec.isDemoSample) md()?.openCancelReasonModal?.({ booking: rec, vocab: state.coverConfig?.vocab, onConfirmCancel: (reason) => { tk().cancelBooking(state.level, state.rubro, rec, reason); Object.assign(state, { toastMsg: 'Cancelación confirmada y horario liberado', coverKey: '' }); render(); } }); },
    cancelReschedule: () => { Object.assign(state, { reschedulingCode: '', reschedulingRecord: null, step: 3 }); render(); },
    enterBooking: () => { state.showCover = false; render(); }, backToCover: () => { state.showCover = true; render(); }, editClientProfile: () => { state.editingProfile = true; state.phoneUnlocked = false; render(); },
    unlockPhone: () => { Object.assign(state, { clientFirstName: document.getElementById('inp-client-first')?.value.trim() ?? state.clientFirstName, clientLastName: document.getElementById('inp-client-last')?.value.trim() ?? state.clientLastName, clientBirthday: document.getElementById('inp-client-birthday')?.value ?? state.clientBirthday, clientEmail: document.getElementById('inp-client-email')?.value ?? state.clientEmail, phoneUnlocked: true }); render(); document.getElementById('inp-client-phone')?.focus(); },
    toggleCbu: () => { state.showCbu = !state.showCbu; render(); }, pickService: (id) => { state.selectedServiceId = id; render(); },
    pickStaff: (id) => { state.selectedStaffId = id; state.selectedTime = getSlotState(state.selectedDate).available[0] || ''; render(); },
    pickDate: (iso) => { state.selectedDate = iso; state.selectedTime = getSlotState(iso).available[0] || ''; render(); },
    prevDatePage: () => { if (state.datePage > 0) { state.datePage--; const v = getUpcomingDays().visible[0]; if (v) state.selectedDate = v.iso; render(); } },
    nextDatePage: () => { state.datePage++; const v = getUpcomingDays().visible[0]; if (v) state.selectedDate = v.iso; render(); },
    pickTime: (t) => { state.selectedTime = t; render(); }, goStep: (n) => { state.step2Error = ''; state.restrictedNotice = ''; state.step = n; render(); },
    copyBank: (k) => { const b = tk().resolveBankData(state.level, state.rubro); navigator.clipboard?.writeText?.(k === 'cbu' ? b.cbu : b.alias).catch(() => {}); state.copiedKey = k; state.toastMsg = `${k === 'cbu' ? 'CBU / CVU' : 'Alias'} copiado al portapapeles`; render(); },
    onReceiptChange: (inp) => { state.receiptFileName = inp?.files?.[0]?.name || ''; const lbl = document.getElementById('inline-receipt-label'), btn = document.getElementById('btn-inline-report-receipt'); if (lbl) lbl.textContent = state.receiptFileName || 'Adjuntar comprobante (JPG, PNG o PDF)'; if (btn) btn.disabled = !state.receiptFileName; },
    reportInlineReceipt: () => { if (!state.result?.record || !state.receiptFileName) return; tk().reportReceipt(state.level, state.result.record, state.receiptFileName); state.toastMsg = 'Comprobante informado — en validación'; render(); },
    openSmartCalendar: () => state.result && tk().openSmartCalendar(buildCalEvent(), state.result.code),
    resetFlow: () => { Object.assign(state, { step: 1, result: null, editingProfile: false, phoneUnlocked: false, receiptFileName: '', toastMsg: '', copiedKey: '', showCbu: false, reschedulingCode: '', reschedulingRecord: null }); render(); }
  };
})();