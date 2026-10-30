// Archivo: .agent/workflows/kanban.md
# Tablero Kanban Master v2.0 - tucured-landing

Estructura soberana de orquestación y seguimiento.

> 📂 **Histórico de Tareas:**  
> - Hitos v1 (Fundación & Netlify Forms): [.agent/workflows/archive/kanban_history_v1.md](.agent/workflows/archive/kanban_history_v1.md)  
> - Hitos v2 (Transición & Videos MP4): [.agent/workflows/archive/kanban_history_v2.md](.agent/workflows/archive/kanban_history_v2.md)  

## [BACKLOG]

## [IN_PROGRESS]

## [DONE]
- [x] **[TASK-034]** Clamping Responsive Móvil en Cards 3D & Cierre Git *(30/10/2026)*
  - [x] Configurar clamping de viewport móvil (`@media (max-width: 640px)`): contención `max-width: min(310px, 88vw)`, `width: 100%`, `left: 50%`, `right: auto`
  - [x] Reajustar coordenadas de centrado y micro-offset en móvil: `.card-act-1/2/3` con traslación `calc(-50% + Xpx)` y escala `0.98 - 1.0`
  - [x] Escalar smartphone en móvil (`.hero-scale-wrapper` a `scale(0.90)`) para asegurar margen lateral >= 16px
  - [x] Blindar sección con `overflow-x-hidden` erradicando cualquier scroll horizontal accidental
  - [x] Auditar límites: `layout.css` (125L <= 130L), `hero.js` (134L <= 140L), `hero_markup.js` (145L <= 160L), build Vite limpio en 2.27s
- [x] **[TASK-033]** Pulido Cinemático Hero: Aura Light, Glass Sheen & Escala Apple *(30/10/2026)*
  - [x] Inyectar iluminación ambiental `#hero-ambient-aura` detrás del chasis 3D (`translate3d(0, 0, -45px)`, 420x540px) con degradado radial multicapa (índigo/violeta/naranja) y animación respirada `.aura-pulse` (6s)
  - [x] Implementar barrido especular dinámico `.screen-specular-sheen` (`.sheen-active::after`) con skewX(-20deg) y sweep diagonal de 0.9s disparado en cada cambio de acto (Turno, Facturación, Pago)
  - [x] Escalar presencia escénica del smartphone en desktop (+8% via `.hero-scale-wrapper`) y profundizar sombra de contacto `.phone-chassis-shadow` con tinte índigo profundo (`rgba(30, 27, 75, 0.38)`)
  - [x] Auditar gobernanza: `css/layout.css` (119L <= 130L), `hero.js` (134L <= 140L), `hero_markup.js` (145L <= 160L), build Vite en 538ms y 60 FPS estables en `http://localhost:5174`
- [x] **[TASK-032]** Erradicación de Artefacto Rectangular en Cards 3D (Hardware Clipping & Drop-Shadow) *(29/10/2026)*
  - [x] Aplicar hardware clipping en GPU: `clip-path: inset(0 round 1.25rem)`, `border-radius: 1.25rem` y `overflow: hidden` en `.glass-pop-card`
  - [x] Heredar radios en pseudo-elementos (`border-radius: inherit`) y erradicar capas apiladas con desenfoque (`blur-xl`) en `hero_markup.js`
  - [x] Reemplazar spread agresivo de `box-shadow` por `filter: drop-shadow(0 20px 25px rgba(15, 23, 42, 0.18))` en `.hero-card-active`, conformando una silueta 100% redondeada
  - [x] Higienizar DOM en `hero_markup.js` (138L < 150L): erradicación de fondos dobles/bordes blancos exteriores
  - [x] Certificar gobernanza: `css/layout.css` (109L < 115L), `hero_markup.js` (138L < 150L), build Vite en 528ms y HMR activo en `http://localhost:5174`
