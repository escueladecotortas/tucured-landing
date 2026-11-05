// Archivo: .agent/specs/turneros_v15_matrix.md
# 🏛️ MATRIZ CANÓNICA DE CAPACIDADES: TURNEROS V16.0 (SSOT - OPCIÓN A)

> **Documento Maestro de Arquitectura, Especificación de Niveles y Fuente Única de Verdad**  
> *Consolida la auditoría forense y la aprobación ejecutiva de la Opción A: Nivel 1 Completo en Base Compartida, Nivel 2 Aislado Pro y Nivel 3 Multi-Recurso.*  
> **Versión Canónica:** 16.0 (Nexus OS v11.1)  
> **Autoría Swarm:** `@Codi` (Ingeniería de Software & Arquitectura) • `@Atenea` (UI/UX) • `@Argus` (QA & Auditoría)

---

## 📊 1. TABLA COMPARATIVA ESTRUCTURAL (L1 vs L2 vs L3 — MATRIZ V16.0)

| Eje Técnico / Operativo | Nivel 1: Turnero Autónomo Completo v16.0 | Nivel 2: Central Operativa Pro v16.0 | Nivel 3: Multi-Staff & Franquicias v16.0 |
| :--- | :--- | :--- | :--- |
| **Arquetipo de Negocio** | Profesionales independientes, consultorios individuales y comercios unipersonales. | Locales con alta demanda, salones comerciales y negocios que requieren backoffice en vivo. | Clínicas médicas, salones multi-sillón, complejos deportivos y franquicias. |
| **Arquitectura de Persistencia** | **Base multitenant compartida `tucured-clients`** (`tenants/{slug}`) con persistencia soberana Local-First. | **Instancia y persistencia con aislamiento de alto rendimiento** (Firestore `tenants/{slug}` dedicado + LocalStorage). | **Suite multi-recurso desacoplada** con aislamiento relacional por staff, servicios y recursos físicos. |
| **Flujo de Reserva** | 4 pasos fluidos: Servicio/Fecha/Hora $\rightarrow$ Identidad $\rightarrow$ Confirmación Web $\rightarrow$ WhatsApp. | 4 pasos autónomos integrados al panel operativo central con sincronización instantánea. | Flujo multicapa dinámico: Selección de Especialista $\rightarrow$ Catálogo con duración $\rightarrow$ Slots continuos $\rightarrow$ WhatsApp. |
| **Prevención de Colisiones** | ✅ **Automática en tiempo real** (bloquea horarios ocupados con `line-through opacity-25`). | ✅ **Automática en tiempo real** integrada bidireccionalmente con el panel de administración. | ✅ **Automática multi-agenda** (verifica solapamientos por staff individual y franjas de recursos). |
| **Comprobante Digital** | ✅ **Token Hash criptográfico `#TK-XXXX`** generado al confirmar en el cliente o API. | ✅ **Token Hash `#TK-XXXX`** vinculado a base de clientes y seguimiento en agenda. | ✅ **Token Hash `#TK-XXXX`** con trazabilidad de profesional, servicio y cobertura médica. |
| **Autogestión de Cliente** | ✅ **Portal web autónomo (`gestion_turno.html?token=TK-XXXX`)** con cancelación en 1 clic. | ✅ **Portal web autónomo** con cancelación, reagendamiento y reabsorción automática del slot. | ✅ Portal web con cancelación y reagendamiento respetando políticas de anticipación y staff. |
| **Cálculo de Duración** | ✅ **Duración por servicio** ($\lceil \text{duración} / \text{intervalo} \rceil$ bloques contiguos obligatorios). | ✅ **Duración por servicio** con control de buffer gap y descansos de siesta. | ✅ **Dinámica avanzada por servicio y especialista** con modelado de sillones y consultorios. |
| **Despacho WhatsApp** | ✅ Enlace directo `https://wa.me/` formateado con tokens + despacho asíncrono opcional. | ✅ Despacho automático asíncrono vía Baileys (`POST /api/wa/send-booking`) con fallback `wa.me`. | ✅ Despacho asíncrono Baileys + **Recordatorio preventivo Cron T-2hs** con idempotencia. |
| **Backoffice / Admin** | Asistente de configuración neutral parametrizable por URL (`admin_l1.html?slug={slug}`). | **SPA Avanzada de 3 Vistas**: Agenda Operativa, CRM Gobernanza y Configuración (`admin_l2.html`). | **Suite Modular**: Agenda Dual/Grilla, Staff ABM, Catálogo, CRM Clientes y Sistema (`admin_l3.html`). |
| **Gobernanza / Seguridad** | PIN numérico 3x4 + WebAuthn biometría (FaceID / Huella) en el dispositivo del dueño. | **Lista Blanca (VIP)** y **Lista Negra (bloqueo de abusos y ausencias reiteradas sin aviso)**. | Roles de acceso por staff, control de gap buffers, feriados nacionales y bloqueo de franjas. |
| **Personal / Staff** | 1 único profesional / puesto monousuario. | 1 puesto de atención / comercio centralizado. | ✅ **Multi-Staff ilimitado**: perfiles individuales, fotos, roles y 7 días de horarios propios. |
| **Recursos Físicos** | Puesto único configurado. | 1 puesto central de atención. | ✅ **Modelado por Rubro**: Sillones (Barbería), Puestos (Estética), Consultorios, Canchas o Mesas. |
| **Analítica / KPIs** | Confirmados del día y señas acreditadas en memoria local. | Confirmados, Cancelados, Histórico y % Ocupación estimada diaria en tiempo real. | Ocupación por staff, facturación estimada por servicio, histórico de gasto por cliente. |

