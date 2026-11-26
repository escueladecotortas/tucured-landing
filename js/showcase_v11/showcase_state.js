// Archivo: js/showcase_v11/showcase_state.js
// Estado reactivo y catalogo canonico de Showroom V2 (Turnero Unico + Turnos / Gestion / Equipos) (< 165L)

export const RUBRO_ORDER = ['peluqueria', 'estetica', 'gastronomia', 'deportes', 'salud', 'servicios'];

export function normalizeShowroomRubro(raw) {
  const s = String(raw || '').toLowerCase().trim();
  if (s === 'estetica' || s === 'peluqueria_estetica' || s.includes('estet')) return 'estetica';
  if (s === 'gastronomia' || s === 'resto' || s.includes('gastro')) return 'gastronomia';
  if (s === 'deportes' || s === 'deportes_clubes' || s.includes('deport') || s.includes('club')) return 'deportes';
  if (s === 'salud' || s === 'salud_consultorio' || s.includes('salud') || s.includes('medic')) return 'salud';
  if (s === 'servicios' || s.includes('servic') || s.includes('consultor')) return 'servicios';
  return 'peluqueria';
}

const mkRubro = (id, shortLabel, bizName, tagline, l3Key, accent, modeVerb, coverPath) => ({
  id, shortLabel, bizName, tagline, l3Key, accent, modeVerb,
  poster: `/assets/covers/${coverPath}.webp`, video: `/assets/covers/${coverPath}.mp4`, logo: `/assets/logos/demo_${id}.webp`
});

export const RUBROS = {
  peluqueria: mkRubro('peluqueria', 'Peluquería', 'Brava Barbería', 'Cortes y barba · Reservá tu silla en 20 segundos.', 'barberia', '#B45309', 'Reservar turno', 'peluqueria/salon_luminoso_02'),
  estetica: mkRubro('estetica', 'Estética', 'Siena Estética', 'Facial, uñas y spa · Elegí tu horario sin esperar.', 'peluqueria_estetica', '#8C6D46', 'Reservar turno', 'estetica/brillo_natural_02'),
  gastronomia: mkRubro('gastronomia', 'Gastronomía', 'Brama Café & Bistró', 'Café y cocina de autor · Reservá tu mesa al toque.', 'gastronomia', '#C85A3F', 'Reservar mesa', 'gastronomia/cafe_sol_02'),
  deportes: mkRubro('deportes', 'Deportes', 'Norte Pádel Club', 'Canchas de blindex · Reservá tu cancha en 2 toques.', 'deportes_clubes', '#15803D', 'Reservar cancha', 'deportes/padel_sol_02'),
  salud: mkRubro('salud', 'Salud', 'Alba Centro Médico', 'Atención programada · Turnos con tu obra social.', 'salud_consultorio', '#0F766E', 'Reservar turno', 'salud/clinica_luminosa_02'),
  servicios: mkRubro('servicios', 'Servicios', 'Vértice Estudio', 'Asesoramiento integral · Agendá tu consulta hoy.', 'servicios', '#4338CA', 'Agendar consulta', 'servicios/estudio_moderno_02')
};

export const CLIENT_EXPERIENCE_BENEFITS = [
  'Portada Viva con foto o video, dirección del local y horarios reales.',
  'Reserva web en 2 pasos desde el celular, sin contraseñas ni apps.',
  'Comprobante online #TK con seña directa al Alias, .ics y reprogramación.',
  'Recordatorios automáticos por WhatsApp 24 hs y 2 hs antes de asistir.'
];

