// Archivo: js/showcase_v11/showcase_controller.js
// Orquestador reactivo Showroom V2 (Seccion 1 Turnero + Seccion 2 Paneles de Dueno) (< 145L)

import { ShowcaseState, RUBRO_ORDER, RUBROS, preloadShowcaseAssets } from './showcase_state.js';
import { ShowcaseCarousel } from './showcase_carousel.js';
import { ShowcaseMobileModal } from './showcase_modal_mobile.js';
import { renderClientSectionShell, renderClientToggleMarkup, renderClientMobileCard, renderClientEditorialCard } from './showcase_v2_ui.js';
import { renderAdminSectionShell, renderAdminSelectorMarkup, renderAdminMobileCard, renderAdminValueCard } from './showcase_admin_ui.js';

export const ShowcaseController = {
  _mounted: false, _subscribed: false, _abort: null, _lastClientUrl: '', _lastAdminUrl: '',

  init() {
    if (this._abort) this._abort.abort();
    const ac = new AbortController();
    this._abort = ac;
    preloadShowcaseAssets();

    if (!this._subscribed) {
      ShowcaseState.subscribe(() => this.sync());
      this._subscribed = true;
    }

    const root = document.getElementById('showroom-v2-root');
    if (root) {
      root.innerHTML = renderClientSectionShell(ShowcaseState) + renderAdminSectionShell(ShowcaseState);
      this._mounted = true; this._lastClientUrl = ''; this._lastAdminUrl = '';
      ShowcaseCarousel.mount(document.getElementById('showroom-carousel-host'), RUBRO_ORDER.map(k => RUBROS[k]), ShowcaseState.currentRubro, (r) => this.selectRubro(r));
      this._bindDomEvents(root, ac.signal);
    }

    window.ShowcaseState = ShowcaseState;
    window.ShowcaseCore = this;

    window.addEventListener('tucured:sync-showroom', (e) => {
      if (e.detail?.rubro) ShowcaseState.setRubro(e.detail.rubro);
      if (e.detail?.level) ShowcaseState.setLevel(e.detail.level);
    }, { signal: ac.signal });

    const mq = window.matchMedia('(min-width: 1024px)');
    mq.addEventListener('change', () => {
      if (mq.matches && ShowcaseMobileModal.isOpen()) this.closeMobileModal();
      this.sync();
    }, { signal: ac.signal });

    this.sync();
    return this;
  },

  _bindDomEvents(root, signal) {
    root.addEventListener('click', (e) => {
      const lvlBtn = e.target.closest('[data-showroom-level]');
      if (lvlBtn) { this.selectLevel(lvlBtn.getAttribute('data-showroom-level')); return; }

      const openBtn = e.target.closest('[data-open-fullscreen]');
      if (openBtn) { this.openMobileModal(openBtn.getAttribute('data-open-fullscreen')); return; }

      if (e.target.closest('#btn-showroom-activate')) {
        window.activateFromShowroom?.(ShowcaseState.currentRubro, ShowcaseState.currentLevel);
      }
    }, { signal });

    root.addEventListener('change', (e) => {
      if (e.target?.id === 'chk-client-multistaff') ShowcaseState.setClientMultiStaff(e.target.checked);
    }, { signal });

    document.getElementById('showroom-client-iframe')?.addEventListener('load', () => {
      if (this._lastClientUrl) document.getElementById('showroom-client-desktop-loader')?.classList.add('hidden');
    }, { signal });
    document.getElementById('showroom-admin-iframe')?.addEventListener('load', () => {
      if (this._lastAdminUrl) document.getElementById('showroom-admin-desktop-loader')?.classList.add('hidden');
    }, { signal });
  },

  _syncIframe(iframeId, loaderId, nextUrl, cacheKey) {
    const iframe = document.getElementById(iframeId);
    if (!iframe || nextUrl === this[cacheKey]) return;
    this[cacheKey] = nextUrl;
    document.getElementById(loaderId)?.classList.remove('hidden');
    iframe.src = nextUrl;
  },

  sync() {
    if (!this._mounted) return;
    ShowcaseCarousel.syncActive(ShowcaseState.currentRubro, RUBROS);

    const setH = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    setH('showroom-client-toggle-host', renderClientToggleMarkup(ShowcaseState));
    setH('showroom-client-mobile-host', renderClientMobileCard(ShowcaseState));
    setH('showroom-client-editorial-host', renderClientEditorialCard(ShowcaseState));
    setH('showroom-admin-selector-host', renderAdminSelectorMarkup(ShowcaseState));
    setH('showroom-admin-mobile-host', renderAdminMobileCard(ShowcaseState));
    setH('showroom-admin-value-host', renderAdminValueCard(ShowcaseState));

    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      this._syncIframe('showroom-client-iframe', 'showroom-client-desktop-loader', ShowcaseState.getClientDemoUrl(), '_lastClientUrl');
      this._syncIframe('showroom-admin-iframe', 'showroom-admin-desktop-loader', ShowcaseState.getAdminDemoUrl(), '_lastAdminUrl');
    }
    if (ShowcaseMobileModal.isOpen()) ShowcaseMobileModal.sync(ShowcaseState);
  },

  selectRubro(rubro) { ShowcaseState.setRubro(rubro); },
  selectLevel(level) { ShowcaseState.setLevel(level); },
  setViewMode(mode) { ShowcaseState.setViewMode(mode); },
  getState() { return ShowcaseState; },

  openMobileModal(mode = 'client') {
    ShowcaseState.setViewMode(mode === 'admin' ? 'admin' : 'client');
    ShowcaseState.setMobileModal(true);
    ShowcaseMobileModal.open(ShowcaseState, {
      onClose: () => this.closeMobileModal(),
      onMode: (m) => this.setViewMode(m)
    });
  },

  closeMobileModal() {
    ShowcaseMobileModal.close();
    ShowcaseState.setMobileModal(false);
  }
};
