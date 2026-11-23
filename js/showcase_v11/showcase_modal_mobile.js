// Archivo: js/showcase_v11/showcase_modal_mobile.js
// Pop-up inmersivo 100dvh en movil para probar Turnero Unico o Panel de Dueno elegido (< 115L)

const SVG_CLOSE = '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';

export const ShowcaseMobileModal = {
  _prevOverflow: '', _lastUrl: '', _abort: null, _handlers: null,

  isOpen() { return Boolean(typeof document !== 'undefined' && document.getElementById('showroom-mobile-modal')); },

  _headerText(state) {
    const r = state.getCurrentRubro(), l = state.getCurrentLevel();
    return state.viewMode === 'admin' ? `Panel ${l.shortLabel} · ${r.bizName}` : `Turnero · ${r.bizName}`;
  },

  open(state, handlers = {}) {
    if (typeof document === 'undefined' || !state) return;
    this._handlers = handlers;
    if (this.isOpen()) { this.sync(state); return; }

    this._prevOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';

    const url = state.getDemoUrl(), isAdmin = state.viewMode === 'admin', lvl = state.getCurrentLevel().shortLabel;
    const root = document.createElement('div');
    root.id = 'showroom-mobile-modal';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Prueba interactiva en pantalla completa');
    root.style.zIndex = '90';
    root.className = 'fixed inset-0 z-50 h-[100dvh] w-full bg-stone-950 flex flex-col overflow-hidden';

    root.innerHTML = `
      <header class="px-3 py-2.5 bg-stone-950 text-white border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
        <button type="button" id="btn-showroom-modal-close" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer transition-colors shrink-0">
          ${SVG_CLOSE}<span>Volver</span>
        </button>
        <span id="showroom-modal-title" class="text-[11px] font-semibold text-white/80 truncate">${this._headerText(state)}</span>
        <div role="group" aria-label="Cambiar vista" class="inline-flex items-center p-0.5 rounded-xl bg-stone-800 border border-white/10 gap-0.5 shrink-0">
          <button type="button" id="btn-modal-mode-client" data-modal-mode="client" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${!isAdmin ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'}">Turnero</button>
          <button type="button" id="btn-modal-mode-admin" data-modal-mode="admin" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${isAdmin ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'}">${lvl}</button>
        </div>
      </header>
      <div class="relative flex-1 bg-white overflow-hidden">
        <div id="showroom-modal-loader" class="absolute inset-0 flex items-center justify-center bg-white z-10 pointer-events-none transition-opacity duration-200">
          <div class="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <iframe id="showroom-mobile-iframe" src="${url}" title="Demo interactiva Tucu Red" class="w-full h-full border-0 bg-white block"></iframe>
      </div>`;

    document.body.appendChild(root);
    this._lastUrl = url;
    const ac = new AbortController();
    this._abort = ac;

    root.querySelector('#showroom-mobile-iframe')?.addEventListener('load', () => {
      document.getElementById('showroom-modal-loader')?.classList.add('hidden');
    }, { signal: ac.signal });
    root.querySelector('#btn-showroom-modal-close')?.addEventListener('click', () => this._handlers?.onClose?.(), { signal: ac.signal });
    root.querySelectorAll('[data-modal-mode]').forEach((btn) => {
      btn.addEventListener('click', () => this._handlers?.onMode?.(btn.getAttribute('data-modal-mode')), { signal: ac.signal });
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._handlers?.onClose?.(); }, { signal: ac.signal });
  },

  sync(state) {
    const root = typeof document !== 'undefined' ? document.getElementById('showroom-mobile-modal') : null;
    if (!root || !state) return;

    const isAdmin = state.viewMode === 'admin', lvl = state.getCurrentLevel().shortLabel;
    const titleEl = root.querySelector('#showroom-modal-title'); if (titleEl) titleEl.textContent = this._headerText(state);
    const cBtn = root.querySelector('#btn-modal-mode-client'), aBtn = root.querySelector('#btn-modal-mode-admin');
    if (cBtn) cBtn.className = `px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${!isAdmin ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'}`;
    if (aBtn) { aBtn.textContent = lvl; aBtn.className = `px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${isAdmin ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-300 hover:text-white'}`; }

    const nextUrl = state.getDemoUrl(), iframe = root.querySelector('#showroom-mobile-iframe'), loader = root.querySelector('#showroom-modal-loader');
    if (iframe && nextUrl !== this._lastUrl) {
      this._lastUrl = nextUrl; loader?.classList.remove('hidden'); iframe.src = nextUrl;
    }
  },

  close() {
    if (this._abort) { this._abort.abort(); this._abort = null; }
    const root = typeof document !== 'undefined' ? document.getElementById('showroom-mobile-modal') : null;
    if (root) { root.remove(); document.body.style.overflow = this._prevOverflow; }
    this._lastUrl = '';
  }
};
