// Archivo: .agent/workflows/kanban.md

# Tablero Kanban Master v2.0 - tucured-landing

Estructura soberana de orquestación y seguimiento (Ventana Deslizante Activa).

> 📂 **Históricos Archivados & Banco de Ideas:**
>
> - Hitos v1 (Fundación & Netlify Forms): [.agent/workflows/archive/kanban_history_v1.md](.agent/workflows/archive/kanban_history_v1.md)
> - Hitos v2 (Transición & Videos MP4): [.agent/workflows/archive/kanban_history_v2.md](.agent/workflows/archive/kanban_history_v2.md)
> - Hitos v3 (Hero Cinemático & Showroom Modular): [.agent/workflows/archive/kanban_history_v3.md](.agent/workflows/archive/kanban_history_v3.md)
> - Hitos v4 (Hero Isométrico & Embudo Guiado): [.agent/workflows/archive/kanban_history_v4.md](.agent/workflows/archive/kanban_history_v4.md)
> - Hitos v5 (Matriz v15/v16, Showroom 3 Zonas & Sanitización Admin L1): [.agent/workflows/archive/kanban_history_v5.md](.agent/workflows/archive/kanban_history_v5.md)
> - Hitos v6 (Sincronización Git/Netlify, Experiencia Sensorial 4D & Descontaminación): [.agent/workflows/archive/kanban_history_v6.md](.agent/workflows/archive/kanban_history_v6.md)
> - Hitos v7 (Auditoría Landing, Consola L3 & Unificación Warm Studio v2): [.agent/workflows/archive/kanban_history_v7.md](.agent/workflows/archive/kanban_history_v7.md)
> - Hitos v8 (PIN Universal, Circuito Post-Reserva WA & Semillas v1): [.agent/workflows/archive/kanban_history_v8.md](.agent/workflows/archive/kanban_history_v8.md)
> - Hitos v9 (Nivelación L1/L2/L3, CRM `\mamatila`, Feriados 2026 & Checkout): [.agent/workflows/archive/kanban_history_v9.md](.agent/workflows/archive/kanban_history_v9.md)
> - Hitos v10 (Marca Propuesta A, Wizard 6 Rubros, Foto Servicios & Producción tucured.ar): [.agent/workflows/archive/kanban_history_v10.md](.agent/workflows/archive/kanban_history_v10.md)
> - Hitos v11 (Turnero V2, Portadas Vivas, Showroom V2 & Modularización Admin L1/L2/L3): [.agent/workflows/archive/kanban_history_v11.md](.agent/workflows/archive/kanban_history_v11.md)
> - Banco de Ideas & Refactorings: [.agent/workflows/ideas.md](.agent/workflows/ideas.md)

## [BACKLOG]

- [ ] **[TASK-102]** [Comercial / PR] Lanzamiento `@tucured.ar` & Prospección: redactar y publicar las primeras 3 piezas de grilla en Instagram (`@tucured.ar`), iniciar prospección inicial en San Miguel de Tucumán / Yerba Buena y enviar mensaje PR a Rubén Orlando.
- [ ] **[TASK-115]** Vencimiento automático de ventana de seña (Fase 3 Backend/BFF).
- [ ] **[TASK-113B]** Wizard `/empezar.html` (División compra vs. configuración + 4 tonos de voz + galería de 12 portadas vivas).

## [IN_PROGRESS]

_Sin tareas activas en curso (`120/123` completadas — 97.6%)._

## [DONE]

