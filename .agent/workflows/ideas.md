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
