// Archivo: .agent/audit/audit_features_l1_l2_l3.md
# 🛡️ INVENTARIO MAESTRO DE FUNCIONALIDADES VIGENTES (L1, L2, L3)
**Nexus OS v11.1 — Protocolo PEAC de Auditoría Forense (Cierre Post TASK-084)**  
**Fecha de Emisión:** 16 de Noviembre de 2026  
**Auditores del Enjambre:** `@Codi` (Ingeniería) • `@Kael` (Integridad & Paridad) • `@Argus` (Gatekeeper QA)  
**Alcance Auditado en Disco:** `public/turnero.html`, `public/gestion_turno.html`, `public/admin_l1.html`, `public/admin_l2.html`, `public/admin_l3.html`, `public/js/admin_shared/*`, `public/js/admin_l1/*`, `public/js/admin_l2/*`, `public/js/admin_l3/*` y `js/showcase_v11/*`.

---

## 📊 1. RESUMEN EJECUTIVO DE COBERTURA (100% OPERATIVO EN DISCO)

| Nivel de Producto | Prometido | Construido en Disco | Estética & UX | Paridad `tucured-engine` |
| :--- | :---: | :---: | :--- | :---: |
| **L1: Profesional Independiente** | 100% | **100% Operativo** | Warm Studio / Aura Light + Tema Día/Noche | ✅ SHA-256 Certificado |
| **L2: Central Pro Multi-Box** | 100% | **100% Operativo** | Warm Studio / Aura Light + Tema Día/Noche | ✅ SHA-256 Certificado |
| **L3: Multi-Staff & Recursos** | 100% | **100% Operativo** | Warm Studio / Aura Light + Tema Día/Noche | ✅ SHA-256 Certificado |

- **Estado de Brechas Históricas:** 0 enlaces rotos (404 erradicados), 0 menciones expuestas a tecnicismos internos en UI comercial, paridad funcional y documental completa hasta `TASK-084`, y compliance estricto con la Ley de 200 Líneas.

---

## 🌐 2. DIFERENCIALES TRANSVERSALES DEL ECOSISTEMA (COMUNES A L1, L2 Y L3)

### 2.1 Multi-Rubro con Aislamiento Estricto por Rubro (`admin_demo_seed.js`, `showcase_state.js`, `turnero_catalog.js`)
- Soporte nativo para **6 rubros canónicos** con identidad, subtítulo, dirección y catálogo propios: `peluqueria` (`barberia`), `estetica` (`peluqueria_estetica`), `gastronomia` (`resto`), `salud` (`salud_consultorio`, con selector condicional de Obra Social/Cobertura), `servicios` y `deportes` (`deportes_clubes`).
- **Particionado estricto en `localStorage`:** Todas las claves críticas (`tucu_${lvl}_services_${rubro}`, `tucu_${lvl}_bookings_${rubro}`, `tucu_${lvl}_biz_name_${rubro}`, `tucu_${lvl}_address_${rubro}`, `tucu_${lvl}_alias_${rubro}`, `tucu_${lvl}_cbu_${rubro}`, `tucu_${lvl}_holidays_state_${rubro}`) se almacenan aisladas por nivel y rubro para garantizar cero contaminación cruzada al alternar demos.

### 2.2 Turnero Autónomo en 3 Pasos + Showroom Interactivo (`turnero.html`, `turnero_app.js`, `showcase_v11/*`)
- **Turnero Autónomo (`/turnero.html`):** Flujo móvil sin contraseñas en **3 pasos + Paso 4 de confirmación**:
  1. *Paso 1 (Servicio):* Lista de prestaciones activas ordenadas por `order`, con precio, duración (`min`) y badge dinámico `Seña $X` o `Sin seña previa`.
  2. *Paso 2 (Fecha y Horario):* Selector de profesional/recurso (en L2/L3), días hábiles futuros y franjas libres filtradas en tiempo real contra feriados activos, vacaciones, horarios pasados (`AdminShell.filterFutureSlots`), bloqueos manuales y turnos existentes.
  3. *Paso 3 (Confirmar Reserva):* Resumen con dirección del local, Nombre, WhatsApp numérico y Obra Social (solo Salud).
  4. *Paso 4 (Ticket Generado):* Código hash `#TK-XXXX`, ruta corta `/t/TK-XXXX`, aviso de despacho automático por WhatsApp y botón in-place `"Ver Ticket Online"`.
