// Archivo: js/utils/whatsapp_link.js
/**
 * Tucu Red Web V2 - Generador Oficial de Enlaces de WhatsApp y Ficha Rápida
 * Formatea URLs hacia la línea maestra (5493814132154) y prefill completo hacia /activar.html.
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
  l1: 'Plan Esencial',
  l2: 'Plan Gestión',
  l3: 'Plan Equipos'
};

export const WA_FALLBACK_TEXT = '¡Hola Tucu Red! Quiero conocer más sobre los planes y la promoción Mes Fundador de $4.999 para mi comercio.';

export const WA_FALLBACK_URL = `https://wa.me/${TUCU_RED_PHONE}?text=${encodeURIComponent(WA_FALLBACK_TEXT)}`;

export function buildActivarUrl(lead = {}) {
  const params = new URLSearchParams();
  let nombre = (lead.nombreTitular || '').trim();
  let apellido = (lead.apellidoTitular || '').trim();
  if (!nombre && lead.titular) {
    const parts = String(lead.titular).trim().split(/\s+/);
    nombre = parts.shift() || '';
    apellido = apellido || parts.join(' ');
  }
  const horarioRaw = (lead.schedule || lead.horario || '').trim();
  if (lead.nombre) params.set('comercio', lead.nombre.trim());
  if (lead.rubro) params.set('rubro', lead.rubro);
  if (lead.level) params.set('plan', lead.level);
  if (nombre) params.set('nombre', nombre);
  if (apellido) params.set('apellido', apellido);
  if (lead.ciudad) params.set('localidad', lead.ciudad.trim());
  if (lead.whatsapp) params.set('whatsapp', String(lead.whatsapp).replace(/\D/g, ''));
  if (lead.email) params.set('email', lead.email.trim());
  if (horarioRaw === 'corrido' || horarioRaw === 'cortado') params.set('horario', horarioRaw);
  const qs = params.toString();
  return `https://tucured.ar/activar.html${qs ? `?${qs}` : ''}`;
}

export function getLeadWhatsAppUrl(lead = {}) {
  const nombre = lead.nombre ? lead.nombre.trim() : 'mi negocio';
  const ciudad = lead.ciudad ? lead.ciudad.trim() : 'Tucumán';
  const rubro = RUBRO_NAMES[lead.rubro] || lead.rubro || 'Comercio Local';
  const level = LEVEL_NAMES[lead.level] || lead.level || 'Plan Gestión';
  const horario = (lead.schedule || lead.horario) === 'cortado' ? 'Turno cortado (corte de siesta)' : 'Horario corrido';
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
