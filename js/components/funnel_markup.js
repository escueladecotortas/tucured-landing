// Archivo: js/components/funnel_markup.js
/**
 * 🧙 Tucu Red Web V2 - Markup del Wizard Empático Kiro (3 Pasos)
 * Estructura visual de 3 pantallas, badges Kiro y tarjeta de éxito.
 * Restricción estricta: < 200 líneas.
 */

export const FUNNEL_RUBROS = [
  { id: 'barberia', label: 'Barbería', icon: 'content_cut' },
  { id: 'resto', label: 'Gastronomía', icon: 'restaurant' },
  { id: 'estetica', label: 'Estética & Spa', icon: 'spa' },
  { id: 'deportes', label: 'Deportes / Padel', icon: 'sports_tennis' },
  { id: 'salud', label: 'Salud / Médico', icon: 'medical_services' }
];

export const FUNNEL_LEVELS = [
  { id: 'l1', title: 'Turnero Autónomo Express', desc: 'Reserva web en 3 toques, comprobante digital y seña.', badge: 'Nivel 1' },
  { id: 'l2', title: 'Central Operativa & Agenda Pro', desc: 'CRM de clientes VIP, bloqueo manual y KPIs en vivo.', badge: 'Nivel 2' },
  { id: 'l3', title: 'Multi-Staff & Franquicias', desc: 'Agendas por staff independiente, recursos y comisiones.', badge: 'Nivel 3' }
];

