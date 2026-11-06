// Archivo: public/js/admin_l1/admin_l1_agenda.js
// Agenda L1: Filtros Avanzados, Modal +Nueva Cita & Semilla Demo (Nexus OS v11.1 - < 175 líneas)

(function (global) {
  let bookings = [];
  let filterTime = 'hoy', filterStatus = 'todos', searchQuery = '';
  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR');

  const DEMO_SEED = [
    { id: 'b_1', token: '#TK-8421', clientName: 'Martín Gómez', clientPhone: '3815112233', service: 'Corte Degradé / Fade', deposit: '$5.000', price: '$10.000', day: 'Hoy', time: '15:00', status: 'confirmado', dateStr: new Date().toISOString().split('T')[0] },
    { id: 'b_2', token: '#TK-3319', clientName: 'Lucas Peralta', clientPhone: '3814998877', service: 'Corte Clásico / Tradicional', deposit: '$4.000', price: '$8.000', day: 'Hoy', time: '16:30', status: 'pendiente', dateStr: new Date().toISOString().split('T')[0] },
    { id: 'b_3', token: '#TK-9012', clientName: 'Facundo Ruiz', clientPhone: '3816223344', service: 'Corte + Perfilado de Barba', deposit: '$7.000', price: '$14.000', day: 'Hoy', time: '17:30', status: 'en_atencion', dateStr: new Date().toISOString().split('T')[0] },
    { id: 'b_4', token: '#TK-5520', clientName: 'Javier Soto', clientPhone: '3813445566', service: 'Cuidado de Barba', deposit: '$3.000', price: '$6.000', day: 'Hoy', time: '19:00', status: 'cancelado', dateStr: new Date().toISOString().split('T')[0] }
  ];

  function getLocalBookings(slug) {
    try {
      const stored = localStorage.getItem(`tucu_bookings_${slug}`);
      if (stored) { const parsed = JSON.parse(stored); if (Array.isArray(parsed) && parsed.length > 0) return parsed; }
    } catch (_) {}
    return DEMO_SEED;
  }

  function saveLocalBookings(slug, list) {
    bookings = list;
    try { localStorage.setItem(`tucu_bookings_${slug}`, JSON.stringify(list)); } catch (_) {}
    renderAgenda();
  }

  async function loadBookings(slug) {
    try {
      const res = await fetch(`/api/portal/${slug}/bookings`);
      if (res.ok) {
        const d = await res.json();
        if (Array.isArray(d.bookings) && d.bookings.length > 0) { bookings = d.bookings; renderAgenda(); return; }
      }
    } catch (_) {}
    bookings = getLocalBookings(slug);
    renderAgenda();
  }

  function getFilteredBookings() {
    return bookings.filter(b => {
      if (filterStatus !== 'todos') {
        if (filterStatus === 'confirmado' && b.status !== 'confirmado') return false;
        if (filterStatus === 'pendiente' && b.status !== 'pendiente') return false;
        if (filterStatus === 'en_atencion' && b.status !== 'en_atencion') return false;
        if (filterStatus === 'cancelado' && b.status !== 'cancelado') return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (b.clientName || '').toLowerCase().includes(q);
        const matchPhone = (b.clientPhone || '').includes(q);
        const matchService = (b.service || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchService) return false;
      }
      return true;
    });
  }

  function renderAgenda() {
    const box = document.getElementById('bookingsListContainer');
    if (!box) return;
    const active = bookings.filter(b => b.status !== 'completado' && b.status !== 'cancelado');
    const sumDeposits = bookings.reduce((acc, b) => (b.status === 'confirmado' || b.status === 'en_atencion' || b.status === 'completado') ? acc + (parseInt(String(b.deposit || '0').replace(/\D/g, ''), 10) || 0) : acc, 3000);
    const kpiDate = document.getElementById('kpi-date-badge'), kpiTurnos = document.getElementById('kpi-turnos-count'), kpiTotal = document.getElementById('kpi-deposit-total');
    if (kpiDate) kpiDate.textContent = filterTime === 'hoy' ? 'Hoy' : (filterTime === 'semana' ? 'Esta Semana' : 'Este Mes');
    if (kpiTurnos) kpiTurnos.textContent = `${active.length} citas activas`;
    if (kpiTotal) kpiTotal.textContent = fmt(Math.max(sumDeposits, 15000));

    const list = getFilteredBookings();
    if (list.length === 0) {
      box.innerHTML = '<div class="p-8 text-center text-[#7A766E] dark:text-[#9E9A93] text-xs rounded-2xl bg-white dark:bg-[#1C1A19] border border-[#E8E6DF] dark:border-[#2D2A28]">No se encontraron turnos con el filtro seleccionado.</div>';
      return;
    }
    box.innerHTML = list.map(bk => {
      const st = bk.status || 'pendiente', isDone = st === 'completado', isCancel = st === 'cancelado';
      const stBadge = isDone ? 'bg-[#EFECE6] dark:bg-[#262422] text-[#7A766E]' : (st === 'confirmado' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : (st === 'en_atencion' ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20' : (isCancel ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20')));
      const stLabel = isDone ? 'Finalizado' : (st === 'confirmado' ? 'Confirmado' : (st === 'en_atencion' ? 'En Atención' : (isCancel ? 'Cancelado' : 'Pendiente Seña')));
      const actBtn = isDone || isCancel ? '' : (st === 'pendiente'
        ? `<button onclick="adminL1Agenda.updateStatus('${bk.id}','en_atencion')" class="rounded-full px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-xs">Acreditar Seña</button>`
        : `<button onclick="adminL1Agenda.updateStatus('${bk.id}','completado')" class="rounded-full px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs">Marcar Atendido</button>`);
      return `<article class="p-4 sm:p-5 rounded-2xl border border-[#E8E6DF] dark:border-[#2D2A28] bg-white dark:bg-[#1C1A19] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDone || isCancel ? 'opacity-40 grayscale' : ''}">
        <div class="flex items-center gap-3.5">
          <div class="w-14 h-14 rounded-2xl bg-[#FBFBF9] dark:bg-[#121110] border border-[#E8E6DF] dark:border-[#2D2A28] flex flex-col items-center justify-center shrink-0">
            <span class="text-sm font-bold text-[#1C1A17] dark:text-[#F5F3EF] font-mono">${bk.time}</span><span class="text-[9px] text-[#7A766E] dark:text-[#9E9A93] uppercase">${bk.day}</span>
          </div>
          <div>
            <div class="flex items-center gap-2"><h4 class="text-sm font-bold text-[#1C1A17] dark:text-[#F5F3EF]">${bk.clientName}</h4><span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFECE6] dark:bg-[#262422] text-[#7A766E]">${bk.token}</span></div>
            <p class="text-xs text-[#7A766E] dark:text-[#9E9A93] mt-0.5">${bk.service} · <span class="font-mono">${bk.clientPhone}</span></p>
          </div>
        </div>
        <div class="flex items-center gap-3 self-end sm:self-center">
          <div class="text-right"><span class="text-xs font-bold block text-indigo-600 dark:text-indigo-400">Seña: ${bk.deposit}</span><span class="text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${stBadge}">${stLabel}</span></div>
          ${actBtn}
        </div>
      </article>`;
    }).join('');
  }

  function updateStatus(id, next) {
    const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria';
    const bk = bookings.find(b => b.id === id);
    if (bk) { bk.status = next; saveLocalBookings(slug, [...bookings]); }
    fetch(`/api/portal/${slug}/bookings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) }).catch(() => {});
  }

  function openNewBookingModal() {
    const srvs = global.adminL1Pricing ? global.adminL1Pricing.getServices() : [];
    const root = document.getElementById('dynamicModalRoot');
    if (!root) return;
    root.innerHTML = `
      <div id="newBookingModal" class="fixed inset-0 z-50 bg-[#121110]/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-2xl border border-[#E8E6DF] dark:border-[#2D2A28] bg-white dark:bg-[#1C1A19] p-5 space-y-4 shadow-2xl">
          <div class="flex items-center justify-between"><h3 class="text-base font-bold text-[#1C1A17] dark:text-[#F5F3EF]">+ Nueva Cita Manual</h3><button onclick="adminL1Agenda.closeModal()" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">&times;</button></div>
          <form id="formNewBooking" onsubmit="adminL1Agenda.saveManualBooking(event)" class="space-y-3 text-xs">
            <div><label class="block text-[10px] uppercase text-[#7A766E] mb-1">Servicio</label><select id="nb-srv" class="w-full p-2.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121110] border border-[#E8E6DF] dark:border-[#2D2A28] outline-none text-[#1C1A17] dark:text-[#F5F3EF]">${srvs.map(s => `<option value="${s.name}" data-dep="${s.depositAmount}">${s.name} (${fmt(s.priceNumeric)})</option>`).join('')}</select></div>
            <div class="grid grid-cols-2 gap-2">
              <div><label class="block text-[10px] uppercase text-[#7A766E] mb-1">Fecha</label><input type="date" id="nb-date" required value="${new Date().toISOString().split('T')[0]}" class="w-full p-2.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121110] border border-[#E8E6DF] dark:border-[#2D2A28] outline-none text-[#1C1A17] dark:text-[#F5F3EF]"></div>
              <div><label class="block text-[10px] uppercase text-[#7A766E] mb-1">Horario</label><select id="nb-time" class="w-full p-2.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121110] border border-[#E8E6DF] dark:border-[#2D2A28] outline-none text-[#1C1A17] dark:text-[#F5F3EF]"><option>10:00</option><option>11:30</option><option>15:00</option><option>16:30</option><option>18:00</option><option>19:30</option></select></div>
            </div>
            <div><label class="block text-[10px] uppercase text-[#7A766E] mb-1">Nombre del Cliente</label><input type="text" id="nb-name" required placeholder="Ej: Santiago Moreno" class="w-full p-2.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121110] border border-[#E8E6DF] dark:border-[#2D2A28] outline-none text-[#1C1A17] dark:text-[#F5F3EF]"></div>
            <div><label class="block text-[10px] uppercase text-[#7A766E] mb-1">Teléfono / WhatsApp</label><input type="tel" id="nb-phone" required placeholder="Ej: 3815551234" class="w-full p-2.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121110] border border-[#E8E6DF] dark:border-[#2D2A28] outline-none text-[#1C1A17] dark:text-[#F5F3EF]"></div>
            <div class="flex gap-2 pt-2"><button type="button" onclick="adminL1Agenda.closeModal()" class="w-1/2 py-2.5 rounded-full border border-[#E8E6DF] dark:border-[#2D2A28] font-bold text-[#7A766E] cursor-pointer">Cancelar</button><button type="submit" class="w-1/2 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer">Guardar Turno</button></div>
          </form>
        </div>
      </div>`;
  }

  function closeModal() {
    const root = document.getElementById('dynamicModalRoot');
    if (root) root.innerHTML = '';
  }

  function saveManualBooking(e) {
    e.preventDefault();
    const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria';
    const srv = document.getElementById('nb-srv')?.value || 'Corte Clásico';
    const name = document.getElementById('nb-name')?.value.trim() || 'Cliente Mostrador';
    const phone = document.getElementById('nb-phone')?.value.replace(/\D/g, '') || '3810000000';
    const time = document.getElementById('nb-time')?.value || '16:00';
    const date = document.getElementById('nb-date')?.value || new Date().toISOString().split('T')[0];
    const newBk = {
      id: 'mbk_' + Date.now(), token: '#TK-MANUAL', clientName: name, clientPhone: phone,
      service: srv, deposit: '$4.000', price: '$8.000', day: 'Hoy', time: time, status: 'confirmado', dateStr: date
    };
    saveLocalBookings(slug, [newBk, ...bookings]);
    closeModal();
  }

  function init() {
    const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria';
    loadBookings(slug);
    document.querySelectorAll('[data-tfilter]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-tfilter]').forEach(x => { x.className = 'px-3 py-1.5 rounded-lg text-[#7A766E] dark:text-[#9E9A93] hover:bg-[#EFECE6] dark:hover:bg-[#262422]'; });
      b.className = 'px-3 py-1.5 rounded-lg font-bold bg-indigo-600 text-white shadow-xs';
      filterTime = b.getAttribute('data-tfilter'); renderAgenda();
    }));
    document.querySelectorAll('[data-sfilter]').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('[data-sfilter]').forEach(x => { x.className = 'px-2.5 py-1 rounded-full text-[#7A766E] dark:text-[#9E9A93]'; });
      b.className = 'px-2.5 py-1 rounded-full font-bold bg-[#EFECE6] dark:bg-[#262422] text-[#1C1A17] dark:text-white';
      filterStatus = b.getAttribute('data-sfilter'); renderAgenda();
    }));
    document.getElementById('inputSearchBooking')?.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim(); renderAgenda();
    });
  }

  global.adminL1Agenda = { init, loadBookings, renderAgenda, updateStatus, openNewBookingModal, closeModal, saveManualBooking };
})(typeof window !== 'undefined' ? window : global);

