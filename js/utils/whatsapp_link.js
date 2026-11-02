// Archivo: js/utils/whatsapp_link.js
/**
 * 📲 Tucu Red Web V2 - Generador Oficial de Enlaces de WhatsApp con Pre-llenado
 * Formatea URLs hacia la línea maestra (5493814132154) con datos dinámicos o fallback.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

export const TUCU_RED_PHONE = '5493814132154';

export const RUBRO_NAMES = {
  barberia: 'Barbería', resto: 'Gastronomía', estetica: 'Estética & Spa',
  deportes: 'Deportes / Pádel', salud: 'Salud / Médico'
};

export const LEVEL_NAMES = {
  l1: 'Nivel 1 (Turnero Express)',
  l2: 'Nivel 2 (Central Pro)',
  l3: 'Nivel 3 (Multi-Staff)'
};

export const WA_FALLBACK_TEXT = '¡Hola Tucu Red! Quiero conocer más sobre los planes y el lanzamiento de $1.000 para mi comercio.';

export const WA_FALLBACK_URL = `https://wa.me/${TUCU_RED_PHONE}?text=${encodeURIComponent(WA_FALLBACK_TEXT)}`;

export function getLeadWhatsAppUrl(lead = {}) {
  const nombre = lead.nombre ? lead.nombre.trim() : 'mi negocio';
  const ciudad = lead.ciudad ? lead.ciudad.trim() : 'Tucumán';
  const rubro = RUBRO_NAMES[lead.rubro] || lead.rubro || 'Comercio Local';
  const level = LEVEL_NAMES[lead.level] || lead.level || 'Nivel 2';

  const message = `¡Hola Tucu Red! Quiero activar el plan para *${nombre}* en *${ciudad}* (Rubro: *${rubro}* / Plan: *${level}* - $1.000 Mes 1).`;
  return `https://wa.me/${TUCU_RED_PHONE}?text=${encodeURIComponent(message)}`;
}

