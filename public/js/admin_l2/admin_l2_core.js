// Archivo: public/js/admin_l2/admin_l2_core.js
// Core L2: Aura Light Tokens, Temas, Navegación & Utilidades (Nexus OS v11.1 - < 150 líneas)

(function (global) {
  const views = ['calendar', 'crm', 'config'];

  function updateThemeIcons(isDark) {
    const sun = document.getElementById('icon-theme-sun');
    const moon = document.getElementById('icon-theme-moon');
    if (sun) sun.classList.toggle('hidden', !isDark);
    if (moon) moon.classList.toggle('hidden', isDark);
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('tucu_theme', isDark ? 'dark' : 'light'); } catch (_) {}
    updateThemeIcons(isDark);
  }

  function initTheme() {
    const saved = localStorage.getItem('tucu_theme') || 'light';
    const isDark = saved === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    updateThemeIcons(isDark);
  }

  function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const msgEl = document.getElementById('toast-message');
    const iconEl = document.getElementById('toast-icon');
    if (!toast) return;
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = type === 'success' ? '✓' : '⚠';
    toast.className = `fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold transition-all duration-300 pointer-events-auto ${type === 'success' ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400' : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-600'}`;
    setTimeout(() => {
      toast.className = 'fixed bottom-20 md:bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800';
    }, 2800);
  }

  function sanitizeCleanPhone(v) {
    return (v || '').replace(/\D/g, '').replace(/^549?/, '').replace(/^0/, '').replace(/^(\d{2,4})15/, '$1');
  }

  function switchMainView(target) {
    views.forEach(v => {
      const sec = document.getElementById('view-section-' + v);
      const dBtn = document.getElementById('main-view-btn-' + v);
      const mBtn = document.getElementById('mobile-nav-btn-' + v);
      const isActive = v === target;

      if (sec) sec.classList.toggle('hidden', !isActive);

      if (dBtn) {
        dBtn.className = isActive
          ? 'main-view-tab py-1.5 px-4 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-xs flex items-center gap-1.5 cursor-pointer'
          : 'main-view-tab py-1.5 px-4 rounded-xl text-xs font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 cursor-pointer';
      }

      if (mBtn) {
        mBtn.className = isActive
          ? 'mobile-nav-tab flex flex-col items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold cursor-pointer'
          : 'mobile-nav-tab flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] font-medium cursor-pointer';
      }
    });
  }

  function init() {
    initTheme();

    views.forEach(v => {
      const dBtn = document.getElementById('main-view-btn-' + v);
      const mBtn = document.getElementById('mobile-nav-btn-' + v);
      if (dBtn) dBtn.addEventListener('click', () => switchMainView(v));
      if (mBtn) mBtn.addEventListener('click', () => switchMainView(v));
    });

    const btnTheme = document.getElementById('btnThemeToggle');
    if (btnTheme) btnTheme.addEventListener('click', toggleTheme);

    if (global.adminL2Calendar?.init) global.adminL2Calendar.init();
    if (global.adminL2CRM?.init) global.adminL2CRM.init();
    if (global.adminL2Config?.init) global.adminL2Config.init();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      setTimeout(init, 30);
    }
  }

  global.adminL2Core = { toggleTheme, initTheme, switchMainView, showToast, sanitizeCleanPhone, init };
})(typeof window !== 'undefined' ? window : global);

