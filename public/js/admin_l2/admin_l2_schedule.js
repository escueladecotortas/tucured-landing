// Archivo: public/js/admin_l2/admin_l2_schedule.js
// Cronograma L2: Módulo Compartido Horarios Semanales, Feriados 2026 & Vacaciones (< 75 líneas)

(function (global) {
  const vacKey = () => `tucu_l2_vacations_${localStorage.getItem('tucu_l2_rubro') || 'estetica'}`;
  const loadVac = () => { try { return JSON.parse(localStorage.getItem(vacKey()) || localStorage.getItem('tucu_l2_vacations') || '[]'); } catch (_) { return []; } };
  const saveVac = () => { try { localStorage.setItem(vacKey(), JSON.stringify(vacations)); localStorage.setItem('tucu_l2_vacations', JSON.stringify(vacations)); } catch (_) {} };

  let scheduleCtrl = null;
  let weeklySchedule = global.TucuWeeklySchedule?.loadSchedule?.('tucu_schedule') || {};
  let vacations = loadVac();

  function renderScheduleMatrix() {
    scheduleCtrl = global.TucuWeeklySchedule?.mount?.({
      containerId: 'l2-weekly-schedule-container', storageKey: 'tucu_schedule', level: 'l2',
      onChange: (next, meta) => {
        weeklySchedule = next;
        if (meta?.action === 'cloneLunVie') global.adminL2Core?.showToast('Horarios de Lunes copiados a días hábiles');
      }
    }) || scheduleCtrl;
    if (scheduleCtrl?.getSchedule) weeklySchedule = scheduleCtrl.getSchedule();
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
        <div><span class="font-bold text-amber-700 dark:text-amber-400">${v.reason || 'Cierre Temporal'}</span><p class="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">${v.from} al ${v.to}</p></div>
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
    vacations = loadVac(); renderScheduleMatrix(); renderHolidays();
    global.AdminHolidays?.loadHolidays().then(() => renderHolidays()); renderVacations();
    const today = global.AdminShell?.localTodayStr?.() || '';
    const vStart = document.getElementById('vacation-start-date'), vEnd = document.getElementById('vacation-end-date');
    if (today && vStart) vStart.min = today; if (today && vEnd) vEnd.min = today;
    document.getElementById('btn-add-vacation')?.addEventListener('click', addVacation);
  }

  global.adminL2Schedule = {
    init, renderScheduleMatrix, renderHolidays, renderVacations, addVacation, removeVacation,
    toggleDay: (d, en) => scheduleCtrl?.toggleDay(d, en), toggleSplit: (d) => scheduleCtrl?.toggleSplit(d),
    updateHour: (d, f, v) => scheduleCtrl?.updateHour(d, f, v), copyMonToAll: () => scheduleCtrl?.cloneLunVie(),
    getSchedule: () => scheduleCtrl?.getSchedule?.() || weeklySchedule
  };
})(typeof window !== 'undefined' ? window : global);
