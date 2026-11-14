// Archivo: public/js/admin_shared/admin_shell.js
// Shell Compartido L1/L2/L3: Sidebar dvh, Tema, Guardias Temporales y Sonda WhatsApp (< 180 líneas)

window.AdminShell = (function () {
  const DEFAULT_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

  function getElements() {
    const g = (id) => document.getElementById(id);
    return { sidebar: g('admin-sidebar'), backdrop: g('sidebar-backdrop'), btnOpen: g('btn-open-sidebar'), btnClose: g('btn-close-sidebar'), btnTheme: g('btnThemeToggle'), iconSun: g('icon-theme-sun'), iconMoon: g('icon-theme-moon') };
  }

  function openSidebar() {
    const { sidebar, backdrop } = getElements();
    if (sidebar) sidebar.classList.add('is-open');
    if (backdrop) backdrop.classList.remove('hidden');
    if (window.innerWidth < 1024) document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    const { sidebar, backdrop } = getElements();
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function toggleSidebar() { if (getElements().sidebar?.classList.contains('is-open')) closeSidebar(); else openSidebar(); }

  function updateThemeIcons(isDark) {
    const { iconSun, iconMoon } = getElements();
    iconSun?.classList.toggle('hidden', !isDark);
    iconMoon?.classList.toggle('hidden', isDark);
  }

  function initTheme() {
    const isDark = (localStorage.getItem('tucu_theme') || 'light') === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    updateThemeIcons(isDark);
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('tucu_theme', isDark ? 'dark' : 'light'); } catch (_) {}
    updateThemeIcons(isDark);
    window.dispatchEvent(new CustomEvent('tucu:theme-changed', { detail: { isDark } }));
  }

  function bindNavigationClose(sidebar) {
    sidebar?.querySelectorAll('button, a, .admin-nav-btn, .nav-tab, .main-view-tab').forEach(item => {
      item.addEventListener('click', () => { if (window.innerWidth < 1024 && !item.id.includes('btnThemeToggle')) closeSidebar(); });
    });
  }

  function localTodayStr(offsetDays = 0) {
    const d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function currentHHMM() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function filterFutureSlots(slots, dateStr) {
    const list = Array.isArray(slots) && slots.length ? slots : DEFAULT_SLOTS;
    if (dateStr !== localTodayStr()) return list;
    const now = currentHHMM();
    return list.filter(t => String(t) > now);
  }

  function bindDateTimeGuards({ dateId, timeId, slots, initialDate, initialTime }) {
    const dEl = document.getElementById(dateId), tEl = document.getElementById(timeId);
    const today = localTodayStr();
    const refreshTimes = () => {
      if (!tEl) return;
      const curDate = dEl ? dEl.value : (initialDate || today);
      let avail = filterFutureSlots(slots, curDate);
      if (dEl && curDate === today && avail.length === 0) {
        dEl.value = localTodayStr(1);
        avail = filterFutureSlots(slots, dEl.value);
      }
      if (tEl.tagName === 'SELECT') {
        const prev = tEl.value || initialTime || '';
        tEl.innerHTML = avail.map(t => `<option value="${t}">${t} hs</option>`).join('');
        tEl.value = avail.includes(prev) ? prev : (avail[0] || '');
      } else if (avail.length && !avail.includes(tEl.value)) {
        tEl.value = avail[0];
      }
    };
    if (dEl) {
      dEl.min = today;
      const base = initialDate || dEl.value || today;
      dEl.value = base < today ? today : base;
      dEl.onchange = () => {
        if (dEl.value < localTodayStr()) dEl.value = localTodayStr();
        refreshTimes();
      };
    }
    refreshTimes();
  }

  function isServiceAvailable(srv) {
    return Boolean(srv && !srv.deletedAt && srv.isActive !== false && srv.activo !== false && srv.active !== false);
  }

  function applyWaPill(el, state, text) {
    if (!el) return;
    const styles = {
      connected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      offline: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      demo: 'bg-stone-100 text-stone-600 border-[#D5CEC2] dark:bg-stone-800/70 dark:text-stone-300 dark:border-stone-700'
    };
    const dotColor = state === 'connected' ? 'bg-emerald-500' : (state === 'offline' ? 'bg-amber-500' : 'bg-stone-400');
    el.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[state] || styles.demo}`;
    el.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span><span>${text}</span>`;
  }

  async function probeWhatsAppStatus(opts = {}) {
    const el = document.getElementById(opts.badgeId || 'wa-status-pill');
    if (!el) return 'none';
    const isDemoHost = !opts.forceLive && (window.location.port === '5174' || window.location.protocol === 'file:');
    if (isDemoHost) {
      applyWaPill(el, 'demo', 'WhatsApp: Modo Demo');
      return 'demo';
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch('/api/wa/status', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const isOpen = data.status === 'OPEN' || data.connected === true;
        applyWaPill(el, isOpen ? 'connected' : 'offline', isOpen ? 'WhatsApp: Conectado' : 'WhatsApp: Sin sesión');
        return isOpen ? 'connected' : 'offline';
      }
      applyWaPill(el, 'offline', 'WhatsApp: Sin sesión');
      return 'offline';
    } catch (_) {
      clearTimeout(timer);
      applyWaPill(el, 'demo', 'WhatsApp: Modo Demo');
      return 'demo';
    }
  }

  function init() {
    initTheme();
    const { sidebar, backdrop, btnOpen, btnClose, btnTheme } = getElements();
    btnOpen?.addEventListener('click', openSidebar);
    btnClose?.addEventListener('click', closeSidebar);
    backdrop?.addEventListener('click', closeSidebar);
    btnTheme?.addEventListener('click', toggleTheme);
    bindNavigationClose(sidebar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1024) closeSidebar(); });
    probeWhatsAppStatus();
    if (window.AdminHolidays) {
      window.AdminHolidays.renderLabel('l1-holidays-label');
      window.AdminHolidays.renderLabel('l2-holidays-label');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  function normStr(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  return {
    openSidebar, closeSidebar, toggleSidebar, initTheme, toggleTheme, normStr,
    localTodayStr, currentHHMM, filterFutureSlots, bindDateTimeGuards, isServiceAvailable, probeWhatsAppStatus
  };
})();
