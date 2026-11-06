// Archivo: js/components/hero_markup.js
/**
 * 🏙️ Tucu Red Web V2 - Hero Markup (Split 60/40 + Mockup Interactivo de Software Web)
 * Software autónomo, reserva en 3 toques, perspectiva 3D y badges operativos.
 * Restricción estricta: < 200 líneas (< 180L).
 */

export function getHeroMarkup() {
  return `
    <section id="soluciones" class="relative pt-8 pb-16 lg:pt-14 lg:pb-24 max-w-[1440px] mx-auto px-4 sm:px-8 component-enter overflow-x-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <!-- 60% Propuesta de Valor Comercial & Conversión Positiva -->
        <div class="lg:col-span-6 space-y-6 z-10">
          <h1 class="font-headline font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] text-slate-900 tracking-tight leading-[1.08]">
            El software web que pone tu negocio a operar con <span class="text-indigo-600">orden y precisión.</span>
          </h1>
          <p class="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
            Tus clientes reservan en 3 toques desde su celular sin contraseñas. El sistema asegura el horario en tiempo real según las reglas de tu local y despacha el comprobante directo a WhatsApp.
          </p>
          <div class="pt-2">
            <div class="flex flex-wrap items-center gap-4">
              <a href="#precios" id="hero-cta-primary" class="px-8 py-4 rounded-2xl btn-aura-cta font-headline font-bold text-base sm:text-lg flex items-center gap-2.5 group cursor-pointer shadow-lg">
                <span>Activar por $1.000*</span>
                <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
              <a href="#showroom" class="px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-headline font-semibold text-base border border-slate-200/80 shadow-sm transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-600 text-xl">play_circle</span>
                <span>Probar en vivo</span>
              </a>
            </div>
            <p class="text-xs text-slate-500 mt-2.5 font-medium leading-relaxed">
              *Tarifa promocional mes de lanzamiento. Luego abono regular según nivel.
            </p>
          </div>
          <div class="pt-4 grid grid-cols-3 gap-4 max-w-xl border-t border-slate-200/70">
            <div>
              <p class="font-headline font-extrabold text-2xl text-slate-900">24/7</p>
              <p class="text-xs text-slate-500 font-medium">Agenda web continua</p>
            </div>
            <div>
              <p class="font-headline font-extrabold text-2xl text-indigo-600">0%</p>
              <p class="text-xs text-slate-500 font-medium">Tarifa plana sin comisiones</p>
            </div>
            <div>
              <p class="font-headline font-extrabold text-2xl text-slate-900">100%</p>
              <p class="text-xs text-slate-500 font-medium">Autonomía en tu WhatsApp</p>
            </div>
          </div>
        </div>

        <!-- 40% Escenario 3D: Interfaz Interactiva de Software Web (Tablet Mode) -->
        <div class="lg:col-span-6 relative flex justify-center items-center py-4 select-none hero-anamorphic-stage" id="hero-stage">
          <div class="hero-anamorphic-wrapper preserve-3d w-full max-w-[480px] sm:max-w-[500px] mx-auto">
            <!-- Capa 0: Backlight Atmosférico Emisivo -->
            <div id="hero-ambient-backlight" class="hero-backlight-emissive"></div>

            <!-- Capa 1: Chasis del Dispositivo (CSS 3D preserve) -->
            <div id="hero-phone-stage" class="hero-terminal-chassis w-full p-3.5 sm:p-4.5">
              
              <!-- Brillo Especular de Cristal -->
              <div id="hero-screen-sheen" class="hero-glass-sheen-layer"></div>

              <!-- Badge Flotante Top-Left (Z=65px): Feriados Nacionales -->
              <div class="terminal-pop-badge terminal-badge-top px-3.5 py-2.5 flex items-center gap-2.5 text-white">
                <div class="w-7 h-7 rounded-lg bg-indigo-500/25 text-indigo-300 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">event_available</span>
                </div>
                <div class="leading-tight">
                  <p class="text-[9px] font-extrabold uppercase tracking-widest text-indigo-300 font-mono">FERIADOS ARGENTINOS</p>
                  <p class="text-xs font-bold text-white whitespace-nowrap">Calendario Nacional de Feriados Integrado</p>
                </div>
              </div>

              <!-- Pantalla Interactiva de Alta Resolución -->
              <div class="rounded-2xl bg-[#FAFBFD] p-4 sm:p-5 border border-slate-200/80 shadow-inner text-slate-900 space-y-3.5 relative z-20">
                <!-- Barra Superior de Estado del Software -->
                <div class="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 font-mono">SISTEMA ACTIVO</span>
                  </div>
                  <span class="text-[11px] font-extrabold text-indigo-600 font-headline">The Barber Club • Yerba Buena</span>
                </div>

                <!-- Toque 1: Servicio y Profesional Asignado -->
                <div class="p-3 rounded-xl bg-white border border-indigo-200 shadow-sm flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <span class="material-symbols-outlined text-lg">content_cut</span>
                    </div>
                    <div>
                      <p class="text-xs font-extrabold text-slate-900">Corte Clásico + Perfilado</p>
                      <p class="text-[11px] text-slate-500 font-medium">Barbero: <span class="font-bold text-slate-700">Mateo (Staff VIP)</span></p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-extrabold font-mono">$12.000</span>
                </div>

                <!-- Toque 2: Selector de Horarios con Bloqueo en Tiempo Real -->
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">HORARIOS DISPONIBLES EN VIVO</span>
                    <span class="text-[10px] font-bold text-emerald-600 font-mono">HOY 3 SLOTS</span>
                  </div>
                  <div class="grid grid-cols-4 gap-2">
                    <div class="py-2 px-1 text-center rounded-lg bg-slate-100 text-slate-400 text-xs font-mono font-medium line-through cursor-not-allowed">16:30</div>
                    <div class="py-2 px-1 text-center rounded-lg bg-slate-100 text-slate-400 text-xs font-mono font-medium line-through cursor-not-allowed">17:00</div>
                    <div class="py-2 px-1 text-center rounded-lg terminal-slot-chip terminal-slot-active text-xs font-mono font-extrabold border">17:30</div>
                    <div class="py-2 px-1 text-center rounded-lg terminal-slot-chip bg-white border border-slate-200 text-slate-700 text-xs font-mono font-bold hover:border-indigo-300">18:15</div>
                  </div>
                </div>

                <!-- Toque 3: Confirmación Web y Despacho WhatsApp -->
                <div class="pt-1">
                  <a href="#precios" id="hero-terminal-cta" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-headline font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25 transition-all cursor-pointer">
                    <span class="material-symbols-outlined text-base">chat</span>
                    <span>Confirmar Turno y Recibir en WhatsApp</span>
                  </a>
                  <p class="text-[10px] text-center text-slate-400 font-medium mt-1.5">Reserva web en 3 toques • Confirmación inmediata</p>
                </div>
              </div>

              <!-- Badge Flotante Bottom-Right (Z=85px): Gestión de Cancelaciones -->
              <div class="terminal-pop-badge terminal-badge-bottom px-3.5 py-2.5 flex items-center gap-2.5 text-slate-900">
                <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">notifications_active</span>
                </div>
                <div class="leading-tight">
                  <p class="text-[9px] font-extrabold uppercase tracking-widest text-emerald-700 font-mono">AUTOGESTIÓN WEB</p>
                  <p class="text-xs font-extrabold text-slate-800 whitespace-nowrap">Gestiona cancelaciones y te avisa al instante</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  `;
}
