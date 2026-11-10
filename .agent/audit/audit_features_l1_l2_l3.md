<!-- Archivo: .agent/audit/audit_features_l1_l2_l3.md -->
# 🛡️ AUDITORÍA CRUZADA DE ALCANCE POR NIVELES (L1, L2, L3)
**Nexus OS v11.1 — Protocolo PEAC de Auditoría Forense**  
**Fecha:** 07 de Noviembre de 2026  
**Auditores del Enjambre:** `@Argus` (Juez Pasivo & QA) • `@Atenea` (Mapeo UI/UX) • Supervisión: `@Nexus` (COO)  
**Objetivo:** Contrastar de forma exhaustiva las promesas comerciales de la landing (`pricing.js`, `features.js`, `stage_value_zone.js`, `funnel_data.js`, `showcase_state.js`) frente a la implementación técnica real en disco (`showcase_v11`, `admin_l1`, `admin_l2`, `admin_l3`).

---

## 📊 1. RESUMEN EJECUTIVO DE COBERTURA

```
┌────────────────────────────────────────────────────────────────────────┐
│ ESTADO GENERAL DE COBERTURA TÉCNICA VS PROMESAS COMERCIALES           │
├──────────────────────┬─────────────┬──────────────┬────────────────────┤
│ Nivel de Producto    │ Prometido   │ Construido   │ Brecha Principal   │
├──────────────────────┼─────────────┼──────────────┼────────────────────┤
│ L1: Autónomo         │ 100%        │ 90%          │ Copy desalineado   │
│ L2: Central Pro      │ 100%        │ 95%          │ Enlace roto cliente│
│ L3: Multi-Recurso    │ 100%        │ 70%          │ Deuda UI & Cron L3 │
└──────────────────────┴─────────────┴──────────────┴────────────────────┘
```

* **Nivel 1 (Autónomo):** La lógica del cliente en el showroom se elevó con éxito al estándar de 4 pasos con Hash `#TK-71A0` y descarga `.ics` Local-First (TASK-064-B). El panel `admin_l1` está 100% modularizado en Aura Light. La principal brecha es de **consistencia editorial**: la landing y el funnel aún conservan textos obsoletos que mencionan *"despacho wa.me sin backend"*.
* **Nivel 2 (Central Pro):** Es el nivel más sólido y maduro. La SPA `admin_l2` está desacoplada en 5 submódulos Aura Light (< 165L), con CRM de Lista Negra/VIP y modal de mostrador. La brecha principal es un **enlace roto** en el header hacia `/demo_l2_cliente.html`.
* **Nivel 3 (Multi-Staff & Clubes/Clínicas):** Existe una base funcional sólida de multi-staff y catálogo con duración, pero mantiene una **fuerte deuda técnica visual** (sigue en Dark Mode rígido `bg-zinc-950`), carece de telemetría visual del Cron T-2hs y requiere formalizar el modelado de recursos físicos independientes (canchas y consultorios).

---

## 🔎 2. MATRIZ FORENSE POR NIVEL

### 🟢 2.1 NIVEL 1: TURNERO AUTÓNOMO EXPRESS

| Característica Prometida (Landing / Pricing) | Estado Real en Disco | Brecha / Faltante Detectado | Severidad |
| :--- | :--- | :--- | :---: |
| **Reserva web ágil en el celular** | **Construido y Operativo:** Flujo de 4 pasos en `showcase_mockup.js` y `showcase_templates_l1.js` (Horarios $\rightarrow$ Datos $\rightarrow$ Resumen $\rightarrow$ Ticket). | **Brecha de Copy:** En `funnel_data.js` dice *"Reserva en 3 toques, seña 50% y despacho wa.me sin backend"*. Debe actualizarse para reflejar el flujo de 4 pasos con confirmación web. | 🟡 Media |
| **Bloqueo en tiempo real (Base Multitenant)** | **Simulado en memoria / Local-First:** En `showcase_state.js`, domingos y slots pasados se bloquean en vivo. En `admin_l1_agenda.js`, consulta `/api/portal/:slug/bookings` con fallback a `localStorage`. | **Aislamiento Sandbox:** En la landing estática pura no hay concurrencia multi-navegador real; la sincronización entre distintos dispositivos depende del backend Node en `tucured-engine`. | 🟢 Baja (Esperado) |
| **Comprobante Digital Hash `#TK-XXXX`** | **Construido y Operativo:** Emisión de token canónico `#TK-71A0` en el showroom y `#TK-8421` / `#TK-3319` en `admin_l1_agenda.js`. | **Ninguna:** Coherencia total entre cliente y trastienda. | ⚪ Conforme |
| **Portal de autogestión y cancelación en 1 clic** | **Construido en memoria:** Módulo `showcase_self_service_l2.js` integrado al showroom con motivos de cancelación y reprogramación. | **Faltante Standalone:** No existe un archivo físico `public/gestion_turno.html` para acceso autónomo directo por URL fuera del showroom. | 🟡 Media |
| **Catálogo con duración variable y cobro de señas** | **Construido:** `admin_l1_pricing.js` gestiona duración (30 a 60 min), precios y seña porcentual. Integrado con Alias oficial `tucured.mp`. | **Ninguna:** Plenamente operativo en admin y showroom. | ⚪ Conforme |
| **Salteo de feriados nacionales y corte de siesta** | **Construido:** `admin_l1_config.js` implementa horarios en 2 bloques (mañana/tarde) y salteo de feriados. El showroom saltea domingos automáticamente con paginación `<` y `>`. | **Ninguna:** Cumplimiento estricto. | ⚪ Conforme |
| **Despacho y confirmación vía WhatsApp Gateway** | **Construido en Admin:** `admin_l1_baileys.js` implementa modal con QR de vinculación Baileys y test de despacho. En el showroom se aisló en Sandbox Local-First. | **Brecha Visual en Landing:** `showcase_benefits.js` (L70-L85) aún renderiza una tarjeta de WhatsApp bubble antigua (*"Mensaje listo en tu WhatsApp"*). Debe reemplazarse por el Ticket Digital #TK. | 🔴 Alta |
| **Panel de Control Backoffice (`admin_l1.html`)** | **Construido:** 100% Aura Light, PIN táctil 3x4 + WebAuthn biometría, switch de recepción abierta/pausada y buscador reactivo. | **Ninguna:** Certificado bajo compuerta Argus 41/41 (TASK-064). | ⚪ Conforme |

