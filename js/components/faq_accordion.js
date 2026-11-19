// Archivo: js/components/faq_accordion.js
/**
 * ❓ Tucu Red Web V2 - Acordeón Minimalista de Preguntas Frecuentes (7 Preguntas Alineadas)
 * Copy claro, positivo y directo sobre abono, feriados actualizables y WhatsApp seguro con respaldo.
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

const FAQS_DATA = [
  {
    q: '¿Cómo funciona la promoción Mes Fundador de $4.999 del primer mes?',
    a: 'Abonás $4.999 ARS por transferencia directa al alias oficial tucured o mediante el enlace oficial de Mercado Pago. Durante 30 días usás el sistema completo en tu local; desde el segundo mes rige el abono regular del nivel elegido ($14.900, $24.900 o $34.900 ARS/mes), sin contratos de permanencia.'
  },
  {
    q: '¿Mis clientes tienen que descargar alguna app o crearse una cuenta?',
    a: 'No. Tus clientes ingresan desde cualquier navegador web del celular, eligen su turno en 3 pasos sin contraseñas y reciben su Ticket Online #TK con dirección del local, botón para agendar en calendario (.ics) y link de autogestión.'
  },
  {
    q: '¿El sistema respeta el corte de siesta y los feriados argentinos?',
    a: 'Sí. Podés configurar horarios corridos o turnos partidos (Mañana y Tarde con corte de siesta). Además, el calendario de feriados nacionales se actualiza año tras año automáticamente, manteniendo un interruptor individual por mes para abrir fechas puntuales como excepción si decidís atender.'
  },
  {
    q: '¿Cómo cobro las señas de las reservas?',
    a: 'Configurás tu propio Alias y CBU/CVU desde el panel de administración, definís qué servicios exigen seña (en porcentaje o monto fijo) y habilitás tus medios de pago. Tus clientes transfieren directo a tu cuenta sin intermediarios ni comisiones y pueden adjuntar o informar el comprobante desde su Ticket Online.'
  },
  {
    q: '¿Puedo cambiar de nivel (L1, L2 o L3) más adelante?',
    a: 'Sí, la actualización es inmediata. Podés empezar con Nivel 1 o Nivel 2 y escalar a Nivel 3 Multi-Staff cuando tu equipo crezca, conservando turnos, fichas de clientes y configuraciones previas.'
  },
  {
    q: '¿Cuánto demoran en entregarme el turnero configurado?',
    a: 'Completás los 4 pasos de alta guiada, avisás por WhatsApp y nuestro equipo técnico habilita y deja listo tu turnero personalizado con tus servicios y horarios en el día.'
  },
  {
    q: '¿Cómo funcionan los recordatorios por WhatsApp y el aviso manual de respaldo?',
    a: 'Vinculás tu línea mediante código QR directo en el panel para enviar confirmaciones y recordatorios automáticos 24 hs y 2 hs antes del turno (en Nivel 3 además contás con Confirmación y Liberación Automática 2 hs antes, activable o pausable). Para cuidar tu línea, los rangos seguros de envío transaccional son de 1 a 25 mensajes/día en líneas nuevas y hasta 80 mensajes/día en líneas maduras, sujeto a las pautas de uso responsable en Términos y Condiciones sin responsabilidad de Tucu Red ante bloqueos por uso indebido. Ante cualquier mantenimiento o indisponibilidad del envío automático, el sistema permite enviar el aviso manual en 1 clic sin frenar la atención.'
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
          <span>Respuestas Claras y Directas</span>
        </div>
        <h2 class="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
          Preguntas Frecuentes
        </h2>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Todo lo que necesitás saber antes de activar tu software. Información clara y transparente.
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
          <span class="text-xs text-indigo-950 font-medium">¿Tenés una consulta específica sobre tu comercio?</span>
        </div>
        <a href="#precios" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline font-headline">
          Ver planes o activar ahora →
        </a>
      </div>
    </section>
  `;
}
