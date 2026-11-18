// Archivo: .agent/audit/audit_features_l1_l2_l3.md
# 🛡️ INVENTARIO MAESTRO DE FUNCIONALIDADES VIGENTES (L1, L2, L3)
**Nexus OS v11.1 — Protocolo PEAC de Auditoría Forense (Cierre Post TASK-091)**  
**Fecha de Emisión:** 18 de Noviembre de 2026  
**Auditores del Enjambre:** `@Codi` (Ingeniería) • `@Kael` (Integridad & Paridad) • `@Argus` (Gatekeeper QA)  
**Alcance Auditado en Disco:** `public/turnero.html`, `public/gestion_turno.html`, `public/admin_l1.html`, `public/admin_l2.html`, `public/admin_l3.html`, `public/js/admin_shared/*`, `public/js/admin_l1/*`, `public/js/admin_l2/*`, `public/js/admin_l3/*` y `js/showcase_v11/*`.

---

## 📊 1. RESUMEN EJECUTIVO DE COBERTURA (100% OPERATIVO EN DISCO)

| Nivel de Producto | Prometido | Construido en Disco | Estética & UX | Paridad `tucured-engine` |
| :--- | :---: | :---: | :--- | :---: |
| **L1: Profesional Independiente** | 100% | **100% Operativo** | Warm Studio / Aura Light + Tema Día/Noche + Favicon | ✅ SHA-256 Certificado |
| **L2: Central Pro Multi-Box** | 100% | **100% Operativo** | Warm Studio / Aura Light + Tema Día/Noche + Favicon | ✅ SHA-256 Certificado |
| **L3: Multi-Staff & Recursos** | 100% | **100% Operativo** | Warm Studio / Aura Light + Tema Día/Noche + Favicon | ✅ SHA-256 Certificado |

- **Estado Vigente (Post TASK-086 → TASK-091):** 0 enlaces rotos en consolas/portales, CRM L2/L3 unificado Firestore-ready, Manual Full-Width sin doble menú, Confirmación Automática 2 hs activable/pausable en L3 e identidad visual oficial `Tipografía Conectada` (`tucu_red_logo.svg` / `tucu_red_logo_full.svg` + `favicon.png` + kit 18 PNGs).

---

## 🌐 2. DIFERENCIALES TRANSVERSALES DEL ECOSISTEMA (COMUNES A L1, L2 Y L3)

### 2.1 Multi-Rubro con Aislamiento Estricto por Rubro (`admin_demo_seed.js`, `showcase_state.js`, `turnero_catalog.js`)
- Soporte nativo para **6 rubros canónicos** con identidad, subtítulo, dirección y catálogo propios: `peluqueria` (`barberia`), `estetica` (`peluqueria_estetica`), `gastronomia` (`resto`), `salud` (`salud_consultorio`, con selector condicional de Obra Social/Cobertura), `servicios` y `deportes` (`deportes_clubes`).
- **Particionado estricto en `localStorage`:** Todas las claves críticas (`tucu_${lvl}_services_${rubro}`, `tucu_${lvl}_bookings_${rubro}`, `tucu_${lvl}_biz_name_${rubro}`, `tucu_${lvl}_address_${rubro}`, `tucu_${lvl}_alias_${rubro}`, `tucu_${lvl}_cbu_${rubro}`, `tucu_${lvl}_holidays_state_${rubro}`, `tucu_${lvl}_contacts_${rubro}`) se almacenan aisladas por nivel y rubro para garantizar cero contaminación cruzada al alternar demos.

### 2.2 Turnero Autónomo en 3 Pasos + Showroom Interactivo (`turnero.html`, `turnero_app.js`, `showcase_v11/*`)
- **Turnero Autónomo (`/turnero.html`):** Flujo móvil sin contraseñas en **3 pasos + Paso 4 de confirmación**:
  1. *Paso 1 (Servicio):* Lista de prestaciones activas ordenadas por `order`, con precio, duración (`min`) y badge dinámico `Seña $X` o `Sin seña previa`.
  2. *Paso 2 (Fecha y Horario):* Selector de profesional/recurso (en L2/L3), días hábiles futuros y franjas libres filtradas en tiempo real contra feriados activos, vacaciones, horarios pasados (`AdminShell.filterFutureSlots`), bloqueos manuales, turnos existentes y **turnos partidos por profesional** (`isSplit`).
  3. *Paso 3 (Confirmar Reserva):* Resumen con dirección del local, Nombre, WhatsApp numérico, Obra Social (solo Salud) y **bloqueo preventivo cordial** si el teléfono está restringido (`AdminContactsStore.isRestrictedPhone`).
  4. *Paso 4 (Ticket Generado):* Código hash `#TK-XXXX`, ruta corta `/t/TK-XXXX`, aviso de despacho automático por WhatsApp y botón in-place `"Ver Ticket Online"`.
- **Showroom Interactivo (`showcase_mockup.js`, `showcase_core.js`):** Flujo en vivo de 4 pasos con validación preventiva de teléfonos restringidos (`isShowcasePhoneRestricted`), descarga `.ics` (`addToCalendar`) y botón `"Ver Tu Panel de Dueño"`.