---

### 🔵 2.2 NIVEL 2: CENTRAL OPERATIVA & AGENDA PRO

| Característica Prometida (Landing / Pricing) | Estado Real en Disco | Brecha / Faltante Detectado | Severidad |
| :--- | :--- | :--- | :---: |
| **Instancia aislada de alto rendimiento** | **Modelada en Admin:** `public/admin_l2.html` opera con aislamiento por comercio mediante `?slug=...` y almacenamiento en `localStorage` (`tucu_l2_bookings_{slug}`). | **Aislamiento Backend:** Persistencia cloud dedicada configurada en `tucured-engine` (`tenants/{slug}`). | 🟢 Baja (Esperado) |
| **SPA Avanzada de 3 Vistas Operativas** | **Construida:** `public/admin_l2.html` estructurada en 5 submódulos (< 165L): Agenda en Vivo, CRM Gobernanza y Configuración de Horarios. | **Ninguna:** Estándar Aura Light impecable. | ⚪ Conforme |
| **Carga de Turnos de Mostrador / Telefónicos** | **Construida:** Modal interactivo en `admin_l2_calendar.js` con cálculo preventivo de solapamientos de horario. | **Ninguna:** Totalmente funcional en el backoffice. | ⚪ Conforme |
| **Gobernanza Anti-No-Show (Lista Negra y VIP)** | **Construida:** `admin_l2_crm.js` implementa ABM completo de clientes, bloqueo preventivo en Lista Negra y fidelización en Lista Blanca VIP. | **Ninguna:** Persistencia reactiva verificada. | ⚪ Conforme |
| **Métricas de ocupación comercial en tiempo real** | **Construida:** `admin_l2_calendar.js` reporta % de ocupación diaria, volumen de citas activas y recaudación en \$ ARS. | **Ninguna:** Reflejado en panel y showroom. | ⚪ Conforme |
| **Enlace de Acceso a Turnero Cliente desde Admin** | **Incompleto / Roto:** En `public/admin_l2.html` (L39), el botón apunta a `<a href="/demo_l2_cliente.html">📱 Turnero Cliente</a>`. | **Enlace Roto:** `demo_l2_cliente.html` no existe en `public/` (produce HTTP 404). Debe redirigir al showroom o proveerse el archivo cliente. | 🔴 Alta |
| **Portal de autogestión para clientes** | **Simulado en showroom:** Opera mediante `showcase_self_service_l2.js` con token `#TK-84B2`. | **Faltante Standalone:** Ausencia de `gestion_turno.html` independiente para el cliente final. | 🟡 Media |

---

### 🟡 2.3 NIVEL 3: MULTI-STAFF, CLUBES & CLÍNICAS

