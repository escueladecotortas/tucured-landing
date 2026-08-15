// Archivo: .agent/workflows/tareas.md
---
description: Consultar el estado del Kanban v2.0 de forma estrictamente de solo lectura y desplegar la recomendación táctica del equipo.
---

### 📋 PROTOCOLO DE GESTIÓN Y PRIORIZACIÓN DE TAREAS (/tareas)

> **MODO DE OPERACIÓN:** ESTRICTAMENTE DE SOLO LECTURA (READ-ONLY).

**1. Lectura Semántica del Kanban Master v2.0**
- **Acción:** Lee y parsea `.agent/workflows/kanban.md`.
- **Clasificación:** Organiza las tareas en las siguientes categorías visuales:
  - 🔵 **En Progreso (`[IN_PROGRESS]`):** Tareas actualmente activas.
  - 🟢 **Tareas Listas para Ejecutar:** Tareas de `[BACKLOG]` sin bloqueos activos (Backlog Desbloqueado).
  - 🔴 **Tareas Bloqueadas:** Tareas de `[BACKLOG]` que esperan la resolución de dependencias (`*[BLOQUEADA POR: TASK-XXX]*`).

**2. Despliegue de Resumen Sintético**
Muestra en consola un resumen limpio y estructurado:
```
📋 TABLERO KANBAN MASTER v2.0 (NEXUS OS v10.0) [READ-ONLY]
---------------------------------------------------------
🔵 TAREAS EN PROGRESO:
   - [TASK-XXX] ...

🟢 TAREAS LISTAS PARA EJECUTAR:
   - [TASK-001] Definición del Briefing... (DESTRABA: TASK-002)

🔴 TAREAS BLOQUEADAS:
   - [TASK-002] Configuración de Entorno... (ESPERA: TASK-001)

💡 RECOMENDACIÓN TÁCTICA:
   - [TASK-001] Título de la tarea prioritaria recomendada.
```

**3. Algoritmo de Identificación de Prioridad y Recomendación Táctica**
- Identifica la tarea de `[BACKLOG]` no bloqueada con mayor impacto para destrabar el tablero (`*[DESTRABA: TASK-XXX]*`).
- Despliega la Recomendación Táctica argumentada.

**4. Cierre del Protocolo (Solo Lectura)**
- **REGLA DE ORO:** Prohibido modificar `.agent/workflows/kanban.md` durante `/tareas`.
- **ELIMINADO:** No se redacta ni despliega el bloque `--- BRIEF DE INICIO ---`.
- Concluir el protocolo **únicamente** con la pregunta:
  `"¿Cuál de estas tareas deseas activar o trabajar en esta jornada?"`
