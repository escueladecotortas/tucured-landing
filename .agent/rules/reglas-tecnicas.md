// Archivo: .agent/rules/reglas-tecnicas.md
---
trigger: always_on
---

# REGLAS TÉCNICAS (DOCTRINA DE HIERRO - NEXUS OS v10.0)

> **MANDATORY:** Estas reglas son VINCULANTES para todos los agentes (Codi, Atenea, Kael, Argus) y anulan cualquier instrucción contraria.

## 1. EL STACK OFICIAL (Cero Alucinación)

| Capa          | Tecnología Oficial | Versión / Regla                                                 |
| :------------ | :----------------- | :-------------------------------------------------------------- |
| **Frontend**  | **Next.js**        | v15 (App Router). CSR solo donde sea necesario (`use client`).  |
| **Styling**   | **Tailwind CSS**   | v4.0. Uso de variables CSS nativas. Zero runtime-in-js.         |
| **Language**  | **JavaScript**     | ES6+ Modules. Preferimos JS plano a TS complejo para velocidad. |
| **Database**  | **Agnóstica / DB_TARGET** | Única Fuente de Verdad (SSOT) definida por entorno. Prioridad de almacenamiento Local-First. |
| **Animation** | **Framer Motion**  | Solo si es estrictamente necesario para UI vibracional.          |
| **Icons**     | **Lucide React**   | Estándar de iconos. Prohibido FontAwesome.                      |

### 🚫 Lista Negra (Prohibido Instalar)
- Bootstrap, Material UI, Chakra UI (Usar Tailwind v4).
- Redux (Usar Context API o Zustand ultra-light).
- Express (Usar Next.js API Routes / App Router para backend).
- jQuery (Obsoleto).

---

## 2. LEY DE 200 LÍNEAS (MANDATORIA)
Ningún archivo de código de lógica o componente UI puede superar las **200 líneas**.
- **Acción Preventiva:** Si un archivo alcanza las 180 líneas durante su construcción, DEBES refactorizar inmediatamente en sub-componentes o submódulos atómicos antes de continuar.
- **Excepción:** Archivos de configuración global estricta o manifiestos del motor Antigravity con densidad justificada.

---

## 3. PROTOCOLO SOCRÁTICO (GATEKEEPER DE REQUERIMIENTOS)
Antes de escribir código complejo para requerimientos ambiguos, los agentes deben validar presupuestos y lógica previa. Si la instrucción viene empaquetada como "Prompt de Ingeniería" por Jonas, la orden se ejecuta de inmediato bajo el principio de Fricción Cero.

---

## 4. CÓDIGO LIMPIO & PEAC (CLEAN CODE)
1. **Protocolo PEAC:** Entregas de archivo COMPLETO. Prohibidos snippets, parches o código truncado.
2. **Nombres en Inglés:** Variables, funciones y clases strictly en **INGLÉS** (`getUser`, `className`).
3. **Comentarios en Español:** Documentación y explicaciones técnicas en **ESPAÑOL** (`// Calcula el total`).
4. **No Spanglish Código:** `function obtenerUser()` ❌ -> `function getUser()` ✅.
5. **No Hardcoding:** Constantes y cadenas de texto largas deben aislarse en variables de configuración o `.env`.

---

## 5. SEGURIDAD & INTEGRIDAD LOCAL-FIRST
1. **Secretos:** Jamás hardcodear credenciales o claves en el cliente. Usar `.env`.
2. **Validación:** Validar siempre los datos de entrada tanto en frontend como en endpoints backend.
3. **Resiliencia Git:** Mantener activos los monitores de `CircuitBreaker.js` ante cambios destructivos.