| Característica Prometida (Landing / Pricing) | Estado Real en Disco | Brecha / Faltante Detectado | Severidad |
| :--- | :--- | :--- | :---: |
| **Suite Multi-Staff con Agendas Simultáneas** | **Construida en base JS modular:** `public/js/admin_l3/view_agenda.js` y `view_staff.js` soportan columnas por cada profesional con horarios propios. | **Deuda UI/UX Crítica:** `public/admin_l3.html` permanece en **Dark Mode rígido** (`bg-zinc-950`). Requiere refactorización urgente al estándar **Aura Light** (TASK-065). | 🔴 Alta |
| **Modelado de Recursos Físicos (Canchas / Sillones / Consultorios)** | **Parcialmente modelado:** En `showcase_templates_l3.js` se modelan canchas y sillones. En `admin_l3`, `view_staff.js` trata a los recursos como personas del staff; no hay un selector ni entidad de recursos físicos desacoplada. | **Faltante Funcional:** Falta modelar la entidad de "Recursos Físicos" diferenciada de "Profesionales" en `admin_l3` (alcance de TASK-065). | 🔴 Alta |
| **Selección de especialista o primer libre** | **Construida en Showroom:** `showcase_templates_l3.js` implementa selector interactivo de profesional o "Cualquiera (Primer Libre)". | **Ninguna:** Totalmente interactivo en el showroom. | ⚪ Conforme |
| **Cálculo de bloques contiguos por servicio** | **Construido:** Duración dinámica por servicio modelada en `showcase_templates_l3.js` y `view_services.js`. | **Ninguna:** Algoritmo de ocupación funcional. | ⚪ Conforme |
| **Microservicio Cron T-2hs para Recordatorios** | **Construido en Engine / Ausente en UI:** `cron_recordatorios.cjs` existe en el backend de `tucured-engine`. En `view_system.js` hay un switch de recordatorios, pero **no hay telemetría visual del cron en la consola**. | **Faltante de Telemetría:** El panel L3 debe mostrar una tarjeta de telemetría en vivo del Cron T-2hs (estado activo, última pasada, turnos notificados). | 🔴 Alta |
| **CRM Financiero con Gasto Acumulado** | **Construido:** `view_clients.js` calcula el historial de visitas y facturación acumulada en \$ ARS por cliente. | **Ninguna:** Implementado y operativo. | ⚪ Conforme |
| **Enlace Roto en Topbar de Admin L3** | **Enlace Roto:** `public/admin_l3.html` (L36) contiene `<a href="/tucu_widgets.html">` que apunta a un archivo inexistente. | **Limpieza:** Remover el enlace roto o apuntar a la landing. | 🟡 Media |

---

## 📋 3. LISTA CONSOLIDADA DE PIEZAS TÉCNICAS PENDIENTES (Pre-Cierre)

Antes de realizar el redespliegue y la auditoría final de conversión (TASK-066), el enjambre debe abordar de forma estricta las siguientes tareas:

### 1. Saneamiento Editorial & Copys de Conversión (Atenea & Lorem)
- [ ] **`funnel_data.js` (L43):** Corregir la descripción de L1 eliminando `"despacho wa.me sin backend"`. Sustituir por: `"Turnero autónomo en 4 pasos, bloqueo en tiempo real y comprobante digital #TK-XXXX"`.
- [ ] **`showcase_benefits.js` (L68-L87):** Erradicar el mockup de chat de WhatsApp para L1. Reemplazarlo por la tarjeta de previsualización del **Ticket Digital #TK-71A0 con descarga de recordatorio `.ics` y portal de autogestión**.
- [ ] **`pricing.js` y `stage_value_zone.js`:** Revisar que todas las menciones a L1 señalen el flujo autónomo de 4 pasos con confirmación en agenda y comprobante digital.

### 2. Reparación de Enlaces Rotos en Backoffice (`public/`)
- [ ] **`public/admin_l2.html` (L39):** El enlace `<a href="/demo_l2_cliente.html">` produce error 404. Redirigir hacia el simulador interactivo de la landing (`/#showroom`) o generar un alias de previsualización.
- [ ] **`public/admin_l3.html` (L36):** El botón con enlace a `/tucu_widgets.html` produce error 404. Reemplazarlo por un enlace al Home (`/`) o suprimirlo en modo embebido.

### 3. Ejecución Prioritaria de TASK-065 (Refactor Admin L3 Aura Light)
- [ ] **Transformación Estética:** Migrar `public/admin_l3.html` y sus vistas (`view_agenda.js`, `view_staff.js`, `view_services.js`, `view_clients.js`, `view_system.js`) al estándar **Aura Light** (`bg-slate-50`, tarjetas blancas, bordes `border-slate-200`, acentos luminosos).
- [ ] **Telemetría Cron T-2hs:** Añadir en la barra superior o en `view_system.js` una tarjeta de estado en vivo para el microservicio Cron de recordatorios (simulando daemon activo con idempotencia).
- [ ] **Modelado de Recursos Físicos:** Formalizar en `view_staff.js` o en un submódulo independiente la distinción clara entre "Profesionales / Especialistas" y "Recursos Físicos" (Canchas deportivas, Sillones, Consultorios).
- [ ] **Compuerta de Modularización Argus:** Mantener de forma irrestricta todos los archivos de `admin_l3` por debajo de 180 líneas.

### 4. Portal de Autogestión Standalone (Opcional / Fase de Cierre)
- [ ] Evaluar la creación de un template HTML ligero `public/gestion_turno.html?token=TK-XXXX` que permita simular de forma autónoma la consulta, reprogramación y cancelación de una cita con almacenamiento Local-First.

---
*Reporte certificado por `@Argus` bajo Protocolo PEAC de la Doctrina de Hierro Nexus OS v11.1.*

