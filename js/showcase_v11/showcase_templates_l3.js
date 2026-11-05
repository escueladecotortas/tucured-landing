// Archivo: js/showcase_v11/showcase_templates_l3.js
/**
 * ⚡ TucuRed Showcase v11.1 - Pieles Temáticas Stitch L3 (Aura Light)
 * Avatares y recursos en piel clara con catálogo dinámico y fechas reales del sistema.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import { getSystemCalendar } from './showcase_state.js';

export const ShowcaseTemplatesL3 = {
  render(rubroId, state, rubro) {
    if (rubroId === 'salud') return this.renderSalud(state, rubro);
    if (rubroId === 'resto') return this.renderResto(state, rubro);
    if (rubroId === 'barberia') return this.renderBarberia(state, rubro);
    if (rubroId === 'deportes') return this.renderDeportes(state, rubro);
    return this.renderEstetica(state, rubro);
  },

  renderDateHeader(title, colorClass, state) {
    const mes = (state && state.systemCalendar) ? state.systemCalendar.mesActual : getSystemCalendar().mesActual;
    return `<div class="flex items-center justify-between mb-1"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">${title}</h4><span class="${colorClass} text-[11px] font-semibold">${mes}</span></div>`;
  },

  renderDates(state, activeClass) {
    const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
    return cal.diasReales.map((d, i) => `
      <button type="button" onclick="window.ShowcaseCore.selectDay(${i})" class="shrink-0 min-w-[58px] min-h-[64px] rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${state.selectedDay === i ? activeClass : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs'}">
        <span class="text-[12px] opacity-70">${d.diaNombre}</span><span class="text-[16px] font-bold text-slate-900">${d.diaNumero}</span>
      </button>
    `).join('');
  },

  renderSubmitBtn(r) {
    return `<button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 ${r.btnClass} font-bold text-xs py-2.5 rounded-xl shadow-md flex justify-center items-center gap-1.5 cursor-pointer"><span>Continuar con mis Datos</span><span class="material-symbols-outlined text-sm">arrow_forward</span></button>`;
  },

  renderCatalog(state, r, activeClass, textClass) {
    return `
      <div>
        <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Catálogo de Servicios</h4>
        <div class="flex flex-col gap-1.5">
          ${r.catalogL3.map((cat, idx) => `
            <div onclick="window.ShowcaseCore.selectOption(${idx})" class="rounded-xl p-2.5 flex items-center justify-between border cursor-pointer transition-all ${state.selectedOption === idx ? activeClass : 'border-slate-200 bg-white shadow-2xs hover:bg-slate-50'}">
              <div><p class="text-xs font-bold text-slate-900">${cat.name}</p><p class="text-[10px] ${textClass} font-semibold flex items-center gap-1 mt-0.5"><span class="material-symbols-outlined text-xs">schedule</span><span>${cat.dur}</span></p></div>
              <span class="material-symbols-outlined text-sm ${state.selectedOption === idx ? textClass : 'text-slate-400'}">${state.selectedOption === idx ? 'check_circle' : 'add_circle'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderSalud(state, r) {
    const medicos = [{ name: 'Dra. Mendoza', role: 'Clínica' }, { name: 'Dr. Ruiz', role: 'Diagnóstico' }];
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Especialista Médico</h4>
          <div class="flex gap-2 pb-1">${medicos.map((m, idx) => `<div onclick="window.ShowcaseCore.selectStaff(${idx})" class="flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${state.selectedStaff === idx ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#0F766E] shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs font-bold block text-slate-900">${m.name}</span><span class="text-[10px] text-[#0D9488] font-bold">${m.role}</span></div>`).join('')}</div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#0D9488] bg-[#0D9488]/15 shadow-xs', 'text-[#0F766E]')}
        ${this.renderDateHeader('Fecha', 'text-[#0D9488]', state)}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#0F766E] font-bold shadow-xs')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('09:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '09:00' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#0F766E] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">09:00 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('11:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '11:30' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#0F766E] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">11:30 hs</button>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderEstetica(state, r) {
    const staff = [{ name: 'Micaela', role: 'Master Lash' }, { name: 'Valentina', role: 'Cosmiatra' }];
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Especialista</h4>
          <div class="flex gap-2 pb-1">${staff.map((st, idx) => `<div onclick="window.ShowcaseCore.selectStaff(${idx})" class="flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${state.selectedStaff === idx ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#9A7D0A] shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs font-bold block text-slate-900">${st.name}</span><span class="text-[10px] text-[#B18D28] font-bold">${st.role}</span></div>`).join('')}</div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-xs', 'text-[#9A7D0A]')}
        ${this.renderDateHeader('Fecha', 'text-[#D4AF37]', state)}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#9A7D0A] font-bold shadow-xs')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('10:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '10:30' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#9A7D0A] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">10:30 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('16:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '16:30' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#9A7D0A] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">16:30 hs</button>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderResto(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Anfitrión / Sommelier</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectStaff(0)" class="p-2 rounded-xl border text-center cursor-pointer transition-all ${state.selectedStaff === 0 ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#C85A3F] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs">Julián (Sommelier)</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectStaff(1)" class="p-2 rounded-xl border text-center cursor-pointer transition-all ${state.selectedStaff === 1 ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#C85A3F] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs">Automática</span></button>
          </div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#E07A5F] bg-[#E07A5F]/15 shadow-xs', 'text-[#C85A3F]')}
        ${this.renderDateHeader('Fecha', 'text-[#E07A5F]', state)}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#C85A3F] font-bold shadow-xs')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('21:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '21:00' ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#C85A3F] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">21:00 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('22:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '22:30' ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#C85A3F] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">22:30 hs</button>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderBarberia(state, r) {
    const barbers = [{ name: 'Franco', role: 'Fade Master' }, { name: 'Lucas', role: 'Barba & Afeitado' }];
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Selecciona Barbero</h4>
          <div class="flex gap-2 pb-1">${barbers.map((b, idx) => `<div onclick="window.ShowcaseCore.selectStaff(${idx})" class="flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${state.selectedStaff === idx ? 'border-[#D97706] bg-[#D97706]/15 text-[#B45309] shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs font-bold block text-slate-900">${b.name}</span><span class="text-[10px] text-[#B45309] font-bold">${b.role}</span></div>`).join('')}</div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#D97706] bg-[#D97706]/15 shadow-xs', 'text-[#B45309]')}
        ${this.renderDateHeader('Fecha', 'text-[#D97706]', state)}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#B45309] font-bold shadow-xs')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('15:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '15:00' ? 'border-[#D97706] bg-[#D97706]/15 text-[#B45309] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">15:00 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('16:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '16:30' ? 'border-[#D97706] bg-[#D97706]/15 text-[#B45309] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">16:30 hs</button>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderDeportes(state, r) {
    const courts = [{ name: 'Cancha 1', role: 'Panorámica' }, { name: 'Cancha 2', role: 'Techada Pro' }];
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Seleccionar Cancha</h4>
          <div class="flex gap-2 pb-1">${courts.map((c, idx) => `<div onclick="window.ShowcaseCore.selectStaff(${idx})" class="flex-1 p-2 rounded-xl border text-center cursor-pointer transition-all ${state.selectedStaff === idx ? 'border-[#65A30D] bg-[#84CC16]/20 text-[#4D7C0F] shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs font-bold block text-slate-900">${c.name}</span><span class="text-[10px] text-[#4D7C0F] font-bold">${c.role}</span></div>`).join('')}</div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#65A30D] bg-[#84CC16]/20 shadow-xs', 'text-[#4D7C0F]')}
        ${this.renderDateHeader('Fecha', 'text-[#4D7C0F]', state)}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#84CC16]/20 border-2 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('18:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '18:00' ? 'border-[#65A30D] bg-[#84CC16]/20 text-[#4D7C0F] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">18:00 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('21:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '21:00' ? 'border-[#65A30D] bg-[#84CC16]/20 text-[#4D7C0F] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">21:00 hs</button>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  }
};
