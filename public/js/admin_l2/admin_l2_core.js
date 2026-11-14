// Archivo: public/js/admin_l2/admin_l2_core.js
// Core L2: Warm Studio Tokens, Temas, Navegación & Utilidades (Nexus OS v11.1 - < 100 líneas)

(function (global) {
  const views = ['calendar', 'crm', 'config'];
  const SVG_OK = '<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
  const SVG_ERR = '<svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14l-7-14-7 14z"/></svg>';

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
    const toast = document.getElementById('toast-notification');
    const msgEl = document.getElementById('toast-message'), iconEl = document.getElementById('toast-icon');
    if (!toast) return;
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.innerHTML = type === 'success' ? SVG_OK : SVG_ERR;
    toast.className = `fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold transition-all duration-300 pointer-events-auto ${type === 'success' ? 'bg-white dark:bg-stone-900 border-[#D5CEC2] dark:border-stone-800 text-red-900 dark:text-red-400' : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-600'}`;
    setTimeout(() => {
      toast.className = 'fixed bottom-20 md:bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 text-xs font-medium text-stone-800';
    }, 2800);
  }

  function sanitizeCleanPhone(v) {
    return (v || '').replace(/\D/g, '').replace(/^549?/, '').replace(/^0/, '').replace(/^(\d{2,4})15/, '$1');
  }

  function switchMainView(target) {
    views.forEach(v => {
      const sec = document.getElementById('view-section-' + v);
      const dBtn = document.getElementById('main-view-btn-' + v), mBtn = document.getElementById('mobile-nav-btn-' + v);
      const isActive = v === target;
      if (sec) sec.classList.toggle('hidden', !isActive);
      if (dBtn) dBtn.className = isActive ? 'admin-nav-item active' : 'admin-nav-item';
      if (mBtn) mBtn.className = isActive
        ? 'mobile-nav-tab flex flex-col items-center gap-1 text-red-900 dark:text-red-400 text-[10px] font-bold cursor-pointer'
        : 'mobile-nav-tab flex flex-col items-center gap-1 text-stone-500 dark:text-stone-400 text-[10px] font-medium cursor-pointer';
    });
  }

  function init() {
    initTheme();
    views.forEach(v => {
      document.getElementById('main-view-btn-' + v)?.addEventListener('click', () => switchMainView(v));
      document.getElementById('mobile-nav-btn-' + v)?.addEventListener('click', () => switchMainView(v));
    });
    if (global.adminL2Calendar?.init) global.adminL2Calendar.init();
    if (global.adminL2Schedule?.init) global.adminL2Schedule.init();
    if (global.adminL2CRM?.init) global.adminL2CRM.init();
    if (global.adminL2Config?.init) global.adminL2Config.init();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else setTimeout(init, 30);
  }

  global.adminL2Core = { toggleTheme, initTheme, switchMainView, showToast, sanitizeCleanPhone, init };
})(typeof window !== 'undefined' ? window : global);