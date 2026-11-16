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
> - Banco de Ideas & Refactorings: [.agent/workflows/ideas.md](.agent/workflows/ideas.md)

## [BACKLOG]

- [ ] **[TASK-067]** _(EN ESPERA por instrucción directa de Leo)_ Resolución final del enlace de pago en Checkout (`js/components/funnel_checkout_markup.js:87` — reemplazo de URL placeholder de Mercado Pago `https://mpago.la/pos/tucured` por enlace directo a WhatsApp comercial o link de pago activo antes del lanzamiento)

## [IN_PROGRESS]

*(Sin tareas en curso — Sesión cerrada)*

## [DONE]

- [x] **[TASK-079]** Aislamiento Estricto de Catálogo y Agenda por Rubro en Showroom, Turnero Autónomo y Consolas Admin (`admin_demo_seed.js`: semilla canónica `deportes` *"Complejo Deportivo & Pádel Norte"*, `resolveRubro` y `resetLevel` particionado; `showcase_state.js`: `normalizeShowroomRubro`, alineación de `options`/`catalogL3` en 5 rubros, particionado `tucu_${lvl}_services_${norm}` / `tucu_l3_services_${rMap[norm]}` y reseteo de `selectedOption`/`selectedStaff` en `setRubro`; `showcase_booking_sync.js`: mapeo `resto: 'gastronomia'` en `L3_RUBRO_MAP` y persistencia por rubro; `showcase_admin_preview.js`: URLs `slug=demo-${norm}&rubro=${norm}`; `turnero_catalog.js`, `ticket_portal.js`, `ticket_modal.js`, `admin_l1_*`, `admin_l2_*`, `admin_l3/admin_core.js`, `view_agenda.js`: particionado sin fuga cruzada y preservación de datos por rubro; `verify_task079`: `87/87 PASS`, regresiones `074`: `47/47`, `075`: `98/98`, `076`: `39/39`, `077`: `33/33`, `078`: `82/82` y paridad SHA-256 con `tucured-engine`) _(16/11/2026, 02:45:00)_
- [x] **[TASK-078]** Limpieza Ejecutiva de Consolas Admin (`L1`/`L2`/`L3`) y Semillas Multi-Rubro Completas (`admin_demo_seed.js`: 5 rubros dinámicos con marca, catálogo y agenda en `peluqueria`, `estetica`, `gastronomia`, `salud`, `servicios`; tarjetas con jerarquía limpia de 4 datos en primer plano y bloque colapsable `"Ver detalle"`/`"Ocultar"` en `admin_booking_engine.js`, `admin_l1_agenda.js`, `admin_l2_calendar.js` y `view_agenda.js`; purga de `"Ver Ticket Online"`, `"Enviar WhatsApp"` y `#btn-view-client-turnero` del sidebar en L1/L2/L3; `verify_task078`: `82/82 PASS`, regresiones `074`/`075`/`076`/`077` limpias y paridad SHA-256 con `tucured-engine`) _(16/11/2026, 02:45:00)_
- [x] **[TASK-077]** Modal In-Place de Ticket Online (`public/js/admin_shared/ticket_modal.js`, integrado en Showroom `index.html`/`showcase_mockup.js` y Turnero Autónomo `turnero.html`/`turnero_app.js` sin cambios de URL ni pestañas extra) y máquina real de estados y semántica visual (`Pendiente Seña` oculta `"Confirmar asistencia"` y muestra `"Informar transferencia realizada"` en verde esmeralda `bg-emerald-700`; `Confirmado` inmediato evita reconfirmación redundante; modo recordatorio `/t/:token` habilita `"Confirmar asistencia"` en verde esmeralda y reserva el rojo discreto para `"Cancelar turno"`; `verify_task077`: `33/33 PASS`, `074`: `47/47 PASS`, `075`: `98/98 PASS`, `076`: `39/39 PASS` y paridad SHA-256 con `tucured-engine`) _(16/11/2026, 02:45:00)_
- [x] **[TASK-076]** Refinamiento UX Post-Reserva: Eliminación de salidas a WhatsApp (`"Copia WhatsApp"`, `"Enviar por WhatsApp"`, `"Enviar comprobante por WhatsApp"` y enlaces `wa.me`), indicador de despacho automático por WhatsApp, navegación in-place `"Ver Ticket Online"` -> `/t/TK-XXXX` / `returnTo=showroom`, flujo de reporte de comprobante en portal (`depositReceiptReported`, `depositReceiptName`, `depositReceiptAt`, `input[accept="image/*,.pdf"]` + `"Informar transferencia realizada"`), soporte local `/t/*` en `vite.config.js` y retorno fluido `"Volver al Turnero"` (`verify_task076`: `39/39 PASS`, regresiones `074`/`075` limpias y paridad SHA-256 con `tucured-engine`) _(16/11/2026, 02:45:00)_
- [x] **[TASK-075]** Sincronización de Catálogo de Servicios en Turnero Autónomo de Cliente (`public/turnero.html`, `public/js/admin_shared/turnero_catalog.js`, `turnero_app.js`, CRUD L2 `admin_l2_services.js`, enlace `"Ver Turnero del cliente"` en L1/L2/L3 y selector de servicio activo en Showroom `L1`/`L2`/`L3` para los 5 rubros; verificado `98/98 PASS` y paridad SHA-256 con `tucured-engine`) _(16/11/2026, 02:45:00)_
- [x] **[TASK-074]** Certificación Pre-Lanzamiento Comercial & Verificación Móvil sobre `https://tucured.ar` (flujo completo Showroom -> `/t/TK-XXXX` -> Admin PIN 4 dígitos, auditoría headless iPhone SE `375x667`, 0 errores 404/JS, `47/47 PASS` y paridad SHA-256 con `tucured-engine`) _(16/11/2026, 02:45:00)_

---

**Estado del Proyecto:** [CONSOLIDATED_V11]
