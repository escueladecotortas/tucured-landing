// Archivo: .agent/workflows/ideas.md

# 🧠 Banco de Ideas, Propuestas & Refactorings - tucured-landing

> Registro desacoplado de iniciativas de diseño, producto y optimizaciones futuras.

---

### 1. 🚀 Showroom Interactivo & Demostraciones Vivas

- **Transición Fluida entre Rubros:** Desarrollar micro-transiciones suaves entre los 5 rubros activos (Barberías, Estética, Gastronomía, Salud y Servicios) en `#showroom` sin salto visual ni reflow.
- **Micro-Interactividad en Pantalla:** Evaluar permitir a los usuarios hacer clics directos sobre botones de la pantalla isométrico (ej. "Ver agenda completa", "Simular pago") para activar micro-modales inmediatos.

### 2. 🎯 Embudo Comercial & Conversión

- **Cotizador Dinámico de 3 Pasos (`#funnel`):** Refinar la experiencia paso a paso permitiendo al usuario seleccionar nivel de software (L1, L2 o L3) y recibir una cotización instantánea transparente antes de contactar.
- **Bot Flotante Asistente de WhatsApp:** Evaluar la integración opcional de un widget sutil de soporte directo en esquina inferior para responder dudas rápidas de comerciantes locales.

### 3. 🎨 Visual & Motion Design

- **Google Pomelli / Gemini Vision Asset Studio:** Diseñar briefs visuales para Google Pomelli y @Atenea para producción de creativos de Meta Ads e historias de Instagram.
- **Contención Preventiva por Viewport:** Instruir a @Atenea a aplicar contención `min(width, vw)` de forma preventiva en todo componente con traslación 3D en el eje Z.
- **Narrativas Secuenciales de 1 Solo Evento:** Priorizar la cadencia "1 evento a la vez" en futuros componentes para maximizar foco cognitivo y retención visual.

### 4. 📦 Tangibilidad Física & Onboarding

- **[IDEA-009] Mockup 3D y Narrativa del Kit Físico de Mostrador:** Diseñar render 3D interactivo y narrativa visual del kit de bienvenida para comercios (soporte de acrílico con código QR de reservas impreso en alta calidad, tarjeta con llave biométrica digital y manual de onboarding rápido).

### 5. 📡 Infraestructura, Mensajería & Go-To-Market

- **Conexión Socket Baileys en Nodo HP Mini:** Enlace con socket real de Baileys en nodo de infraestructura local una vez validada la sesión y el túnel seguro de Cloudflare.
- **Sesión Estratégica con @tucured-marketing:** Definición y debate del calendario de lanzamiento comercial y distribución para el Plan $1.000 Mes 1.

### 6. 📱 Experiencia Responsive & Calidad QA (Sesión 2026-11-10)

- **[IDEA-010] Auditoría Exploratoria Mobile Viewport Angosto (< 380px):** Verificar ergonomía de uso en viewports angostos (ej. iPhone SE 375px) sobre las 3 consolas de administración Aura Light (L1, L2, L3) y en iframe embebido.
- **[IDEA-011] Compuerta Automática de Enlaces Locales en Argus:** Integrar en las suites de pruebas la detección estricta de rutas de archivos inexistentes (ej. 404s en enlaces backoffice) antes de autorizar el cierre de tareas.

### 7. WhatsApp Self-Hosted, Límites Operativos y Patrones Arquitectónicos (Sesión 2026-11-14)

- **[IDEA-012] Migración / Soporte `whatsmeow` (`Evolution GO`) en Nodo Mini HP (`192.168.100.27`):** Evaluar puente WhatsApp en Go con *jitter* anti-ráfaga (5–15s entre mensajes) e incorporar en el contrato comercial de Tucu Red la tabla de límites operativos recomendados (1–25 msg/día en líneas nuevas; 1–80 msg/día en líneas maduras) bajo cláusula de uso transaccional responsable.
- **[IDEA-013] Compuerta Fija de Paridad Dual & Normalización Temporal ART (`localTodayStr`):** Mantener como regla obligatoria en el enjambre que toda mutación sobre consolas o portal cliente en `tucured-landing` replique byte-a-byte en `C:\Users\leola\Downloads\tucured-engine\public\`, y evitar `toISOString().slice(0, 10)` para fechas operativas en Argentina (GMT-3) tras las 21:00 ART.

### 8. Particionado Multi-Rubro, Modal In-App & Validación en Smartphone Real (Sesión 2026-11-16)

- **[IDEA-014] Validación en Smartphone Real sobre `https://tucured.ar`:** Ejecutar recorrido completo desde teléfono físico (Showroom multi-rubro, Turnero Autónomo, Modal In-Place de Ticket, `/t/TK-XXXX` y consolas Admin PIN) tras el despliegue a producción.
- **[IDEA-015] Particionado Estricto de Storage por Rubro & Flujo Post-Reserva In-App First:** Consolidar en futuras demos el aislamiento estricto por rubro (`_<rubro>`) validado con pruebas secuenciales sin `localStorage.clear()`, junto a modales in-place (`TucuTicketModal`) en lugar de salidas externas o ventanas nuevas.

