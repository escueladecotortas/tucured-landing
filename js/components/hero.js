// Archivo: js/components/hero.js
/**
 * 🏙️ Tucu Red Web V2 - Director del Hero Anamórfico 3D & Audio Interactivo
 * Control de reproducción de video Kiro, conmutación de audio y perspectiva forzada.
 * Restricción estricta: < 200 líneas.
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
  const video = document.getElementById('kiro-hero-video');
  const audioBtn = document.getElementById('kiro-audio-toggle');
  const audioIcon = document.getElementById('kiro-audio-icon');
  const audioLabel = document.getElementById('kiro-audio-label');
  const ctaPrimary = document.getElementById('hero-cta-primary');

  // Inicializar Motor Anamórfico 3D sobre el Chasis de Kiro
  let anamorphic = null;
  if (stage) {
    anamorphic = initHeroAnamorphic({
      stageId: 'hero-stage',
      chassisId: 'hero-phone-stage',
      backlightId: 'hero-ambient-backlight'
    });
    window._heroAnamorphicInstance = anamorphic;
  }

  // Lógica de Conmutación de Audio Interactivo (Glassmorphic)
  if (video && audioBtn) {
    audioBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted) {
        video.play().catch(() => {});
        if (audioIcon) audioIcon.textContent = 'volume_up';
        if (audioLabel) audioLabel.textContent = 'Silenciar';
        audioBtn.setAttribute('aria-label', 'Silenciar sonido');
        audioBtn.classList.add('bg-indigo-950/90', 'border-indigo-400/50');
      } else {
        if (audioIcon) audioIcon.textContent = 'volume_off';
        if (audioLabel) audioLabel.textContent = 'Activar sonido';
        audioBtn.setAttribute('aria-label', 'Activar sonido');
        audioBtn.classList.remove('bg-indigo-950/90', 'border-indigo-400/50');
      }
    });
  }

  // Botón CTA Primario: Pre-seleccionar Nivel 2 y scroll fluido a #precios
  if (ctaPrimary) {
    ctaPrimary.addEventListener('click', (e) => {
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
    });
  }

  return anamorphic;
}