- [x] **[TASK-031]** Director de Escena Secuencial 3D (1 Card por Vez & Efecto Apple) *(29/10/2026)*
  - [x] Erradicar empaste simultáneo: implementar estado durmiente en reposo (`.hero-pop-card`) y suprimir badge residual
  - [x] Configurar coreografía cíclica en 3 actos (~13s loop) en `js/components/hero.js` (133L < 140L): Acto 1 Turno Mateo, Acto 2 Facturación Spline, Acto 3 Pago Verificado
  - [x] Sincronizar reactividad en el smartphone: pulso esmeralda en slot 17:00 (`#hero-slot-1700`) y destello en escudo de pago (`#hero-shield-icon`)
  - [x] Implementar dibujo dinámico de curva SVG (`stroke-dashoffset: 0` a través de `.rev-spline-drawn`) y animación numérica elástica ($184.500 -> $209.000)
  - [x] Preservar seguimiento interactivo lerp al cursor sin interferir con las coordenadas Z de las tarjetas
  - [x] Refinar `css/layout.css` (104L < 130L) y `js/components/hero_markup.js` (141L < 180L)
  - [x] Certificar gobernanza: 0 dependencias extra, build Vite en 1.65s y HMR activo en `http://localhost:5174`
- [x] **[TASK-030]** Portabilidad de Hero 3D Isométrico: De `temp/3d_app` a Vanilla Nativo ES6 *(29/10/2026)*
  - [x] Auditar componentes React de Argon 4 (`IsometricSmartphone.tsx`, `FloatingPopCards.tsx`, `PhoneScreenUI.tsx`) y estilos en `index.css`
  - [x] Portar chasis 3D extruido de 8 capas Z, botones de hardware y front bezel con brillo comercial a `js/components/hero_markup.js` (149L < 180L)
  - [x] Replicar gráfico SVG spline en vivo ($184.500) y tarjetas pop con elevación Z exacta (`zRevenue: 92px`, `zAppointment: 122px`, `zPayment: 108px`)
  - [x] Reemplazar `motion/react` por secuenciador elástico nativo en `js/components/hero.js` (80L < 175L) con parallax interactivo al cursor
  - [x] Integrar estilos de perspectiva 1400px, `.glass-pop-card` y sombras multicapa en `css/layout.css` (101L < 160L)
  - [x] Certificar gobernanza: 0 dependencias añadidas a `package.json`, build en 558ms (< 600ms) y HMR en `http://localhost:5174`
- [x] **[TASK-029]** Transición a Hero Op-B: Video Anamórfico WebM Transparente & Purga CSS *(29/10/2026)*
  - [x] Procesar video con FFmpeg: crop 1:1 (1080x1080), chromakey verde (0x00FF00), codec VP9 alfa yuva420p (1.89 MB < 2 MB) en `public/assets/hero_anamorphic.webm`
  - [x] Extraer poster instantáneo WebP de alta fidelidad en `public/assets/hero_poster.webp`
  - [x] Refactorizar `hero.js` a 57L (< 60L): purga de listeners/lerp/story loop y montaje de reproductor nativo con IntersectionObserver pasivo
  - [x] Higienizar `css/layout.css` a 66L (< 90L): remoción de animaciones orbitales obsoletas e incorporación de `.hero-video-container` y `.hero-video-element`
  - [x] Certificar gobernanza: build de producción limpio en 821ms y sincronización HMR en `http://localhost:5174`
- [x] **[TASK-028]** Coreografía Cinemática V2: Teléfono Reactivo, Erradicación Z-Clipping y Glassmorphism *(29/10/2026)*
  - [x] Erradicar recorte 3D (z-clipping) garantizando `transform-style: preserve-3d` continuo sin `overflow: hidden` ni aplanamiento por `backdrop-filter` en contenedores intermedios
  - [x] Implementar clase `.glass-card-hero` con fondo translúcido (88%), blur(12px), borde especular (75%) y sombra multicapa difusa
  - [x] Configurar trayectorias orbitales con pausa protagónica frontal fija en `translateZ(185px)` y escala `1.18`
  - [x] Desarrollar cadencia de 3 actos con respiro (ciclo 14s total) y teléfono reactivo: slot 18:30 verde, micro-contador dinámico ($184.500 -> $209.000) y badge comanda
  - [x] Certificar gobernanza: `hero.js` (172L < 175L) y `layout.css` (107L < 160L), compilación de producción limpia en 668ms