### 9. Nivelación Multi-Nivel, CRM Firestore-Ready & Cero Jerga (Sesión 2026-11-17)

- **[IDEA-016] Evolución Firestore Multi-Tenant L2/L3:** Conectar el esquema canónico de clientes (`tenants/{tenantId}/customers/{id}` con `email`, `birthday`, `isRestricted`, `deletedAt`), turnos y configuración ya estandarizado en `localStorage` hacia colecciones Firestore al iniciar los onboardings reales.
- **[IDEA-017] Compuerta de Lenguaje Comercial Cero Jerga & Visor Full-Width:** Mantener prohibida toda jerga técnica (`Baileys`, `Cron`, `Daemon`, `Hash Idempotencia`) en UI/manuales/landing, usar confirmación custom + baja lógica (`AdminShell.confirmAsync` + `deletedAt`) y conservar el patrón de 1 sola columna full-width para visores integrados en consolas con sidebar.

### 10. Arquitectura Multi-Dominio, Onboarding & Escalabilidad (Sesión 2026-11-19)

- **[IDEA-018] Experiencia Automática Pura en Demos Comerciales:** Conservar las demos de `tucured.ar` libres de banners o botones de contingencia manual para mostrar siempre el flujo automático principal, sin enlaces simulados ni jerga interna (`Local-First`, `.ics`, `Pax`).
- **[IDEA-019] Separación Soberana de Dominios (`tucured.ar` vs `tucured.com.ar`):** Destinar `tucured.ar` (Netlify) a vidriera institucional, demos interactivas, Wizard de alta (`/`) y Ficha Rápida de Configuración (`/activar.html`); operar `tucured.com.ar` (NIC Argentina -> Cloudflare -> Túnel HP Mini `192.168.100.27`) para subdominios comodín `*.tucured.com.ar` de clientes reales y `api.tucured.com.ar` para gateway Baileys, con redirección `301` de la raíz hacia `https://tucured.ar`.
- **[IDEA-020] Escalabilidad Pragmática HP Mini -> VPS Linux:** Validar la operación inicial en el nodo HP Mini a costo fijo `$0` y migrar a un VPS Linux en la nube al alcanzar 4–5 clientes pagos sin modificar los subdominios `*.tucured.com.ar`.

### 11. Arquitectura Modular, Compuerta 3 Viewports & División del Wizard (Sesión 2026-11-23)

- **[IDEA-021] Compuerta de 3 Viewports Obligatorios (`375px` / `600px` / `1280px`):** Validar `inputRect.right <= cardRect.right + 1` y ausencia de overflow horizontal en móvil, iframe embebido de Showroom y escritorio para evitar recortes en formularios.
- **[IDEA-022] Aislamiento de `localStorage` por Rubro & Modularización Transversal:** Consolidar componentes transversales en `public/js/admin_shared/` (`admin_weekly_schedule.js`, `admin_holidays.js`, `admin_blocks_ui.js`) con paridad SHA-256 verificada contra `tucured-engine`, saneamiento de nombres legacy y bloqueo estricto de fuga de campos entre rubros (`Obra Social` exclusiva de `salud`).
- **[IDEA-023] División del Wizard (Landing vs `/empezar.html`):** Separar en el embudo de la landing las elecciones de diseño, 4 tonos de voz, galería de 12 portadas vivas y lo mínimo necesario para previsualizar el turnero funcionando, derivando la configuración operativa fina a `/empezar.html`.
