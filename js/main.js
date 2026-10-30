// Archivo: js/main.js
/**
 * ⚡ Tucu Red Web V2 - Orquestador Principal de Módulos (Aura Light + Showroom v11.1)
 * Monta la interfaz desacoplada y enlaza el motor interactivo multi-rubro.
 */

import { renderNavbar } from './components/navbar.js';
import { renderHero } from './components/hero.js';
import { renderCases } from './components/cases.js';
import { renderShowroomView } from './components/showroom_view.js';
import { renderFeatures } from './components/features.js';
import { renderFunnel } from './components/funnel.js';
import { renderFooter } from './components/footer.js';
import { ShowcaseCore } from './showcase_v11/showcase_core.js';
import { initHeroAnamorphic } from './components/hero-anamorphic.js';
import { initShowroom } from './components/showroom.js';

function bootApplication() {
  renderNavbar('app-navbar');
  const heroAnamorphic = renderHero('app-hero');
  renderCases('app-cases');
  renderShowroomView('app-showroom');
  renderFeatures('app-features');
  renderFunnel('app-funnel');
  renderFooter('app-footer');

  // Inicializar el motor interactivo del Showroom tras montar sus nodos DOM
  ShowcaseCore.init();
  const showroomManager = initShowroom('showroom');

  return { heroAnamorphic, showroomManager };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApplication);
} else {
  bootApplication();
}

export { bootApplication, initHeroAnamorphic, initShowroom };
