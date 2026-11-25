// Archivo: public/js/empezar/empezar_state.js
// Estado central de /empezar.html: 10 micro-pantallas, borrador, servicios, color auto y slug <= 24 (< 155L)

window.TucuEmpezarState = (function () {
  const RUBROS = [
    { id: 'peluqueria', label: 'Peluquería y Barbería', short: 'Peluquería', bg: '/assets/covers/peluqueria/salon_luminoso_02.webp', tagline: 'Tu corte de siempre, con la atención cálida de tu barbería de confianza.' },
    { id: 'estetica', label: 'Estética y Spa', short: 'Estética', bg: '/assets/covers/estetica/brillo_natural_02.webp', tagline: 'Un espacio cálido para cuidarte, renovar tu energía y sentirte bien.' },
    { id: 'gastronomia', label: 'Gastronomía', short: 'Gastronomía', bg: '/assets/covers/gastronomia/cafe_sol_02.webp', tagline: 'Mesa lista para compartir sabores ricos, buena charla y momentos de disfrute.' },
    { id: 'deportes', label: 'Deportes y Canchas', short: 'Deportes', bg: '/assets/covers/deportes/padel_sol_02.webp', tagline: 'Sumate a jugar con tus amigos en canchas cuidadas y el mejor ambiente.' },
    { id: 'salud', label: 'Salud y Consultorios', short: 'Salud', bg: '/assets/covers/salud/clinica_luminosa_02.webp', tagline: 'Atención cercana y humana para cuidar tu bienestar con total tranquilidad.' },
    { id: 'servicios', label: 'Servicios Profesionales', short: 'Servicios', bg: '/assets/covers/servicios/estudio_moderno_02.webp', tagline: 'Te acompañamos con trato directo y soluciones prácticas para lo que necesitás.' }
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
    { id: 'l1', badge: 'Esencial', name: 'Plan Esencial', promo: '$4.999', regular: '$14.900/mes', desc: 'Agenda web en 2 pasos, señas a tu Alias y comprobante online con 0% comisiones.' },
    { id: 'l2', badge: 'Gestión', name: 'Plan Gestión', promo: '$4.999', regular: '$24.900/mes', desc: 'Todo Plan Esencial más base CRM de clientes, bloqueos preventivos y vacaciones.' },
    { id: 'l3', badge: 'Equipos', name: 'Plan Equipos', promo: '$4.999', regular: '$34.900/mes', desc: 'Todo Plan Gestión más agendas por profesional, espacios y confirmación automática 2 hs antes.' }
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
    return 'peluqueria';
  }

  function normalizePlan(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (s === 'l1' || s === '1' || s.includes('esencial')) return 'l1';
    if (s === 'l3' || s === '3' || s.includes('equipo')) return 'l3';
    return 'l2';
  }

  function slugifySubdomain(raw) {
    if (window.TucuEmpezarSlugCheck?.sanitizeSlug) {
      return window.TucuEmpezarSlugCheck.sanitizeSlug(raw) || 'tu-comercio';
    }
    const clean = String(raw || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '').slice(0, 24).replace(/-+$/, '');
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

  function getEffectiveAccent(state) {
    if (state?.accentMode === 'auto' && state?.autoAccent?.bg) return state.autoAccent;
    return getAccentMeta(state?.accent, state?.rubro);
  }

  function getPlanMeta(planId) {
    return PLANS.find(p => p.id === normalizePlan(planId)) || PLANS[1];
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
    const draft = window.TucuEmpezarMicroSteps?.loadDraft?.() || {};
    const hasQueryRubro = p.has('rubro');
    const rubro = normalizeRubro(hasQueryRubro ? p.get('rubro') : (draft.rubro || 'peluqueria'));
    const plan = normalizePlan(p.has('plan') ? p.get('plan') : (draft.plan || 'l2'));
    const tonoVoz = window.TucuEmpezarTones?.normalizeTone(p.has('tono') ? p.get('tono') : (draft.tonoVoz || 'cercano')) || 'cercano';
    const defCover = window.TucuEmpezarCovers?.getDefaultCoverForRubro?.(rubro);
    const qCover = window.TucuEmpezarCovers?.getCoverById?.(p.get('cover'));
    const dCover = !hasQueryRubro ? window.TucuEmpezarCovers?.getCoverById?.(draft.coverId) : null;
    const bajada = (!hasQueryRubro && draft.bajada) ? draft.bajada : (window.TucuEmpezarTones?.getSuggestedTagline(rubro, tonoVoz) || getRubroMeta(rubro).tagline);
    const baseTheme = getAccentMeta(rubro, rubro);
    const servicios = (!hasQueryRubro && Array.isArray(draft.servicios) && draft.servicios.length)
      ? draft.servicios
      : (window.TucuEmpezarServicesStep?.getDefaultServices?.(rubro) || []);

    return {
      step: Math.max(1, Math.min(10, Number(draft.step) || 1)), stepDir: 'next',
      comercio: draft.comercio || '', slug: draft.slug || 'tu-comercio', slugTouched: Boolean(draft.slugTouched),
      slugCheck: { status: 'idle', slug: draft.slug || 'tu-comercio', suggestions: [] },
      rubro, plan, tonoVoz, bajada, bajadaManual: Boolean(draft.bajadaManual && !hasQueryRubro), taglineFromAi: Boolean(draft.taglineFromAi && !hasQueryRubro),
      aiPanelOpen: false, aiIntention: 'Sin esperas', aiLoading: false, aiFeedback: '',
      accent: draft.accent || rubro, accentMode: draft.accentMode || 'auto', autoAccent: { bg: baseTheme.bg, hover: baseTheme.hover, text: '#FFFFFF', source: 'rubro' },
      coverId: qCover?.id || dCover?.id || defCover?.id || '', coverMode: 'live', coverTab: 'rubro', coverTouched: Boolean(qCover || dCover),
      localidad: draft.localidad || 'San Miguel de Tucumán', direccion: draft.direccion || '', direccionLat: draft.direccionLat || '', direccionLng: draft.direccionLng || '',
      horarioModalidad: draft.horarioModalidad || 'corrido', horarioDias: draft.horarioDias || 'Lunes a sábado',
      open1: draft.open1 || '09:00', close1: draft.close1 || '20:00', open2: draft.open2 || '17:00', close2: draft.close2 || '21:00',
      servicios, serviciosTouched: Boolean(!hasQueryRubro && draft.serviciosTouched), asistenciaCarga: draft.asistenciaCarga || '',
      instagram: draft.instagram || '', titularNombre: draft.titularNombre || '', titularApellido: draft.titularApellido || '', whatsapp: draft.whatsapp || '', email: draft.email || '',
      termsAccepted: draft.termsAccepted !== false, error: '', submitting: false, submitted: false
    };
  }

  return {
    RUBROS, ACCENT_OPTIONS, PLANS, LOCALIDADES,
    normalizeRubro, normalizePlan, slugifySubdomain, sanitizePhone10,
    getRubroMeta, getAccentMeta, getEffectiveAccent, getPlanMeta, buildScheduleSummary, createInitialState
  };
})();
