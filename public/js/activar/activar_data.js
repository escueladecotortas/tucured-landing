// Archivo: public/js/activar/activar_data.js
// Constantes Canónicas, Normalizadores, Prefill URL y Enlace WhatsApp (< 110L)

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

  const LOCALIDADES = [
    'San Miguel de Tucumán', 'Aguilares', 'Alderetes', 'Banda del Río Salí', 'Concepción',
    'El Manantial', 'Famaillá', 'Las Talitas', 'Lules', 'Monteros',
    'San Pablo', 'Simoca', 'Tafí del Valle', 'Tafí Viejo', 'Yerba Buena'
  ];

  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const INTERVALS = [15, 30, 45, 60];
  const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Débito/Crédito'];

  const LEVELS = [
    { id: 'l1', label: 'Nivel 1: Turnero Autónomo' },
    { id: 'l2', label: 'Nivel 2: Central Pro Multi-Box' },
    { id: 'l3', label: 'Nivel 3: Multi-Staff & Recursos' }
  ];

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
    if (s === '1' || s === 'l1') return 'l1';
    if (s === '3' || s === 'l3') return 'l3';
    return 'l2';
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

  function parseQueryPrefill(search = '') {
    const p = new URLSearchParams(search || '');
    const locRaw = (p.get('localidad') || p.get('ciudad') || '').trim();
    const localidad = LOCALIDADES.includes(locRaw) ? locRaw : 'San Miguel de Tucumán';
    return {
      comercio: (p.get('comercio') || p.get('nombre') || '').trim(),
      titular: (p.get('titular') || '').trim(),
      rubro: normalizeRubro(p.get('rubro') || 'estetica'),
      plan: normalizeLevel(p.get('plan') || p.get('level') || 'l2'),
      localidad
    };
  }

  function buildWhatsAppConfirmUrl(payload = {}) {
    const rubroLbl = RUBROS.find(r => r.id === payload.rubro)?.label || payload.rubro || 'Comercio';
    const levelLbl = LEVELS.find(l => l.id === payload.plan)?.label || payload.plan || 'Nivel 2';
    const msg = [
      `¡Hola Tucu Red! Ya completé la ficha de configuración para *${payload.comercio || 'mi comercio'}*.`,
      `• Titular: ${payload.titular || 'Propietario'}`,
      `• Rubro: ${rubroLbl}`,
      `• Plan: ${levelLbl}`,
      `• Localidad y Dirección: ${payload.localidad} (${payload.direccion})`,
      `• WhatsApp del local: ${payload.whatsapp_local}`,
      'Quedo atento para recibir los enlaces oficiales de mi Turnero y Panel de Control.'
    ].join('\n');
    return `https://wa.me/${TUCU_RED_PHONE}?text=${encodeURIComponent(msg)}`;
  }

  return { TUCU_RED_PHONE, RUBROS, LOCALIDADES, DAYS, INTERVALS, PAYMENT_METHODS, LEVELS, normalizeRubro, normalizeLevel, formatE164Ar, parseQueryPrefill, buildWhatsAppConfirmUrl };
})();
