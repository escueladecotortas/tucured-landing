// Archivo: public/js/activar/activar_schedule.js
// Grilla Independiente de 7 Días (Lun-Dom) con Corrido/Partido y Copiar Lunes a Mar-Vie (< 155L)

window.TucuActivarSchedule = (function () {
  const DAYS = [
    { key: 'Lun', label: 'Lunes', open: true },
    { key: 'Mar', label: 'Martes', open: true },
    { key: 'Mié', label: 'Miércoles', open: true },
    { key: 'Jue', label: 'Jueves', open: true },
    { key: 'Vie', label: 'Viernes', open: true },
    { key: 'Sáb', label: 'Sábado', open: true },
    { key: 'Dom', label: 'Domingo', open: false }
  ];
  const INTERVALS = [15, 20, 30, 45, 60];
  const TIME_CLS = 'w-full px-2 py-1.5 rounded-lg bg-white border border-[#D5CEC2] focus:border-[#EA580C] outline-none text-xs font-mono text-[#1C1917]';

  function renderDayRow(day, defaultMode) {
    const isPartido = defaultMode === 'partido';
    const mTo = isPartido ? '13:00' : '18:00';
    return `<div class="act-day-row p-3 rounded-2xl bg-[#FAF7F2] border border-[#D5CEC2] space-y-2" data-day-key="${day.key}">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="act-day-open w-4 h-4 accent-[#EA580C] rounded" ${day.open ? 'checked' : ''} />
            <span class="text-xs sm:text-sm font-bold text-[#1C1917] w-20">${day.label}</span>
          </label>
          <span class="act-day-closed-tag ${day.open ? 'hidden' : ''} text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">Cerrado</span>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <select class="act-day-mode tucu-clean-select px-2.5 py-1.5 rounded-xl bg-white border border-[#D5CEC2] text-xs font-semibold text-[#1C1917] cursor-pointer ${day.open ? '' : 'hidden'}">
            <option value="corrido" ${!isPartido ? 'selected' : ''}>Corrido</option>
            <option value="partido" ${isPartido ? 'selected' : ''}>Partido (siesta)</option>
          </select>
          ${day.key === 'Lun' ? '<button type="button" id="btn-copy-mon-fri" class="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#EA580C] text-[11px] font-bold cursor-pointer transition-colors">Copiar Lunes a Mar–Vie</button>' : ''}
        </div>
      </div>
      <div class="act-day-hours ${day.open ? '' : 'hidden'} grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-semibold text-stone-500 w-14 shrink-0">Mañana</span>
          <input type="time" class="act-m-from ${TIME_CLS}" value="09:00" />
          <span class="text-xs text-stone-400">a</span>
          <input type="time" class="act-m-to ${TIME_CLS}" value="${mTo}" />
        </div>
        <div class="act-tarde-fields ${isPartido ? 'flex' : 'hidden'} items-center gap-1.5">
          <span class="text-[11px] font-semibold text-stone-500 w-14 shrink-0">Tarde</span>
          <input type="time" class="act-t-from ${TIME_CLS}" value="17:00" />
          <span class="text-xs text-stone-400">a</span>
          <input type="time" class="act-t-to ${TIME_CLS}" value="21:00" />
        </div>
      </div>
    </div>`;
  }

  function syncRow(row) {
    const isOpen = Boolean(row.querySelector('.act-day-open')?.checked);
    const modeSel = row.querySelector('.act-day-mode');
    const mode = modeSel?.value || 'corrido';
    row.querySelector('.act-day-closed-tag')?.classList.toggle('hidden', isOpen);
    modeSel?.classList.toggle('hidden', !isOpen);
    row.querySelector('.act-day-hours')?.classList.toggle('hidden', !isOpen);
    const tardeEl = row.querySelector('.act-tarde-fields');
    if (tardeEl) {
      tardeEl.classList.toggle('hidden', mode !== 'partido');
      tardeEl.classList.toggle('flex', mode === 'partido');
    }
  }

  function mount(containerEl, initialMode = 'corrido') {
    if (!containerEl) return;
    const mode = initialMode === 'partido' ? 'partido' : 'corrido';
    containerEl.innerHTML = `
      <div class="space-y-2.5">${DAYS.map(d => renderDayRow(d, mode)).join('')}</div>
      <div class="pt-2 border-t border-[#D5CEC2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label for="act-intervalo" class="text-xs font-bold text-[#1C1917]">Duración base de cada turno (intervalo en agenda)</label>
        <div class="relative w-full sm:w-44">
          <select id="act-intervalo" class="tucu-clean-select w-full px-3.5 py-2 pr-9 rounded-xl bg-[#FAF7F2] border border-[#D5CEC2] focus:border-[#EA580C] outline-none text-xs font-bold text-[#1C1917] cursor-pointer">
            ${INTERVALS.map(i => `<option value="${i}" ${i === 30 ? 'selected' : ''}>Cada ${i} min</option>`).join('')}
          </select>
          <svg class="w-4 h-4 text-stone-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4"/></svg>
        </div>
      </div>`;

    containerEl.querySelectorAll('.act-day-row').forEach(row => {
      row.querySelector('.act-day-open')?.addEventListener('change', () => syncRow(row));
      row.querySelector('.act-day-mode')?.addEventListener('change', (e) => {
        const mTo = row.querySelector('.act-m-to');
        if (mTo && !mTo.dataset.touched) mTo.value = e.target.value === 'partido' ? '13:00' : '18:00';
        syncRow(row);
      });
      row.querySelector('.act-m-to')?.addEventListener('input', (e) => { e.target.dataset.touched = '1'; });
    });

    const copyBtn = containerEl.querySelector('#btn-copy-mon-fri');
    copyBtn?.addEventListener('click', () => {
      const mon = containerEl.querySelector('.act-day-row[data-day-key="Lun"]');
      if (!mon) return;
      const open = mon.querySelector('.act-day-open').checked;
      const md = mon.querySelector('.act-day-mode').value;
      const mf = mon.querySelector('.act-m-from').value, mt = mon.querySelector('.act-m-to').value;
      const tf = mon.querySelector('.act-t-from').value, tt = mon.querySelector('.act-t-to').value;
      ['Mar', 'Mié', 'Jue', 'Vie'].forEach(k => {
        const target = containerEl.querySelector(`.act-day-row[data-day-key="${k}"]`);
        if (!target) return;
        target.querySelector('.act-day-open').checked = open;
        target.querySelector('.act-day-mode').value = md;
        target.querySelector('.act-m-from').value = mf;
        target.querySelector('.act-m-to').value = mt;
        target.querySelector('.act-t-from').value = tf;
        target.querySelector('.act-t-to').value = tt;
        syncRow(target);
      });
      copyBtn.textContent = '✓ Copiado a Mar–Vie';
      setTimeout(() => { copyBtn.textContent = 'Copiar Lunes a Mar–Vie'; }, 1800);
    });
  }

  function serializeSchedule() {
    const rows = [...document.querySelectorAll('.act-day-row')];
    let openCount = 0;
    const lines = rows.map(row => {
      const key = row.dataset.dayKey || '';
      const isOpen = Boolean(row.querySelector('.act-day-open')?.checked);
      if (!isOpen) return `${key}: Cerrado`;
      openCount++;
      const md = row.querySelector('.act-day-mode')?.value || 'corrido';
      const mf = row.querySelector('.act-m-from')?.value || '09:00';
      const mt = row.querySelector('.act-m-to')?.value || '18:00';
      if (md === 'partido') {
        const tf = row.querySelector('.act-t-from')?.value || '17:00';
        const tt = row.querySelector('.act-t-to')?.value || '21:00';
        return `${key}: ${mf}-${mt} y ${tf}-${tt}`;
      }
      return `${key}: ${mf}-${mt}`;
    });
    const intervalo = document.getElementById('act-intervalo')?.value || '30';
    return { valid: openCount > 0, openCount, text: lines.join('\n'), intervalo };
  }

  return { mount, serializeSchedule, DAYS, INTERVALS };
})();
