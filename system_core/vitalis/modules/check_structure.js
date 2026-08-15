// Archivo: system_core/vitalis/modules/check_structure.js
const fs = require('fs');
const path = require('path');

// Estructura crítica esperada desacoplada para la fase inicial del motor
const CRITICAL_PATHS = [
    { path: 'backend', type: 'dir', critical: false, initialPhaseOptional: true },
    { path: 'frontend', type: 'dir', critical: false, initialPhaseOptional: true },
    { path: 'system_core', type: 'dir', critical: true },
    { path: 'system_core/kernel.json', type: 'file', critical: true },
    { path: '.agent', type: 'dir', critical: true },
    { path: '.agent/templates', type: 'dir', critical: false },
    { path: '.agent/skills', type: 'dir', critical: false },
    { path: 'package.json', type: 'file', critical: false },
    { path: '.env', type: 'file', critical: false },
    { path: 'system_core/agents', type: 'dir', critical: true },
    { path: 'system_core/storage/vector', type: 'dir', critical: false },
    { path: 'system_core/tools/VectorStoreTools.js', type: 'file', critical: false },
    { path: 'system_core/tools/init_new_project.js', type: 'file', critical: false },
    { path: 'system_core/tools/import_project.js', type: 'file', critical: false },
    { path: 'system_core/engine/CircuitBreaker.js', type: 'file', critical: false },
    { path: 'system_core/telemetry', type: 'dir', critical: false },
    { path: 'system_core/telemetry/token_tracker.js', type: 'file', critical: false },
    { path: 'system_core/engine/ContextOptimizer.js', type: 'file', critical: false },
    { path: 'system_core/tools/MockFactoryTools.js', type: 'file', critical: false },
    { path: 'system_core/dashboard', type: 'dir', critical: false }
];

function checkStructure(baseDir, options = { isInitialEnginePhase: true }) {
    const results = {
        module: 'STRUCTURAL_INTEGRITY',
        status: 'HEALTHY',
        issues: [],
        details: []
    };

    console.log(`[VITALIS] Checkeando estructura ósea del sistema...`);

    CRITICAL_PATHS.forEach(item => {
        const fullPath = path.join(baseDir, item.path);
        const exists = fs.existsSync(fullPath);
        const isCritical = item.critical && !(options.isInitialEnginePhase && item.initialPhaseOptional);
        
        if (exists) {
            const stats = fs.statSync(fullPath);
            const isDir = stats.isDirectory();
            const isFile = stats.isFile();
            
            if (item.type === 'dir' && !isDir) {
                results.issues.push({
                    severity: 'HIGH',
                    code: 'WRONG_TYPE_DIR',
                    message: `Se esperaba directorio en '${item.path}' pero es un archivo.`,
                    path: item.path
                });
            } else if (item.type === 'file' && !isFile) {
                results.issues.push({
                    severity: 'HIGH',
                    code: 'WRONG_TYPE_FILE',
                    message: `Se esperaba archivo en '${item.path}' pero es un directorio.`,
                    path: item.path
                });
            } else {
                results.details.push(`OK: ${item.path}`);
            }
        } else {
            if (isCritical) {
                results.status = 'CRITICAL';
                results.issues.push({
                    severity: 'CRITICAL',
                    code: 'MISSING_CRITICAL_ASSET',
                    message: `Falta componente vital: '${item.path}' no encontrado.`,
                    path: item.path
                });
            } else {
                if (results.status !== 'CRITICAL') results.status = 'WARNING';
                results.issues.push({
                    severity: 'INFO',
                    code: 'MISSING_OPTIONAL_ASSET',
                    message: `Falta componente recomendado o en construcción: '${item.path}'.`,
                    path: item.path
                });
            }
        }
    });

    return results;
}

module.exports = { checkStructure };
