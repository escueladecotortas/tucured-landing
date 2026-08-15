const fs = require('fs');
const path = require('path');

/**
 * Diccionario de Remediación Autónoma (VITALIS v2.0)
 * Mapea códigos de error a funciones de reparación.
 */
const RECETAS = {
    'MISSING_CRITICAL_ASSET': async (issue, baseDir) => {
        const fullPath = path.join(baseDir, issue.path);
        console.log(`🔧 [REMEDIO] Restaurando componente vital: ${issue.path}`);
        if (!issue.path.includes('.')) {
            // Es un directorio
            fs.mkdirSync(fullPath, { recursive: true });
            return `Carpeta '${issue.path}' creada exitosamente.`;
        }
        return `No se puede autoreparar archivos críticos inexistentes sin backup. Requiere intervención.`;
    },
    
    'MISSING_OPTIONAL_ASSET': async (issue, baseDir) => {
        const fullPath = path.join(baseDir, issue.path);
        console.log(`🔧 [REMEDIO] Creando componente recomendado: ${issue.path}`);
        if (!issue.path.includes('.')) {
            fs.mkdirSync(fullPath, { recursive: true });
            return `Directorio opcional '${issue.path}' restaurado.`;
        }
        return `Archivo opcional '${issue.path}' sigue pendiente.`;
    },

    'BROKEN_SKILL': async (issue, baseDir) => {
        const skillMdPath = path.join(issue.path, 'SKILL.md');
        const skillName = path.basename(issue.path);
        console.log(`🔧 [REMEDIO] Regenerando SKILL.md para: ${skillName}`);
        
        const template = `---
name: ${skillName}
description: Skill recuperado automáticamente por VITALIS v2.0.
---

# ${skillName}

Este skill fue detectado como corrupto o inexistente y ha sido restaurado con una estructura base.
Por favor, documentar las capacidades específicas aquí.
`;
        fs.writeFileSync(skillMdPath, template);
        return `Estructura de Skill '${skillName}' reparada.`;
    }
};

async function applyHealing(issues, baseDir) {
    const results = [];
    for (const issue of issues) {
        const receta = RECETAS[issue.code];
        if (receta) {
            try {
                const solution = await receta(issue, baseDir);
                results.push({ code: issue.code, status: 'FIXED', detail: solution });
            } catch (err) {
                results.push({ code: issue.code, status: 'FAILED', detail: err.message });
            }
        }
    }
    return results;
}

module.exports = { applyHealing };
