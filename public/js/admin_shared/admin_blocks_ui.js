// Archivo: public/js/admin_shared/admin_blocks_ui.js
// Módulo Compartido de Bloqueos (Prestación + Fechas/Vacaciones) sin Recortes L3 (< 160L)

(function (global) {
  const instances = new Map();
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  function renderHtml(inst) {
    const { level, today, services, serviceBlocks, dateBlocks } = inst;
    const srvOpts = (services || []).map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('') || '<option value="">Sin servicios</option>';
    const srvList = (serviceBlocks || []).length
      ? serviceBlocks.map((b) => `<div class="p-3 rounded-xl bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 flex items-center justify-between gap-2 text-xs min-w-0">
          <div class="min-w-0"><p class="font-bold tucu-primary-text truncate">${esc(b.serviceName)}</p><p class="tabular-nums text-[11px] text-stone-500">${esc(b.date)} · <strong class="text-stone-700 dark:text-stone-200">${esc(b.start)} a ${esc(b.end)} hs</strong></p></div>
          <button type="button" data-blocks-action="deleteServiceBlock" data-id="${esc(b.id)}" class="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0">Eliminar</button>
        </div>`).join('')
      : '<p class="text-xs text-stone-400 italic py-1.5">No hay franjas bloqueadas por prestación.</p>';

    const activeDates = (dateBlocks || []).filter((h) => h && !h.deletedAt && h.date);
    const dateList = activeDates.length
      ? activeDates.map((h) => `<div class="p-3 rounded-xl bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 flex items-center justify-between gap-2 text-xs min-w-0">
          <div class="min-w-0"><p class="font-bold text-amber-700 dark:text-amber-400 truncate">${esc(h.desc || 'Cierre Especial')}</p><p class="tabular-nums text-[11px] text-stone-500">${esc(h.date)}</p></div>
          <button type="button" data-blocks-action="deleteDateBlock" data-date="${esc(h.date)}" class="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0">Eliminar</button>
        </div>`).join('')
      : '<p class="text-xs text-stone-400 italic py-1.5">No hay cierres especiales programados.</p>';

    return `<div class="space-y-5">
      <div data-blocks-service-card="${esc(level)}" class="admin-card tucu-card space-y-4 overflow-hidden">
        <div class="pb-2 border-b border-stone-100 dark:border-stone-800"><h3 class="text-sm font-bold text-stone-900 dark:text-stone-100 font-title">Bloqueo de Horarios por Prestación</h3><p class="text-xs text-stone-500">Bloqueo preventivo de una franja horaria puntual para un servicio</p></div>
        <div class="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 space-y-3 min-w-0">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
            <div class="min-w-0"><label for="sb-srv" class="block text-[10px] font-semibold text-stone-500 mb-1">Prestación</label><select id="sb-srv" class="tucu-input w-full min-w-0">${srvOpts}</select></div>
            <div class="min-w-0"><label for="sb-date" class="block text-[10px] font-semibold text-stone-500 mb-1">Fecha</label><input type="date" id="sb-date" min="${esc(today)}" class="tucu-input w-full min-w-0 max-w-full tabular-nums"></div>
          </div>
          <div class="grid grid-cols-2 gap-2.5 min-w-0">
            <div class="min-w-0"><label for="sb-start" class="block text-[10px] font-semibold text-stone-500 mb-1">Desde</label><input type="time" id="sb-start" value="12:00" class="tucu-input w-full min-w-0 max-w-full !px-2 tabular-nums"></div>
            <div class="min-w-0"><label for="sb-end" class="block text-[10px] font-semibold text-stone-500 mb-1">Hasta</label><input type="time" id="sb-end" value="16:00" class="tucu-input w-full min-w-0 max-w-full !px-2 tabular-nums"></div>
          </div>
          <div class="flex justify-end"><button type="button" id="btn-add-service-block" data-blocks-action="addServiceBlock" class="tucu-btn admin-glass-primary w-full sm:w-auto"><span>Bloquear Rango</span></button></div>
        </div>
        <div id="l3-blocks-list" class="space-y-2">${srvList}</div>
      </div>
      <div data-blocks-date-card="${esc(level)}" class="admin-card tucu-card space-y-4 overflow-hidden">
        <div class="pb-2 border-b border-stone-100 dark:border-stone-800"><h3 class="text-sm font-bold text-stone-900 dark:text-stone-100 font-title">Bloqueos / Vacaciones por Fecha</h3><p class="text-xs text-stone-500">Cierres temporales por mantenimiento, reformas o descanso del local</p></div>
        <div class="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 space-y-3 min-w-0">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
            <div class="min-w-0"><label for="new-hol-date" class="block text-[10px] font-semibold text-stone-500 mb-1">Fecha</label><input type="date" id="new-hol-date" min="${esc(today)}" class="tucu-input w-full min-w-0 max-w-full tabular-nums"></div>
            <div class="min-w-0"><label for="new-hol-desc" class="block text-[10px] font-semibold text-stone-500 mb-1">Motivo</label><input type="text" id="new-hol-desc" placeholder="Ej. Mantenimiento o vacaciones..." class="tucu-input w-full min-w-0"></div>
          </div>
          <div class="flex justify-end"><button type="button" id="btn-add-date-block" data-blocks-action="addDateBlock" class="tucu-btn admin-glass-primary w-full sm:w-auto"><span>Bloquear Fecha</span></button></div>
        </div>
        <div id="l3-date-blocks-list" class="space-y-2">${dateList}</div>
      </div>
    </div>`;
  }

  function bindEvents(box, containerId) {
    if (!box || box.dataset.tucuBlocksBound === '1') return;
    box.dataset.tucuBlocksBound = '1';
    box.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-blocks-action]'), inst = instances.get(containerId);
      if (!btn || !inst) return;
      const act = btn.dataset.blocksAction;
      if (act === 'addServiceBlock') inst.onAddServiceBlock?.();
      else if (act === 'deleteServiceBlock') inst.onDeleteServiceBlock?.(btn.dataset.id);
      else if (act === 'addDateBlock') inst.onAddDateBlock?.();
      else if (act === 'deleteDateBlock') inst.onDeleteDateBlock?.(btn.dataset.date);
    });
  }

  function mount(opts = {}) {
    const box = document.getElementById(opts.containerId); if (!box) return null;
    const inst = {
      level: opts.level || 'l3', today: opts.today || '', services: opts.services || [],
      serviceBlocks: opts.serviceBlocks || [], dateBlocks: opts.dateBlocks || [],
      onAddServiceBlock: opts.onAddServiceBlock, onDeleteServiceBlock: opts.onDeleteServiceBlock,
      onAddDateBlock: opts.onAddDateBlock, onDeleteDateBlock: opts.onDeleteDateBlock
    };
    instances.set(opts.containerId, inst); bindEvents(box, opts.containerId);
    box.innerHTML = renderHtml(inst);
    return inst;
  }

  global.TucuBlocksUI = { mount };
})(typeof window !== 'undefined' ? window : global);
