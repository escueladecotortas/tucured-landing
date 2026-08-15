// Archivo: system_core/scripts/generate_manifest.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_DIR = path.join(__dirname, '../../');
const KERNEL_JSON_PATH = path.join(BASE_DIR, 'system_core/kernel.json');
const MANIFEST_PATH = path.join(BASE_DIR, 'system_core/kernel_manifest.json');

const EXCLUDE_PATTERNS = [
    'system_core/storage',
    'system_core/telemetry',
    'system_core/backups',
    'system_core/kernel_manifest.json',
    'system_core/vitalis/latest_report.md',
    '.agent/workflows/kanban.md',
    'node_modules',
    '.git'
];

function calculateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function shouldExclude(relPath) {
    const normalized = relPath.replace(/\\/g, '/');
    return EXCLUDE_PATTERNS.some(ex => normalized === ex || normalized.startsWith(ex + '/'));
}

function scanDirectory(dirPath, relativeBase = '') {
    let files = {};
    if (!fs.existsSync(dirPath)) return files;

    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relPath = path.join(relativeBase, item).replace(/\\/g, '/');

        if (shouldExclude(relPath) || item === 'storage' || item === 'telemetry' || item === 'backups') {
            continue;
        }

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            Object.assign(files, scanDirectory(fullPath, relPath));
        } else if (stat.isFile()) {
            files[relPath] = calculateFileHash(fullPath);
        }
    }
    return files;
}

function generateManifest() {
    console.log('[MANIFEST GENERATOR] Escaneando estructura de .agent/ y system_core/...');
    
    let version = "10.0.0";
    if (fs.existsSync(KERNEL_JSON_PATH)) {
        try { version = JSON.parse(fs.readFileSync(KERNEL_JSON_PATH, 'utf-8')).version || "10.0.0"; } catch (e) {}
    }

    const agentFiles = scanDirectory(path.join(BASE_DIR, '.agent'), '.agent');
    const coreFiles = scanDirectory(path.join(BASE_DIR, 'system_core'), 'system_core');

    const manifest = {
        version,
        signature: "NEXUS_OS_V10_MANIFEST_SHA256",
        createdAt: new Date().toISOString(),
        files: { ...agentFiles, ...coreFiles }
    };

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`✅ [MANIFEST GENERATOR] Manifiesto SHA-256 generado exitosamente en:\n   ${MANIFEST_PATH}`);
    console.log(`📦 Total de archivos registrados en ADN Master: ${Object.keys(manifest.files).length}`);
    return manifest;
}

if (require.main === module) {
    generateManifest();
}

module.exports = { generateManifest };
