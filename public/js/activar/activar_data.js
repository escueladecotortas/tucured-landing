// Archivo: public/js/activar/activar_data.js
// Constantes Canónicas, Planes Oficiales (Esencial/Gestión/Equipos), Prefill Dual, Servicios y WhatsApp (< 170L)

window.TucuActivarData = (function () {
  const TUCU_RED_PHONE = '5493814132154';

  const RUBROS = [
    { id: 'peluqueria', label: 'Peluquería y Barbería' },
    { id: 'estetica', label: 'Estética y Spa' },
    { id: 'gastronomia', label: 'Gastronomía' },
    { id: 'deportes', label: 'Deportes y Canchas' },
    { id: 'salud', label: 'Salud y Consultorios' },
    { id: 'servicios', label: 'Servicios Profesionales' }
  ];

  const RUBRO_SPACE_CONFIG = {
    peluqueria: { singular: 'Sillón / Puesto', plural: 'Sillones / Puestos', placeholder: 'Ej: Sillón 1, Sillón 2', needsCapacity: false },
    estetica: { singular: 'Gabinete / Box', plural: 'Gabinetes / Boxes', placeholder: 'Ej: Gabinete 1, Box Depilación', needsCapacity: false },
    salud: { singular: 'Consultorio', plural: 'Consultorios', placeholder: 'Ej: Consultorio 1, Consultorio 2', needsCapacity: false },
    deportes: { singular: 'Cancha / Espacio', plural: 'Canchas / Espacios', placeholder: 'Ej: Cancha 1, Cancha 2', needsCapacity: true, capLabel: 'Jugadores o personas por turno' },
    gastronomia: { singular: 'Mesa / Sector', plural: 'Mesas / Sectores', placeholder: 'Ej: Salón Principal, Patio', needsCapacity: true, capLabel: 'Comensales máximos por reserva' },
    servicios: { singular: 'Box / Puesto', plural: 'Boxes / Puestos', placeholder: 'Ej: Puesto 1, Taller', needsCapacity: false }
  };

  const LOCALIDADES = [
    'San Miguel de Tucumán', 'Aguilares', 'Alderetes', 'Banda del Río Salí', 'Concepción',
    'El Manantial', 'Famaillá', 'Las Talitas', 'Lules', 'Monteros',
    'San Pablo', 'Simoca', 'Tafí del Valle', 'Tafí Viejo', 'Yerba Buena'
  ];

  const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Débito/Crédito'];

  const LEVELS = [
    { id: 'l1', label: 'Plan Esencial' },
    { id: 'l2', label: 'Plan Gestión' },
    { id: 'l3', label: 'Plan Equipos' }
  ];

  const TONE_LABELS = {
    cercano: 'Cercano & Barrial',
    boutique: 'Boutique & Elegante',
    agil: 'Directo & Ágil',
    profesional: 'Profesional & Clínico'
  };

  function normalizeRubro(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (s.includes('peluq') || s.includes('barber')) return 'peluqueria';
    if (s.includes('estet')) return 'estetica';
    if (s.includes('gastro') || s === 'resto') return 'gastronomia';
    if (s.includes('deport') || s.includes('club')) return 'deportes';
    if (s.includes('salud') || s.includes('medic')) return 'salud';
    if (s.includes('servic') || s.includes('estud')) return 'servicios';
    return 'estetica';
  }

  function normalizeLevel(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (s === '1' || s === 'l1' || s.includes('esencial')) return 'l1';
    if (s === '3' || s === 'l3' || s.includes('equipo')) return 'l3';
    return 'l2';
  }

  function normalizeScheduleMode(raw) {
    const s = String(raw || '').toLowerCase().trim();
    return (s === 'cortado' || s === 'partido') ? 'partido' : 'corrido';
  }

  function formatE164Ar(raw) {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('549')) d = d.slice(3);
    else if (d.startsWith('54')) d = d.slice(2);
    if (d.startsWith('0')) d = d.slice(1);
    if (d.length > 10) {
      if (d.slice(3, 5) === '15') d = d.slice(0, 3) + d.slice(5);
      else if (d.slice(2, 4) === '15') d = d.slice(0, 2) + d.slice(4);
    }
    const digits10 = d.slice(0, 10);
    return { digits10, e164: digits10.length === 10 ? `+549${digits10}` : '' };
  }

  function splitTitular(raw) {
    const clean = String(raw || '').trim();
    if (!clean) return { nombre: '', apellido: '' };
    const idx = clean.indexOf(' ');
    if (idx === -1) return { nombre: clean, apellido: '' };
    return { nombre: clean.slice(0, idx).trim(), apellido: clean.slice(idx + 1).trim() };
  }

  function readStoredWizard() {
    try { return JSON.parse(localStorage.getItem('local_db_wizard') || 'null') || {}; }
    catch { return {}; }
  }

  function formatCoverLabel(coverId, fallbackName) {
    if (fallbackName) return fallbackName;
    if (!coverId) return '';
    if (coverId === 'custom') return 'Foto propia WebP';
    return String(coverId).split('-').slice(1, -1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || coverId;
  }

  function resolvePrefillData(search = (typeof window !== 'undefined' ? window.location.search : '')) {
    const p = new URLSearchParams(search || '');
    const w = readStoredWizard();
    const pick = (qKeys, fallback) => {
      for (const k of qKeys) {
        const v = (p.get(k) || '').trim();
        if (v) return v;
      }
      return String(fallback || '').trim();
    };

    const qTitular = splitTitular(p.get('titular') || '');
    const wTitular = splitTitular(w.titular || '');
    const nombreTitular = pick(['nombre', 'titular_nombre'], qTitular.nombre || w.nombreTitular || w.titular_nombre || wTitular.nombre);
    const apellidoTitular = pick(['apellido', 'titular_apellido'], qTitular.apellido || w.apellidoTitular || w.titular_apellido || wTitular.apellido);
    const locRaw = pick(['localidad', 'ciudad'], w.localidad || w.ciudad || 'San Miguel de Tucumán');
    const localidad = LOCALIDADES.includes(locRaw) ? locRaw : 'San Miguel de Tucumán';
    const waRaw = pick(['whatsapp', 'telefono'], w.whatsapp || '');
    const comercio = pick(['comercio'], w.comercio || w.nombre || '');
    const plan = normalizeLevel(pick(['plan', 'level'], w.plan || w.level || 'l2'));
    const tonoVoz = pick(['tono_voz', 'tono'], w.tono_voz || '');
    const coverId = pick(['cover_id', 'cover'], w.cover_id || '');
    const slug = pick(['slug'], w.slug || '');
    const direccion = pick(['direccion'], w.direccion || '');
    const instagram = pick(['instagram'], w.instagram || '');
    const servicios = Array.isArray(w.servicios) ? w.servicios.filter(s => s && (s.name || s.nombre)) : [];
    const asistenciaCarga = String(w.asistencia_carga || '').trim();

    return {
      comercio, nombreTitular, apellidoTitular, email: pick(['email'], w.email || ''),
      rubro: normalizeRubro(pick(['rubro'], w.rubro || 'estetica')), plan,
      planLabel: LEVELS.find(l => l.id === plan)?.label || 'Plan Gestión',
      localidad, whatsapp: formatE164Ar(waRaw).digits10,
      horario: normalizeScheduleMode(pick(['horario', 'schedule'], w.schedule || w.horario || 'corrido')),
      tonoVoz, tonoLabel: TONE_LABELS[tonoVoz] || w.tono_label || '',
      coverId, coverLabel: formatCoverLabel(coverId, w.cover_nombre),
      slug, direccion, instagram, servicios, asistenciaCarga,
      hasInherited: Boolean(comercio || p.get('plan') || p.get('tono_voz') || p.get('cover_id') || w.fromEmpezar)
    };
  }

  function buildWhatsAppConfirmUrl(payload = {}) {
    const rubroLbl = RUBROS.find(r => r.id === payload.rubro)?.label || payload.rubro || 'Comercio';
    const levelLbl = LEVELS.find(l => l.id === payload.plan)?.label || payload.plan || 'Plan Gestión';
    const titular = `${payload.nombre_titular || ''} ${payload.apellido_titular || ''}`.trim() || 'Propietario';
    const dirFull = payload.direccion_referencia ? `${payload.direccion} (${payload.direccion_referencia})` : payload.direccion;
    const msg = [
      `¡Hola Tucu Red! Ya completé la ficha de configuración para *${payload.comercio || 'mi comercio'}*.`,
      `• Titular: ${titular}`,
      `• Rubro: ${rubroLbl}`,
      `• Plan: ${levelLbl}`,
      `• Localidad y Dirección: ${payload.localidad} — ${dirFull}`,
      `• WhatsApp del local: ${payload.whatsapp_local}`,
      'Quedo atento para recibir los enlaces oficiales de mi Turnero y Panel de Control.'
    ].join('\n');
    return `https://wa.me/${TUCU_RED_PHONE}?text=${encodeURIComponent(msg)}`;
  }

  return {
    TUCU_RED_PHONE, RUBROS, RUBRO_SPACE_CONFIG, LOCALIDADES, PAYMENT_METHODS, LEVELS, TONE_LABELS,
    normalizeRubro, normalizeLevel, normalizeScheduleMode, formatE164Ar,
    resolvePrefillData, buildWhatsAppConfirmUrl
  };
})();
