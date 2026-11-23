// Archivo: public/js/admin_l3/view_agenda.js
// Vista Agenda Multi-Equipo L3: KPIs -> Controls Compacto + Drawer Etiquetado -> Lista (< 180L)

window.AdminL3Agenda = (function () {
  let viewTarget = 'staff', viewMode = 'grid', filterStatus = 'ALL', searchTerm = '', timeFilter = 'hoy', filtersOpen = false;
  const eng = () => window.AdminBookingEngine;
  const FILTERS = [['ALL', 'Todos'], ['PENDING_DEPOSIT', 'Pendiente Seña'], ['CONFIRMED', 'Confirmado'], ['COMPLETED', 'Finalizado'], ['CANCELLED', 'Cancelado'], ['NO_SHOW', 'Ausente']];
  const TFILTERS = [['hoy', 'Hoy'], ['semana', 'Esta Semana'], ['mes', 'Este Mes'], ['todos', 'Todos']];
  const SVG_FILTER = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>';
  const SVG_FIND = '<svg class="w-3.5 h-3.5 absolute left-2.5 top-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>';
  const localToday = (off = 0) => (window.AdminShell?.localTodayStr ? window.AdminShell.localTodayStr(off) : (() => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })());

  function inDateScope(b, state) {
    if (state.dateRangeEnabled) return (!state.dateFrom || b.date >= state.dateFrom) && (!state.dateTo || b.date <= state.dateTo);
    if (timeFilter === 'todos') return true;
    const t0 = localToday(0);
    if (timeFilter === 'hoy') return b.date === t0;
    if (timeFilter === 'semana') return b.date >= t0 && b.date <= localToday(6);
    if (timeFilter === 'mes') return String(b.date || '').slice(0, 7) === t0.slice(0, 7);
    return b.date === state.selectedDate;
  }

  function persist(list, msg) {
    const r = window.AdminL3Core.state.rubro;
    window.AdminL3Core.setStorage('tucu_l3_bookings', list);
    window.AdminL3Core.setStorage(`tucu_l3_bookings_${r}`, list.filter(b => !b.rubroId || b.rubroId === r));
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
    persist(list, `Turno reabierto · Volvió a ${eng().getMeta(bk.status).label}`);
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
    const pills = FILTERS.map(([k, lbl]) => `<button type="button" data-l3sfilter="${k}" onclick="AdminL3Agenda.setFilterStatus('${k}')" class="tucu-chip ${filterStatus === k ? 'is-active' : ''}">${lbl}</button>`).join('');
    const tPills = TFILTERS.map(([k, lbl]) => `<button type="button" data-l3tfilter="${k}" onclick="AdminL3Agenda.setTimeFilter('${k}')" class="tucu-chip ${timeFilter === k && !state.dateRangeEnabled ? 'is-active' : ''}">${lbl}</button>`).join('');
    const qPeriods = [['hoy', 'Hoy'], ['semana', 'Semana'], ['mes', 'Mes']].map(([k, lbl]) => `<button type="button" onclick="AdminL3Agenda.setTimeFilter('${k}')" class="tucu-chip ${timeFilter === k && !state.dateRangeEnabled ? 'is-active' : ''}">${lbl}</button>`).join('');

    const headerHtml = `<div class="space-y-3.5">
      <div id="admin-kpis-section" class="admin-kpi-grid grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        <div class="admin-card tucu-card"><p class="text-[10px] uppercase font-bold text-stone-500 truncate"><span class="hidden sm:inline">Turnos en Vista</span><span class="sm:hidden">Turnos</span></p><p class="font-title text-base sm:text-xl font-extrabold text-stone-900 dark:text-stone-100">${dayBks.length}</p><div class="admin-kpi-track"><div class="admin-kpi-fill tucu-primary-bg" style="width:${dayBks.length ? 100 : 0}%"></div></div></div>
        <div class="admin-card tucu-card"><p class="text-[10px] uppercase font-bold tucu-primary-text truncate"><span class="hidden sm:inline">Señas Acreditadas</span><span class="sm:hidden">Señas</span></p><p id="l3-kpi-deposit-total" class="font-title text-base sm:text-xl font-extrabold tucu-primary-text truncate">$${kpis.creditedDeposits.toLocaleString('es-AR')}</p><p class="hidden sm:block text-[10px] text-stone-500 mt-0.5">De $${kpis.potentialDeposits.toLocaleString('es-AR')} esperados</p><div class="admin-kpi-track"><div class="admin-kpi-fill tucu-primary-bg" style="width:${depPct}%"></div></div></div>
        <div class="admin-card tucu-card"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 truncate"><span class="hidden sm:inline">Confirmados</span><span class="sm:hidden">Asist.</span></p><p class="font-title text-base sm:text-xl font-extrabold text-emerald-700 dark:text-emerald-300"><span class="hidden sm:inline">${kpis.confirmedCount}</span><span class="sm:hidden">${confPct}%</span></p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-emerald-600" style="width:${confPct}%"></div></div></div>
        <div class="hidden sm:block admin-card tucu-card"><p class="text-[10px] uppercase font-bold text-stone-500">Finalizados / Ausentes</p><p class="font-title text-xl font-extrabold text-stone-800 dark:text-stone-200">${kpis.doneCount} / ${kpis.noShowCount}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-amber-600" style="width:${dayBks.length ? Math.round((kpis.doneCount / dayBks.length) * 100) : 0}%"></div></div></div>
      </div>
      <div id="admin-controls-card" class="admin-card tucu-card space-y-2.5">
        <div class="flex items-center justify-between gap-2">
          <div class="min-w-0"><h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2 truncate">${svg('cal')}<span class="truncate">Agenda Multi-Equipo</span></h2><p class="hidden sm:flex text-xs text-stone-500 items-center gap-1.5 flex-wrap mt-0.5"><span class="w-2 h-2 rounded-full tucu-primary-bg animate-pulse"></span><span>Confirmación 2 hs: <strong class="tucu-primary-text tabular-nums">ACTIVO</strong> · Últ. rev. <strong>${telem.lastSweep}</strong> (${telem.confirmed} conf.)</span></p></div>
          <button type="button" onclick="AdminL3Agenda.openSobreturnoModal()" class="tucu-btn admin-glass-primary shrink-0">${svg('plus')}<span>Sobreturno</span></button>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative flex-1 min-w-0"><input id="l3-search-input" type="text" placeholder="Buscar cliente o #TK..." value="${searchTerm}" oninput="AdminL3Agenda.setSearch(this.value)" class="tucu-input w-full pl-8 pr-3">${SVG_FIND}</div>
          <button id="btn-toggle-filters" type="button" aria-expanded="${filtersOpen}" aria-controls="admin-filters-drawer" class="tucu-btn admin-glass-btn shrink-0">${SVG_FILTER}<span data-filters-label>Filtros</span></button>
        </div>
        <div class="tucu-quick-strip">${qPeriods}<span class="h-4 w-px bg-stone-300 dark:bg-stone-700 shrink-0 mx-0.5"></span><button type="button" onclick="AdminL3Agenda.setViewTarget('staff')" class="tucu-chip ${viewTarget === 'staff' ? 'is-active' : ''}">Especialista</button><button type="button" onclick="AdminL3Agenda.setViewTarget('resource')" class="tucu-chip ${viewTarget === 'resource' ? 'is-active' : ''}">Recurso</button></div>
        <div id="admin-filters-drawer" class="${filtersOpen ? '' : 'hidden'} pt-2.5 border-t border-stone-100 dark:border-stone-800 space-y-3">
          <div>
            <span class="tucu-filter-label">PERÍODO</span>
            <div id="l3-temporal-filters" class="flex flex-wrap items-center gap-1.5">${tPills}<button type="button" onclick="AdminL3Agenda.toggleRangeMode()" class="tucu-chip ${state.dateRangeEnabled || timeFilter === 'date' ? 'is-active' : ''}">Fecha / Rango</button></div>
            ${(state.dateRangeEnabled || timeFilter === 'date') ? `<div class="flex flex-wrap items-center gap-2 pt-2 text-xs"><input type="date" id="admin-date-picker" value="${state.selectedDate}" onchange="AdminL3Agenda.setDate(this.value)" class="tucu-input"><input type="date" value="${state.dateFrom}" onchange="AdminL3Agenda.setDateRange('dateFrom', this.value)" class="tucu-input"><input type="date" value="${state.dateTo}" onchange="AdminL3Agenda.setDateRange('dateTo', this.value)" class="tucu-input"></div>` : ''}
          </div>
          <div><span class="tucu-filter-label">ESTADO DEL TURNO</span><div class="flex flex-wrap gap-1.5">${pills}</div></div>
          <div>
            <span class="tucu-filter-label">MODO DE VISTA</span>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-1.5">
                <button type="button" onclick="AdminL3Agenda.setViewTarget('staff')" class="tucu-chip ${viewTarget === 'staff' ? 'is-active' : ''}">${svg('users')}<span>Por Especialista</span></button>
                <button type="button" onclick="AdminL3Agenda.setViewTarget('resource')" class="tucu-chip ${viewTarget === 'resource' ? 'is-active' : ''}">${svg('space')}<span>Por Recurso</span></button>
                <button type="button" onclick="AdminL3Agenda.setViewMode('grid')" class="tucu-chip ${viewMode === 'grid' ? 'is-active' : ''}">${svg('grid')}<span>Grilla</span></button>
                <button type="button" onclick="AdminL3Agenda.setViewMode('table')" class="tucu-chip ${viewMode === 'table' ? 'is-active' : ''}">${svg('list')}<span>Lista</span></button>
              </div>
              <button type="button" onclick="AdminL3Core.executeCronSweep()" class="tucu-btn admin-glass-btn">${svg('bolt')}<span>Revisión 2 hs</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    const columns = viewTarget === 'staff' ? activeStaff : activeResources;
    let bodyHtml = '';
    if (viewMode === 'grid') {
      bodyHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">${columns.map(item => {
        const itemBks = filtered.filter(b => (viewTarget === 'staff' ? b.staffId === item.id : b.resourceId === item.id)).sort((a, b) => a.time.localeCompare(b.time));
        const cards = itemBks.length === 0 ? '<div class="p-4 text-center text-stone-400 text-xs italic bg-stone-50 dark:bg-stone-950/40 rounded-2xl border border-dashed border-[#D5CEC2] dark:border-stone-800 my-2">Sin reservas</div>' : itemBks.map(b => {
          const meta = eng().getMeta(b.status);
          return `<div class="admin-card tucu-card !p-3 space-y-2"><div class="flex items-center justify-between gap-1"><span class="tabular-nums font-bold text-xs tucu-primary-soft border px-2 py-0.5 rounded-lg inline-flex items-center gap-1">${svg('clock')} ${b.time} hs</span><div class="flex items-center gap-1.5 flex-wrap justify-end">${eng().renderUndoLabel(b.status, b.prevStatus, b)}<span class="tucu-badge ${meta.badge}">${meta.label}</span></div></div><div class="space-y-0.5"><p class="font-bold text-xs text-stone-900 dark:text-stone-100">${b.client || 'Cliente'}</p><p class="text-[11px] text-stone-600 dark:text-stone-300">${b.serviceName}</p><div class="flex items-center justify-between gap-2 flex-wrap pt-0.5"><span class="text-[10px] font-semibold text-stone-500 flex items-center gap-1">${viewTarget === 'staff' ? `${svg('space')} ${b.resourceName || 'Recurso'}` : `${svg('users')} ${b.staffName || 'Staff'}`}</span>${eng().renderInlineDepositBadge(b)}</div>${eng().renderCollapsibleDetail(b)}</div><div class="flex flex-wrap items-center gap-1 pt-1.5 border-t border-stone-100 dark:border-stone-800 text-[11px]">${eng().renderActionButtons(b.id, b.status, 'AdminL3Agenda', b.prevStatus)}</div></div>`;
        }).join('');
        return `<div class="flex flex-col bg-stone-100/70 dark:bg-stone-900/40 rounded-3xl border border-[#D5CEC2] dark:border-stone-800 p-3.5 space-y-2.5 min-w-[270px] flex-1"><div class="flex items-center justify-between pb-2 border-b border-[#D5CEC2] dark:border-stone-800"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 flex items-center justify-center text-xs font-bold tucu-primary-text shadow-xs">${(item.photo || item.icon || 'ST').slice(0, 2)}</div><div><h3 class="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">${item.name}</h3><p class="text-[10px] text-stone-500 dark:text-stone-400 truncate">${item.role || item.type}</p></div></div><button onclick="AdminL3Agenda.openSobreturnoModal('${viewTarget === 'staff' ? item.id : ''}', '${viewTarget === 'resource' ? item.id : ''}')" class="w-6 h-6 rounded-lg admin-glass-btn flex items-center justify-center">${svg('plus')}</button></div><div class="space-y-2 max-h-[550px] overflow-y-auto pr-1 hide-scrollbar">${cards}</div></div>`;
      }).join('')}</div>`;
    } else {
      const rows = filtered.sort((a, b) => a.time.localeCompare(b.time)).map(b => {
        const meta = eng().getMeta(b.status);
        return `<tr class="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-900/40 text-xs"><td class="py-3 px-4 tabular-nums font-bold tucu-primary-text">${b.time} hs</td><td class="py-3 px-4"><p class="font-bold text-stone-800 dark:text-stone-100">${b.client || 'Cliente'}</p>${eng().renderCollapsibleDetail(b)}</td><td class="py-3 px-4"><p class="text-stone-800 dark:text-stone-200 font-semibold">${b.serviceName}</p><div class="flex items-center gap-2 flex-wrap"><span class="text-[10px] text-stone-500">${b.staffName} · ${b.resourceName || 'Recurso'}</span>${eng().renderInlineDepositBadge(b)}</div></td><td class="py-3 px-4"><div class="flex flex-col items-start gap-1"><span class="tucu-badge ${meta.badge}">${meta.label}</span>${eng().renderUndoLabel(b.status, b.prevStatus, b)}</div></td><td class="py-3 px-4 text-right"><div class="flex flex-wrap justify-end gap-1">${eng().renderActionButtons(b.id, b.status, 'AdminL3Agenda', b.prevStatus)}</div></td></tr>`;
      }).join('');
      bodyHtml = `<div class="admin-card tucu-card !p-0 overflow-x-auto"><table class="w-full text-left"><thead class="bg-stone-50 dark:bg-stone-950/70 border-b border-[#D5CEC2] dark:border-stone-800 text-[11px] text-stone-500 uppercase font-semibold"><tr><th class="py-3 px-4">Horario</th><th class="py-3 px-4">Cliente</th><th class="py-3 px-4">Servicio & Seña</th><th class="py-3 px-4">Estado</th><th class="py-3 px-4 text-right">Acciones</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="p-6 text-center text-stone-400 italic">Sin reservas</td></tr>'}</tbody></table></div>`;
    }
    const hadFocus = document.activeElement?.id === 'l3-search-input';
    container.innerHTML = `${headerHtml}<div id="admin-agenda-list" class="pt-3.5">${bodyHtml}</div>`;
    if (hadFocus) { const si = document.getElementById('l3-search-input'); si?.focus(); si?.setSelectionRange?.(si.value.length, si.value.length); }
    window.AdminThemeSync?.bindFilterDrawer?.('btn-toggle-filters', 'admin-filters-drawer', () => (filterStatus !== 'ALL' ? 1 : 0) + (state.dateRangeEnabled || timeFilter !== 'hoy' ? 1 : 0), (open) => { filtersOpen = open; });
  }

  function onMbkPaidChange() { document.getElementById('mbk-method')?.classList.toggle('hidden', !document.getElementById('mbk-paid')?.checked); }
  function onMbkSrvChange() { const sel = document.getElementById('mbk-srv'), paidEl = document.getElementById('mbk-paid'), opt = sel?.options?.[sel.selectedIndex], req = opt ? opt.dataset.req !== 'false' : true; if (paidEl) paidEl.checked = req; onMbkPaidChange(); }

  function openSobreturnoModal(preStaff = '', preRes = '') {
    const modal = document.getElementById('admin-modal-root'); if (!modal) return;
    const state = window.AdminL3Core.state, svg = window.AdminL3Core.svg, methods = eng().getEnabledMethods('l3');
    const staffOpts = state.staff.filter(s => !s.deletedAt && s.active !== false).map(s => `<option value="${s.id}" ${s.id === preStaff ? 'selected' : ''}>${s.name} (${s.role})</option>`).join('');
    const resOpts = state.resources.filter(r => !r.deletedAt && r.active !== false).map(r => `<option value="${r.id}" ${r.id === preRes ? 'selected' : ''}>${r.name} (${r.type})</option>`).join('');
    const availSrvs = [...state.services].sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99)).filter(s => (window.AdminShell ? window.AdminShell.isServiceAvailable(s) : (s.active !== false && s.isActive !== false && !s.deletedAt)));
    const srvOpts = availSrvs.map(s => `<option value="${s.id}" data-req="${s.requireDeposit !== false}">${s.name} - $${s.price || 0}</option>`).join('') || '<option value="">Sin servicios activos</option>';
    const pmOpts = methods.map(m => `<option value="${m.label}">${m.label}</option>`).join('');
    modal.innerHTML = `<div class="w-full max-w-md bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 space-y-3 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-stone-900 dark:text-stone-100 text-sm font-title">Cargar Sobreturno Dual</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-2"><div><label class="block text-stone-500 mb-1 font-semibold">Especialista:</label><select id="mbk-staff" class="tucu-input w-full">${staffOpts}</select></div><div><label class="block text-stone-500 mb-1 font-semibold">Recurso Físico:</label><select id="mbk-resource" class="tucu-input w-full">${resOpts}</select></div><div><label class="block text-stone-500 mb-1 font-semibold">Servicio:</label><select id="mbk-srv" onchange="AdminL3Agenda.onMbkSrvChange()" class="tucu-input w-full">${srvOpts}</select></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-500 mb-1 font-semibold">Fecha:</label><input type="date" id="mbk-date" class="tucu-input w-full"></div><div><label class="block text-stone-500 mb-1 font-semibold">Hora:</label><select id="mbk-time" class="tucu-input w-full tabular-nums"></select></div></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-500 mb-1 font-semibold">Cliente:</label><input type="text" id="mbk-client" value="Martín Rodríguez" class="tucu-input w-full"></div><div><label class="block text-stone-500 mb-1 font-semibold">WhatsApp:</label><input type="tel" id="mbk-phone" value="3815554321" class="tucu-input w-full"></div></div><div class="grid grid-cols-2 gap-2 items-center pt-1"><label class="flex items-center gap-2 font-semibold text-stone-700 dark:text-stone-200 cursor-pointer"><input type="checkbox" id="mbk-paid" checked onchange="AdminL3Agenda.onMbkPaidChange()" class="w-4 h-4 tucu-accent-input"><span>¿Seña cobrada?</span></label><select id="mbk-method" class="tucu-input w-full">${pmOpts}</select></div></div><div class="flex gap-2 pt-2"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="tucu-btn w-1/3 admin-glass-btn">Cancelar</button><button onclick="AdminL3Agenda.saveSobreturno()" class="tucu-btn w-2/3 admin-glass-primary">Confirmar Turno</button></div></div>`;
    modal.classList.remove('hidden');
    window.AdminShell?.bindDateTimeGuards({ dateId: 'mbk-date', timeId: 'mbk-time', initialDate: state.selectedDate });
    onMbkSrvChange();
  }

  function saveSobreturno() {
    const staffId = document.getElementById('mbk-staff')?.value, resId = document.getElementById('mbk-resource')?.value, srvId = document.getElementById('mbk-srv')?.value;
    const today = localToday(0), date = document.getElementById('mbk-date')?.value || today, time = document.getElementById('mbk-time')?.value || '';
    if (!srvId) return window.AdminL3Core.showToast('Activa al menos un servicio', 'error');
    if (date < today || !time || (date === today && window.AdminShell && time <= window.AdminShell.currentHHMM())) return window.AdminL3Core.showToast('Selecciona fecha y horario futuros', 'error');
    const phone = (document.getElementById('mbk-phone')?.value || '3815554321').replace(/\D/g, ''), client = document.getElementById('mbk-client')?.value || 'Cliente Sobreturno';
    const paid = !!document.getElementById('mbk-paid')?.checked, state = window.AdminL3Core.state;
    const staffObj = state.staff.find(s => s.id === staffId), resObj = state.resources.find(r => r.id === resId), srvObj = state.services.find(s => s.id === srvId);
    const price = srvObj?.price || 12000, depAmt = eng().calcDeposit(price, 'l3', srvObj?.requireDeposit !== false), finalPaid = depAmt === 0 ? true : paid;
    const method = finalPaid && depAmt > 0 ? (document.getElementById('mbk-method')?.value || 'Efectivo') : null, list = window.AdminL3Core.getStorage('tucu_l3_bookings', []);
    const bizName = localStorage.getItem('tucu_l3_biz_name') || state.presets[state.rubro]?.name || '', address = localStorage.getItem('tucu_l3_address') || state.presets[state.rubro]?.address || '';
    list.push({ id: 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase(), rubroId: state.rubro, bizName, address, staffId, staffName: staffObj?.name || 'Staff', resourceId: resId, resourceName: resObj?.name || 'Recurso', serviceId: srvId, serviceName: srvObj?.name || 'Servicio', duration: srvObj?.duration || 30, price, depositAmount: depAmt, depositPaid: finalPaid, paymentMethod: method, paidAt: finalPaid && depAmt > 0 ? new Date().toISOString() : null, date, time, client, phone, status: finalPaid ? 'CONFIRMED' : 'PENDING_DEPOSIT', prevStatus: null });
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    persist(list, `Turno agendado en ${resObj?.name || 'Recurso'}`);
  }

  return {
    render, setStatus, undoStatus, creditDeposit, openSobreturnoModal, saveSobreturno, onMbkPaidChange, onMbkSrvChange,
    setViewTarget: (t) => { viewTarget = t; window.AdminL3Core.renderActiveView(); },
    setViewMode: (m) => { viewMode = m; window.AdminL3Core.renderActiveView(); },
    setFilterStatus: (s) => { filterStatus = s; window.AdminL3Core.renderActiveView(); },
    setTimeFilter: (tf, silent = false) => { timeFilter = tf; window.AdminL3Core.state.dateRangeEnabled = false; if (!silent) window.AdminL3Core.renderActiveView(); },
    setDate: (val) => { const s = window.AdminL3Core.state; s.selectedDate = val || localToday(0); s.dateRangeEnabled = false; timeFilter = 'date'; window.AdminL3Core.renderActiveView(); },
    setSearch: (v) => { searchTerm = v; window.AdminL3Core.renderActiveView(); },
    toggleRangeMode: () => { const s = window.AdminL3Core.state; s.dateRangeEnabled = !s.dateRangeEnabled; if (!s.dateRangeEnabled && timeFilter === 'date') timeFilter = 'hoy'; window.AdminL3Core.renderActiveView(); },
    setDateRange: (k, v) => { window.AdminL3Core.state[k] = v; window.AdminL3Core.renderActiveView(); }
  };
})();
