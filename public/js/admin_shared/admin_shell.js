// Archivo: public/js/admin_shared/admin_shell.js
// Shell Compartido L1/L2/L3: Sidebar dvh, Tema, Guardias, ConfirmModal y Sonda WA (< 180L)

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
    iconSun?.classList.toggle('hidden', !isDark); iconMoon?.classList.toggle('hidden', isDark);
  }
  function initTheme() {
    const isDark = (localStorage.getItem('tucu_theme') || 'light') === 'dark';
    document.documentElement.classList.toggle('dark', isDark); updateThemeIcons(isDark);
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
  function currentHHMM() { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }

  function filterFutureSlots(slots, dateStr) {
    const list = Array.isArray(slots) && slots.length ? slots : DEFAULT_SLOTS;
    if (dateStr !== localTodayStr()) return list;
    const now = currentHHMM();
    return list.filter(t => String(t) > now);
  }

  function bindDateTimeGuards({ dateId, timeId, slots, initialDate, initialTime }) {
    const dEl = document.getElementById(dateId), tEl = document.getElementById(timeId), today = localTodayStr();
    const refreshTimes = () => {
      if (!tEl) return;
      const curDate = dEl ? dEl.value : (initialDate || today);
      let avail = filterFutureSlots(slots, curDate);
      if (dEl && curDate === today && avail.length === 0) { dEl.value = localTodayStr(1); avail = filterFutureSlots(slots, dEl.value); }
      if (tEl.tagName === 'SELECT') {
        const prev = tEl.value || initialTime || '';
        tEl.innerHTML = avail.map(t => `<option value="${t}">${t} hs</option>`).join('');
        tEl.value = avail.includes(prev) ? prev : (avail[0] || '');
      } else if (avail.length && !avail.includes(tEl.value)) tEl.value = avail[0];
    };
    if (dEl) {
      dEl.min = today; const base = initialDate || dEl.value || today;
      dEl.value = base < today ? today : base;
      dEl.onchange = () => { if (dEl.value < localTodayStr()) dEl.value = localTodayStr(); refreshTimes(); };
    }
    refreshTimes();
  }
  const isServiceAvailable = (srv) => Boolean(srv && !srv.deletedAt && srv.isActive !== false && srv.activo !== false && srv.active !== false);

  function confirmAsync({ title = '¿Confirmar acción?', message = 'El registro se archivará en el historial.', confirmLabel = 'Sí, archivar', cancelLabel = 'Cancelar' } = {}) {
    document.getElementById('admin-confirm-modal')?.remove();
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.id = 'admin-confirm-modal';
      wrap.className = 'fixed inset-0 z-[70] bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4';
      wrap.innerHTML = `<div class="bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/></svg></div>
          <div class="min-w-0 space-y-1"><h3 id="admin-confirm-title" class="text-sm font-bold text-stone-900 dark:text-stone-100 font-title"></h3><p id="admin-confirm-message" class="text-xs text-stone-500 dark:text-stone-400 leading-relaxed"></p></div>
        </div>
        <div class="flex gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button type="button" id="admin-confirm-cancel" class="w-1/2 py-2 rounded-xl admin-glass-btn text-xs font-semibold"></button>
          <button type="button" id="admin-confirm-ok" class="w-1/2 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"></button>
        </div></div>`;
      wrap.querySelector('#admin-confirm-title').textContent = title;
      wrap.querySelector('#admin-confirm-message').textContent = message;
      wrap.querySelector('#admin-confirm-cancel').textContent = cancelLabel;
      wrap.querySelector('#admin-confirm-ok').textContent = confirmLabel;
      const done = (res) => { wrap.remove(); resolve(res); };
      wrap.querySelector('#admin-confirm-ok').onclick = () => done(true);
      wrap.querySelector('#admin-confirm-cancel').onclick = () => done(false);
      wrap.addEventListener('click', (e) => { if (e.target === wrap) done(false); });
      document.body.appendChild(wrap);
    });
  }

  function applyWaPill(el, state, text) {
    if (!el) return;
    const styles = { connected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800', offline: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', demo: 'bg-stone-100 text-stone-600 border-[#D5CEC2] dark:bg-stone-800/70 dark:text-stone-300 dark:border-stone-700' };
    const dotColor = state === 'connected' ? 'bg-emerald-500' : (state === 'offline' ? 'bg-amber-500' : 'bg-stone-400');
    el.className = `tucu-badge border ${styles[state] || styles.demo}`;
    el.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span><span>${text}</span>`;
  }

  async function probeWhatsAppStatus(opts = {}) {
    const el = document.getElementById(opts.badgeId || 'wa-status-pill'); if (!el) return 'none';
    if (!opts.forceLive && (window.location.port === '5174' || window.location.protocol === 'file:')) { applyWaPill(el, 'demo', 'WhatsApp: Modo Demo'); return 'demo'; }
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 2500);
    try {
      const res = await fetch('/api/wa/status', { signal: ctl.signal }); clearTimeout(tm);
      if (res.ok) { const d = await res.json(), open = d.status === 'OPEN' || d.connected === true; applyWaPill(el, open ? 'connected' : 'offline', open ? 'WhatsApp: Conectado' : 'WhatsApp: Sin sesión'); return open ? 'connected' : 'offline'; }
      applyWaPill(el, 'offline', 'WhatsApp: Sin sesión'); return 'offline';
    } catch (_) { clearTimeout(tm); applyWaPill(el, 'demo', 'WhatsApp: Modo Demo'); return 'demo'; }
  }

  function syncReceptionPill(isOpen) {
    const el = document.getElementById('mobile-turnero-pill'); if (!el) return;
    el.className = isOpen ? 'tucu-badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 cursor-pointer transition-colors' : 'tucu-badge bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 cursor-pointer transition-colors';
    el.textContent = isOpen ? 'Turnero Abierto' : 'Turnero Pausado';
  }
  function toggleReception(storageKey = 'tucu_turnero_open') {
    const nxt = localStorage.getItem(storageKey) === 'false';
    localStorage.setItem(storageKey, String(nxt)); syncReceptionPill(nxt); return nxt;
  }

  function init() {
    initTheme();
    const { sidebar, backdrop, btnOpen, btnClose, btnTheme } = getElements();
    btnOpen?.addEventListener('click', openSidebar); btnClose?.addEventListener('click', closeSidebar);
    backdrop?.addEventListener('click', closeSidebar); btnTheme?.addEventListener('click', toggleTheme);
    bindNavigationClose(sidebar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1024) closeSidebar(); });
    syncReceptionPill(localStorage.getItem('tucu_turnero_open') !== 'false');
    probeWhatsAppStatus();
    if (window.AdminHolidays) { window.AdminHolidays.renderLabel('l1-holidays-label'); window.AdminHolidays.renderLabel('l2-holidays-label'); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  const normStr = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  return {
    openSidebar, closeSidebar, toggleSidebar, initTheme, toggleTheme, normStr, confirmAsync,
    localTodayStr, currentHHMM, filterFutureSlots, bindDateTimeGuards, isServiceAvailable,
    probeWhatsAppStatus, syncReceptionPill, toggleReception
  };
})();