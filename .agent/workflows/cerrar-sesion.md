// Archivo: .agent/workflows/cerrar-sesion.md
---
description: Recepción del Brief de Cierre, actualización de Kanban v2.0, bitácora, telemetría y traspaso a guardia de Chronos (Nexus OS v10.0).
---

### 🛑 PROTOCOLO DE CIERRE ADMINISTRATIVO & CONSOLIDACIÓN DUAL (NEXUS OS v10.0)

**1. RECEPCIÓN DEL BRIEF DE CIERRE (<agente>)**
- **Acción:** Leo pega el Brief de Cierre de 10 Puntos entregado por el <agente> (basado en `.agent/templates/brief_cierre_template.md`).

**2. CONSOLIDACIÓN DE ACTIVOS Y TELEMETRÍA**
- **Actualización de Kanban Master v2.0:**
  1. Mueve las tareas finalizadas de `[IN_PROGRESS]` o `[BACKLOG]` hacia `[DONE]`.
  2. Actualiza el estado de las subtareas completadas (`- [x]`).
  3. Mueve nuevos pendientes e ideas al bloque `## 🧠 BANCO DE IDEAS & REFACTORINGS FUTUROS`.
- **Bitácora de Sesión:** Guarda el informe consolidado en `bitacora/indice_pendientes.md` asociando fecha, logros y pendientes.
- **Registro de Telemetría:** Lee `system_core/telemetry/token_tracker.js` e inyecta las métricas de consumo de tokens y latencia de la jornada.

**3. AUTO-COSECHA DE SKILLS**
- Si el punto 8 del Brief de Cierre reporta "Nuevas formas de trabajo/skills", crea autónomamente la carpeta y el manifiesto correspondiente en `.agent/skills/`.

**4. GUARDIANÍA Y ASEGURAMIENTO (Chronos)**
- **Acción:** Invoca a <Chronos> para asumir el control de monitoreo en modo `LOCAL_FIRST_STORAGE`.
- **Firma de Cierre:** Responde confirmando el aseguramiento local con la firma:
  "Sesión Administrativa Cerrada (Nexus OS v10.0). Archivos, Kanban v2.0 y telemetría asegurados localmente. Chronos asumiendo guardia en segundo plano."
