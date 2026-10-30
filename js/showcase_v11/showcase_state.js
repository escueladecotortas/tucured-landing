// Archivo: js/showcase_v11/showcase_state.js
/**
 * ⚡ TucuRed Showcase v11.1 - Estado y Contratos de Datos Canónicos (Aura Design System)
 * Reactividad bidireccional en tiempo real, staff multi-profesional y catálogo pro.
 */

export const ShowcaseState = {
  levels: {
    l1: {
      id: 'l1', badge: 'Nivel 1 • Ágil', badgeClass: 'bg-primary/20 text-primary border-primary/30', popularBadge: 'Ideal Emprendedores', iconSymbol: 'bolt',
      name: 'Turnero WhatsApp Directo', tagline: 'Directo a tu WhatsApp • Simple, rápido y sin instalaciones',
      description: 'Tus clientes eligen día y hora en 3 toques y el turno llega formateado a tu WhatsApp.',
      adminIcon: 'settings', adminButtonLabel: 'Abrir Asistente de Configuración L1 →', adminUrl: '/admin_l1.html',
      benefits: ['Reserva directa en 3 toques desde el celular sin contraseñas.', 'Mensaje listo y ordenado en tu WhatsApp al instante.', 'Respeta tu horario de atención y corte de siesta.', 'Sin bases de datos complejas ni costos de mantenimiento.', 'Salteo automático de feriados nacionales argentinos.']
    },
    l2: {
      id: 'l2', badge: 'Nivel 2 • Autónomo', badgeClass: 'bg-secondary-container/30 text-secondary border-secondary/30', popularBadge: 'Más Elegido', iconSymbol: 'settings_suggest',
      name: 'Turnero Web 24/7 con Agenda', tagline: 'Confirmación automática en web • Tu negocio abierto las 24 horas',
      description: 'Agenda inteligente que bloquea horarios ocupados, entrega ticket y envía recordatorios.',
      adminIcon: 'monitoring', adminButtonLabel: 'Probar Panel de Gestión y Citas L2 →', adminUrl: '/admin_l2.html',
      benefits: ['Confirmación 100% web con ticket de reserva #TK-84B2.', 'Bloqueo instantáneo de horarios ya reservados.', 'El cliente autogestiona o cancela su turno con 1 clic.', 'Descarga de cita directo a Google Calendar y Apple (.ics).', 'Directorio de clientes con historial de visitas.']
    },
    l3: {
      id: 'l3', badge: 'Nivel 3 • Equipos', badgeClass: 'bg-primary-container/30 text-primary-fixed border-primary-container/40', popularBadge: 'Equipos, Consultorios, Franquicias y Complejos', iconSymbol: 'groups',
      name: 'Turnero Multi-Profesional & Catálogo Pro', tagline: 'Gestión completa multi-profesional • Para clínicas, salones y clubes',
      description: 'Múltiples especialistas con horarios propios, catálogo con duración y panel de administración.',
      adminIcon: 'groups', adminButtonLabel: 'Abrir Panel Multi-Staff y Métricas L3 →', adminUrl: '/admin_l3.html',
      benefits: ['Agenda individual por empleado con días y horarios propios.', 'Catálogo de servicios con cálculo dinámico de duración.', 'Campos especiales por rubro (Obra Social, etc.).', 'Panel administrativo con agenda dual y métricas en vivo.', 'Avisos y recordatorios automáticos por WhatsApp.']
    }
  },

  rubros: {
    estetica: {
      id: 'estetica', name: 'Estética', bizName: 'Lumina Uñas & Estética', badgeL1: '★ ATENCIÓN PERSONALIZADA', subCategory: 'Estética & Bienestar',
      accentColor: '#D4AF37', btnClass: 'bg-gradient-to-r from-[#D4AF37] to-[#B18D28] text-[#0F0F10] font-bold shadow-lg shadow-[#D4AF37]/20', focusBorder: 'focus:border-[#D4AF37]', heroImage: '/assets/showcase/hero_unas.webp', iconSymbol: 'spa',
      options: ['Lifting de Pestañas', 'Esmaltado Semipermanente', 'Limpieza Facial'],
      days: ['Vie 24 Octubre', 'Sáb 25 Octubre', 'Dom 26 Octubre', 'Lun 27 Octubre'],
      staff: ['Micaela (Master Lash)', 'Valentina (Cosmiatra)', 'Cualquiera (Sin Preferencia)'],
      catalogL3: [{ name: 'Lifting + Nutrición', dur: '45 min • $18' }, { name: 'Limpieza Facial Profunda', dur: '60 min • $25' }]
    },
    resto: {
      id: 'resto', name: 'Gastro', bizName: 'La Casona Restó', badgeL1: '🍷 RESERVA GASTRONÓMICA', subCategory: 'Gastronomía & Tragos',
      accentColor: '#E07A5F', btnClass: 'bg-gradient-to-r from-[#E07A5F] to-[#C85A3F] text-white font-bold shadow-lg shadow-[#E07A5F]/20', focusBorder: 'focus:border-[#E07A5F]', heroImage: '/assets/showcase/hero_resto.png', iconSymbol: 'restaurant',
      options: ['2 Personas', '4 Personas', '6 Personas', '+8 Grupo'],
      days: ['Jue 23 Octubre', 'Vie 24 Octubre', 'Sáb 25 Octubre', 'Dom 26 Octubre'],
      staff: ['Julián (Sommelier)', 'Automática (Mesa Libre)'],
      catalogL3: [{ name: 'Maridaje Gourmet', dur: '120 min • $45' }, { name: 'Degustación de Vinos', dur: '60 min • $25' }]
    },
    barberia: {
      id: 'barberia', name: 'Barbería', bizName: 'The Barber Club', badgeL1: '✂️ CORTE & ESTILO', subCategory: 'Barbería Tradicional',
      accentColor: '#D97706', btnClass: 'bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold shadow-lg shadow-[#D97706]/20', focusBorder: 'focus:border-[#D97706]', heroImage: '/assets/showcase/hero_peluqueria.webp', iconSymbol: 'content_cut',
      options: ['Corte Tradicional', 'Corte + Barba', 'Servicio VIP The Barber'],
      days: ['Lun 14 Octubre', 'Mar 15 Octubre', 'Mié 16 Octubre', 'Jue 17 Octubre'],
      staff: ['Franco (Master Fade)', 'Lucas (Barba & Afeitado)', 'Cualquiera (Primer Sillón Libre)'],
      catalogL3: [{ name: 'Corte Signature + Perfilado', dur: '45 min • $16' }, { name: 'Corte + Barba Completa', dur: '60 min • $24' }]
    },
    deportes: {
      id: 'deportes', name: 'Deportes', bizName: 'Deportes Club', badgeL1: '⚡ CANCHA ILUMINADA', subCategory: 'Complejo Deportivo',
      accentColor: '#84CC16', btnClass: 'bg-gradient-to-r from-[#84CC16] to-[#65A30D] text-[#0F0F10] font-bold shadow-lg shadow-[#84CC16]/20', focusBorder: 'focus:border-[#84CC16]', heroImage: '/assets/showcase/hero_sports.png', iconSymbol: 'sports_tennis',
      options: ['Turno 60 Minutos', 'Turno 90 Minutos', 'Clase Particular'],
      days: ['Mié 22 Octubre', 'Jue 23 Octubre', 'Vie 24 Octubre', 'Sáb 25 Octubre'],
      staff: ['Profe Gastón (Nivel Avanzado)', 'Profe Martín (Iniciación)'],
      catalogL3: [{ name: 'Clase Particular con Profe', dur: '60 MIN • $30' }, { name: 'Turno Cancha Panorámica', dur: '90 MIN • $25' }]
    },
    salud: {
      id: 'salud', name: 'Salud', label: 'Salud & Consultorios', bizName: 'Centro Médico & Especialidades', badgeL1: '🩺 CONSULTORIO MÉDICO', subCategory: 'Medicina General & Odontología',
      accentColor: '#0D9488', btnClass: 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white font-bold shadow-lg shadow-[#0D9488]/20', focusBorder: 'focus:border-[#0D9488]', heroImage: '/assets/showcase/hero_salud.webp', iconSymbol: 'medical_services',
      icon: '🩺', requireInsurance: true,
      options: ['Consulta Clínica General', 'Control Odontológico', 'Evaluación Diagnóstica'],
      days: ['Lun 20 Octubre', 'Mar 21 Octubre', 'Mié 22 Octubre', 'Jue 23 Octubre'],
      staff: ['Dra. Sofía Mendoza (Clínica)', 'Dr. Carlos Ruiz (Diagnóstico)', 'Dra. Lucía Albarracín (Odonto)'],
      catalogL3: [{ name: 'Consulta Médica General', dur: '20 min • $20' }, { name: 'Evaluación Diagnóstica Completa', dur: '40 min • $35' }]
    }
  },

  currentLevel: 'l1',
  currentRubro: 'estetica',
  currentStep: 1,
  selectedDay: 0,
  selectedTime: '16:30',
  selectedOption: 0,
  selectedStaff: 0,
  clientFirstName: 'Martín',
  clientLastName: 'Rodríguez',
  clientPhone: '381 555-4321',
  clientInsurance: 'OSDE',
  isSelfService: false,
  selectedReason: 0,
  listeners: [],

  subscribe(listener) { this.listeners.push(listener); },
  notify() { this.listeners.forEach(fn => fn(this)); },

  getSelectedDayLabel() {
    const r = this.rubros[this.currentRubro];
    return (r && r.days && r.days[this.selectedDay]) ? r.days[this.selectedDay] : 'Viernes 24 Octubre';
  },

  getFormattedWhatsAppMessage() {
    const r = this.rubros[this.currentRubro];
    const opt = r.options[this.selectedOption || 0] || r.options[0];
    const dayStr = this.getSelectedDayLabel();
    const name = `${this.clientFirstName} ${this.clientLastName}`.trim() || 'Martín Rodríguez';
    const time = this.selectedTime || '16:30';
    if (this.currentRubro === 'resto') {
      return `¡Hola! Quiero reservar mesa en ${r.bizName}:\n- Comensales: ${opt}\n- Día: ${dayStr} - ${time} hs\n- Nombre: ${name}`;
    }
    if (this.currentRubro === 'barberia') {
      return `¡Hola! Quiero reservar en ${r.bizName}:\n- Servicio: ${opt}\n- Día: ${dayStr} - ${time} hs\n- Nombre: ${name}`;
    }
    if (this.currentRubro === 'deportes') {
      return `¡Hola! Quiero alquilar cancha en ${r.bizName}:\n- Duración: ${opt}\n- Día: ${dayStr} - ${time} hs\n- Nombre: ${name}`;
    }
    if (this.currentRubro === 'salud') {
      return `¡Hola! Solicito turno médico en ${r.bizName}:\n- Especialidad: ${opt}\n- Cobertura: ${this.clientInsurance || 'OSDE'}\n- Día: ${dayStr} - ${time} hs\n- Paciente: ${name}`;
    }
    return `¡Hola! Quiero reservar mi turno en ${r.bizName}:\n- Servicio: ${opt}\n- Día: ${dayStr} - ${time} hs\n- Nombre: ${name}`;
  },

  setLevel(levelId) {
    if (this.levels[levelId]) {
      this.currentLevel = levelId;
      this.currentStep = 1;
      this.isSelfService = false;
      this.notify();
    }
  },

  setRubro(rubroId) {
    if (this.rubros[rubroId]) {
      this.currentRubro = rubroId;
      this.currentStep = 1;
      this.selectedOption = 0;
      this.selectedStaff = 0;
      this.isSelfService = false;
      this.notify();
    }
  },

  setStep(step) {
    this.currentStep = Math.max(1, Math.min(3, step));
    this.isSelfService = false;
    this.notify();
  },

  setSelfService(active) {
    this.isSelfService = !!active;
    this.notify();
  }
};