### 2.3 Ticket Online In-Place (`ticket_modal.js`), Portal `/t/:token` (`gestion_turno.html`, `ticket_portal.js`) & Máquina de 5 Estados (`admin_booking_engine.js`)
- **Ticket Online In-Place + Standalone:** Apertura superpuesta `TucuTicketModal` desde Showroom y Turnero, más acceso directo por `/t/TK-XXXX` o `/gestion_turno.html?token=TK-XXXX`.
- **Carga y Reporte de Comprobante:** Selector `<input type="file" accept="image/*,.pdf">` y botón `"Informar transferencia realizada"` (`depositReceiptReported`, `depositReceiptName`, `depositReceiptAt`).
- **Máquina Unificada de 5 Estados Canónicos:** `PENDING_DEPOSIT` (*Pendiente Seña*), `CONFIRMED` (*Confirmado*, diferenciando confirmación inmediata de asistencia confirmada), `COMPLETED` (*Finalizado*), `CANCELLED` (*Cancelado*, libera horario al instante) y `NO_SHOW` (*Ausente*), con botón explícito `"Reabrir turno"` (`undoTransition`).

### 2.4 Cobro de Seña Directo al Alias, Toggles por Servicio & Historial de Precios
- **Cobro de Seña Directo al Alias del Comercio:** Toggle `Exigir Seña Web`, cálculo `%` o `$` fijo, `Alias` / `CBU` copiables, medios habilitados configurables y selector `openPaymentPicker`.
- **Toggles de Seña, Duración e Historial:** Checkbox `Exige seña web` por servicio (`requireDeposit`), duraciones estándar (`15`–`90 min`) o personalizadas (`5`–`480 min`), orden manual (`order`) e historial auditable `priceHistory` (`showPriceHistory`).

### 2.5 Plantillas WhatsApp & Vinculación QR (Baileys), Dirección, Feriados 2026 & CRM `\mamatila`
- **Plantillas Estructuradas de WhatsApp & Vinculación QR vía Baileys (`admin_wa_templates.js`):** 3 plantillas multilínea editables (`1A`, `1B`, `2`) con **12 variables** (`{{cliente}}`, `{{comercio}}`, `{{direccion}}`, `{{servicio}}`, `{{fecha}}`, `{{hora}}`, `{{codigo}}`, `{{sena}}`, `{{porcentaje}}`, `{{alias}}`, `{{cbu}}`, `{{link_ticket}}`) y modal con QR SVG inline autónomo (`AdminShell.probeWhatsAppStatus`).
- **Dirección Física (`#cfg-biz-address`):** Editable por rubro en L1, L2 y L3; se propaga en vivo al Turnero, Ticket, `.ics` y variable `{{direccion}}`.
- **Feriados 2026 (`admin_holidays.js`):** Catálogo anual de **16 feriados en 11 meses** (`api.argentinadatos.com` + fallback offline) con toggle individual `Bloqueado / Abierto`.
- **CRM Unificado `\mamatila` Firestore-Ready (`admin_contacts_parser.js`, `admin_contacts_store.js`, `admin_contacts_manager.js`):** Normalización **E.164 (`+549381...`)**, importación desde agenda celular (`navigator.contacts.select`), `.vcf` / `.csv`, esquema unificado con **`email`** y **`birthday` (Fecha de Cumpleaños)** (retirado campo Dirección de cliente), filtros **`Activos`**, **`Restringidos`** y **`Archivados`** (eliminada píldora `Todos`), acción **`Bloquear` / `Desbloquear` (`isRestricted`)** y botón **`Restaurar`** en 1 clic desde `Archivados`.

### 2.6 Seguridad PIN, Baja Lógica, Manual Full-Width & Identidad Oficial
- **Acceso & Recepción (`admin_pin_gate.js`, `admin_shell.js`):** PIN de 4 dígitos, switch `Recepción Web` (`Turnero Abierto / En Pausa`) y baja lógica `deletedAt` con confirmación `confirmAsync`.
- **Manual de Uso Interactivo Full-Width (`admin_manual_viewer.js`, `admin_manual_data_l1/l2/l3.js`):** Layout de **1 sola columna Full-Width** (sin doble menú lateral) con barra horizontal de píldoras `#manual-nav-*`, navegación `← Sección Anterior` / `Siguiente Sección →` y buscador multi-sección NFD con `<mark>` (cobertura verificada para `cumpleanos`, `celular`, `feriados`, `direccion`, `confirmacion`).
- **Identidad Visual Oficial (`TASK-091`):** SVGs `tucu_red_logo.svg` / `tucu_red_logo_full.svg` (`Tipografía Conectada`), `public/favicon.png` en las 5 vistas HTML de `public/` y kit de 18 PNGs en `assets/brand_kit_png/`.

---

## ⚖️ 3. MATRIZ COMPARATIVA EXACTA DE FUNCIONALIDADES EXCLUSIVAS POR NIVEL

