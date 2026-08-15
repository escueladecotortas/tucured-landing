// Archivo: .agent/rules/config-entorno.md
---
trigger: always_on
---

# CONFIGURACIÓN DE ENTORNO CRÍTICO (NEXUS OS v10.0)

## Ubicación y Persistencia de Activos
- **Soberanía de Datos Local-First:** La persistencia primaria se rige por `LOCAL_FIRST_STORAGE=true`. La base de datos objetivo se define dinámicamente mediante `DB_TARGET`.
- **Directorio de Especialistas:** `system_core/agents/core/` (Ruta mandatoria para la matriz de prompts L3).
- **Panel de Control:** Dashboard de administración activo en `http://localhost:3000/nexus-admin`.

## Directiva de Seguridad, Lazy Loading e Integridad
- **Regla de Lazy Loading (Perezoso):** Los prompts L3 residen inactivos en disco. El orquestador L1 solo leerá el manifiesto `_pro.md` en caliente cuando el rol sea requerido, optimizando el contexto de tokens.
- **Protocolo de Fallo:** Ante errores de ejecución o red, realizar un reintento silencioso y ejecutar diagnóstico con `Vitalis` antes de emitir alertas críticas.
