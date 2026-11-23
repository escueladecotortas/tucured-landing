// Archivo: public/js/admin_l1/admin_l1_config.js
// Configuración L1: 3 Pestañas Unificadas, Horarios Compartidos, Feriados 2026 & WhatsApp QR (< 140L)

(function (global) {
  let scheduleCtrl = null;
  let schedule = global.TucuWeeklySchedule?.loadSchedule?.('tucu_schedule') || {};
  let configData = {
    requireDeposit: true, depositType: 'percentage', depositValue: 50,
    alias: 'brava.barberia.mp', cbu: '0000003100012345678901', waNumber: '5493815551234',
    reminders: { h24: true, h2: true }, coords: '',
    template: 'Hola {{cliente}}, tu turno en {{comercio}} quedó agendado para el {{fecha}} a las {{hora}} hs.'
  };
  const configTabs = ['identidad', 'agenda', 'wa'];

  function switchConfigTab(target) {
    configTabs.forEach(t => {
      const btn = document.getElementById('tab-btn-' + t), sec = document.getElementById('config-content-' + t), isAct = t === target;
      if (btn) { btn.className = isAct ? 'config-tab-btn tucu-chip is-active' : 'config-tab-btn tucu-chip'; btn.setAttribute('aria-selected', String(isAct)); }
      if (sec) sec.classList.toggle('hidden', !isAct);
    });
  }

  function showSaveToast(msg = 'Cambios guardados') {
    const toast = document.getElementById('saveToast'); if (!toast) return;
    const sp = toast.querySelector('span'); if (sp) sp.textContent = msg;
    toast.classList.remove('hidden'); setTimeout(() => toast.classList.add('hidden'), 2200);
  }

  function loadLocal() {
    schedule = global.TucuWeeklySchedule?.loadSchedule?.('tucu_schedule') || schedule;
    try { configData = { ...configData, ...JSON.parse(localStorage.getItem('tucu_l1_cfg_ext') || '{}') }; } catch (_) {}
  }

  function mountSchedule() {
    scheduleCtrl = global.TucuWeeklySchedule?.mount?.({
      containerId: 'l1-weekly-schedule-container', storageKey: 'tucu_schedule', level: 'l1',
      onChange: (next, meta) => {
        schedule = next;
        saveConfig(meta?.action === 'cloneLunVie' ? 'Horarios de Lunes copiados a días hábiles' : 'Cambios guardados');
      }
    }) || scheduleCtrl;
    if (scheduleCtrl?.getSchedule) schedule = scheduleCtrl.getSchedule();
  }

  function renderHolidays() {
    if (global.AdminFeatures?.hasFeature?.('l1', 'holidays2026') === false) return;
    const r = localStorage.getItem('tucu_l1_rubro') || 'peluqueria';
    global.AdminHolidays?.renderMonthlyList?.('l1-holidays-container', 'l1', r, (_, blk) => {
      showSaveToast(blk ? 'Feriado bloqueado en agenda' : 'Feriado habilitado para atender');
    });
  }

  function populateInputs() {
    const v = (id) => document.getElementById(id), r = localStorage.getItem('tucu_l1_rubro') || 'peluqueria';
    const meta = global.AdminDemoSeed?.getRubroMeta?.(r);
    if (v('cfg-biz-name')) v('cfg-biz-name').value = localStorage.getItem(`tucu_l1_biz_name_${r}`) || localStorage.getItem('tucu_l1_biz_name') || meta?.bizName || 'Brava Barbería';
    if (v('cfg-biz-address')) v('cfg-biz-address').value = localStorage.getItem(`tucu_l1_address_${r}`) || localStorage.getItem('tucu_l1_address') || meta?.address || '25 de Mayo 480, S. M. de Tucumán';
    if (v('cfg-biz-coords')) v('cfg-biz-coords').value = localStorage.getItem(`tucu_l1_coords_${r}`) || localStorage.getItem('tucu_l1_coords') || configData.coords || '';
    if (v('cfg-deposit-toggle')) v('cfg-deposit-toggle').checked = configData.requireDeposit !== false;
    if (v('cfg-deposit-type')) v('cfg-deposit-type').value = configData.depositType || 'percentage';
    if (v('cfg-deposit-value')) v('cfg-deposit-value').value = configData.depositValue || 50;
    if (v('inputAlias')) v('inputAlias').value = localStorage.getItem(`tucu_l1_alias_${r}`) || localStorage.getItem('tucu_l1_alias') || meta?.alias || configData.alias;
    if (v('inputCbu')) v('inputCbu').value = localStorage.getItem(`tucu_l1_cbu_${r}`) || localStorage.getItem('tucu_l1_cbu') || configData.cbu;
    if (v('chk-remind-24h')) v('chk-remind-24h').checked = configData.reminders?.h24 !== false;
    if (v('chk-remind-2h')) v('chk-remind-2h').checked = configData.reminders?.h2 !== false;
    updatePreview(); renderHolidays();
  }

  function saveConfig(toastMsg) {
    const v = (id) => document.getElementById(id), r = localStorage.getItem('tucu_l1_rubro') || 'peluqueria';
    const meta = global.AdminDemoSeed?.getRubroMeta?.(r), prevExt = global.AdminBookingEngine ? global.AdminBookingEngine.getConfig('l1') : {};
    const waTpls = global.AdminWaTemplates?.saveTemplates?.('l1') || {};
    schedule = scheduleCtrl?.getSchedule?.() || schedule;
    const bizName = v('cfg-biz-name')?.value.trim() || meta?.bizName || 'Brava Barbería';
    const address = v('cfg-biz-address')?.value.trim() || meta?.address || '25 de Mayo 480, S. M. de Tucumán';
    const coords = v('cfg-biz-coords')?.value.trim() || '';
    configData = {
      ...prevExt, bizName, address, coords,
      requireDeposit: v('cfg-deposit-toggle')?.checked ?? true,
      depositType: v('cfg-deposit-type')?.value || 'percentage',
      depositValue: Math.max(0, parseInt(v('cfg-deposit-value')?.value, 10) || 0),
      alias: v('inputAlias')?.value.trim() || meta?.alias || configData.alias,
      cbu: v('inputCbu')?.value.trim().replace(/\D/g, '') || configData.cbu,
      waNumber: global.AdminWaTemplates?.DEMO_WA_NUMBER || '5493815551234',
      reminders: { h24: v('chk-remind-24h')?.checked ?? true, h2: v('chk-remind-2h')?.checked ?? true },
      template: waTpls.t1a || configData.template, schedule
    };
    localStorage.setItem('tucu_schedule', JSON.stringify(schedule));
    if (global.AdminBookingEngine) global.AdminBookingEngine.saveConfig('l1', configData);
    else localStorage.setItem('tucu_l1_cfg_ext', JSON.stringify(configData));
    if (global.adminL1Pricing?.renderPricing) global.adminL1Pricing.renderPricing();
    localStorage.setItem('tucu_l1_biz_name', bizName); localStorage.setItem(`tucu_l1_biz_name_${r}`, bizName);
    localStorage.setItem('tucu_l1_address', address); localStorage.setItem(`tucu_l1_address_${r}`, address);
    localStorage.setItem('tucu_l1_coords', coords); localStorage.setItem(`tucu_l1_coords_${r}`, coords);
    if (v('brand-title')) v('brand-title').textContent = bizName;
    localStorage.setItem('tucu_l1_alias', configData.alias); localStorage.setItem(`tucu_l1_alias_${r}`, configData.alias);
    localStorage.setItem('tucu_l1_cbu', configData.cbu); localStorage.setItem(`tucu_l1_cbu_${r}`, configData.cbu);
    const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria';
    if (slug && !slug.startsWith('demo') && window.location.port !== '5174') {
      fetch(`/api/portal/${slug}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) }).catch(() => {});
    }
    updatePreview(); renderHolidays();
    showSaveToast(typeof toastMsg === 'string' && toastMsg ? toastMsg : 'Cambios guardados');
  }

  function updatePreview() {
    global.AdminWaTemplates?.renderPreview?.({ mountId: 'l1-wa-config-mount', level: 'l1', bizInputId: 'cfg-biz-name', addressInputId: 'cfg-biz-address', aliasInputId: 'inputAlias' });
  }

  function copyAlias() {
    const a = document.getElementById('inputAlias')?.value || configData.alias;
    if (navigator.clipboard) navigator.clipboard.writeText(a).catch(() => {});
    showSaveToast('Alias copiado al portapapeles');
  }

  function openBaileysModal() {
    const root = document.getElementById('dynamicModalRoot'); if (!root) return;
    const wa = localStorage.getItem('tucu_l1_wa_number') || configData.waNumber || '5493815551234';
    root.innerHTML = `<div id="baileysModal" class="fixed inset-0 z-50 bg-[#121110]/85 backdrop-blur-md flex items-center justify-center p-4"><div class="w-full max-w-sm rounded-2xl border border-[#E8E6DF] dark:border-[#2D2A28] bg-white dark:bg-[#1C1A19] p-6 shadow-2xl text-center space-y-4"><div class="flex items-center justify-between pb-2 border-b border-[#E8E6DF] dark:border-[#2D2A28]"><h3 class="text-sm font-bold text-[#1C1A17] dark:text-[#F5F3EF] flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span><span>Vinculación QR de WhatsApp</span></h3><button type="button" onclick="adminL1Config.closeBaileysModal()" aria-label="Cerrar" class="p-1 text-[#7A766E] hover:text-[#1C1A17] dark:hover:text-white cursor-pointer"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div><div class="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-inner mx-auto"><svg class="w-36 h-36 mx-auto" viewBox="0 0 120 120" fill="currentColor"><rect width="120" height="120" fill="white" /><path d="M10,10 h35 v35 h-35 z M15,15 v25 h25 v-25 z M20,20 h15 v15 h-15 z M75,10 h35 v35 h-35 z M80,15 v25 h25 v-25 z M85,20 h15 v15 h-15 z M10,75 h35 v35 h-35 z M15,80 v25 h25 v-25 z M20,85 h15 v15 h-15 z M50,15 h5 v10 h-5 z M60,10 h5 v5 h-5 z M50,30 h10 v5 h-10 z M65,25 h5 v15 h-5 z M10,50 h10 v5 h-10 z M25,50 h15 v5 h-15 z M50,50 h20 v5 h-20 z M80,50 h10 v5 h-10 z M100,50 h10 v10 h-10 z M50,60 h5 v15 h-5 z M60,65 h15 v5 h-15 z M80,60 h5 v10 h-5 z M95,65 h15 v5 h-15 z M50,80 h10 v10 h-10 z M65,80 h10 v5 h-10 z M80,75 h20 v5 h-20 z M105,80 h5 v25 h-5 z M50,95 h5 v15 h-5 z M60,100 h15 v5 h-15 z M80,95 h15 v15 h-15 z" fill="#0f172a" /></svg></div><div class="space-y-1"><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>WhatsApp Conectado · ${wa}</span></span><p class="text-[11px] text-[#7A766E] dark:text-[#9E9A93] pt-1 leading-relaxed">Dispositivos vinculados > Escanear QR para sincronizar el bot despachador.</p></div><button type="button" onclick="adminL1Config.closeBaileysModal()" class="w-full py-2 rounded-xl text-xs font-bold admin-glass-primary">Listo / Cerrar</button></div></div>`;
  }

  function closeBaileysModal() { const root = document.getElementById('dynamicModalRoot'); if (root) root.innerHTML = ''; }

  function init() {
    loadLocal(); mountSchedule();
    global.AdminWaTemplates?.mount?.({ mountId: 'l1-wa-config-mount', level: 'l1', bizInputId: 'cfg-biz-name', addressInputId: 'cfg-biz-address', aliasInputId: 'inputAlias', onChange: saveConfig });
    populateInputs();
    if (global.AdminHolidays) global.AdminHolidays.loadHolidays().then(renderHolidays);
    if (global.AdminBookingEngine?.mountPaymentConfigPanel) {
      global.AdminBookingEngine.mountPaymentConfigPanel({
        mountId: 'l1-payment-methods-mount', level: 'l1', includeDepositRule: false,
        onChange: () => { configData = { ...configData, ...global.AdminBookingEngine.getConfig('l1') }; updatePreview(); },
        onResetDemo: () => { const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria'; global.adminL1Agenda?.resetDemoBookings(slug); }
      });
    }
    ['cfg-biz-name', 'cfg-biz-address', 'cfg-biz-coords', 'cfg-deposit-toggle', 'cfg-deposit-type', 'cfg-deposit-value', 'inputAlias', 'inputCbu', 'chk-remind-24h', 'chk-remind-2h'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener('input', saveConfig); el.addEventListener('change', saveConfig); }
    });
    configTabs.forEach(t => document.getElementById('tab-btn-' + t)?.addEventListener('click', () => switchConfigTab(t)));
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }

  global.adminL1Config = {
    toggleDay: (d, en) => scheduleCtrl?.toggleDay(d, en), toggleSplit: (d) => scheduleCtrl?.toggleSplit(d),
    updateHour: (d, f, v) => scheduleCtrl?.updateHour(d, f, v), cloneLunVie: () => scheduleCtrl?.cloneLunVie(),
    getSchedule: () => scheduleCtrl?.getSchedule?.() || schedule, switchConfigTab, populateInputs, saveConfig,
    copyAlias, updatePreview, renderHolidays, openBaileysModal, closeBaileysModal, getConfigData: () => configData
  };
})(typeof window !== 'undefined' ? window : global);
