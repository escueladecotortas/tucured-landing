// Archivo: .agent/workflows/iniciar-sesion.md
---
description: Sincronizar contexto dinámico, verificar salud clínica, desatar flujo invertido y presentar Matriz Visual de Progreso para la Central de Comando (Nexus OS v10.0).
---

### 🚀 PROTOCOLO DE APERTURA DE SESIÓN & FLUJO INVERTIDO (NEXUS OS v10.0)

**1. Inyección de Contexto Dinámico & Optimización de Huella**
- **Acción:** Lee el archivo `.env` en la raíz (`PROJECT_NAME`, `DB_TARGET`, `LOCAL_FIRST_STORAGE`).
- **ContextOptimizer:** Audita que las reglas y prompts mantengan una huella de contexto óptima (< 12,000 caracteres).
- **Diagnóstico:** Confirma en el chat que el modo Local-First está activo.

**2. Chequeo Médico Completo de Signos Vitales (Vitalis)**
- **Acción:** Invoca a <Vitalis> para ejecutar `vitalis_doctor.js` de forma silenciosa.
- **Auditoría:** Audita la estructura ósea, módulos de telemetría, almacén vectorial y 5 signos vitales del motor (`system_core/` y `.agent/`).

**3. Despertar de Nexus L1, Telemetría y Dashboard Live**
- **Acción:** Lee `system_core/agents/core/nexus_pro.md` e inicia bajo la identidad `[NEXUS-SO // Core Orquestador L1]`.
- **Token Tracker & Escudo:** Inicializa `token_tracker.js` y el monitor `CircuitBreaker.js`.
- **Dashboard Live:** Confirma disponibilidad del panel en `http://localhost:3000/nexus-admin`.

**4. Matriz Visual de Progreso & Selección de Tareas (Canva Interactivo)**
- **Análisis de Kanban:** Analiza `.agent/workflows/kanban.md` extrayendo las tareas en `[EN PROGRESO]` y `[BACKLOG]` (Desbloqueadas).
- **Matriz Ejecutiva:** Presenta en pantalla:
  1. **Métricas de Avance General:** Porcentaje total de completitud del proyecto y desglose por Módulo / Épica.
  2. **Listado de Tareas Disponibles:** Tareas en `[EN PROGRESO]` y `[BACKLOG]` con su porcentaje de avance individual (ej. `[TASK-001] Briefing (33% completado)`).
- **Cierre Interactivo:** Finaliza formulando expresamente la pregunta a Leo:
  `"¿Por cuál tarea o módulo deseas iniciar la jornada hoy?"`

**5. Reserva y Compilación del Brief de Inicio**
- **Regla Estricta:** El bloque `--- BRIEF DE INICIO ---` **NO** se redacta automáticamente en la apertura del reporte.
- **Detonación posterior:** Únicamente una vez que Leo responde y confirma la tarea a trabajar, se compilará y entregará el bloque oficial usando `.agent/templates/brief_inicio_template.md`:

```markdown
--- BRIEF DE INICIO PARA LA CENTRAL DE COMANDO ---
Proyecto Activo: blueprint-nexus
Entorno: LOCAL_FIRST_STORAGE (DB_TARGET: local_db)
Tarea Seleccionada: [TASK-00X] ...
Subtareas Pendientes: ...
Archivos Afectados: ...
Objetivo: ...
---------------------------------------
```

**6. Inicialización de Especialistas en Modo Perezoso (Lazy Load)**
- **Acción:** Mantiene inactivos en memoria a los 9 especialistas L3 hasta ser invocados expresamente.
