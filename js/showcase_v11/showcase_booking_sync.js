// Archivo: js/showcase_v11/showcase_booking_sync.js
// Sincronización en vivo Showroom -> LocalStorage L1/L2/L3 + URL WhatsApp interpolada (< 130L)

import { getActiveCatalogServices } from './showcase_state.js';

const DEMO_WA_NUMBER = '5493815551234';
const L3_RUBRO_MAP = { barberia: 'barberia', estetica: 'peluqueria_estetica', salud: 'salud_consultorio', deportes: 'deportes_clubes' };
const TPL_1A_DEF = '¡Hola {{cliente}}! Registramos tu reserva en {{comercio}} para el {{fecha}} a las {{hora}} hs ({{servicio}}). Para confirmar tu lugar, aboná la seña de {{sena}} por transferencia: Alias: {{alias}} · CBU: {{cbu}}. Enviá el comprobante por este mismo chat para acreditarlo. Podés ver el estado de tu reserva desde tu ticket online: {{link_ticket}}';
const TPL_1B_DEF = '¡Hola {{cliente}}! Tu turno en {{comercio}} quedó confirmado para el {{fecha}} a las {{hora}} hs ({{servicio}}). Podés consultar los datos o gestionar tu reserva desde tu ticket online: {{link_ticket}}';

export function mapShowroomRubroToL3(rubroId) {
  return L3_RUBRO_MAP[String(rubroId || '').toLowerCase()] || 'barberia';
}

function readJson(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
}

function writeJson(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
}

function formatNaturalDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) return 'próximo día';
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return String(dateStr);
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return `${days[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function parseSrvPrice(srv) {
  if (typeof srv?.price === 'number' && srv.price > 0) return srv.price;
  const m = String(srv?.dur || '').match(/\$\s*([\d.]+)/);
  return m ? (parseInt(m[1].replace(/\./g, ''), 10) || 12000) : 12000;
}

function resolvePayCfg(level, rubro) {
  const key = level === 'l1' ? 'tucu_l1_cfg_ext' : `tucu_${level}_payment_cfg`;
  const saved = readJson(key, {}), l1Cfg = level === 'l1' ? readJson('tucu_l1_cfg', {}) : {};
  const str = (k) => { try { return localStorage.getItem(k); } catch (_) { return ''; } };
  return {
    bizName: str(`tucu_${level}_biz_name`) || saved.bizName || l1Cfg.bizName || rubro?.bizName || 'TucuRed Studio',
    alias: str(`tucu_${level}_alias`) || saved.alias || saved.mpAlias || l1Cfg.alias || 'tucured.estudio.mp',
    cbu: str(`tucu_${level}_cbu`) || saved.cbu || saved.mpCbu || l1Cfg.cbu || '0000003100012345678901',
    requireDeposit: saved.requireDeposit !== false,
    depositType: saved.depositType || 'percentage',
    depositValue: Number.isFinite(Number(saved.depositValue)) ? Number(saved.depositValue) : 50
  };
}

export function persistShowcaseBooking(state) {
  const lvl = ['l1', 'l2', 'l3'].includes(state?.currentLevel) ? state.currentLevel : 'l1';
  const rubro = state?.rubros?.[state.currentRubro] || state?.rubros?.barberia || {};
  const srvs = getActiveCatalogServices(state, rubro);
  const srv = srvs[state?.selectedOption || 0] || srvs[0] || { id: 'srv-1', name: 'Turno Web', duration: 30 };
  const dayObj = state?.systemCalendar?.diasReales?.[state?.selectedDay || 0] || {};
  const dateStr = dayObj.dateStr || new Date().toISOString().slice(0, 10);
  const time = state?.selectedTime || '16:30';
  const client = `${state?.clientFirstName || 'Cliente'} ${state?.clientLastName || 'Web'}`.trim();
  const phone = String(state?.clientPhone || '3815554321').replace(/\D/g, '') || '3815554321';
  const code = 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const price = parseSrvPrice(srv), cfg = resolvePayCfg(lvl, rubro);
  const dep = !cfg.requireDeposit ? 0 : (cfg.depositType === 'fixed' ? Math.min(price, Math.round(cfg.depositValue)) : Math.round((price * cfg.depositValue) / 100));
  const needsDep = dep > 0;
  let record;

  if (lvl === 'l1') {
    const key = 'tucu_l1_bookings_demo-peluqueria';
    record = { id: code, token: `#${code}`, clientName: client, clientPhone: phone, service: srv.name, price, depositAmount: dep, depositPaid: !needsDep, day: dayObj.fullLabel || 'Hoy', dateStr, time, status: needsDep ? 'pendiente' : 'confirmado', prevStatus: null, createdFromShowcase: true };
    const prev = readJson(key, []);
    writeJson(key, [record, ...(Array.isArray(prev) ? prev.filter(b => b.id !== code) : [])]);
  } else if (lvl === 'l2') {
    const key = 'tucu_l2_bookings';
    record = { id: code, client, phone, pax: state?.currentRubro === 'resto' ? 2 : 1, service: srv.name, date: dateStr, time, price, depositAmount: dep, depositPaid: !needsDep, status: needsDep ? 'PENDING_DEPOSIT' : 'CONFIRMED', prevStatus: null, createdFromShowcase: true };
    const prev = readJson(key, []);
    writeJson(key, [record, ...(Array.isArray(prev) ? prev.filter(b => b.id !== code) : [])]);
  } else {
    const rL3 = mapShowroomRubroToL3(state?.currentRubro), key = 'tucu_l3_bookings';
    const staffList = readJson(`tucu_l3_staff_${rL3}`, []);
    const idx = state?.selectedStaff || 0;
    const staffObj = Array.isArray(staffList) && staffList[idx] ? staffList[idx] : { id: `st-${Math.min(3, idx + 1)}`, name: rubro?.staff?.[idx] || 'Especialista' };
    const resList = readJson(`tucu_l3_resources_${rL3}`, []);
    const resObj = (Array.isArray(resList) && resList.find(r => !r.deletedAt && r.active !== false)) || { id: 'res-1', name: 'Espacio Principal' };
    record = { id: code, rubroId: rL3, staffId: staffObj.id, staffName: staffObj.name, resourceId: resObj.id, resourceName: resObj.name, serviceId: srv.id || 'srv-1', serviceName: srv.name, duration: srv.duration || 30, price, depositAmount: dep, depositPaid: !needsDep, date: dateStr, time, client, phone, status: needsDep ? 'PENDING_DEPOSIT' : 'CONFIRMED', prevStatus: null, createdFromShowcase: true };
    const prev = readJson(key, []);
    writeJson(key, [record, ...(Array.isArray(prev) ? prev.filter(b => b.id !== code) : [])]);
  }

  state.lastBookingCode = code;
  state.lastBookingRecord = record;
  state.lastBookingLevel = lvl;
  return record;
}

