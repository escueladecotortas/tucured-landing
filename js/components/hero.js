// Archivo: js/components/hero.js
/**
 * 🏙️ Tucu Red Web V2 - Director del Hero & Terminal Física de Mostrador
 * Control del chasis de mostrador Kiosk Pro, perspectiva 3D interactiva y navegación.
 * Restricción estricta: < 200 líneas (< 180L).
 */

import { getHeroMarkup } from './hero_markup.js';
import { initHeroAnamorphic } from './hero-anamorphic.js';

export function renderHero(containerId = 'app-hero') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Limpieza preventiva de instancias previas
  if (window._heroAnamorphicInstance) {
    window._heroAnamorphicInstance.destroy();
    window._heroAnamorphicInstance = null;
  }

  container.innerHTML = getHeroMarkup();

  const stage = document.getElementById('hero-stage');
  const ctaPrimary = document.getElementById('hero-cta-primary');
  const terminalCta = document.getElementById('hero-terminal-cta');

  // Inicializar Motor Anamórfico 3D sobre el Chasis de la Terminal
  let anamorphic = null;
  if (stage) {
    anamorphic = initHeroAnamorphic({
      stageId: 'hero-stage',
      chassisId: 'hero-phone-stage',
      backlightId: 'hero-ambient-backlight'
    });
    window._heroAnamorphicInstance = anamorphic;
  }

  // Interacción en Pantalla Táctil: Selección de slots de horario
  container.querySelectorAll('.terminal-slot-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.terminal-slot-chip').forEach(c => c.classList.remove('terminal-slot-active'));
      chip.classList.add('terminal-slot-active');
      if (anamorphic && typeof anamorphic.pulseBacklight === 'function') {
        anamorphic.pulseBacklight();
      }
    });
  });

  const navigateToPrecios = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tucured:level-selected', {
        detail: { level: 'l2', levelNumber: 2 }
      }));
    }
    const target = document.getElementById('precios') || document.getElementById('app-pricing');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Botones CTAs hacia Precios y Activación de Nivel 2
  ctaPrimary?.addEventListener('click', navigateToPrecios);
  terminalCta?.addEventListener('click', navigateToPrecios);

  return anamorphic;
}