- [x] **[TASK-027]** Coreografía Cinemática Orbital 3D en 3 Actos & PhoneReveal *(29/10/2026)*
  - [x] Configurar escenario 3D con perspectiva amplia de 1000px y animación de entrada `@keyframes phoneReveal` en `css/layout.css`
  - [x] Definir 3 trayectorias orbitales completas detrás -> frente -> detrás (`@keyframes orbitHorizontal`, `@keyframes orbitVertical`, `@keyframes orbitCurve`)
  - [x] Orquestar máquina secuencial cíclica en `js/components/hero.js` (1.1s reveal + bucle continuo 12s, 4s por acto)
  - [x] Implementar aislamiento estricto con `.orbit-hidden` para tarjetas inactivas y preservar seguimiento sutil al cursor del teléfono
  - [x] Certificar gobernanza: `hero.js` (166L < 175L) y `layout.css` (94L < 160L), build limpio en 468ms
- [x] **[TASK-026]** Cinemática Balística Secuencial (Story Loop 3.6s & Spring Physics) en Hero Section *(29/10/2026)*
  - [x] Definir keyframes `@keyframes burstIn` y `@keyframes recedeBack` con interpolación de variables `--tx`, `--ty`, `--tz` en `css/layout.css`
  - [x] Implementar clases de estado `.card-ejected-active` (halo difuso reactivo) y `.card-ejected-idle` (segundo plano suave)
  - [x] Construir máquina de estados secuencial en `js/components/hero.js` alternando cada 3.6s (Turno Barber -> Cobro MP -> Envío WhatsApp)
  - [x] Preservar motor de interpolación elástica lerp (0.12) y rotación anamórfica 3D coordinada
  - [x] Certificar gobernanza: `hero.js` (170L < 175L) y `layout.css` (108L < 160L), build de Vite limpio en 537ms sin fugas de memoria
- [x] **[TASK-025]** Calibración Cinemática 3D, Fuga Focal 850px y Parallax Elástico (lerp) *(29/10/2026)*
  - [x] Reducir perspectiva a 850px en `.perspective-hero` para maximizar fuga tridimensional
  - [x] Elevar eje Z: capa 1 (45px), capa 2 (85px), capa 3 (115px) con halos difusos multicapa
  - [x] Inyectar 3 animaciones de flotación multifrecuencia (`floatCardA` 3.2s, `floatCardB` 4.2s, `floatCardC` 2.7s)
  - [x] Ampliar rotación máxima del escenario a 18°/20° e implementar amortiguación elástica lerp (0.12)
  - [x] Aplicar traslación reactiva multidireccional por tarjeta con soporte táctil y giroscopio móvil
  - [x] Auditar gobernanza: `hero.js` (173L) y `layout.css` (138L) < 180L, build de Vite limpio en 557ms
- [x] **[TASK-024]** Parallax 3D Reactivo & Capas en Eje Z en Hero Section *(29/10/2026)*
  - [x] Implementar utilidades de perspectiva 3D en `css/layout.css` (`.perspective-hero`, `.parallax-target`, `.depth-layer-1/2/3`)
  - [x] Enlazar listeners interactivos en `#hero-dynamic-stage` (`mousemove`, `mouseleave`, `touchmove`, `touchend`, `deviceorientation`)
  - [x] Desacoplar capas en eje Z para tarjetas flotantes (35px, 65px, 90px)
  - [x] Dejar slot preparado con comentario para swap a `<video>` de la Opción B al finalizar render 3D
