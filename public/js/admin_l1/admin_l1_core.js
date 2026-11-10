// Archivo: public/js/admin_l1/admin_l1_core.js
// Core del Admin Shell: Warm Studio Tokens, KPIs, Temas & Navegación (Nexus OS v11.1 - < 150 líneas)

(function (global) {
  const DEFAULT_CONFIG = {
    slug: 'demo-peluqueria',
    bizName: 'Peluquería & Barbería Central',
    subtitle: 'Cortes Clásicos, Fades y Cuidado de Barba',
    logoUrl: '',
    isActive: true
  };
  const views = ['citas', 'catalogo', 'configuracion'];

  function getConfig() {
    const g = (k, d) => localStorage.getItem(k) || d;
    return {
      slug: g('tucu_l1_slug', DEFAULT_CONFIG.slug),
      bizName: g('tucu_l1_biz_name', DEFAULT_CONFIG.bizName),
      subtitle: g('tucu_l1_subtitle', DEFAULT_CONFIG.subtitle),
      logoUrl: g('tucu_l1_logo', DEFAULT_CONFIG.logoUrl),
      isActive: localStorage.getItem('tucu_l1_is_active') !== 'false'
    };
  }

  function updateThemeIcons(isDark) {
    document.getElementById('icon-theme-sun')?.classList.toggle('hidden', !isDark);
    document.getElementById('icon-theme-moon')?.classList.toggle('hidden', isDark);
  }
  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('tucu_theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
  }
  function initTheme() {
    const isDark = (localStorage.getItem('tucu_theme') || 'light') === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    updateThemeIcons(isDark);
  }

  async function injectClientBrand(slugParam) {
    const params = new URLSearchParams(window.location.search);
    const slug = (slugParam || params.get('slug') || getConfig().slug || 'demo-peluqueria').trim();
    localStorage.setItem('tucu_l1_slug', slug);
    let assets = null;
    if (slug && slug !== 'demo-peluqueria') {
      for (const u of [`/api/portal/${slug}/config`, `/nexus_archives/tucu-red/clients/${slug}/client-assets.json`]) {
        try {
          const res = await fetch(u);
          if (res.ok) { const d = await res.json(); assets = d.config || d.payload || d; if (assets?.business_name || assets?.name) break; }
        } catch (_) {}
      }
    }
    if (assets) {
      const name = assets.business_name || assets.name || DEFAULT_CONFIG.bizName;
      const sub = assets.subtitle || assets.subcategory || assets.category || DEFAULT_CONFIG.subtitle;
      const rawLogo = assets.logoUrl || assets.logo_url || assets.semantic_photos?.logo || '';
      const logo = rawLogo.startsWith('./') ? `/nexus_archives/tucu-red/clients/${slug}/${rawLogo.slice(2)}` : (rawLogo || '');
      const accent = assets.accentColor || assets.brand_accent || assets.accent || '#4F46E5';
      document.documentElement.style.setProperty('--brand-accent', accent);
      localStorage.setItem('tucu_l1_biz_name', name); localStorage.setItem('tucu_l1_subtitle', sub); localStorage.setItem('tucu_l1_logo', logo);
      if (Array.isArray(assets.services) && assets.services.length > 0 && global.adminL1Pricing?.syncFromBrand) global.adminL1Pricing.syncFromBrand(assets.services);
    } else {
      document.documentElement.style.setProperty('--brand-accent', '#4F46E5');
      localStorage.setItem('tucu_l1_biz_name', DEFAULT_CONFIG.bizName);
      localStorage.setItem('tucu_l1_subtitle', DEFAULT_CONFIG.subtitle);
      localStorage.setItem('tucu_l1_logo', '');
    }
    renderBrandIdentity();
    if (global.adminL1Agenda?.loadBookings) global.adminL1Agenda.loadBookings(slug);
  }

  function renderBrandIdentity() {
    const cfg = getConfig();
    const isGeneric = !cfg.slug || cfg.slug === 'demo-peluqueria' || cfg.slug === 'mi-comercio';
    const initials = isGeneric ? 'PB' : (cfg.bizName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'PB');
    const tEl = document.getElementById('brand-title'), sEl = document.getElementById('brand-subtitle');
    const initEl = document.getElementById('brand-initials'), img = document.getElementById('brand-logo-img');
    const pinTitle = document.getElementById('pin-brand-title'), pinName = document.getElementById('pin-brand-name'), pinInit = document.getElementById('pin-brand-initials');

    if (tEl) tEl.textContent = cfg.bizName;
    if (sEl) sEl.textContent = cfg.subtitle;
    if (initEl) initEl.textContent = initials;
    if (pinInit) pinInit.textContent = initials;
    if (pinName) pinName.textContent = cfg.bizName;
    if (pinTitle) pinTitle.textContent = `${cfg.bizName} — Panel`;
    if (img) {
      if (cfg.logoUrl && !isGeneric) { img.src = cfg.logoUrl; img.classList.remove('hidden'); }
      else { img.classList.add('hidden'); }
    }
    document.title = `${cfg.bizName} — Panel de Gestión`;
  }

  function toggleTurneroActive() {
    const next = !(localStorage.getItem('tucu_l1_is_active') !== 'false');
    localStorage.setItem('tucu_l1_is_active', next ? 'true' : 'false');
    renderTurneroSwitch();
    fetch(`/api/portal/${getConfig().slug}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: next }) }).catch(() => {});
  }

  function renderTurneroSwitch() {
    const isActive = localStorage.getItem('tucu_l1_is_active') !== 'false';
    const btn = document.getElementById('btnTurneroSwitch'), knob = document.getElementById('reception-knob');
    const badge = document.getElementById('turneroStatusBadge'), dot = document.getElementById('turneroStatusDot'), txt = document.getElementById('turneroStatusText');
    if (!btn || !txt) return;
    btn.style.backgroundColor = isActive ? 'var(--brand-accent)' : '#7A766E';
    if (knob) knob.className = `w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`;
    if (dot) dot.className = `w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`;
    if (badge) badge.className = `flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'}`;
    txt.textContent = isActive ? 'Recepción Abierta' : 'En Pausa';
  }

  function switchView(target) {
    views.forEach(v => {
      document.getElementById(`view-section-${v}`)?.classList.toggle('hidden', v !== target);
      const bDesk = document.getElementById(`main-view-btn-${v}`), bMob = document.getElementById(`mob-nav-${v}`);
      const act = v === target;
      if (bDesk) {
        bDesk.style.backgroundColor = act ? 'var(--brand-accent)' : 'transparent';
        bDesk.className = `px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${act ? 'text-white shadow-xs' : 'text-[#7A766E] dark:text-[#9E9A93] hover:text-[#1C1A17] dark:hover:text-[#F5F3EF]'}`;
      }
      if (bMob) bMob.style.color = act ? 'var(--brand-accent)' : '#7A766E';
    });
  }

  function init() {
    initTheme();
    views.forEach(v => {
      document.getElementById(`main-view-btn-${v}`)?.addEventListener('click', () => switchView(v));
      document.getElementById(`mob-nav-${v}`)?.addEventListener('click', () => switchView(v));
    });
    renderTurneroSwitch();
    injectClientBrand();
    if (global.adminL1Agenda?.init) global.adminL1Agenda.init();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }
  global.adminL1Core = { getConfig, injectClientBrand, toggleTurneroActive, switchView, toggleTheme, initTheme, updateThemeIcons };
})(typeof window !== 'undefined' ? window : global);
