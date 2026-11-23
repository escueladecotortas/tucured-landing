// Archivo: .agent/audit/audit_features_l1_l2_l3.md
# INVENTARIO MAESTRO Y ARQUITECTURA CANÓNICA L1 / L2 / L3 (POST TASK-112G)
**Fecha:** 23 de Noviembre de 2026 | **Estado:** Producción Sincronizada (`tucured-landing` <-> `tucured-engine`)

---

## 1. PLANES OFICIALES Y MÓDULOS COMPARTIDOS
- **Esencial (`l1` · `/admin_l1.html`):** Agenda en Tiempo Real, Catálogo & Precios, Configuración en 3 pestañas, Manual de Uso.
- **Gestión (`l2` · `/admin_l2.html`):** Agenda Operativa, Servicios, Clientes & CRM (Lista Blanca VIP / Negra), Configuración en 3 pestañas con Vacaciones/Slots, Manual de Uso.
- **Equipos (`l3` · `/admin_l3.html`):** Agenda Multi-Staff & Recursos (Grilla/Tabla), Servicios, Clientes & CRM, Personal con 2do turno, Recursos por rubro, Confirmación 2 hs (chip integrado en `Recepción Web`), Configuración en 3 pestañas y Manual.
- **Núcleo UI & Marca Compartido (`public/js/admin_shared/`):**
  - `admin_features.js` + `admin_theme_sync.js`: registro único de planes (`Esencial` / `Gestión` / `Equipos`), herencia automática de `--tucu-primary`/`--tucu-panel-bg` y logo `.webp` del rubro en `/admin` (cero `#800000`, cero `font-mono`).
  - `admin_weekly_schedule.js`: componente único de **Horarios Semanales** en 1 columna responsiva (`min-w-0`, turno corrido/partido, `Clonar Lun a Vie`), arriba de Feriados 2026 en L1, L2 y L3.
  - `admin_holidays.js`: módulo independiente de **Feriados Nacionales 2026** por mes sin checkbox maestro, activo por defecto en L1, L2 y L3.
  - `admin_blocks_ui.js`: componente limpio de **Bloqueo de Horarios por Prestación** y **Bloqueos / Vacaciones por Fecha** en L3 con etiquetas superiores y cero recorte móvil (`375px`) o Showroom (`600px`).

---

## 2. TURNERO V2 PARA EL CLIENTE (`/turnero.html` + `turnero_*.js`)

| Eje Funcional | Esencial (`level=l1`) | Gestión (`level=l2`) | Equipos (`level=l3`) |
| :--- | :--- | :--- | :--- |
| **Estética & Portadas** | Split 50/50 PC / `100dvh` móvil, 6 rubros, 12 portadas MP4/WebP, 6 tipografías display | Idéntico (hereda experiencia boutique única) | Idéntico + selector opcional profesional/cancha |
| **Paso 1 y Paso 2** | Servicios ordenados + fechas/horarios + ficha `tucu_client_profile_v1` + `Obra Social` exclusiva de `salud` | Idéntico en UI | **Paso 1 agrega selector de especialista o cancha** con jornada partida |
| **Validación Disponibilidad** | Horarios pasados + **Feriados 2026 L1** | Feriados 2026 + Vacaciones + Slots bloqueados + Colisiones `tucu_l2_bookings_*` | Feriados 2026 + Jornada partida por staff + Bloqueos `tucu_l3_blocks_*` + Colisiones staff |
| **Comprobante & Storage** | `#TK-XXXX`, Alias/CBU, `.ics`/Google Calendar, reprogramación y consulta (`tucu_l1_bookings_*`) | `#TK-XXXX`, `pax` y `coverage` (`tucu_l2_bookings_*`) | `#TK-XXXX`, `staffId`, `resourceId` y `coverage` (`tucu_l3_bookings_*`) |

---

## 3. LANDING SHOWROOM V2 (`index.html` + `js/showcase_v11/*`)
- **Sección 1 (`#showroom-cliente` — Probá el Turnero de tus Clientes):** carrusel auto-deslizante de 6 rubros, toggle opcional `Modo Equipos` (`l1`/`l3`), iframe vivo desktop y pop-up inmersivo `100dvh` móvil.
- **Sección 2 (`#showroom-admin` — Elegí tu Panel de Dueño):** selector unificado `Esencial` | `Gestión` | `Equipos` sincronizado por rubro/paleta, tarjeta limpia de valor comercial (sin bloques de módulos futuros enchufables).

---

## 4. CONTRATO BACKEND MULTITENANT (`tucured-engine`)
- **Portal Multitenant (`backend/routes/portal.js` + `TenantFirestoreService.js`):** `GET /api/portal/:slug/config`, `PUT /api/portal/:slug/config`, `GET /api/portal/:slug/bookings`, `POST /api/portal/:slug/book` sobre Firestore (`tenants/{slug}/config/main` y `tenants/{slug}/bookings`).
- **WhatsApp Baileys & Cron T-2hs (`backend/routes/wa.js` + `cron_recordatorios.cjs`):** despacho automático `POST /api/wa/send-booking` y barrido idempotente (`reminderSent: true`) cada 10 min en ventana `120 ± 15` min previos al turno.
- **Consolidación documental (`TASK-112G`):** `.agent/docs/audit_features_l1_l2_l3.md` (eliminado en `TASK-112A`) y `.agent/specs/turneros_v15_matrix.md` (eliminado en `TASK-112G`) quedan unificados definitivamente en este archivo como única Fuente de Verdad.
