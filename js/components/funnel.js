// Archivo: js/components/funnel.js
// Orquestador liviano del disparador #funnel hacia /empezar.html con soporte Safari/iOS WebP (< 75L)

import { getFunnelMarkup, EXPANDED_RUBROS, FUNNEL_LEVELS } from './funnel_markup.js';

const RUBRO_ALIASES = { barberia: 'peluqueria', resto: 'gastronomia' };

function normalizeRubro(raw) {
  const mapped = RUBRO_ALIASES[raw] || raw;
  return EXPANDED_RUBROS.some(r => r.id === mapped) ? mapped : 'peluqueria';
}

function normalizeLevel(raw) {
  const s = String(raw || '').toLowerCase().trim();
  const id = s.startsWith('l') ? s : `l${s}`;
  return FUNNEL_LEVELS.some(l => l.id === id) ? id : 'l2';
}

function hydrateFunnelMascot() {
  const mount = document.getElementById('funnel-mascot-mount');
  if (!mount) return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const ua = navigator.userAgent || '';
  const isSafari = /iPad|iPhone|iPod/.test(ua) || /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
  const useImg = (src) => {
    mount.innerHTML = `<img id="funnel-mascot-img" class="tucu-funnel-mascot w-full h-full object-contain" src="${src}" alt="" aria-hidden="true" />`;
  };
  if (reduced) return useImg('/assets/mascot/mascot_poster.webp');
  if (isSafari) return useImg('/assets/mascot/idle.webp');
  const vid = document.getElementById('funnel-mascot-video');
  const p = vid?.play?.();
  if (p?.catch) p.catch(() => useImg('/assets/mascot/idle.webp'));
}

export function renderFunnel(containerId = 'app-funnel') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (window._funnelAbort) window._funnelAbort.abort();
  const abortCtrl = new AbortController();
  window._funnelAbort = abortCtrl;
  const { signal } = abortCtrl;

  let selectedRubro = 'peluqueria';
  let selectedLevel = 'l2';
  container.innerHTML = getFunnelMarkup({}, selectedRubro, selectedLevel);
  hydrateFunnelMascot();

  const syncLaunchHref = () => {
    const btn = document.getElementById('btn-funnel-launch');
    if (btn) {
      btn.setAttribute('href', `/empezar.html?plan=${encodeURIComponent(selectedLevel)}&rubro=${encodeURIComponent(selectedRubro)}`);
    }
  };

  window.addEventListener('tucured:rubro-selected', (e) => {
    if (!e.detail?.rubro) return;
    selectedRubro = normalizeRubro(e.detail.rubro);
    syncLaunchHref();
  }, { signal });

  window.addEventListener('tucured:level-selected', (e) => {
    if (!e.detail?.level) return;
    selectedLevel = normalizeLevel(e.detail.level);
    syncLaunchHref();
  }, { signal });

  syncLaunchHref();
}