- [x] **[TASK-112G]** Bloqueos Modulares L3 (`admin_blocks_ui.js` `85L` + `view_system.js` `162L` `< 165L` + `admin_l3.html` `76L` `< 95L`), Limpieza Copy Showroom (`showcase_admin_ui.js` `113L`, remoción de `Módulos enchufables a medida` / `Mercado Pago`), Consolidación Documental (`.agent/audit/audit_features_l1_l2_l3.md` `40L` como SSOT y eliminación de `.agent/specs/turneros_v15_matrix.md`), paridad SHA-256 `3/3 MATCH (100%)` con `tucured-engine`, `vite build` (`756ms`) + `scripts/verify_task112g_release_close.js` (`139L`): `16/16 PASS | FAIL=0` (`375x667`, `600x760`, `1280x800`), push producción `tucured-landing` (`ee53f54`) + `tucured-engine` (`487d025`) y deploy Netlify `https://tucured.ar/` HTTP `200`. *(23/11/2026, 05:15:30)*
- [x] **[TASK-112F]** Módulo Compartido de Horarios Semanales (`admin_weekly_schedule.js` `126L`) en L1/L2/L3 tomando L2 como Template: extracción de `window.TucuWeeklySchedule` con 1 columna responsiva `< 1280px` y campos `min-w-0` (`0` recorte en `375px`/`600px`/`1280px`), conexión arriba de `Feriados Nacionales 2026` en Tab 2 (`Horarios & Feriados`) de `public/admin_l1.html` (`183L`) + `admin_l1_config.js` (`154L`), `public/admin_l2.html` (`175L`) + `admin_l2_schedule.js` (`75L`) y `public/admin_l3.html` (`76L`) + `view_system.js` (`194L`, persistencia en `tucu_l3_schedule*` y `state.config.schedule`); paridad SHA-256 `7/7 MATCH (100%)` con `tucured-engine`; `vite build` (`694ms`) + `scripts/verify_task112f_shared_schedule.js` (`127L`): `29/29 PASS | FAIL=0` (incluyendo `Clonar Lun a Vie` y persistencia tras recarga en L1/L2/L3). *(23/11/2026, 04:45:44)*
- [x] **[TASK-112E]** Configuración en 3 Pestañas Unificada (`Negocio & Pagos`, `Horarios & Feriados`, `WhatsApp & Mensajes`) en L1/L2/L3 + Limpieza Sidebar L3: barra `#config-tabs-bar` unificada con `.tucu-quick-strip` y `.tucu-chip` en `public/admin_l1.html` (`186L`) / `admin_l1_config.js` (`181L`), `public/admin_l2.html` (`178L`) / `admin_l2_config.js` (`131L`) y `public/js/admin_l3/view_system.js` (`189L`, preservando `activeConfigTab`, `#cfg-biz-coords` en Tab 1 y Feriados 2026 + Bloqueos en Tab 2); remoción de `#cron-telemetry-badge` redundante encima de `Apariencia` en `.admin-sidebar-footer` y reubicación compacta dentro de `#l3-reception-card` debajo de `#wa-status-pill` sincronizada con `Confirmación 2 hs: Activo|Pausado` (`public/admin_l3.html` `76L`, `view_telemetry.js` `81L`, `admin_core.js` `180L`); paridad SHA-256 `8/8 MATCH (100%)` con `tucured-engine`; `vite build` (`796ms`) + `scripts/verify_task112e_config_tabs_sidebar.js` (`148L`): `34/34 PASS | FAIL=0` (Desktop `1280x800` y Mobile `375x667`). *(23/11/2026, 04:27:03)*
- [x] **[TASK-113A]** Landing en 2 Secciones (`#showroom-cliente` Turnero Único + `#showroom-admin` Paneles de Dueño) + Renombre Global (`Esencial` / `Gestión` / `Equipos`): refactor modular del Showroom (`showcase_state.js` `130L`, `showcase_v2_ui.js` `122L`, `showcase_admin_ui.js` `119L`, `showcase_controller.js` `120L`, `showcase_modal_mobile.js` `88L`, `stage_unified.js` `14L`), toggle opcional `clientMultiStaff` (`l1`/`l3`), sincronización de rubro y paleta hacia `/admin_l1.html`/`admin_l2.html`/`admin_l3.html`, mención de módulos enchufables y eliminación completa de `Autónomo`/`Central Pro`/`Multi-Staff`/`Ticket Online`/`pase`/`ticket` y `font-mono` en `index.html`, `pricing.js`, `faq_accordion.js`, `features.js`, `funnel*.js`, `hero_markup.js`, `navbar.js` y `whatsapp_link.js`; `vite build` (`639ms`) + `scripts/verify_task113a_landing_two_sections.js` (`178L`): `16/16 PASS | FAIL=0` (Desktop `1280x800` y Mobile `375x667`). *(23/11/2026, 04:05:00)*
- [x] **[TASK-112D]** Normalización Modular Final `/admin` L1/L2/L3: Coordenadas (`#cfg-biz-coords` debajo de Dirección en L1/L2/L3), Módulo Feriados Nacionales 2026 único e independiente sin checkbox maestro (`admin_holidays.js` `178L`), Sidebar 100% uniforme (`.tucu-sidebar-item`, `admin_unified.css` `174L`) con menú L3 neutro (`Personal`, 0 `"Barberos"`), fixes móvil L3 en Servicios en tarjetas `.tucu-card` (`view_services.js` `166L`), Personal modal `2do T.` sin solapamiento (`view_staff.js` `148L`), Confirmación 2 hs apilada con historial en tarjetas móviles (`view_telemetry.js` `79L`) y fix overflow móvil en Manual (`admin_manual_viewer.js` `108L`), 16 archivos sincronizados SHA-256 `16/16 MATCH (100%)` con `tucured-engine`, `vite build` OK (`867ms`) y `scripts/verify_task112d_admin_mobile_parity.js` (`150L`): `39/39 PASS | FAIL=0`. *(23/11/2026, 03:55:00)*

---

**Estado del Proyecto:** [CONSOLIDATED_V11]
