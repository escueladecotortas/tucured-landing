// Archivo: js/main.js
/**
 * ⚡ Tucu Red Web V2 - Orquestador Principal de Módulos (Aura Light + Escenario 3 Zonas)
 * Monta la interfaz desacoplada y enlaza el motor interactivo unificado.
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

import { renderNavbar } from './components/navbar.js';
import { renderHero } from './components/hero.js';
import { renderStageUnified } from './components/stage_unified.js';
import { renderFeatures } from './components/features.js';
import { renderPricing } from './components/pricing.js';
import { renderFaqAccordion } from './components/faq_accordion.js';
import { renderFunnel } from './components/funnel.js';
import { renderFooter } from './components/footer.js';
import { ShowcaseCore } from './showcase_v11/showcase_core.js';
import { initHeroAnamorphic } from './components/hero-anamorphic.js';
import { initShowroom } from './components/showroom.js';

function bootApplication() {
  renderNavbar('app-navbar');
  const heroAnamorphic = renderHero('app-hero');
  renderStageUnified('app-stage');
  renderFeatures('app-features');
  renderPricing('app-pricing');
  renderFaqAccordion('app-faq');
  renderFunnel('app-funnel');
  renderFooter('app-footer');

  // Inicializar el motor interactivo del Escenario 3 Zonas
  ShowcaseCore.init();
  const showroomManager = initShowroom('showroom');

  // Handler global para activación directa desde el Escenario hacia el Wizard
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
