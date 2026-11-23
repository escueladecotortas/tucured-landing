// Archivo: public/js/admin_l3/view_system.js
// Configuración L3 en 3 Pestañas Unificadas + Módulos Compartidos Horarios & Bloqueos (< 165L)

window.AdminL3System = (function () {
  const normR = (r) => window.AdminL3Core.NORM_RUBRO?.[r] || r;
  const waOpts = () => ({ mountId: 'l3-wa-config-mount', level: 'l3', bizInputId: 'cfg-biz-name', addressInputId: 'cfg-biz-address', aliasInputId: 'l3-input-alias', cbuInputId: 'l3-input-cbu' });
  const configTabs = ['identidad', 'agenda', 'wa'];
  let activeConfigTab = 'identidad';

  function switchConfigTab(target) {
    if (configTabs.includes(target)) activeConfigTab = target;
    configTabs.forEach(t => {
      const btn = document.getElementById('tab-btn-' + t), sec = document.getElementById('config-content-' + t), isAct = t === activeConfigTab;
      if (btn) { btn.className = isAct ? 'config-tab-btn tucu-chip is-active' : 'config-tab-btn tucu-chip'; btn.setAttribute('aria-selected', String(isAct)); }
      if (sec) sec.classList.toggle('hidden', !isAct);
    });
  }

  function renderMonthlyHolidays(rubro) {
    window.AdminHolidays?.renderMonthlyList?.('l3-holidays-monthly-container', 'l3', rubro, (_, blk) => {
      window.AdminL3Core.showToast(blk ? 'Feriado bloqueado en agenda' : 'Feriado abierto para atender');
    });
  }

  function render(container, state) {
    const cfg = state.config || { maxAdvanceDays: 14, maxActivePerUser: 2, coords: '' };
    const blocks = (state.blocks || []).filter(b => !b.deletedAt);
    const services = (state.services || []).filter(s => (window.AdminShell ? window.AdminShell.isServiceAvailable(s) : !s.deletedAt && s.active !== false));
    const curYear = window.AdminHolidays ? window.AdminHolidays.getCurrentYear() : new Date().getFullYear();
    const today = window.AdminShell ? window.AdminShell.localTodayStr() : '', nr = normR(state.rubro);
    const payCfg = window.AdminL3Core.getStorage(`tucu_l3_pay_cfg_${state.rubro}`, window.AdminL3Core.getStorage(`tucu_l3_pay_cfg_${nr}`, {}));
    const engCfg = window.AdminBookingEngine?.getConfig?.('l3') || {}, seedMeta = window.AdminDemoSeed?.getRubroMeta?.(nr);
    const aliasVal = payCfg.alias || localStorage.getItem(`tucu_l3_alias_${state.rubro}`) || engCfg.alias || seedMeta?.alias || 'brava.barberia.mp';
    const cbuVal = payCfg.cbu || localStorage.getItem(`tucu_l3_cbu_${state.rubro}`) || engCfg.cbu || '0000003100012345678901';
    const rem24 = payCfg.reminders?.h24 ?? engCfg.reminders?.h24 ?? true, rem2 = payCfg.rem2h ?? payCfg.reminders?.h2 ?? engCfg.reminders?.h2 ?? true;
    const p = state.presets[state.rubro] || {};
    const bizName = localStorage.getItem(`tucu_l3_biz_name_${state.rubro}`) || localStorage.getItem('tucu_l3_biz_name') || p.name || 'Brava Barbería';
    const bizAddr = localStorage.getItem(`tucu_l3_address_${state.rubro}`) || localStorage.getItem('tucu_l3_address') || p.address || '25 de Mayo 480, S. M. de Tucumán';
    const bizCoords = localStorage.getItem(`tucu_l3_coords_${state.rubro}`) || localStorage.getItem(`tucu_l3_coords_${nr}`) || localStorage.getItem('tucu_l3_coords') || cfg.coords || '';
    const isTab = (t) => activeConfigTab === t, tabCls = (t) => `config-tab-btn tucu-chip${isTab(t) ? ' is-active' : ''}`;

    container.innerHTML = `<div class="space-y-5">
      <div id="config-tabs-bar" class="tucu-quick-strip gap-2 border-b border-[#D5CEC2] dark:border-stone-800 pb-3" role="tablist"><button type="button" id="tab-btn-identidad" data-config-tab="identidad" role="tab" aria-selected="${isTab('identidad')}" onclick="AdminL3System.switchConfigTab('identidad')" class="${tabCls('identidad')}"><span>Negocio &amp; Pagos</span></button><button type="button" id="tab-btn-agenda" data-config-tab="agenda" role="tab" aria-selected="${isTab('agenda')}" onclick="AdminL3System.switchConfigTab('agenda')" class="${tabCls('agenda')}"><span>Horarios &amp; Feriados</span></button><button type="button" id="tab-btn-wa" data-config-tab="wa" role="tab" aria-selected="${isTab('wa')}" onclick="AdminL3System.switchConfigTab('wa')" class="${tabCls('wa')}"><span>WhatsApp &amp; Mensajes</span></button></div>
      <div id="config-content-identidad" class="space-y-5${isTab('identidad') ? '' : ' hidden'}">
        <div class="admin-card tucu-card space-y-4">
          <div class="pb-3 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Identidad & Parámetros del Comercio</h3><p class="text-xs text-stone-500">Nombre, dirección, coordenadas y reglas visibles en comprobantes online y WhatsApp.</p></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-3"><div><label for="cfg-biz-name" class="block text-stone-500 text-xs mb-1 font-semibold">Nombre del Comercio:</label><input type="text" id="cfg-biz-name" value="${bizName}" class="tucu-input w-full"></div><div class="grid grid-cols-2 gap-2"><div><label for="cfg-days" class="block text-stone-500 text-xs mb-1 font-semibold">Días Máx. Anticipación:</label><input type="number" id="cfg-days" value="${cfg.maxAdvanceDays || 14}" class="tucu-input w-full tabular-nums"></div><div><label for="cfg-maxuser" class="block text-stone-500 text-xs mb-1 font-semibold">Límite por Cliente:</label><input type="number" id="cfg-maxuser" value="${cfg.maxActivePerUser || 2}" class="tucu-input w-full tabular-nums"></div></div></div>
            <div class="space-y-3"><div><label for="cfg-biz-address" class="block text-stone-500 text-xs mb-1 font-semibold">Dirección del Local:</label><input type="text" id="cfg-biz-address" value="${bizAddr}" class="tucu-input w-full"></div><div><label for="cfg-biz-coords" class="block text-stone-500 text-xs mb-1 font-semibold">Coordenadas (Lat, Lng):</label><input type="text" id="cfg-biz-coords" value="${bizCoords}" placeholder="-26.8241, -65.2226" class="tucu-input w-full tabular-nums"></div></div>
          </div>
          <button type="button" onclick="AdminL3System.saveConfig()" class="tucu-btn w-full admin-glass-primary">Guardar Identidad y Parámetros</button>
        </div>
        <div class="admin-card tucu-card space-y-4"><div class="pb-3 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Señas & Medios de Pago Activos</h3><p class="text-xs text-stone-500">Alias/CBU por rubro, porcentaje o monto fijo de seña y medios habilitados.</p></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label for="l3-input-alias" class="block text-stone-500 text-xs mb-1 font-semibold">Alias Transferencia (MP / Banco):</label><div class="flex gap-1.5"><input type="text" id="l3-input-alias" value="${aliasVal}" class="tucu-input flex-1 min-w-0 tabular-nums"><button type="button" id="btn-l3-copy-alias" onclick="AdminL3System.copyAlias()" class="tucu-btn admin-glass-btn shrink-0">Copiar</button></div></div><div><label for="l3-input-cbu" class="block text-stone-500 text-xs mb-1 font-semibold">CBU / CVU (22 dígitos):</label><input type="text" id="l3-input-cbu" maxlength="22" value="${cbuVal}" class="tucu-input w-full tabular-nums"></div></div>
          <div id="l3-payment-config-mount"></div>
        </div>
      </div>
      <div id="config-content-agenda" class="space-y-5${isTab('agenda') ? '' : ' hidden'}">
        <div id="l3-weekly-schedule-container"></div><div id="l3-holidays-monthly-container"></div><div id="l3-blocks-mount"></div>
      </div>
      <div id="config-content-wa" class="space-y-5${isTab('wa') ? '' : ' hidden'}">
        <div class="admin-card tucu-card space-y-4"><div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-800"><div><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">WhatsApp & Plantillas de Notificación</h3><p class="text-xs text-stone-500">Recordatorios automáticos, vinculación QR de WhatsApp y plantillas por reserva.</p></div><button type="button" id="btn-l3-open-qr" onclick="AdminL3System.openBaileysModal()" class="tucu-btn admin-glass-btn">Vincular QR de WhatsApp</button></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><label class="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs font-semibold cursor-pointer"><input type="checkbox" id="l3-rem-24h" ${rem24 ? 'checked' : ''} class="tucu-accent-input"><span>Recordatorio 24 hs antes</span></label><label class="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs font-semibold cursor-pointer"><input type="checkbox" id="l3-rem-2h" ${rem2 ? 'checked' : ''} class="tucu-accent-input"><span>Recordatorio 2 hs antes</span></label></div>
          <div id="l3-wa-config-mount"></div>
        </div>
      </div>
    </div>`;

    window.TucuWeeklySchedule?.mount?.({
      containerId: 'l3-weekly-schedule-container', storageKey: `tucu_l3_schedule_${state.rubro}`,
      fallbackKeys: [`tucu_l3_schedule_${nr}`, 'tucu_l3_schedule'], mirrorKeys: [`tucu_l3_schedule_${nr}`, 'tucu_l3_schedule'], level: 'l3',
      onChange: (next, meta) => { state.config = { ...(state.config || {}), schedule: next }; window.AdminL3Core.setStorage(`tucu_l3_config_${state.rubro}`, state.config); if (meta?.action === 'cloneLunVie') window.AdminL3Core.showToast('Horarios de Lunes copiados a días hábiles'); }
    });
    renderMonthlyHolidays(state.rubro);
    window.TucuBlocksUI?.mount?.({
      containerId: 'l3-blocks-mount', level: 'l3', today, services, serviceBlocks: blocks, dateBlocks: state.holidays || [],
      onAddServiceBlock: addServiceBlock, onDeleteServiceBlock: deleteBlock, onAddDateBlock: addCustomHoliday, onDeleteDateBlock: deleteCustomHoliday
    });
    window.AdminHolidays?.loadHolidays?.(curYear).then(() => renderMonthlyHolidays(state.rubro));
    window.AdminBookingEngine?.mountPaymentConfigPanel({ mountId: 'l3-payment-config-mount', level: 'l3', includeDepositRule: true, onChange: () => { window.AdminL3Core.showToast('Reglas de seña actualizadas'); window.AdminWaTemplates?.renderPreview?.(waOpts()); }, onResetDemo: () => window.AdminL3Core.resetDemoBookings() });
    window.AdminWaTemplates?.mount?.(waOpts());
    ['cfg-biz-name', 'cfg-biz-address', 'cfg-biz-coords', 'l3-input-alias', 'l3-input-cbu', 'l3-rem-24h', 'l3-rem-2h'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener('input', () => { persistIdentity(); syncPayKeys(); window.AdminWaTemplates?.renderPreview?.(waOpts()); }); el.addEventListener('change', () => { persistIdentity(); syncPayKeys(); window.AdminWaTemplates?.renderPreview?.(waOpts()); }); }
    });
  }

  function persistIdentity() {
    const st = window.AdminL3Core.state, p = st.presets[st.rubro] || {}, nr = normR(st.rubro);
    const biz = document.getElementById('cfg-biz-name')?.value?.trim() || p.name || 'Brava Barbería';
    const addr = document.getElementById('cfg-biz-address')?.value?.trim() || p.address || '25 de Mayo 480, S. M. de Tucumán';
    const coords = document.getElementById('cfg-biz-coords')?.value?.trim() || '';
    try { localStorage.setItem('tucu_l3_biz_name', biz); localStorage.setItem(`tucu_l3_biz_name_${st.rubro}`, biz); localStorage.setItem('tucu_l3_address', addr); localStorage.setItem(`tucu_l3_address_${st.rubro}`, addr); localStorage.setItem('tucu_l3_coords', coords); localStorage.setItem(`tucu_l3_coords_${st.rubro}`, coords); localStorage.setItem(`tucu_l3_coords_${nr}`, coords); } catch (_) {}
    const config = { ...(st.config || {}), maxAdvanceDays: parseInt(document.getElementById('cfg-days')?.value, 10) || 14, maxActivePerUser: parseInt(document.getElementById('cfg-maxuser')?.value, 10) || 2, coords };
    window.AdminL3Core.setStorage(`tucu_l3_config_${st.rubro}`, config); st.config = config;
    const bt = document.getElementById('l3-brand-title'); if (bt) bt.innerText = biz;
    return { biz, addr, coords };
  }

  function syncPayKeys() {
    const st = window.AdminL3Core.state, nr = normR(st.rubro);
    const alias = document.getElementById('l3-input-alias')?.value?.trim() || 'brava.barberia.mp';
    const cbu = (document.getElementById('l3-input-cbu')?.value || '').replace(/\D/g, '').slice(0, 22) || '0000003100012345678901';
    const reminders = { h24: document.getElementById('l3-rem-24h')?.checked !== false, h2: document.getElementById('l3-rem-2h')?.checked !== false };
    const payCfg = { alias, cbu, rem2h: reminders.h2, reminders };
    try { window.AdminL3Core.setStorage(`tucu_l3_pay_cfg_${st.rubro}`, payCfg); window.AdminL3Core.setStorage(`tucu_l3_pay_cfg_${nr}`, payCfg); localStorage.setItem(`tucu_l3_alias_${st.rubro}`, alias); localStorage.setItem(`tucu_l3_alias_${nr}`, alias); localStorage.setItem('tucu_l3_alias', alias); localStorage.setItem(`tucu_l3_cbu_${st.rubro}`, cbu); localStorage.setItem(`tucu_l3_cbu_${nr}`, cbu); localStorage.setItem('tucu_l3_cbu', cbu); window.AdminBookingEngine?.saveConfig?.('l3', { ...(window.AdminBookingEngine?.getConfig?.('l3') || {}), alias, cbu, reminders }); window.AdminL3Telemetry?.renderAutoConfirmBadge?.(); } catch (_) {}
    return payCfg;
  }

  function copyAlias() {
    const val = document.getElementById('l3-input-alias')?.value?.trim() || 'brava.barberia.mp';
    if (navigator.clipboard) navigator.clipboard.writeText(val).catch(() => {});
    window.AdminL3Core.showToast('Alias copiado al portapapeles');
  }

  function openBaileysModal() {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg; if (!modal) return;
    modal.innerHTML = `<div id="l3-qr-modal" class="w-full max-w-sm bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm font-title">Vinculación QR de WhatsApp</h3><button type="button" id="btn-l3-close-qr" onclick="AdminL3System.closeBaileysModal()" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div id="l3-qr-svg-container" class="p-3 bg-white rounded-2xl border border-stone-200 inline-block shadow-inner mx-auto"><svg class="w-36 h-36 mx-auto" viewBox="0 0 120 120" fill="currentColor" aria-label="Código QR de WhatsApp"><rect width="120" height="120" fill="#ffffff"/><path d="M10,10 h35 v35 h-35 z M15,15 v25 h25 v-25 z M20,20 h15 v15 h-15 z M75,10 h35 v35 h-35 z M80,15 v25 h25 v-25 z M85,20 h15 v15 h-15 z M10,75 h35 v35 h-35 z M15,80 v25 h25 v-25 z M20,85 h15 v15 h-15 z M50,15 h5 v10 h-5 z M60,10 h5 v5 h-5 z M50,30 h10 v5 h-10 z M65,25 h5 v15 h-5 z M10,50 h10 v5 h-10 z M25,50 h15 v5 h-15 z M50,50 h20 v5 h-20 z M80,50 h10 v5 h-10 z M100,50 h10 v10 h-10 z M50,60 h5 v15 h-5 z M60,65 h15 v5 h-15 z M80,60 h5 v10 h-5 z M95,65 h15 v5 h-15 z M50,80 h10 v10 h-10 z M65,80 h10 v5 h-10 z M80,75 h20 v5 h-20 z M105,80 h5 v25 h-5 z M50,95 h5 v15 h-5 z M60,100 h15 v5 h-15 z M80,95 h15 v15 h-15 z" fill="#0f172a"/></svg></div><p class="text-[11px] text-stone-500">Escaneá desde WhatsApp > Dispositivos vinculados para operar en producción.</p><button type="button" onclick="AdminL3System.closeBaileysModal()" class="tucu-btn w-full admin-glass-primary">Listo / Cerrar</button></div>`;
    modal.classList.remove('hidden');
  }
  function closeBaileysModal() { document.getElementById('admin-modal-root')?.classList.add('hidden'); }

  function addCustomHoliday() {
    const date = document.getElementById('new-hol-date')?.value, desc = document.getElementById('new-hol-desc')?.value?.trim() || 'Cierre Especial';
    const today = window.AdminShell?.localTodayStr?.() || '', st = window.AdminL3Core.state;
    if (!date || (today && date < today)) return window.AdminL3Core.showToast('Selecciona una fecha válida (hoy o futura)', 'error');
    const h = (st.holidays || []).filter(x => x.date !== date); h.push({ date, desc, isException: false });
    window.AdminL3Core.setStorage('tucu_l3_holidays', h); st.holidays = h;
    window.AdminL3Core.showToast('Fecha bloqueada por cierre especial'); window.AdminL3Core.renderActiveView();
  }

  async function deleteCustomHoliday(date) {
    const st = window.AdminL3Core.state;
    if (window.AdminShell?.confirmAsync && !(await window.AdminShell.confirmAsync({ title: '¿Archivar cierre especial?', message: 'La fecha volverá a estar habilitada conservando el registro histórico.', confirmLabel: 'Sí, archivar' }))) return;
    st.holidays = (st.holidays || []).map(h => h.date === date ? { ...h, deletedAt: new Date().toISOString() } : h);
    window.AdminL3Core.setStorage('tucu_l3_holidays', st.holidays); window.AdminL3Core.showToast('Cierre archivado'); window.AdminL3Core.renderActiveView();
  }

  async function syncArgHolidays() {
    const year = window.AdminHolidays ? window.AdminHolidays.getCurrentYear() : new Date().getFullYear();
    await window.AdminHolidays?.loadHolidays?.(year); renderMonthlyHolidays(window.AdminL3Core.state.rubro); window.AdminL3Core.showToast(`Feriados argentinos ${year} sincronizados`);
  }

  function addServiceBlock() {
    const srvId = document.getElementById('sb-srv')?.value, date = document.getElementById('sb-date')?.value, start = document.getElementById('sb-start')?.value || '12:00', end = document.getElementById('sb-end')?.value || '16:00', today = window.AdminShell?.localTodayStr?.() || '', st = window.AdminL3Core.state;
    if (!srvId || !date || (today && date < today)) return window.AdminL3Core.showToast('Completa servicio y fecha futura', 'error');
    const srv = st.services.find(s => s.id === srvId), blocks = st.blocks || [];
    blocks.push({ id: 'sb-' + Math.random().toString(36).substring(2, 6), serviceId: srvId, serviceName: srv ? srv.name : 'Servicio', date, start, end });
    window.AdminL3Core.setStorage(`tucu_l3_blocks_${st.rubro}`, blocks); st.blocks = blocks; window.AdminL3Core.renderActiveView();
  }

  async function deleteBlock(id) {
    const st = window.AdminL3Core.state;
    if (window.AdminShell?.confirmAsync && !(await window.AdminShell.confirmAsync({ title: '¿Archivar bloqueo de rango?', message: 'La franja volverá a estar disponible conservando el historial.', confirmLabel: 'Sí, archivar' }))) return;
    st.blocks = (st.blocks || []).map(b => b.id === id ? { ...b, deletedAt: new Date().toISOString() } : b);
    window.AdminL3Core.setStorage(`tucu_l3_blocks_${st.rubro}`, st.blocks); window.AdminL3Core.showToast('Bloqueo archivado'); window.AdminL3Core.renderActiveView();
  }

  function saveConfig() { persistIdentity(); syncPayKeys(); window.AdminWaTemplates?.renderPreview?.(waOpts()); window.AdminL3Core.showToast('Parámetros guardados con éxito'); }
  return { render, switchConfigTab, copyAlias, openBaileysModal, closeBaileysModal, addCustomHoliday, deleteCustomHoliday, syncArgHolidays, addServiceBlock, deleteBlock, saveConfig };
})();