export const LEVELS = {
  l1: {
    id: 'l1', shortLabel: 'Turnos', badge: 'Plan Turnos', regularPrice: '$14.900 ARS/mes',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    summary: 'Ideal para profesionales y locales que ordenan su agenda online y señas sin intermediarios.',
    ownerBenefits: [
      'Catálogo de servicios con duración, precio y seña configurable en segundos.',
      'Agenda diaria clara para confirmar señas, cargar citas manuales o pausar web.',
      'Horarios partidos Mañana / Tarde y Feriados Nacionales 2026 editables por mes.'
    ],
    mobileMeta: {
      title: 'Admin · Turnos', badge: 'Agenda y Señas',
      kpis: [['Turnos hoy', '5'], ['Señas cobradas', '$18.000'], ['Asistencia', '92%']],
      chips: ['Pausar agenda web', 'Feriados 2026', 'Carga manual'],
      rows: [['15:00 hs', 'Martín Gómez', 'Confirmado'], ['16:30 hs', 'Sofía Núñez', 'Pendiente de seña']]
    }
  },
  l2: {
    id: 'l2', shortLabel: 'Gestión', badge: 'Plan Gestión', regularPrice: '$24.900 ARS/mes',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    summary: 'Pensado para comercios con alto volumen, recepción en mostrador y base de clientes.',
    ownerBenefits: [
      'Todo Turnos + base CRM con importación de contactos directa del celular.',
      'Bloqueo preventivo de teléfonos restringidos, vacaciones y horarios cerrados.',
      'Control de ocupación, selector de personas o lugares e historial de precios.'
    ],
    mobileMeta: {
      title: 'Admin · Gestión', badge: 'CRM y Ocupación',
      kpis: [['Confirmados', '12'], ['Señas cobradas', '$64.000'], ['Ocupación', '84%']],
      chips: ['CRM desde celular', 'Bloqueo preventivo', 'Vacaciones y cierres'],
      rows: [['10:00 hs', 'Lucas Quiroga', 'Confirmado'], ['11:30 hs', 'Valentina Paz', 'Seña a validar']]
    }
  },
  l3: {
    id: 'l3', shortLabel: 'Equipos', badge: 'Plan Equipos', regularPrice: '$34.900 ARS/mes',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    summary: 'Diseñado para equipos, centros médicos, clubes deportivos y locales con múltiples boxes.',
    ownerBenefits: [
      'Todo Gestión + agendas independientes por profesional con turno partido.',
      'Administración unificada de sillones, gabinetes, consultorios y canchas.',
      'Confirmación y liberación automática de turnos 2 horas antes de la cita.'
    ],
    mobileMeta: {
      title: 'Admin · Equipos', badge: 'Equipos y Boxes',
      kpis: [['Turnos en vista', '18'], ['Señas cobradas', '$112.000'], ['Confirmados', '16']],
      chips: ['Agendas por equipo', 'Salas y canchas', 'Confirmación 2 hs'],
      rows: [['10:00 hs', 'Especialista #1 · Box 1', 'Confirmado'], ['11:00 hs', 'Especialista #2 · Box 2', 'Pendiente de seña']]
    }
  }
};

export function buildClientDemoUrl(rubro, level = 'l1') {
  const norm = normalizeShowroomRubro(rubro), lvl = ['l1', 'l2', 'l3'].includes(level) ? level : 'l1';
  return `/turnero.html?rubro=${encodeURIComponent(norm)}&level=${encodeURIComponent(lvl)}&embed=1`;
}

export function buildAdminDemoUrl(rubro, level = 'l1') {
  const norm = normalizeShowroomRubro(rubro), rObj = RUBROS[norm] || RUBROS.peluqueria;
  const lvl = ['l1', 'l2', 'l3'].includes(level) ? level : 'l1';
  if (lvl === 'l3') return `/admin_l3.html?slug=demo-staff&embed=true&rubro=${encodeURIComponent(rObj.l3Key)}`;
  if (lvl === 'l2') return `/admin_l2.html?slug=demo-${encodeURIComponent(norm)}&embed=true&rubro=${encodeURIComponent(norm)}`;
  return `/admin_l1.html?slug=demo-${encodeURIComponent(norm)}&embed=true&rubro=${encodeURIComponent(norm)}`;
}

export function preloadShowcaseAssets() {
  if (typeof window === 'undefined') return;
  Object.values(RUBROS).forEach((r) => { const img = new Image(); img.src = r.poster; });
}

export const ShowcaseState = {
  currentRubro: 'peluqueria', currentLevel: 'l1', clientMultiStaff: false, viewMode: 'client', mobileModalOpen: false,
  listeners: [], rubros: RUBROS, levels: LEVELS,
  subscribe(fn) { if (typeof fn === 'function' && !this.listeners.includes(fn)) this.listeners.push(fn); },
  notify() { this.listeners.forEach(fn => fn(this)); },
  getCurrentRubro() { return RUBROS[normalizeShowroomRubro(this.currentRubro)] || RUBROS.peluqueria; },
  getCurrentLevel() { return LEVELS[this.currentLevel] || LEVELS.l1; },
  getClientDemoUrl() { return buildClientDemoUrl(this.currentRubro, this.clientMultiStaff ? 'l3' : 'l1'); },
  getAdminDemoUrl() { return buildAdminDemoUrl(this.currentRubro, this.currentLevel); },
  getDemoUrl(overrideMode) { return (overrideMode || this.viewMode) === 'admin' ? this.getAdminDemoUrl() : this.getClientDemoUrl(); },
  setRubro(raw) {
    this.currentRubro = normalizeShowroomRubro(raw);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tucured:rubro-selected', { detail: { rubro: this.currentRubro } }));
    this.notify();
  },
  setLevel(raw) {
    const s = String(raw || '').toLowerCase(), lvl = s === '2' || s === 'l2' ? 'l2' : (s === '3' || s === 'l3' ? 'l3' : 'l1');
    this.currentLevel = lvl;
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tucured:level-selected', { detail: { level: lvl } }));
    this.notify();
  },
  setClientMultiStaff(val) { this.clientMultiStaff = Boolean(val); this.notify(); },
  setViewMode(mode) { this.viewMode = mode === 'admin' ? 'admin' : 'client'; this.notify(); },
  setMobileModal(isOpen) { this.mobileModalOpen = Boolean(isOpen); this.notify(); }
};
