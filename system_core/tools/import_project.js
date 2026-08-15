// Archivo: system_core/tools/import_project.js
const fs = require('fs');
const path = require('path');
const { generateMasterManifest } = require('./sync_kernel');

function getLocalTimestamp() {
    return new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function copyRecursiveSync(src, dest, exclude = []) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            if (exclude.includes(childItemName)) return;
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), exclude);
        });
    } else {
        if (path.basename(dest).toLowerCase() === 'kanban.md' && fs.existsSync(dest)) return;
        fs.copyFileSync(src, dest);
    }
}

function createBackup(targetPath, projName) {
    const backupBaseDir = path.join(__dirname, '../../system_core/storage/backups');
    if (!fs.existsSync(backupBaseDir)) fs.mkdirSync(backupBaseDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(backupBaseDir, `BACKUP_${projName.toUpperCase()}_${timestamp}`);
    copyRecursiveSync(targetPath, backupFolder, ['.git', 'node_modules', '.next', 'backups', 'telemetry', 'storage', 'dashboard']);
    return backupFolder;
}

function importProject({ sourceDir, dryRun = false }) {
    if (!sourceDir) throw new Error("La ruta del proyecto es obligatoria.");
    const targetPath = path.resolve(sourceDir);
    if (!fs.existsSync(targetPath)) throw new Error(`El directorio '${targetPath}' no existe.`);

    const projName = path.basename(targetPath).toLowerCase();
    const pkgPath = path.join(targetPath, 'package.json');
    const hasPkg = fs.existsSync(pkgPath);

    if (dryRun) return { compatible: true, projectPath: targetPath, projectName: projName };

    let backupPath = null;
    try {
        backupPath = createBackup(targetPath, projName);
        const kernelDir = path.resolve(__dirname, '../../');
        generateMasterManifest();

        const targetKanban = path.join(targetPath, '.agent/workflows/kanban.md');
        copyRecursiveSync(path.join(kernelDir, '.agent'), path.join(targetPath, '.agent'), fs.existsSync(targetKanban) ? ['kanban.md'] : []);
        copyRecursiveSync(path.join(kernelDir, 'system_core'), path.join(targetPath, 'system_core'), ['storage', 'telemetry', 'backups', 'dashboard']);

        const masterManifest = path.join(kernelDir, 'system_core/kernel_manifest.json');
        if (fs.existsSync(masterManifest)) {
            fs.copyFileSync(masterManifest, path.join(targetPath, 'system_core/kernel_manifest.json'));
            fs.copyFileSync(masterManifest, path.join(targetPath, '.agent/kernel_manifest.json'));
        }

        if (hasPkg) {
            const targetPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            if (!targetPkg.scripts) targetPkg.scripts = {};
            if (!targetPkg.scripts["dev"] || targetPkg.scripts["dev"].includes("dashboard/server.js")) targetPkg.scripts["dev"] = "next dev";
            targetPkg.scripts["doctor"] = "node system_core/vitalis/vitalis_doctor.js";
            targetPkg.nexusVersion = "10.0.0";
            fs.writeFileSync(pkgPath, JSON.stringify(targetPkg, null, 2), 'utf-8');
        }

        return { success: true, projectPath: targetPath, backupPath, message: "Kernel e índice SHA-256 alineados a v10.0" };
    } catch (err) {
        if (backupPath && fs.existsSync(backupPath)) { try { copyRecursiveSync(backupPath, targetPath); } catch (e) {} }
        throw new Error(`Fallo en inyección: ${err.message}. Rollback ejecutado.`);
    }
}

module.exports = { importProject };