- **Showroom Interactivo (`showcase_mockup.js`, `showcase_core.js`):** Flujo en vivo de 4 pasos (Servicios/Fecha/Hora $\rightarrow$ Datos $\rightarrow$ Resumen $\rightarrow$ Ticket) con descarga de evento `.ics` para calendario local (`addToCalendar`) y botón `"Ver Tu Panel de Dueño"`.

### 2.3 Ticket Online In-Place (`ticket_modal.js`), Portal `/t/:token` (`gestion_turno.html`, `ticket_portal.js`) & Máquina de 5 Estados (`admin_booking_engine.js`)
- **Ticket Online In-Place + Standalone:** Apertura superpuesta `TucuTicketModal` desde Showroom y Turnero sin pérdida de contexto, más acceso directo por URL corta `/t/TK-XXXX` o `/gestion_turno.html?token=TK-XXXX` (con buscador de código y retorno inteligente `Volver al Turnero`).
- **Carga y Reporte de Comprobante:** Selector `<input type="file" accept="image/*,.pdf">` y botón `"Informar transferencia realizada"` que guarda `depositReceiptReported`, `depositReceiptName` y `depositReceiptAt` sincronizados con el panel del comercio.
- **Máquina Unificada de 5 Estados Canónicos:**
  1. `PENDING_DEPOSIT` (`pendiente` en L1): *Pendiente Seña* — muestra alias/CBU copiables y carga de comprobante.
  2. `CONFIRMED` (`confirmado` en L1): *Confirmado / Reserva Confirmada* — distingue confirmación inmediata post-reserva de confirmación de asistencia vía recordatorio (`clientConfirmed`).
  3. `COMPLETED` (`finalizado` en L1): *Finalizado* — turno atendido y contabilizado en KPIs.
  4. `CANCELLED` (`cancelado` en L1): *Cancelado* — libera inmediatamente el horario en Turnero/Showroom y guarda `prevStatus`.
  5. `NO_SHOW` (`ausente` en L1): *Ausente* — marca inasistencia para trazabilidad.
- **Reversión Explícita (`undoTransition`):** Botón `"Reabrir turno"` en L1, L2 y L3 que restaura `prevStatus`, `prevDepositPaid`, `prevPaymentMethod` y `prevPaidAt`.

### 2.4 Cobro de Seña Directo al Alias del Comercio (Sin Intermediarios)
- El dinero ingresa 100% directo a la cuenta del comercio sin pasarelas ni comisiones retenidas:
  - Toggle global `Exigir Seña Web`, cálculo en `% Porcentaje` o `$ Monto Fijo`, campos `Alias` y `CBU / CVU` (22 dígitos) con copiado en 1 clic, medios habilitados configurables (`Efectivo`, `Transferencia / Alias`, `Mercado Pago`, `Tarjeta Débito / Crédito`) y selector `openPaymentPicker` al acreditar seña en el panel.

### 2.5 Toggles Individuales de Seña, Duración Flexible e Historial de Precios por Servicio
- En L1 (`admin_l1_pricing.js`), L2 (`admin_l2_services.js`) y L3 (`view_services.js`): checkbox por servicio `Exige seña web` (`requireDeposit`, mostrando badge `Sin seña` en admin y Turnero), selector de duración (`15`, `30`, `45`, `60`, `90 min` o **personalizada de 5 a 480 min**), orden manual (`order`) e **historial auditable de precios** (`priceHistory` con modal `showPriceHistory`).

### 2.6 Plantillas Estructuradas de WhatsApp & Vinculación QR vía Baileys (`admin_wa_templates.js`)
- **3 Plantillas Multilínea Editables:** `1A — Reserva con Seña`, `1B — Reserva Confirmada sin Seña` y `2 — Recordatorio Previo (24 hs / 2 hs)` con vista previa en vivo, migración automática de formatos legacy y **12 variables**: `{{cliente}}`, `{{comercio}}`, `{{direccion}}`, `{{servicio}}`, `{{fecha}}`, `{{hora}}`, `{{codigo}}`, `{{sena}}`, `{{porcentaje}}`, `{{alias}}`, `{{cbu}}`, `{{link_ticket}}`.
- **Vinculación QR Baileys & Sonda de Estado:** Modal con **QR SVG inline autónomo** (sin dependencias externas) y sonda `AdminShell.probeWhatsAppStatus` (`/api/wa/status` en producción, modo demo en local), presentando copy comercial limpio (`"WhatsApp"` / `"Vinculación QR de WhatsApp"`).

