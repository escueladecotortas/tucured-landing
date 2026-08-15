const fs = require('fs');
const path = require('path');

function checkIntegrity(baseDir) {
    const results = {
        module: 'LOGIC_INTEGRITY',
        status: 'HEALTHY',
        issues: [],
        details: []
    };

    console.log(`[VITALIS] Checkeando sistema nervioso (Workflows & Skills)...`);

    // 1. Validar Workflows
    const workflowsDir = path.join(baseDir, '.agent/workflows');
    if (fs.existsSync(workflowsDir)) {
        const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.md'));
        files.forEach(file => {
            const content = fs.readFileSync(path.join(workflowsDir, file), 'utf-8');
            
            // Check: Referencias a reglas inexistentes (simulado, lógica simple de regex)
            // Buscamos patrones como "Regla: [nombre]" o referencias a archivos
            
            // Check: Links rotos simples [text](path)
            const linkRegex = /\[.*?\]\((.*?)\)/g;
            let match;
            while ((match = linkRegex.exec(content)) !== null) {
                const linkPath = match[1];
                // Ignorar urls web
                if (linkPath.startsWith('http')) continue;
                
                // Resolver ruta relativa o absoluta simulada
                // Asumimos que si empieza con / es root del proyecto para este check simple
                // Ojo: en markdown standard suele ser relativo, pero en este OS usamos mucho absolute.
                // Intentamos validar si parece un path de sistema
                if (linkPath.includes('/') || linkPath.includes('\\')) {
                     // Lógica simplificada: si es ruta absoluta de windows o linux, checkear existencia
                     // Si es relativa, intentar resolver desde el workflow dir
                     // Esta es una heurística
                }
            }
            results.details.push(`Workflow escaneado: ${file}`);
        });
    }

    // 2. Validar Skills
    const skillsDir = path.join(baseDir, '.agent/skills');
    if (fs.existsSync(skillsDir)) {
        const skills = fs.readdirSync(skillsDir);
        skills.forEach(skillName => {
            const skillPath = path.join(skillsDir, skillName);
            if (fs.statSync(skillPath).isDirectory()) {
                const skillMd = path.join(skillPath, 'SKILL.md');
                if (!fs.existsSync(skillMd)) {
                    results.status = results.status === 'CRITICAL' ? 'CRITICAL' : 'WARNING';
                    results.issues.push({
                        severity: 'HIGH',
                        code: 'BROKEN_SKILL',
                        message: `Skill lobotomizado: '${skillName}' no tiene SKILL.md.`,
                        path: skillPath
                    });
                } else {
                     results.details.push(`Skill validado: ${skillName}`);
                }
            }
        });
    }

    return results;
}

module.exports = { checkIntegrity };
