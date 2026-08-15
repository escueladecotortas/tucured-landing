// Archivo: system_core/vault/architectures.md
# PATRONES ARQUITECTÓNICOS DE REFERENCIA (NEXUS OS v10.0)

Este documento define las tres arquitecturas arquetípicas estándar para el desarrollo de nuevas aplicaciones en el ecosistema Nexus OS.

---

## 1. PATRÓN A: LANDING PAGE VIBRACIONAL

### Propósito
Sitios promocionales, páginas de captura de leads y portafolios de alta conversión con estética premium.

### Stack Técnico
- **Framework:** Next.js v15 (App Router) / Static Site Generation (SSG).
- **Estilos:** Tailwind CSS v4 con variables CSS nativas y diseño responsivo.
- **Tipografía:** `Plus Jakarta Sans` para titulares y cuerpo.
- **Iconografía:** `Lucide React` nativo.

### Estructura de Módulos (< 200 Líneas)
```
app/
├── layout.jsx        // HTML shell, fuentes y metadatos SEO
├── page.jsx          // Ensamblado atómico de secciones
└── components/
    ├── Hero.jsx      // Propuesta de valor, CTA principal y badges
    ├── Features.jsx  // Grid de características y diferenciales
    ├── Metrics.jsx   // KPIs y prueba social con contadores
    ├── Pricing.jsx   // Tabla de planes o cotizador interactivo
    └── Footer.jsx    // Navegación secundaria y créditos
```

---

## 2. PATRÓN B: EXECUTIVE CONTROL DASHBOARD

### Propósito
Paneles de administración, telemetría de flota, control operativo y visualización analítica en tiempo real.

### Stack Técnico
- **Framework:** Next.js v15 (CSR con `use client` para componentes interactivos) o Node.js HTTP Server nativo ultra-light.
- **Visualización:** Chart.js para dashboards analíticos sin librerías pesadas.
- **Estilos:** Tailwind CSS v4 en modo Dark Slate (`#090d16`) con acentos Ámbar (`#f59e0b`).
- **Terminal & Logs:** Stream invertido (Newest First) con filtrado por nivel de severidad.

### Estructura de Módulos (< 200 Líneas)
```
system_core/dashboard/
├── index.html            // Layout principal y contenedores semánticos
├── dashboard_ui.js       // Controladores de eventos, filtros y vistas
├── dashboard_charts.js   // Instanciación y actualización de Chart.js
├── server.js             // Router HTTP, servicio estático y API REST
├── server_actions.js     // Integración Win32, telemetría y subprocesos
└── kanban_parser.js      // Parser estricto de Markdown a JSON
```

---

## 3. PATRÓN C: MICRO-SAAS LOCAL-FIRST

### Propósito
Aplicaciones web funcionales con persistencia local soberana, autenticación ligera y APIs modulares.

### Stack Técnico
- **Persistencia:** Almacenamiento Local-First con SSOT en SQLite (`better-sqlite3`) o JSON Stores atómicos.
- **Backend:** Next.js Route Handlers (`app/api/**/route.js`).
- **Validación:** Esquemas declarativos de datos en entrada/salida.
- **Estado:** React Context API o Zustand ultra-light (cero Redux).

### Estructura de Módulos (< 200 Líneas)
```
app/
├── api/
│   └── [resource]/route.js   // Endpoints CRUD con validación estricta
├── [resource]/
│   ├── page.jsx              // Vista principal del módulo
│   └── components/           // Formularios y tablas de datos
└── lib/
    ├── db.js                 // Conexión y migraciones Local-First
    └── validators.js         // Validadores de entrada
```
