// Archivo: public/js/admin_l2/admin_l2_core.js
// Core L2 (Admin · Gestión): Paleta Heredada, Recepción Web, Temas & Navegación (<= 120L)

(function (global) {
  const views = ['calendar', 'services', 'crm', 'config', 'manual'];
  const SVG_OK = '<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
  const SVG_ERR = '<svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14l-7-14-7 14z"/></svg>';

  const activeRubro = () => localStorage.getItem('tucu_l2_rubro') || 'estetica';

  function updateThemeIcons(isDark) {
    const sun = document.getElementById('icon-theme-sun'), moon = document.getElementById('icon-theme-moon');
    if (sun) sun.classList.toggle('hidden', !isDark);
    if (moon) moon.classList.toggle('hidden', isDark);
  }
  function toggleTheme() {
    if (global.AdminShell?.toggleTheme) return global.AdminShell.toggleTheme();
    const isDark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('tucu_theme', isDark ? 'dark' : 'light'); } catch (_) {}
    updateThemeIcons(isDark);
  }
  function initTheme() {
    const isDark = (localStorage.getItem('tucu_theme') || 'light') === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    updateThemeIcons(isDark);
  }

  function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast-notification'), msgEl = document.getElementById('toast-message'), iconEl = document.getElementById('toast-icon');
    if (!toast) return;
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.innerHTML = type === 'success' ? SVG_OK : SVG_ERR;
    toast.className = `fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold transition-all duration-300 pointer-events-auto ${type === 'success' ? 'bg-white dark:bg-stone-900 border-[#D5CEC2] dark:border-stone-800 tucu-primary-text' : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-600'}`;
    setTimeout(() => { toast.className = 'fixed bottom-20 md:bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 text-xs font-medium text-stone-800'; }, 2800);
  }

  const sanitizeCleanPhone = (v) => (v || '').replace(/\D/g, '').replace(/^549?/, '').replace(/^0/, '').replace(/^(\d{2,4})15/, '$1');

  function switchMainView(target) {
    views.forEach(v => {
      const sec = document.getElementById('view-section-' + v);
      const dBtn = document.getElementById('main-view-btn-' + v), mBtn = document.getElementById('mobile-nav-btn-' + v);
      const isActive = v === target;
      if (sec) sec.classList.toggle('hidden', !isActive);
      if (dBtn) dBtn.className = isActive ? 'admin-nav-item tucu-sidebar-item is-active' : 'admin-nav-item tucu-sidebar-item';
      if (mBtn) mBtn.className = isActive ? 'mobile-nav-tab flex flex-col items-center gap-1 tucu-primary-text text-[10px] font-bold cursor-pointer' : 'mobile-nav-tab flex flex-col items-center gap-1 text-stone-500 dark:text-stone-400 text-[10px] font-medium cursor-pointer';
    });
  }

  function renderTurneroSwitch() {
    const r = activeRubro(), flag = localStorage.getItem(`tucu_l2_turnero_active_${r}`);
    const isActive = flag !== null ? flag !== 'false' : localStorage.getItem('tucu_turnero_open') !== 'false';
    const btn = document.getElementById('btnTurneroSwitchL2'), knob = document.getElementById('l2-reception-knob');
    const badge = document.getElementById('turneroStatusBadgeL2'), dot = document.getElementById('turneroStatusDotL2'), txt = document.getElementById('turneroStatusTextL2');
    global.AdminShell?.syncReceptionPill?.(isActive);
    if (!btn || !txt) return;
    btn.style.backgroundColor = isActive ? 'var(--tucu-primary)' : '#8C8478';
    if (knob) knob.className = `w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isActive ? 'translate-x-4' : 'translate-x-0'}`;
    if (dot) dot.className = `w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-stone-500'}`;
    if (badge) badge.className = `tucu-badge border ${isActive ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700'}`;
    txt.textContent = isActive ? 'Recepción Abierta' : 'En Pausa';
  }

  function toggleTurneroActive() {
    const r = activeRubro(), cur = localStorage.getItem(`tucu_l2_turnero_active_${r}`);
    const next = (cur !== null ? cur !== 'false' : localStorage.getItem('tucu_turnero_open') !== 'false') ? false : true;
    try {
      localStorage.setItem(`tucu_l2_turnero_active_${r}`, String(next));
      localStorage.setItem('tucu_l2_is_active', String(next));
      localStorage.setItem('tucu_turnero_open', String(next));
    } catch (_) {}
    renderTurneroSwitch();
    showToast(next ? 'Recepción Web activada' : 'Recepción Web en pausa');
  }

  function applyRubroIdentity() {
    const p = new URLSearchParams(window.location.search), seedMod = global.AdminDemoSeed;
    const qRubro = p.get('rubro'), qSlug = p.get('slug') || '', prevRubro = localStorage.getItem('tucu_l2_rubro') || '';
    const slugHint = qSlug.startsWith('demo-') && qSlug !== 'demo-central' ? qSlug : '';
    const rubro = seedMod ? seedMod.resolveRubro(qRubro || slugHint || prevRubro || 'estetica') : 'estetica';
    const meta = seedMod?.getRubroMeta(rubro);
    const biz = localStorage.getItem(`tucu_l2_biz_name_${rubro}`) || meta?.bizName || 'Siena Estética';
    const addr = localStorage.getItem(`tucu_l2_address_${rubro}`) || meta?.address || 'Av. Aconquija 1320, Yerba Buena';
    const actFlag = localStorage.getItem(`tucu_l2_turnero_active_${rubro}`);
    const planTitle = global.AdminFeatures?.getPlanMeta?.('l2')?.title || 'Admin · Gestión';
    global.AdminThemeSync?.apply?.(rubro, 'l2');
    try {
      localStorage.setItem('tucu_l2_rubro', rubro); localStorage.setItem('tucu_l2_biz_name', biz); localStorage.setItem('tucu_l2_address', addr);
      if (actFlag !== null) localStorage.setItem('tucu_turnero_open', actFlag);
    } catch (_) {}
    const setT = (id, v) => { const el = document.getElementById(id); if (el && v) el.textContent = v; };
    document.querySelectorAll('[data-admin-brand-initials]').forEach((el) => { el.textContent = meta?.initials || 'SE'; });
    global.AdminThemeSync?.syncAdminBrandLogo?.(rubro);
    setT('l2-brand-title', biz);
    setT('l2-brand-subtitle', planTitle);
    setT('l2-mobile-title', planTitle);
    document.title = `${biz} — ${planTitle}`;
    renderTurneroSwitch();
  }

  function init() {
    initTheme();
    applyRubroIdentity();
    views.forEach(v => {
      document.getElementById('main-view-btn-' + v)?.addEventListener('click', () => switchMainView(v));
      document.getElementById('mobile-nav-btn-' + v)?.addEventListener('click', () => switchMainView(v));
    });
    if (global.adminL2Calendar?.init) global.adminL2Calendar.init();
    if (global.adminL2Services?.init) global.adminL2Services.init();
    if (global.adminL2Schedule?.init) global.adminL2Schedule.init();
    if (global.adminL2CRM?.init) global.adminL2CRM.init();
    if (global.adminL2Config?.init) global.adminL2Config.init();
    if (global.adminL2BaileysModal?.init) global.adminL2BaileysModal.init();
    global.AdminManualViewer?.mount?.({ containerId: 'l2-manual-mount', level: 'l2' });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else setTimeout(init, 30);
  }

  global.adminL2Core = { toggleTheme, initTheme, switchMainView, showToast, sanitizeCleanPhone, toggleTurneroActive, renderTurneroSwitch, init };
})(typeof window !== 'undefined' ? window : global);
