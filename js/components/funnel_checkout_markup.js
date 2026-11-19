// Archivo: js/components/funnel_checkout_markup.js
/**
 * 💳 Tucu Red Web V2 - Markup del Paso 4 y Tarjeta de Éxito (Alias tucured + Mercado Pago + @tucured.ar)
 * Vías reales de pago sin QR decorativo, resumen de alta y activación $4.999 (Mes Fundador).
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
        <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold font-mono border border-emerald-200">
          MES FUNDADOR $4.999 ARS
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <!-- Columna 1: Resumen de Activación -->
        <div class="md:col-span-5 p-5 rounded-3xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-indigo-900 uppercase font-headline">Resumen de Activación</span>
              <span id="checkout-summary-level" class="text-xs font-bold text-indigo-700 font-mono px-2 py-0.5 rounded-full bg-white border border-indigo-200">Nivel 2</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-indigo-200/60">
              <div><span class="text-slate-500 block text-[11px]">Comercio:</span><strong id="checkout-summary-name" class="text-slate-900 font-bold">Tu Comercio</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Localidad:</span><strong id="checkout-summary-city" class="text-slate-900 font-bold">San Miguel de Tucumán</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Rubro:</span><strong id="checkout-summary-rubro" class="text-slate-900 font-bold">Estética y Spa</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Total Mes Fundador:</span><strong class="text-emerald-700 font-black text-sm font-mono">${cfg.pricePromo}</strong></div>
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
            <div class="flex items-center gap-2">
              <input type="text" id="checkout-alias-input" readonly value="${cfg.aliasCbu}" class="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono font-bold text-slate-800 outline-none" />
              <button type="button" id="btn-copy-alias" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0">
                <span class="material-symbols-outlined text-sm" id="copy-alias-icon">content_copy</span>
                <span id="copy-alias-text">Copiar Alias</span>
              </button>
            </div>
            <p class="text-[11px] text-slate-500">Titular: <strong class="text-slate-700 font-semibold">${cfg.titular}</strong></p>
          </div>

          <div class="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1">
              <p class="text-xs font-bold text-slate-900">Opción 2: Tarjeta o saldo en Mercado Pago</p>
              <p class="text-[11px] text-slate-600 leading-relaxed">Se abre la pasarela oficial segura de Mercado Pago en una pestaña nueva; al finalizar, volvé acá para confirmar tu alta.</p>
            </div>
            <a id="btn-mp-direct-pay" href="${cfg.mpPaymentUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-colors">
              <span class="material-symbols-outlined text-sm">open_in_new</span>
              <span>Pagar con Mercado Pago</span>
            </a>
          </div>
        </div>
      </div>

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

export function getSuccessCardMarkup(payload, waUrl, host) {
  const turneroLink = `${host}/turnero.html?level=${payload.level}&rubro=${payload.rubro}&slug=${payload.slug}`;
  const adminLink = `${host}/admin_${payload.level}.html?rubro=${payload.rubro}&slug=${payload.slug}`;
  return `<div class="space-y-5 max-w-lg mx-auto py-4">
    <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10"><span class="material-symbols-outlined text-4xl">check_circle</span></div>
    <h4 class="font-headline font-extrabold text-2xl text-emerald-950">¡Excelente! El sistema para ${payload.nombre} está registrado.</h4>
    <p class="text-sm text-emerald-800 leading-relaxed">Verificamos tu transferencia de $4.999 para habilitar tu dominio y turnero oficial en el día.</p>
    <div class="p-3.5 rounded-2xl bg-white border border-emerald-200 text-left space-y-2 text-xs">
      <div class="flex justify-between gap-2"><span class="text-slate-500 shrink-0">Turnero Público:</span><a id="success-turnero-link" href="${turneroLink}" target="_blank" class="font-mono text-indigo-600 font-bold underline truncate max-w-[260px]">${turneroLink}</a></div>
      <div class="flex justify-between gap-2"><span class="text-slate-500 shrink-0">Panel de Control:</span><a id="success-admin-link" href="${adminLink}" target="_blank" class="font-mono text-indigo-600 font-bold underline truncate max-w-[260px]">${adminLink}</a></div>
    </div>
    <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"><span class="material-symbols-outlined text-lg">chat</span><span>Avisar por WhatsApp</span></a>
      <a id="success-instagram-link" href="https://instagram.com/tucured.ar" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-headline font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"><svg class="w-4 h-4 shrink-0 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg><span>@tucured.ar</span></a>
    </div>
    <div class="pt-1"><span class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">✓ Aprovisionado en base local (Local-First)</span></div>
  </div>`;
}
