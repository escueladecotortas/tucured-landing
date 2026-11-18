// Archivo: js/components/funnel_data.js
/**
 * 🗺️ Tucu Red Web V2 - Constantes y Datos Canónicos del Wizard (SSOT v16.0)
 * 15 localidades de Tucumán, 6 rubros canónicos reales, niveles alineados y checkout oficial.
 * Restricción estricta: < 200 líneas (< 180L).
 */

export const TUCUMAN_CITIES = [
  'San Miguel de Tucumán',
  'Yerba Buena',
  'Tafí Viejo',
  'Banda del Río Salí',
  'Las Talitas',
  'Alderetes',
  'Concepción',
  'Tafí del Valle',
  'Aguilares',
  'Monteros',
  'Famaillá',
  'Simoca',
  'Lules',
  'El Manantial',
  'San Pablo'
];

export const EXPANDED_RUBROS = [
  { id: 'peluqueria', label: 'Peluquería y Barbería', icon: 'content_cut' },
  { id: 'estetica', label: 'Estética y Spa', icon: 'spa' },
  { id: 'gastronomia', label: 'Gastronomía', icon: 'restaurant' },
  { id: 'deportes', label: 'Deportes y Canchas', icon: 'sports_tennis' },
  { id: 'salud', label: 'Salud y Consultorios', icon: 'medical_services' },
  { id: 'servicios', label: 'Servicios Profesionales', icon: 'work' }
];

export const FUNNEL_LEVELS = [
  {
    id: 'l1',
    title: 'Nivel 1: Turnero Autónomo Express',
    regularPrice: '$14.900 ARS / mes',
    desc: 'Turnero web en 3 pasos + ticket online #TK con dirección, seña a tu alias y feriados 2026 ($14.900/mes desde el 2° mes).',
    badge: 'Nivel 1'
  },
  {
    id: 'l2',
    title: 'Nivel 2: Central Operativa & Agenda Pro',
    regularPrice: '$24.900 ARS / mes',
    desc: 'Todo L1 + CRM y contactos desde el celular, cumpleaños, bloqueo preventivo, vacaciones y Pax ($24.900/mes desde el 2° mes).',
    badge: 'Nivel 2'
  },
  {
    id: 'l3',
    title: 'Nivel 3: Multi-Staff & Recursos',
    regularPrice: '$34.900 ARS / mes',
    desc: 'Todo L2 + agendas por profesional con horario partido, sillones/boxes y Confirmación Automática 2 hs antes ($34.900/mes desde el 2° mes).',
    badge: 'Nivel 3'
  }
];

export const TUCURED_CHECKOUT_CONFIG = {
  pricePromo: '$4.999 ARS',
  promoPeriod: 'Mes Fundador - Primer Mes',
  aliasCbu: 'tucured',
  mpPaymentUrl: 'https://mpago.la/2CTGHu2',
  titular: 'Tucu Red Tecnología Digital'
};

export function sanitizeArgentinePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('549')) d = d.slice(3);
  else if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length > 10) {
    if (d.slice(3, 5) === '15') d = d.slice(0, 3) + d.slice(5);
    else if (d.slice(2, 4) === '15') d = d.slice(0, 2) + d.slice(4);
  }
  return d.slice(0, 10);
}
