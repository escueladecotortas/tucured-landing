// Archivo: public/js/admin_l2/admin_l2_calendar.js
// Calendario L2: 5 Estados, Selector Servicio Manual, Filtros Temporales & Fecha Local (< 178L)

(function (global) {
  let rangeEnabled = false, statusFilter = 'ALL', timeFilter = 'hoy', drawerCtrl = null;
  const eng = () => global.AdminBookingEngine;
  const norm = (s) => (global.AdminShell ? global.AdminShell.normStr(s) : String(s || '').toLowerCase());
  const localToday = (off = 0) => {
    if (global.AdminShell?.localTodayStr) return global.AdminShell.localTodayStr(off);
    const d = new Date(); if (off) d.setDate(d.getDate() + off);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const activeRubro = () => {
    const p = new URLSearchParams(window.location.search), slug = p.get('slug') || '';
    const raw = p.get('rubro') || (slug.startsWith('demo-') && slug !== 'demo-central' ? slug : '') || localStorage.getItem('tucu_l2_rubro') || 'estetica';
    return global.AdminDemoSeed?.resolveRubro ? global.AdminDemoSeed.resolveRubro(raw) : 'estetica';
  };

  function getBookings() {
    const r = activeRubro();
    let part = [], mainList = [];
    try { const s = localStorage.getItem(`tucu_l2_bookings_${r}`); if (s) part = JSON.parse(s) || []; } catch (_) {}
    try { const m = localStorage.getItem('tucu_l2_bookings'); if (m) mainList = (JSON.parse(m) || []).filter(b => b && (b.rubroId === r || (!b.rubroId && part.length === 0 && r === (localStorage.getItem('tucu_l2_rubro') || 'estetica')))); } catch (_) {}
    const combined = [...(Array.isArray(part) ? part : []), ...(Array.isArray(mainList) ? mainList : [])].filter((b, i, a) => b && a.findIndex(x => x.id === b.id) === i);
    const raw = combined.length ? combined : (global.AdminDemoSeed ? global.AdminDemoSeed.getL2Seed(eng()?.getConfig('l2'), r) : []);
    const hydrated = eng() ? raw.map(b => ({ ...eng().hydrateBooking(b, 'l2', 12000), rubroId: b.rubroId || r })) : raw;
    saveBookings(hydrated);
    return hydrated;
  }

  function saveBookings(list) {
    const r = activeRubro(), tagged = (list || []).map(b => ({ ...b, rubroId: b.rubroId || r }));
    try {
      localStorage.setItem(`tucu_l2_bookings_${r}`, JSON.stringify(tagged));
      const all = JSON.parse(localStorage.getItem('tucu_l2_bookings') || '[]'), others = Array.isArray(all) ? all.filter(b => b && b.rubroId && b.rubroId !== r) : [];
      localStorage.setItem('tucu_l2_bookings', JSON.stringify([...tagged, ...others]));
    } catch (_) {}
  }

  function resetDemoBookings() { if (global.AdminDemoSeed) global.AdminDemoSeed.resetLevel('l2', '', activeRubro()); renderCalendar(); global.adminL2Core?.showToast('Base de práctica L2 restaurada'); }

  function matchTimeWindow(b) {
    const today = localToday(0), bDate = b.date || today;
    const filterDate = document.getElementById('cal-filter-date')?.value;
    const fromD = document.getElementById('cal-filter-from')?.value || '', toD = document.getElementById('cal-filter-to')?.value || '';
    if (rangeEnabled) return (!fromD || bDate >= fromD) && (!toD || bDate <= toD);
    if (timeFilter === 'date' && filterDate) return bDate === filterDate;
    if (timeFilter === 'hoy') return bDate === today;
    if (timeFilter === 'semana') return bDate >= localToday(-3) && bDate <= localToday(7);
    if (timeFilter === 'mes') return String(bDate).slice(0, 7) === today.slice(0, 7);
    return true;
  }

  function renderCalendar() {
    const container = document.getElementById('calendar-bookings-container'); if (!container) return;
    drawerCtrl?.syncBadge?.();
    const bookings = getBookings(), q = norm(document.getElementById('cal-search-input')?.value.trim());
    const periodList = bookings.filter(b => !b.deletedAt && matchTimeWindow(b));
    const filtered = periodList.filter(b => (statusFilter === 'ALL' || eng().normalizeKey(b.status) === statusFilter) && (!q || norm(b.client || b.name).includes(q) || norm(b.phone).includes(q) || norm(b.id).includes(q) || norm(b.service).includes(q)));
    const lbl = document.getElementById('booking-list-date-label');
    if (lbl) lbl.textContent = rangeEnabled ? 'Rango Personalizado' : ({ hoy: 'Hoy', semana: 'Esta Semana', mes: 'Este Mes', todos: 'Todos', date: document.getElementById('cal-filter-date')?.value || 'Fecha' }[timeFilter] || 'Hoy');

    if (filtered.length === 0) container.innerHTML = '<div class="p-8 text-center text-xs text-stone-500 dark:text-stone-400">No hay turnos registrados para este filtro.</div>';
    else container.innerHTML = filtered.map(b => {
      const meta = eng().getMeta(b.status), muted = meta.key === 'CANCELLED' || meta.key === 'COMPLETED' || meta.key === 'NO_SHOW';
      return `<div class="p-4 flex items-center justify-between flex-wrap gap-3 hover:bg-stone-50/80 dark:hover:bg-stone-900/60 transition-colors ${muted ? 'opacity-75' : ''}">
        <div class="flex items-start gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-xl tucu-primary-soft border flex items-center justify-center tabular-nums font-bold text-xs shrink-0 shadow-xs">${b.time || '--:--'}</div>
          <div class="min-w-0 space-y-1"><p class="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">${b.client || b.name}</p><p class="text-xs font-medium text-stone-600 dark:text-stone-300">${b.service || 'Turno Reservado'}</p><div class="flex items-center gap-2 flex-wrap"><span class="tucu-badge ${meta.badge}">${meta.label}</span>${eng().renderInlineDepositBadge(b)}${eng().renderUndoLabel(b.status, b.prevStatus, b)}</div>${eng().renderCollapsibleDetail(b)}</div>
        </div>
        <div class="flex items-center flex-wrap gap-2">${eng().renderActionButtons(b.id, b.status, 'adminL2Calendar', b.prevStatus)}</div>
      </div>`;
    }).join('');

    const k = eng().computeKpis(periodList), total = Math.max(1, periodList.length);
    const blocked = k.cancelledCount + k.noShowCount, occ = Math.min(100, Math.round((k.activeCount / total) * 100));
    const depPct = k.potentialDeposits > 0 ? Math.min(100, Math.round((k.creditedDeposits / k.potentialDeposits) * 100)) : 0;
    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const setW = (id, w) => { const el = document.getElementById(id); if (el) el.style.width = `${w}%`; };
    setT('metric-confirmed-count', k.confirmedCount); setT('metric-deposit-total', eng().fmt(k.creditedDeposits));
    setT('metric-blocked-count', blocked); setT('metric-occupancy-percent', `${occ}%`);
    setW('metric-confirmed-bar', Math.round((k.confirmedCount / total) * 100)); setW('metric-deposit-bar', depPct);
    setW('metric-blocked-bar', Math.round((blocked / total) * 100)); setW('metric-occupancy-bar', occ);
  }

  function mutateBooking(id, fn, toastMsg) { const list = getBookings(), bk = list.find(b => b.id === id); if (!bk) return; fn(bk); saveBookings(list); renderCalendar(); global.adminL2Core?.showToast(toastMsg); }
  const setStatus = (id, nextCanon) => mutateBooking(id, b => eng().applyTransition(b, nextCanon, 'l2'), `Estado actualizado: ${eng().getMeta(nextCanon).label}`);
  function undoStatus(id) { const list = getBookings(), bk = list.find(b => b.id === id); if (!bk) return; eng().undoTransition(bk, 'l2'); saveBookings(list); renderCalendar(); global.adminL2Core?.showToast(`Turno reabierto · Volvió a ${eng().getMeta(bk.status).label}`); }
  function creditDeposit(id) { const bk = getBookings().find(b => b.id === id); if (!bk) return; eng().openPaymentPicker({ title: `Acreditar Seña · ${bk.client || bk.name}`, amount: bk.depositAmount, level: 'l2', onConfirm: (m) => mutateBooking(id, b => eng().applyTransition(b, 'CONFIRMED', 'l2', m), `Seña acreditada (${m})`) }); }

  function onManualServiceChange() {
    const sel = document.getElementById('l2-mbk-srv'), opt = sel?.selectedOptions?.[0], pInp = document.getElementById('l2-mbk-price');
    const pWrap = document.getElementById('manual-book-paid')?.closest('label'), mSel = document.getElementById('manual-book-method');
    if (opt && pInp && opt.dataset.price) pInp.value = opt.dataset.price;
    const price = parseInt(pInp?.value, 10) || 0, req = opt?.dataset?.req !== 'false', dep = eng().calcDeposit(price, 'l2', req);
    if (pWrap) pWrap.classList.toggle('hidden', dep === 0);
    if (mSel) mSel.classList.toggle('hidden', dep === 0 || !document.getElementById('manual-book-paid')?.checked);
  }

  function populateServiceSelect() {
    const sel = document.getElementById('l2-mbk-srv'); if (!sel) return;
    const raw = global.adminL2Services ? global.adminL2Services.getServices(false) : [];
    const srvs = raw.filter(s => (global.AdminShell ? global.AdminShell.isServiceAvailable(s) : s.isActive !== false && !s.deletedAt));
    sel.innerHTML = srvs.map(s => {
      const req = s.requireDeposit !== false, dep = eng().calcDeposit(s.price, 'l2', req);
      return `<option value="${s.id}" data-name="${s.name}" data-price="${s.price}" data-dur="${s.duration || 30}" data-req="${req}">${s.name} (${eng().fmt(s.price)} · ${dep > 0 ? 'Seña ' + eng().fmt(dep) : 'Sin seña'})</option>`;
    }).join('') || '<option value="">Sin servicios activos</option>';
    onManualServiceChange();
  }

  function openManualBookingModal() {
    const modal = document.getElementById('manual-booking-modal'); if (!modal) return;
    populateServiceSelect();
    modal.classList.remove('hidden'); modal.classList.add('flex');
    global.AdminShell?.bindDateTimeGuards({ dateId: 'manual-book-date', timeId: 'manual-book-time', initialDate: localToday(0) });
    const mSel = document.getElementById('manual-book-method');
    if (mSel) mSel.innerHTML = eng().getEnabledMethods('l2').map(m => `<option value="${m.label}">${m.label}</option>`).join('');
    onManualServiceChange();
  }

  function closeManualBookingModal() { const modal = document.getElementById('manual-booking-modal'); if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } }

  function saveManualBooking() {
    const sel = document.getElementById('l2-mbk-srv'), opt = sel?.selectedOptions?.[0];
    const name = document.getElementById('manual-book-name')?.value.trim(), rawPhone = document.getElementById('manual-book-phone')?.value;
    const phone = global.adminL2Core?.sanitizeCleanPhone(rawPhone) || rawPhone, pax = document.getElementById('manual-book-pax')?.value || '1';
    const today = localToday(0), date = document.getElementById('manual-book-date')?.value || today, time = document.getElementById('manual-book-time')?.value || '';
    const price = parseInt(document.getElementById('l2-mbk-price')?.value, 10) || Number(opt?.dataset?.price || 12000);
    if (!sel?.value) return global.adminL2Core?.showToast('Activa al menos un servicio antes de agendar', 'error');
    if (!name || !phone) return global.adminL2Core?.showToast('Completa nombre y teléfono', 'error');
    if (date < today || !time || (date === today && global.AdminShell && time <= global.AdminShell.currentHHMM())) return global.adminL2Core?.showToast('Selecciona fecha y horario futuros', 'error');
    const req = opt?.dataset?.req !== 'false', depAmt = eng().calcDeposit(price, 'l2', req);
    const paid = depAmt === 0 ? true : (document.getElementById('manual-book-paid')?.checked ?? true);
    const method = paid ? (depAmt === 0 ? null : document.getElementById('manual-book-method')?.value || 'Efectivo') : null;
    const id = 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase(), list = getBookings(), r = activeRubro();
    list.unshift({ id, rubroId: r, bizName: localStorage.getItem('tucu_l2_biz_name') || '', address: localStorage.getItem('tucu_l2_address') || '', service: opt?.dataset?.name || 'Servicio', serviceId: sel.value, duration: Number(opt?.dataset?.dur || 30), client: name, phone, pax, date, time, price, depositAmount: depAmt, depositPaid: paid, paymentMethod: method, paidAt: paid ? new Date().toISOString() : null, status: depAmt === 0 || paid ? 'CONFIRMED' : 'PENDING_DEPOSIT', prevStatus: null, createdAt: new Date().toISOString() });
    saveBookings(list); closeManualBookingModal();
    if (document.getElementById('manual-book-name')) document.getElementById('manual-book-name').value = '';
    if (document.getElementById('manual-book-phone')) document.getElementById('manual-book-phone').value = '';
    renderCalendar(); global.adminL2Core?.showToast(`Turno agendado con éxito: #${id}`);
  }
  function init() {
    const fromEl = document.getElementById('cal-filter-from'), toEl = document.getElementById('cal-filter-to');
    if (fromEl && !fromEl.value) fromEl.value = localToday(-7); if (toEl && !toEl.value) toEl.value = localToday(7);
    const syncTimeChips = (active) => {
      document.querySelectorAll('[data-l2tfilter]').forEach(x => x.classList.toggle('is-active', !rangeEnabled && x.dataset.l2tfilter === active));
      document.getElementById('cal-btn-range-toggle')?.classList.toggle('is-active', rangeEnabled || timeFilter === 'date');
    };
    document.getElementById('cal-btn-range-toggle')?.addEventListener('click', () => {
      rangeEnabled = !rangeEnabled;
      document.getElementById('cal-range-panel')?.classList.toggle('hidden', !rangeEnabled);
      syncTimeChips(timeFilter); renderCalendar();
    });
    document.querySelectorAll('[data-l2tfilter]').forEach(b => b.addEventListener('click', () => {
      rangeEnabled = false; document.getElementById('cal-range-panel')?.classList.add('hidden');
      if (document.getElementById('cal-filter-date')) document.getElementById('cal-filter-date').value = '';
      timeFilter = b.dataset.l2tfilter || 'hoy'; syncTimeChips(timeFilter); renderCalendar();
    }));
    document.getElementById('cal-filter-date')?.addEventListener('change', (e) => { rangeEnabled = false; timeFilter = e.target.value ? 'date' : 'todos'; syncTimeChips(timeFilter); renderCalendar(); });
    document.querySelectorAll('[data-l2filter]').forEach(b => b.addEventListener('click', () => {
      statusFilter = b.dataset.l2filter || 'ALL';
      document.querySelectorAll('[data-l2filter]').forEach(x => x.classList.toggle('is-active', x.dataset.l2filter === statusFilter));
      renderCalendar();
    }));
    document.getElementById('l2-mbk-srv')?.addEventListener('change', onManualServiceChange);
    document.getElementById('manual-book-paid')?.addEventListener('change', (e) => document.getElementById('manual-book-method')?.classList.toggle('hidden', !e.target.checked));
    ['cal-filter-from', 'cal-filter-to'].forEach(id => document.getElementById(id)?.addEventListener('change', renderCalendar));
    document.getElementById('cal-search-input')?.addEventListener('input', renderCalendar);
    document.getElementById('btn-open-new-booking-modal')?.addEventListener('click', openManualBookingModal);
    document.getElementById('btn-close-manual-modal')?.addEventListener('click', closeManualBookingModal);
    document.getElementById('btn-save-manual-booking')?.addEventListener('click', saveManualBooking);
    drawerCtrl = global.AdminThemeSync?.bindFilterDrawer?.('btn-toggle-filters', 'admin-filters-drawer', () => (statusFilter !== 'ALL' ? 1 : 0) + (rangeEnabled || timeFilter !== 'hoy' ? 1 : 0));
    renderCalendar();
  }

  global.adminL2Calendar = { init, getBookings, saveBookings, renderCalendar, cancelBooking: (id) => setStatus(id, 'CANCELLED'), setStatus, undoStatus, creditDeposit, resetDemoBookings, populateServiceSelect, openManualBookingModal, closeManualBookingModal, saveManualBooking };
})(typeof window !== 'undefined' ? window : global);