| Capacidad / Eje Operativo | Nivel 1: Profesional Independiente | Nivel 2: Local Multi-Box / Canchas / Gabinetes | Nivel 3: Clínica / Salón Multi-Staff |
| :--- | :--- | :--- | :--- |
| **Archivos Consola Backoffice** | `admin_l1.html` + `public/js/admin_l1/*` | `admin_l2.html` + `public/js/admin_l2/*` | `admin_l3.html` + `public/js/admin_l3/*` |
| **Vistas de Consola** | 4: Agenda, Catálogo, Configuración, Manual | 5: Agenda, Catálogo, CRM & Contactos, Config (3 tabs), Manual | 8: Agenda Dual, Staff, Recursos, Servicios, Contactos & CRM, **Confirmación Automática 2hs**, Config, Manual |
| **Modelo de Atención** | Monopuesto / 1 profesional único | Local centralizado / primer turno libre / Pax | **Multi-Staff + Recursos Físicos desacoplados** |
| **KPIs en Tiempo Real** | 3: Turnos, Señas Acreditadas, Tasa Asistencia | 4: Confirmados, Señas, Cancelados/Ausentes, **% Ocupación** | 4 Agenda + 2 CRM: Turnos, Señas vs Esperados, Confirmados, Finalizados/Ausentes + Clientes en Reservas/Volumen `$ ARS` |
| **Carga & Horarios** | Modal `Nueva Cita Manual`; grilla 7 días + `Clonar Lun a Vie` | Modal `Nuevo Turno Manual` (**Pax**); **Vacaciones** + **Slots bloqueados** | **`Sobreturno Dual`**; **Horarios por profesional** (`Mañana:`/`Tarde:` `52px` simétrico en modal `max-w-4xl`) + **Bloqueos por servicio** |
| **CRM & Automatización** | Datos de cliente en tarjeta de agenda + Plantillas WA / QR | **Directorio Único "Clientes y Contactos"** (`Activos`/`Restringidos`/`Archivados`, Email, Cumpleaños, Bloqueo/Restaurar) + `\mamatila` | **CRM Financiero** (sin filtro VIP; visitas + `$ ARS` + historial modal) + Directorio `\mamatila` + **Switch Maestro Confirmación Automática 2hs** |

### Detalle de Exclusividades y Ajustes Recientes por Nivel
- **Nivel 1 (`admin_l1/*`):** Consola liviana monousuario de 4 vistas, configuración unificada y sincronización `/api/portal/:slug/*`.
- **Nivel 2 (`admin_l2/*`):** Gestión de vacaciones, slots bloqueados con historial, selector de Pax, % de ocupación y **CRM unificado** (`admin_l2_crm.js` + `admin_contacts_manager.js`, retiradas listas separadas VIP/Blacklist duplicadas).
- **Nivel 3 (`admin_l3/*`):** Agenda Dual por especialista o recurso; modal de Staff ampliado a `max-w-4xl` (`lg:grid-cols-12`, filas `Mañana:` / `Tarde:` de `52px`); `view_services.js` sin toggles `"Ver Precio Web"` ni `"Ver Duración Web"`; `view_clients.js` sin filtro VIP; y `view_telemetry.js` traducido comercialmente como **"Confirmación Automática de Turnos (2 hs antes)"** con **Switch Maestro `#btn-l3-auto-confirm-toggle`** sincronizado con `tucu_l3_pay_cfg_${rubro}.rem2h` y `#l3-rem-2h` (Cron T-2hs activable o pausable bajo demanda).

---

## 🗺️ 4. MAPA DE ARCHIVOS VERIFICADOS EN DISCO (`tucured-landing` & `tucured-engine`)
- **Portales Cliente:** `public/turnero.html` (`49L`), `public/gestion_turno.html` (`52L`), `public/js/admin_shared/turnero_catalog.js` (`147L`), `turnero_app.js` (`163L`), `ticket_modal.js` (`167L`), `ticket_portal.js` (`170L`).
- **Núcleo Compartido (`public/js/admin_shared/`):** `admin_booking_engine.js` (`179L`), `admin_demo_seed.js` (`156L`), `admin_shell.js` (`158L`), `admin_pin_gate.js` (`153L`), `admin_wa_templates.js` (`165L`), `admin_holidays.js` (`166L`), `admin_contacts_parser.js` (`138L`), `admin_contacts_store.js` (`131L`), `admin_contacts_manager.js` (`151L`), `admin_manual_viewer.js` (`106L`), `admin_manual_data_l1.js` (`70L`), `admin_manual_data_l2.js` (`83L`), `admin_manual_data_l3.js` (`83L`).
- **Consolas & Showroom:** `public/admin_l1.html` (`164L`) + `admin_l1/*` (`<= 179L`), `public/admin_l2.html` (`156L`) + `admin_l2/*` (`<= 173L`), `public/admin_l3.html` (`84L`) + `admin_l3/*` (`<= 171L`), `public/css/admin_unified.css` (`153L`) y `js/showcase_v11/*` (11 módulos `<= 178L`).

---
*Inventario certificado por `@Codi`, `@Kael` y `@Argus` bajo Protocolo PEAC & Ley de 200L — Nexus OS v11.1.*
