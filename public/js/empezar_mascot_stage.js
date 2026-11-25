// Archivo: public/js/empezar_mascot_stage.js
// Escenario flotante GPU-friendly (.webm VP9 alpha + fallback .webp animado + poster) (< 165L)

window.TucuMascotStage = (function () {
  const CLIPS = ['intro', 'idle', 'thinking', 'celebrate'];
  const POSTER_SRC = '/assets/mascot/mascot_poster.webp';

  let layerEl = null;
  let actorEl = null;
  let format = 'poster';
  let activeClip = 'idle';
  let activeAnchor = 'guide';
  let endTimer = null;
  let rafId = null;
  let bound = false;

  const isReducedMotion = () =>
    typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  function detectFormat() {
    if (isReducedMotion()) return 'poster';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isSafariOrIos = /iPad|iPhone|iPod/.test(ua) || (/^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua));
    if (isSafariOrIos) return 'webp';
    try {
      const v = document.createElement('video');
      if (v.canPlayType && v.canPlayType('video/webm; codecs="vp9"')) return 'webm';
    } catch {}
    return 'webp';
  }

  function buildMediaNodes(mode) {
    if (mode === 'poster') {
      return `<img class="tucu-m-clip is-active" data-clip="poster" src="${POSTER_SRC}" alt="" />`;
    }
    if (mode === 'webp') {
      return `<img class="tucu-m-clip is-active" data-clip="poster" src="${POSTER_SRC}" alt="" />` +
        CLIPS.map(id => `<img class="tucu-m-clip" data-clip="${id}" src="/assets/mascot/${id}.webp" alt="" decoding="async" />`).join('');
    }
    return `<img class="tucu-m-clip is-active" data-clip="poster" src="${POSTER_SRC}" alt="" />` +
      CLIPS.map(id => {
        const loopAttr = (id === 'idle' || id === 'thinking') ? ' loop' : '';
        return `<video class="tucu-m-clip" data-clip="${id}" muted playsinline preload="auto"${loopAttr} poster="${POSTER_SRC}"><source src="/assets/mascot/${id}.webm" type="video/webm" /></video>`;
      }).join('');
  }

  function switchToWebpFallback() {
    if (format === 'webp' || format === 'poster' || !actorEl) return;
    format = 'webp';
    actorEl.innerHTML = buildMediaNodes('webp');
    setClip(activeClip);
  }

  function mountLayer() {
    if (layerEl && document.body.contains(layerEl)) return;
    format = detectFormat();
    layerEl = document.createElement('div');
    layerEl.id = 'tucu-mascot-layer';
    layerEl.setAttribute('aria-hidden', 'true');
    actorEl = document.createElement('div');
    actorEl.id = 'tucu-mascot-actor';
    actorEl.innerHTML = buildMediaNodes(format);
    layerEl.appendChild(actorEl);
    document.body.appendChild(layerEl);

    if (!bound) {
      bound = true;
      const onMove = () => schedulePosition();
      window.addEventListener('resize', onMove, { passive: true });
      window.addEventListener('scroll', onMove, { passive: true });
    }
  }

  function computeTargetRect(anchorMode) {
    const isDesktop = window.innerWidth >= 1024;
    if (anchorMode === 'intro' && isDesktop) {
      const logo = document.getElementById('emp-header-logo');
      if (logo) {
        const r = logo.getBoundingClientRect();
        return { x: Math.min(window.innerWidth - 220, r.right + 14), y: Math.max(4, r.top - 18), w: 192, h: 108 };
      }
    }
    if (anchorMode === 'celebrate' && isDesktop) {
      const phone = document.getElementById('preview-phone-chassis');
      if (phone) {
        const r = phone.getBoundingClientRect();
        return { x: Math.max(12, r.left + (r.width - 128) / 2), y: Math.max(66, r.top - 34), w: 128, h: 128 };
      }
    }
    const slot = document.getElementById('tucu-mascot-slot');
    if (slot) {
      const r = slot.getBoundingClientRect();
      return { x: r.left, y: r.top, w: Math.max(88, r.width), h: Math.max(88, r.height) };
    }
    return { x: 16, y: 80, w: 96, h: 96 };
  }

  function positionActor(anchorMode = activeAnchor) {
    activeAnchor = anchorMode;
    if (!actorEl) return;
    const t = computeTargetRect(anchorMode);
    const w = activeClip === 'intro' && anchorMode === 'guide' ? Math.round(t.h * 1.6) : t.w;
    const x = activeClip === 'intro' && anchorMode === 'guide' ? Math.max(8, t.x - (w - t.w) / 2) : t.x;
    actorEl.style.width = `${Math.round(w)}px`;
    actorEl.style.height = `${Math.round(t.h)}px`;
    actorEl.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(t.y)}px, 0)`;
  }

  function schedulePosition() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => { rafId = null; positionActor(activeAnchor); });
  }

  function setClip(clipName, { anchor, onEnded } = {}) {
    mountLayer();
    activeClip = CLIPS.includes(clipName) ? clipName : 'idle';
    if (anchor) activeAnchor = anchor;
    clearTimeout(endTimer);

    const nodes = [...actorEl.querySelectorAll('.tucu-m-clip')];
    const target = format === 'poster'
      ? actorEl.querySelector('[data-clip="poster"]')
      : actorEl.querySelector(`[data-clip="${activeClip}"]`);

    nodes.forEach(n => n.classList.toggle('is-active', n === target));
    positionActor(activeAnchor);

    if (format === 'webm' && target?.tagName === 'VIDEO') {
      target.onended = null;
      if (activeClip === 'intro' || activeClip === 'celebrate') {
        try { target.currentTime = 0; } catch {}
        target.onended = () => { if (activeClip === clipName) onEnded?.(); };
      }
      const p = target.play();
      if (p?.catch) p.catch(() => switchToWebpFallback());
    } else if (activeClip === 'intro' || activeClip === 'celebrate') {
      endTimer = setTimeout(() => { if (activeClip === clipName) onEnded?.(); }, format === 'poster' ? 900 : 3900);
    }
  }

  return { mountLayer, detectFormat, setClip, positionActor, schedulePosition, getFormat: () => format };
})();
