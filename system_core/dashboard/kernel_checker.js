// Archivo: system_core/dashboard/kernel_checker.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_DIR = path.join(__dirname, '../../');
const DYNAMIC_EXCLUDES = ['system_core/vitalis/latest_report.md', '.agent/workflows/kanban.md'];

function getMasterManifest() {
    const manifestPath = path.join(BASE_DIR, 'system_core', 'kernel_manifest.json');
    if (fs.existsSync(manifestPath)) {
        try { return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')); } catch (e) {}
    }
    return null;
}

function calculateFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        const fileBuffer = fs.readFileSync(filePath);
        return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (e) {
        return null;
    }
}

function getKernelInfo(projectPath) {
    const masterManifest = getMasterManifest();
    const masterVersion = masterManifest ? masterManifest.version : "10.0.0";

    if (!projectPath) {
        return { isKernelInjected: false, updateStatus: "NOT_INJECTED", targetVersion: null, masterVersion, outdatedFiles: [] };
    }

    const absPath = path.resolve(projectPath);
    const isMasterRoot = (absPath === path.resolve(BASE_DIR)) || (path.basename(absPath).toLowerCase() === 'blueprint-nexus');

    if (isMasterRoot) {
        return {
            isKernelInjected: true,
            updateStatus: "UP_TO_DATE",
            targetVersion: masterVersion,
            masterVersion,
            outdatedFiles: []
        };
    }

    const kernelJsonPath = path.join(absPath, 'system_core', 'kernel.json');
    const hasAgentDir = fs.existsSync(path.join(absPath, '.agent'));
    const hasCoreDir = fs.existsSync(path.join(absPath, 'system_core'));

    if (!hasAgentDir && !hasCoreDir && !fs.existsSync(kernelJsonPath)) {
        return { isKernelInjected: false, updateStatus: "NOT_INJECTED", targetVersion: null, masterVersion, outdatedFiles: [] };
    }

    let targetVersion = "10.0.0";
    if (fs.existsSync(kernelJsonPath)) {
        try {
            const kData = JSON.parse(fs.readFileSync(kernelJsonPath, 'utf-8'));
            targetVersion = kData.version || "10.0.0";
        } catch (e) {}
    }

    const outdatedFiles = [];
    if (masterManifest && masterManifest.files) {
        for (const [relPath, masterHash] of Object.entries(masterManifest.files)) {
            if (DYNAMIC_EXCLUDES.includes(relPath)) continue;
            const targetFilePath = path.join(absPath, relPath);
            const targetHash = calculateFileHash(targetFilePath);
            if (!targetHash) {
                outdatedFiles.push(`${relPath} (Faltante)`);
            } else if (targetHash !== masterHash) {
                outdatedFiles.push(`${relPath} (Hash desalineado)`);
            }
        }
    }

    const isUpToDate = outdatedFiles.length === 0;

    return {
        isKernelInjected: true,
        updateStatus: isUpToDate ? "UP_TO_DATE" : "UPDATE_AVAILABLE",
        targetVersion,
        masterVersion,
        outdatedFiles
    };
}

function isKernelFullyInjected(projectPath) {
    return getKernelInfo(projectPath).isKernelInjected;
}

function listProjects(activeTargetDir) {
    const parentDir = path.resolve(BASE_DIR, '../');
    const projects = [];
    if (fs.existsSync(parentDir)) {
        fs.readdirSync(parentDir).forEach(item => {
            const fullPath = path.join(parentDir, item);
            try {
                if (fs.statSync(fullPath).isDirectory()) {
                    const absPath = path.resolve(fullPath);
                    const hasAgent = fs.existsSync(path.join(absPath, '.agent'));
                    const hasCore = fs.existsSync(path.join(absPath, 'system_core'));
                    const hasPkg = fs.existsSync(path.join(absPath, 'package.json'));
                    if (hasAgent || hasCore || hasPkg) {
                        const kernelInfo = getKernelInfo(absPath);
                        const ver = kernelInfo.targetVersion || (kernelInfo.isKernelInjected ? '10.0.0' : null);
                        projects.push({
                            name: item,
                            path: absPath,
                            active: absPath === path.resolve(activeTargetDir),
                            injected: kernelInfo.isKernelInjected,
                            updateStatus: kernelInfo.updateStatus,
                            version: ver,
                            targetVersion: ver,
                            masterVersion: kernelInfo.masterVersion,
                            outdatedFiles: kernelInfo.outdatedFiles
                        });
                    }
                }
            } catch (e) {}
        });
    }
    return projects;
}

module.exports = {
    getKernelInfo,
    isKernelFullyInjected,
    listProjects
};