### 2.7 Dirección del Local End-to-End, Feriados 2026 con Excepción & Importador de Contactos `\mamatila`
- **Dirección Física (`#cfg-biz-address`):** Editable por rubro en L1, L2 y L3; se propaga en vivo al header y Paso 3 del Turnero, Ticket Modal/Portal, evento `.ics` y variable `{{direccion}}` de WhatsApp.
- **Excepción de Feriados (`admin_holidays.js`):** Catálogo anual 2026 de **16 feriados en 11 meses** (`api.argentinadatos.com` + fallback offline). Cada fecha inicia bloqueada por defecto con toggle individual `Bloqueado / Abierto` (`tucu_${level}_holidays_state_${rubro}`) reflejado al instante en Turnero y Showroom.
- **Motor de Contactos `\mamatila` (`admin_contacts_parser.js`, `admin_contacts_manager.js`):** Normalización internacional **E.164 (`+549381...`)**, importación directa desde la agenda del smartphone vía **Contact Picker API** (`navigator.contacts.select`), carga de archivos `.vcf` / `.csv`, deduplicación sin sobrescribir nombres manuales, ingesta desde reservas, buscador NFD y baja lógica.

### 2.8 Seguridad PIN, Baja Lógica Universal & Manual de Uso Interactivo
- **Acceso & Recepción (`admin_pin_gate.js`, `admin_shell.js`):** Compuerta PIN táctil/teclado de 4 dígitos, switch `Recepción Web` (`Turnero Abierto / En Pausa`) sincronizado desktop/móvil y modal de confirmación `AdminShell.confirmAsync` para baja lógica (`deletedAt`) en servicios, staff, recursos, categorías, bloqueos, vacaciones, CRM y contactos.
- **Manual de Uso Interactivo (`admin_manual_viewer.js`, `admin_manual_data_l1/l2/l3.js`):** Pestaña dedicada en L1, L2 y L3 con índice lateral, pasos numerados, contador de secciones activas y buscador NFD insensible a tildes con resaltado `<mark>`.

---

## ⚖️ 3. MATRIZ COMPARATIVA EXACTA DE FUNCIONALIDADES EXCLUSIVAS POR NIVEL

| Capacidad / Eje Operativo | Nivel 1: Profesional Independiente | Nivel 2: Local Multi-Box / Canchas / Gabinetes | Nivel 3: Clínica / Salón Multi-Staff |
| :--- | :--- | :--- | :--- |
| **Archivos Consola Backoffice** | `admin_l1.html` + `public/js/admin_l1/*` | `admin_l2.html` + `public/js/admin_l2/*` | `admin_l3.html` + `public/js/admin_l3/*` |
| **Vistas de Consola** | 4: Agenda, Catálogo, Configuración, Manual | 5: Agenda, Catálogo, CRM & Contactos, Config (3 tabs), Manual | 8: Agenda Dual, Staff, Recursos, Servicios, Contactos & CRM, Telemetría Cron, Config, Manual |
| **Modelo de Atención** | Monopuesto / 1 profesional único | Local centralizado / primer turno libre / Pax | **Multi-Staff + Recursos Físicos desacoplados** |
| **KPIs en Tiempo Real** | 3: Turnos Programados, Señas Acreditadas, Tasa Asistencia | 4: Confirmados, Señas, Cancelados/Ausentes, **% Ocupación** | 4 + 3 CRM: Turnos, Señas vs Esperados, Confirmados, Finalizados/Ausentes + Clientes/VIP/Facturado |
| **Filtros Agenda & Vistas** | `Hoy`, `Semana`, `Mes`, `Rango` + 5 estados + buscador | `Hoy`, `Semana`, `Mes`, `Todos`, `Rango`, fecha puntual + 5 estados | **Grilla Multi-Columna / Tabla**, toggle **Por Especialista / Por Recurso**, `Hoy`/`Semana`/`Mes`/`Todos`/`Rango` |
| **Carga de Turnos Mostrador** | Modal `Nueva Cita Manual` (servicio, fecha/hora, pago) | Modal `Nuevo Turno Manual` con selector de **Pax** y servicio | Modal **`Sobreturno Dual`** (Especialista + Recurso Físico + Servicio + Pago) |
| **Horarios y Bloqueos** | Grilla semanal 7 días + `Clonar Lun a Vie` + switch feriados | Grilla corrido/partido + **Feriados 2026 por mes** + **Vacaciones por rango** + **Slots bloqueados** con historial | **Horarios propios por cada profesional** (`isSplit` + clonar) + **Bloqueos por servicio/rango** + Feriados 2026 por mes |
| **CRM & Contactos** | Datos de cliente en tarjeta colapsable de agenda | **Lista Blanca VIP**, **Lista Restringida (Blacklist)** + Directorio `\mamatila` | **CRM Financiero (visitas + gasto `$ ARS` + historial modal)** + Directorio `\mamatila` |
| **Recordatorios & Cron** | Checkboxes 24h / 2h + Plantillas 1A/1B/2 + QR WhatsApp | Checkboxes 24h / 2h + Wizard QR 3 pasos + Plantillas 1A/1B/2 | Checkboxes 24h / 2h + **Monitor Cron T-2hs en vivo** (barrido manual, logs `#CRON-XXXX`, inspeccionados/liberados) |

