// Archivo: netlify/functions/wa-welcome.js
// BFF Transaccional WhatsApp post-Wizard: Anti-Abuso, Rate-Limit y Despacho Seguro a :5051 (< 175L)

const IP_WINDOW_MS = 10 * 60 * 1000;
const IP_MAX_HITS = 2;
const PHONE_WINDOW_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;
const ALERT_DELAY_MS = 1500;

const ipHits = new Map();
const phoneHits = new Map();

const PLAN_LABELS = {
  l1: 'Nivel 1 — Turnero Autónomo',
  l2: 'Nivel 2 — Central Pro Multi-Box',
  l3: 'Nivel 3 — Multi-Staff & Recursos'
};

const RUBRO_LABELS = {
  peluqueria: 'Peluquería y Barbería',
  estetica: 'Estética y Spa',
  gastronomia: 'Gastronomía',
  deportes: 'Deportes y Canchas',
  salud: 'Salud y Consultorios',
  servicios: 'Servicios Profesionales'
};

const jsonRes = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

const getHeader = (headers = {}, name) => {
  const target = name.toLowerCase();
  for (const [k, v] of Object.entries(headers || {})) {
    if (k.toLowerCase() === target) return String(v || '').trim();
  }
  return '';
};

function isAllowedOrigin(headers) {
  const raw = getHeader(headers, 'origin') || getHeader(headers, 'referer');
  if (!raw) return false;
  try {
    const { origin } = new URL(raw);
    if (origin === 'https://tucured.ar' || origin === 'https://www.tucured.ar') return true;
    if (/^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin)) return true;
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
    return false;
  } catch {
    return false;
  }
}

function normalizeArPhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('549')) d = d.slice(3);
  else if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length > 10) {
    if (d.slice(3, 5) === '15') d = d.slice(0, 3) + d.slice(5);
    else if (d.slice(2, 4) === '15') d = d.slice(0, 2) + d.slice(4);
    else if (d.slice(4, 6) === '15') d = d.slice(0, 4) + d.slice(6);
  }
  if (d.length !== 10) return '';
  const e164 = `549${d}`;
  return /^\d{12,15}$/.test(e164) ? e164 : '';
}

function checkRateLimits(ip, phone) {
  const now = Date.now();
  const prevIp = (ipHits.get(ip) || []).filter(ts => now - ts < IP_WINDOW_MS);
  if (prevIp.length >= IP_MAX_HITS) return 'IP_RATE_LIMIT';
  const lastPhoneTs = phoneHits.get(phone) || 0;
  if (lastPhoneTs && now - lastPhoneTs < PHONE_WINDOW_MS) return 'PHONE_RATE_LIMIT';
  prevIp.push(now);
  ipHits.set(ip, prevIp);
  phoneHits.set(phone, now);
  return '';
}

async function sendGatewayText(baseUrl, apiKey, phone, message) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}/api/wa/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ phone, message }),
      signal: ctrl.signal
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function __resetRateLimits() {
  ipHits.clear();
  phoneHits.clear();
}

export async function handler(event) {
  if (event?.httpMethod !== 'POST') return jsonRes(405, { ok: false, reason: 'METHOD_NOT_ALLOWED' });
  if (!isAllowedOrigin(event.headers)) return jsonRes(403, { ok: false, reason: 'FORBIDDEN_ORIGIN' });

  let data;
  try { data = JSON.parse(event.body || '{}'); } catch { return jsonRes(400, { ok: false, reason: 'INVALID_JSON' }); }

  const comercio = String(data.nombre || '').trim();
  const activarUrl = String(data.activarUrl || '').trim();
  const phone = normalizeArPhone(data.whatsapp);
  if (!comercio || !activarUrl.startsWith('https://tucured.ar/activar.html') || !phone) {
    return jsonRes(400, { ok: false, reason: 'INVALID_PAYLOAD' });
  }

  const apiKey = String(process.env.WA_GATEWAY_API_KEY || '').trim();
  if (!apiKey) return jsonRes(503, { ok: false, reason: 'GATEWAY_NOT_CONFIGURED' });

  const ip = getHeader(event.headers, 'x-nf-client-connection-ip')
    || getHeader(event.headers, 'x-forwarded-for').split(',')[0].trim()
    || 'unknown';
  const limitErr = checkRateLimits(ip, phone);
  if (limitErr) return jsonRes(429, { ok: false, reason: limitErr });

  const baseUrl = String(process.env.WA_GATEWAY_URL || 'https://api.tucured.com.ar').replace(/\/+$/, '');
  const nombreTitular = String(data.nombreTitular || '').trim() || 'Hola';
  const apellidoTitular = String(data.apellidoTitular || '').trim();
  const titular = `${nombreTitular} ${apellidoTitular}`.trim();
  const planLbl = PLAN_LABELS[data.level] || PLAN_LABELS.l2;
  const rubroLbl = RUBRO_LABELS[data.rubro] || String(data.rubro || 'Comercio');
  const ciudad = String(data.ciudad || 'Tucumán').trim();
  const email = String(data.email || '').trim();

  const welcomeMsg = [
    `¡Hola ${nombreTitular}! 🙌 Qué alegría sumarte a *Tucu Red*.`,
    `Ya registramos tu solicitud para *${comercio}* con el plan *${planLbl}*.`,
    `Cuando gustes, completá tus horarios, servicios y logo en tu Ficha Rápida de Configuración (ya tiene tus datos cargados):`,
    activarUrl,
    `Ante cualquier consulta respondé este mismo mensaje. ¡Estamos para ayudarte a dejar tu turnero listo hoy!`
  ].join('\n\n');

  const welcomeSent = await sendGatewayText(baseUrl, apiKey, phone, welcomeMsg);

  let alertSent = false;
  const leoPhone = String(process.env.LEO_ALERT_PHONE || '').replace(/\D/g, '');
  if (leoPhone && /^\d{12,15}$/.test(leoPhone) && leoPhone !== phone) {
    const delayMs = Number(process.env.WA_ALERT_DELAY_MS ?? ALERT_DELAY_MS);
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
    const alertMsg = [
      `🚀 *Nuevo Lead Wizard — Tucu Red*`,
      `• Comercio: *${comercio}*`,
      `• Titular: ${titular}`,
      `• Rubro: ${rubroLbl}`,
      `• Plan: ${planLbl}`,
      `• Localidad: ${ciudad}`,
      `• WhatsApp: +${phone}`,
      email ? `• Email: ${email}` : '',
      `• Chat directo: https://wa.me/${phone}`
    ].filter(Boolean).join('\n');
    alertSent = await sendGatewayText(baseUrl, apiKey, leoPhone, alertMsg);
  }

  return jsonRes(200, { ok: true, welcomeSent, alertSent });
}
