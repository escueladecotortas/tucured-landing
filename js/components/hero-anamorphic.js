// Archivo: js/components/hero-anamorphic.js
/**
 * hero-anamorphic.js
 * Control de física inercial, perspectiva forzada y ciclo de vida DOM.
 * Restricción estricta: < 200 líneas.
 */

export class HeroAnamorphic {
  constructor(options = {}) {
    this.stage = document.getElementById(options.stageId || 'hero-stage');
    this.chassis = document.getElementById(options.chassisId || 'hero-phone-stage');
    this.backlight = document.getElementById(options.backlightId || 'hero-ambient-backlight');
    this.cardsContainer = document.getElementById(options.cardsContainerId || 'hero-cards-stage');

    // Multiplicadores Z por Capa
    this.multipliers = {
      backlight: 0.02,
      chassis: 0.05,
      cards: 0.12
    };

    // Física Inercial (Lerp / Damping)
    this.lerpFactor = 0.08;
    this.curX = 0;
    this.curY = 0;
    this.tarX = 0;
    this.tarY = 0;

    // Inclinación Base Isométrica
    this.baseRot = { x: 6, y: -12 };

    this.rafId = null;
    this.isTicking = false;
    this.abortController = null;
    this.isPointerFine = false;

    this.init();
  }

  init() {
    if (!this.stage || !this.chassis) return;

    // Detección por media query (puntero fino y hover)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    this.isPointerFine = mediaQuery.matches;

    if (!this.isPointerFine) {
      this.applyStaticTilt();
      return;
    }

    this.setupListeners();
    this.resumeLoop();
  }

  applyStaticTilt() {
    this.chassis.style.transform = `rotateY(${this.baseRot.y}deg) rotateX(${this.baseRot.x}deg)`;
    if (this.backlight) {
      this.backlight.style.transform = 'translate3d(-50%, -50%, -60px)';
    }
    if (this.cardsContainer) {
      this.cardsContainer.style.transform = 'translate3d(0, 0, 0)';
    }
  }

  setupListeners() {
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    const onPointerMove = (e) => {
      const rect = this.stage.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      this.tarX = Math.max(-1, Math.min(1, normX));
      this.tarY = Math.max(-1, Math.min(1, normY));
      this.resumeLoop();
    };

    const onPointerLeave = () => {
      this.tarX = 0;
      this.tarY = 0;
      this.resumeLoop();
    };

    this.stage.addEventListener('pointermove', onPointerMove, { signal, passive: true });
    this.stage.addEventListener('pointerleave', onPointerLeave, { signal, passive: true });
  }

  resumeLoop() {
    if (!this.isTicking) {
      this.isTicking = true;
      this.rafId = requestAnimationFrame(this.render.bind(this));
    }
  }

  render() {
    // Interpolar coordenadas con Lerp
    this.curX += (this.tarX - this.curX) * this.lerpFactor;
    this.curY += (this.tarY - this.curY) * this.lerpFactor;

    // Capa 0: Backlight Atmosférico Emisivo (factor 0.02)
    if (this.backlight) {
      const bX = -50 + this.curX * (this.multipliers.backlight * 120);
      const bY = -50 + this.curY * (this.multipliers.backlight * 120);
      this.backlight.style.transform = `translate3d(${bX.toFixed(2)}%, ${bY.toFixed(2)}%, -60px)`;
    }

    // Capa 1: Chasis & Marco Físico (factor 0.05, base rotateY(-12deg) rotateX(6deg))
    const rotX = this.baseRot.x - this.curY * (this.multipliers.chassis * 120);
    const rotY = this.baseRot.y + this.curX * (this.multipliers.chassis * 160);
    this.chassis.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;

    // Capa 3: Tarjetas Flotantes Break-the-Glass (factor 0.12)
    if (this.cardsContainer) {
      const cX = this.curX * (this.multipliers.cards * 45);
      const cY = this.curY * (this.multipliers.cards * 45);
      this.cardsContainer.style.transform = `translate3d(${cX.toFixed(2)}px, ${cY.toFixed(2)}px, 0)`;
    }

    const deltaX = Math.abs(this.tarX - this.curX);
    const deltaY = Math.abs(this.tarY - this.curY);

    if (deltaX > 0.0005 || deltaY > 0.0005) {
      this.rafId = requestAnimationFrame(this.render.bind(this));
    } else {
      this.curX = this.tarX;
      this.curY = this.tarY;
      this.isTicking = false;
    }
  }

  pulseBacklight() {
    if (!this.backlight) return;
    this.backlight.classList.remove('pulse-active');
    void this.backlight.offsetWidth;
    this.backlight.classList.add('pulse-active');
  }

  destroy() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isTicking = false;
  }
}

/**
 * Función helper de inicialización rápida
 */
export function initHeroAnamorphic(options = {}) {
  return new HeroAnamorphic(options);
}
