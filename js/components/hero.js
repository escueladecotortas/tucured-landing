// Archivo: js/components/hero.js
/**
 * 🏙️ Tucu Red Web V2 - Director de Escena & Orquestador Anamórfico
 * Enlaza HeroAnamorphic (< 200L) y comanda el secuenciador cinemático en 3 actos.
 */

import { getHeroMarkup } from './hero_markup.js';
import { initHeroAnamorphic } from './hero-anamorphic.js';

function animateCounter(el, start, end, duration) {
  if (!el) return;
  const t0 = performance.now();
  const step = (now) => {
    const p = Math.min((now - t0) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = `$${Math.floor(start + (end - start) * ease).toLocaleString('es-AR')}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function renderHero(containerId = 'app-hero') {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Limpieza preventiva de instancias y timers previos
  if (window._heroAnamorphicInstance) {
    window._heroAnamorphicInstance.destroy();
    window._heroAnamorphicInstance = null;
  }
  if (window._heroClearTimers) {
    window._heroClearTimers();
  }

  container.innerHTML = getHeroMarkup();

  const stage = document.getElementById('hero-stage');
  const sheen = document.getElementById('hero-screen-sheen');
  const [cardRevenue, cardTurno, cardPayment] = ['pop-card-revenue', 'pop-card-appointment', 'pop-card-payment'].map(id => document.getElementById(id));
  const [slot1700, revenueVal, splinePath, shieldIcon] = ['hero-slot-1700', 'hero-revenue-val', 'hero-spline-path', 'hero-shield-icon'].map(id => document.getElementById(id));

  if (!stage) return null;

  // Inicializar Motor Anamórfico Desacoplado
  const anamorphic = initHeroAnamorphic({
    stageId: 'hero-stage',
    chassisId: 'hero-phone-stage',
    backlightId: 'hero-ambient-backlight',
    cardsContainerId: 'hero-cards-stage'
  });
  window._heroAnamorphicInstance = anamorphic;

  let timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  window._heroClearTimers = clearTimers;

  const triggerSheenBurst = () => {
    if (!sheen) return;
    sheen.classList.remove('sheen-burst');
    void sheen.offsetWidth;
    sheen.classList.add('sheen-burst');
  };

  const resetAllCards = () => {
    [cardTurno, cardRevenue, cardPayment].forEach(c => c?.classList.remove('card-active'));
    slot1700?.classList.remove('slot-pulse-emerald');
    splinePath?.classList.remove('rev-spline-drawn');
    shieldIcon?.classList.remove('shield-glow-active');
    if (revenueVal) revenueVal.textContent = '$184.500';
  };

  const runDirector = () => {
    clearTimers();
    resetAllCards();

    // Acto 1 (0.0s – 3.2s): Turno Mateo (Break-the-Glass Z=75px)
    cardTurno?.classList.add('card-active');
    slot1700?.classList.add('slot-pulse-emerald');
    triggerSheenBurst();
    anamorphic.pulseBacklight();

    // Pausa Limpia 1 (3.2s – 4.2s)
    timers.push(setTimeout(() => {
      cardTurno?.classList.remove('card-active');
      slot1700?.classList.remove('slot-pulse-emerald');
    }, 3200));

    // Acto 2 (4.2s – 7.8s): Facturación en Vivo + Spline SVG + Contador
    timers.push(setTimeout(() => {
      cardRevenue?.classList.add('card-active');
      splinePath?.classList.add('rev-spline-drawn');
      animateCounter(revenueVal, 184500, 209000, 1200);
      triggerSheenBurst();
      anamorphic.pulseBacklight();
    }, 4200));

    // Pausa Limpia 2 (7.8s – 8.8s)
    timers.push(setTimeout(() => {
      cardRevenue?.classList.remove('card-active');
      splinePath?.classList.remove('rev-spline-drawn');
    }, 7800));

    // Acto 3 (8.8s – 12.0s): Pago Verificado + Escudo Resplandeciente
    timers.push(setTimeout(() => {
      cardPayment?.classList.add('card-active');
      shieldIcon?.classList.add('shield-glow-active');
      triggerSheenBurst();
      anamorphic.pulseBacklight();
    }, 8800));

    // Reset y Respiro Final (12.0s – 13.0s)
    timers.push(setTimeout(() => {
      cardPayment?.classList.remove('card-active');
      shieldIcon?.classList.remove('shield-glow-active');
      if (revenueVal) revenueVal.textContent = '$184.500';
    }, 12000));

    // Reinicio Cíclico
    timers.push(setTimeout(runDirector, 13000));
  };

  timers.push(setTimeout(runDirector, 250));

  return anamorphic;
}
