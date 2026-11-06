// Archivo: js/showcase_v11/showcase_state.js
/**
 * ⚡ TucuRed Showcase v11.1 - Estado y Contratos de Datos Canónicos (SSOT v16.0)
 * Sincronizado con Matriz v16, Regla de Domingo Cerrado, Preload WebP y Filtro de Horarios.
 * Restricción estricta: < 200 líneas (< 175L) y Protocolo PEAC.
 */

export function getSystemCalendar() {
  const now = new Date();
  const rawMonth = now.toLocaleDateString('es-AR', { month: 'long' });
  const mesActual = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const diasReales = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const diaNum = d.getDay();
    return {
      diaNombre: diasSemana[diaNum], diaNumero: d.getDate(),
      isToday: i === 0, isSunday: diaNum === 0,
      dateStr: d.toISOString().split('T')[0],
      fullLabel: `${diasSemana[diaNum]} ${d.getDate()} de ${mesActual}`
    };
  });
  return { mesActual, diasReales };
}

export function isSelectedDaySunday(state) {
  const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
  const idx = state ? (state.selectedDay || 0) : 0;
  const d = (cal.diasReales && cal.diasReales[idx]) ? cal.diasReales[idx] : null;
  return d ? (d.isSunday || d.diaNombre === 'Dom') : false;
}

export function isTimePast(timeStr, state) {
  const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
  const idx = state ? (state.selectedDay || 0) : 0;
  const d = (cal.diasReales && cal.diasReales[idx]) ? cal.diasReales[idx] : null;
  if (!d || !d.isToday) return false;
  const now = new Date();
  const [hStr, mStr] = String(timeStr).split(':');
  const slotMinutes = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
  return slotMinutes < (now.getHours() * 60 + now.getMinutes());
}

export function preloadShowcaseAssets() {
  if (typeof window === 'undefined') return;
  Object.values(ShowcaseState.rubros).forEach(r => {
    if (r.heroImage) { const img = new Image(); img.src = r.heroImage; }
  });
}

const sysCalendar = getSystemCalendar();

