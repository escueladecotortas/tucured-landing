// Archivo: js/components/faq_accordion.js
/**
 * ❓ Tucu Red Web V2 - Acordeón Minimalista de Preguntas Frecuentes
 * Desacoplado del showroom y reubicado previo al Wizard para derribar objeciones.
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

const FAQS_DATA = [
  {
    q: '¿Cómo funciona la promoción de $1.000 del primer mes?',
    a: 'Abonás $1.000 ARS por transferencia (Alias oficial tucured.mp o QR interoperable). Durante 30 días probás el software completo en tu local. A partir del segundo mes, abonás la tarifa regular del nivel que elijas, sin contratos de permanencia ni penalizaciones.'
  },
  {
    q: '¿Mis clientes tienen que descargar alguna app o crearse una cuenta?',
    a: 'No. Tus clientes acceden desde cualquier navegador web (Chrome, Safari, etc.) sin instalar nada ni recordar contraseñas. Reservan en 3 toques y el comprobante con link de autogestión les llega directo a su WhatsApp.'
  },
  {
    q: '¿El sistema respeta el corte de siesta y los feriados argentinos?',
    a: 'Totalmente. Podés configurar horarios continuos o turnos partidos (mañana y tarde con corte de siesta). Además, sincroniza automáticamente el calendario nacional de feriados para saltear días no laborables sin intervención manual.'
  },
  {
    q: '¿Cómo cobro las señas de las reservas?',
    a: 'El software te permite solicitar seña opcional con tu propio Alias CBU/CVU o link de Mercado Pago en la pantalla final y en el mensaje de confirmación. Tus clientes te pagan directo a tu cuenta bancaria; Tucu Red no retiene dinero ni cobra comisiones.'
  },
  {
    q: '¿Puedo cambiar de nivel (L1, L2 o L3) más adelante?',
    a: 'Sí, la migración es inmediata. Podés empezar con Nivel 1 o Nivel 2 y escalar a Nivel 3 Multi-Staff en cualquier momento sin perder historiales de turnos, listas de clientes ni configuraciones previas.'
  },
  {
    q: '¿Cuánto demoran en entregarme el turnero configurado?',
    a: 'Completás el formulario de alta en menos de dos minutos, confirmás por WhatsApp y nuestro equipo técnico te entrega tu turnero 100% configurado y personalizado con tu marca en menos de 24 horas hábiles.'
  }
];

export function renderFaqAccordion(containerId = 'app-faq') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section id="faq" class="py-16 lg:py-24 max-w-[960px] mx-auto px-4 sm:px-8 component-enter">
      <!-- Encabezado de Preguntas Frecuentes -->
      <div class="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-widest font-headline">
          <span class="material-symbols-outlined text-sm">help</span>
          <span>Respuestas Claras & Cero Fricción</span>
        </div>
        <h2 class="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
          Preguntas Frecuentes
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Todo lo que necesitás saber antes de activar tu software. Cero letras chicas.
        </p>
      </div>

      <!-- Acordeón Minimalista con Details Semánticos -->
      <div class="space-y-3.5">
        ${FAQS_DATA.map((item, idx) => `
          <details class="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all p-5 open:shadow-md open:border-indigo-500/40">
            <summary class="flex items-center justify-between gap-4 font-headline font-bold text-base sm:text-lg text-slate-900 cursor-pointer list-none select-none">
              <span class="flex items-center gap-3">
                <span class="text-xs font-mono font-bold text-indigo-600 w-5">0${idx + 1}</span>
                <span>${item.q}</span>
              </span>
              <span class="material-symbols-outlined text-slate-400 group-open:rotate-180 group-open:text-indigo-600 transition-transform shrink-0">
                expand_more
              </span>
            </summary>
            <div class="pt-3.5 pl-8 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-3 font-normal">
              ${item.a}
            </div>
          </details>
        `).join('')}
      </div>

      <!-- Micro-banner de Confianza -->
      <div class="mt-8 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-indigo-600 text-xl">support_agent</span>
          <span class="text-xs text-indigo-950 font-medium">¿Tenés una duda específica sobre tu comercio?</span>
        </div>
        <a href="#precios" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline font-headline">
          Ver planes o activar ahora →
        </a>
      </div>
    </section>
  `;
}

