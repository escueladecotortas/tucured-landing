// Archivo: js/components/funnel_checkout_markup.js
/**
 * Tucu Red Web V2 - Markup del Paso 4 y Tarjeta Final Limpia del Wizard
 * Alias responsive en móvil 375px, Mercado Pago oficial y flujo WhatsApp post-pago.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import { TUCURED_CHECKOUT_CONFIG } from './funnel_data.js';

export function getCheckoutStepMarkup() {
  const cfg = TUCURED_CHECKOUT_CONFIG;
  return `
    <div id="funnel-step-4" class="space-y-6 hidden">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-headline font-bold text-xl text-slate-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-600">payments</span>
          <span>Paso 4: Activación y Cierre Transaccional</span>
        </h3>
        <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold tabular-nums border border-emerald-200">
          MES FUNDADOR $4.999 ARS
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <!-- Columna 1: Resumen de Activación -->
        <div class="md:col-span-5 p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-indigo-900 uppercase font-headline">Resumen de Activación</span>
              <span id="checkout-summary-level" class="text-xs font-bold text-indigo-700 tabular-nums px-2 py-0.5 rounded-full bg-white border border-indigo-200">Gestión</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-indigo-200/60">
              <div><span class="text-slate-500 block text-[11px]">Comercio:</span><strong id="checkout-summary-name" class="text-slate-900 font-bold">Tu Comercio</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Localidad:</span><strong id="checkout-summary-city" class="text-slate-900 font-bold">San Miguel de Tucumán</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Rubro:</span><strong id="checkout-summary-rubro" class="text-slate-900 font-bold">Estética y Spa</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Total Mes Fundador:</span><strong class="text-emerald-700 font-black text-sm tabular-nums">${cfg.pricePromo}</strong></div>
            </div>
          </div>
          <p class="text-[11px] text-indigo-900/80 bg-white/80 rounded-xl p-3 border border-indigo-200/60 leading-relaxed">
            Abonás $4.999 el primer mes con soporte de puesta en marcha en el día y 0% comisiones por turno.
          </p>
        </div>

        <!-- Columna 2: 2 Vías Reales de Pago -->
        <div class="md:col-span-7 space-y-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-800">Opción 1: Transferencia directa al Alias (0% comisión)</span>
              <span class="text-[11px] text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                <span class="material-symbols-outlined text-xs">bolt</span> Inmediata
              </span>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <input type="text" id="checkout-alias-input" readonly value="${cfg.aliasCbu}" class="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm tabular-nums font-bold text-slate-800 outline-none" />
              <button type="button" id="btn-copy-alias" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0">
                <span class="material-symbols-outlined text-sm" id="copy-alias-icon">content_copy</span>
                <span id="copy-alias-text">Copiar Alias</span>
              </button>
            </div>
            <p class="text-[11px] text-slate-500">Titular: <strong class="text-slate-700 font-semibold">${cfg.titular}</strong></p>
          </div>

          <div class="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1">
              <p class="text-xs font-bold text-slate-900">Opción 2: Tarjeta o saldo en Mercado Pago</p>
              <p class="text-[11px] text-slate-600 leading-relaxed">Abre la app o web oficial de Mercado Pago para abonar al instante; al finalizar, volvé acá para confirmar tu alta.</p>
            </div>
            <a id="btn-mp-direct-pay" href="${cfg.mpPaymentUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-colors">
              <span class="material-symbols-outlined text-sm">open_in_new</span>
              <span>Pagar con Mercado Pago</span>
            </a>
          </div>
        </div>
      </div>

      <p id="funnel-step4-error" class="hidden text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5" role="alert"></p>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
        <button type="button" id="btn-back-to-3" class="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer">
          <span class="material-symbols-outlined text-base">arrow_back</span>
          <span>Volver a Contacto</span>
        </button>
        <button type="submit" id="funnel-submit-btn" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl btn-aura-cta font-headline font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg">
          <span>Ya transferí $4.999 • Activar mi local</span>
          <span class="material-symbols-outlined text-lg">check_circle</span>
        </button>
      </div>
    </div>
  `;
}

export function getSuccessCardMarkup(payload, waUrl, activarUrl = 'https://tucured.ar/activar.html') {
  const biz = payload?.nombre || 'tu comercio';
  return `<div class="space-y-5 max-w-lg mx-auto py-4">
    <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10"><span class="material-symbols-outlined text-4xl">check_circle</span></div>
    <h4 class="font-headline font-extrabold text-2xl text-emerald-950">¡Excelente! Tu solicitud para ${biz} quedó registrada.</h4>
    <p class="text-sm text-emerald-900 font-medium leading-relaxed">Verificaremos tu transferencia de $4.999 para habilitar el turnero oficial de ${biz} durante el día.</p>
    <div class="p-4 rounded-2xl bg-white border border-emerald-200/80 text-left flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
      <span class="material-symbols-outlined text-indigo-600 text-xl shrink-0 mt-0.5">mark_chat_unread</span>
      <p>También recibirás en tu WhatsApp el enlace a la <a id="success-activar-link" href="${activarUrl}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-bold">ficha rápida de configuración</a> (para cargar tus horarios exactos, servicios y logo) o podés completarla ahora mismo; luego te enviaremos los enlaces oficiales de tu Turnero y Panel de Control.</p>
    </div>
    <div class="pt-1 flex flex-col sm:flex-row items-center justify-center gap-3">
      <a id="success-wa-btn" href="${waUrl}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"><span class="material-symbols-outlined text-lg">chat</span><span>Enviar comprobante por WhatsApp</span></a>
      <a id="success-instagram-link" href="https://instagram.com/tucured.ar" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"><svg class="w-4 h-4 shrink-0 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg><span>@tucured.ar</span></a>
    </div>
  </div>`;
}
