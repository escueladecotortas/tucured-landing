// Archivo: public/js/admin_shared/admin_weekly_schedule.js
// Módulo Compartido de Horarios Semanales (L1, L2 y L3): Template L2 Responsive sin Recorte (< 185L)

(function (global) {
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const DAY_NAMES = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
  const instances = new Map();

  function getDefaultSchedule() {
    const day = (en, close = '18:00') => ({ enabled: en, open: '09:00', close, isSplit: false, open2: '17:00', close2: '21:00' });
    return { 1: day(true), 2: day(true), 3: day(true), 4: day(true), 5: day(true), 6: day(true, '13:00'), 0: day(false, '13:00') };
  }

  function normalizeSchedule(raw) {
    const def = getDefaultSchedule(), out = {};
    DAY_ORDER.forEach((d) => { out[d] = { ...def[d], ...(raw && typeof raw === 'object' ? raw[d] || {} : {}) }; });
    return out;
  }

  function loadSchedule(storageKey = 'tucu_schedule', fallbackKeys = []) {
    const keys = [storageKey, ...(Array.isArray(fallbackKeys) ? fallbackKeys : [])].filter(Boolean);
    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') return normalizeSchedule(parsed);
        }
      } catch (_) {}
    }
    return getDefaultSchedule();
  }

  function saveSchedule(storageKey, data, mirrorKeys = []) {
    const normalized = normalizeSchedule(data), serialized = JSON.stringify(normalized);
    [storageKey, ...(Array.isArray(mirrorKeys) ? mirrorKeys : [])].filter(Boolean).forEach((k) => {
      try { localStorage.setItem(k, serialized); } catch (_) {}
    });
    return normalized;
  }

  function cloneMonToFri(schedule) {
    const next = normalizeSchedule(schedule), mon = JSON.parse(JSON.stringify(next[1]));
    [2, 3, 4, 5].forEach((d) => { next[d] = JSON.parse(JSON.stringify(mon)); });
    return next;
  }

  function timeField(day, field, label, val) {
    return `<div class="min-w-0"><label class="block text-[10px] text-stone-500 dark:text-stone-400 mb-0.5 truncate">${label}</label><input type="time" value="${val}" data-sched-action="updateHour" data-day="${day}" data-field="${field}" class="tucu-input w-full min-w-0 max-w-full !h-9 !px-1.5 sm:!px-2.5 tabular-nums text-stone-800 dark:text-stone-100"></div>`;
  }

  function renderDayCard(day, d) {
    const splitBtn = `<button type="button" data-sched-action="toggleSplit" data-day="${day}" class="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer shrink-0 ${d.isSplit ? 'tucu-primary-soft border' : 'admin-glass-pill'}">${d.isSplit ? 'Horario Partido' : 'Horario Corrido'}</button>`;
    const hoursHtml = !d.enabled ? '' : d.isSplit
      ? `<div class="grid grid-cols-1 xl:grid-cols-2 gap-2 pt-0.5 min-w-0">
          <div class="p-2 rounded-xl bg-white/80 dark:bg-stone-950/60 border border-[#D5CEC2]/80 dark:border-stone-800 space-y-1.5 min-w-0"><span class="block text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Mañana</span><div class="grid grid-cols-2 gap-2 min-w-0">${timeField(day, 'open', 'Apertura', d.open || '09:00')}${timeField(day, 'close', 'Cierre', d.close || '13:00')}</div></div>
          <div class="p-2 rounded-xl bg-white/80 dark:bg-stone-950/60 border border-[#D5CEC2]/80 dark:border-stone-800 space-y-1.5 min-w-0"><span class="block text-[9px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Tarde</span><div class="grid grid-cols-2 gap-2 min-w-0">${timeField(day, 'open2', 'Reapertura', d.open2 || '17:00')}${timeField(day, 'close2', 'Cierre Tarde', d.close2 || '21:00')}</div></div>
        </div>`
      : `<div class="grid grid-cols-2 gap-2 pt-0.5 min-w-0">${timeField(day, 'open', 'Apertura', d.open || '09:00')}${timeField(day, 'close', 'Cierre', d.close || '18:00')}</div>`;
    return `<div data-schedule-day="${day}" class="p-3 sm:p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/60 border border-[#D5CEC2] dark:border-stone-800 space-y-2.5 min-w-0 overflow-hidden">
      <div class="flex items-center justify-between gap-2 min-w-0">
        <label class="flex items-center gap-2.5 min-w-0 cursor-pointer select-none"><input type="checkbox" data-sched-action="toggleDay" data-day="${day}" ${d.enabled ? 'checked' : ''} class="w-4 h-4 rounded tucu-accent-input cursor-pointer shrink-0"><span class="text-xs font-bold truncate ${d.enabled ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}">${DAY_NAMES[day]}</span></label>
        ${d.enabled ? splitBtn : '<span class="text-[10px] font-semibold text-stone-400 shrink-0">Cerrado</span>'}
      </div>${hoursHtml}
    </div>`;
  }

  function renderInstance(inst) {
    const box = document.getElementById(inst.containerId); if (!box) return;
    box.innerHTML = `<div data-weekly-schedule-card="${inst.level}" class="admin-card tucu-card space-y-4 overflow-hidden">
      <div class="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 flex-wrap gap-2">
        <div class="min-w-0"><h3 class="text-sm font-bold text-stone-800 dark:text-stone-200 font-title">${inst.title}</h3><p class="text-xs text-stone-500">${inst.subtitle}</p></div>
        <button type="button" data-clone-lun-vie class="tucu-btn admin-glass-btn shrink-0">Clonar Lun a Vie</button>
      </div>
      <div class="grid grid-cols-1 gap-2.5 min-w-0">${DAY_ORDER.map((day) => renderDayCard(day, inst.schedule[day])).join('')}</div>
    </div>`;
  }

  function bindContainer(box, containerId) {
    if (!box || box.dataset.tucuSchedBound === '1') return;
    box.dataset.tucuSchedBound = '1';
    box.addEventListener('click', (e) => {
      const inst = instances.get(containerId); if (!inst) return;
      if (e.target.closest('[data-clone-lun-vie]')) { inst.cloneLunVie(); return; }
      const splitBtn = e.target.closest('[data-sched-action="toggleSplit"]');
      if (splitBtn) inst.toggleSplit(Number(splitBtn.dataset.day));
    });
    box.addEventListener('change', (e) => {
      const inst = instances.get(containerId); if (!inst) return;
      const el = e.target.closest('[data-sched-action]'); if (!el) return;
      const act = el.dataset.schedAction, day = Number(el.dataset.day);
      if (act === 'toggleDay') inst.toggleDay(day, el.checked);
      else if (act === 'updateHour') inst.updateHour(day, el.dataset.field, el.value);
    });
  }

  function mount(opts = {}) {
    const containerId = opts.containerId; if (!containerId) return null;
    const box = document.getElementById(containerId); if (!box) return null;
    const storageKey = opts.storageKey || 'tucu_schedule';
    const fallbackKeys = opts.fallbackKeys || [], mirrorKeys = opts.mirrorKeys || [];
    const inst = {
      containerId, storageKey, fallbackKeys, mirrorKeys,
      level: opts.level || '', title: opts.title || 'Horarios Semanales',
      subtitle: opts.subtitle || 'Configuración con soporte de turno corrido o partido',
      onChange: typeof opts.onChange === 'function' ? opts.onChange : null,
      schedule: loadSchedule(storageKey, fallbackKeys),
      commit(meta) {
        inst.schedule = saveSchedule(inst.storageKey, inst.schedule, inst.mirrorKeys);
        if (meta.render !== false) renderInstance(inst);
        inst.onChange?.(inst.schedule, meta);
      },
      toggleDay(day, enabled) { if (inst.schedule[day]) { inst.schedule[day].enabled = !!enabled; inst.commit({ action: 'toggleDay', day }); } },
      toggleSplit(day) { if (inst.schedule[day]) { inst.schedule[day].isSplit = !inst.schedule[day].isSplit; inst.commit({ action: 'toggleSplit', day }); } },
      updateHour(day, field, val) { if (inst.schedule[day] && field) { inst.schedule[day][field] = val; inst.commit({ action: 'updateHour', day, field, value: val, render: false }); } },
      cloneLunVie() { inst.schedule = cloneMonToFri(inst.schedule); inst.commit({ action: 'cloneLunVie' }); },
      getSchedule: () => inst.schedule,
      render: () => renderInstance(inst)
    };
    instances.set(containerId, inst); bindContainer(box, containerId); renderInstance(inst);
    return { getSchedule: inst.getSchedule, cloneLunVie: inst.cloneLunVie, toggleDay: inst.toggleDay, toggleSplit: inst.toggleSplit, updateHour: inst.updateHour, render: inst.render };
  }

  global.TucuWeeklySchedule = { mount, loadSchedule, saveSchedule, getDefaultSchedule, cloneMonToFri };
})(typeof window !== 'undefined' ? window : global);
