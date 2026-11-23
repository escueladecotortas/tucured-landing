// Archivo: public/js/admin_shared/admin_theme_sync.js
// Paleta Heredada, Logo Real .webp de Rubro & Drawer de Filtros Compartido (< 130L)

(function (global) {
  const FALLBACK_THEMES = {
    peluqueria: { bg: '#B45309', hover: '#92400E', panelBg: '#F1EBE3', softBg: '#FFFBEB', softText: '#92400E', softBorder: '#FCD34D', accentLight: '#FCD34D', demoLogo: '/assets/logos/demo_peluqueria.webp' },
    estetica: { bg: '#8C6D46', hover: '#725736', panelBg: '#EFEAE1', softBg: 'rgba(140,109,70,0.10)', softText: '#6F5535', softBorder: 'rgba(140,109,70,0.40)', accentLight: '#E7D3B7', demoLogo: '/assets/logos/demo_estetica.webp' },
    gastronomia: { bg: '#C85A3F', hover: '#A8462E', panelBg: '#F2EAE4', softBg: '#FFF7ED', softText: '#A8462E', softBorder: 'rgba(200,90,63,0.40)', accentLight: '#FDBA74', demoLogo: '/assets/logos/demo_gastronomia.webp' },
    deportes: { bg: '#15803D', hover: '#166534', panelBg: '#EAEFE9', softBg: '#ECFDF5', softText: '#065F46', softBorder: '#6EE7B7', accentLight: '#86EFAC', demoLogo: '/assets/logos/demo_deportes.webp' },
    salud: { bg: '#0F766E', hover: '#115E59', panelBg: '#EBF1F0', softBg: '#F0FDFA', softText: '#115E59', softBorder: '#5EEAD4', accentLight: '#99F6E4', demoLogo: '/assets/logos/demo_salud.webp' },
    servicios: { bg: '#4338CA', hover: '#3730A3', panelBg: '#ECEEF4', softBg: '#EEF2FF', softText: '#3730A3', softBorder: '#A5B4FC', accentLight: '#C7D2FE', demoLogo: '/assets/logos/demo_servicios.webp' }
  };

  function normalizeRubro(raw) {
    const s = String(raw || '').toLowerCase().trim().replace(/^demo-/, '');
    if (s === 'barberia' || s === 'peluqueria' || s.includes('barber') || (s.includes('peluq') && !s.includes('estet'))) return 'peluqueria';
    if (s === 'peluqueria_estetica' || s.includes('estet')) return 'estetica';
    if (s === 'resto' || s === 'gastronomia' || s.includes('gastro')) return 'gastronomia';
    if (s === 'salud_consultorio' || s.includes('salud') || s.includes('medic')) return 'salud';
    if (s === 'deportes_clubes' || s.includes('deport') || s.includes('club')) return 'deportes';
    if (s.includes('servic') || s.includes('consultor')) return 'servicios';
    return 'peluqueria';
  }

  function detectLevel(levelHint) {
    if (levelHint && /^(l1|l2|l3)$/i.test(levelHint)) return String(levelHint).toLowerCase();
    const p = typeof window !== 'undefined' ? String(window.location?.pathname || '').toLowerCase() : '';
    return p.includes('admin_l3') ? 'l3' : (p.includes('admin_l2') ? 'l2' : 'l1');
  }

  function resolveTheme(rubro) {
    const norm = normalizeRubro(rubro), fb = FALLBACK_THEMES[norm] || FALLBACK_THEMES.peluqueria;
    return { norm, ...fb, ...(global.TucuCoverData?.RUBRO_THEMES?.[norm] || {}) };
  }

  function resolveActiveRubro(rubroHint, levelHint) {
    if (rubroHint) return normalizeRubro(rubroHint);
    const lvl = detectLevel(levelHint), p = new URLSearchParams(typeof window !== 'undefined' ? window.location?.search || '' : '');
    const qRubro = p.get('rubro'), qSlug = p.get('slug') || '';
    if (qRubro) return normalizeRubro(qRubro);
    if (qSlug.startsWith('demo-') && qSlug !== 'demo-central') return normalizeRubro(qSlug);
    try { const s = localStorage.getItem(`tucu_${lvl}_rubro`); if (s) return normalizeRubro(s); } catch (_) {}
    return lvl === 'l2' ? 'estetica' : 'peluqueria';
  }

  function syncAdminBrandLogo(rubro, customLogoUrl = '') {
    if (typeof document === 'undefined') return;
    const qLogo = new URLSearchParams(window.location?.search || '').get('logo');
    const url = String(qLogo || '').toLowerCase() === 'none' ? '' : (customLogoUrl || resolveTheme(rubro).demoLogo || '');
    document.querySelectorAll('[data-admin-brand-slot]').forEach((slot) => {
      const initEl = slot.querySelector('[data-admin-brand-initials]');
      let img = slot.querySelector('[data-admin-brand-logo]');
      if (!img) { img = document.createElement('img'); img.setAttribute('data-admin-brand-logo', ''); img.alt = 'Logo'; slot.appendChild(img); }
      const sizeCls = slot.dataset.adminBrandSlot === 'mobile' ? 'w-8 h-8' : 'w-9 h-9';
      img.className = `${sizeCls} rounded-xl object-contain bg-white border border-stone-200/80 dark:border-stone-700 p-0.5 shrink-0 ${url ? '' : 'hidden'}`;
      if (url) {
        img.onerror = () => { img.classList.add('hidden'); initEl?.classList.remove('hidden'); };
        if (img.getAttribute('src') !== url) img.setAttribute('src', url);
        initEl?.classList.add('hidden');
      } else {
        img.removeAttribute('src');
        initEl?.classList.remove('hidden');
      }
    });
  }

  function bindFilterDrawer(btnId, drawerId, countFn, onToggle) {
    if (typeof document === 'undefined') return null;
    const btn = document.getElementById(btnId), drawer = document.getElementById(drawerId);
    if (!btn || !drawer) return null;
    btn._tucuDrawerCfg = { drawerId, countFn, onToggle };
    const syncBadge = () => {
      const cfg = btn._tucuDrawerCfg || {}, dw = document.getElementById(cfg.drawerId);
      const count = Math.max(0, Number(cfg.countFn?.() || 0)), isOpen = Boolean(dw && !dw.classList.contains('hidden'));
      const lbl = btn.querySelector('[data-filters-label]') || btn;
      lbl.textContent = count > 0 ? `Filtros · ${count}` : 'Filtros';
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.classList.toggle('tucu-primary-soft', isOpen || count > 0);
    };
    if (!btn._tucuDrawerBound) {
      btn._tucuDrawerBound = true;
      btn.addEventListener('click', () => {
        const cfg = btn._tucuDrawerCfg || {}, dw = document.getElementById(cfg.drawerId); if (!dw) return;
        const nextOpen = dw.classList.toggle('hidden') === false;
        cfg.onToggle?.(nextOpen);
        syncBadge();
      });
    }
    syncBadge();
    return { syncBadge };
  }

  function apply(rubroHint, levelHint) {
    const lvl = detectLevel(levelHint), active = resolveActiveRubro(rubroHint, lvl), theme = resolveTheme(active);
    if (typeof document !== 'undefined' && document.documentElement) {
      const root = document.documentElement, st = root.style;
      [['--tucu-primary', theme.bg], ['--tucu-primary-hover', theme.hover], ['--tucu-panel-bg', theme.panelBg], ['--tucu-soft-bg', theme.softBg], ['--tucu-soft-text', theme.softText], ['--tucu-soft-border', theme.softBorder], ['--tucu-accent-light', theme.accentLight || '#FCD34D'], ['--color-primary', theme.bg], ['--color-primary-hover', theme.hover], ['--brand-accent', theme.bg]].forEach(([k, v]) => st.setProperty(k, v));
      root.dataset.tucuRubro = theme.norm;
      root.dataset.tucuLevel = lvl;
      if (document.body) syncAdminBrandLogo(theme.norm);
    }
    return theme;
  }

  apply();
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => apply());
  }

  global.AdminThemeSync = { FALLBACK_THEMES, normalizeRubro, detectLevel, resolveTheme, apply, syncAdminBrandLogo, bindFilterDrawer };
})(typeof window !== 'undefined' ? window : global);
