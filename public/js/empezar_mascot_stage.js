// Archivo: public/js/empezar_mascot_stage.js
// Escenario de Lumi v2 (6 gestos WebM VP9 alpha + WebP fallback, nacimiento desde logo en Acto 1) (< 185L)

(function (global) {
  const CLIPS = {
    intro: { webm: '/assets/mascot/intro.webm', webp: '/assets/mascot/intro.webp', loop: false, duration: 3100 },
    idle: { webm: '/assets/mascot/idle.webm', webp: '/assets/mascot/idle.webp', loop: true, duration: 0 },
    thinking: { webm: '/assets/mascot/thinking.webm', webp: '/assets/mascot/thinking.webp', loop: true, duration: 0 },
    celebrate: { webm: '/assets/mascot/celebrate.webm', webp: '/assets/mascot/celebrate.webp', loop: false, duration: 2400 },
    wink: { webm: '/assets/mascot/wink.webm', webp: '/assets/mascot/wink.webp', loop: false, duration: 2100 },
    advisor: { webm: '/assets/mascot/advisor.webm', webp: '/assets/mascot/advisor.webp', loop: true, duration: 0 }
  };

  let layer = null, actor = null, posterEl = null, introLogoEl = null, format = null;
  let currentClip = 'idle', currentAnchor = 'header', clipTimer = null;
  const mediaPool = new Map();

  function detectFormat() {
    if (format) return format;
    const ua = navigator.userAgent || '';
    const isApple = /iPhone|iPad|iPod|Macintosh/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua);
    const v = document.createElement('video');
    format = (Boolean(v.canPlayType && v.canPlayType('video/webm; codecs="vp9"')) && !isApple) ? 'webm' : 'webp';
    return format;
  }

  function createStaticImg(src, key, cls) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'TucuRed';
    img.className = cls;
    img.dataset.clipKey = key;
    return img;
  }

  function ensureLayer() {
    if (!layer || !document.body.contains(layer)) {
      layer = document.getElementById('tucu-mascot-layer');
      if (!layer) {
        layer = document.createElement('div');
        layer.id = 'tucu-mascot-layer';
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
      }
    }
    if (!actor) {
      actor = document.getElementById('tucu-mascot-actor') || document.createElement('div');
      actor.id = 'tucu-mascot-actor';
    }
    if (!introLogoEl || introLogoEl.parentElement !== actor) {
      introLogoEl = actor.querySelector('[data-clip-key="intro-logo"]')
        || createStaticImg('/assets/tucu_red_logo.svg', 'intro-logo', 'tucu-mascot-media p-3');
      if (introLogoEl.parentElement !== actor) actor.appendChild(introLogoEl);
    }
    if (!posterEl || posterEl.parentElement !== actor) {
      posterEl = actor.querySelector('[data-clip-key="poster"]')
        || createStaticImg('/assets/mascot/mascot_poster.webp', 'poster', 'tucu-mascot-media is-clip-active');
      if (posterEl.parentElement !== actor) actor.appendChild(posterEl);
    }
    if (!document.body.contains(actor)) (document.getElementById('tucu-mascot-anchor') || layer).appendChild(actor);
    return layer;
  }

  function switchToWebpFallback() {
    if (format === 'webp') return;
    format = 'webp';
    ensureLayer();
    actor.querySelectorAll('video.tucu-mascot-media').forEach((v) => v.remove());
    mediaPool.clear();
    setClip(currentClip, { anchor: currentAnchor });
  }

  function getOrCreateMedia(name) {
    ensureLayer();
    if (mediaPool.has(name)) {
      const existing = mediaPool.get(name);
      if (existing.parentElement !== actor) actor.appendChild(existing);
      return existing;
    }
    const cfg = CLIPS[name] || CLIPS.idle;
    const fmt = detectFormat();
    const el = document.createElement(fmt === 'webm' ? 'video' : 'img');
    el.className = 'tucu-mascot-media';
    el.dataset.clipKey = name;
    el.decoding = 'async';
    if (fmt === 'webm') {
      Object.assign(el, { src: cfg.webm, muted: true, playsInline: true, loop: cfg.loop, autoplay: false, preload: 'auto' });
      el.setAttribute('muted', '');
      el.setAttribute('playsinline', '');
      el.addEventListener('error', () => { if (el.parentElement === actor) switchToWebpFallback(); });
    } else {
      el.src = cfg.webp;
      el.alt = 'Lumi';
    }
    actor.appendChild(el);
    mediaPool.set(name, el);
    return el;
  }

  function dockInto(slotEl) {
    if (!slotEl || !actor) return false;
    actor.classList.remove('is-floating-preview');
    actor.style.width = '100%';
    actor.style.height = '100%';
    actor.style.transform = '';
    if (actor.parentElement !== slotEl) slotEl.appendChild(actor);
    return true;
  }

  function positionActor(anchorMode) {
    ensureLayer();
    currentAnchor = anchorMode || currentAnchor || 'header';
    if (currentAnchor === 'center' && dockInto(document.getElementById('lumi-intro-media-slot'))) return;
    if (!dockInto(document.getElementById('tucu-mascot-anchor')) && actor.parentElement !== layer) layer.appendChild(actor);
  }

  function schedulePosition() {
    requestAnimationFrame(() => positionActor(currentAnchor));
  }

  function activateNode(targetNode) {
    if (!actor || !targetNode || targetNode.parentElement !== actor) return;
    actor.querySelectorAll('.tucu-mascot-media').forEach((node) => {
      const isMatch = node === targetNode;
      node.classList.toggle('is-clip-active', isMatch);
      if (node.tagName === 'VIDEO' && !isMatch) node.pause();
    });
  }

  function setClip(clipName, opts) {
    const options = opts || {};
    ensureLayer();
    const target = CLIPS[clipName] ? clipName : 'idle';
    const cfg = CLIPS[target];
    if (clipTimer) { clearTimeout(clipTimer); clipTimer = null; }
    positionActor(options.anchor || 'header');
    const el = getOrCreateMedia(target);
    currentClip = target;
    const standby = target === 'intro' ? introLogoEl : posterEl;

    if (el.tagName === 'VIDEO') {
      if (el.readyState >= 2 && el.videoWidth > 0) activateNode(el);
      else {
        activateNode(standby);
        const reveal = () => { if (currentClip === target && el.parentElement === actor && format === 'webm') activateNode(el); };
        el.addEventListener('loadeddata', reveal, { once: true });
        el.addEventListener('canplay', reveal, { once: true });
      }
      try { el.currentTime = 0; } catch (_) {}
      const p = el.play();
      if (p && p.catch) p.catch((err) => {
        if (err?.name !== 'AbortError' && el.parentElement === actor && (err?.name === 'NotSupportedError' || el.error)) switchToWebpFallback();
      });
      if (!cfg.loop && typeof options.onEnded === 'function') {
        const done = () => { if (clipTimer) { clearTimeout(clipTimer); clipTimer = null; } el.onended = null; options.onEnded(); };
        el.onended = done;
        clipTimer = setTimeout(done, (cfg.duration || 2400) + 500);
      }
    } else {
      if (!cfg.loop) { el.src = ''; el.src = cfg.webp; }
      activateNode(el);
      if (!cfg.loop && typeof options.onEnded === 'function') clipTimer = setTimeout(options.onEnded, cfg.duration || 2200);
    }
  }

  function mountLayer() {
    ensureLayer();
    ['intro', 'idle', 'thinking', 'celebrate', 'wink', 'advisor'].forEach((k) => getOrCreateMedia(k));
    window.addEventListener('resize', schedulePosition, { passive: true });
    window.addEventListener('scroll', schedulePosition, { passive: true });
    positionActor('header');
  }

  global.TucuMascotStage = {
    mountLayer, detectFormat, setClip, positionActor, schedulePosition, switchToWebpFallback,
    getFormat: () => detectFormat(),
    getCurrentClip: () => currentClip
  };
})(window);