// Archivo: .agent/workflows/debug.md
---
description: Comando de depuración sistemática. Activa el modo DEBUG para investigación médica de errores.
---

# /debug - Investigación Sistemática de Errores (Nexus OS v10.0)

$ARGUMENTS

---

## 🎯 Propósito
Este comando activa el modo DEBUG para la investigación metódica y resolución de errores, excepciones de runtime o comportamientos no deseados bajo el protocolo de la "Verdad Documentada".

---

## ⚙️ Protocolo de Ejecución

Cuando se activa `/debug`:

1. **Recolección de Evidencia:**
   - Mensaje de error y traza exacta de la consola/log.
   - Pasos detallados para reproducir el fallo.
   - Comportamiento esperado vs. comportamiento actual.
   - Cambios recientes en el repositorio.

2. **Diagnóstico Clínico (Vitalis & CircuitBreaker):**
   - Invocación de <Vitalis> si el fallo involucra la integridad del motor o la consola en caliente.
   - Armado de `CircuitBreaker.js`: Si las pruebas de corrección fallan consecutivamente 3 veces, ejecutar auto-rollback preventivo (`git stash` / `git checkout`) para proteger el código fuente.

3. **Formulación y Prueba de Hipótesis:**
   - Enumerar posibles causas ordenadas por probabilidad.
   - Probar cada hipótesis sistemáticamente analizando el flujo de datos.

4. **Remediación PEAC y Prevención:**
   - Aplicar el parche en archivo completo (PEAC).
   - Explicar la causa raíz.
   - Inyectar medidas preventivas o validaciones.

---

## 📋 Formato of Salida

```markdown
## 🔍 Debug: [Problema / Error]

### 1. Sintomatología
[Descripción clara de lo que está ocurriendo]

### 2. Evidencia Recolectada
- Error: `[mensaje de error]`
- Archivo: `[ruta del archivo]`
- Línea: [número de línea]

### 3. Hipótesis de Causa Raíz
1. ❓ [Causa más probable]
2. ❓ [Segunda posibilidad]
3. ❓ [Causa alternativa]

### 4. Investigación e Inspección
**Probando Hipótesis 1:**
[Qué se verificó] → [Resultado]

### 5. Causa Raíz
🎯 **[Explicación de por qué ocurrió el fallo]**

### 6. Solución Aplicada (PEAC)
```javascript
// Código corregido completo
```

### 7. Prevención y Blindaje
🛡️ [Cómo se evita que este error vuelva a ocurrir]
```
