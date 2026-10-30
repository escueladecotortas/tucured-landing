// Archivo: js/showcase_v11/showcase_templates_l2.js
/**
 * ⚡ TucuRed Showcase v11.1 - Pieles Temáticas Stitch L2 (Aura Design System)
 * Soporta Estética, Gastro, Barbería, Deportes y Salud & Consultorios.
 */

export const ShowcaseTemplatesL2 = {
  render(rubroId, state, rubro) {
    if (rubroId === 'salud') return this.renderSalud(state, rubro);
    if (rubroId === 'resto') return this.renderResto(state, rubro);
    if (rubroId === 'barberia') return this.renderBarberia(state, rubro);
    if (rubroId === 'deportes') return this.renderDeportes(state, rubro);
    return this.renderEstetica(state, rubro);
  },

  renderDates(state, activeClass, days) {
    return (days || ['Jue 19', 'Vie 20', 'Sáb 21', 'Dom 22']).map((d, i) => `
      <button type="button" onclick="window.ShowcaseCore.selectDay(${i})" class="shrink-0 min-w-[58px] min-h-[64px] rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${state.selectedDay === i ? activeClass : 'bg-white/[0.04] text-white/70 border border-white/[0.08] hover:bg-white/[0.08]'}">
        <span class="text-[12px] opacity-70">${d.split(' ')[0]}</span><span class="text-[16px] font-bold">${d.split(' ')[1]}</span>
      </button>
    `).join('');
  },

  renderSubmitBtn(r) {
    return `
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 ${r.btnClass} font-bold text-xs py-2.5 rounded-xl shadow-lg flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con mis Datos</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderEstetica(state, r) {
    return `
      <div class="space-y-3">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">1. Seleccionar Servicio</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            ${['Lifting de Pestañas', 'Esmaltado Semipermanente', 'Limpieza Facial'].map((s, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="px-2.5 py-1.5 rounded-xl text-[11px] font-medium border cursor-pointer transition-all ${state.selectedOption === idx ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">${s}</button>
            `).join('')}
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">2. Elegir Fecha</h4><span class="text-[#D4AF37] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#D4AF37] font-bold')}</div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">3. Elegir Horario</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectTime('09:30')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer ${state.selectedTime === '09:30' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}"><span class="material-symbols-outlined text-xs">schedule</span><span>09:30 hs</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('16:30')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer ${state.selectedTime === '16:30' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}"><span class="material-symbols-outlined text-xs">schedule</span><span>16:30 hs</span></button>
          </div>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderSalud(state, r) {
    return `
      <div class="space-y-3">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">1. Tipo de Consulta Médica</h4>
          <div class="flex flex-col gap-1.5">
            ${r.options.map((s, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="p-2 text-left rounded-xl text-xs border cursor-pointer transition-all ${state.selectedOption === idx ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold shadow-[0_0_12px_rgba(13,148,136,0.25)]' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">${s}</button>
            `).join('')}
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">2. Fecha</h4><span class="text-[#2dd4bf] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#2dd4bf] font-bold', ['Lun 20', 'Mar 21', 'Mié 22', 'Jue 23'])}</div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">3. Horario Disponible</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectTime('09:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '09:00' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">09:00 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('11:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '11:30' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">11:30 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('17:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '17:00' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">17:00 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('18:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '18:30' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">18:30 hs</button>
          </div>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderResto(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Tipo de Experiencia</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            ${['Cena Gourmet', 'Degustación', 'Menú Ejecutivo'].map((exp, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="px-2.5 py-1.5 rounded-full text-[11px] font-medium border cursor-pointer ${state.selectedOption === idx ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold' : 'bg-white/[0.04] text-white/70 border-white/[0.08]'}">${exp}</button>
            `).join('')}
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">Fecha</h4><span class="text-[#E07A5F] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#E07A5F] font-bold')}</div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Horario</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectTime('21:00')" class="py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${state.selectedTime === '21:00' ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold' : 'bg-white/[0.04] text-white/70 border-white/[0.08]'}">21:00 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('23:15')" class="py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${state.selectedTime === '23:15' ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold' : 'bg-white/[0.04] text-white/70 border-white/[0.08]'}">23:15 hs</button>
          </div>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderBarberia(state, r) {
    const services = [
      { name: 'Corte Tradicional', dur: '45 min • $15', icon: 'content_cut' },
      { name: 'Corte + Barba', dur: '60 min • $22', icon: 'face' },
      { name: 'Servicio VIP Premium', dur: '90 min • $35', icon: 'workspace_premium' }
    ];
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Servicio</h4>
          <div class="flex flex-col gap-1.5">
            ${services.map((s, idx) => `
              <div onclick="window.ShowcaseCore.selectOption(${idx})" class="rounded-xl p-2 flex items-center justify-between border cursor-pointer ${state.selectedOption === idx ? 'border-[#D97706] bg-[#D97706]/15 shadow-[0_0_15px_rgba(217,119,6,0.15)]' : 'border-white/[0.08] bg-white/[0.04]'}">
                <div class="flex items-center gap-2"><span class="text-xs text-white">${s.name}</span><span class="text-[10px] text-[#D97706]">${s.dur}</span></div>
                <div class="w-4 h-4 rounded-full border border-[#D97706] flex items-center justify-center ${state.selectedOption === idx ? 'bg-[#D97706]' : ''}"></div>
              </div>
            `).join('')}
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">Fecha</h4><span class="text-[#D97706] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#D97706] font-bold')}</div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Hora</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectTime('15:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '15:00' ? 'border-[#D97706] bg-[#D97706]/15 text-[#D97706] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">15:00 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('16:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '16:30' ? 'border-[#D97706] bg-[#D97706]/15 text-[#D97706] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">16:30 hs</button>
          </div>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderDeportes(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Tipo de Turno</h4>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" onclick="window.ShowcaseCore.selectOption(0)" class="rounded-xl p-2 border flex flex-col items-start cursor-pointer ${state.selectedOption === 0 ? 'bg-[#84CC16]/15 border-[#84CC16] text-[#84CC16] font-bold' : 'bg-white/[0.04] text-white/70 border-white/[0.08]'}"><span class="text-xs font-medium text-white">60 MIN</span><span class="text-[9px] text-white/50">Estándar</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectOption(1)" class="rounded-xl p-2 border flex flex-col items-start cursor-pointer ${state.selectedOption === 1 ? 'bg-[#84CC16]/15 border-[#84CC16] text-[#84CC16] font-bold' : 'bg-white/[0.04] text-white/70 border-white/[0.08]'}"><span class="text-xs font-bold text-white">90 MIN</span><span class="text-[9px] text-[#84CC16]">Recomendado</span></button>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">Fecha</h4><span class="text-[#84CC16] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#84CC16]/15 border-2 border-[#84CC16] text-[#84CC16] font-bold')}</div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Horarios</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectTime('18:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '18:00' ? 'border-[#84CC16] bg-[#84CC16]/15 text-[#84CC16] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">18:00 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('19:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '19:30' ? 'border-[#84CC16] bg-[#84CC16]/15 text-[#84CC16] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">19:30 hs</button>
          </div>
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  }
};
