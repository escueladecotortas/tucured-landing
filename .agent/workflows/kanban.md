// Archivo: .agent/workflows/kanban.md
# Tablero Kanban Master v2.0 - TUCURED-LANDING

Estructura soberana de orquestación, dependencias y seguimiento asíncrono.

## [BACKLOG]

## [IN_PROGRESS]

## [DONE]
- [x] **[TASK-INIT]** Instanciación Limpia de Ecosistema v10.0
  - [x] Crear estructura base e inyectar especificaciones.md
  - [x] Configurar Kanban Master v2.0
- [x] **[TASK-001]** Migración de Activos & Definición de Marca Tucu Red (`index.html`)
  - [x] Migrar maquetado desde nexus-os-landing con estética Glassmorphism
  - [x] Adaptar textos y copy a Tucu Red (Powered by NEXUS-OS) con lenguaje 100% afirmativo
- [x] **[TASK-002]** Configuración de Entorno Crítico `.env` & Consolidación Vite
  - [x] Sincronizar llaves locales, DB_TARGET y scripts de build Vite
  - [x] Validar compilación con npx vite build
- [x] **[TASK-003]** Rediseño de Copy Humano & 4 Herramientas Tucu Red (`index.html`)
  - [x] Simplificar titulos y bajadas a lenguaje amigable sin tecnicismos
  - [x] Integrar las 4 soluciones (Turnero, Catálogo con Flete, Asistente WhatsApp, Invitaciones QR)
  - [x] Formulario simplificado (Nombre, Negocio, Teléfono, Necesidad)
- [x] **[TASK-004]** Refinamiento de UI, Estructura Assets y Modales de Demo (`index.html`)
  - [x] Reorganizar tucu_red_logo_full.svg en ./assets/
  - [x] Eliminar corchetes [ ] de botones y corregir contraste del select en CSS
  - [x] Integrar modales interactivos de demo y tarjeta de éxito dorada
- [x] **[TASK-005]** Simuladores Interactivos en Vivo para Demos (`js/simulators.js`)
  - [x] Mini agendador de turnos en vivo con generación de ticket digital
  - [x] Carrito de compras interactivo y calculador de flete GPS por distancia
  - [x] Chatbot interactivo de WhatsApp 24/7 con respuestas automáticas
  - [x] Invitación digital con muro en pantalla gigante interactivo
  - [x] Auto-selección de herramienta y desplazamiento fluido hacia el formulario
- [x] **[TASK-006]** Configuración Netlify Forms & Framework de Demo Limpio (`index.html`)
  - [x] Inyectar directivas Netlify Forms (name="contacto-tucured", data-netlify="true", bot-field)
  - [x] Envío via AJAX con preservación de tarjeta de éxito dorada y copia local
  - [x] Marco móvil phone-frame estilizado con reproductor de video y fallback interactivo
- [x] **[TASK-007]** Cerrado Rápido & Optimización de Demos Pre-Reunión (`assets/demos/`)
  - [x] Copiar videos de demos (turnero.mp4, catalogo.mp4, eventos.mp4) a ./assets/demos/
  - [x] Vincular botones "Consultar" con desplazamiento suave y pre-selección en formulario
  - [x] Validar compilación limpia y renderizado instantáneo en marco móvil
- [x] **[TASK-008]** Limpieza Final de Botones y Reproductores de Demo (`js/simulators.js`)
  - [x] Configurar botón único "Ver demo" en tarjetas 1, 2 y 3 y "Consultar" en tarjeta 4
  - [x] Eliminar marquetes phone-frame extras y bloques redundantes de texto inferior
  - [x] Renderizado de video .mp4 nítido a tamaño completo adaptativo en modales
- [x] **[TASK-009]** Despliegue a Producción en Netlify (tucured.ar) (`netlify.toml`)
  - [x] Compilar bundle de producción `dist/` mediante Vite (built in 324ms)
  - [x] Desplegar a producción vía Netlify CLI vinculado al sitio `tucured` (`691c2f2f-f725-4abe-bea4-56372cb4e95e`)
  - [x] Verificación HTTP 200 OK en directo sobre la URL oficial `https://tucured.ar`
- [x] **[TASK-010]** Corrección Urgente de Videos .MP4 a Producción (`dist/assets/demos/`)
  - [x] Copiar videos .mp4 a public/assets/demos/ y dist/assets/demos/
  - [x] Re-despliegue forzado a Netlify produciendo 9 archivos procesados en CDN
  - [x] Verificación directa HTTP 200 OK del video `https://tucured.ar/assets/demos/turnero.mp4`
- [x] **[TASK-011]** Integración de Assets 720p & Selector Cliente/Admin (`js/simulators.js`)
  - [x] Importar los 5 videos optimizados en 720p (turnero, catalogo, catalogo_admin, eventos, eventos_admin)
  - [x] Inyectar selector de pestañas doradas minimalistas (Vista Cliente / Panel Admin) en modales
  - [x] Re-despliegue a Netlify con 11 archivos y verificación HTTP 200 OK en `catalogo_admin.mp4`
- [x] **[TASK-012]** Fix Header Mobile & Activación Demo Eventos (`css/styles.css` & `index.html`)
  - [x] Ajustar padding, font-size y ocultar subtítulo span en mobile para encaje perfecto
  - [x] Activar botón "Ver demo" en tarjeta 4 (Eventos e Invitaciones QR) vinculado al modal con selector doble
  - [x] Compilar bundle (built in 356ms) y re-desplegar a producción en Netlify (`https://tucured.ar`)
- [x] **[TASK-013]** Optimización de Tamaño de Video y Re-importación Eventos 720p (`css/styles.css`)
  - [x] Re-importar Eventos 720p (`eventos.mp4`) a assets, public y dist
  - [x] Ampliar max-width del modal-card a 680px y max-height del video a 74vh (76vh en mobile)
  - [x] Compilar bundle y re-desplegar a producción Netlify con verificación HTTP 200 OK
- [x] **[TASK-014]** Escalado y Zoom Proporcional de Video Turnero (`css/styles.css` & `js/simulators.js`)
  - [x] Inyectar contenedor `video-zoom-box` con `overflow: hidden;` en reproductores de demo
  - [x] Aplicar `transform: scale(1.38)` (desktop) y `transform: scale(1.48)` (mobile) a `.video-turnero` para eliminar franjas negras muertas
  - [x] Compilar bundle (built in 302ms) y re-desplegar a producción en Netlify con verificación HTTP 200 OK

## 🧠 BANCO DE IDEAS & REFACTORINGS FUTUROS
- [ ] **Google Pomelli / Gemini Vision Asset Studio**: Evaluar el uso de Google Pomelli para la generación de mockups de marketing de alta fidelidad sin alucinaciones de texto.
- [ ] **Bot de WhatsApp Directo**: Evaluar la integración opcional de un botón flotante de WhatsApp para consultas directas sin pasar por e-mail.
- [ ] **Métricas & Analytics**: Inyectar script ligero de analíticas (ej. Plausible o GA4) para medir conversiones de clics en "Ver demo" y formulario.

---
**Estado del Proyecto:** [SESSION_CLOSED_PROD_LIVE]