### Detalle de Exclusividades por Nivel
- **Exclusivo Nivel 1 (Profesional Independiente):** Consola liviana monousuario de 4 secciones sin fricción administrativa; panel de configuración en pantalla única (Identidad, Horarios 2 bloques, Señas/Alias/CBU, Medios de Pago y Plantillas WhatsApp) y sincronización directa con `/api/portal/:slug/*` cuando opera con slug personalizado.
- **Exclusivo Nivel 2 (Local Multi-Box / Canchas / Gabinetes):** Gobernanza preventiva anti-no-show (**Lista Blanca VIP** y **Lista Restringida**), gestión de **Cierres Especiales / Vacaciones** por rango (`tucu_l2_vacations_${rubro}`), **Slots Bloqueados Manualmente** con auditoría histórica (`tucu_l2_occupied_slots_history_${rubro}`), selector de **Pax** en reservas y mostrador, y cálculo de **% Ocupación Estimada**.
- **Exclusivo Nivel 3 (Clínica / Salón Multi-Staff):**
  1. **Agenda Dual Multi-Columna & Tabla:** Alterna columnas por **Especialista** o por **Recurso Físico** con carga directa de sobreturno sobre la columna elegida.
  2. **ABM de Personal Humano (`view_staff.js`):** Horarios independientes de 7 días por profesional con **turno partido (`isSplit`/`open2`/`close2`)**, clonación `Lun a Vie`, asignación de servicios por especialista y estado `ACTIVO/PAUSA` sincronizado con Showroom y Turnero.
  3. **ABM de Recursos Físicos (`view_resources.js`):** Entidad separada para sillones, gabinetes, consultorios, canchas, mesas o salas con contador de ocupación diaria y estado `ACTIVO/PAUSA`.
  4. **Catálogo con Categorías & Antelación (`view_services.js`):** Filtro por categorías personalizadas, horas de antelación (`advanceHours`) y visibilidad web de precio/duración.
  5. **CRM Financiero (`view_clients.js`) & Telemetría Cron T-2hs (`view_telemetry.js`):** Ranking de clientes frecuentes (`VIP >= 3 citas`), facturación acumulada (`LTV`), historial modal de citas por cliente y monitor en vivo del daemon barredor Cron T-2hs con ejecución bajo demanda.

---

## 🗺️ 4. MAPA DE ARCHIVOS VERIFICADOS EN DISCO (`tucured-landing` & `tucured-engine`)
- **Portales Cliente:** `public/turnero.html` (`46L`), `public/gestion_turno.html` (`51L`), `public/js/admin_shared/turnero_catalog.js` (`147L`), `turnero_app.js` (`156L`), `ticket_modal.js` (`167L`), `ticket_portal.js` (`170L`).
- **Núcleo Compartido (`public/js/admin_shared/`):** `admin_booking_engine.js` (`179L`), `admin_demo_seed.js` (`156L`), `admin_shell.js` (`158L`), `admin_pin_gate.js` (`153L`), `admin_wa_templates.js` (`165L`), `admin_holidays.js` (`166L`), `admin_contacts_parser.js` (`133L`), `admin_contacts_manager.js` (`161L`), `admin_manual_viewer.js` (`106L`), `admin_manual_data_l1/l2/l3.js` (`83L` c/u).
- **Consolas & Showroom:** `public/admin_l1.html` (`163L`) + `admin_l1/*`, `public/admin_l2.html` (`159L`) + `admin_l2/*`, `public/admin_l3.html` (`83L`) + `admin_l3/*`, `public/css/admin_unified.css` (`153L`) y `js/showcase_v11/*` (11 módulos `<= 178L`).

---
*Inventario certificado por `@Codi`, `@Kael` y `@Argus` bajo Protocolo PEAC & Ley de 200L — Nexus OS v11.1.*
