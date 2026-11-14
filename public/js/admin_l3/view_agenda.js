// Archivo: public/js/admin_l3/view_agenda.js
// Vista de Agenda Multi-Staff & Recursos L3 con 5 Estados, Señas y Deshacer (< 175 líneas)

window.AdminL3Agenda = (function () {
  let viewTarget = 'staff', viewMode = 'grid', filterStatus = 'ALL', searchTerm = '';
  const eng = () => window.AdminBookingEngine;
  const FILTERS = [['ALL', 'Todos'], ['PENDING_DEPOSIT', 'Pendiente Seña'], ['CONFIRMED', 'Confirmado'], ['COMPLETED', 'Finalizado'], ['CANCELLED', 'Cancelado'], ['NO_SHOW', 'Ausente']];

  function inDateScope(b, state) {
    if (state.dateRangeEnabled) return (!state.dateFrom || b.date >= state.dateFrom) && (!state.dateTo || b.date <= state.dateTo);
    return b.date === state.selectedDate;
  }

  function persist(list, msg) {
    window.AdminL3Core.setStorage('tucu_l3_bookings', list);
    window.AdminL3Core.state.bookings = list;
    if (msg) { window.AdminL3Core.playDingSound(); window.AdminL3Core.showToast(msg); }
    window.AdminL3Core.renderActiveView();
  }

  function setStatus(id, nextCanon) {
    const list = window.AdminL3Core.state.bookings || [], bk = list.find(x => x.id === id);
    if (!bk) return;
    eng().applyTransition(bk, nextCanon, 'l3');
    persist(list, `Estado actualizado: ${eng().getMeta(bk.status).label}`);
  }

  function undoStatus(id) {
    const list = window.AdminL3Core.state.bookings || [], bk = list.find(x => x.id === id);
    if (!bk) return;
    eng().undoTransition(bk, 'l3');
    persist(list, `Revertido a ${eng().getMeta(bk.status).label}`);
  }

  function creditDeposit(id) {
    const list = window.AdminL3Core.state.bookings || [], bk = list.find(x => x.id === id);
    if (!bk) return;
    const amt = bk.depositAmount || eng().calcDeposit(bk.price, 'l3');
    eng().openPaymentPicker({
      title: `Acreditar Seña #${id}`, amount: amt, level: 'l3',
      onConfirm: (method) => { bk.depositAmount = amt; eng().applyTransition(bk, 'CONFIRMED', 'l3', method); persist(list, `Seña acreditada vía ${method}`); }
    });
  }

  function render(container, state) {
    const svg = window.AdminL3Core.svg, norm = window.AdminL3Core.normStr;
    const activeStaff = (state.staff || []).filter(s => !s.deletedAt && s.active !== false), activeResources = (state.resources || []).filter(r => !r.deletedAt && r.active !== false);
    const dayBks = (state.bookings || []).filter(b => !b.deletedAt && inDateScope(b, state) && (b.rubroId === state.rubro || !b.rubroId));
    const kpis = eng().computeKpis(dayBks), q = norm(searchTerm);
    const filtered = dayBks.filter(b => (filterStatus === 'ALL' || eng().normalizeKey(b.status) === filterStatus) && (!q || norm(b.client).includes(q) || norm(b.id).includes(q) || norm(b.phone).includes(q) || norm(b.serviceName).includes(q) || norm(b.staffName).includes(q)));
    const telem = state.telemetry || { daemonStatus: 'ACTIVE', lastSweep: 'Hace 4m', inspected: 18, confirmed: 16, released: 2 };
    const confPct = dayBks.length ? Math.round((kpis.confirmedCount / dayBks.length) * 100) : 0;
    const depPct = kpis.potentialDeposits > 0 ? Math.round((kpis.creditedDeposits / kpis.potentialDeposits) * 100) : 0;
    const pills = FILTERS.map(([k, lbl]) => `<button onclick="AdminL3Agenda.setFilterStatus('${k}')" class="admin-glass-pill ${filterStatus === k ? 'is-active' : ''} px-2.5 py-1 rounded-xl text-[11px] font-semibold">${lbl}</button>`).join('');

    const headerHtml = `
      <div class="space-y-4 pb-3 border-b border-[#D5CEC2] dark:border-stone-800">
        <div class="admin-card flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5"><span class="w-2.5 h-2.5 rounded-full bg-red-800 animate-ping"></span><div><p class="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">${svg('bolt')}<span>Daemon Cron T-2hs: <span class="text-red-900 dark:text-red-400 font-mono">${telem.daemonStatus}</span></span><span class="text-[11px] font-normal text-stone-500">· Última pasada: <strong>${telem.lastSweep}</strong></span></p><p class="text-[11px] text-stone-500 dark:text-stone-400">Inspeccionados: <strong>${telem.inspected}</strong> | Confirmados: <strong class="text-emerald-700 dark:text-emerald-400">${telem.confirmed}</strong> | Liberados (Cron): <strong class="text-amber-700 dark:text-amber-400">${telem.released}</strong></p></div></div>
          <button onclick="AdminL3Core.executeCronSweep()" class="py-1.5 px-3.5 rounded-xl admin-glass-primary font-bold text-xs flex items-center gap-1.5">${svg('bolt')}<span>Ejecutar Barrido Ahora</span></button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-stone-500">Turnos en Vista</p><p class="font-title text-xl font-extrabold text-stone-900 dark:text-stone-100">${dayBks.length}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-[#800000]" style="width:${dayBks.length ? 100 : 0}%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Confirmados</p><p class="font-title text-xl font-extrabold text-emerald-700 dark:text-emerald-300">${kpis.confirmedCount}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-emerald-600" style="width:${confPct}%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-red-900 dark:text-red-400">Señas Acreditadas</p><p id="l3-kpi-deposit-total" class="font-title text-xl font-extrabold text-red-900 dark:text-red-300">$${kpis.creditedDeposits.toLocaleString('es-AR')}</p><p class="text-[10px] text-stone-500 mt-0.5">De $${kpis.potentialDeposits.toLocaleString('es-AR')} esperados</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-[#800000]" style="width:${depPct}%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-stone-500">Finalizados / Ausentes</p><p class="font-title text-xl font-extrabold text-stone-800 dark:text-stone-200">${kpis.doneCount} / ${kpis.noShowCount}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-amber-600" style="width:${dayBks.length ? Math.round((kpis.doneCount / dayBks.length) * 100) : 0}%"></div></div></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="AdminL3Agenda.setViewTarget('staff')" class="admin-glass-pill ${viewTarget === 'staff' ? 'is-active' : ''} px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">${svg('users')}<span>Por Especialista</span></button>
            <button onclick="AdminL3Agenda.setViewTarget('resource')" class="admin-glass-pill ${viewTarget === 'resource' ? 'is-active' : ''} px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">${svg('space')}<span>Por Recurso Físico</span></button>
            <button onclick="AdminL3Agenda.setViewMode('grid')" class="admin-glass-pill ${viewMode === 'grid' ? 'is-active' : ''} p-1.5 rounded-xl" title="Vista Grilla">${svg('grid')}</button>
            <button onclick="AdminL3Agenda.setViewMode('table')" class="admin-glass-pill ${viewMode === 'table' ? 'is-active' : ''} p-1.5 rounded-xl" title="Vista Tabla">${svg('list')}</button>
            <button onclick="AdminL3Agenda.toggleRangeMode()" class="admin-glass-pill ${state.dateRangeEnabled ? 'is-active' : ''} px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1">${svg('cal')}<span>Rango</span></button>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            ${state.dateRangeEnabled ? `<input type="date" value="${state.dateFrom}" onchange="AdminL3Agenda.setDateRange('dateFrom', this.value)" class="bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 px-2 py-1 rounded-xl text-xs"><input type="date" value="${state.dateTo}" onchange="AdminL3Agenda.setDateRange('dateTo', this.value)" class="bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 px-2 py-1 rounded-xl text-xs">` : ''}
            <input type="text" placeholder="Buscar cliente o #TK..." value="${searchTerm}" oninput="AdminL3Agenda.setSearch(this.value)" class="bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 px-3 py-1.5 rounded-xl text-xs text-stone-800 dark:text-stone-100 outline-none w-44 sm:w-56">
            <button onclick="AdminL3Agenda.openSobreturnoModal()" class="py-1.5 px-3.5 rounded-xl admin-glass-primary font-bold text-xs flex items-center gap-1">${svg('plus')}<span>Sobreturno</span></button>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">${pills}</div>
      </div>`;

    const columns = viewTarget === 'staff' ? activeStaff : activeResources;
    let bodyHtml = '';
    if (viewMode === 'grid') {
      bodyHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">${columns.map(item => {
        const itemBks = filtered.filter(b => (viewTarget === 'staff' ? b.staffId === item.id : b.resourceId === item.id)).sort((a, b) => a.time.localeCompare(b.time));
        const cards = itemBks.length === 0 ? `<div class="p-4 text-center text-stone-400 text-xs italic bg-stone-50 dark:bg-stone-950/40 rounded-2xl border border-dashed border-[#D5CEC2] dark:border-stone-800 my-2">Sin reservas</div>` : itemBks.map(b => {
          const meta = eng().getMeta(b.status);
          return `<div class="admin-card !p-3 space-y-2">
            <div class="flex items-center justify-between gap-1"><span class="font-mono font-bold text-xs text-red-900 dark:text-red-300 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-lg border border-red-200 dark:border-red-900 inline-flex items-center gap-1">${svg('clock')} ${b.time} hs</span><div class="flex items-center gap-1.5 flex-wrap justify-end">${eng().renderUndoLabel(b.status, b.prevStatus)}<span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badge}">${meta.label}</span></div></div>
            <div><p class="font-bold text-xs text-stone-900 dark:text-stone-100">${b.client || 'Cliente'}</p><p class="text-[11px] text-stone-500 dark:text-stone-400">${b.serviceName} (${b.duration || 30}m)</p><p class="text-[10px] font-semibold text-stone-600 dark:text-stone-300 mt-0.5 flex items-center gap-1">${viewTarget === 'staff' ? `${svg('space')} ${b.resourceName || 'Recurso'}` : `${svg('users')} ${b.staffName || 'Staff'}`}</p></div>
            ${eng().renderDepositHtml(b)}
            <div class="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-stone-100 dark:border-stone-800 text-[11px]"><div class="flex flex-wrap gap-1">${eng().renderActionButtons(b.id, b.status, 'AdminL3Agenda', b.prevStatus)}</div><button onclick="AdminL3Agenda.openWhatsAppModal('${b.id}')" class="px-2 py-1 rounded-lg admin-glass-btn text-emerald-700 dark:text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">${svg('msg')}<span>WA</span></button></div>
          </div>`;
        }).join('');
        return `<div class="flex flex-col bg-stone-100/70 dark:bg-stone-900/40 rounded-3xl border border-[#D5CEC2] dark:border-stone-800 p-3.5 space-y-2.5 min-w-[270px] flex-1"><div class="flex items-center justify-between pb-2 border-b border-[#D5CEC2] dark:border-stone-800"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 flex items-center justify-center text-xs font-bold text-red-900 dark:text-red-300 shadow-xs">${(item.photo || item.icon || 'ST').slice(0, 2)}</div><div><h3 class="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">${item.name}</h3><p class="text-[10px] text-stone-500 dark:text-stone-400 truncate">${item.role || item.type}</p></div></div><button onclick="AdminL3Agenda.openSobreturnoModal('${viewTarget === 'staff' ? item.id : ''}', '${viewTarget === 'resource' ? item.id : ''}')" class="w-6 h-6 rounded-lg admin-glass-btn flex items-center justify-center">${svg('plus')}</button></div><div class="space-y-2 max-h-[550px] overflow-y-auto pr-1 hide-scrollbar">${cards}</div></div>`;
      }).join('')}</div>`;
    } else {
      const rows = filtered.sort((a, b) => a.time.localeCompare(b.time)).map(b => {
        const meta = eng().getMeta(b.status);
        return `<tr class="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-900/40 text-xs"><td class="py-3 px-4 font-mono font-bold text-red-900 dark:text-red-400">${b.time} hs</td><td class="py-3 px-4"><p class="font-bold text-stone-800 dark:text-stone-100">${b.client || 'Cliente'}</p><span class="text-[10px] text-stone-500 inline-flex items-center gap-1">${svg('tel')} ${b.phone}</span></td><td class="py-3 px-4"><p class="text-stone-800 dark:text-stone-200 font-semibold">${b.serviceName}</p><span class="text-[10px] text-stone-500">${b.staffName} · ${b.resourceName || 'Recurso'}</span>${eng().renderDepositHtml(b)}</td><td class="py-3 px-4"><div class="flex flex-col items-start gap-1"><span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badge}">${meta.label}</span>${eng().renderUndoLabel(b.status, b.prevStatus)}</div></td><td class="py-3 px-4 text-right"><div class="flex flex-wrap justify-end gap-1">${eng().renderActionButtons(b.id, b.status, 'AdminL3Agenda', b.prevStatus)}<button onclick="AdminL3Agenda.openWhatsAppModal('${b.id}')" class="px-2 py-1 rounded-lg admin-glass-btn text-emerald-700 dark:text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">${svg('msg')}<span>WA</span></button></div></td></tr>`;
      }).join('');
      bodyHtml = `<div class="admin-card !p-0 overflow-x-auto mt-2"><table class="w-full text-left"><thead class="bg-stone-50 dark:bg-stone-950/70 border-b border-[#D5CEC2] dark:border-stone-800 text-[11px] text-stone-500 uppercase font-semibold"><tr><th class="py-3 px-4">Horario</th><th class="py-3 px-4">Cliente</th><th class="py-3 px-4">Servicio & Seña</th><th class="py-3 px-4">Estado</th><th class="py-3 px-4 text-right">Acciones</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="p-6 text-center text-stone-400 italic">Sin reservas</td></tr>'}</tbody></table></div>`;
    }
    container.innerHTML = headerHtml + bodyHtml;
  }

  function openSobreturnoModal(preStaff = '', preRes = '') {
    const modal = document.getElementById('admin-modal-root'); if (!modal) return;
    const state = window.AdminL3Core.state, svg = window.AdminL3Core.svg, methods = eng().getEnabledMethods('l3');
    const staffOpts = state.staff.filter(s => !s.deletedAt && s.active !== false).map(s => `<option value="${s.id}" ${s.id === preStaff ? 'selected' : ''}>${s.name} (${s.role})</option>`).join('');
    const resOpts = state.resources.filter(r => !r.deletedAt && r.active !== false).map(r => `<option value="${r.id}" ${r.id === preRes ? 'selected' : ''}>${r.name} (${r.type})</option>`).join('');
    const availSrvs = state.services.filter(s => (window.AdminShell ? window.AdminShell.isServiceAvailable(s) : (s.active !== false && s.isActive !== false && !s.deletedAt)));
    const srvOpts = availSrvs.map(s => `<option value="${s.id}">${s.name} - $${s.price || 0}</option>`).join('') || '<option value="">Sin servicios activos</option>';
    const pmOpts = methods.map(m => `<option value="${m.label}">${m.label}</option>`).join('');
    modal.innerHTML = `<div class="w-full max-w-md bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 space-y-3 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-stone-900 dark:text-stone-100 text-sm font-title">Cargar Sobreturno Dual</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-2"><div><label class="block text-stone-500 mb-1 font-semibold">Especialista:</label><select id="mbk-staff" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none">${staffOpts}</select></div><div><label class="block text-stone-500 mb-1 font-semibold">Recurso Físico:</label><select id="mbk-resource" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none">${resOpts}</select></div><div><label class="block text-stone-500 mb-1 font-semibold">Servicio:</label><select id="mbk-srv" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none">${srvOpts}</select></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-500 mb-1 font-semibold">Fecha:</label><input type="date" id="mbk-date" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div><div><label class="block text-stone-500 mb-1 font-semibold">Hora:</label><select id="mbk-time" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 font-mono outline-none"></select></div></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-500 mb-1 font-semibold">Cliente:</label><input type="text" id="mbk-client" value="Martín Rodríguez" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div><div><label class="block text-stone-500 mb-1 font-semibold">WhatsApp:</label><input type="tel" id="mbk-phone" value="3815554321" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div></div><div class="grid grid-cols-2 gap-2 items-center pt-1"><label class="flex items-center gap-2 font-semibold text-stone-700 dark:text-stone-200 cursor-pointer"><input type="checkbox" id="mbk-paid" checked class="w-4 h-4 accent-[#800000]"><span>¿Seña cobrada?</span></label><select id="mbk-method" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none">${pmOpts}</select></div></div><div class="flex gap-2 pt-2"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2.5 rounded-xl admin-glass-btn font-bold">Cancelar</button><button onclick="AdminL3Agenda.saveSobreturno()" class="w-2/3 py-2.5 rounded-xl admin-glass-primary font-bold">Confirmar Turno</button></div></div>`;
    modal.classList.remove('hidden');
    window.AdminShell?.bindDateTimeGuards({ dateId: 'mbk-date', timeId: 'mbk-time', initialDate: state.selectedDate });
  }

  function saveSobreturno() {
    const staffId = document.getElementById('mbk-staff')?.value, resId = document.getElementById('mbk-resource')?.value, srvId = document.getElementById('mbk-srv')?.value;
    const today = window.AdminShell ? window.AdminShell.localTodayStr() : new Date().toISOString().split('T')[0];
    const date = document.getElementById('mbk-date')?.value || today, time = document.getElementById('mbk-time')?.value || '';
    if (!srvId) return window.AdminL3Core.showToast('Activa al menos un servicio', 'error');
    if (date < today || !time || (date === today && window.AdminShell && time <= window.AdminShell.currentHHMM())) return window.AdminL3Core.showToast('Selecciona fecha y horario futuros', 'error');
    const phone = (document.getElementById('mbk-phone')?.value || '3815554321').replace(/\D/g, ''), client = document.getElementById('mbk-client')?.value || 'Cliente Sobreturno';
    const paid = !!document.getElementById('mbk-paid')?.checked, method = paid ? (document.getElementById('mbk-method')?.value || 'Efectivo') : null;
    const state = window.AdminL3Core.state, staffObj = state.staff.find(s => s.id === staffId), resObj = state.resources.find(r => r.id === resId), srvObj = state.services.find(s => s.id === srvId);
    const price = srvObj?.price || 12000, depAmt = eng().calcDeposit(price, 'l3'), list = window.AdminL3Core.getStorage('tucu_l3_bookings', []);
    list.push({ id: 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase(), rubroId: state.rubro, staffId, staffName: staffObj?.name || 'Staff', resourceId: resId, resourceName: resObj?.name || 'Recurso', serviceId: srvId, serviceName: srvObj?.name || 'Servicio', duration: srvObj?.duration || 30, price, depositAmount: depAmt, depositPaid: paid, paymentMethod: method, paidAt: paid ? new Date().toISOString() : null, date, time, client, phone, status: paid ? 'CONFIRMED' : 'PENDING_DEPOSIT', prevStatus: null });
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    persist(list, `Turno agendado en ${resObj?.name || 'Recurso'}`);
  }

  function openWhatsAppModal(bookingId) {
    const b = window.AdminL3Core.getStorage('tucu_l3_bookings', []).find(x => x.id === bookingId), modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    if (!b || !modal) return;
    const msg = `Hola ${b.client}, te confirmamos tu turno el ${b.date} a las ${b.time} hs con ${b.staffName} en ${b.resourceName || 'nuestro espacio'} para ${b.serviceName} (#${b.id}).`;
    modal.innerHTML = `<div class="w-full max-w-md bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 space-y-3.5 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">${svg('msg')}<span>Notificación WhatsApp</span></h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div><label class="block text-stone-500 mb-1">Destinatario:</label><input readonly value="${b.client} (${b.phone})" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 font-bold"></div><div><label class="block text-stone-500 mb-1">Mensaje:</label><textarea id="wa-modal-msg" rows="3" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none">${msg}</textarea></div><div class="flex gap-2 pt-2"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2.5 rounded-xl admin-glass-btn font-bold">Cerrar</button><button onclick="window.AdminL3Core.showToast('Mensaje despachado'); document.getElementById('admin-modal-root').classList.add('hidden');" class="w-2/3 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer">Despachar Mensaje</button></div></div>`;
    modal.classList.remove('hidden');
  }

  return {
    render, setStatus, undoStatus, creditDeposit, openSobreturnoModal, saveSobreturno, openWhatsAppModal,
    setViewTarget: (t) => { viewTarget = t; window.AdminL3Core.renderActiveView(); },
    setViewMode: (m) => { viewMode = m; window.AdminL3Core.renderActiveView(); },
    setFilterStatus: (s) => { filterStatus = s; window.AdminL3Core.renderActiveView(); },
    setSearch: (v) => { searchTerm = v; window.AdminL3Core.renderActiveView(); },
    toggleRangeMode: () => { const s = window.AdminL3Core.state; s.dateRangeEnabled = !s.dateRangeEnabled; window.AdminL3Core.renderActiveView(); },
    setDateRange: (k, v) => { window.AdminL3Core.state[k] = v; window.AdminL3Core.renderActiveView(); }
  };
})();
