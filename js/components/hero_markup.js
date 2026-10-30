// Archivo: js/components/hero_markup.js
/**
 * 🏙️ Tucu Red Web V2 - Hero Markup (Split 60/40 + Mockup Isométrico 3D Extruido)
 */

export function getHeroMarkup() {
  const slices = [-2, -4, -6, -8, -10, -12, -14, -16].map((z, i) => `
    <div style="transform: translateZ(${z}px);" class="absolute inset-0 rounded-[52px] pointer-events-none ${
      i === 7 ? 'bg-[#090D16] phone-chassis-shadow border border-slate-700/50' : 'bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-slate-600/35'
    }"></div>
  `).join('');

  return `
    <section id="soluciones" class="relative pt-8 pb-16 lg:pt-14 lg:pb-24 max-w-[1440px] mx-auto px-4 sm:px-8 component-enter overflow-x-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <!-- 60% Propuesta de Valor Comercial -->
        <div class="lg:col-span-6 space-y-6 z-10">
          <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-500/20">
            <span class="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span class="text-xs font-bold tracking-wider uppercase text-indigo-700 font-headline">Herramientas Digitales para tu Comercio</span>
          </div>
          <h1 class="font-headline font-extrabold text-4xl sm:text-5xl lg:text-[3.65rem] text-slate-900 tracking-tight leading-[1.07]">
            La plataforma digital que tu negocio necesita para <span class="text-indigo-600">impulsar tus ventas.</span>
          </h1>
          <p class="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
            Agendá turnos de forma autónoma, presentá tus catálogos interactivos y cobrá online con total control de tu negocio.
          </p>
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <a href="#showroom" class="px-8 py-4 rounded-2xl btn-aura-cta font-headline font-bold text-base sm:text-lg flex items-center gap-3 group"><span>Explorar herramientas en vivo</span><span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">bolt</span></a>
            <a href="#funnel" class="px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-headline font-semibold text-base border border-slate-200/80 shadow-sm transition-all flex items-center gap-2"><span class="material-symbols-outlined text-indigo-600 text-xl">rocket_launch</span><span>Sumar mi negocio</span></a>
          </div>
          <div class="pt-4 grid grid-cols-3 gap-4 max-w-xl border-t border-slate-200/70">
            <div><p class="font-headline font-extrabold text-2xl text-slate-900">24/7</p><p class="text-xs text-slate-500 font-medium">Recepción autónoma</p></div>
            <div><p class="font-headline font-extrabold text-2xl text-indigo-600">0%</p><p class="text-xs text-slate-500 font-medium">Comisiones por turno</p></div>
            <div><p class="font-headline font-extrabold text-2xl text-slate-900">3 Niveles</p><p class="text-xs text-slate-500 font-medium">Escalable a tu ritmo</p></div>
          </div>
        </div>

        <!-- 40% Escenario 3D Isométrico Extruido -->
        <div class="lg:col-span-6 relative flex justify-center items-center py-4 select-none scene-perspective" id="hero-iso-scene">
          <div class="hero-scale-wrapper preserve-3d flex items-center justify-center">
            <div id="hero-phone-stage" class="relative w-[326px] h-[656px] preserve-3d phone-iso-stage floating">
              <!-- Anclaje Ambiental Aura Light -->
              <div id="hero-ambient-aura" style="transform: translate3d(-50%, -50%, -45px);" class="absolute top-1/2 left-1/2 w-[420px] h-[540px] pointer-events-none hero-ambient-glow aura-pulse"></div>

              ${slices}
              <div style="transform: translate3d(-3px, 128px, -6px);" class="absolute left-0 w-[4px] h-11 rounded-l-md bg-slate-600 border-l border-white/30 pointer-events-none"></div>
              <div style="transform: translate3d(-3px, 184px, -6px);" class="absolute left-0 w-[4px] h-14 rounded-l-md bg-slate-600 border-l border-white/30 pointer-events-none"></div>
              <div style="transform: translate3d(3px, 156px, -6px);" class="absolute right-0 w-[4px] h-16 rounded-r-md bg-slate-700 border-r border-white/25 pointer-events-none"></div>

              <!-- Front Bezel Surface (translateZ: 0px) -->
              <div style="transform: translateZ(0px);" class="absolute inset-0 rounded-[52px] p-[11px] bg-gradient-to-br from-[#263248] via-[#0F172A] to-[#090D16] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)] preserve-3d">
                <div class="relative w-full h-full rounded-[42px] bg-black p-[2px] overflow-hidden shadow-inner">
                  <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-slate-800/80 z-30 pointer-events-none"></div>
                  <div id="phone-screen-container" class="relative w-full h-full rounded-[40px] overflow-hidden bg-[#FAFBFD] flex flex-col justify-between text-slate-900">
                    <div class="relative h-[200px] w-full overflow-hidden bg-slate-950 shrink-0">
                      <img src="/assets/showcase/hero_barber.png" alt="Barber Shop" class="w-full h-full object-cover filter brightness-95" />
                      <div class="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/45 to-black/20"></div>
                      <div class="relative z-10 pt-4 px-4 flex justify-between"><div class="inline-flex items-center gap-1.5 bg-[#4F46E5] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">★ TURNERO ACTIVO</div></div>
                      <div class="absolute bottom-3 left-4 right-4 z-10"><p class="text-[9.5px] font-bold tracking-[0.14em] text-indigo-300 uppercase">NIVEL 3 • MULTI-STAFF</p><h2 class="text-[21px] font-extrabold tracking-tight text-white leading-tight">The Barber Club</h2></div>
                    </div>
                    <div class="flex-1 px-3.5 pt-3.5 pb-3 flex flex-col justify-between bg-[#FAFBFD]">
                      <div class="rounded-2xl bg-white p-3 border border-slate-100 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)] flex items-center justify-between">
                        <div><p class="text-[10px] font-bold text-slate-400 uppercase">FACTURACIÓN DE HOY</p><p class="text-xl font-extrabold text-slate-900 font-mono tracking-tight">$184.500 <span class="text-xs font-bold text-emerald-600">+28%</span></p></div>
                        <div class="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold"><span class="material-symbols-outlined text-lg">trending_up</span></div>
                      </div>
                      <div class="space-y-2 mt-2">
                        <p class="px-1 text-[10px] font-extrabold text-slate-400 uppercase">PRÓXIMOS TURNOS</p>
                        <div id="hero-slot-1700" class="rounded-xl bg-white p-2.5 flex items-center gap-2.5 border border-slate-100 transition-all duration-300"><span class="w-9 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-extrabold text-xs flex items-center justify-center">17:00</span><div class="flex-1 min-w-0"><p class="text-xs font-extrabold text-slate-800 truncate">Corte + Barba • Mateo</p><p class="text-[10px] text-slate-400">Seña #TK-92C1</p></div><span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span></div>
                        <div class="rounded-xl bg-white p-2.5 flex items-center gap-2.5 border border-slate-100"><span class="w-9 h-8 rounded-lg bg-indigo-50 text-indigo-600 font-extrabold text-xs flex items-center justify-center">18:30</span><div class="flex-1 min-w-0"><p class="text-xs font-extrabold text-slate-800 truncate">Perfilado Premium • Lucas</p><p class="text-[10px] text-slate-400">WhatsApp enviado</p></div></div>
                      </div>
                      <a href="#showroom" class="w-full mt-2 py-2.5 rounded-xl bg-[#4F46E5] text-white font-bold text-xs text-center shadow-md block">Interactuar en el Showroom ↓</a>
                    </div>
                    <!-- Barrido Especular y Reflejo Frontal -->
                    <div id="hero-screen-sheen" class="screen-specular-sheen"></div>
                    <div class="absolute inset-0 pointer-events-none z-20" style="background: linear-gradient(125deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 28%, rgba(255,255,255,0.04) 48%);"></div>
                  </div>
                </div>
              </div>

              <!-- 3D Glassmorphism Pop-Out Cards (1 Protagónica por Acto) -->
              <div class="absolute inset-0 pointer-events-none preserve-3d">
                <!-- Card 1: Revenue Spline Graph (Acto 2) -->
                <div id="pop-card-revenue" class="hero-pop-card absolute top-[185px] right-[-52px] w-[252px] preserve-3d">
                  <div class="glass-pop-card p-3.5 relative">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div><span class="text-[9px] font-extrabold text-indigo-600 uppercase block">FACTURACIÓN EN VIVO</span><div class="flex items-baseline gap-1 mt-0.5"><span id="hero-revenue-val" class="text-[20px] font-extrabold text-slate-900 font-mono">$184.500</span><span class="text-[11px] font-extrabold text-emerald-600">+28%</span></div></div>
                      <div class="w-8 h-8 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-md"><span class="material-symbols-outlined text-base">trending_up</span></div>
                    </div>
                    <div class="relative h-[60px] w-full pt-1">
                      <svg viewBox="0 0 220 64" class="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4F46E5" stop-opacity="0.34" /><stop offset="100%" stop-color="#4F46E5" stop-opacity="0.0" /></linearGradient>
                          <linearGradient id="revLineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6366F1" /><stop offset="60%" stop-color="#4F46E5" /><stop offset="100%" stop-color="#10B981" /></linearGradient>
                        </defs>
                        <line x1="0" y1="16" x2="220" y2="16" stroke="rgba(148,163,184,0.22)" stroke-dasharray="3 3" />
                        <line x1="0" y1="44" x2="220" y2="44" stroke="rgba(148,163,184,0.22)" stroke-dasharray="3 3" />
                        <path d="M 4 52 C 36 48, 52 36, 82 38 C 112 40, 134 22, 166 18 C 188 15, 202 8, 214 6 L 214 60 L 4 60 Z" fill="url(#revAreaGrad)" />
                        <path id="hero-spline-path" class="rev-spline-path" d="M 4 52 C 36 48, 52 36, 82 38 C 112 40, 134 22, 166 18 C 188 15, 202 8, 214 6" fill="none" stroke="url(#revLineGrad)" stroke-width="3" stroke-linecap="round" />
                        <circle cx="82" cy="38" r="3.5" fill="#fff" stroke="#4F46E5" stroke-width="2" />
                        <circle cx="166" cy="18" r="3.5" fill="#fff" stroke="#4F46E5" stroke-width="2" />
                        <circle cx="214" cy="6" r="4.5" fill="#10B981" stroke="#fff" stroke-width="2" />
                      </svg>
                    </div>
                    <div class="mt-1 pt-1.5 border-t border-slate-200/70 flex justify-between text-[9.5px] font-semibold text-slate-500"><span>14 turnos cerrados</span><span class="font-mono text-slate-700 font-bold">Ticket $13.178</span></div>
                  </div>
                </div>

                <!-- Card 2: Appointment Reserved (Acto 1) -->
                <div id="pop-card-appointment" class="hero-pop-card absolute top-[355px] left-[-46px] w-[246px] preserve-3d">
                  <div class="glass-pop-card p-3 relative">
                    <div class="flex items-center gap-2.5">
                      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0"><span class="material-symbols-outlined text-lg">event_available</span></div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between"><span class="text-[9px] font-extrabold uppercase text-emerald-700">TURNO RESERVADO</span><span class="text-[10px] font-extrabold text-emerald-700 font-mono">17:00</span></div>
                        <p class="text-[12.5px] font-extrabold text-slate-900 truncate mt-0.5">Corte + Barba • Mateo</p>
                        <p class="text-[10px] font-semibold text-slate-500 truncate">Barbero: Nicolás • #2</p>
                      </div>
                    </div>
                    <div class="mt-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[9.5px]"><span class="font-semibold text-slate-600">WhatsApp Confirmado</span><span class="font-mono font-bold text-emerald-700">#TK-92C1</span></div>
                  </div>
                </div>

                <!-- Card 3: Payment Verified (Acto 3) -->
                <div id="pop-card-payment" class="hero-pop-card absolute bottom-[92px] right-[-40px] w-[238px] preserve-3d">
                  <div class="glass-pop-card p-3 relative">
                    <div class="flex items-center gap-2.5">
                      <div id="hero-shield-icon" class="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/35 shrink-0 transition-transform"><span class="material-symbols-outlined text-lg">verified</span></div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between"><span class="text-[9px] font-extrabold uppercase text-indigo-600">PAGO VERIFICADO</span><span class="text-[10.5px] font-extrabold text-emerald-600 font-mono">+$18.500</span></div>
                        <p class="text-[12.5px] font-extrabold text-slate-900 truncate mt-0.5">Seña Acreditada 100%</p>
                        <p class="text-[10px] font-semibold text-slate-500 truncate">Lucas • Perfilado Premium</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