export const ShowcaseState = {
  systemCalendar: sysCalendar,

  levels: {
    l1: {
      id: 'l1', badge: 'Nivel 1 • Autónomo', badgeClass: 'bg-primary/20 text-primary border-primary/30', popularBadge: 'Ideal Emprendedores', iconSymbol: 'bolt',
      name: 'Turnero Autónomo Express', tagline: 'Zero Server Runtime • Reserva en 3 toques directo a WhatsApp',
      description: 'Opera en base multitenant tucured-clients con bloqueo en vivo, Hash #TK-XXXX y cancelación en 1 clic.',
      adminIcon: 'settings', adminButtonLabel: 'Ver Panel Asistente L1', adminUrl: '/admin_l1.html',
      benefits: ['Alojado en base multitenant tucured-clients con bloqueo en tiempo real.', 'Reserva directa en 3 toques desde el celular sin contraseñas.', 'Comprobante Hash #TK-XXXX y portal de autogestión/cancelación en 1 clic.', 'Cobro de seña con Alias tucured.mp y duración por servicio.', 'Salteo automático de feriados nacionales argentinos.']
    },
    l2: {
      id: 'l2', badge: 'Nivel 2 • Central Pro', badgeClass: 'bg-secondary-container/30 text-secondary border-secondary/30', popularBadge: 'Control Operativo Total', iconSymbol: 'settings_suggest',
      name: 'Central Operativa & Agenda Pro', tagline: 'Bloqueo en tiempo real • Comprobante con link de autogestión',
      description: 'Agenda inteligente en instancia dedicada con turnos de mostrador y CRM Anti-No-Show.',
      adminIcon: 'monitoring', adminButtonLabel: 'Ver Panel de Citas L2', adminUrl: '/admin_l2.html',
      benefits: ['Prevención de solapamiento y bloqueo de horarios ocupados en tiempo real.', 'Comprobante Hash #TK-XXXX con link de autogestión y cancelación en 1 clic.', 'Panel de gobernanza con Lista Negra anti-ausencias y Lista Blanca VIP.', 'Despacho automático desatendido por WhatsApp (Baileys) con fallback.', 'Tablero de KPIs en vivo: ocupación diaria y total histórico de citas.']
    },
    l3: {
      id: 'l3', badge: 'Nivel 3 • Multi-Equipo', badgeClass: 'bg-primary-container/30 text-primary-fixed border-primary-container/40', popularBadge: 'Equipos, Consultorios y Complejos', iconSymbol: 'groups',
      name: 'Multi-Staff & Franquicias', tagline: 'Agendas independientes por profesional • Catálogo con duración dinámica',
      description: 'Múltiples especialistas con horarios propios, cálculo de bloques contiguos y recordatorios automáticos cron T-2hs.',
      adminIcon: 'groups', adminButtonLabel: 'Ver Panel Multi-Staff L3', adminUrl: '/admin_l3.html',
      benefits: ['Agendas multi-profesional independientes con horarios semanales propios.', 'Modelado de recursos físicos por rubro (sillones, consultorios, canchas).', 'Catálogo con cálculo automático de bloques contiguos por duración.', 'Microservicio Cron T-2hs para recordatorios desatendidos con idempotencia.', 'CRM de clientes VIP con historial de citas y gasto total acumulado.']
    }
  },

  rubros: {
    estetica: {
      id: 'estetica', name: 'Estética', bizName: 'Lumina Uñas & Estética', badgeL1: '★ ATENCIÓN PERSONALIZADA', subCategory: 'Estética & Bienestar',
      accentColor: '#D4AF37', btnClass: 'bg-gradient-to-r from-[#D4AF37] to-[#B18D28] text-[#0F0F10] font-bold shadow-lg shadow-[#D4AF37]/20', focusBorder: 'focus:border-[#D4AF37]', heroImage: '/assets/showcase/hero_unas.webp', iconSymbol: 'spa',
      options: ['Lifting de Pestañas', 'Esmaltado Semipermanente', 'Limpieza Facial'],
      days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Micaela (Master Lash)', 'Valentina (Cosmiatra)', 'Cualquiera (Sin Preferencia)'],
      catalogL3: [{ name: 'Lifting + Nutrición', dur: '45 min • $18.000' }, { name: 'Limpieza Facial Profunda', dur: '60 min • $25.000' }]
    },
    resto: {
      id: 'resto', name: 'Gastro', bizName: 'La Casona Restó', badgeL1: '🍷 RESERVA GASTRONÓMICA', subCategory: 'Gastronomía & Tragos',
      accentColor: '#E07A5F', btnClass: 'bg-gradient-to-r from-[#E07A5F] to-[#C85A3F] text-white font-bold shadow-lg shadow-[#E07A5F]/20', focusBorder: 'focus:border-[#E07A5F]', heroImage: '/assets/showcase/gastronomia.webp', iconSymbol: 'restaurant',
      options: ['2 Personas', '4 Personas', '6 Personas', '+8 Grupo'],
      days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Julián (Sommelier)', 'Automática (Mesa Libre)'],
      catalogL3: [{ name: 'Maridaje Gourmet', dur: '120 min • $45.000' }, { name: 'Degustación de Vinos', dur: '60 min • $25.000' }]
    },
    barberia: {
      id: 'barberia', name: 'Peluquería', bizName: 'The Hair Club Peluquería', badgeL1: '✂️ CORTE & ESTILO', subCategory: 'Peluquería & Estilo',
      accentColor: '#D97706', btnClass: 'bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold shadow-lg shadow-[#D97706]/20', focusBorder: 'focus:border-[#D97706]', heroImage: '/assets/showcase/hero_peluqueria.webp', iconSymbol: 'content_cut',
      options: ['Corte Tradicional', 'Corte + Barba', 'Servicio VIP The Hair Club'],
      days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Franco (Master Fade)', 'Lucas (Corte & Estilo)', 'Cualquiera (Primer Sillón Libre)'],
      catalogL3: [{ name: 'Corte Signature + Perfilado', dur: '45 min • $16.000' }, { name: 'Corte + Color Completo', dur: '60 min • $24.000' }]
    },
    deportes: {
      id: 'deportes', name: 'Deportes', bizName: 'Deportes Club', badgeL1: '⚡ CANCHA ILUMINADA', subCategory: 'Complejo Deportivo',
      accentColor: '#84CC16', btnClass: 'bg-gradient-to-r from-[#84CC16] to-[#65A30D] text-[#0F0F10] font-bold shadow-lg shadow-[#84CC16]/20', focusBorder: 'focus:border-[#84CC16]', heroImage: '/assets/showcase/deportes.webp', iconSymbol: 'sports_tennis',
      options: ['Turno 60 Minutos', 'Turno 90 Minutos', 'Clase Particular'],
      days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Cancha 1 (Panorámica)', 'Cancha 2 (Techada Pro)', 'Cualquiera (Primera Libre)'],
      catalogL3: [{ name: 'Turno Cancha Panorámica', dur: '90 min • $25.000' }, { name: 'Clase Particular con Profe', dur: '60 min • $30.000' }]
    },
    salud: {
      id: 'salud', name: 'Salud', label: 'Salud & Consultorios', bizName: 'Centro Médico & Especialidades', badgeL1: '🩺 CONSULTORIO MÉDICO', subCategory: 'Medicina General & Odontología',
      accentColor: '#0D9488', btnClass: 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white font-bold shadow-lg shadow-[#0D9488]/20', focusBorder: 'focus:border-[#0D9488]', heroImage: '/assets/showcase/hero_salud.webp', iconSymbol: 'medical_services',
      requireInsurance: true, options: ['Consulta Clínica General', 'Control Odontológico', 'Evaluación Diagnóstica'],
      days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Dra. Sofía Mendoza (Clínica)', 'Dr. Carlos Ruiz (Diagnóstico)', 'Dra. Lucía Albarracín (Odonto)'],
      catalogL3: [{ name: 'Consulta Médica General', dur: '20 min • $20.000' }, { name: 'Evaluación Diagnóstica Completa', dur: '40 min • $35.000' }]
    }
  },

  currentLevel: 'l1',
  currentRubro: 'barberia',
  currentStep: 1,
  selectedDay: 0,
  selectedTime: '16:30',
  selectedOption: 0,
  selectedStaff: 0,
  clientFirstName: 'Martín',
  clientLastName: 'Rodríguez',
  clientPhone: '381 555-4321',
  clientInsurance: 'OSDE',
  viewMode: 'client',
  isSelfService: false,
  listeners: [],

  subscribe(listener) { this.listeners.push(listener); },
  notify() { this.listeners.forEach(fn => fn(this)); },

  setRubro(r) { 
    this.currentRubro = r; 
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tucured:rubro-selected', { detail: { rubro: r } }));
    this.notify(); 
  },
  setLevel(l) { this.currentLevel = l; this.notify(); },
  setStep(s) { this.currentStep = s; this.notify(); },
  setViewMode(mode) { this.viewMode = mode; this.notify(); },
  setSelfService(val) { this.isSelfService = !!val; this.notify(); },

  getSelectedDayLabel() {
    const cal = this.systemCalendar || getSystemCalendar();
    const d = (cal.diasReales && cal.diasReales[this.selectedDay]) ? cal.diasReales[this.selectedDay] : cal.diasReales[0];
    return d ? d.fullLabel : 'Hoy';
  },

  getFormattedWhatsAppMessage() {
    const r = this.rubros[this.currentRubro];
    const srv = r.options[this.selectedOption] || r.options[0];
    const day = this.getSelectedDayLabel();
    return `¡Hola ${r.bizName}! Quiero reservar un turno para *${srv}* el día *${day}* a las *${this.selectedTime} hs*.\n\nNombre: *${this.clientFirstName} ${this.clientLastName}*.\nSé que la reserva requiere una seña del 50%. ¿Me pasás tu Alias o CBU para transferir?`;
  }
};

preloadShowcaseAssets();
