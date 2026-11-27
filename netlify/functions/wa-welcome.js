// Archivo: netlify/functions/wa-welcome.js
// BFF Transaccional WhatsApp post-Wizard: 2 mensajes (Transfer 24hs vs MP acreditado) y link corto (< 195L)

const IP_WINDOW_MS = 10 * 60 * 1000, IP_MAX_HITS = 2, PHONE_WINDOW_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 4000, RETRY_BACKOFF_MS = 2200, ALERT_DELAY_MS = 1000, FUNCTION_BUDGET_MS = 9000;
const ipHits = new Map(), phoneHits = new Map();
const PLAN_LABELS = { l1: 'Plan Turnos', l2: 'Plan Gestión', l3: 'Plan Equipos' };
const RUBRO_LABELS = { peluqueria: 'Peluquería y Barbería', estetica: 'Estética y Spa', gastronomia: 'Gastronomía', deportes: 'Deportes y Canchas', salud: 'Salud y Consultorios', servicios: 'Servicios Profesionales' };

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const jsonRes = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });

const getHeader = (headers = {}, name) => {
  const target = name.toLowerCase();
  for (const [k, v] of Object.entries(headers || {})) if (k.toLowerCase() === target) return String(v || '').trim();
  return '';
};

function isAllowedOrigin(headers) {
  const raw = getHeader(headers, 'origin') || getHeader(headers, 'referer');
  if (!raw) return false;
  try {
    const { origin } = new URL(raw);
    return origin === 'https://tucured.ar' || origin === 'https://www.tucured.ar' || /^https:\/\/[a-z0-9-]+\.netlify\.app$/i.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  } catch { return false; }
}

function normalizeArPhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('549')) d = d.slice(3); else if (d.startsWith('54')) d = d.slice(2);
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
  const now = Date.now(), prevIp = (ipHits.get(ip) || []).filter(ts => now - ts < IP_WINDOW_MS);
  if (prevIp.length >= IP_MAX_HITS) return 'IP_RATE_LIMIT';
  const lastPhoneTs = phoneHits.get(phone) || 0;
  if (lastPhoneTs && now - lastPhoneTs < PHONE_WINDOW_MS) return 'PHONE_RATE_LIMIT';
  prevIp.push(now); ipHits.set(ip, prevIp); phoneHits.set(phone, now);
  return '';
}

async function sendGatewayText(baseUrl, apiKey, phone, message, target, deadline) {
  const backoffMs = Math.max(0, Number(process.env.WA_RETRY_BACKOFF_MS ?? RETRY_BACKOFF_MS));
  for (let attempt = 1; attempt <= 2; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 500) { console.warn('[WA_WELCOME_GW]', JSON.stringify({ target, attempt, status: 0, reason: 'BUDGET_EXHAUSTED', durationMs: 0 })); return false; }
    const ctrl = new AbortController(), timeoutMs = Math.min(FETCH_TIMEOUT_MS, Math.max(500, remaining - 200));
    const timer = setTimeout(() => ctrl.abort(), timeoutMs), t0 = Date.now();
    let status = 0, reason = '', transient = false;
    try {
      const res = await fetch(`${baseUrl}/api/wa/send`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ phone, message }), signal: ctrl.signal });
      if (res.ok) return true;
      status = res.status; transient = status === 503 || status === 504; reason = transient ? 'TRANSIENT_HTTP' : 'NON_RETRYABLE_HTTP';
    } catch (err) {
      transient = true; reason = err?.name === 'AbortError' ? 'ABORT_TIMEOUT' : 'NETWORK_ERROR';
    } finally { clearTimeout(timer); }
    console.warn('[WA_WELCOME_GW]', JSON.stringify({ target, attempt, status, reason, durationMs: Date.now() - t0 }));
    if (attempt === 1 && transient && deadline - Date.now() > backoffMs + 1800) { if (backoffMs > 0) await sleep(backoffMs); continue; }
    return false;
  }
  return false;
}

export function __resetRateLimits() { ipHits.clear(); phoneHits.clear(); }

