// Archivo: system_core/tools/sync_kernel.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MASTER_DIR = path.resolve(__dirname, '../../');

function getLocalTimestamp() {
    return new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function generateMasterManifest() {
    const manifestPath = path.join(MASTER_DIR, 'system_core', 'kernel_manifest.json');
    const filesToHash = {};

    function scanDir(dirPath, relBase = '') {
        if (!fs.existsSync(dirPath)) return;
        for (const item of fs.readdirSync(dirPath)) {
            if (['storage', 'telemetry', 'backups', 'dashboard', 'node_modules', '.git'].includes(item)) continue;
            const fullPath = path.join(dirPath, item);
            const relPath = path.join(relBase, item).replace(/\\/g, '/');
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    scanDir(fullPath, relPath);
                } else if (stat.isFile()) {
                    if (relPath === 'system_core/vitalis/latest_report.md' || relPath === '.agent/workflows/kanban.md') continue;
                    filesToHash[relPath] = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
                }
            } catch (e) {}
        }
    }

    scanDir(path.join(MASTER_DIR, '.agent'), '.agent');
    scanDir(path.join(MASTER_DIR, 'system_core'), 'system_core');

    const manifest = {
        version: "10.0.0",
        signature: "NEXUS_OS_V10_MANIFEST_SHA256",
        updatedAt: new Date().toISOString(),
        files: filesToHash
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    return manifest;
}

function copyRecursiveSync(src, dest, exclude = []) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(child => {
            if (exclude.includes(child)) return;
            copyRecursiveSync(path.join(src, child), path.join(dest, child), exclude);
        });
    } else {
        if (path.basename(dest).toLowerCase() === 'kanban.md' && fs.existsSync(dest)) return;
        fs.copyFileSync(src, dest);
    }
}

function syncAllProjects() {
    generateMasterManifest();
    const parentDir = path.resolve(MASTER_DIR, '../');
    const masterName = path.basename(MASTER_DIR).toLowerCase();
    const updated = [], errors = [];

    if (!fs.existsSync(parentDir)) {
        return { success: false, updatedCount: 0, details: [], error: 'Directorio padre no encontrado.' };
    }

    for (const item of fs.readdirSync(parentDir)) {
        if (item.toLowerCase() === masterName) continue;
        const fullPath = path.join(parentDir, item);
        try {
            if (!fs.statSync(fullPath).isDirectory()) continue;
            const hasAgent = fs.existsSync(path.join(fullPath, '.agent'));
            const hasCore = fs.existsSync(path.join(fullPath, 'system_core'));
            const hasKernel = fs.existsSync(path.join(fullPath, 'system_core/kernel.json'));

            if (hasAgent || hasCore || hasKernel) {
                const masterAgentDir = path.join(MASTER_DIR, '.agent');
                const targetAgentDir = path.join(fullPath, '.agent');
                const targetKanbanExists = fs.existsSync(path.join(targetAgentDir, 'workflows/kanban.md'));
                copyRecursiveSync(masterAgentDir, targetAgentDir, targetKanbanExists ? ['kanban.md'] : []);

                const masterCoreDir = path.join(MASTER_DIR, 'system_core');
                const targetCoreDir = path.join(fullPath, 'system_core');
                copyRecursiveSync(masterCoreDir, targetCoreDir, ['storage', 'telemetry', 'backups', 'dashboard']);

                const masterManifest = path.join(MASTER_DIR, 'system_core/kernel_manifest.json');
                if (fs.existsSync(masterManifest)) {
                    fs.copyFileSync(masterManifest, path.join(targetCoreDir, 'kernel_manifest.json'));
                    fs.copyFileSync(masterManifest, path.join(targetAgentDir, 'kernel_manifest.json'));
                }

                const pkgPath = path.join(fullPath, 'package.json');
                if (fs.existsSync(pkgPath)) {
                    try {
                        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
                        pkg.nexusVersion = "10.0.0";
                        if (!pkg.scripts) pkg.scripts = {};
                        if (!pkg.scripts["dev"] || pkg.scripts["dev"].includes("dashboard/server.js")) pkg.scripts["dev"] = "next dev";
                        pkg.scripts["doctor"] = "node system_core/vitalis/vitalis_doctor.js";
                        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
                    } catch (e) {}
                }

                updated.push({ name: item, path: fullPath, timestamp: getLocalTimestamp() });
            }
        } catch (err) {
            errors.push({ name: item, error: err.message });
        }
    }

    return { success: true, updatedCount: updated.length, updatedProjects: updated, errors, timestamp: getLocalTimestamp() };
}

if (require.main === module) {
    console.log(`🚀 Sincronizando Kernel Ecosistema Nexus OS v10.0...`);
    const r = syncAllProjects();
    console.log(`✅ Finalizado: ${r.updatedCount} subproyectos al día.`);
}

module.exports = { generateMasterManifest, syncAllProjects };
