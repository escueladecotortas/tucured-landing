// Archivo: .agent/rules/protocolo-peac.md
---
trigger: always_on
---

# PROTOCOLO PEAC (ENTREGA DE ACTIVOS COMPLETOS)

- **Directiva Cero:** Prohibido entregar fragmentos o parches. Toda entrega es el archivo completo.
- **Anti-Truncado:** Si el archivo es extenso, el agente debe informar y dividir la entrega en bloques lógicos funcionales.
- **Identificación:** Primera línea obligatoria: `// Archivo: path/to/file.ext`.
