// Archivo: js/components/funnel.js
// Orquestador liviano del disparador #funnel hacia /empezar.html con soporte Safari/iOS WebP (< 65L)

import { getFunnelMarkup } from './funnel_markup.js';

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

  container.innerHTML = getFunnelMarkup();
  hydrateFunnelMascot();

  const btn = document.getElementById('btn-funnel-launch');
  if (btn) btn.setAttribute('href', '/empezar.html');
}