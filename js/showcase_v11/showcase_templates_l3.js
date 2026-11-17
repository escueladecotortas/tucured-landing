// Archivo: js/showcase_v11/showcase_templates_l3.js
// Pieles Temáticas Stitch L3 (Aura Light): Staff Dinámico, Horarios Partidos, Bloqueos y Feriados Granulares (< 145L)

import { getSystemCalendar, getVisibleDays, isSelectedDaySunday, isTimePast, getActiveCatalogServices, normalizeShowroomRubro } from './showcase_state.js';

const L3_RUBRO_MAP = { barberia: 'barberia', peluqueria: 'barberia', estetica: 'peluqueria_estetica', peluqueria_estetica: 'peluqueria_estetica', salud: 'salud_consultorio', salud_consultorio: 'salud_consultorio', deportes: 'deportes_clubes', deportes_clubes: 'deportes_clubes', resto: 'gastronomia', gastronomia: 'gastronomia', servicios: 'servicios' };
const HOL_MM_DD = new Set(['01-01', '02-16', '02-17', '03-24', '04-02', '04-03', '05-01', '05-25', '06-15', '06-20', '07-09', '08-17', '10-12', '11-23', '12-08', '12-25']);

function readJson(k, fb) {
  try { const v = typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null; return v ? JSON.parse(v) : fb; } catch (_) { return fb; }
}
function isNatHoliday(dateStr) {
  if (!dateStr) return false;
  if (HOL_MM_DD.has(dateStr.slice(5, 10))) return true;
  const cached = readJson(`tucured_holidays_${dateStr.slice(0, 4)}`, []);
  return Array.isArray(cached) && cached.some(h => h && h.fecha === dateStr);
}
function mapL3Rubro(raw) {
  const s = String(raw || '').toLowerCase().trim();
  return L3_RUBRO_MAP[s] || L3_RUBRO_MAP[normalizeShowroomRubro(s)] || 'barberia';
}
function getActiveL3Staff(state, r) {
  const rL3 = mapL3Rubro(r?.id || state?.currentRubro), stored = readJson(`tucu_l3_staff_${rL3}`, null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter(s => s && !s.deletedAt && s.active !== false).map(s => ({ id: s.id, name: s.role ? `${s.name} (${s.role})` : s.name, raw: s }));
  }
  return (r?.staff || ['Especialista']).map((label, i) => ({ id: `st-${i + 1}`, name: label, raw: null }));
}
function getL3SlotContext(state, r) {
  const norm = normalizeShowroomRubro(r?.id || state?.currentRubro), rL3 = mapL3Rubro(r?.id || state?.currentRubro);
  const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
  const dateStr = cal.diasReales?.[state?.selectedDay || 0]?.dateStr || '';
  const hols = readJson('tucu_l3_holidays', []), holMap = { ...readJson(`tucu_l3_holidays_state_${norm}`, {}), ...readJson(`tucu_l3_holidays_state_${rL3}`, {}) };
  const custHol = Array.isArray(hols) ? hols.find(h => h && !h.deletedAt && h.date === dateStr) : null;
  let closedHoliday = false;
  if (dateStr && custHol) closedHoliday = Object.prototype.hasOwnProperty.call(holMap, dateStr) ? holMap[dateStr] !== false : !custHol.isException;
  else if (dateStr && isNatHoliday(dateStr)) closedHoliday = holMap[dateStr] !== false;

  const staffList = getActiveL3Staff(state, r), staff = staffList[state?.selectedStaff || 0] || staffList[0] || {};
  const srvs = getActiveCatalogServices(state, r), selSrv = srvs[state?.selectedOption || 0] || srvs[0];
  const dayKey = dateStr ? String(new Date(`${dateStr}T12:00:00`).getDay()) : '', wh = staff.raw?.workingHours?.[dayKey] || null;
  const blocks = readJson(`tucu_l3_blocks_${rL3}`, []);
  const bksP = readJson(`tucu_l3_bookings_${rL3}`, []), bksA = readJson('tucu_l3_bookings', []);
  const bks = [...(Array.isArray(bksP) ? bksP : []), ...(Array.isArray(bksA) ? bksA.filter(b => b && (!b.rubroId || b.rubroId === rL3)) : [])];
  const isBooked = (t) => bks.some(b => b && !b.deletedAt && (b.date || b.dateStr) === dateStr && b.time === t && !['CANCELLED', 'CANCELADO'].includes(String(b.status || '').toUpperCase()) && (!b.staffId || !staff.id || b.staffId === staff.id));
  const isSrvBlocked = (t) => Array.isArray(blocks) && blocks.some(bl => bl && !bl.deletedAt && bl.date === dateStr && t >= bl.start && t <= bl.end && (!bl.serviceId || !selSrv?.id || bl.serviceId === selSrv.id));
  const inStaffHours = (t) => {
    if (!wh) return true; if (!wh.active) return false;
    const inM = t >= (wh.start || '09:00') && (wh.start === wh.end ? t === wh.start : t < (wh.end || '19:00'));
    const inA = Boolean(wh.isSplit && t >= (wh.open2 || '16:00') && (wh.open2 === wh.close2 ? t === wh.open2 : t < (wh.close2 || '21:00')));
    return inM || inA;
  };
  return { closedHoliday, isSlotBlocked: (t) => !inStaffHours(t) || isSrvBlocked(t) || isBooked(t) };
}

