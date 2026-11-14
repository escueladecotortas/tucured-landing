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
> - Banco de Ideas & Refactorings: [.agent/workflows/ideas.md](.agent/workflows/ideas.md)

## [BACKLOG]

- [ ] **[TASK-067]** Resolución final del enlace de pago en Checkout (`js/components/funnel_checkout_markup.js:87` — reemplazo de URL placeholder de Mercado Pago `https://mpago.la/pos/tucured` por enlace directo a WhatsApp comercial o link de pago activo antes del lanzamiento)
- [ ] **[TASK-074]** Validación presencial en dispositivo móvil real sobre `https://tucured.ar` (flujo completo Showroom -> `/t/TK-XXXX` -> Admin PIN 4 dígitos)

## [IN_PROGRESS]

## [DONE]

- [x] **[DEPLOY-PROD]** Compuerta Pre-Commit, build Vite (`dist/` en 690ms, 35 módulos), push a `origin/master` y deploy a producción en Netlify (`https://tucured.ar`) con los hitos certificados `TASK-072` y `TASK-073` (PIN universal 4 dígitos, KPIs móviles, 3 plantillas WA, portal corto `/t/* -> gestion_turno.html` y sincronización en vivo Showroom -> Admin) _(14/11/2026, 02:02:00)_
- [x] **[TASK-073]** Circuito post-reserva completo: 3 plantillas WhatsApp `1A` (Con Seña), `1B` (Confirmada) y `2` (Recordatorio) con `{{cbu}}`, `{{alias}}`, `{{link_ticket}}` (`https://tucured.ar/t/:codigo`) y fecha natural sin `"el Mañana"` ni emojis (`admin_wa_templates.js`: 157L); redirección corta `/t/* -> /gestion_turno.html?token=:splat 200` en `_redirects` (preservando rutas Mamatila en Blueprint); portal Warm Studio unificado de autogestión (`gestion_turno.html`: 51L + `ticket_portal.js`: 159L) con scanner multi-nivel, copia de Alias/CBU, envío de comprobante, confirmación de asistencia (`clientConfirmed`) y cancelación inline reversible; conexión en vivo Showroom Paso 4 -> `localStorage` L1/L2/L3 y preview Admin (`showcase_booking_sync.js`: 118L, `showcase_core.js`: 98L, `showcase_mockup.js`: 168L, `showcase_admin_preview.js`: 44L); botones homologados `Ver Ticket Online` + `Enviar WhatsApp` y badge `Asistencia confirmada por cliente` en agendas L1/L2/L3 (`admin_booking_engine.js`: 177L, `admin_l1_agenda.js`: 167L, `admin_l2_calendar.js`: 142L, `admin_core.js`: 166L, `view_agenda.js`: 158L); paridad byte-exacta verificada en `C:\Users\leola\Downloads\tucured-engine\public\`, suite E2E `scripts/verify_task073_post_booking_circuit.js` (`49 PASSED / 0 FAILED`, 0 errores en consola) y build Vite (`dist/` en 1.05s, 35 módulos) _(14/11/2026, 01:55:00)_
- [x] **[TASK-072]** Refinamiento móvil (píldora interactiva `Turnero Abierto`/`Turnero Pausado`, 3 KPIs horizontales en 1 fila en L1/L2/L3, botón `[SVG] Reabrir turno` sin `\u21A9`, frame Showroom `710px/730px` con footer completo `Apariencia` + `Cerrar Sesión` sin recortes), PIN universal de 4 dígitos (`admin_pin_gate.js`) en L1/L2/L3 + Showroom embed con `Cerrar Sesión` reactivo, número demo `5493815551234` bloqueado (`readonly disabled`) + 2 plantillas WhatsApp editables con vista previa (`admin_wa_templates.js`), eliminación de advertencias `navigator.vibrate` / 404 `/api/portal/` en consola demo, auditoría diagnóstica del circuito post-reserva (`#TK` / `gestion_turno.html`), paridad byte-exacta en `tucured-engine` (18 archivos `<= 176L`, 0 emojis, 0 `indigo`) y suite Chrome Headless E2E `scripts/verify_task072_full_journey_e2e.js` (102/102 PASS, 0 errores consola) _(14/11/2026, 01:13:00)_
- [x] **[TASK-071]** Reversión explícita mobile-first (`Anterior: [PrevState]` + `↩ A [PrevState]` con toast), curado temporal estricto (fechas/horas locales en manual booking, sobreturno y `admin_demo_seed.js`), fix sidebar off-canvas móvil (`100dvh` + `nav min-h-0 flex-1 overflow-y-auto`), filtro de servicios pausados/eliminados en Admin (L1/L2/L3) y Turnero Showroom (`getActiveCatalogServices`), modal unificado L1 sin `window.prompt()` con duración `Personalizada (min)` (`5..480`), sonda WhatsApp (`WhatsApp: Modo Demo` / `/api/wa/status` con `AbortController` 2500ms sin errores 404 en consola), soft-delete universal (`deletedAt`) + trazabilidad `priceHistory`, Feriados Nacionales dinámicos por año (`admin_holidays.js`: `api.argentinadatos.com/v1/feriados/${year}` + caché `localStorage` + fallback), paridad byte-exacta en `tucured-engine` (25 archivos `<= 179L`), y suites verificadas en Chrome Headless (`verify_task071`: 141/141, `verify_task070`: 189/189, `verify_task069`: 106/106, `verify_headless_cdp_consoles`: 6/6, `verify_task065`: 40/40, `verify_task063`: 35/35, `verify_saneamiento`: 34/34) _(13/11/2026, 23:20:30)_
- [x] **[TASK-070]** Implementación de máquina de estados (5 estados canónicos sin "En Atención" + botón Deshacer y erradicación de deleteBooking), cobro dinámico de señas y medios de pago activos (admin_booking_engine.js: 160L), mini-base de práctica local-first con Restaurar Datos Demo (admin_demo_seed.js: 70L) y sincronización total byte-exacta con Blueprint tucured-engine (25 archivos sincronizados, verify_task070: 189/189 PASS) _(13/11/2026, 18:45:00)_

---

**Estado del Proyecto:** [CONSOLIDATED_V11]
