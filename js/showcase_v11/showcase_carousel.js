// Archivo: js/showcase_v11/showcase_carousel.js
// Carrusel horizontal de 6 rubros auto-deslizante con pausa de 3.5s tras interaccion (< 120L)

function buildChipHtml(r, activeId) {
  const on = r.id === activeId;
  const cls = on ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-sm' : 'bg-white/90 text-stone-700 border-stone-200 font-semibold hover:border-stone-300 hover:bg-white';
  return `<button type="button" id="showroom-rubro-btn-${r.id}" data-showroom-rubro="${r.id}" class="${cls} whitespace-nowrap shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm transition-all cursor-pointer"><span class="w-2 h-2 rounded-full shrink-0" style="background-color:${on ? '#F97316' : r.accent}"></span><span>${r.shortLabel}</span></button>`;
}

export const ShowcaseCarousel = {
  _rafId: 0, _paused: false, _hovering: false, _reduced: false, _resumeTimer: null, _abort: null, _track: null, _pos: 0, _dir: 1, _lastTs: 0,

  mount(hostEl, rubrosList, activeId, onSelect) {
    this.destroy();
    if (!hostEl) return;
    this._paused = false; this._hovering = false; this._dir = 1; this._lastTs = 0;
    this._reduced = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

    hostEl.innerHTML = `<div id="showroom-carousel-wrap" class="relative max-w-4xl mx-auto">
      <div class="showroom-carousel-fade-left pointer-events-none absolute inset-y-0 left-0 w-7 z-10 lg:hidden" aria-hidden="true"></div>
      <div id="showroom-rubro-track" role="tablist" aria-label="Rubros disponibles" class="flex items-center gap-2 overflow-x-auto showroom-no-scrollbar px-5 sm:px-3 py-1 lg:justify-center">
        ${rubrosList.map(r => buildChipHtml(r, activeId)).join('')}
      </div>
      <div class="showroom-carousel-fade-right pointer-events-none absolute inset-y-0 right-0 w-7 z-10 lg:hidden" aria-hidden="true"></div>
    </div>`;

    const wrap = hostEl.querySelector('#showroom-carousel-wrap'), track = hostEl.querySelector('#showroom-rubro-track');
    this._track = track; this._pos = 0;
    const ac = new AbortController(); this._abort = ac;
    ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach(ev => wrap?.addEventListener(ev, () => this.pauseTemporarily(3500), { passive: true, signal: ac.signal }));
    wrap?.addEventListener('mouseenter', () => { this._hovering = true; this.pauseTemporarily(3500); }, { signal: ac.signal });
    wrap?.addEventListener('mouseleave', () => { this._hovering = false; this.pauseTemporarily(3500); }, { signal: ac.signal });
    track?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-showroom-rubro]'); if (!btn) return;
      this.pauseTemporarily(3500); onSelect?.(btn.getAttribute('data-showroom-rubro'));
    }, { signal: ac.signal });
    if (!this._reduced) this._startLoop();
  },

  pauseTemporarily(ms = 3500) {
    this._paused = true; this._stopRaf();
    if (this._resumeTimer) { clearTimeout(this._resumeTimer); this._resumeTimer = null; }
    if (this._track) this._pos = this._track.scrollLeft;
    if (this._reduced || this._hovering) return;
    this._resumeTimer = setTimeout(() => {
      this._resumeTimer = null;
      if (!this._track || this._hovering || this._reduced) return;
      this._paused = false; this._pos = this._track.scrollLeft; this._lastTs = 0; this._startLoop();
    }, ms);
  },

  _stopRaf() {
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = 0; }
    this._lastTs = 0;
  },

  _startLoop() {
    this._stopRaf();
    const tick = (ts) => {
      if (this._paused || !this._track) return;
      const track = this._track, maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      if (maxScroll > 4) {
        if (!this._lastTs) this._lastTs = ts;
        const dt = Math.min(0.05, Math.max(0, (ts - this._lastTs) / 1000));
        this._lastTs = ts; this._pos += this._dir * 28 * dt;
        if (this._pos >= maxScroll) { this._pos = maxScroll; this._dir = -1; } else if (this._pos <= 0) { this._pos = 0; this._dir = 1; }
        track.scrollLeft = this._pos;
      } else { this._lastTs = ts; }
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  },

  syncActive(activeId, rubrosMap) {
    if (!this._track) return;
    this._track.querySelectorAll('[data-showroom-rubro]').forEach((btn) => {
      const id = btn.getAttribute('data-showroom-rubro'), on = id === activeId, accent = rubrosMap?.[id]?.accent || '#EA580C';
      btn.className = `${on ? 'bg-stone-900 text-white border-stone-900 font-bold shadow-sm' : 'bg-white/90 text-stone-700 border-stone-200 font-semibold hover:border-stone-300 hover:bg-white'} whitespace-nowrap shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs sm:text-sm transition-all cursor-pointer`;
      const dot = btn.querySelector('span'); if (dot) dot.style.backgroundColor = on ? '#F97316' : accent;
    });
  },

  destroy() {
    this._paused = true; this._stopRaf();
    if (this._resumeTimer) { clearTimeout(this._resumeTimer); this._resumeTimer = null; }
    if (this._abort) { this._abort.abort(); this._abort = null; }
    this._track = null;
  }
};
