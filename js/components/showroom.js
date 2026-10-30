// Archivo: js/components/showroom.js
/**
 * 📱 Tucu Red Web V2 - Controlador Reactivo del Showroom Interactivo
 * Sincroniza en tiempo real los 5 rubros, 3 niveles, cross-fade y embudo.
 * Restricción estricta: < 200 líneas.
 */

import { ShowcaseState } from '../showcase_v11/showcase_state.js';

export const SHOWROOM_DATA = {
  rubros: {
    barberia: {
      id: 'barberia',
      name: 'Barbería',
      bizName: 'The Barber Club',
      badge: '✂️ CORTE & ESTILO',
      mainService: 'Corte Tradicional',
      durationPrice: '45 min • $16.000',
      waTemplate: '¡Hola! Quiero reservar en The Barber Club:\n- Servicio: {servicio}\n- Día: {dia} - {hora} hs\n- Nombre: {nombre}'
    },
    gastronomia: {
      id: 'resto',
      alias: 'gastronomia',
      name: 'Gastronomía',
      bizName: 'La Casona Restó',
      badge: '🍷 RESERVA GASTRONÓMICA',
      mainService: 'Mesa 4 Personas',
      durationPrice: '120 min • Carta libre',
      waTemplate: '¡Hola! Quiero reservar mesa en La Casona Restó:\n- Comensales: {servicio}\n- Día: {dia} - {hora} hs\n- Nombre: {nombre}'
    },
    estetica: {
      id: 'estetica',
      name: 'Estética & Spa',
      bizName: 'Lumina Uñas & Estética',
      badge: '★ ATENCIÓN PERSONALIZADA',
      mainService: 'Lifting de Pestañas',
      durationPrice: '45 min • $18.000',
      waTemplate: '¡Hola! Quiero reservar turno en Lumina Uñas & Estética:\n- Servicio: {servicio}\n- Día: {dia} - {hora} hs\n- Nombre: {nombre}'
    },
    deportes: {
      id: 'deportes',
      name: 'Deportes / Pádel',
      bizName: 'Deportes Club',
      badge: '⚡ CANCHA ILUMINADA',
      mainService: 'Turno Cancha 90 Min',
      durationPrice: '90 min • $25.000',
      waTemplate: '¡Hola! Quiero alquilar cancha en Deportes Club:\n- Turno: {servicio}\n- Día: {dia} - {hora} hs\n- Nombre: {nombre}'
    },
    salud: {
      id: 'salud',
      name: 'Salud & Clínicas',
      bizName: 'Centro Médico Especialidades',
      badge: '🩺 CONSULTORIO MÉDICO',
      mainService: 'Consulta Clínica General',
      durationPrice: '20 min • Con Cobertura',
      waTemplate: '¡Hola! Solicito turno médico en Centro Médico Especialidades:\n- Consulta: {servicio}\n- Día: {dia} - {hora} hs\n- Paciente: {nombre}'
    }
  },
  levels: {
    1: { id: 'l1', title: 'Turnero Express WhatsApp', badge: 'Ágil' },
    2: { id: 'l2', title: 'Turnero Web 24/7 con Agenda', badge: 'Más Elegido' },
    3: { id: 'l3', title: 'Turnero Multi-Profesional & Catálogo Pro', badge: 'Equipos' }
  }
};

class ShowroomManager {
  constructor() {
    this.abortController = null;
    this.root = null;
    this.state = {
      currentRubro: 'estetica',
      currentLevel: 1
    };
  }

  init(rootId = 'showroom') {
    this.root = document.getElementById(rootId);
    if (!this.root) return;

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    // Sincronizar estado local con ShowcaseState
    ShowcaseState.subscribe((st) => {
      this.state.currentRubro = st.currentRubro;
      this.state.currentLevel = st.currentLevel === 'l1' ? 1 : (st.currentLevel === 'l2' ? 2 : 3);
    });

    // Delegación de eventos sobre el contenedor del Showroom
    this.root.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-showroom-rubro]');
      if (tabBtn) {
        const rubroKey = tabBtn.getAttribute('data-showroom-rubro');
        this.setRubro(rubroKey);
      }
      const lvlBtn = e.target.closest('[data-showroom-level]');
      if (lvlBtn) {
        const lvlKey = lvlBtn.getAttribute('data-showroom-level');
        this.setLevel(lvlKey);
      }
    }, { signal });

    // Escuchar sincronización externa
    window.addEventListener('tucured:sync-showroom', (e) => {
      if (e.detail?.rubro) this.setRubro(e.detail.rubro);
      if (e.detail?.level) this.setLevel(e.detail.level);
    }, { signal });
  }

  triggerCrossFade() {
    const mockupScreen = document.querySelector('.showroom-mockup-viewport') ||
      document.querySelector('#mockup-container > div');
    if (!mockupScreen) return;

    mockupScreen.classList.add('fade-animating');
    setTimeout(() => {
      mockupScreen.classList.remove('fade-animating');
    }, 170);
  }

  setRubro(rubroId) {
    const targetId = (rubroId === 'gastronomia') ? 'resto' : rubroId;
    if (ShowcaseState.currentRubro === targetId) return;

    this.triggerCrossFade();
    ShowcaseState.setRubro(targetId);
    this.state.currentRubro = targetId;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tucured:rubro-selected', {
        detail: { rubro: targetId, original: rubroId }
      }));
    }
  }

  setLevel(level) {
    const lvlKey = typeof level === 'number' ? `l${level}` : level;
    if (ShowcaseState.currentLevel === lvlKey) return;

    this.triggerCrossFade();
    ShowcaseState.setLevel(lvlKey);
    this.state.currentLevel = lvlKey === 'l1' ? 1 : (lvlKey === 'l2' ? 2 : 3);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tucured:level-selected', {
        detail: { level: lvlKey }
      }));
    }
  }

  destroy() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export const showroomInstance = new ShowroomManager();

export function initShowroom(rootId = 'showroom') {
  showroomInstance.init(rootId);
  return showroomInstance;
}

