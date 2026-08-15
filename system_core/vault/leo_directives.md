// Archivo: system_core/vault/leo_directives.md
# DIRECTIVAS SOBERANAS DE LEO (PRODUCT OWNER // NEXUS OS v10.0)

Este documento condensa los principios operativos no negociables y las directivas de ingeniería establecidas por Leo para el enjambre de agentes y el desarrollo de software en el ecosistema.

---

## 1. SOBERANÍA DIGITAL & LOCAL-FIRST
- **Persistencia Primaria:** Todo dato, estado o telemetría debe residir en almacenamiento local bajo la premisa `LOCAL_FIRST_STORAGE=true`.
- **Base de Datos Agnóstica:** La persistencia se rige por `DB_TARGET` definido dinámicamente según el entorno.
- **Independencia Operativa:** El ecosistema debe funcionar de forma autónoma sin depender de servicios externos en la nube para su operación básica.

---

## 2. FRICCIÓN CERO & PROTOCOLO PEAC
- **Carga Cognitiva:** El sistema y los agentes asumen el 100% de la carga técnica. Leo realiza el mínimo esfuerzo.
- **Entrega de Archivos Completos (PEAC):** Prohibido entregar parches, snippets o fragmentos truncados. Toda intervención entrega el archivo íntegro y funcional.
- **Identificación Obligatoria:** La primera línea de cada archivo de código debe indicar su ruta: `// Archivo: path/to/file.ext` o `<!-- Archivo: path/to/file.ext -->`.

---

## 3. DOCTRINA DE HIERRO & LEY DE LAS 200 LÍNEAS
- **Límite Estricto:** Ningún archivo de lógica o componente UI puede superar las 200 líneas.
- **Umbral de Alerta Temprana (180 Líneas):** Si un archivo alcanza las 180 líneas, debe refactorizarse inmediatamente en submódulos o componentes atómicos antes de continuar.
- **Nomenclatura Limpia:** Variables, funciones y clases en inglés (`getUser`, `className`); comentarios y documentación en español (`// Calcula el total`).

---

## 4. ERRADICACIÓN DE POESÍA VACÍA & RIGOR TÉCNICO
- **Métricas Duras:** Los reportes de Vitalis, logs de telemetría y diagnósticos deben contener datos empíricos, números de línea, rutas y métricas verificables.
- **Cero Fluff:** Eliminar prosa innecesaria, metáforas vacías y retórica decorativa. Respuestas directas, concisas y orientadas a la acción técnica.

---

## 5. DASHBOARD: TELEMETRÍA Y CONTROL DE SOLO LECTURA
- **Inspección Pura:** El Dashboard opera como un panel de telemetría, inspección y monitoreo (Read-Only).
- **Mutaciones Constitucionales:** Las modificaciones de estado en el Kanban o proyectos están reservadas exclusivamente a los flujos soberanos de trabajo (`/iniciar-sesion`, `/cerrar-sesion`, `/tareas`).

---

## 6. SILENCIO DE FONDO & ASAMBLEA TÉCNICA
- **Identidad Única de Agentes:** Cada agente especialista (Atenea, Codi, Argus, Kael, Vitalis, Elara) opera con su propia voz y competencia técnica sin interferencias del orquestador.
- **Autodiagnóstico Silencioso:** Ante fallos, el enjambre realiza diagnósticos autónomos y propone soluciones estructuradas antes de requerir intervención humana.