export function buildStep4WaUrl(record, level, rubro) {
  const cfg = resolvePayCfg(level, rubro), tpls = readJson(`tucu_${level}_wa_templates_v2`, {});
  const needsDep = (Number(record?.depositAmount) || 0) > 0 && !record?.depositPaid;
  const tpl = needsDep ? (tpls.t1a || TPL_1A_DEF) : (tpls.t1b || TPL_1B_DEF);
  const code = String(record?.id || 'TK-DEMO').replace(/^#/, '');
  const price = Math.max(1, Number(record?.price) || 12000), dep = Math.max(0, Number(record?.depositAmount) || 0);
  const map = {
    '{{cliente}}': record?.clientName || record?.client || 'Cliente',
    '{{codigo}}': code,
    '{{comercio}}': cfg.bizName,
    '{{servicio}}': record?.service || record?.serviceName || 'Servicio',
    '{{fecha}}': formatNaturalDate(record?.dateStr || record?.date),
    '{{hora}}': record?.time || '16:30',
    '{{sena}}': '$' + Math.round(dep).toLocaleString('es-AR'),
    '{{porcentaje}}': cfg.depositType === 'fixed' ? `$${Math.round(cfg.depositValue).toLocaleString('es-AR')} fijo` : `${Math.round((dep / price) * 100) || 50}%`,
    '{{alias}}': cfg.alias,
    '{{cbu}}': cfg.cbu,
    '{{link_ticket}}': `https://tucured.ar/t/${code}`
  };
  let msg = tpl;
  Object.keys(map).forEach(k => { msg = msg.split(k).join(map[k]); });
  return `https://wa.me/${DEMO_WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
