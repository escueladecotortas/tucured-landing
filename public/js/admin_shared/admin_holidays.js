// Archivo: public/js/admin_shared/admin_holidays.js
// Módulo Compartido de Feriados Nacionales 2026 por Mes con Toggle Individual (<= 175 líneas)
(function (root) {
  const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const ALIAS_GROUPS = [
    ['barberia', 'peluqueria'], ['peluqueria_estetica', 'estetica'], ['salud_consultorio', 'salud'],
    ['deportes_clubes', 'deportes'], ['gastronomia', 'resto'], ['servicios']
  ];
  const memoryCache = {}, renderCbs = {};
  const getYear = () => new Date().getFullYear();

  const buildFallback = (year) => ([
    { fecha: `${year}-01-01`, nombre: 'Año Nuevo', tipo: 'inamovible' },
    { fecha: `${year}-02-16`, nombre: 'Carnaval (Lunes)', tipo: 'inamovible' },
    { fecha: `${year}-02-17`, nombre: 'Carnaval (Martes)', tipo: 'inamovible' },
    { fecha: `${year}-03-24`, nombre: 'Día de la Memoria', tipo: 'inamovible' },
    { fecha: `${year}-04-02`, nombre: 'Veteranos de Malvinas', tipo: 'inamovible' },
    { fecha: `${year}-04-03`, nombre: 'Viernes Santo', tipo: 'inamovible' },
    { fecha: `${year}-05-01`, nombre: 'Día del Trabajador', tipo: 'inamovible' },
    { fecha: `${year}-05-25`, nombre: 'Revolución de Mayo', tipo: 'inamovible' },
    { fecha: `${year}-06-15`, nombre: 'Paso a la Inmortalidad de Güemes', tipo: 'trasladable' },
    { fecha: `${year}-06-20`, nombre: 'Paso a la Inmortalidad de Belgrano', tipo: 'inamovible' },
    { fecha: `${year}-07-09`, nombre: 'Día de la Independencia', tipo: 'inamovible' },
    { fecha: `${year}-08-17`, nombre: 'Paso a la Inmortalidad de San Martín', tipo: 'trasladable' },
    { fecha: `${year}-10-12`, nombre: 'Diversidad Cultural', tipo: 'trasladable' },
    { fecha: `${year}-11-23`, nombre: 'Soberanía Nacional', tipo: 'trasladable' },
    { fecha: `${year}-12-08`, nombre: 'Inmaculada Concepción', tipo: 'inamovible' },
    { fecha: `${year}-12-25`, nombre: 'Navidad', tipo: 'inamovible' }
  ]);

  const normalizeItems = (raw, year) => (!Array.isArray(raw) || !raw.length) ? buildFallback(year) : raw.map(h => {
    if (h.fecha) return { fecha: String(h.fecha).slice(0, 10), nombre: h.nombre || 'Feriado Nacional', tipo: h.tipo || 'nacional' };
    return { fecha: `${year}-${String(h.mes || 1).padStart(2, '0')}-${String(h.dia || 1).padStart(2, '0')}`, nombre: h.motivo || h.nombre || 'Feriado Nacional', tipo: h.tipo || 'nacional' };
  });

  function getAliases(rubro) {
    const r = String(rubro || 'estetica').toLowerCase().trim();
    return ALIAS_GROUPS.find(g => g.includes(r)) || [r];
  }

  function readStateMap(level, rubro) {
    let merged = {};
    for (const r of getAliases(rubro)) {
      try { const p = JSON.parse(localStorage.getItem(`tucu_${level}_holidays_state_${r}`) || 'null'); if (p && typeof p === 'object') merged = { ...merged, ...p }; } catch (_) {}
    }
    return merged;
  }

  function writeStateMap(level, rubro, map) {
    for (const r of getAliases(rubro)) {
      try { localStorage.setItem(`tucu_${level}_holidays_state_${r}`, JSON.stringify(map)); } catch (_) {}
    }
  }

  async function loadHolidays(targetYear) {
    const year = Number(targetYear) || getYear();
    if (memoryCache[year]) return memoryCache[year];
    const cacheKey = `tucured_holidays_${year}`;
    try { const c = JSON.parse(localStorage.getItem(cacheKey) || 'null'); if (Array.isArray(c) && c.length >= 12) { memoryCache[year] = c; return c; } } catch (_) {}
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, tm = ctl ? setTimeout(() => ctl.abort(), 3000) : null;
    try {
      const res = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`, ctl ? { signal: ctl.signal } : {});
      if (tm) clearTimeout(tm);
      if (res.ok) { const norm = normalizeItems(await res.json(), year); memoryCache[year] = norm; try { localStorage.setItem(cacheKey, JSON.stringify(norm)); } catch (_) {} return norm; }
    } catch (_) { if (tm) clearTimeout(tm); }
    return (memoryCache[year] = buildFallback(year));
  }

  function getCachedHolidays(targetYear) {
    const year = Number(targetYear) || getYear();
    if (memoryCache[year]) return memoryCache[year];
    try { const p = JSON.parse(localStorage.getItem(`tucured_holidays_${year}`) || 'null'); if (Array.isArray(p) && p.length >= 12) return (memoryCache[year] = p); } catch (_) {}
    return buildFallback(year);
  }

  function getCombinedHolidays(level, year) {
    const map = new Map();
    getCachedHolidays(year).forEach(h => map.set(h.fecha, { fecha: h.fecha, nombre: h.nombre, custom: false }));
    if (level === 'l3') {
      try {
        const cust = JSON.parse(localStorage.getItem('tucu_l3_holidays') || '[]');
        (Array.isArray(cust) ? cust : []).filter(h => h && !h.deletedAt && h.date).forEach(h => {
          map.set(h.date, { fecha: h.date, nombre: h.desc || 'Feriado', custom: true, isException: !!h.isException });
        });
      } catch (_) {}
    }
    return Array.from(map.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  function isItemBlocked(level, rubro, dateStr, itemMeta = null) {
    const map = readStateMap(level, rubro);
    if (Object.prototype.hasOwnProperty.call(map, dateStr)) return map[dateStr] !== false;
    if (itemMeta && itemMeta.custom) return !itemMeta.isException;
    if (level === 'l3') {
      try {
        const cust = JSON.parse(localStorage.getItem('tucu_l3_holidays') || '[]');
        const hit = Array.isArray(cust) && cust.find(x => x && !x.deletedAt && x.date === dateStr);
        if (hit) return !hit.isException;
      } catch (_) {}
    }
    return true;
  }

  function isDateBlocked(level, rubro, dateStr) {
    const target = String(dateStr || '').slice(0, 10);
    if (!target) return false;
    if (level === 'l2' && localStorage.getItem('tucu_l2_block_holidays') === 'false') return false;
    const year = Number(target.slice(0, 4)) || getYear();
    const hit = getCombinedHolidays(level, year).find(h => h.fecha === target);
    return hit ? isItemBlocked(level, rubro, target, hit) : false;
  }

  function toggleHoliday(level, rubro, dateStr, containerId) {
    const target = String(dateStr || '').slice(0, 10);
    const map = readStateMap(level, rubro), nextBlocked = !isItemBlocked(level, rubro, target);
    map[target] = nextBlocked;
    writeStateMap(level, rubro, map);
    if (level === 'l3') {
      try {
        const cust = JSON.parse(localStorage.getItem('tucu_l3_holidays') || '[]');
        if (Array.isArray(cust) && cust.some(x => x && x.date === target)) {
          const upd = cust.map(x => x.date === target ? { ...x, isException: !nextBlocked } : x);
          localStorage.setItem('tucu_l3_holidays', JSON.stringify(upd));
          if (root.AdminL3Core?.state) root.AdminL3Core.state.holidays = upd;
        }
      } catch (_) {}
    }
    if (containerId) renderMonthlyList(containerId, level, rubro, renderCbs[containerId]);
    if (typeof renderCbs[containerId] === 'function') renderCbs[containerId](target, nextBlocked);
  }

  function renderMonthlyList(containerId, level = 'l2', rubro = 'estetica', onChangeCb = null) {
    const box = document.getElementById(containerId); if (!box) return;
    if (typeof onChangeCb === 'function') renderCbs[containerId] = onChangeCb;
    const year = getYear(), list = getCombinedHolidays(level, year);
    const globalOff = level === 'l2' && localStorage.getItem('tucu_l2_block_holidays') === 'false';
    const byMonth = new Map();
    list.forEach(h => {
      const mIdx = Math.max(0, Math.min(11, (parseInt(h.fecha.slice(5, 7), 10) || 1) - 1));
      if (!byMonth.has(mIdx)) byMonth.set(mIdx, []);
      byMonth.get(mIdx).push(h);
    });
    box.innerHTML = Array.from(byMonth.entries()).sort((a, b) => a[0] - b[0]).map(([mIdx, items]) => `
      <div data-holiday-month="${MONTHS_ES[mIdx]}" class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-[#D5CEC2] dark:border-stone-800 space-y-2 shadow-2xs">
        <div class="flex items-center justify-between border-b border-stone-200/70 dark:border-stone-800 pb-1.5">
          <span class="text-xs font-extrabold uppercase tracking-wider text-red-900 dark:text-red-400">${MONTHS_ES[mIdx]} ${year}</span>
          <span class="text-[10px] font-mono text-stone-500">${items.length}</span>
        </div>
        <div class="space-y-1.5">${items.map(h => {
          const blk = !globalOff && isItemBlocked(level, rubro, h.fecha, h);
          return `<div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800">
            <div class="min-w-0"><span class="block text-xs font-bold text-stone-800 dark:text-stone-100 truncate">${h.nombre}</span><span class="text-[10px] font-mono text-stone-500">${h.fecha}</span></div>
            <button type="button" data-holiday-toggle="${h.fecha}" onclick="AdminHolidays.toggleHoliday('${level}','${rubro}','${h.fecha}','${containerId}')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 cursor-pointer transition-colors ${blk ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'}">${blk ? 'Bloqueado' : 'Abierto'}</button>
          </div>`;
        }).join('')}</div>
      </div>`).join('');
  }

  function renderLabel(elOrId, prefix = 'Feriados Nacionales') {
    const el = typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
    if (el) el.textContent = `${prefix} ${getYear()}`;
  }
  const isHoliday = (dateStr) => getCachedHolidays(Number(String(dateStr || '').slice(0, 4)) || getYear()).some(h => h.fecha === String(dateStr || '').slice(0, 10));

  root.AdminHolidays = { getCurrentYear: getYear, loadHolidays, getCachedHolidays, renderLabel, isHoliday, buildFallback, isDateBlocked, toggleHoliday, renderMonthlyList };
})(window);