---

## ⚙️ 2. ESPECIFICACIÓN TÉCNICA — NIVEL 1 (Turnero Autónomo Completo v16.0)

### 2.1 Identidad y Parámetros Operativos
* **Archivo Fuente Cliente:** `backend/stitch/widgets/booking/booking_l1_turnero.html` y `js/showcase_v11/showcase_templates_l1.js`.
* **Archivo Fuente Backoffice:** `public/admin_l1.html` parametrizado con `?slug={comercio_slug}`.
* **Persistencia Multitenant Compartida:**
  * Endpoint de consulta: `GET /api/portal/:slug/config`
  * Endpoint de reservas: `GET /api/portal/:slug/bookings` y `POST /api/portal/:slug/book`
  * Colección Firestore: `tenants/{slug}/config/main` y `tenants/{slug}/bookings`.
* **Atributos `data-*` de Configuración DOM:**
  * `data-widget-id`: Identificador de instancia en el DOM.
  * `data-biz-name`: Nombre de fantasía del comercio.
  * `data-wa`: WhatsApp del negocio (E.164 internacional).
  * `data-schedule`: Objeto JSON con configuración de 7 días (corrido o turno cortado con pausa de siesta).
  * `data-interval`: Granularidad del turno en minutos (15, 20, 30, 45 o 60 min).
  * `data-days`: Rango de días hábiles futuros a desplegar (7 a 30 días).
  * `data-block-holidays`: Salteo automático de feriados nacionales oficiales argentinos.

### 2.2 Capacidades de Bloqueo, Ticket Hash y Cancelación
1. **Bloqueo en Tiempo Real:** El widget consulta las reservas activas del tenant (`occupied`). Si un horario ya fue tomado, se renderiza deshabilitado con `opacity-25 line-through pointer-events-none cursor-not-allowed`.
2. **Token Hash `#TK-XXXX`:** Código alfanumérico único generado al completar la reserva para identificación unívoca.
3. **Portal de Autogestión (`gestion_turno.html?token=TK-XXXX`):** Permite al cliente autogestionar su cita y cancelarla formalmente con 1 toque, liberando el slot inmediatamente en la agenda.

---

## ⚡ 3. ESPECIFICACIÓN TÉCNICA — NIVEL 2 (Central Operativa Pro v16.0)

