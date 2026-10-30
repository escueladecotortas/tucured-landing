// Archivo: js/components/showroom_view.js
/**
 * 📱 Tucu Red Web V2 - Contenedor del Showroom Interactivo Multi-Rubro y Multi-Nivel
 * Punto de montaje del motor Showcase v11 (#levels-container, #mockup-container, #benefits-container).
 */

export function renderShowroomView(containerId = 'app-showroom') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section id="showroom" class="py-20 lg:py-24 bg-slate-100/80 border-y border-slate-200/70 relative component-enter">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8">
        
        <!-- Cabecera Editorial Limpia del Showroom -->
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 class="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
            Probá tu Turnero Interactivo en Vivo
          </h2>
          <p class="text-slate-600 text-base sm:text-lg leading-relaxed">
            Alterná entre los <strong>3 niveles de potencia</strong> y los <strong>5 rubros comerciales</strong>. Tocá el celular interactivo para simular una reserva real paso a paso.
          </p>
        </div>

        <!-- Consola Interactiva de 3 Columnas (Motor Showcase v11) -->
        <div class="showroom-stage-dark rounded-[2.25rem] p-4 sm:p-6 lg:p-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- Columna Izquierda: Selector de Niveles + FAQ Desktop -->
            <div id="levels-container" class="lg:col-span-3"></div>

            <!-- Columna Central: Smartphone Interactivo + Selector de Rubros -->
            <div id="mockup-container" class="lg:col-span-5"></div>

            <!-- Columna Derecha: Ventajas Dinámicas + Vista WhatsApp / Ticket / Agenda -->
            <div id="benefits-container" class="lg:col-span-4"></div>

          </div>

          <!-- Contenedor FAQ Mobile -->
          <div id="faq-mobile-container" class="lg:hidden mt-6"></div>
        </div>

      </div>
    </section>
  `;
}
