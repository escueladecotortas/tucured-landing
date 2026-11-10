// Archivo: .agent/workflows/kanban.md
# Tablero Kanban Master v2.0 - tucured-landing

Estructura soberana de orquestación y seguimiento (Ventana Deslizante Activa).

> 📂 **Históricos Archivados & Banco de Ideas:**  
> - Hitos v1 (Fundación & Netlify Forms): [.agent/workflows/archive/kanban_history_v1.md](.agent/workflows/archive/kanban_history_v1.md)  
> - Hitos v2 (Transición & Videos MP4): [.agent/workflows/archive/kanban_history_v2.md](.agent/workflows/archive/kanban_history_v2.md)  
> - Hitos v3 (Hero Cinemático & Showroom Modular): [.agent/workflows/archive/kanban_history_v3.md](.agent/workflows/archive/kanban_history_v3.md)  
> - Hitos v4 (Hero Isométrico & Embudo Guiado): [.agent/workflows/archive/kanban_history_v4.md](.agent/workflows/archive/kanban_history_v4.md)  
> - Hitos v5 (Matriz v15/v16, Showroom 3 Zonas & Sanitización Admin L1): [.agent/workflows/archive/kanban_history_v5.md](.agent/workflows/archive/kanban_history_v5.md)  
> - Hitos v6 (Sincronización Git/Netlify, Experiencia Sensorial 4D & Descontaminación): [.agent/workflows/archive/kanban_history_v6.md](.agent/workflows/archive/kanban_history_v6.md)  
> - Banco de Ideas & Refactorings: [.agent/workflows/ideas.md](.agent/workflows/ideas.md)  

## [BACKLOG]
- [ ] **[TASK-066]** Auditoría integral de punta a punta de landing: recorrido secuencial desde menú ("Qué Incluye") hasta footer para afinar copys y cerrar detalles de conversión antes del lanzamiento comercial

## [IN_PROGRESS]

## [DONE]
- [x] **[TASK-065]** Construcción integral de Admin L3 Aura Light: erradicación total de la deuda visual dark en public/admin_l3.html y elevación al estándar Aura Light (fondos bg-slate-50, tarjetas blancas, bordes border-slate-200, tema light por defecto y toggle conmutador), modelado canónico y grilla multi-columna de Recursos Físicos (canchas de pádel/fútbol, consultorios médicos, boxes y sillones) vs. Staff Humano con alternancia interactiva y asignación dual en sobreturnos, telemetría visual en vivo del Daemon Cron barredor T-2hs (badge en topbar, inspección de turnos en ventana previa, contador de confirmados vs. liberados y simulación de barrido manual idempotente), arquitectura modular en 8 submódulos (< 180L estrictas: html: 134L, core: 168L, agenda: 175L, staff: 122L, resources: 101L, services: 153L, clients: 102L, telemetry: 97L, system: 159L), compuerta Argus 40/40 aprobada y build Vite 100% limpio *(10/11/2026, 02:25:00)*
- [x] **[TASK-064-C]** Saneamiento editorial de copys de venta (erradicación de jerga de programador en funnel_data.js, pricing.js, stage_value_zone.js y showcase_state.js; adopción de lenguaje de soluciones para clientes y panel de control del dueño), reemplazo de maqueta antigua de WhatsApp por Ticket Digital (#TK-71A0 con descarga de recordatorio .ics y autogestión en showcase_benefits.js), reparación de enlaces rotos en backoffice (admin_l2.html L39 redirige a /#showroom; admin_l2.html y admin_l3.html enlazan a /), Ley de < 180L cumplida en todos los archivos modificados, compuerta Argus 34/34 aprobada y build Vite 100% limpio *(10/11/2026, 01:58:00)*
- [x] **[TASK-064-B]** Refactor integral Turnero Autónomo L1 & Showroom Demo: paginación semanal reactiva (< y >) con horizonte de 14 días y salteo automático de domingos cerrados (solo días operativos hábiles), erradicación total de "Enviar a WhatsApp" y enlaces wa.me, flujo de conversión de 4 pasos canónicos (Horarios -> Datos -> Resumen de Confirmación -> Ticket Digital #TK-71A0 con descarga de recordatorio .ics y autogestión/cancelación en memoria), aislamiento estricto Sandbox Local-First, Ley de < 180L en todos los módulos (showcase_state: 158L, showcase_mockup: 155L, showcase_templates_l1: 116L, showcase_core: 96L, showcase_self_service_l2: 105L), compuerta Argus 38/38 aprobada y build Vite 100% exitoso *(06/11/2026, 13:10:00)*
- [x] **[TASK-064]** Rediseño UI/UX de admin_l1 y admin_l2: pulido de layout, tipografía, espaciados y consistencia visual hacia estándar Aura Light (fondos luminosos bg-slate-50, tarjetas blancas, bordes border-slate-200, tema light por defecto, modularización de admin_l2 en 5 submódulos < 180L, compuerta Argus 41/41 aprobada y build Vite 100% limpio) *(06/11/2026, 08:35:00)*
- [x] **[TASK-063]** Embebido Real por Iframe de /admin (L1, L2, L3) en Showcase Smartphone: erradicación de mockup estático, renderizado de <iframe> adaptativo (h-[540px] sm:h-[580px]) con spinner loader suave, mapeo dinámico de URLs (/admin_l1.html?slug=demo-peluqueria&embed=true, /admin_l2.html?slug=demo-central&embed=true, /admin_l3.html?slug=demo-staff&embed=true), aislamiento y layout CSS compacto en modo embebido sin márgenes externos ni botones de logout, conmutación instantánea cliente/dueño con audio 650Hz y haptics, y build Vite 100% limpio *(06/11/2026, 02:40:00)*

---
**Estado del Proyecto:** [CONSOLIDATED_V11]
