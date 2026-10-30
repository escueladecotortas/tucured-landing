// Archivo: js/showcase_v11/showcase_templates_l3.js
/**
 * ⚡ TucuRed Showcase v11.1 - Pieles Temáticas Stitch L3 (Aura Design System)
 * Avatares de staff HD, catálogo dinámico y soporte para Salud / Consultorios.
 */

export const ShowcaseTemplatesL3 = {
  render(rubroId, state, rubro) {
    if (rubroId === 'salud') return this.renderSalud(state, rubro);
    if (rubroId === 'resto') return this.renderResto(state, rubro);
    if (rubroId === 'barberia') return this.renderBarberia(state, rubro);
    if (rubroId === 'deportes') return this.renderDeportes(state, rubro);
    return this.renderEstetica(state, rubro);
  },

  renderDates(state, activeClass, days) {
    return (days || ['Jue 19', 'Vie 20', 'Sáb 21', 'Dom 22']).map((d, i) => `
      <button type="button" onclick="window.ShowcaseCore.selectDay(${i})" class="shrink-0 min-w-[58px] min-h-[64px] rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${state.selectedDay === i ? activeClass : 'bg-white/[0.04] text-white/70 border border-white/[0.08]'}">
        <span class="text-[12px] opacity-70">${d.split(' ')[0]}</span><span class="text-[16px] font-bold">${d.split(' ')[1]}</span>
      </button>
    `).join('');
  },

  renderSubmitBtn(r) {
    return `<button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 ${r.btnClass} font-bold text-xs py-2.5 rounded-xl shadow-lg flex justify-center items-center gap-1.5 cursor-pointer"><span>Continuar con mis Datos</span><span class="material-symbols-outlined text-sm">arrow_forward</span></button>`;
  },

  renderCatalog(state, r, activeClass, textClass) {
    return `
      <div>
        <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Catálogo de Servicios</h4>
        <div class="flex flex-col gap-1.5">
          ${r.catalogL3.map((cat, idx) => `
            <div onclick="window.ShowcaseCore.selectOption(${idx})" class="rounded-xl p-2.5 flex items-center justify-between border cursor-pointer transition-all ${state.selectedOption === idx ? activeClass : 'border-white/[0.08] bg-white/[0.04]'}">
              <div><p class="text-xs font-semibold text-white">${cat.name}</p><p class="text-[10px] ${textClass} flex items-center gap-1 mt-0.5"><span class="material-symbols-outlined text-xs">schedule</span><span>${cat.dur}</span></p></div>
              <span class="material-symbols-outlined text-sm ${state.selectedOption === idx ? textClass : 'text-on-surface-variant'}">${state.selectedOption === idx ? 'check_circle' : 'add_circle'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderSalud(state, r) {
    const medicos = [{ name: 'Dra. Mendoza', role: 'Clínica', icon: 'stethoscope' }, { name: 'Dr. Ruiz', role: 'Diagnóstico', icon: 'medical_services' }];
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Especialista Médico</h4>
          <div class="flex gap-2 pb-1">${medicos.map((m, idx) => `<div onclick="window.ShowcaseCore.selectStaff(${idx})" class="flex-1 p-2 rounded-xl border text-center cursor-pointer ${state.selectedStaff === idx ? 'border-[#0D9488] bg-[#0D9488]/20 text-[#2dd4bf]' : 'border-white/10 bg-white/[0.04] text-white/70'}"><span class="text-xs font-bold block">${m.name}</span><span class="text-[9px] text-[#2dd4bf]">${m.role}</span></div>`).join('')}</div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#0D9488] bg-[#0D9488]/15', 'text-[#2dd4bf]')}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#2dd4bf] font-bold', ['Lun 20', 'Mar 21', 'Mié 22', 'Jue 23'])}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('09:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '09:00' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">09:00 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('11:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '11:30' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">11:30 hs</button>
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
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Especialista</h4>
          <div class="flex gap-2 pb-1">${staff.map((st, idx) => `<div onclick="window.ShowcaseCore.selectStaff(${idx})" class="flex-1 p-2 rounded-xl border text-center cursor-pointer ${state.selectedStaff === idx ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]' : 'border-white/10 bg-white/[0.04] text-white/70'}"><span class="text-xs font-bold block">${st.name}</span><span class="text-[9px] text-[#D4AF37]">${st.role}</span></div>`).join('')}</div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#D4AF37] bg-[#D4AF37]/15', 'text-[#D4AF37]')}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#D4AF37] font-bold')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('10:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '10:30' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">10:30 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('16:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '16:30' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">16:30 hs</button>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderResto(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Anfitrión</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectStaff(0)" class="p-2 rounded-xl border text-center cursor-pointer ${state.selectedStaff === 0 ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}"><span class="text-xs">Julián (Sommelier)</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectStaff(1)" class="p-2 rounded-xl border text-center cursor-pointer ${state.selectedStaff === 1 ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}"><span class="text-xs">Automática</span></button>
          </div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#E07A5F] bg-[#E07A5F]/15', 'text-[#E07A5F]')}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#E07A5F] font-bold')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('21:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '21:00' ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">21:00 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('22:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '22:30' ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">22:30 hs</button>
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
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Selecciona Barbero</h4>
          <div class="flex gap-2 pb-1">${barbers.map((b, idx) => `<div onclick="window.ShowcaseCore.selectStaff(${idx})" class="flex-1 p-2 rounded-xl border text-center cursor-pointer ${state.selectedStaff === idx ? 'border-[#D97706] bg-[#D97706]/20 text-[#D97706]' : 'border-white/10 bg-white/[0.04] text-white/70'}"><span class="text-xs font-bold block">${b.name}</span><span class="text-[9px] text-[#D97706]">${b.role}</span></div>`).join('')}</div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#D97706] bg-[#D97706]/15', 'text-[#D97706]')}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#D97706] font-bold')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('15:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '15:00' ? 'border-[#D97706] bg-[#D97706]/15 text-[#D97706] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">15:00 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('16:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '16:30' ? 'border-[#D97706] bg-[#D97706]/15 text-[#D97706] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">16:30 hs</button>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderDeportes(state, r) {
    const coaches = [{ name: 'Gastón', role: 'Avanzado' }, { name: 'Martín', role: 'Iniciación' }];
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Modalidad / Profesor</h4>
          <div class="flex gap-2 pb-1">${coaches.map((c, idx) => `<div onclick="window.ShowcaseCore.selectStaff(${idx})" class="flex-1 p-2 rounded-xl border text-center cursor-pointer ${state.selectedStaff === idx ? 'border-[#84CC16] bg-[#84CC16]/20 text-[#84CC16]' : 'border-white/10 bg-white/[0.04] text-white/70'}"><span class="text-xs font-bold block">${c.name}</span><span class="text-[9px] text-[#84CC16]">${c.role}</span></div>`).join('')}</div>
        </div>
        ${this.renderCatalog(state, r, 'border-[#84CC16] bg-[#84CC16]/15', 'text-[#84CC16]')}
        <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#84CC16]/15 border-2 border-[#84CC16] text-[#84CC16] font-bold')}</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button type="button" onclick="window.ShowcaseCore.selectTime('18:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '18:00' ? 'border-[#84CC16] bg-[#84CC16]/15 text-[#84CC16] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">18:00 hs</button>
          <button type="button" onclick="window.ShowcaseCore.selectTime('21:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '21:00' ? 'border-[#84CC16] bg-[#84CC16]/15 text-[#84CC16] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">21:00 hs</button>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  }
};
