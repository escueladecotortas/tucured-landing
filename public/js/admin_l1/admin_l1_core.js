// Archivo: public/js/admin_l1/admin_l1_core.js
// Core L1 (Admin · Turnos): Paleta Heredada, KPIs, Temas & Navegación (< 155 líneas)

(function (global) {
  const DEFAULT_CONFIG = {
    slug: 'demo-peluqueria',
    bizName: 'Brava Barbería',
    address: '25 de Mayo 480, S. M. de Tucumán',
    subtitle: 'Cortes Clásicos, Fades y Cuidado de Barba',
    logoUrl: '',
    isActive: true
  };
  const views = ['citas', 'catalogo', 'configuracion', 'manual'];

  function getConfig() {
    const g = (k, d) => localStorage.getItem(k) || d;
    return {
      slug: g('tucu_l1_slug', DEFAULT_CONFIG.slug),
      bizName: g('tucu_l1_biz_name', DEFAULT_CONFIG.bizName),
      address: g('tucu_l1_address', DEFAULT_CONFIG.address),
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
    const params = new URLSearchParams(window.location.search), seedMod = global.AdminDemoSeed;
    const qRubro = params.get('rubro'), qSlug = slugParam || params.get('slug');
    const isDemo = (s) => !s || s.startsWith('demo-') || s === 'mi-comercio';
    const rubro = seedMod ? seedMod.resolveRubro(qRubro || qSlug || localStorage.getItem('tucu_l1_rubro') || 'peluqueria') : 'peluqueria';
    const meta = seedMod ? seedMod.getRubroMeta(rubro) : DEFAULT_CONFIG;
    const slug = (qSlug && (!qRubro || !isDemo(qSlug)) ? qSlug : (qRubro ? meta.slug : localStorage.getItem('tucu_l1_slug')) || meta.slug).trim();
    localStorage.setItem('tucu_l1_rubro', rubro); localStorage.setItem('tucu_l1_slug', slug);
    global.AdminThemeSync?.apply?.(rubro, 'l1');

    let assets = null;
    if (slug && !slug.startsWith('demo')) {
      for (const u of [`/api/portal/${slug}/config`, `/nexus_archives/tucu-red/clients/${slug}/client-assets.json`]) {
        try { const res = await fetch(u); if (res.ok) { const d = await res.json(); assets = d.config || d.payload || d; if (assets?.business_name || assets?.name) break; } } catch (_) {}
      }
    }
    if (assets) {
      const name = assets.business_name || assets.name || meta.bizName, sub = assets.subtitle || assets.subcategory || meta.subtitle;
      const addr = assets.address || meta.address || DEFAULT_CONFIG.address;
      const rawLogo = assets.logoUrl || assets.logo_url || assets.semantic_photos?.logo || '';
      const logo = rawLogo.startsWith('./') ? `/nexus_archives/tucu-red/clients/${slug}/${rawLogo.slice(2)}` : (rawLogo || '');
      const customAccent = assets.accentColor || assets.brand_accent;
      if (customAccent) {
        document.documentElement.style.setProperty('--tucu-primary', customAccent);
        document.documentElement.style.setProperty('--color-primary', customAccent);
        document.documentElement.style.setProperty('--brand-accent', customAccent);
      }
      localStorage.setItem('tucu_l1_biz_name', name); localStorage.setItem('tucu_l1_address', addr); localStorage.setItem('tucu_l1_subtitle', sub); localStorage.setItem('tucu_l1_logo', logo);
      if (Array.isArray(assets.services) && assets.services.length > 0 && global.adminL1Pricing?.syncFromBrand) global.adminL1Pricing.syncFromBrand(assets.services);
    } else {
      localStorage.setItem('tucu_l1_biz_name', localStorage.getItem(`tucu_l1_biz_name_${rubro}`) || meta.bizName || DEFAULT_CONFIG.bizName);
      localStorage.setItem('tucu_l1_address', localStorage.getItem(`tucu_l1_address_${rubro}`) || meta.address || DEFAULT_CONFIG.address);
      localStorage.setItem('tucu_l1_subtitle', meta.subtitle || DEFAULT_CONFIG.subtitle);
      localStorage.setItem('tucu_l1_logo', '');
    }
    renderBrandIdentity();
    global.adminL1Config?.populateInputs?.();
    global.adminL1Pricing?.renderPricing?.();
    if (global.adminL1Agenda?.loadBookings) global.adminL1Agenda.loadBookings(slug, rubro);
  }

  function renderBrandIdentity() {
    const cfg = getConfig(), seedMod = global.AdminDemoSeed;
    const rubro = localStorage.getItem('tucu_l1_rubro') || cfg.slug;
    const meta = seedMod ? seedMod.getRubroMeta(rubro) : null;
    const isDemo = !cfg.slug || cfg.slug.startsWith('demo-') || cfg.slug === 'mi-comercio';
    const initials = isDemo && meta?.initials ? meta.initials : (cfg.bizName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'BB');
    const planTitle = global.AdminFeatures?.getPlanMeta?.('l1')?.title || 'Admin · Turnos';
    const tEl = document.getElementById('brand-title'), sEl = document.getElementById('brand-subtitle'), mobEl = document.getElementById('l1-mobile-title');
    if (tEl) tEl.textContent = cfg.bizName;
    if (sEl) sEl.textContent = planTitle;
    if (mobEl) mobEl.textContent = planTitle;
    document.querySelectorAll('[data-admin-brand-initials]').forEach((el) => { el.textContent = initials; });
    global.AdminThemeSync?.syncAdminBrandLogo?.(rubro, !isDemo ? cfg.logoUrl : '');
    document.title = `${cfg.bizName} — ${planTitle}`;
  }

  function toggleTurneroActive() {
    const next = !(localStorage.getItem('tucu_l1_is_active') !== 'false');
    localStorage.setItem('tucu_l1_is_active', next ? 'true' : 'false');
    localStorage.setItem('tucu_turnero_open', next ? 'true' : 'false');
    renderTurneroSwitch();
    const slug = getConfig().slug;
    if (slug && !slug.startsWith('demo') && window.location.port !== '5174') {
      fetch(`/api/portal/${slug}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: next }) }).catch(() => {});
    }
  }

  function renderTurneroSwitch() {
    const isActive = localStorage.getItem('tucu_l1_is_active') !== 'false';
    const btn = document.getElementById('btnTurneroSwitch'), knob = document.getElementById('reception-knob');
    const badge = document.getElementById('turneroStatusBadge'), dot = document.getElementById('turneroStatusDot'), txt = document.getElementById('turneroStatusText');
    global.AdminShell?.syncReceptionPill?.(isActive);
    if (!btn || !txt) return;
    btn.style.backgroundColor = isActive ? 'var(--tucu-primary)' : '#8C8478';
    if (knob) knob.className = `w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isActive ? 'translate-x-4' : 'translate-x-0'}`;
    if (dot) dot.className = `w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-stone-500'}`;
    if (badge) badge.className = `tucu-badge border ${isActive ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700'}`;
    txt.textContent = isActive ? 'Recepción Abierta' : 'En Pausa';
  }

  function switchView(target) {
    views.forEach(v => {
      document.getElementById(`view-section-${v}`)?.classList.toggle('hidden', v !== target);
      const bDesk = document.getElementById(`main-view-btn-${v}`), bMob = document.getElementById(`mob-nav-${v}`);
      const act = v === target;
      if (bDesk) bDesk.className = act ? 'admin-nav-item tucu-sidebar-item is-active' : 'admin-nav-item tucu-sidebar-item';
      if (bMob) bMob.style.color = act ? 'var(--tucu-primary)' : '#8C8478';
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
    global.AdminManualViewer?.mount?.({ containerId: 'l1-manual-mount', level: 'l1' });
    if (global.adminL1Agenda?.init) global.adminL1Agenda.init();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }
  global.adminL1Core = { getConfig, injectClientBrand, toggleTurneroActive, switchView, toggleTheme, initTheme, updateThemeIcons };
})(typeof window !== 'undefined' ? window : global);