export const ShowcaseTemplatesL3 = {
  render(rubroId, state, rubro) {
    if (rubroId === 'salud') return this.renderSalud(state, rubro);
    if (rubroId === 'resto') return this.renderResto(state, rubro);
    if (rubroId === 'barberia') return this.renderBarberia(state, rubro);
    if (rubroId === 'deportes') return this.renderDeportes(state, rubro);
    return this.renderEstetica(state, rubro);
  },

  renderDateHeader(title, colorClass, state) {
    const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
    const page = state ? (state.calendarPage || 0) : 0, maxPage = Math.max(0, Math.floor(((cal.diasReales || []).length - 1) / 4));
    const canPrev = page > 0, canNext = page < maxPage;
    return `<div class="flex items-center justify-between mb-1.5"><div class="flex items-center gap-2"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">${title}</h4><span class="${colorClass} text-[11px] font-semibold">${cal.mesActual}</span></div><div class="flex items-center gap-1"><button type="button" onclick="window.ShowcaseCore.prevDayPage()" ${canPrev ? '' : 'disabled'} class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${canPrev ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-40'}">‹</button><button type="button" onclick="window.ShowcaseCore.nextDayPage()" ${canNext ? '' : 'disabled'} class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${canNext ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-40'}">›</button></div></div>`;
  },

  renderDates(state, activeClass) {
    return getVisibleDays(state).map(d => `<button type="button" onclick="window.ShowcaseCore.selectDay(${d.globalIndex})" class="shrink-0 min-w-[58px] min-h-[64px] rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${state.selectedDay === d.globalIndex ? activeClass : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs'}"><span class="text-[12px] opacity-70">${d.diaNombre}</span><span class="text-[16px] font-bold text-slate-900">${d.diaNumero}</span></button>`).join('');
  },

  renderTimeGrid(times, r, state, activeBorder, activeText) {
    if (isSelectedDaySunday(state)) return '<div class="p-4 text-center bg-slate-100 rounded-xl text-slate-500 font-medium text-xs sm:text-sm border border-slate-200">Local cerrado los domingos</div>';
    const ctx = getL3SlotContext(state, r);
    if (ctx.closedHoliday) return '<div class="p-4 text-center bg-amber-50 rounded-xl text-amber-800 font-medium text-xs border border-amber-200">Fecha cerrada por feriado</div>';
    return `<div class="grid grid-cols-2 gap-1.5">${times.map(t => {
      if (isTimePast(t, state)) return `<button type="button" disabled class="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 opacity-30 line-through pointer-events-none cursor-not-allowed border-dashed flex items-center justify-center text-xs font-mono"><span>${t} hs</span></button>`;
      if (ctx.isSlotBlocked(t)) return `<button type="button" disabled class="py-2 px-2.5 rounded-xl border border-slate-100 bg-slate-100 text-slate-400 opacity-60 line-through flex items-center justify-between text-xs font-mono cursor-not-allowed"><span>${t} hs</span><span class="text-[9px] no-underline bg-red-50 text-red-600 px-1 py-0.5 rounded font-sans font-bold">Bloqueado</span></button>`;
      return `<button type="button" onclick="window.ShowcaseCore.selectTime('${t}')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer transition-all ${state.selectedTime === t ? `${activeBorder} bg-slate-100 ${activeText} font-bold shadow-xs` : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="material-symbols-outlined text-xs">schedule</span><span>${t} hs</span></button>`;
    }).join('')}</div>`;
  },

  renderStaffSelector(r, state, borderClass) {
    const items = getActiveL3Staff(state, r);
    return `<div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Especialista</h4><div class="grid grid-cols-1 gap-1.5">${items.map((st, idx) => `<button type="button" onclick="window.ShowcaseCore.selectStaff(${idx})" class="p-2 rounded-xl text-left text-xs border flex items-center justify-between cursor-pointer transition-all ${(state.selectedStaff || 0) === idx ? `${borderClass} bg-slate-100 text-slate-900 font-bold shadow-xs` : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}"><span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm opacity-70">person</span><span>${st.name}</span></span>${(state.selectedStaff || 0) === idx ? '<span class="material-symbols-outlined text-xs">check</span>' : ''}</button>`).join('')}</div></div>`;
  },

  renderCatalog(r, state, activeColor) {
    const items = getActiveCatalogServices(state, r);
    const listHtml = items.length === 0 ? '<div class="col-span-2 p-3 text-center text-xs text-slate-500 bg-slate-100 rounded-xl border border-slate-200">Sin servicios disponibles actualmente</div>' : items.map((cat, idx) => `<button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="p-2 rounded-xl text-left border cursor-pointer transition-all ${(state.selectedOption || 0) === idx ? `${activeColor} bg-slate-100 font-bold shadow-xs` : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}"><span class="block text-xs text-slate-900">${cat.name}</span><span class="block text-[10px] text-slate-500 font-mono mt-0.5">${cat.dur || ''}</span></button>`).join('');
    return `<div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Catálogo con Duración</h4><div class="grid grid-cols-2 gap-1.5">${listHtml}</div></div>`;
  },

  renderSubmitBtn(r) { return `<button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 ${r.btnClass} py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer"><span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span></button>`; },

  renderBlock(state, r, border, text, dateActive, times) {
    return `<div class="space-y-2.5">${this.renderStaffSelector(r, state, border)}${this.renderCatalog(r, state, `${border} ${text}`)}<div>${this.renderDateHeader('Fecha', text, state)}<div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, dateActive)}</div></div><div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios</h4>${this.renderTimeGrid(times, r, state, border, text)}</div></div>${this.renderSubmitBtn(r)}`;
  },
  renderEstetica(state, r) { return this.renderBlock(state, r, 'border-[#D4AF37]', 'text-[#9A7D0A]', 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#9A7D0A] font-bold shadow-xs', ['09:30', '11:00', '16:30', '18:00']); },
  renderResto(state, r) { return this.renderBlock(state, r, 'border-[#E07A5F]', 'text-[#C85A3F]', 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#C85A3F] font-bold shadow-xs', ['21:00', '22:00', '22:30', '23:15']); },
  renderBarberia(state, r) { return this.renderBlock(state, r, 'border-[#D97706]', 'text-[#B45309]', 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#B45309] font-bold shadow-xs', ['15:00', '16:30', '17:00', '18:30']); },
  renderDeportes(state, r) { return this.renderBlock(state, r, 'border-[#65A30D]', 'text-[#4D7C0F]', 'bg-[#84CC16]/20 border-2 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs', ['18:00', '19:30', '21:00', '22:30']); },
  renderSalud(state, r) { return this.renderBlock(state, r, 'border-[#0D9488]', 'text-[#0F766E]', 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#0F766E] font-bold shadow-xs', ['09:00', '11:30', '17:00', '18:30']); }
};