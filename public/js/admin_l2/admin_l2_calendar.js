// Archivo: public/js/admin_l2/admin_l2_calendar.js
// Calendario L2: Agenda en Tiempo Real, Métricas & Slots (Nexus OS v11.1 - < 170 líneas)

(function (global) {
  function getBookings() {
    try {
      const raw = localStorage.getItem('tucu_l2_bookings');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    const todayIso = new Date().toISOString().split('T')[0];
    const seed = [
      { id: 'TK-8492', client: 'Leandro Arturi', phone: '5493815559988', date: todayIso, time: '10:00', pax: '2', status: 'CONFIRMED', createdAt: new Date().toISOString() },
      { id: 'TK-8493', client: 'Sofía Navarro', phone: '5493814442211', date: todayIso, time: '11:30', pax: '1', status: 'CONFIRMED', createdAt: new Date().toISOString() },
      { id: 'TK-8494', client: 'Martín Peralta', phone: '5493816663344', date: todayIso, time: '16:00', pax: '3', status: 'CONFIRMED', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('tucu_l2_bookings', JSON.stringify(seed));
    return seed;
  }

  function saveBookings(bookings) {
    try { localStorage.setItem('tucu_l2_bookings', JSON.stringify(bookings)); } catch (_) {}
  }

  function renderCalendar() {
    const container = document.getElementById('calendar-bookings-container');
    if (!container) return;

    const bookings = getBookings();
    const filterDate = document.getElementById('cal-filter-date')?.value;
    const filtered = filterDate ? bookings.filter(b => b.date === filterDate) : bookings;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="p-8 text-center text-xs text-slate-500 dark:text-slate-400">No hay turnos registrados para esta fecha.</div>';
    } else {
      const bizName = document.getElementById('cfg-biz-name')?.value || 'TucuRed Central';
      container.innerHTML = filtered.map(b => {
        const isConfirmed = b.status === 'CONFIRMED';
        const cleanPhone = (b.phone || '').replace(/\D/g, '');
        const waMsg = encodeURIComponent(`Hola ${b.client || b.name}, te contactamos desde ${bizName} respecto a tu turno #${b.id}.`);
        return `
          <div class="p-4 flex items-center justify-between flex-wrap gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors ${!isConfirmed ? 'opacity-50' : ''}">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-12 h-12 rounded-xl ${isConfirmed ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800'} flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">${b.time || '--:--'}</div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">${b.client || b.name}</span>
                  <span class="font-mono text-[10px] px-2 py-0.5 rounded-full ${isConfirmed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'} font-bold">#${b.id}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>📅 ${b.date || 'Hoy'}</span><span>•</span><span>📞 ${b.phone}</span><span>•</span><span>👥 ${b.pax || '1'} pax</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1 shadow-xs">
                <span>💬</span> WhatsApp
              </a>
              <a href="/gestion_turno.html?token=${b.id}" target="_blank" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 shadow-xs" title="Portal de autogestión">
                <span>🔗</span> Portal
              </a>
              ${isConfirmed ? `
                <button type="button" onclick="adminL2Calendar.cancelBooking('${b.id}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer">
                  Liberar Slot
                </button>
              ` : `
                <span class="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">Cancelado</span>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    const confirmedCount = bookings.filter(b => b.status === 'CONFIRMED').length;
    const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;
    const elConf = document.getElementById('metric-confirmed-count');
    const elBlk = document.getElementById('metric-blocked-count');
    const elDone = document.getElementById('metric-done-count');
    const elOcc = document.getElementById('metric-occupancy-percent');

    if (elConf) elConf.textContent = confirmedCount;
    if (elBlk) elBlk.textContent = cancelledCount;
    if (elDone) elDone.textContent = bookings.length;
    if (elOcc) elOcc.textContent = `${Math.min(100, Math.round((confirmedCount / Math.max(1, confirmedCount + 3)) * 100))}%`;
  }

  function cancelBooking(id) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'CANCELLED';
      booking.cancelledAt = new Date().toISOString();
      saveBookings(bookings);
      renderCalendar();
      global.adminL2Core?.showToast('Slot liberado y turno cancelado');
    }
  }

  function openManualBookingModal() {
    const modal = document.getElementById('manual-booking-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    const dateInp = document.getElementById('manual-book-date');
    if (dateInp && !dateInp.value) dateInp.value = new Date().toISOString().split('T')[0];
  }

  function closeManualBookingModal() {
    const modal = document.getElementById('manual-booking-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  function saveManualBooking() {
    const name = document.getElementById('manual-book-name')?.value.trim();
    const rawPhone = document.getElementById('manual-book-phone')?.value;
    const phone = global.adminL2Core?.sanitizeCleanPhone(rawPhone) || rawPhone;
    const pax = document.getElementById('manual-book-pax')?.value || '1';
    const date = document.getElementById('manual-book-date')?.value || new Date().toISOString().split('T')[0];
    const time = document.getElementById('manual-book-time')?.value || '10:00';

    if (!name || !phone) {
      global.adminL2Core?.showToast('Completa nombre y teléfono', 'error');
      return;
    }

    const id = 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newBooking = { id, client: name, phone, pax, date, time, status: 'CONFIRMED', createdAt: new Date().toISOString() };

    const bookings = getBookings();
    bookings.push(newBooking);
    saveBookings(bookings);

    closeManualBookingModal();
    const inpName = document.getElementById('manual-book-name');
    const inpPhone = document.getElementById('manual-book-phone');
    if (inpName) inpName.value = '';
    if (inpPhone) inpPhone.value = '';

    renderCalendar();
    global.adminL2Core?.showToast(`Turno agendado con éxito: #${id}`);
  }

  function init() {
    renderCalendar();
    document.getElementById('cal-filter-date')?.addEventListener('change', renderCalendar);
    document.getElementById('btn-open-new-booking-modal')?.addEventListener('click', openManualBookingModal);
    document.getElementById('btn-close-manual-modal')?.addEventListener('click', closeManualBookingModal);
    document.getElementById('btn-save-manual-booking')?.addEventListener('click', saveManualBooking);
  }

  global.adminL2Calendar = { init, getBookings, saveBookings, renderCalendar, cancelBooking, openManualBookingModal, closeManualBookingModal, saveManualBooking };
})(typeof window !== 'undefined' ? window : global);

