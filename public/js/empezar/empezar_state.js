// Archivo: public/js/empezar/empezar_state.js
// Estado central del Wizard /empezar.html, planes, 6 rubros sincronizados y normalizadores (< 160L)

window.TucuEmpezarState = (function () {
  const RUBROS = [
    { id: 'peluqueria', label: 'Peluquería y Barbería', short: 'Peluquería', bg: '/assets/showcase/hero_peluqueria.webp', tagline: 'Cortes de precisión, barba clásica y estilo pensado para vos.' },
    { id: 'estetica', label: 'Estética y Spa', short: 'Estética', bg: '/assets/showcase/hero_unas.webp', tagline: 'Cuidado facial, uñas y bienestar en un espacio pensado para relajarte.' },
    { id: 'gastronomia', label: 'Gastronomía', short: 'Gastronomía', bg: '/assets/showcase/gastronomia.webp', tagline: 'Cocina de estación, parrilla y tu mesa reservada sin esperas.' },
    { id: 'deportes', label: 'Deportes y Canchas', short: 'Deportes', bg: '/assets/showcase/deportes.webp', tagline: 'Canchas iluminadas y turnos al instante para jugar cuando quieras.' },
    { id: 'salud', label: 'Salud y Consultorios', short: 'Salud', bg: '/assets/showcase/hero_salud.webp', tagline: 'Atención médica programada, puntual y cercana para tu tranquilidad.' },
    { id: 'servicios', label: 'Servicios Profesionales', short: 'Servicios', bg: '/assets/rubro_servicios.webp', tagline: 'Asesoramiento profesional claro y turnos organizados a tu medida.' }
  ];

  const ACCENT_OPTIONS = [
    { id: 'peluqueria', label: 'Ámbar', bg: '#B45309', hover: '#92400E', text: '#FFFFFF' },
    { id: 'estetica', label: 'Bronce', bg: '#8C6D46', hover: '#725736', text: '#FFFFFF' },
    { id: 'gastronomia', label: 'Terracota', bg: '#C85A3F', hover: '#A8462E', text: '#FFFFFF' },
    { id: 'deportes', label: 'Esmeralda', bg: '#15803D', hover: '#166534', text: '#FFFFFF' },
    { id: 'salud', label: 'Teal', bg: '#0F766E', hover: '#115E59', text: '#FFFFFF' },
    { id: 'servicios', label: 'Índigo', bg: '#4338CA', hover: '#3730A3', text: '#FFFFFF' }
  ];

  const PLANS = [
    { id: 'l1', badge: 'Nivel 1', name: 'Turnero Autónomo', promo: '$4.999', regular: '$14.900/mes', desc: 'Reservas en línea 24/7, señas configurables y comprobante automático.' },
    { id: 'l2', badge: 'Nivel 2', name: 'Central Pro Multi-Box', promo: '$4.999', regular: '$24.900/mes', desc: 'Todo Nivel 1 más gestión de clientes, bloqueos y vacaciones.' },
    { id: 'l3', badge: 'Nivel 3', name: 'Multi-Staff & Recursos', promo: '$4.999', regular: '$34.900/mes', desc: 'Agendas por profesional, espacios y confirmación automática previa.' }
  ];

  const LOCALIDADES = [
    'San Miguel de Tucumán', 'Aguilares', 'Alderetes', 'Banda del Río Salí', 'Concepción',
    'El Manantial', 'Famaillá', 'Las Talitas', 'Lules', 'Monteros',
    'San Pablo', 'Simoca', 'Tafí del Valle', 'Tafí Viejo', 'Yerba Buena'
  ];

  function normalizeRubro(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (s.includes('estet')) return 'estetica';
    if (s.includes('gastro') || s === 'resto') return 'gastronomia';
    if (s.includes('deport') || s.includes('club')) return 'deportes';
    if (s.includes('salud') || s.includes('medic')) return 'salud';
    if (s.includes('servic') || s.includes('estud')) return 'servicios';
    if (s.includes('peluq') || s.includes('barber')) return 'peluqueria';
    return 'peluqueria';
  }

  function normalizePlan(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (s === 'l1' || s === '1') return 'l1';
    if (s === 'l3' || s === '3') return 'l3';
    return 'l2';
  }

  function slugifySubdomain(raw) {
    const clean = String(raw || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32)
      .replace(/-+$/, '');
    return clean || 'tu-comercio';
  }

  function sanitizePhone10(raw) {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('549')) d = d.slice(3);
    else if (d.startsWith('54')) d = d.slice(2);
    if (d.startsWith('0')) d = d.slice(1);
    if (d.length > 10) {
      if (d.slice(3, 5) === '15') d = d.slice(0, 3) + d.slice(5);
      else if (d.slice(2, 4) === '15') d = d.slice(0, 2) + d.slice(4);
      else if (d.slice(4, 6) === '15') d = d.slice(0, 4) + d.slice(6);
    }
    return d.slice(0, 10);
  }

  function getRubroMeta(id) {
    const cov = window.TucuCoverData?.RUBRO_COVERS?.[id];
    const base = RUBROS.find(r => r.id === id) || RUBROS[0];
    return { ...base, bg: cov?.bg || base.bg, tagline: cov?.tagline || base.tagline };
  }

  function getAccentMeta(accentId, rubroId) {
    const theme = window.TucuCoverData?.RUBRO_THEMES?.[accentId] || window.TucuCoverData?.RUBRO_THEMES?.[rubroId];
    const found = ACCENT_OPTIONS.find(a => a.id === accentId) || ACCENT_OPTIONS.find(a => a.id === rubroId) || ACCENT_OPTIONS[0];
    return theme ? { ...found, bg: theme.bg, hover: theme.hover, text: theme.text } : found;
  }

  function buildScheduleSummary(st) {
    const days = st.horarioDias || 'Lunes a sábado';
    if (st.horarioModalidad === 'partido') {
      return `${days} · ${st.open1 || '09:00'} a ${st.close1 || '13:00'} y ${st.open2 || '17:00'} a ${st.close2 || '21:00'}`;
    }
    return `${days} · ${st.open1 || '09:00'} a ${st.close1 || '20:00'}`;
  }

  function createInitialState(search = (typeof window !== 'undefined' ? window.location.search : '')) {
    const p = new URLSearchParams(search || '');
    const rubro = normalizeRubro(p.get('rubro') || 'peluqueria');
    const plan = normalizePlan(p.get('plan') || 'l2');
    return {
      step: 1,
      comercio: '',
      slug: 'tu-comercio',
      slugTouched: false,
      rubro,
      plan,
      bajada: '',
      accent: rubro,
      accentTouched: false,
      coverMode: 'rubro',
      localidad: 'San Miguel de Tucumán',
      direccion: '',
      direccionLat: '',
      direccionLng: '',
      horarioModalidad: 'corrido',
      horarioDias: 'Lunes a sábado',
      open1: '09:00',
      close1: '20:00',
      open2: '17:00',
      close2: '21:00',
      instagram: '',
      titularNombre: '',
      titularApellido: '',
      whatsapp: '',
      email: '',
      termsAccepted: true,
      error: '',
      submitting: false,
      submitted: false
    };
  }

  return {
    RUBROS, ACCENT_OPTIONS, PLANS, LOCALIDADES,
    normalizeRubro, normalizePlan, slugifySubdomain, sanitizePhone10,
    getRubroMeta, getAccentMeta, buildScheduleSummary, createInitialState
  };
})();