export function getFunnelMarkup(draft = {}, selectedRubro = 'estetica', selectedLevel = 'l2', selectedSchedule = 'corrido') {
  return `
    <section id="funnel" class="py-20 lg:py-28 max-w-[1140px] mx-auto px-4 sm:px-8">
      <div class="bg-white rounded-[2.5rem] p-6 sm:p-12 lg:p-14 shadow-2xl border border-slate-200/80 relative overflow-hidden">
        
        <!-- Encabezado con Guía Kiro -->
        <div class="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div class="max-w-2xl space-y-2">
            <span class="text-xs font-bold uppercase tracking-widest text-indigo-600 font-headline block">Alta Guiada y Personalizada</span>
            <h2 class="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">Activá tu sistema de reservas en 3 pasos</h2>
            <p class="text-slate-600 text-sm sm:text-base">Kiro te acompaña a configurar tu local en menos de dos minutos.</p>
          </div>
          <div class="shrink-0 flex items-center gap-3">
            <img src="/assets/images/kiro/kiro_guia.webp" alt="Kiro Guía" class="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md rounded-2xl bg-indigo-50/70 p-1 border border-indigo-100" />
            <div class="flex sm:flex-col gap-2">
              <span id="step-badge-1" class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all">1</span>
              <span id="step-badge-2" class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all">2</span>
              <span id="step-badge-3" class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all">3</span>
            </div>
          </div>
        </div>

        <form id="tucured-funnel-form" name="contacto-tucured" method="POST" data-netlify="true" class="space-y-8">
          <input type="hidden" name="form-name" value="contacto-tucured" />
          <input type="hidden" name="rubro" id="funnel-input-rubro" value="${selectedRubro}" />
          <input type="hidden" name="plan" id="funnel-input-level" value="${selectedLevel}" />
          <input type="hidden" name="horario" id="funnel-input-schedule" value="${selectedSchedule}" />

          <!-- Paso 1: Identidad de tu Local -->
          <div id="funnel-step-1" class="space-y-6">
            <h3 class="font-headline font-bold text-xl text-slate-900 flex items-center gap-2"><span class="material-symbols-outlined text-indigo-600">storefront</span><span>Paso 1: Identidad de tu Local</span></h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" id="fn-nombre" name="nombre" value="${draft.nombre || ''}" required placeholder="Nombre de tu comercio (ej: Barbería Central)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
              <input type="text" id="fn-ciudad" name="ciudad" value="${draft.ciudad || ''}" required placeholder="Localidad o Barrio (ej: Yerba Buena)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 font-headline block">Elegí tu Rubro Comercial</label>
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-3" id="funnel-rubros-grid">
                ${FUNNEL_RUBROS.map(r => `<button type="button" data-f-rubro="${r.id}" class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex flex-col items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-2xl text-indigo-600">${r.icon}</span><span class="text-xs font-bold text-slate-800">${r.label}</span></button>`).join('')}
              </div>
            </div>
            <div class="pt-2 flex justify-end">
              <button type="button" id="btn-goto-step-2" class="w-full sm:w-auto px-8 py-3.5 rounded-xl btn-aura-cta font-headline font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"><span>Continuar a Ritmo y Nivel</span><span class="material-symbols-outlined text-lg">arrow_forward</span></button>
            </div>
          </div>

          <!-- Paso 2: Ritmo de Atención y Potencia -->
          <div id="funnel-step-2" class="space-y-6 hidden">
            <h3 class="font-headline font-bold text-xl text-slate-900 flex items-center gap-2"><span class="material-symbols-outlined text-indigo-600">tune</span><span>Paso 2: Ritmo de Atención y Potencia</span></h3>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 font-headline block">Ritmo de tu local</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="funnel-schedule-grid">
                <button type="button" data-f-schedule="corrido" class="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left transition-all cursor-pointer flex items-center gap-3"><span class="material-symbols-outlined text-indigo-600">schedule</span><div><p class="font-bold text-sm text-slate-900">Horario corrido</p><p class="text-xs text-slate-500">Atención continua sin pausas intermedias</p></div></button>
                <button type="button" data-f-schedule="cortado" class="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-left transition-all cursor-pointer flex items-center gap-3"><span class="material-symbols-outlined text-amber-600">bedtime</span><div><p class="font-bold text-sm text-slate-900">Turno cortado (Corte de siesta)</p><p class="text-xs text-slate-500">Pausa habitual de siesta tucumana</p></div></button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500 font-headline block">Nivel de Potencia del Sistema</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="funnel-levels-grid">
                ${FUNNEL_LEVELS.map(l => `<button type="button" data-f-level="${l.id}" class="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer"><div class="flex items-center justify-between"><span class="font-headline font-bold text-sm text-slate-900">${l.title}</span><span class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">${l.badge}</span></div><p class="text-xs text-slate-500">${l.desc}</p></button>`).join('')}
              </div>
            </div>
            <div class="pt-2 flex items-center justify-between gap-3">
              <button type="button" id="btn-back-to-1" class="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"><span class="material-symbols-outlined text-base">arrow_back</span><span>Volver</span></button>
              <button type="button" id="btn-goto-step-3" class="px-8 py-3.5 rounded-xl btn-aura-cta font-headline font-bold text-sm flex items-center gap-2 cursor-pointer"><span>Continuar a Datos de Entrega</span><span class="material-symbols-outlined text-lg">arrow_forward</span></button>
            </div>
          </div>

          <!-- Paso 3: Contacto y Activación del Kit -->
          <div id="funnel-step-3" class="space-y-6 hidden">
            <h3 class="font-headline font-bold text-xl text-slate-900 flex items-center gap-2"><span class="material-symbols-outlined text-indigo-600">verified</span><span>Paso 3: Contacto y Activación del Kit</span></h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="relative">
                <input type="tel" id="fn-phone" name="whatsapp" value="${draft.whatsapp || ''}" required placeholder="WhatsApp de contacto (ej: 381 555-4321)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
                <span id="phone-valid-hint" class="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono">AR +54 9</span>
              </div>
              <label class="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="kit_entrega" checked class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <span class="text-xs font-semibold text-emerald-900 leading-tight">Incluir Cartel QR de mostrador y bienvenida</span>
              </label>
            </div>
            <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button type="button" id="btn-back-to-2" class="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"><span class="material-symbols-outlined text-base">arrow_back</span><span>Volver</span></button>
              <div class="text-right">
                <p class="text-xs text-slate-500 mb-2">Sin contratos forzados • 0% comisiones • Soporte directo en Tucumán</p>
                <button type="submit" id="funnel-submit-btn" class="w-full sm:w-auto px-9 py-4 rounded-2xl btn-aura-cta font-headline font-extrabold text-base flex items-center justify-center gap-2.5 cursor-pointer"><span>Confirmar Activación de mi Negocio</span><span class="material-symbols-outlined text-xl">rocket_launch</span></button>
              </div>
            </div>
          </div>
        </form>

        <div id="funnel-success-card" class="hidden mt-4 p-8 rounded-3xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-500/30 text-emerald-950 text-center space-y-4"></div>
      </div>
    </section>
  `;
}

