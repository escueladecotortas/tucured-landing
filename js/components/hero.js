// Archivo: js/components/hero.js
/**
 * 🏙️ Tucu Red Web V2 - Director del Hero & Terminal Física de Mostrador
 * Control del chasis de mostrador Kiosk Pro, perspectiva 3D táctil mobile y navegación.
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

import { getHeroMarkup } from './hero_markup.js';
import { initHeroAnamorphic } from './hero-anamorphic.js';
import { triggerSensoryFeedback } from '../utils/sound_fx.js';

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
  const chassis = document.getElementById('hero-phone-stage');
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

  // Interacción Táctil 4D en Mobile sobre el Chasis
  if (chassis) {
    chassis.style.transition = 'transform 0.15s ease-out';

    const handleTouch = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = chassis.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotY = Math.max(-14, Math.min(14, ((touch.clientX - centerX) / (rect.width / 2)) * 10));
      const rotX = Math.max(-14, Math.min(14, -((touch.clientY - centerY) / (rect.height / 2)) * 10));
      chassis.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.01)`;
    };

    chassis.addEventListener('touchstart', handleTouch, { passive: true });
    chassis.addEventListener('touchmove', handleTouch, { passive: true });
    chassis.addEventListener('touchend', () => {
      chassis.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      chassis.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
      setTimeout(() => { chassis.style.transition = 'transform 0.15s ease-out'; }, 400);
    }, { passive: true });
  }

  // Interacción en Pantalla Táctil: Selección de slots de horario con Haptics y Audio nativo
  container.querySelectorAll('.terminal-slot-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      triggerSensoryFeedback();
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
