// Archivo: js/components/showroom_view.js
/**
 * 📱 Tucu Red Web V2 - Contenedor del Showroom Interactivo Multi-Rubro y Multi-Nivel
 * Estética integrada al diseño global, sin fondos grises descolgados y layout armónico.
 * Restricción estricta: < 200 líneas (< 180L).
 */

export function renderShowroomView(containerId = 'app-showroom') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section id="showroom" class="py-20 lg:py-28 relative component-enter">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8">
        
        <!-- Cabecera Editorial Limpia del Showroom -->
        <div class="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-widest font-headline">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Simulador Interactivo v15.0</span>
          </div>
          <h2 class="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight">
            Probá tu Turnero en Vivo
          </h2>
          <p class="text-slate-600 text-base sm:text-lg leading-relaxed">
            Alterná entre los <strong>3 niveles del sistema</strong> y los <strong>5 rubros comerciales</strong>. Interactuá con la vista de cliente o mirá la trastienda de administración.
          </p>
        </div>

        <!-- Consola Interactiva Integrada Orgánicamente -->
        <div class="showroom-stage-dark rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- Columna Izquierda: Selector de Niveles + FAQ Desktop -->
            <div id="levels-container" class="lg:col-span-3"></div>

            <!-- Columna Central: Smartphone Interactivo + Selector de Rubros -->
            <div id="mockup-container" class="lg:col-span-5"></div>

            <!-- Columna Derecha: Ventajas Dinámicas + Vista WhatsApp / Ticket / Trastienda -->
            <div id="benefits-container" class="lg:col-span-4"></div>

          </div>

          <!-- Contenedor FAQ Mobile -->
          <div id="faq-mobile-container" class="lg:hidden mt-6"></div>
        </div>

      </div>
    </section>
  `;
}
