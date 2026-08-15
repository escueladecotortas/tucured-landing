// Archivo: system_core/vitalis/vitalis_doctor.js
const fs = require('fs');
const path = require('path');

const { checkStructure } = require('./modules/check_structure');
const { checkIntegrity } = require('./modules/check_integrity');
const { auditPrompts } = require('./modules/audit_prompts');
const { simulateEcosystem } = require('./modules/simulate_ecosystem');
const { analyzeLogs } = require('./modules/analyze_logs');
const { generateReport } = require('./reporter');
const { applyHealing } = require('./remediation_logic');

function scanKernelFiles(baseDir) {
    let count = 0;
    const over180 = [];
    function scan(dir) {
        if (!fs.existsSync(dir)) return;
        for (const item of fs.readdirSync(dir)) {
            if (['node_modules', '.git', '.next', 'backups', 'storage'].includes(item)) continue;
            const full = path.join(dir, item);
            try {
                const s = fs.statSync(full);
                if (s.isDirectory()) scan(full);
                else if (s.isFile() && (full.endsWith('.js') || full.endsWith('.json') || full.endsWith('.md') || full.endsWith('.html'))) {
                    count++;
                    const lines = fs.readFileSync(full, 'utf-8').split('\n').length;
                    if (lines > 180 && !full.includes('node_modules') && !full.includes('kernel_manifest.json')) {
                        over180.push(`${path.relative(baseDir, full)} (${lines} líneas)`);
                    }
                }
            } catch (e) {}
        }
    }
    scan(path.join(baseDir, '.agent'));
    scan(path.join(baseDir, 'system_core'));
    return { fileCount: count, over180Files: over180 };
}

async function runDiagnostic() {
    console.log(`\n🩺 [VITALIS DOCTOR v2.0] Iniciando auditoría técnica del Kernel...\n`);

    let baseDir = process.cwd();
    if (baseDir.endsWith('backend')) baseDir = path.join(baseDir, '..');
    if (baseDir.endsWith('system_core')) baseDir = path.join(baseDir, '..');
    if (baseDir.endsWith('vitalis')) baseDir = path.join(baseDir, '../..');

    console.log(`[VITALIS DOCTOR] Workspace: ${baseDir}\n`);

    const diagnosis = [];
    diagnosis.push(checkStructure(baseDir));
    diagnosis.push(checkIntegrity(baseDir));
    diagnosis.push(auditPrompts(baseDir));
    diagnosis.push(await simulateEcosystem(baseDir));
    diagnosis.push(analyzeLogs(baseDir));

    const metrics = scanKernelFiles(baseDir);

    const issues = diagnosis.flatMap(d => d.issues);
    let healingResults = [];
    if (issues.length > 0) {
        console.log(`[VITALIS DOCTOR] Detectadas ${issues.length} incidencias. Ejecutando saneamiento...`);
        healingResults = await applyHealing(issues, baseDir);
    }

    const reportPath = generateReport(diagnosis, baseDir, healingResults, metrics);

    return {
        timestamp: new Date().toISOString(),
        diagnosis,
        healingResults,
        reportPath,
        overallStatus: diagnosis.some(d => d.status === 'CRITICAL') ? 'CRITICAL' : (diagnosis.some(d => d.status === 'WARNING') ? 'WARNING' : 'HEALTHY')
    };
}

if (require.main === module) {
    runDiagnostic().then(r => {
        console.log(`\n✅ Diagnóstico técnico finalizado.`);
        console.log(`📄 Reporte disponible en: ${r.reportPath}`);
        console.log(`✨ Estado general: ${r.overallStatus}\n`);
    }).catch(err => {
        console.error("FATAL ERROR IN VITALIS CORE:", err);
    });
}

module.exports = { runDiagnostic };
