// Archivo: js/main.js
// Orquestador principal de landing Tucu Red con Showroom V2 (< 55L)

import { renderNavbar } from './components/navbar.js';
import { renderHero } from './components/hero.js';
import { renderStageUnified } from './components/stage_unified.js';
import { renderFeatures } from './components/features.js';
import { renderPricing } from './components/pricing.js';
import { renderFaqAccordion } from './components/faq_accordion.js';
import { renderFunnel } from './components/funnel.js';
import { renderFooter } from './components/footer.js';
import { ShowcaseController } from './showcase_v11/showcase_controller.js';
import { initHeroAnamorphic } from './components/hero-anamorphic.js';

function initShowroom() {
  return ShowcaseController.init();
}

function bootApplication() {
  renderNavbar('app-navbar');
  const heroAnamorphic = renderHero('app-hero');
  renderStageUnified('app-stage');
  renderFeatures('app-features');
  renderPricing('app-pricing');
  renderFaqAccordion('app-faq');
  renderFunnel('app-funnel');
  renderFooter('app-footer');

  const showroomManager = initShowroom();

  window.activateFromShowroom = (rubro, level) => {
    window.dispatchEvent(new CustomEvent('tucured:rubro-selected', { detail: { rubro } }));
    window.dispatchEvent(new CustomEvent('tucured:level-selected', { detail: { level } }));
    const funnelEl = document.getElementById('funnel') || document.getElementById('app-funnel');
    if (funnelEl) funnelEl.scrollIntoView({ behavior: 'smooth' });
  };

  return { heroAnamorphic, showroomManager };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApplication);
} else {
  bootApplication();
}

export { bootApplication, initHeroAnamorphic, initShowroom };
