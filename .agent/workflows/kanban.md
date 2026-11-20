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
> - Banco de Ideas & Refactorings: [.agent/workflows/ideas.md](.agent/workflows/ideas.md)

## [BACKLOG]

- [ ] **[TASK-102]** [Comercial / PR] Lanzamiento `@tucured.ar` & Prospección: redactar y publicar las primeras 3 piezas de grilla en Instagram (`@tucured.ar`), iniciar prospección inicial en San Miguel de Tucumán / Yerba Buena y enviar mensaje PR a Rubén Orlando.

## [IN_PROGRESS]

- [ ] **[TASK-101]** Completar DNS Cloudflare (`tucured.com.ar`) + Túnel HP Mini (`192.168.100.27`) + Baileys Oficial: verificar propagación de Nameservers (`Active`), configurar redirección `301` de `tucured.com.ar` hacia `https://tucured.ar`, enlazar `*.tucured.com.ar` y `api.tucured.com.ar` vía Cloudflare Tunnel y vincular la línea oficial de Tucu Red en Baileys (bienvenidas post-Wizard con link prellenado a `/activar.html` + alertas a Leo).

## [DONE]

- [x] **[TASK-100]** Pulir Ficha Rápida de Configuración v2 (`public/activar.html` + `public/activar-ok.html` + `public/js/activar/*` + `js/utils/whatsapp_link.js`): prefill completo desde Wizard (`9` params + fallback `localStorage['local_db_wizard']`), autocompletado Photon/OSM (`activar_geo.js` `157L`), carga y conversión automática `<canvas>` a WebP (`activar_logo.js` `127L`), grilla independiente de 7 días con `"Copiar Lunes a Mar–Vie"` (`activar_schedule.js` `141L`), Bloque 5 dinámico por plan y rubro con badge de plan bloqueado (`activar_markup.js` `143L`), envío `FormData` multipart ordenado (`form-name`, `name` estándar Netlify/Akismet, sin `bot-field` vacío, `logo_archivo` al final) hacia `/` con centinela `NETLIFY_FORM_ACCEPTED` y bloqueo anti falso-200 (`activar_app.js` `172L`). Commits `c26836d`, `17ef9c5`, `3d794ed` en `origin/master`; suite `scripts/verify_task100_activar_v2.js` (`166L`): `52/52 PASS | FAIL=0` en `375x667` y `1280x800` (Ley `<200L`); prueba real en producción (`20/11/2026 19:44`): Verified submission en Netlify Forms (`ficha-activacion-tucured`), logo `.webp` alojado y accesible, notificación por email recibida en `agenciatucured@gmail.com`. _(20/11/2026, 19:52:00)_

- [x] **[TASK-099]** Ficha Rápida Online de Configuración (`https://tucured.ar/activar.html`) & Netlify Forms `ficha-activacion-tucured` (`public/activar.html` `93L` Warm Studio con formulario estático 26 campos + prefill URL, `public/js/activar/activar_data.js` `93L`, `activar_markup.js` `117L` con 5 bloques operativos responsivos, `activar_app.js` `152L` con filas dinámicas, horario partido, validación inline, E.164, POST AJAX y CTA WhatsApp `"Avisar por WhatsApp que completé mi ficha"`, `js/utils/whatsapp_link.js` `62L`, `funnel_checkout_markup.js` `108L`, `funnel.js` `165L` con enlace directo `#success-activar-link`, `scripts/verify_task099_activar_ficha.js` `120L`: `vite build` `785ms`, `verify_task099`: `34/34 PASS`, `verify_task097`: `61/61 PASS` con `FAIL=0` en `375x667` y `1280x800`). _(19/11/2026, 01:49:30)_
- [x] **[TASK-098]** Blindaje de Detección & Envío AJAX Netlify Forms (`contacto-tucured`) (`index.html` `80L` con `<form name="contacto-tucured" method="POST" data-netlify="true" netlify-honeypot="bot-field" hidden>`, `<input type="hidden" name="form-name" value="contacto-tucured" />`, `bot-field` y 10 campos; `js/components/funnel_checkout_markup.js` `107L` con `#funnel-step4-error`; `js/components/funnel.js` `164L` con `buildNetlifyBody`, validación `!res.ok` y reporte visible de error de red; `vite build` `802ms`, `DIST_NETLIFY_FORM_VERIFIED:16/16`, regresión `verify_task097`: `61/61 PASS | FAIL=0` y prueba POST en producción sobre `https://tucured.ar/`). _(19/11/2026, 01:28:30)_
- [x] **[TASK-097]** Corrección 10 Hallazgos Móviles Reales (`https://tucured.ar`), Calendario RFC 5545 + Google Calendar, Comprobante Obligatorio Ticket, Wizard Final Limpio & Términos (`public/js/admin_shared/calendar_links.js` `87L` `.ics` CRLF/`METHOD:PUBLISH`/`UID`/`DTSTAMP` + Google Calendar, `ticket_modal.js` `161L` + `ticket_portal.js` `164L` con `#btn-report-receipt` deshabilitado sin archivo, `showcase_core.js` `148L` + `showcase_mockup.js` `169L`, `features.js` `94L`, `funnel_data.js` `77L`, `pricing.js` `165L`, `stage_value_zone.js` `142L`, `whatsapp_link.js` `48L`, `funnel_checkout_markup.js` `105L` Paso 4 apilado en `375px` y pantalla final sin links/`Local-First`, `funnel.js` `165L`, `funnel_markup.js` `171L`, `footer.js` `57L`, `public/terminos.html` `78L`, `public/gestion_turno.html` `53L`, `public/turnero.html` `50L`, `index.html` `78L`, `scripts/verify_task097_mobile_audit_fixes.js` `161L`: paridad SHA-256 100% con `tucured-engine`, `vite build` `1.26s`, `verify_task097`: `61/61 PASS`, `verify_task090`: `51/51 PASS`, `verify_task091`: `78/78 PASS`, `verify_task096`: `16/16 PASS` con `FAIL=0`). _(19/11/2026, 00:26:30)_
- [x] **[TASK-096]** Ajustes Finales Recorrido Móvil: FAQ Calendario Android/iPhone sin tecnicismos, Filtro Consulta Previa WhatsApp (`#faq-wa-query` + `#btn-faq-wa-send`) & Copy Móvil Mercado Pago (`js/components/faq_accordion.js` `130L`, `js/components/funnel_checkout_markup.js` `107L`, `scripts/verify_task096_faq_wa_filter_and_mp_copy.js` `120L`: Pregunta 2 sin `.ics` con texto compatible Android/iPhone, validación inline `#faq-wa-error` al enviar vacío y apertura `wa.me/5493814132154?text=...` en nueva pestaña, copy móvil Mercado Pago actualizado en Paso 4; `vite build` `748ms`, `verify_task096`: `16/16 PASS | FAIL=0` en `375x667` y `1280x800` con `0` errores JS/HTTP ni overflow). _(18/11/2026, 22:52:00)_
- [x] **[TASK-095] [DESCARTADA]** Fallback Manual de WhatsApp en UI Demo — Cancelada por decisión de producto de Leo: la demo de la landing debe mostrar siempre la experiencia automática principal sin banners ni botones de contingencia. _(18/11/2026, 22:21:00)_

---

**Estado del Proyecto:** [CONSOLIDATED_V11]
