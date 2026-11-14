// Archivo: public/js/admin_l1/admin_l1_agenda.js
// Agenda L1: Reversión Explícita, Curado Temporal, Filtro de Servicios Activos (< 180 líneas)

(function (global) {
  let bookings = [], filterTime = 'hoy', filterStatus = 'todos', searchQuery = '';
  const SLOTS = ['08:00', '09:00', '10:00', '11:30', '13:00', '15:00', '16:30', '18:00', '19:30', '21:00'];
  const eng = () => global.AdminBookingEngine;
  const fmt = (n) => (eng() ? eng().fmt(n) : '$' + Number(n || 0).toLocaleString('es-AR'));
  const norm = (s) => (global.AdminShell ? global.AdminShell.normStr(s) : String(s || '').toLowerCase());
  const isoDay = (offset = 0) => (global.AdminShell ? global.AdminShell.localTodayStr(offset) : new Date(Date.now() + offset * 86400000).toISOString().split('T')[0]);
  const currentSlug = () => localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria';

  function toast(msg) {
    const t = document.getElementById('saveToast');
    if (t) { const sp = t.querySelector('span'); if (sp) sp.textContent = msg; t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 2200); }
  }

  function saveLocalBookings(slug, list) {
    bookings = list;
    try { localStorage.setItem(`tucu_l1_bookings_${slug}`, JSON.stringify(list)); } catch (_) {}
    renderAgenda();
  }

  function resetDemoBookings(slug = currentSlug()) {
    const seed = global.AdminDemoSeed ? global.AdminDemoSeed.resetLevel('l1', slug) : [];
    saveLocalBookings(slug, seed);
    toast('Base de práctica L1 restaurada');
  }

  async function loadBookings(slug) {
    let raw = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(`tucu_l1_bookings_${slug}`) || '[]');
      if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(b => b.service?.includes('Lash'))) raw = parsed;
    } catch (_) {}
    if (raw.length === 0) raw = global.AdminDemoSeed ? global.AdminDemoSeed.getL1Seed(eng()?.getConfig('l1')) : [];
    bookings = eng() ? raw.map(b => eng().hydrateBooking(b, 'l1', 8000)) : raw;
    saveLocalBookings(slug, bookings);
    if (slug && !slug.startsWith('demo') && window.location.port !== '5174') {
      try {
        const res = await fetch(`/api/portal/${slug}/bookings`);
        if (res.ok) { const d = await res.json(); if (Array.isArray(d.bookings) && d.bookings.length > 0) saveLocalBookings(slug, d.bookings.map(b => (eng() ? eng().hydrateBooking(b, 'l1', 8000) : b))); }
      } catch (_) {}
    }
  }

  function matchTimeWindow(b) {
    const today = isoDay(0), bDate = b.dateStr || today;
    if (filterTime === 'hoy') return bDate === today;
    if (filterTime === 'semana') return bDate >= isoDay(-3) && bDate <= isoDay(7);
    if (filterTime === 'mes') return bDate.slice(0, 7) === today.slice(0, 7);
    if (filterTime === 'rango') {
      const from = document.getElementById('filter-date-from')?.value || '', to = document.getElementById('filter-date-to')?.value || '';
      return (!from || bDate >= from) && (!to || bDate <= to);
    }
    return true;
  }

  function getFilteredBookings() {
    const q = norm(searchQuery), stFilter = filterStatus === 'todos' ? 'ALL' : eng()?.normalizeKey(filterStatus);
    return bookings.filter(b => !b.deletedAt).filter(b => {
      if (!matchTimeWindow(b)) return false;
      if (stFilter !== 'ALL' && eng()?.normalizeKey(b.status) !== stFilter) return false;
      return !q || norm(b.clientName).includes(q) || norm(b.clientPhone).includes(q) || norm(b.service).includes(q) || norm(b.token).includes(q);
    });
  }

  function updateKpis(periodList) {
    const k = eng() ? eng().computeKpis(periodList) : { activeCount: 0, creditedDeposits: 0, potentialDeposits: 0, doneCount: 0, noShowCount: 0 };
    const total = periodList.length, evalTotal = Math.max(1, k.doneCount + k.noShowCount + k.confirmedCount);
    const rate = total > 0 ? Math.round(((k.doneCount + k.confirmedCount) / evalTotal) * 100) : 0;
    const labels = { hoy: 'Hoy', semana: 'Semana', mes: 'Este Mes', rango: 'Rango' };
    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const setW = (id, w) => { const el = document.getElementById(id); if (el) el.style.width = `${w}%`; };
    setT('kpi-date-badge', labels[filterTime] || 'Hoy');
    setT('kpi-turnos-count', `${k.activeCount} ${k.activeCount === 1 ? 'activo' : 'activos'}`);
    setT('kpi-deposit-total', fmt(k.creditedDeposits));
    setT('kpi-attendance-rate', `${rate}%`);
    setW('kpi-turnos-bar', total > 0 ? Math.min(100, Math.round((k.activeCount / total) * 100)) : 0);
    setW('kpi-deposit-bar', k.potentialDeposits > 0 ? Math.min(100, Math.round((k.creditedDeposits / k.potentialDeposits) * 100)) : 0);
    setW('kpi-attendance-bar', rate);
  }

  function renderAgenda() {
    document.getElementById('filter-range-panel')?.classList.toggle('hidden', filterTime !== 'rango');
    updateKpis(bookings.filter(b => !b.deletedAt && matchTimeWindow(b)));
    const box = document.getElementById('bookingsListContainer'); if (!box) return;
    const list = getFilteredBookings();
    if (!list.length) { box.innerHTML = `<div class="admin-card p-8 text-center text-xs text-stone-500">No hay turnos para este filtro en la agenda.</div>`; return; }
    box.innerHTML = list.map(bk => {
      const meta = eng().getMeta(bk.status), muted = meta.key === 'COMPLETED' || meta.key === 'CANCELLED' || meta.key === 'NO_SHOW';
      return `<article class="admin-card flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${muted ? 'opacity-80' : ''}">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 flex flex-col items-center justify-center shrink-0"><span class="text-sm font-bold text-stone-800 dark:text-stone-100 font-mono">${bk.time}</span><span class="text-[9px] text-stone-400 uppercase">${bk.dateStr || bk.day}</span></div>
          <div class="min-w-0 space-y-1">
            <div class="flex items-center gap-2 flex-wrap"><h4 class="text-sm font-bold text-stone-900 dark:text-stone-100">${bk.clientName}</h4><span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">${bk.token}</span><span class="text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${meta.badge}">${meta.label}</span>${eng().renderUndoLabel(bk.status, bk.prevStatus)}</div>
            <p class="text-xs text-stone-500 dark:text-stone-400">${bk.service} (${fmt(bk.price)}) · <span class="font-mono">${bk.clientPhone}</span></p>
            ${eng().renderDepositHtml(bk)}
          </div>
        </div>
        <div class="flex items-center flex-wrap gap-2 self-end lg:self-center shrink-0">${eng().renderActionButtons(bk.id, bk.status, 'adminL1Agenda', bk.prevStatus)}</div>
      </article>`;
    }).join('');
  }

  function persistStatus(bk, msg) {
    const slug = currentSlug();
    saveLocalBookings(slug, [...bookings]);
    if (msg) toast(msg);
    if (slug && !slug.startsWith('demo') && window.location.port !== '5174') {
      fetch(`/api/portal/${slug}/bookings/${bk.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: bk.status }) }).catch(() => {});
    }
  }
  function setStatus(id, nextCanon) { const bk = bookings.find(b => b.id === id); if (bk) { eng().applyTransition(bk, nextCanon, 'l1'); persistStatus(bk, `Estado: ${eng().getMeta(bk.status).label}`); } }
  function undoStatus(id) { const bk = bookings.find(b => b.id === id); if (bk) { eng().undoTransition(bk, 'l1'); persistStatus(bk, `Revertido a ${eng().getMeta(bk.status).label}`); } }
  function creditDeposit(id) {
    const bk = bookings.find(b => b.id === id); if (!bk) return;
    eng().openPaymentPicker({ title: `Acreditar Seña · ${bk.clientName}`, amount: bk.depositAmount, level: 'l1', onConfirm: (method) => { eng().applyTransition(bk, 'CONFIRMED', 'l1', method); persistStatus(bk, `Seña acreditada (${method})`); } });
  }

  function openNewBookingModal() {
    const rawSrvs = global.adminL1Pricing ? global.adminL1Pricing.getServices(false) : [];
    const srvs = rawSrvs.filter(s => (global.AdminShell ? global.AdminShell.isServiceAvailable(s) : s.isActive !== false && !s.deletedAt));
    const root = document.getElementById('dynamicModalRoot'); if (!root) return;
    const methods = eng().getEnabledMethods('l1'), today = isoDay(0);
    root.innerHTML = `<div id="newBookingModal" class="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4"><div class="w-full max-w-md rounded-2xl border border-[#D5CEC2] dark:border-stone-800 bg-white dark:bg-[#181B22] p-5 space-y-4 shadow-2xl"><div class="flex items-center justify-between"><h3 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title">Nueva Cita Manual</h3><button onclick="adminL1Agenda.closeModal()" class="text-stone-400 hover:text-stone-600 cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div><form id="formNewBooking" onsubmit="adminL1Agenda.saveManualBooking(event)" class="space-y-3 text-xs"><div><label class="block text-[10px] uppercase text-stone-400 mb-1">Servicio</label><select id="nb-srv" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 outline-none">${srvs.map(s => `<option value="${s.name}" data-price="${s.priceNumeric}" data-req="${s.requireDeposit !== false}">${s.name} (${fmt(s.priceNumeric)} · Seña ${fmt(s.depositAmount)})</option>`).join('') || '<option value="">Sin servicios activos</option>'}</select></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-[10px] uppercase text-stone-400 mb-1">Fecha</label><input type="date" id="nb-date" required min="${today}" value="${today}" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 outline-none"></div><div><label class="block text-[10px] uppercase text-stone-400 mb-1">Horario</label><select id="nb-time" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 outline-none"></select></div></div><div><label class="block text-[10px] uppercase text-stone-400 mb-1">Nombre del Cliente</label><input type="text" id="nb-name" required placeholder="Ej: Santiago Moreno" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 outline-none"></div><div><label class="block text-[10px] uppercase text-stone-400 mb-1">Teléfono / WhatsApp</label><input type="tel" id="nb-phone" required placeholder="Ej: 3815551234" class="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 outline-none"></div><div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 space-y-2"><label class="flex items-center gap-2 font-semibold cursor-pointer"><input type="checkbox" id="nb-dep-paid" checked class="w-4 h-4 accent-[#800000]"><span>¿Seña cobrada al agendar?</span></label><select id="nb-method" class="w-full p-2 rounded-lg bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 outline-none">${methods.map(m => `<option value="${m.label}">${m.label}</option>`).join('')}</select></div><div class="flex gap-2 pt-1"><button type="button" onclick="adminL1Agenda.closeModal()" class="w-1/2 py-2.5 rounded-full admin-glass-btn font-bold">Cancelar</button><button type="submit" class="w-1/2 py-2.5 rounded-full admin-glass-primary font-bold">Guardar Turno</button></div></form></div></div>`;
    global.AdminShell?.bindDateTimeGuards({ dateId: 'nb-date', timeId: 'nb-time', slots: SLOTS });
    document.getElementById('nb-dep-paid')?.addEventListener('change', (ev) => { document.getElementById('nb-method')?.classList.toggle('hidden', !ev.target.checked); });
  }

  function closeModal() { const root = document.getElementById('dynamicModalRoot'); if (root) root.innerHTML = ''; }

  function saveManualBooking(e) {
    e.preventDefault();
    const sel = document.getElementById('nb-srv'), opt = sel?.selectedOptions?.[0], date = document.getElementById('nb-date')?.value || isoDay(0);
    const time = document.getElementById('nb-time')?.value || '', today = isoDay(0);
    if (!sel?.value) return toast('Activa al menos un servicio antes de agendar');
    if (date < today || !time || (date === today && global.AdminShell && time <= global.AdminShell.currentHHMM())) return toast('Selecciona fecha y horario futuros');
    const price = Number(opt?.dataset?.price || 8000), req = opt?.dataset?.req !== 'false';
    const depositAmount = eng().calcDeposit(price, 'l1', req), paid = depositAmount === 0 ? true : (document.getElementById('nb-dep-paid')?.checked ?? true);
    const method = paid ? (depositAmount === 0 ? null : document.getElementById('nb-method')?.value || 'Efectivo') : null;
    const name = document.getElementById('nb-name')?.value.trim() || 'Cliente Mostrador', phone = document.getElementById('nb-phone')?.value.replace(/\D/g, '') || '3810000000';
    saveLocalBookings(currentSlug(), [{ id: 'mbk_' + Date.now(), token: '#TK-' + Math.random().toString(36).substring(2, 6).toUpperCase(), clientName: name, clientPhone: phone, service: sel.value, price, depositAmount, depositPaid: paid, paymentMethod: method, paidAt: paid ? new Date().toISOString() : null, day: date === today ? 'Hoy' : date, time, status: paid ? 'confirmado' : 'pendiente', dateStr: date, prevStatus: null }, ...bookings]);
    closeModal(); toast('Turno agendado correctamente');
  }

  function init() {
    const fFrom = document.getElementById('filter-date-from'), fTo = document.getElementById('filter-date-to');
    if (fFrom && !fFrom.value) fFrom.value = isoDay(-7); if (fTo && !fTo.value) fTo.value = isoDay(7);
    fFrom?.addEventListener('change', renderAgenda); fTo?.addEventListener('change', renderAgenda);
    loadBookings(currentSlug());
    document.querySelectorAll('[data-tfilter]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-tfilter]').forEach(x => { x.className = 'admin-glass-pill px-3 py-1.5 rounded-lg font-semibold'; });
      b.className = 'admin-glass-pill is-active px-3 py-1.5 rounded-lg font-bold';
      filterTime = b.getAttribute('data-tfilter'); renderAgenda();
    }));
    document.querySelectorAll('[data-sfilter]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-sfilter]').forEach(x => { x.className = 'admin-glass-pill px-2.5 py-1 rounded-full font-semibold'; });
      b.className = 'admin-glass-pill is-active px-2.5 py-1 rounded-full font-bold';
      filterStatus = b.getAttribute('data-sfilter'); renderAgenda();
    }));
    document.getElementById('inputSearchBooking')?.addEventListener('input', (e) => { searchQuery = e.target.value.trim(); renderAgenda(); });
  }

  global.adminL1Agenda = { init, loadBookings, renderAgenda, setStatus, undoStatus, creditDeposit, resetDemoBookings, openNewBookingModal, closeModal, saveManualBooking };
})(typeof window !== 'undefined' ? window : global);