export async function handler(event) {
  const deadline = Date.now() + FUNCTION_BUDGET_MS;
  if (event?.httpMethod !== 'POST') return jsonRes(405, { ok: false, reason: 'METHOD_NOT_ALLOWED' });
  if (!isAllowedOrigin(event.headers)) return jsonRes(403, { ok: false, reason: 'FORBIDDEN_ORIGIN' });

  let data;
  try { data = JSON.parse(event.body || '{}'); } catch { return jsonRes(400, { ok: false, reason: 'INVALID_JSON' }); }

  const comercio = String(data.nombre || '').trim();
  const slug = String(data.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  const shortUrl = String(data.shortUrl || data.activarUrl || '').trim();
  const fallbackShort = slug ? `https://tucured.ar/activar.html?s=${slug}` : shortUrl;
  const finalLink = (shortUrl.startsWith('https://tucured.ar/activar.html') ? shortUrl : fallbackShort).split('&comercio=')[0];
  const phone = normalizeArPhone(data.whatsapp);
  if (!comercio || !finalLink.startsWith('https://tucured.ar/activar.html') || !phone) {
    return jsonRes(400, { ok: false, reason: 'INVALID_PAYLOAD' });
  }

  const apiKey = String(process.env.WA_GATEWAY_API_KEY || '').trim();
  if (!apiKey) return jsonRes(503, { ok: false, reason: 'GATEWAY_NOT_CONFIGURED' });

  const ip = getHeader(event.headers, 'x-nf-client-connection-ip') || getHeader(event.headers, 'x-forwarded-for').split(',')[0].trim() || 'unknown';
  const limitErr = checkRateLimits(ip, phone);
  if (limitErr) return jsonRes(429, { ok: false, reason: limitErr });

  const baseUrl = String(process.env.WA_GATEWAY_URL || 'https://api.tucured.com.ar').replace(/\/+$/, '');
  const nombreTitular = String(data.nombreTitular || '').trim() || 'Hola';
  const apellidoTitular = String(data.apellidoTitular || '').trim();
  const titular = `${nombreTitular} ${apellidoTitular}`.trim();
  const planLbl = PLAN_LABELS[data.level] || PLAN_LABELS[data.plan] || PLAN_LABELS.l2;
  const rubroLbl = RUBRO_LABELS[data.rubro] || String(data.rubro || 'Comercio');
  const ciudad = String(data.ciudad || 'Tucumán').trim();
  const isPaid = data.paymentMethod === 'mp' && data.paymentStatus === 'paid';
  const appDomain = slug ? `https://${slug}.tucured.com.ar` : '';

  const welcomeMsg = isPaid ? [
    `¡Hola ${nombreTitular}! 🙌 Qué alegría sumarte a *Tucu Red*.`,
    `Confirmamos tu pago y activación para *${comercio}* en *${planLbl}*.`,
    appDomain ? `Tu link de reservas: ${appDomain}` : '',
    `Si querés completar o ajustar algún detalle operativo, entrá directo a tu ficha:\n${finalLink}`,
    `Respondé este mensaje si querés enviarnos tu lista de precios o consultarnos algo.`
  ].filter(Boolean).join('\n\n') : [
    `¡Hola ${nombreTitular}! 🙌 Guardamos tu diseño y link para *${comercio}* (*${planLbl}*).`,
    `Tenés *24 horas corridas* para transferir *$4.999* al Alias *tucured* (Titular: *Leonardo Laricchiuta*) y enviarnos el comprobante por acá antes de que el link y la portada exclusiva vuelvan a liberarse.`,
    `Para completar o ajustar detalles de tu local usá tu ficha rápida:\n${finalLink}`,
    `Respondé este mismo WhatsApp con tu comprobante y dejamos tu App en vivo hoy.`
  ].join('\n\n');

  const welcomeSent = await sendGatewayText(baseUrl, apiKey, phone, welcomeMsg, 'welcome', deadline);
  if (!welcomeSent) phoneHits.delete(phone);

  let alertSent = false;
  const leoPhone = String(process.env.LEO_ALERT_PHONE || '').replace(/\D/g, '');
  if (leoPhone && /^\d{12,15}$/.test(leoPhone) && leoPhone !== phone) {
    const delayMs = Math.max(0, Number(process.env.WA_ALERT_DELAY_MS ?? ALERT_DELAY_MS));
    if (delayMs > 0 && deadline - Date.now() > delayMs + 1500) await sleep(delayMs);
    const alertMsg = [
      `🚀 *Nuevo Lead Wizard — Tucu Red*`,
      `• Comercio: *${comercio}*`,
      `• Titular: ${titular}`,
      `• Rubro: ${rubroLbl}`,
      `• Plan: ${planLbl}`,
      `• Pago: ${isPaid ? 'Mercado Pago Aprobado' : 'Reserva Transferencia 24hs'}`,
      `• Localidad: ${ciudad}`,
      appDomain ? `• Subdominio: ${appDomain}` : '',
      `• WhatsApp: +${phone}`,
      `• Chat directo: https://wa.me/${phone}`
    ].filter(Boolean).join('\n');
    alertSent = await sendGatewayText(baseUrl, apiKey, leoPhone, alertMsg, 'alert', deadline);
  }

  return jsonRes(200, { ok: true, welcomeSent, alertSent });
}