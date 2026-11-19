// Archivo: js/showcase_v11/showcase_state.js
// Estado y Contratos Canónicos Showcase v11.1 (< 180 líneas, 6 rubros reales, Local-First)
export function getSystemCalendar(maxDays = 14) {
  const now = new Date(), diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'], diasReales = [];
  const rawMonth = now.toLocaleDateString('es-AR', { month: 'long' }), mesActual = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
  for (let dayOffset = 0; diasReales.length < maxDays && dayOffset < 28; dayOffset++) {
    const d = new Date(now); d.setDate(now.getDate() + dayOffset); const diaNum = d.getDay();
    if (diaNum !== 0) {
      diasReales.push({
        diaNombre: diasSemana[diaNum], diaNumero: d.getDate(), isToday: dayOffset === 0, isSunday: false,
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        fullLabel: `${diasSemana[diaNum]} ${d.getDate()} de ${mesActual}`, globalIndex: diasReales.length
      });
    }
  }
  return { mesActual, diasReales };
}
export function getVisibleDays(state) {
  const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar(), page = state ? (state.calendarPage || 0) : 0;
  return (cal.diasReales || []).slice(page * 4, page * 4 + 4);
}
export function isSelectedDaySunday(state) {
  const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar(), d = cal.diasReales?.[state ? (state.selectedDay || 0) : 0];
  return d ? (d.isSunday || d.diaNombre === 'Dom') : false;
}
export function isTimePast(timeStr, state) {
  const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar(), d = cal.diasReales?.[state ? (state.selectedDay || 0) : 0];
  if (!d || !d.isToday) return false;
  const now = new Date(), [hStr, mStr] = String(timeStr).split(':');
  return ((parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0)) < (now.getHours() * 60 + now.getMinutes());
}
export function preloadShowcaseAssets() {
  if (typeof window === 'undefined') return;
  Object.values(ShowcaseState.rubros).forEach(r => { if (r.heroImage) { const img = new Image(); img.src = r.heroImage; } });
}
export function normalizeShowroomRubro(raw) {
  const s = String(raw || '').toLowerCase().trim();
  if (s.includes('deport') || s.includes('club')) return 'deportes';
  if (s.includes('estet')) return 'estetica';
  if (s.includes('gastro') || s === 'resto') return 'gastronomia';
  if (s.includes('salud') || s.includes('medic')) return 'salud';
  if (s.includes('servic') || s.includes('consultor')) return 'servicios';
  return 'peluqueria';
}
export function getActiveCatalogServices(state, rubro) {
  const isOk = (s) => Boolean(s && !s.deletedAt && s.isActive !== false && s.activo !== false && s.active !== false);
  const norm = normalizeShowroomRubro(rubro?.id || state?.currentRubro), lvl = ['l1', 'l2', 'l3'].includes(state?.currentLevel) ? state.currentLevel : 'l1';
  const rMap = { peluqueria: 'barberia', estetica: 'peluqueria_estetica', salud: 'salud_consultorio', deportes: 'deportes_clubes', gastronomia: 'gastronomia', servicios: 'servicios' };
  const fmt = (s) => ({ ...s, requireDeposit: s.requireDeposit !== false, dur: s.dur || `${s.duration || 30} min • $${Number(s.price || 0).toLocaleString('es-AR')}` });
  const key = lvl === 'l3' ? `tucu_l3_services_${rMap[norm] || 'barberia'}` : `tucu_${lvl}_services_${norm}`;
  try {
    const raw = typeof localStorage !== 'undefined' ? (localStorage.getItem(key) || (lvl !== 'l3' && (localStorage.getItem(`tucu_${lvl}_rubro`) || (lvl === 'l2' ? 'estetica' : 'peluqueria')) === norm ? localStorage.getItem(`tucu_${lvl}_services`) : null)) : null;
    const stored = raw ? JSON.parse(raw) : null;
    if (Array.isArray(stored) && stored.length > 0) return stored.filter(isOk).sort((a, b) => (a.order || 99) - (b.order || 99)).map(fmt);
  } catch (_) {}
  const base = Array.isArray(rubro?.catalogL3) && rubro.catalogL3.length > 0 ? rubro.catalogL3 : (rubro?.options || []).map(o => (typeof o === 'string' ? { name: o } : o));
  const seed = base.filter(isOk).map((s, i) => ({ id: `srv-${norm}-${i + 1}`, ...s, isActive: true }));
  try { if (typeof localStorage !== 'undefined' && seed.length) localStorage.setItem(key, JSON.stringify(seed)); } catch (_) {}
  return seed.map(fmt);
}

