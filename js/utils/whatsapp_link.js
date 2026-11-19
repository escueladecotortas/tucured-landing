// Archivo: js/utils/whatsapp_link.js
/**
 * 📲 Tucu Red Web V2 - Generador Oficial de Enlaces de WhatsApp con Pre-llenado
 * Formatea URLs hacia la línea maestra (5493814132154) con los 6 rubros canónicos.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

export const TUCU_RED_PHONE = '5493814132154';

export const RUBRO_NAMES = {
  peluqueria: 'Peluquería y Barbería',
  estetica: 'Estética y Spa',
  gastronomia: 'Gastronomía',
  deportes: 'Deportes y Canchas',
  salud: 'Salud y Consultorios',
  servicios: 'Servicios Profesionales',
  barberia: 'Peluquería y Barbería',
  resto: 'Gastronomía'
};

export const LEVEL_NAMES = {
  l1: 'Nivel 1: Turnero Autónomo',
  l2: 'Nivel 2: Central Pro Multi-Box',
  l3: 'Nivel 3: Multi-Staff & Recursos'
};

export const WA_FALLBACK_TEXT = '¡Hola Tucu Red! Quiero conocer más sobre los planes y la promoción Mes Fundador de $4.999 para mi comercio.';

export const WA_FALLBACK_URL = `https://wa.me/${TUCU_RED_PHONE}?text=${encodeURIComponent(WA_FALLBACK_TEXT)}`;

export function getLeadWhatsAppUrl(lead = {}) {
  const nombre = lead.nombre ? lead.nombre.trim() : 'mi negocio';
  const ciudad = lead.ciudad ? lead.ciudad.trim() : 'Tucumán';
  const rubro = RUBRO_NAMES[lead.rubro] || lead.rubro || 'Comercio Local';
  const level = LEVEL_NAMES[lead.level] || lead.level || 'Nivel 2: Central Pro Multi-Box';

  const message = `¡Hola Tucu Red! Quiero activar el plan para *${nombre}* en *${ciudad}* (Rubro: *${rubro}* / Plan: *${level}* - $4.999 Mes Fundador).`;
  return `https://wa.me/${TUCU_RED_PHONE}?text=${encodeURIComponent(message)}`;
}
