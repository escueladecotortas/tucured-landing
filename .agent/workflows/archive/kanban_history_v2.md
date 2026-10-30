// Archivo: .agent/workflows/archive/kanban_history_v2.md
# Histórico de Tareas Kanban v2 - tucured-landing

## [DONE] - Hitos Archivados (Transición & Videos MP4)

- [x] **[TASK-015]** Inyección de Telemetría Google Analytics 4 (`G-BBB4N4TG4S`) en `index.html` *(29/10/2026)*
  - [x] Insertar script oficial `gtag.js` (`G-BBB4N4TG4S`) con `cookie_domain: 'auto'` antes de `</head>`
  - [x] Auditar cumplimiento estricto de la Ley de < 200 líneas (`188 líneas` totales en `index.html`)
  - [x] Validar compilación limpia del bundle de producción en `dist/` mediante `npm run build`
- [x] **[TASK-013]** Purga Quirúrgica de Residuos y Sincronización con Nexus OS v10.0 *(16/08/2026, 03:13:00)*
  - [x] Purgar archivo duplicado en raíz (tucu_red_logo_full.svg)
  - [x] Erradicar directorios vacíos y logs estáticos (frontend/, backend/, bitacora/)
  - [x] Desacoplar clonados obsoletos de system_core/
  - [x] Validar compilación limpia y bundle en producción con Vite 5 (npm run build)
  - [x] Sincronizar y respaldar repositorio en GitHub (escueladecotortas/tucured-landing en master)
- [x] **[TASK-INIT]** Instanciación Limpia de Ecosistema v10.0
  - [x] Crear estructura base e inyectar especificaciones.md
  - [x] Configurar Kanban Master v2.0
- [x] **[TASK-014]** Escalado y Zoom Proporcional de Video Turnero (`css/styles.css` & `js/simulators.js`)
  - [x] Inyectar contenedor `video-zoom-box` con `overflow: hidden;` en reproductores de demo
  - [x] Aplicar `transform: scale(1.38)` (desktop) y `transform: scale(1.48)` (mobile) a `.video-turnero` para eliminar franjas negras muertas
  - [x] Compilar bundle (built in 302ms) y re-desplegar a producción en Netlify con verificación HTTP 200 OK
- [x] **[TASK-013]** Optimización de Tamaño de Video y Re-importación Eventos 720p (`css/styles.css`)
  - [x] Re-importar Eventos 720p (`eventos.mp4`) a assets, public y dist
  - [x] Ampliar max-width del modal-card a 680px y max-height del video a 74vh (76vh en mobile)
  - [x] Compilar bundle y re-desplegar a producción Netlify con verificación HTTP 200 OK
- [x] **[TASK-012]** Fix Header Mobile & Activación Demo Eventos (`css/styles.css` & `index.html`)
  - [x] Ajustar padding, font-size y ocultar subtítulo span en mobile para encaje perfecto
  - [x] Activar botón "Ver demo" en tarjeta 4 (Eventos e Invitaciones QR) vinculado al modal con selector doble
  - [x] Compilar bundle (built in 356ms) y re-desplegar a producción en Netlify (`https://tucured.ar`)
- [x] **[TASK-011]** Integración de Assets 720p & Selector Cliente/Admin (`js/simulators.js`)
  - [x] Importar los 5 videos optimizados en 720p (turnero, catalogo, catalogo_admin, eventos, eventos_admin)
  - [x] Inyectar selector de pestañas doradas minimalistas (Vista Cliente / Panel Admin) en modales
  - [x] Re-despliegue a Netlify con 11 archivos y verificación HTTP 200 OK en `catalogo_admin.mp4`
- [x] **[TASK-010]** Corrección Urgente de Videos .MP4 a Producción (`dist/assets/demos/`)
  - [x] Copiar videos .mp4 a public/assets/demos/ y dist/assets/demos/
  - [x] Re-despliegue forzado a Netlify produciendo 9 archivos procesados en CDN
  - [x] Verificación directa HTTP 200 OK del video `https://tucured.ar/assets/demos/turnero.mp4`
- [x] **[TASK-009]** Despliegue a Producción en Netlify (tucured.ar) (`netlify.toml`)
  - [x] Compilar bundle de producción `dist/` mediante Vite (built in 324ms)
  - [x] Desplegar a producción vía Netlify CLI vinculado al sitio `tucured` (`691c2f2f-f725-4abe-bea4-56372cb4e95e`)
  - [x] Verificación HTTP 200 OK en directo sobre la URL oficial `https://tucured.ar`
- [x] **[TASK-008]** Limpieza Final de Botones y Reproductores de Demo (`js/simulators.js`)
  - [x] Configurar botón único "Ver demo" en tarjetas 1, 2 y 3 y "Consultar" en tarjeta 4
  - [x] Eliminar marquetes phone-frame extras y bloques redundantes de texto inferior
  - [x] Renderizado de video .mp4 nítido a tamaño completo adaptativo en modales
- [x] **[TASK-007]** Cerrado Rápido & Optimización de Demos Pre-Reunión (`assets/demos/`)
  - [x] Copiar videos de demos (turnero.mp4, catalogo.mp4, eventos.mp4) a ./assets/demos/
  - [x] Vincular botones "Consultar" con desplazamiento suave y pre-selección en formulario
  - [x] Validar compilación limpia y renderizado instantáneo en marco móvil
