// Archivo: js/components/funnel_data.js
/**
 * 🗺️ Tucu Red Web V2 - Constantes y Datos Canónicos del Wizard (SSOT v15.0)
 * 15 localidades de Tucumán, 10 rubros comerciales ampliados y niveles.
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
  { id: 'resto', label: 'Gastronomía (Food & Drink)', icon: 'restaurant' },
  { id: 'salud', label: 'Salud y Medicina (Health)', icon: 'medical_services' },
  { id: 'servicios', label: 'Servicios Profesionales', icon: 'balance' },
  { id: 'hogar', label: 'Construcción y Hogar', icon: 'handyman' },
  { id: 'retail', label: 'Comercio al por Menor (Retail)', icon: 'shopping_bag' },
  { id: 'auto', label: 'Automotriz & Talleres', icon: 'directions_car' },
  { id: 'educacion', label: 'Educación y Cultura', icon: 'school' },
  { id: 'estetica', label: 'Estética & Spa', icon: 'spa' },
  { id: 'barberia', label: 'Barbería / Peluquería', icon: 'content_cut' },
  { id: 'deportes', label: 'Deportes / Pádel', icon: 'sports_tennis' }
];

export const FUNNEL_LEVELS = [
  { 
    id: 'l1', 
    title: 'Nivel 1: Turnero Autónomo Express', 
    desc: 'Reserva web en 3 toques, seña 50% y despacho wa.me sin backend.', 
    badge: 'Nivel 1' 
  },
  { 
    id: 'l2', 
    title: 'Nivel 2: Central Operativa & Agenda Pro', 
    desc: 'Bloqueo en tiempo real, Hash #TK-XXXX, autogestión y Lista Negra/VIP.', 
    badge: 'Nivel 2' 
  },
  { 
    id: 'l3', 
    title: 'Nivel 3: Multi-Staff & Franquicias', 
    desc: 'Agendas independientes por profesional, recursos y recordatorios T-2hs.', 
    badge: 'Nivel 3' 
  }
];

export const TUCURED_CHECKOUT_CONFIG = {
  pricePromo: '$1.000 ARS',
  promoPeriod: 'Mes 1 - Promo Lanzamiento',
  aliasCbu: 'tucured.mp',
  cbuNumber: '0000003100012345678901',
  titular: 'Tucu Red Tecnología Digital',
  qrImageUrl: '/assets/qr_pago_tucured.svg'
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

