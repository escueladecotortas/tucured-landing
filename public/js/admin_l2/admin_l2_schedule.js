// Archivo: public/js/admin_l2/admin_l2_schedule.js
// Cronograma L2: Horarios Semanales, Feriados 2026 por Mes & Vacaciones (<= 145 líneas)

(function (global) {
  const defaultSchedule = {
    1: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    2: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    3: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    4: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    5: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    6: { enabled: true, open: "09:00", close: "13:00", isSplit: false, open2: "17:00", close2: "21:00" },
    0: { enabled: false, open: "09:00", close: "13:00", isSplit: false, open2: "17:00", close2: "21:00" }
  };

  const dayNames = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
  const vacKey = () => `tucu_l2_vacations_${localStorage.getItem('tucu_l2_rubro') || 'estetica'}`;
  const loadVac = () => { try { return JSON.parse(localStorage.getItem(vacKey()) || localStorage.getItem('tucu_l2_vacations') || '[]'); } catch (_) { return []; } };
  const saveVac = () => { try { localStorage.setItem(vacKey(), JSON.stringify(vacations)); localStorage.setItem('tucu_l2_vacations', JSON.stringify(vacations)); } catch (_) {} };

  let weeklySchedule = JSON.parse(localStorage.getItem('tucu_schedule') || JSON.stringify(defaultSchedule));
  let vacations = loadVac();

  function renderScheduleMatrix() {
    const container = document.getElementById('weekly-schedule-container');
    if (!container) return;
    container.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(day => {
      const d = weeklySchedule[day] || { enabled: false, open: '09:00', close: '18:00', isSplit: false, open2: '17:00', close2: '21:00' };
      return `<div class="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3"><input type="checkbox" onchange="adminL2Schedule.toggleDay(${day}, this.checked)" ${d.enabled ? 'checked' : ''} class="w-4 h-4 rounded accent-[#800000] cursor-pointer"><span class="text-xs font-bold ${d.enabled ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}">${dayNames[day]}</span></div>
          <button type="button" onclick="adminL2Schedule.toggleSplit(${day})" class="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${d.isSplit ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300 border border-red-200 dark:border-red-900' : 'admin-glass-pill'}">${d.isSplit ? 'Horario Partido' : 'Horario Corrido'}</button>
        </div>
        ${d.enabled ? `<div class="grid grid-cols-2 ${d.isSplit ? 'sm:grid-cols-4' : 'sm:grid-cols-2'} gap-2 pt-1">
          <div><label class="block text-[10px] text-stone-500 dark:text-stone-400 mb-0.5">Apertura</label><input type="time" value="${d.open}" onchange="adminL2Schedule.updateHour(${day}, 'open', this.value)" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-100 outline-none focus:border-red-900"></div>
          <div><label class="block text-[10px] text-stone-500 dark:text-stone-400 mb-0.5">Cierre</label><input type="time" value="${d.close}" onchange="adminL2Schedule.updateHour(${day}, 'close', this.value)" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-100 outline-none focus:border-red-900"></div>
          ${d.isSplit ? `<div><label class="block text-[10px] text-stone-500 dark:text-stone-400 mb-0.5">Reapertura</label><input type="time" value="${d.open2 || '17:00'}" onchange="adminL2Schedule.updateHour(${day}, 'open2', this.value)" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-100 outline-none focus:border-red-900"></div>
          <div><label class="block text-[10px] text-stone-500 dark:text-stone-400 mb-0.5">Cierre Tarde</label><input type="time" value="${d.close2 || '21:00'}" onchange="adminL2Schedule.updateHour(${day}, 'close2', this.value)" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-100 outline-none focus:border-red-900"></div>` : ''}
        </div>` : ''}
      </div>`;
    }).join('');
  }

  function toggleDay(day, enabled) { weeklySchedule[day].enabled = enabled; localStorage.setItem('tucu_schedule', JSON.stringify(weeklySchedule)); renderScheduleMatrix(); }
  function toggleSplit(day) { weeklySchedule[day].isSplit = !weeklySchedule[day].isSplit; localStorage.setItem('tucu_schedule', JSON.stringify(weeklySchedule)); renderScheduleMatrix(); }
  function updateHour(day, field, val) { weeklySchedule[day][field] = val; localStorage.setItem('tucu_schedule', JSON.stringify(weeklySchedule)); }
  function copyMonToAll() {
    const mon = weeklySchedule[1];
    [2, 3, 4, 5].forEach(d => { weeklySchedule[d] = JSON.parse(JSON.stringify(mon)); });
    localStorage.setItem('tucu_schedule', JSON.stringify(weeklySchedule)); renderScheduleMatrix(); global.adminL2Core?.showToast('Horarios de Lunes copiados a días hábiles');
  }

  function renderHolidays() {
    const r = localStorage.getItem('tucu_l2_rubro') || 'estetica';
    global.AdminHolidays?.renderMonthlyList?.('holidays-container', 'l2', r, (_, blk) => {
      global.adminL2Core?.showToast(blk ? 'Feriado bloqueado en agenda' : 'Feriado habilitado para atender');
    });
  }

  function renderVacations() {
    const c = document.getElementById('vacations-list-container'); if (!c) return;
    const active = vacations.map((v, idx) => ({ v, idx })).filter(({ v }) => !v.deletedAt);
    c.innerHTML = active.length === 0 ? '<p class="text-xs text-slate-400 italic py-2">No hay vacaciones ni cierres programados.</p>' : active.map(({ v, idx }) => `
      <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-xs">
        <div><span class="font-bold text-amber-700 dark:text-amber-400">${v.reason || 'Cierre Temporal'}</span><p class="text-[11px] text-stone-500 dark:text-stone-400 font-mono">${v.from} al ${v.to}</p></div>
        <button type="button" onclick="adminL2Schedule.removeVacation(${idx})" class="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40">Eliminar</button>
      </div>`).join('');
  }

  async function removeVacation(i) {
    if (!vacations[i]) return;
    if (global.AdminShell?.confirmAsync) {
      const ok = await global.AdminShell.confirmAsync({ title: '¿Archivar cierre especial?', message: 'Las fechas quedarán nuevamente habilitadas conservando el registro en el histórico.', confirmLabel: 'Sí, archivar' });
      if (!ok) return;
    }
    vacations[i].deletedAt = new Date().toISOString(); saveVac(); renderVacations(); global.adminL2Core?.showToast('Cierre archivado en histórico');
  }

  function addVacation() {
    const fromEl = document.getElementById('vacation-start-date'), toEl = document.getElementById('vacation-end-date'), reasonEl = document.getElementById('vacation-reason');
    const from = fromEl?.value, to = toEl?.value, reason = reasonEl?.value.trim() || 'Cierre Temporal';
    if (!from || !to || from > to) return global.adminL2Core?.showToast('Rango de fechas inválido', 'error');
    vacations.push({ from, to, reason }); saveVac();
    if (fromEl) fromEl.value = ''; if (toEl) toEl.value = ''; if (reasonEl) reasonEl.value = '';
    renderVacations(); global.adminL2Core?.showToast('Rango de vacaciones guardado');
  }

  function init() {
    vacations = loadVac(); renderScheduleMatrix();
    global.AdminHolidays?.renderLabel('l2-holidays-label');
    const bh = document.getElementById('cfg-block-holidays');
    if (bh) {
      bh.checked = localStorage.getItem('tucu_l2_block_holidays') !== 'false';
      bh.addEventListener('change', () => { localStorage.setItem('tucu_l2_block_holidays', String(bh.checked)); renderHolidays(); });
    }
    renderHolidays();
    global.AdminHolidays?.loadHolidays().then(() => renderHolidays());
    renderVacations();
    const today = global.AdminShell?.localTodayStr?.() || '';
    const vStart = document.getElementById('vacation-start-date'), vEnd = document.getElementById('vacation-end-date');
    if (today && vStart) vStart.min = today; if (today && vEnd) vEnd.min = today;
    document.getElementById('btn-copy-mon-to-all')?.addEventListener('click', copyMonToAll);
    document.getElementById('btn-add-vacation')?.addEventListener('click', addVacation);
  }

  global.adminL2Schedule = { init, renderScheduleMatrix, toggleDay, toggleSplit, updateHour, copyMonToAll, renderHolidays, renderVacations, addVacation, removeVacation, getSchedule: () => weeklySchedule };
})(typeof window !== 'undefined' ? window : global);