const sysCalendar = getSystemCalendar();
export const ShowcaseState = {
  systemCalendar: sysCalendar, calendarPage: 0, selectedDay: 0, selectedTime: '16:30', selectedOption: 0, selectedStaff: 0,
  currentLevel: 'l1', currentRubro: 'barberia', currentStep: 1,
  clientFirstName: 'Martín', clientLastName: 'Rodríguez', clientPhone: '3815554321', clientInsurance: 'OSDE',
  viewMode: 'client', isSelfService: false, listeners: [],

  levels: {
    l1: {
      id: 'l1', badge: 'Nivel 1 • Turnero Autónomo', badgeClass: 'bg-primary/20 text-primary border-primary/30', popularBadge: 'Ideal Emprendedores', iconSymbol: 'bolt',
      name: 'Turnero Autónomo', tagline: 'Reserva en 3 pasos • Seña configurable • Ticket Online con dirección',
      description: 'Turnero web autónomo con seña configurable por servicio, Ticket Online #TK con dirección y feriados 2026 por mes.',
      adminIcon: 'settings', adminButtonLabel: 'Ver Panel Asistente L1', adminUrl: '/admin_l1.html',
      benefits: ['Agenda web autónoma en 3 pasos con bloqueo de horarios en vivo.', 'Seña configurable por servicio directo a tu Alias/CBU con carga de comprobante.', 'Ticket Online #TK con dirección del local, calendario (.ics) y autogestión.', 'Feriados Nacionales 2026 configurables por mes y horarios partidos.', 'Recordatorios por WhatsApp y panel de dueño para pausar recepción.']
    },
    l2: {
      id: 'l2', badge: 'Nivel 2 • Central Pro Multi-Box', badgeClass: 'bg-secondary-container/30 text-secondary border-secondary/30', popularBadge: 'CRM & Control Operativo', iconSymbol: 'settings_suggest',
      name: 'Central Pro Multi-Box', tagline: 'Todo L1 + CRM & Contactos • Bloqueos de horarios y vacaciones',
      description: 'Agenda inteligente con CRM & Contactos desde el celular, Email, Cumpleaños, bloqueo preventivo e historial de precios.',
      adminIcon: 'monitoring', adminButtonLabel: 'Ver Panel de Citas L2', adminUrl: '/admin_l2.html',
      benefits: ['Todo lo de Nivel 1 con carga ágil de turnos de mostrador, Pax y % ocupación.', 'CRM & Contactos: importación desde agenda del celular y archivos .vcf/.csv.', 'Ficha de clientes con Email, Fecha de Cumpleaños y papelera restaurable.', 'Bloqueo preventivo de reservas web para teléfonos restringidos.', 'Historial de precios, cierres por vacaciones y bloqueos manuales.']
    },
    l3: {
      id: 'l3', badge: 'Nivel 3 • Multi-Staff & Recursos', badgeClass: 'bg-primary-container/30 text-primary-fixed border-primary-container/40', popularBadge: 'Equipos, Consultorios y Complejos', iconSymbol: 'groups',
      name: 'Multi-Staff & Recursos', tagline: 'Todo L2 + Multi-Staff • Sillones/Boxes • Confirmación 2hs activable',
      description: 'Múltiples profesionales con horarios partidos (Mañana / Tarde), sillones/boxes y Confirmación y Liberación Automática 2 hs antes.',
      adminIcon: 'groups', adminButtonLabel: 'Ver Panel Multi-Staff L3', adminUrl: '/admin_l3.html',
      benefits: ['Agendas independientes por profesional con horarios partidos (Mañana / Tarde).', 'Asignación de sillones, boxes, consultorios o canchas por servicio.', 'Confirmación y Liberación Automática (2 hs antes) activable o pausable.', 'CRM unificado de clientes con Email, Cumpleaños e importación celular.', 'Selección de profesional preferido o primer turno disponible.']
    }
  },

  rubros: {
    estetica: {
      id: 'estetica', name: 'Estética', bizName: 'Aura Estética & Spa', address: 'Av. Aconquija 1320, Yerba Buena', badgeL1: '★ ATENCIÓN PERSONALIZADA', subCategory: 'Estética & Bienestar',
      accentColor: '#D4AF37', btnClass: 'bg-gradient-to-r from-[#D4AF37] to-[#B18D28] text-[#0F0F10] font-bold shadow-lg shadow-[#D4AF37]/20', focusBorder: 'focus:border-[#D4AF37]', heroImage: '/assets/showcase/hero_unas.webp', iconSymbol: 'spa',
      options: ['Limpieza Facial Profunda', 'Esculpido de Cejas & Pestañas', 'Masaje Descontracturante'], days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Micaela (Master Lash)', 'Valentina (Cosmiatra)', 'Cualquiera (Sin Preferencia)'],
      catalogL3: [{ name: 'Limpieza Facial Profunda', duration: 60, price: 18000, dur: '60 min • $18.000' }, { name: 'Esculpido de Cejas & Pestañas', duration: 45, price: 14000, dur: '45 min • $14.000' }, { name: 'Masaje Descontracturante', duration: 50, price: 20000, dur: '50 min • $20.000' }]
    },
    resto: {
      id: 'resto', name: 'Gastro', bizName: 'Bistró & Parrilla El Encuentro', address: 'Crisóstomo Álvarez 615, S. M. de Tucumán', badgeL1: '🍷 RESERVA GASTRONÓMICA', subCategory: 'Gastronomía & Tragos',
      accentColor: '#E07A5F', btnClass: 'bg-gradient-to-r from-[#E07A5F] to-[#C85A3F] text-white font-bold shadow-lg shadow-[#E07A5F]/20', focusBorder: 'focus:border-[#E07A5F]', heroImage: '/assets/showcase/gastronomia.webp', iconSymbol: 'restaurant',
      options: ['Reserva Mesa 2 Personas', 'Mesa Salón Principal (4 pers.)', 'Degustación Nocturna'], days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Julián (Sommelier)', 'Automática (Mesa Libre)'],
      catalogL3: [{ name: 'Reserva Mesa 2 Personas', duration: 90, price: 10000, dur: '90 min • $10.000' }, { name: 'Mesa Salón Principal (4 pers.)', duration: 120, price: 16000, dur: '120 min • $16.000' }, { name: 'Degustación Nocturna', duration: 120, price: 28000, dur: '120 min • $28.000' }]
    },
    barberia: {
      id: 'barberia', name: 'Peluquería', bizName: 'Peluquería & Barbería Central', address: '25 de Mayo 480, S. M. de Tucumán', badgeL1: '✂️ CORTE & ESTILO', subCategory: 'Peluquería & Estilo',
      accentColor: '#D97706', btnClass: 'bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold shadow-lg shadow-[#D97706]/20', focusBorder: 'focus:border-[#D97706]', heroImage: '/assets/showcase/hero_peluqueria.webp', iconSymbol: 'content_cut',
      options: ['Corte Clásico', 'Corte Degradé / Fade', 'Barba Toalla Caliente'], days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Franco (Master Fade)', 'Lucas (Corte & Estilo)', 'Cualquiera (Primer Sillón Libre)'],
      catalogL3: [{ name: 'Corte Clásico', duration: 30, price: 8000, dur: '30 min • $8.000' }, { name: 'Corte Degradé / Fade', duration: 45, price: 10000, dur: '45 min • $10.000' }, { name: 'Barba Toalla Caliente', duration: 30, price: 6000, dur: '30 min • $6.000' }]
    },
    deportes: {
      id: 'deportes', name: 'Deportes', bizName: 'Complejo Deportivo & Pádel Norte', address: 'Av. Perón 1850, Yerba Buena', badgeL1: '⚡ CANCHA ILUMINADA', subCategory: 'Complejo Deportivo',
      accentColor: '#84CC16', btnClass: 'bg-gradient-to-r from-[#84CC16] to-[#65A30D] text-[#0F0F10] font-bold shadow-lg shadow-[#84CC16]/20', focusBorder: 'focus:border-[#84CC16]', heroImage: '/assets/showcase/deportes.webp', iconSymbol: 'sports_tennis',
      options: ['Alquiler Cancha Pádel Cristal', 'Cancha Fútbol 5 Sintético', 'Clase Grupal Funcional'], days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Cancha 1 (Panorámica)', 'Cancha 2 (Techada Pro)', 'Cualquiera (Primera Libre)'],
      catalogL3: [{ name: 'Alquiler Cancha Pádel Cristal', duration: 90, price: 24000, dur: '90 min • $24.000' }, { name: 'Cancha Fútbol 5 Sintético', duration: 60, price: 32000, dur: '60 min • $32.000' }, { name: 'Clase Grupal Funcional', duration: 60, price: 14000, dur: '60 min • $14.000' }]
    },
    salud: {
      id: 'salud', name: 'Salud', label: 'Salud & Consultorios', bizName: 'Consultorios Médicos San Martín', address: 'San Martín 845, S. M. de Tucumán', badgeL1: '🩺 CONSULTORIO MÉDICO', subCategory: 'Medicina General & Odontología',
      accentColor: '#0D9488', btnClass: 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white font-bold shadow-lg shadow-[#0D9488]/20', focusBorder: 'focus:border-[#0D9488]', heroImage: '/assets/showcase/hero_salud.webp', iconSymbol: 'medical_services',
      requireInsurance: true, options: ['Consulta Clínica General', 'Control Odontológico', 'Sesión Kinesiología'], days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Dra. Sofía Mendoza (Clínica)', 'Dr. Carlos Ruiz (Diagnóstico)', 'Dra. Lucía Albarracín (Odonto)'],
      catalogL3: [{ name: 'Consulta Clínica General', duration: 30, price: 20000, dur: '30 min • $20.000' }, { name: 'Control Odontológico', duration: 30, price: 18000, dur: '30 min • $18.000' }, { name: 'Sesión Kinesiología', duration: 45, price: 16000, dur: '45 min • $16.000' }]
    },
    servicios: {
      id: 'servicios', name: 'Servicios', label: 'Servicios Profesionales', bizName: 'Estudio Jurídico & Contable Norte', address: 'Laprida 310, S. M. de Tucumán', badgeL1: '💼 ATENCIÓN CON TURNO', subCategory: 'Estudios & Asesoría',
      accentColor: '#4F46E5', btnClass: 'bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white font-bold shadow-lg shadow-[#4F46E5]/20', focusBorder: 'focus:border-[#4F46E5]', heroImage: '/assets/rubro_servicios.webp', iconSymbol: 'work',
      options: ['Asesoría Inicial 45 min', 'Gestión Impositiva Mensual', 'Auditoría Documental'], days: sysCalendar.diasReales.map(d => d.fullLabel),
      staff: ['Dr. Mariano Paz (Socio)', 'Cra. Elena Gómez (Impuestos)', 'Cualquiera (Disponible)'],
      catalogL3: [{ name: 'Asesoría Inicial 45 min', duration: 45, price: 22000, dur: '45 min • $22.000' }, { name: 'Gestión Impositiva Mensual', duration: 60, price: 26000, dur: '60 min • $26.000' }, { name: 'Auditoría Documental', duration: 60, price: 30000, dur: '60 min • $30.000' }]
    }
  },

  subscribe(listener) { this.listeners.push(listener); },
  notify() { this.listeners.forEach(fn => fn(this)); },
  setRubro(r) { this.currentRubro = r; this.selectedOption = 0; this.selectedStaff = 0; if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tucured:rubro-selected', { detail: { rubro: r } })); this.notify(); },
  setLevel(l) { this.currentLevel = l; this.notify(); },
  setStep(s) { this.currentStep = s; this.notify(); },
  setViewMode(mode) { this.viewMode = mode; this.notify(); },
  setSelfService(val) { this.isSelfService = !!val; this.notify(); },
  selectDay(idx) { this.selectedDay = idx; this.calendarPage = Math.floor(idx / 4); this.notify(); },
  prevDayPage() { if (this.calendarPage > 0) { this.calendarPage--; this.selectedDay = this.calendarPage * 4; this.notify(); } },
  nextDayPage() { const cal = this.systemCalendar || getSystemCalendar(), maxPage = Math.max(0, Math.floor(((cal.diasReales || []).length - 1) / 4)); if (this.calendarPage < maxPage) { this.calendarPage++; this.selectedDay = this.calendarPage * 4; this.notify(); } },
  getSelectedDayLabel() { const cal = this.systemCalendar || getSystemCalendar(), d = cal.diasReales?.[this.selectedDay] || cal.diasReales?.[0]; return d ? d.fullLabel : 'Hoy'; }
};
preloadShowcaseAssets();