- [x] **[TASK-023]** Rastrillaje Quirúrgico de Textos y Descorporativización *(29/10/2026)*
  - [x] Actualizar botón de acción principal en Showroom a "Quiero este Turnero en mi negocio" (`showcase_benefits.js`)
  - [x] Ajustar overline de certezas a "DETALLES QUE IMPORTAN" en `features.js`
  - [x] Afilar embudo `funnel.js`: overline "Puesta en marcha sin comisiones", titular "Configurá tu propuesta", botón "Quiero empezar ahora" y erradicación de "ecosistema"
- [x] **[TASK-022]** Pulido Fino de Textos, 5to Caso Salud, Limpieza de Showroom y Unificación de CTAs *(29/10/2026)*
  - [x] Unificar CTA "Sumar mi negocio" en navbar (desktop y mobile), footer y botón de acción en hero apuntando a `#funnel`
  - [x] Ajustar estilos tipográficos en bajada de Casos (`text-slate-500 text-sm md:text-base font-normal max-w-xl`)
  - [x] Incorporar 5ta tarjeta comercial en casos: Centro Médico San Martín (`salud`, `hero_salud.webp`, L3) con grilla asimétrica equilibrada
  - [x] Purgar badge duplicado y barra redundante `.active-config-bar` en `showroom_view.js`
- [x] **[TASK-021]** Conversión WebP de Alta Fidelidad & Trasplante de Activos *(29/10/2026)*
  - [x] Convertir `peluqueria.jpg`, `salud.jpg` y `salon_unas.jpg` de `temp/` a WebP calidad 82 (~85% de reducción promedio)
  - [x] Depositar WebPs en `assets/showcase/`, `public/assets/showcase/` y `dist/assets/showcase/`
  - [x] Enlazar `showcase_state.js` para estetica, barberia y salud
- [x] **[TASK-020]** Saneamiento Integral de Textos, Identidad de Marca y Slot Salud *(29/10/2026)*
  - [x] Actualizar titular y badge del Hero y ajustar textos de Casos y Footer
  - [x] Renombrar estética a "Lumina Uñas & Estética" y crear fallback `hero_salud.png`
- [x] **[TASK-019]** Activación de 5to Rubro Salud & Certezas Reales del Sistema *(29/10/2026)*
  - [x] Incorporar `salud` en `showcase_state.js`, plantillas L1/L2/L3 y píldora rápida
  - [x] Inyectar componente Aura Light `features.js` (72L) con las 5 "Certezas Reales del Sistema"
- [x] **[TASK-018]** Auditoría Funcional del Motor (L1/L2/L3 + Presets) y Saneamiento de Identidad Visual *(29/10/2026)*
  - [x] Extraer matriz real de reglas de negocio en código y vincular logo oficial SVG en `navbar.js` y `footer.js`
- [x] **[TASK-017]** Modularización Arquitectónica (< 200L) e Integración de Showroom v11.1 *(29/10/2026)*
  - [x] Desacoplar `stitch_aura_light_v2.html` en 6 componentes Vanilla ES6 y 3 hojas CSS
  - [x] Trasplantar los 9 módulos de `js/showcase_v11/` desde `tucured-engine`
- [x] **[TASK-016]** Generación de Maqueta Declarativa Aura Light V2 en Google Stitch MCP *(29/10/2026)*

## 🧠 BANCO DE IDEAS & REFACTORINGS FUTUROS
- [ ] **Google Pomelli / Gemini Vision Asset Studio**: Evaluar el uso de Google Pomelli para la generación de mockups de marketing de alta fidelidad sin alucinaciones de texto.
- [ ] **Bot de WhatsApp Directo**: Evaluar la integración opcional de un botón flotante de WhatsApp para consultas directas sin pasar por e-mail.
- [ ] **Métricas & Analytics**: Inyectar script ligero de analíticas (GA4 `G-BBB4N4TG4S`) para medir conversiones de clics en "Ver demo" y formulario. *(Completado en TASK-015)*

---
**Estado del Proyecto:** [ACTIVE_V11]
