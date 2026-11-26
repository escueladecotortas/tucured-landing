// Archivo: js/components/funnel_data.js
/**
 * Tucu Red Web V2 - Constantes y Datos Canónicos del Wizard (SSOT v16.0)
 * 15 localidades de Tucumán (San Miguel primero + 14 alfabéticas), 6 rubros reales y niveles unificados.
 * Restricción estricta: < 200 líneas (< 180L).
 */

export const TUCUMAN_CITIES = [
  'San Miguel de Tucumán',
  'Aguilares',
  'Alderetes',
  'Banda del Río Salí',
  'Concepción',
  'El Manantial',
  'Famaillá',
  'Las Talitas',
  'Lules',
  'Monteros',
  'San Pablo',
  'Simoca',
  'Tafí del Valle',
  'Tafí Viejo',
  'Yerba Buena'
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
    title: 'Plan Turnos',
    regularPrice: '$14.900 ARS / mes',
    desc: 'Agenda web en 2 pasos sin contraseñas, seña configurable a tu Alias/CBU con comprobante online #TK con dirección y calendario, horarios partidos y feriados nacionales ($14.900/mes desde el 2° mes).',
    badge: 'Turnos'
  },
  {
    id: 'l2',
    title: 'Plan Gestión',
    regularPrice: '$24.900 ARS / mes',
    desc: 'Todo Plan Turnos + CRM y contactos desde el celular (.vcf/.csv), Email y cumpleaños, bloqueo preventivo, vacaciones, selector de cantidad de personas o lugares y % de ocupación ($24.900/mes desde el 2° mes).',
    badge: 'Gestión'
  },
  {
    id: 'l3',
    title: 'Plan Equipos',
    regularPrice: '$34.900 ARS / mes',
    desc: 'Todo Plan Gestión + agendas por profesional con horarios partidos (Mañana/Tarde), asignación de sillones/boxes/canchas, sobreturno dual y Confirmación Automática 2 hs antes ($34.900/mes desde el 2° mes).',
    badge: 'Equipos'
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
