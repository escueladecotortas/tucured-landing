// Archivo: js/components/hero_markup.js
/**
 * 🏙️ Tucu Red Web V2 - Hero Markup (Split 60/40 + Chasis Anamórfico 3D Kiro con Audio)
 * Perspectiva forzada, marco cúbico de profundidad, video loop y controles de audio.
 * Restricción estricta: < 200 líneas.
 */

export function getHeroMarkup() {
  return `
    <section id="soluciones" class="relative pt-8 pb-16 lg:pt-14 lg:pb-24 max-w-[1440px] mx-auto px-4 sm:px-8 component-enter overflow-x-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <!-- 60% Propuesta de Valor Comercial & Conversión Positiva -->
        <div class="lg:col-span-6 space-y-6 z-10">
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-500/20">
            <span class="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span class="text-xs font-bold tracking-wider uppercase text-indigo-700 font-headline">Tecnología Local de Alta Gama</span>
          </div>
          <h1 class="font-headline font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] text-slate-900 tracking-tight leading-[1.08]">
            La tecnología que pone tu negocio a operar con <span class="text-indigo-600">orden y precisión.</span>
          </h1>
          <p class="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
            Tus clientes eligen turno desde la web en 3 toques. El sistema registra, asegura la seña y confirma por WhatsApp con respaldo total.
          </p>
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <a href="#precios" id="hero-cta-primary" class="px-8 py-4 rounded-2xl btn-aura-cta font-headline font-bold text-base sm:text-lg flex items-center gap-2.5 group cursor-pointer shadow-lg">
              <span>Activar por $1.000 (Mes 1)</span>
              <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
            <a href="#showroom" class="px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-headline font-semibold text-base border border-slate-200/80 shadow-sm transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600 text-xl">play_circle</span>
              <span>Ver cómo funciona en vivo</span>
            </a>
          </div>
          <div class="pt-4 grid grid-cols-3 gap-4 max-w-xl border-t border-slate-200/70">
            <div>
              <p class="font-headline font-extrabold text-2xl text-slate-900">24/7</p>
              <p class="text-xs text-slate-500 font-medium">Atención y reservas continuas</p>
            </div>
            <div>
              <p class="font-headline font-extrabold text-2xl text-indigo-600">0%</p>
              <p class="text-xs text-slate-500 font-medium">Tarifa plana sin comisiones</p>
            </div>
            <div>
              <p class="font-headline font-extrabold text-2xl text-slate-900">100%</p>
              <p class="text-xs text-slate-500 font-medium">Control directo en tu celular</p>
            </div>
          </div>
        </div>

        <!-- 40% Chasis Anamórfico 3D de Kiro (Perspectiva Forzada + Audio Interactivo) -->
        <div class="lg:col-span-6 relative flex justify-center items-center py-4 select-none hero-anamorphic-stage" id="hero-stage">
          <div class="hero-anamorphic-wrapper preserve-3d w-full max-w-[340px] sm:max-w-[380px] mx-auto">
            <!-- Capa 0: Backlight Atmosférico Emisivo -->
            <div id="hero-ambient-backlight" class="hero-backlight-emissive"></div>

            <!-- Capa 1: Chasis Anamórfico & Marco Cúbico 3D -->
            <div id="hero-phone-stage" class="relative rounded-[2.5rem] p-3 sm:p-3.5 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900 border border-slate-700/60 shadow-2xl backdrop-blur-xl preserve-3d hero-chassis-bezel">
              
              <!-- Contenedor del Video Kiro con Relieve Óptico -->
              <div class="relative overflow-hidden rounded-[2rem] bg-black shadow-inner border border-white/10 group aspect-[9/16] max-h-[620px]">
                <video 
                  id="kiro-hero-video" 
                  src="/assets/video/kiro_hero_loop.mp4" 
                  poster="/assets/video/kiro_hero_poster.webp"
                  autoplay 
                  loop 
                  muted 
                  playsinline 
                  preload="metadata"
                  class="w-full h-full object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-[1.02]">
                </video>

                <!-- Sheen Especular Sutil -->
                <div id="hero-screen-sheen" class="hero-glass-sheen-layer pointer-events-none"></div>
                <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/70 via-transparent to-white/10"></div>

                <!-- Badge Superior Flotante -->
                <div class="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-white/20 text-white backdrop-blur-md shadow-lg">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-[10px] font-extrabold tracking-widest uppercase font-mono">KIRO 3D • EN VIVO</span>
                </div>

                <!-- Control Flotante de Audio Glassmorphic -->
                <div class="absolute bottom-4 right-4 z-20">
                  <button 
                    type="button" 
                    id="kiro-audio-toggle" 
                    aria-label="Activar sonido"
                    class="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-white backdrop-blur-md shadow-xl transition-all flex items-center gap-2 cursor-pointer group text-xs font-bold hover:scale-105 active:scale-95"
                  >
                    <span class="material-symbols-outlined text-base text-amber-400 group-hover:scale-110 transition-transform" id="kiro-audio-icon">volume_off</span>
                    <span id="kiro-audio-label">Activar sonido</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
