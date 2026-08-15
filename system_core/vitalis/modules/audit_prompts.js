// Archivo: audit_prompts.js
const fs = require('fs');
const path = require('path');

function auditPrompts(baseDir) {
    const results = {
        module: 'COGNITIVE_AUDIT',
        status: 'HEALTHY',
        issues: [],
        details: []
    };

    console.log(`[VITALIS] Psicoanalizando Agentes (Análisis Constitucional v2.0)...`);

    const agentsDir = path.join(baseDir, 'system_core/agents');
    
    // Mapeo de identidad
    let files = [];
    const dirsToCheck = [agentsDir, path.join(agentsDir, 'core'), path.join(agentsDir, 'operativos')];
    dirsToCheck.forEach(dir => {
        if (fs.existsSync(dir)) {
            const dirFiles = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());
            // Guardamos con ruta relativa para poder leerlos después
            const relPath = dir === agentsDir ? '' : path.basename(dir) + '/';
            files.push(...dirFiles.map(f => relPath + f));
        }
    });
    const agentBasenames = new Set();
    
    files.forEach(f => {
        if (f.endsWith('.json')) agentBasenames.add(f.replace('.json', ''));
        if (f.endsWith('_pro.md')) agentBasenames.add(f.replace('_pro.md', ''));
    });

    agentBasenames.forEach(agent => {
        const jsonPath = path.join(agentsDir, `${agent}.json`);
        const proPath = path.join(agentsDir, `${agent}_pro.md`);
        
        const hasJson = fs.existsSync(jsonPath);
        const hasPro = fs.existsSync(proPath);

        if (hasJson && !hasPro) {
            results.issues.push({
                severity: 'MEDIUM',
                code: 'IDENTITY_FRAGMENTED',
                message: `Agente '${agent}' tiene configuración base pero le falta su Alma (_pro.md).`,
                path: proPath
            });
        } else if (!hasJson && hasPro) {
             results.issues.push({
                severity: 'LOW',
                code: 'GHOST_IDENTITY',
                message: `Agente '${agent}' es puro espíritu (_pro.md) sin cuerpo físico (.json).`,
                path: jsonPath
            });
        }

        if (hasPro) {
            const content = fs.readFileSync(proPath, 'utf-8');
            const lower = content.toLowerCase();
            
            // --- Criterios Constitucionales Inteligentes ---
            
            // 1. Detección de Identidad Flexible (Regex Estirado)
            // Busca headers (#) seguidos opcionalmente de números o texto, y luego palabras clave.
            // Ejemplos válidos: "# IDENTITY", "## 1. Identidad", "### Perfil:", "**Role:**"
            const identityRegex = /(^|\n)#+\s*(\d+\.?\s*)?(identidad|identity|perfil|profile|rol|role|misión|mission|manifiesto|manifesto)/i;
            const roleRegex = /(\*\*|##)\s*(Role|Rol|Función)\s*:?/i;
            
            const hasIdentity = identityRegex.test(content) || roleRegex.test(content);
            
            if (!hasIdentity) {
                 results.issues.push({
                    severity: 'MEDIUM',
                    code: 'IDENTITY_CRISIS',
                    message: `Agente '${agent}' no presenta una declaración de identidad clara (Se buscó: # Identidad/Perfil/Role).`,
                    path: proPath
                });
            } else {
                 results.details.push(`Analyzed ${agent}: Identity Validated ✅`);
            }

            // 2. Detección de Contradicciones Logicas (Constitutional AI - Basic Check)
            // Busca conflictos directos con las "Reglas de Hierro"
            
            // Regla: Idioma Español
            if (lower.includes('always speak english') || lower.includes('respond in english')) {
                 if (!lower.includes('unless') && !lower.includes('except')) {
                     results.issues.push({
                        severity: 'LOW',
                        code: 'CONSTITUTIONAL_VIOLATION_LANGUAGE',
                        message: `Agente '${agent}' viola la Soberanía Lingüística (Instrucción forzada de inglés detectada).`,
                        path: proPath
                    });
                 }
            }

            // Regla: No Lorem Ipsum
            if (lower.includes('lorem ipsum')) {
                 // Heurística mejorada: buscar contexto negativo amplio
                 const loremIndex = lower.indexOf('lorem ipsum');
                 const contextStart = Math.max(0, loremIndex - 50);
                 const contextStr = lower.substring(contextStart, loremIndex);
                 
                 // Palabras de negación o prohibición (Ahora incluye lógica de Gatekeeper)
                 const negations = ['no ', 'never ', 'prohibido', 'forbidden', 'avoid', 'stop', 'don\'t', 'sin ', 'detect', 'bloque', 'rechaz', 'veto'];
                 const isNegated = negations.some(neg => contextStr.includes(neg));

                 if (!isNegated) {
                     results.issues.push({
                        severity: 'HIGH',
                        code: 'CONSTITUTIONAL_VIOLATION_QUALITY',
                        message: `Agente '${agent}' promueve mediocridad (Uso de Lorem Ipsum detectado sin prohibición explícita).`,
                        path: proPath
                    });
                 }
            }

            // 3. Análisis de Tono (Vibrational Check)
            // Si el agente es "Creativo" (Atenea), no debería ser "Robótico".
            if (agent === 'atenea' && (lower.includes('be robotic') || lower.includes('act like a machine'))) {
                results.issues.push({
                    severity: 'MEDIUM',
                    code: 'VIBRATIONAL_MISMATCH',
                    message: `Agente '${agent}' tiene vibración baja (Instrucción de comportamiento robótico).`,
                    path: proPath
                });
            }
        }
    });

    if (results.issues.length > 0 && results.status === 'HEALTHY') results.status = 'WARNING';

    return results;
}

module.exports = { auditPrompts };
