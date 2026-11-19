// Archivo: js/components/funnel_markup.js
/**
 * 🧙 Tucu Red Web V2 - Markup del Wizard Transaccional en 4 Pasos (SSOT v16.0)
 * Selector limpio de 15 localidades, 6 rubros, Nombre/Apellido separados y checkout $4.999 ARS.
 * Restricción estricta: < 200 líneas (< 180L).
 */

import { TUCUMAN_CITIES, EXPANDED_RUBROS, FUNNEL_LEVELS } from './funnel_data.js';
import { getCheckoutStepMarkup } from './funnel_checkout_markup.js';

export { TUCUMAN_CITIES, EXPANDED_RUBROS, FUNNEL_LEVELS };

export function getFunnelMarkup(draft = {}, selectedRubro = 'estetica', selectedLevel = 'l2', selectedSchedule = 'corrido', selectedCity = 'San Miguel de Tucumán') {
  return `
    <section id="funnel" class="py-20 lg:py-28 max-w-[1140px] mx-auto px-4 sm:px-8">
      <div class="bg-white rounded-[2.5rem] p-6 sm:p-12 lg:p-14 shadow-2xl border border-slate-200/80 relative overflow-hidden">

        <!-- Encabezado Transaccional con Barra de Progreso en 4 Pasos -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div class="max-w-2xl space-y-2">
            <span class="text-xs font-bold uppercase tracking-widest text-indigo-600 font-headline block">Alta Guiada y Personalizada</span>
            <h2 class="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">Activá tu sistema de reservas en 4 pasos</h2>
            <p class="text-slate-600 text-sm sm:text-base">Configurá los parámetros de tu local en menos de dos minutos.</p>
          </div>
          <div class="shrink-0 flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200/70">
            <div class="space-y-1">
              <span id="step-progress-label" class="text-xs font-extrabold font-mono text-indigo-600 uppercase tracking-wider block">Paso 1 de 4</span>
              <div class="w-32 sm:w-40 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div id="step-progress-bar" class="h-full bg-indigo-600 rounded-full transition-all duration-300 w-1/4"></div>
              </div>
            </div>
            <div class="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span id="step-badge-1" class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all">1</span>
              <span id="step-badge-2" class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all">2</span>
              <span id="step-badge-3" class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all">3</span>
              <span id="step-badge-4" class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all">4</span>
            </div>
          </div>
        </div>

        <form id="tucured-funnel-form" name="contacto-tucured" method="POST" data-netlify="true" class="space-y-8">
          <input type="hidden" name="form-name" value="contacto-tucured" />
          <input type="hidden" name="rubro" id="funnel-input-rubro" value="${selectedRubro}" />
          <input type="hidden" name="plan" id="funnel-input-level" value="${selectedLevel}" />
          <input type="hidden" name="horario" id="funnel-input-schedule" value="${selectedSchedule}" />
          <input type="hidden" name="ciudad" id="funnel-input-ciudad" value="${selectedCity}" />

          <!-- Paso 1: Identidad del Comercio -->
          <div id="funnel-step-1" class="space-y-6">
            <h3 class="font-headline font-bold text-xl text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600">storefront</span>
              <span>Paso 1: Identidad del Comercio</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" id="fn-nombre" name="nombre" value="${draft.nombre || ''}" required placeholder="Nombre de tu comercio (ej: Barbería Central)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
              <!-- Dropdown Limpio de 15 Localidades Canónicas de Tucumán -->
              <div class="relative">
                <select id="fn-city" class="tucu-clean-select w-full px-4 py-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-semibold text-slate-800 cursor-pointer appearance-none bg-none">
                  ${TUCUMAN_CITIES.map(c => `<option value="${c}" ${c === selectedCity ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
                <svg class="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 8l4 4 4-4" />
                </svg>
              </div>
            </div>

            <!-- Selector de 6 Rubros Canónicos -->
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 font-headline block">Elegí tu Rubro Comercial</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3" id="funnel-rubros-grid">
                ${EXPANDED_RUBROS.map(r => `
                  <button type="button" data-f-rubro="${r.id}" class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center ${selectedRubro === r.id ? 'funnel-option-active' : ''}">
                    <span class="material-symbols-outlined text-2xl text-indigo-600">${r.icon}</span>
                    <span class="text-xs font-bold text-slate-800 line-clamp-1">${r.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <p id="funnel-step1-error" class="hidden text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5" role="alert"></p>
            <div class="pt-2 flex justify-end">
              <button type="button" id="btn-goto-step-2" class="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-aura-cta font-headline font-bold text-sm flex items-center justify-center gap-2 cursor-pointer">
                <span>Siguiente: Horarios y Modalidad</span>
                <span class="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Paso 2: Horarios y Modalidad de Trabajo -->
          <div id="funnel-step-2" class="space-y-6 hidden">
            <h3 class="font-headline font-bold text-xl text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600">tune</span>
              <span>Paso 2: Horarios y Modalidad de Trabajo</span>
            </h3>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 font-headline block">¿Cómo atiende tu local?</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="funnel-schedule-grid">
                <button type="button" data-f-schedule="corrido" class="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left transition-all cursor-pointer flex items-center gap-3 ${selectedSchedule === 'corrido' ? 'funnel-option-active' : ''}">
                  <span class="material-symbols-outlined text-indigo-600">schedule</span>
                  <div><p class="font-bold text-sm text-slate-900">Horario corrido</p><p class="text-xs text-slate-500">Atención continua sin pausas intermedias</p></div>
                </button>
                <button type="button" data-f-schedule="cortado" class="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left transition-all cursor-pointer flex items-center gap-3 ${selectedSchedule === 'cortado' ? 'funnel-option-active' : ''}">
                  <span class="material-symbols-outlined text-amber-600">bedtime</span>
                  <div><p class="font-bold text-sm text-slate-900">Turno cortado (Corte de siesta)</p><p class="text-xs text-slate-500">Pausa habitual de siesta tucumana</p></div>
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 font-headline block">Elegí la modalidad según tu equipo</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="funnel-levels-grid">
                ${FUNNEL_LEVELS.map(l => `
                  <button type="button" data-f-level="${l.id}" class="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${selectedLevel === l.id ? 'funnel-option-active' : ''}">
                    <div class="flex items-center justify-between gap-2"><span class="font-headline font-bold text-sm text-slate-900">${l.title}</span><span class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold shrink-0">${l.badge}</span></div>
                    <p class="text-xs text-slate-500 leading-relaxed">${l.desc}</p>
                    <span class="text-[11px] font-bold text-emerald-700 font-mono pt-1">Mes Fundador $4.999 • Luego ${l.regularPrice}</span>
                  </button>
                `).join('')}
              </div>
            </div>
            <div class="pt-2 flex items-center justify-between gap-3">
              <button type="button" id="btn-back-to-1" class="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-base">arrow_back</span><span>Volver</span>
              </button>
              <button type="button" id="btn-goto-step-3" class="px-8 py-3.5 rounded-xl btn-aura-cta font-headline font-bold text-sm flex items-center gap-2 cursor-pointer">
                <span>Continuar a Datos de Contacto</span><span class="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Paso 3: Contacto y Material Digital -->
          <div id="funnel-step-3" class="space-y-6 hidden">
            <h3 class="font-headline font-bold text-xl text-slate-900 flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600">contact_phone</span>
              <span>Paso 3: Contacto y Material Digital</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" id="fn-first-name" name="nombre_titular" value="${draft.nombreTitular || ''}" required placeholder="Nombre" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
              <input type="text" id="fn-last-name" name="apellido_titular" value="${draft.apellidoTitular || ''}" required placeholder="Apellido" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="email" id="fn-email" name="email" value="${draft.email || ''}" required placeholder="Correo electrónico del local" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
              <div class="relative">
                <input type="tel" id="fn-phone" name="whatsapp" value="${draft.whatsapp || ''}" required placeholder="WhatsApp de contacto (ej: 381 555-4321)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
                <span id="phone-valid-hint" class="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono">AR +54 9</span>
              </div>
            </div>
            <label class="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center gap-3 cursor-pointer">
              <input type="checkbox" id="fn-material-pdf" name="material_pdf" ${draft.materialPdf !== false ? 'checked' : ''} class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              <span class="text-xs font-semibold text-indigo-900 leading-tight">Incluir PDF Imprimible de alta resolución con QR personalizado y logo de tu local para mostrador</span>
            </label>
            <p id="funnel-terms-notice" class="text-[11px] text-slate-500 text-center sm:text-left">Al continuar aceptás los <a href="/terminos.html" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-semibold">Términos y Condiciones</a> de Tucu Red.</p>
            <p id="funnel-step3-error" class="hidden text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5" role="alert"></p>
            <div class="pt-2 flex items-center justify-between gap-3">
              <button type="button" id="btn-back-to-2" class="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-base">arrow_back</span><span>Volver</span>
              </button>
              <button type="button" id="btn-goto-step-4" class="px-8 py-3.5 rounded-xl btn-aura-cta font-headline font-bold text-sm flex items-center gap-2 cursor-pointer">
                <span>Continuar a Activación y Pago ($4.999)</span><span class="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Paso 4: Checkout Real (Alias tucured + Mercado Pago) -->
          ${getCheckoutStepMarkup()}
        </form>

        <div id="funnel-success-card" class="hidden mt-4 p-8 rounded-3xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-500/30 text-emerald-950 text-center space-y-4"></div>
      </div>
    </section>
  `;
}
