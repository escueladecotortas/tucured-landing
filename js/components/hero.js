// Archivo: js/components/hero.js
/**
 * 🏙️ Tucu Red Web V2 - Director de Escena 3D & Sequencer Cíclico
 * Orquesta 1 card protagónica por acto (~13s loop), sheen especular y lerp interactivo.
 */

import { getHeroMarkup } from './hero_markup.js';

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
  if (!container) return;
  container.innerHTML = getHeroMarkup();

  const [stage, scene, sheen] = ['hero-phone-stage', 'hero-iso-scene', 'hero-screen-sheen'].map(id => document.getElementById(id));
  const [cardTurno, cardRevenue, cardPayment] = ['pop-card-appointment', 'pop-card-revenue', 'pop-card-payment'].map(id => document.getElementById(id));
  const [slot1700, revenueVal, splinePath, shieldIcon] = ['hero-slot-1700', 'hero-revenue-val', 'hero-spline-path', 'hero-shield-icon'].map(id => document.getElementById(id));
  if (!stage || !scene) return;

  // Secuenciador Cíclico en 3 Actos (~13s Loop)
  let timers = [];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  if (window._heroClearTimers) window._heroClearTimers();
  window._heroClearTimers = clearTimers;

  const triggerSheen = () => {
    if (!sheen) return;
    sheen.classList.remove('sheen-active');
    void sheen.offsetWidth;
    sheen.classList.add('sheen-active');
  };

  const resetAll = () => {
    [cardTurno, cardRevenue, cardPayment].forEach(c => c?.classList.remove('card-act-1', 'card-act-2', 'card-act-3', 'hero-card-active'));
    slot1700?.classList.remove('slot-pulse-emerald');
    splinePath?.classList.remove('rev-spline-drawn');
    shieldIcon?.classList.remove('shield-glow-active');
    if (revenueVal) revenueVal.textContent = '$184.500';
  };

  const runDirector = () => {
    clearTimers();
    resetAll();

    // Acto 1 (0.0s – 3.2s): Turno Mateo
    cardTurno?.classList.add('card-act-1', 'hero-card-active');
    slot1700?.classList.add('slot-pulse-emerald');
    triggerSheen();

    // Pausa Limpia 1 (3.2s – 4.2s)
    timers.push(setTimeout(() => {
      cardTurno?.classList.remove('card-act-1', 'hero-card-active');
      slot1700?.classList.remove('slot-pulse-emerald');
    }, 3200));

    // Acto 2 (4.2s – 7.8s): Facturación en Vivo + SVG + Contador
    timers.push(setTimeout(() => {
      cardRevenue?.classList.add('card-act-2', 'hero-card-active');
      splinePath?.classList.add('rev-spline-drawn');
      animateCounter(revenueVal, 184500, 209000, 1200);
      triggerSheen();
    }, 4200));

    // Pausa Limpia 2 (7.8s – 8.8s)
    timers.push(setTimeout(() => {
      cardRevenue?.classList.remove('card-act-2', 'hero-card-active');
      splinePath?.classList.remove('rev-spline-drawn');
    }, 7800));

    // Acto 3 (8.8s – 12.0s): Pago Verificado + Escudo Destellante
    timers.push(setTimeout(() => {
      cardPayment?.classList.add('card-act-3', 'hero-card-active');
      shieldIcon?.classList.add('shield-glow-active');
      triggerSheen();
    }, 8800));

    // Reset y Respiro Final (12.0s – 13.0s)
    timers.push(setTimeout(() => {
      cardPayment?.classList.remove('card-act-3', 'hero-card-active');
      shieldIcon?.classList.remove('shield-glow-active');
      if (revenueVal) revenueVal.textContent = '$184.500';
    }, 12000));

    // Reinicio Cíclico
    timers.push(setTimeout(runDirector, 13000));
  };

  // Disparo inicial tras render
  timers.push(setTimeout(runDirector, 200));

  // Parallax Isométrico Reactivo al Cursor (Lerp)
  let curX = 0, curY = 0, tarX = 0, tarY = 0, running = false;
  const baseRot = { x: 9, y: -14, z: 1.5 };

  const update = () => {
    curX += (tarX - curX) * 0.12; curY += (tarY - curY) * 0.12;
    stage.style.transform = `rotateX(${baseRot.x - curY * 7}deg) rotateY(${baseRot.y + curX * 10}deg) rotateZ(${baseRot.z + curX * 1.5}deg)`;
    if (Math.abs(curX - tarX) > 0.001 || Math.abs(curY - tarY) > 0.001) {
      requestAnimationFrame(update);
    } else {
      curX = tarX; curY = tarY; running = false;
    }
  };

  const handleMove = (x, y) => {
    const r = scene.getBoundingClientRect();
    tarX = Math.max(-1, Math.min(1, ((x - r.left) / r.width - 0.5) * 2));
    tarY = Math.max(-1, Math.min(1, ((y - r.top) / r.height - 0.5) * 2));
    stage.classList.remove('floating');
    if (!running) { running = true; requestAnimationFrame(update); }
  };

  const handleLeave = () => {
    tarX = 0; tarY = 0;
    if (!running) { running = true; requestAnimationFrame(update); }
    setTimeout(() => { if (!running) stage.classList.add('floating'); }, 600);
  };

  scene.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
  scene.addEventListener('mouseleave', handleLeave);
  scene.addEventListener('touchmove', (e) => e.touches?.[0] && handleMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  scene.addEventListener('touchend', handleLeave);
}
