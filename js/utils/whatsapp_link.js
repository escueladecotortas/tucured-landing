// Archivo: js/utils/whatsapp_link.js
/**
 * 📲 Tucu Red Web V2 - Generador Oficial de Enlaces de WhatsApp con Pre-llenado
 * Formatea URLs hacia la línea maestra (5493814132154) con todos los datos del Wizard.
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

export function buildActivarUrl(lead = {}) {
  const params = new URLSearchParams();
  if (lead.nombre) params.set('comercio', lead.nombre.trim());
  if (lead.rubro) params.set('rubro', lead.rubro);
  if (lead.level) params.set('plan', lead.level);
  const titular = (lead.titular || `${lead.nombreTitular || ''} ${lead.apellidoTitular || ''}`).trim();
  if (titular) params.set('titular', titular);
  if (lead.ciudad) params.set('localidad', lead.ciudad.trim());
  const qs = params.toString();
  return `https://tucured.ar/activar.html${qs ? `?${qs}` : ''}`;
}

export function getLeadWhatsAppUrl(lead = {}) {
  const nombre = lead.nombre ? lead.nombre.trim() : 'mi negocio';
  const ciudad = lead.ciudad ? lead.ciudad.trim() : 'Tucumán';
  const rubro = RUBRO_NAMES[lead.rubro] || lead.rubro || 'Comercio Local';
  const level = LEVEL_NAMES[lead.level] || lead.level || 'Nivel 2: Central Pro Multi-Box';
  const horario = lead.horario === 'cortado' ? 'Turno cortado (corte de siesta)' : 'Horario corrido';
  const titular = (lead.titular || `${lead.nombreTitular || ''} ${lead.apellidoTitular || ''}`).trim();
  const extras = [
    `• Horario: ${horario}`,
    titular ? `• Titular: ${titular}` : '',
    lead.email ? `• Email: ${lead.email.trim()}` : '',
    lead.whatsapp ? `• WhatsApp: +54 9 ${lead.whatsapp}` : '',
    `• Material PDF QR mostrador: ${lead.materialPdf === false ? 'No' : 'Sí'}`,
    `• Ficha online: ${buildActivarUrl(lead)}`
  ].filter(Boolean).join('\n');

  const message = `¡Hola Tucu Red! Solicito la activación de *${nombre}* en *${ciudad}* y adjunto el comprobante de $4.999 (Mes Fundador).\n• Rubro: ${rubro}\n• Plan: ${level}\n${extras}`;
  return `https://wa.me/${TUCU_RED_PHONE}?text=${encodeURIComponent(message)}`;
}
