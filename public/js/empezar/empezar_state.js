// Archivo: public/js/empezar/empezar_state.js
// Estado central de /empezar.html: 11 pasos, 5 rubros, 4 beneficios por plan, piso/depto y E.164 (< 170L)

window.TucuEmpezarState = (function () {
  const RUBROS = [
    { id: 'peluqueria', label: 'Peluquería y Barbería', short: 'Peluquería', bg: '/assets/covers/peluqueria/salon_luminoso_02.webp' },
    { id: 'estetica', label: 'Estética y Spa', short: 'Estética', bg: '/assets/covers/estetica/brillo_natural_02.webp' },
    { id: 'deportes', label: 'Deportes y Canchas', short: 'Deportes', bg: '/assets/covers/deportes/padel_sol_02.webp' },
    { id: 'salud', label: 'Salud y Consultorios', short: 'Salud', bg: '/assets/covers/salud/clinica_luminosa_02.webp' },
    { id: 'servicios', label: 'Servicios Profesionales', short: 'Servicios', bg: '/assets/covers/servicios/estudio_moderno_02.webp' }
  ];

  const RUBRO_SPECIALTIES = {
    peluqueria: ['Cortes', 'Barbería', 'Coloración', 'Alisados'],
    estetica: ['Uñas', 'Facial', 'Pestañas', 'Masajes'],
    deportes: ['Pádel', 'Fútbol', 'Funcional', 'Tenis'],
    salud: ['Kinesiología', 'Odontología', 'Psicología', 'Nutrición'],
    servicios: ['Contable', 'Abogacía', 'Diseño', 'Técnico']
  };

  const ACCENT_OPTIONS = [
    { id: 'peluqueria', label: 'Ámbar', bg: '#B45309', hover: '#92400E', text: '#FFFFFF' },
    { id: 'estetica', label: 'Bronce', bg: '#8C6D46', hover: '#725736', text: '#FFFFFF' },
    { id: 'deportes', label: 'Esmeralda', bg: '#15803D', hover: '#166534', text: '#FFFFFF' },
    { id: 'salud', label: 'Teal', bg: '#0F766E', hover: '#115E59', text: '#FFFFFF' },
    { id: 'servicios', label: 'Índigo', bg: '#4338CA', hover: '#3730A3', text: '#FFFFFF' }
  ];

  const PLANS = [
    { id: 'l1', badge: 'Turnos', name: 'Plan Turnos', promo: '$4.999', regular: '$14.900/mes', bullets: [
      'Portada exclusiva con tu link propio en .tucured.com.ar',
      'Reservas simples desde el celular en 2 pasos',
      'Cobro de señas directo a tu Alias con comprobante adjunto',
      'Agenda diaria ordenada y avisos directos al cliente'
    ] },
    { id: 'l2', badge: 'Gestión', name: 'Plan Gestión', promo: '$4.999', regular: '$24.900/mes', bullets: [
      'Todo lo incluido en Plan Turnos',
      'Ficha e historial completo de cada cliente',
      'Bloqueos de feriados, vacaciones y turnos de mostrador',
      'Organización de múltiples box, sillones o espacios'
    ] },
    { id: 'l3', badge: 'Equipos', name: 'Plan Equipos', promo: '$4.999', regular: '$34.900/mes', bullets: [
      'Todo lo incluido en Plan Gestión',
      'Agenda propia e independiente para cada profesional',
      'Recordatorio automático por WhatsApp 2 hs antes del turno',
      'Vista unificada del rendimiento y ocupación del equipo'
    ] }
  ];

  const LOCALIDADES = [
    'San Miguel de Tucumán', 'Aguilares', 'Alderetes', 'Banda del Río Salí', 'Concepción',
    'El Manantial', 'Famaillá', 'Las Talitas', 'Lules', 'Monteros',
    'San Pablo', 'Simoca', 'Tafí del Valle', 'Tafí Viejo', 'Yerba Buena'
  ];

  const CONNECTORS = new Set(['el', 'la', 'los', 'las', 'de', 'del', 'y', 'e', 'en', 'para', 'con', 'tu', 'su', 'mi', 'a', 'al']);

  function normalizeRubro(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (!s) return '';
    if (s.includes('estet')) return 'estetica';
    if (s.includes('deport') || s.includes('club')) return 'deportes';
    if (s.includes('salud') || s.includes('medic')) return 'salud';
    if (s.includes('servic') || s.includes('estud')) return 'servicios';
    return 'peluqueria';
  }

  function normalizePlan(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (s === 'l1' || s === '1' || s.includes('esencial') || s.includes('turno')) return 'l1';
    if (s === 'l3' || s === '3' || s.includes('equipo')) return 'l3';
    return 'l2';
  }

  function slugifySubdomain(raw) {
    const tokens = String(raw || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]+/g, ' ').split(/[\s-]+/).filter(Boolean);
    const meaningful = tokens.filter((w) => !CONNECTORS.has(w));
    return (meaningful.length ? meaningful : tokens).slice(0, 2).join('-').slice(0, 24).replace(/^-+|-+$/g, '') || 'tu-comercio';
  }

  function formatPisoDepto(raw) {
    const clean = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    if (/^(local|pb|oficina|of\.|piso|depto|dpto|casa|mz|lote)/i.test(clean)) return clean;
    const m = clean.match(/^(\d{1,2})\s*[,;\-\s]+\s*([a-zA-Z0-9]{1,3})$/);
    if (m) return `Piso ${m[1]}, Depto ${m[2].toUpperCase()}`;
    return clean;
  }

  function sanitizePhone10(raw) {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('549')) d = d.slice(3); else if (d.startsWith('54')) d = d.slice(2);
    if (d.startsWith('0')) d = d.slice(1);
    if (d.length > 10) {
      if (d.slice(3, 5) === '15') d = d.slice(0, 3) + d.slice(5);
      else if (d.slice(2, 4) === '15') d = d.slice(0, 2) + d.slice(4);
      else if (d.slice(4, 6) === '15') d = d.slice(0, 4) + d.slice(6);
    }
    return d.slice(0, 10);
  }

  const toE164Whatsapp = (raw) => { const d = sanitizePhone10(raw); return d.length === 10 ? `+549${d}` : ''; };
  const getRubroMeta = (id) => (!id ? { id: '', label: '', short: '', bg: '' } : (RUBROS.find((r) => r.id === id) || RUBROS[0]));
  const getAccentMeta = (id, rubroId) => ACCENT_OPTIONS.find((a) => a.id === id) || ACCENT_OPTIONS.find((a) => a.id === rubroId) || { id: 'default', label: 'Naranja', bg: '#EA580C', hover: '#C2410C', text: '#FFFFFF' };

  function getEffectiveAccent(st) {
    if (st?.accentMode === 'manual' && st?.customAccentHex) return { id: 'custom', label: 'Ajustado', bg: st.customAccentHex, hover: st.customAccentHex, text: '#FFFFFF' };
    if (st?.accentMode === 'auto' && st?.autoAccent?.bg) return st.autoAccent;
    return getAccentMeta(st?.accent, st?.rubro);
  }

  function getPlanMeta(planId, rubro = '') {
    const p = PLANS.find((x) => x.id === normalizePlan(planId)) || PLANS[1];
    if (p.id !== 'l3') return p;
    const teamBullet = rubro === 'deportes' ? 'Agenda independiente para cada cancha o espacio' : 'Agenda propia e independiente para cada profesional';
    return { ...p, bullets: [p.bullets[0], teamBullet, p.bullets[2], p.bullets[3]] };
  }

  function validateSchedule(st) {
    if ((st.open1 || '09:00') >= (st.close1 || '20:00')) return 'La hora Hasta debe ser posterior a Desde en tu primer turno.';
    if (st.horarioModalidad === 'partido') {
      if ((st.open2 || '17:00') < (st.close1 || '13:00')) return 'El turno tarde debe comenzar después del cierre de la mañana.';
      if ((st.open2 || '17:00') >= (st.close2 || '21:00')) return 'En el turno tarde, la hora Hasta debe ser posterior a Desde.';
    }
    return '';
  }

  function buildScheduleSummary(st) {
    const days = st.horarioDias || 'Lunes a sábado';
    if (st.horarioModalidad === 'partido') return `${days} · ${st.open1 || '09:00'} a ${st.close1 || '13:00'} y ${st.open2 || '17:00'} a ${st.close2 || '21:00'}`;
    return `${days} · ${st.open1 || '09:00'} a ${st.close1 || '20:00'}`;
  }

  function createInitialState(search = (typeof window !== 'undefined' ? window.location.search : '')) {
    const p = new URLSearchParams(search || ''), draft = window.TucuEmpezarMicroSteps?.loadDraft?.() || {}, hasQRub = p.has('rubro');
    const rubro = hasQRub ? normalizeRubro(p.get('rubro')) : (draft.rubro || ''), rubroSelected = Boolean(hasQRub || (draft.rubroSelected && rubro));
    const specialties = Array.isArray(draft.specialties) ? draft.specialties : [];
    const plan = normalizePlan(p.has('plan') ? p.get('plan') : (draft.plan || 'l2')), covKey = rubro || 'peluqueria';
    const defCover = window.TucuEmpezarCovers?.getDefaultCoverForRubro?.(covKey), baseTheme = getAccentMeta(rubro, rubro);
    const servicios = (!hasQRub && Array.isArray(draft.servicios) && draft.servicios.length) ? draft.servicios : (window.TucuEmpezarServicesStep?.getDefaultServices?.(covKey, specialties) || []);
    return {
      step: Math.max(1, Math.min(11, Number(draft.step) || 1)), stepDir: 'next', returnToSummary: false,
      comercio: draft.comercio || '', slug: draft.slug || 'tu-comercio', slugTouched: Boolean(draft.slugTouched),
      slugCheck: { status: 'idle', slug: draft.slug || 'tu-comercio', suggestions: [] },
      rubro, rubroSelected, specialties, plan, tonoVoz: draft.tonoVoz || 'cercano',
      bajada: (!hasQRub && typeof draft.bajada === 'string') ? draft.bajada.slice(0, 55) : '', previousBajada: draft.previousBajada || '', noTagline: Boolean(draft.noTagline),
      phrasePage: Number(draft.phrasePage) || 0, aiSuggestion: '', aiHistory: [], keywords: Array.isArray(draft.keywords) ? draft.keywords : [],
      bajadaManual: Boolean(draft.bajadaManual && !hasQRub), taglineFromAi: Boolean(draft.taglineFromAi && !hasQRub),
      aiLoading: false, aiFeedback: '', accent: draft.accent || rubro || 'default', accentMode: draft.accentMode || 'auto', customAccentHex: draft.customAccentHex || '',
      autoAccent: { bg: baseTheme.bg, hover: baseTheme.hover, text: '#FFFFFF', source: 'rubro' }, posterTone: draft.posterTone || 'dark',
      coverId: draft.coverId || defCover?.id || '', coverMode: draft.coverMode || 'live', coverStyle: draft.coverStyle || 'editorial', previewMode: draft.previewMode || 'cover',
      coverTouched: Boolean(draft.coverTouched), localidad: draft.localidad || 'San Miguel de Tucumán', direccion: draft.direccion || '', pisoDepto: draft.pisoDepto || '',
      direccionLat: draft.direccionLat || '', direccionLng: draft.direccionLng || '', geoVerified: Boolean(draft.geoVerified && draft.direccionLat && draft.direccionLng),
      horarioModalidad: draft.horarioModalidad || 'corrido', horarioDias: draft.horarioDias || 'Lunes a sábado',
      open1: draft.open1 || '09:00', close1: draft.close1 || '20:00', open2: draft.open2 || '17:00', close2: draft.close2 || '21:00',
      servicios, serviciosTouched: Boolean(!hasQRub && draft.serviciosTouched), asistenciaCarga: draft.asistenciaCarga || '', pricelistError: '',
      instagram: draft.instagram || '', titularNombre: draft.titularNombre || '', titularApellido: draft.titularApellido || '', whatsapp: draft.whatsapp || '',
      paymentMethod: draft.paymentMethod === 'mp' ? 'mp' : 'transfer', paymentStatus: draft.paymentStatus || '', shortActivarUrl: draft.shortActivarUrl || '',
      termsAccepted: false, termsAcceptedAt: '', termsVersion: 'v1.1', paidViaMp: false, mpPaymentId: '', error: '', submitting: false, submitted: Boolean(draft.submitted)
    };
  }

  return {
    RUBROS, RUBRO_SPECIALTIES, ACCENT_OPTIONS, PLANS, LOCALIDADES,
    normalizeRubro, normalizePlan, slugifySubdomain, formatPisoDepto, sanitizePhone10, toE164Whatsapp,
    getRubroMeta, getAccentMeta, getEffectiveAccent, getPlanMeta, validateSchedule, buildScheduleSummary, createInitialState
  };
})();