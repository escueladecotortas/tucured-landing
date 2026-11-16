// Archivo: public/js/admin_l2/admin_l2_calendar.js
// Calendario L2: 5 Estados, Botón Deshacer, Señas Dinámicas & Rango (Nexus OS v11.1 < 160L)

(function (global) {
  let rangeEnabled = false, statusFilter = 'ALL';
  const eng = () => global.AdminBookingEngine;
  const norm = (s) => (global.AdminShell ? global.AdminShell.normStr(s) : String(s || '').toLowerCase());

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

  function resetDemoBookings() {
    if (global.AdminDemoSeed) global.AdminDemoSeed.resetLevel('l2', '', activeRubro());
    renderCalendar();
    global.adminL2Core?.showToast('Base de práctica L2 restaurada');
  }

  function renderCalendar() {
    const container = document.getElementById('calendar-bookings-container'); if (!container) return;
    const bookings = getBookings();
    const filterDate = document.getElementById('cal-filter-date')?.value;
    const fromD = document.getElementById('cal-filter-from')?.value || '', toD = document.getElementById('cal-filter-to')?.value || '';
    const q = norm(document.getElementById('cal-search-input')?.value.trim());

    const periodList = bookings.filter(b => !b.deletedAt).filter(b => rangeEnabled ? ((!fromD || b.date >= fromD) && (!toD || b.date <= toD)) : (!filterDate || b.date === filterDate));
    const filtered = periodList.filter(b => {
      if (statusFilter !== 'ALL' && eng().normalizeKey(b.status) !== statusFilter) return false;
      return !q || norm(b.client || b.name).includes(q) || norm(b.phone).includes(q) || norm(b.id).includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div class="p-8 text-center text-xs text-stone-500 dark:text-stone-400">No hay turnos registrados para este filtro.</div>';
    } else {
      container.innerHTML = filtered.map(b => {
        const meta = eng().getMeta(b.status), muted = meta.key === 'CANCELLED' || meta.key === 'COMPLETED' || meta.key === 'NO_SHOW';
        return `<div class="p-4 flex items-center justify-between flex-wrap gap-3 hover:bg-stone-50/80 dark:hover:bg-stone-900/60 transition-colors ${muted ? 'opacity-75' : ''}">
          <div class="flex items-start gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300 border border-red-200/80 dark:border-red-900 flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">${b.time || '--:--'}</div>
            <div class="min-w-0 space-y-1">
              <p class="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">${b.client || b.name}</p>
              <p class="text-xs font-medium text-stone-600 dark:text-stone-300">${b.service || 'Turno Reservado'}</p>
              <div class="flex items-center gap-2 flex-wrap"><span class="text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${meta.badge}">${meta.label}</span>${eng().renderInlineDepositBadge(b)}${eng().renderUndoLabel(b.status, b.prevStatus, b)}</div>
              ${eng().renderCollapsibleDetail(b)}
            </div>
          </div>
          <div class="flex items-center flex-wrap gap-2">${eng().renderActionButtons(b.id, b.status, 'adminL2Calendar', b.prevStatus)}</div>
        </div>`;
      }).join('');
    }

    const k = eng().computeKpis(periodList), total = Math.max(1, periodList.length);
    const blocked = k.cancelledCount + k.noShowCount, occ = Math.min(100, Math.round((k.activeCount / Math.max(1, total)) * 100));
    const depPct = k.potentialDeposits > 0 ? Math.min(100, Math.round((k.creditedDeposits / k.potentialDeposits) * 100)) : 0;
    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const setW = (id, w) => { const el = document.getElementById(id); if (el) el.style.width = `${w}%`; };
    setT('metric-confirmed-count', k.confirmedCount); setT('metric-deposit-total', eng().fmt(k.creditedDeposits));
    setT('metric-blocked-count', blocked); setT('metric-occupancy-percent', `${occ}%`);
    setW('metric-confirmed-bar', Math.round((k.confirmedCount / total) * 100)); setW('metric-deposit-bar', depPct);
    setW('metric-blocked-bar', Math.round((blocked / total) * 100)); setW('metric-occupancy-bar', occ);
  }

  function mutateBooking(id, fn, toastMsg) {
    const list = getBookings(), bk = list.find(b => b.id === id);
    if (!bk) return; fn(bk); saveBookings(list); renderCalendar(); global.adminL2Core?.showToast(toastMsg);
  }
  function setStatus(id, nextCanon) { mutateBooking(id, b => eng().applyTransition(b, nextCanon, 'l2'), `Estado actualizado: ${eng().getMeta(nextCanon).label}`); }
  function undoStatus(id) {
    const list = getBookings(), bk = list.find(b => b.id === id);
    if (!bk) return;
    eng().undoTransition(bk, 'l2'); saveBookings(list); renderCalendar();
    global.adminL2Core?.showToast(`Turno reabierto · Volvió a ${eng().getMeta(bk.status).label}`);
  }
  function cancelBooking(id) { setStatus(id, 'CANCELLED'); }
  function creditDeposit(id) {
    const bk = getBookings().find(b => b.id === id); if (!bk) return;
    eng().openPaymentPicker({ title: `Acreditar Seña · ${bk.client || bk.name}`, amount: bk.depositAmount, level: 'l2', onConfirm: (m) => mutateBooking(id, b => eng().applyTransition(b, 'CONFIRMED', 'l2', m), `Seña acreditada (${m})`) });
  }

  function openManualBookingModal() {
    const modal = document.getElementById('manual-booking-modal'); if (!modal) return;
    modal.classList.remove('hidden'); modal.classList.add('flex');
    const today = global.AdminShell ? global.AdminShell.localTodayStr() : new Date().toISOString().split('T')[0];
    global.AdminShell?.bindDateTimeGuards({ dateId: 'manual-book-date', timeId: 'manual-book-time', initialDate: today });
    const mSel = document.getElementById('manual-book-method'), pChk = document.getElementById('manual-book-paid');
    if (mSel) mSel.innerHTML = eng().getEnabledMethods('l2').map(m => `<option value="${m.label}">${m.label}</option>`).join('');
    if (pChk && mSel) mSel.classList.toggle('hidden', !pChk.checked);
  }

  function closeManualBookingModal() { const modal = document.getElementById('manual-booking-modal'); if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } }

  function saveManualBooking() {
    const name = document.getElementById('manual-book-name')?.value.trim(), rawPhone = document.getElementById('manual-book-phone')?.value;
    const phone = global.adminL2Core?.sanitizeCleanPhone(rawPhone) || rawPhone, pax = document.getElementById('manual-book-pax')?.value || '1';
    const today = global.AdminShell ? global.AdminShell.localTodayStr() : new Date().toISOString().split('T')[0];
    const date = document.getElementById('manual-book-date')?.value || today, time = document.getElementById('manual-book-time')?.value || '';
    const price = parseInt(document.getElementById('manual-book-price')?.value, 10) || 12000;
    if (!name || !phone) return global.adminL2Core?.showToast('Completa nombre y teléfono', 'error');
    if (date < today || !time || (date === today && global.AdminShell && time <= global.AdminShell.currentHHMM())) return global.adminL2Core?.showToast('Selecciona fecha y horario futuros', 'error');
    const depAmt = eng().calcDeposit(price, 'l2'), paid = depAmt === 0 ? true : (document.getElementById('manual-book-paid')?.checked ?? true);
    const method = paid ? (depAmt === 0 ? null : document.getElementById('manual-book-method')?.value || 'Efectivo') : null;
    const id = 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase(), list = getBookings();
    list.unshift({ id, client: name, phone, pax, date, time, price, depositAmount: depAmt, depositPaid: paid, paymentMethod: method, paidAt: paid ? new Date().toISOString() : null, status: paid ? 'CONFIRMED' : 'PENDING_DEPOSIT', prevStatus: null, createdAt: new Date().toISOString() });
    saveBookings(list); closeManualBookingModal();
    if (document.getElementById('manual-book-name')) document.getElementById('manual-book-name').value = '';
    if (document.getElementById('manual-book-phone')) document.getElementById('manual-book-phone').value = '';
    renderCalendar(); global.adminL2Core?.showToast(`Turno agendado con éxito: #${id}`);
  }

  function init() {
    const today = new Date().toISOString().split('T')[0];
    const fromEl = document.getElementById('cal-filter-from'), toEl = document.getElementById('cal-filter-to');
    if (fromEl && !fromEl.value) fromEl.value = today; if (toEl && !toEl.value) toEl.value = today;
    document.getElementById('cal-btn-range-toggle')?.addEventListener('click', (e) => { rangeEnabled = !rangeEnabled; e.currentTarget.classList.toggle('is-active', rangeEnabled); document.getElementById('cal-range-panel')?.classList.toggle('hidden', !rangeEnabled); renderCalendar(); });
    document.querySelectorAll('[data-l2filter]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-l2filter]').forEach(x => { x.className = 'admin-glass-pill px-2.5 py-1 rounded-full font-semibold'; });
      b.className = 'admin-glass-pill is-active px-2.5 py-1 rounded-full font-bold';
      statusFilter = b.dataset.l2filter || 'ALL'; renderCalendar();
    }));
    document.getElementById('manual-book-paid')?.addEventListener('change', (e) => document.getElementById('manual-book-method')?.classList.toggle('hidden', !e.target.checked));
    ['cal-filter-date', 'cal-filter-from', 'cal-filter-to'].forEach(id => document.getElementById(id)?.addEventListener('change', renderCalendar));
    document.getElementById('cal-search-input')?.addEventListener('input', renderCalendar);
    document.getElementById('btn-open-new-booking-modal')?.addEventListener('click', openManualBookingModal);
    document.getElementById('btn-close-manual-modal')?.addEventListener('click', closeManualBookingModal);
    document.getElementById('btn-save-manual-booking')?.addEventListener('click', saveManualBooking);
    renderCalendar();
  }

  global.adminL2Calendar = { init, getBookings, saveBookings, renderCalendar, cancelBooking, setStatus, undoStatus, creditDeposit, resetDemoBookings, openManualBookingModal, closeManualBookingModal, saveManualBooking };
})(typeof window !== 'undefined' ? window : global);