### 3.1 Identidad y Arquitectura Aislada
* **Archivos Fuente Cliente:** `backend/stitch/widgets/booking/booking_l2_turnero.html` y `public/gestion_turno.html`.
* **Archivo Fuente Backoffice:** `public/admin_l2.html` (SPA Full-Screen).
* **Persistencia Aislada de Alto Rendimiento:**
  * Almacenamiento dedicado por local en Firestore (`tenants/{slug}`) con mirror Local-First (`tucu_l2_bookings_{slug}`).
  * Turnos manuales de mostrador: modal para cargar turnos telefónicos o presenciales sin colisiones.
* **Gobernanza Anti-No-Show:**
  * **Lista Negra:** Bloqueo preventivo de números telefónicos con ausencias reiteradas sin aviso.
  * **Lista Blanca VIP:** Identificación de clientes frecuentes para atención prioritaria.
* **Integración Baileys WhatsApp:**
  * Despacho asíncrono automático de comprobantes con código QR de sincronización en vivo en la pestaña de Ajustes.

---

## 🏢 4. ESPECIFICACIÓN TÉCNICA — NIVEL 3 (Multi-Staff & Franquicias v16.0)

### 4.1 Identidad y Suite Modular
* **Archivos Fuente Cliente:** `backend/stitch/widgets/booking/booking_l3_turnero.html` y presets en `rubros_presets.json`.
* **Suite Modular Backoffice (`public/js/admin_l3/`):**
  * `admin_core.js`: Router reactivo y switcher dinámico de 5 rubros canónicos.
  * `view_agenda.js`: Grilla multi-columna simultánea por cada profesional del staff.
  * `view_staff.js`: ABM de profesionales con franjas horarias y días independientes.
  * `view_services.js`: Catálogo maestro con cálculo de bloques contiguos por duración.
  * `view_clients.js`: CRM con métricas financieras acumuladas por cliente en \$ ARS.
  * `view_system.js`: Configuración de feriados, gap buffers y políticas de cancelación.
* **Microservicio Cron de Recordatorios (T-2hs):**
  * Módulo: `backend/services/whatsapp/cron_recordatorios.cjs`.
  * Escaneo periódico cada 10 minutos para citas en la ventana de 120 ± 15 minutos (105 a 135 min antes).
  * Despacho desatendido por WhatsApp con flag `reminderSent: true` para idempotencia absoluta (cero duplicados).

---

## 🗺️ 5. MAPA DE ARCHIVOS DEL ECOSISTEMA V16.0

```
tucured-engine/
├── backend/
│   ├── routes/portal.js                             # API Multitenant /api/portal/:slug/*
│   ├── routes/wa.js                                 # API Despacho Baileys
│   ├── services/TenantFirestoreService.js           # Servicio BBDD tucured-clients
│   ├── services/whatsapp/cron_recordatorios.cjs     # Barredora Cron T-2hs para L3
│   └── stitch/widgets/booking/
│       ├── booking_l1_turnero.html                  # Widget L1 autónomo completo
│       ├── booking_l2_turnero.html                  # Widget L2 con colisiones
│       ├── booking_l3_turnero.html                  # Widget L3 multi-recurso
│       └── rubros_presets.json                      # Manifiesto de 5 rubros canónicos
├── public/
│   ├── admin_l1.html                                # Blueprint neutral L1 (?slug=...)
│   ├── admin_l2.html                                # Panel Central Operativo L2
│   ├── admin_l3.html                                # Panel Multi-Staff L3
│   ├── gestion_turno.html                           # Portal de Autogestión por Hash
│   └── js/
│       ├── admin_l1/                                # Módulos neutrales L1
│       └── admin_l3/                                # Suite modular L3 (7 módulos)
tucured-landing/
├── js/
│   ├── components/
│   │   ├── funnel.js                                # Wizard de Onboarding 4 Pasos
│   │   ├── funnel_checkout_markup.js                # Checkout QR $1.000 & Alias
│   │   ├── stage_value_zone.js                      # Especificaciones de la Matriz v16
│   │   └── pricing.js                               # Planes y Precios Transparentes
│   └── showcase_v11/                                # Mockups Interactivos L1, L2 y L3
```
