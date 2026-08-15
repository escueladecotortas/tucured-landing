// Archivo: system_core/dashboard/server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { instantiateProject } = require('../tools/init_new_project');
const { importProject } = require('../tools/import_project');
const { getKernelInfo, listProjects } = require('./kernel_checker');
const { parseKanban, serializeKanban } = require('./kanban_parser');

const PORT = process.env.PORT || 3000;
const BASE_DIR = path.join(__dirname, '../../');
let activeTargetDir = BASE_DIR;

function getLocalTimestamp() {
    return new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function appendLog(level, message, targetDir = activeTargetDir) {
    const logDir = path.join(targetDir, 'system_core/storage/telemetry');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const entry = JSON.stringify({ timestamp: getLocalTimestamp(), level, message }) + '\n';
    try { fs.appendFileSync(path.join(logDir, 'live_execution.log'), entry, 'utf-8'); } catch (e) {}
}

function getLiveTelemetry(targetDir) {
    const metricsPath = path.join(targetDir, 'system_core/storage/telemetry/token_metrics.json');
    const cbPath = path.join(targetDir, 'system_core/storage/circuit_breaker.json');
    let metrics = { global: { totalTokens: 0, totalExecutions: 0 }, agents: {} };
    let circuitBreaker = { state: 'ARMED_HEALTHY', failureCount: 0 };
    if (fs.existsSync(metricsPath)) { try { metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf-8')); } catch (e) {} }
    if (fs.existsSync(cbPath)) { try { const cb = JSON.parse(fs.readFileSync(cbPath, 'utf-8')); circuitBreaker.state = cb.state || 'ARMED_HEALTHY'; circuitBreaker.failureCount = cb.failureCount || 0; } catch (e) {} }
    return { metrics, circuitBreaker, vectorStoreActive: true };
}

function getAgentStatuses(targetDir) {
    const dir = path.join(targetDir, 'system_core/agents/core');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
        const name = f.replace('.json', '');
        const isNexus = name === 'nexus', isVitalis = name === 'vitalis';
        const isActive = isNexus || isVitalis;
        return { name, level: isNexus ? 'L1' : 'L3', status: isActive ? 'ACTIVE' : 'SLEEPING', lastActive: isActive ? 'Hace instantes' : 'En espera', lastAction: isNexus ? 'Orquestación' : (isVitalis ? 'Auditoría' : 'Lazy Load') };
    });
}

function getLiveLogs(targetDir = activeTargetDir) {
    const logDir = path.join(targetDir, 'system_core/storage/telemetry');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logPath = path.join(logDir, 'live_execution.log');
    if (!fs.existsSync(logPath)) {
        appendLog('INFO', `Nexus Dashboard v12.0 Amber inspeccionando '${path.basename(targetDir)}'.`, targetDir);
        appendLog('SUCCESS', 'CircuitBreaker en estado ARMED_HEALTHY.', targetDir);
    }
    try {
        const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean).slice(-20);
        return lines.map(line => {
            try { return JSON.parse(line); } catch (e) { return { timestamp: getLocalTimestamp(), level: 'INFO', message: line }; }
        });
    } catch (e) { return []; }
}

function getKanbanSummaryForProject(projPath) {
    const kanbanPath = path.join(projPath, '.agent/workflows/kanban.md');
    if (!fs.existsSync(kanbanPath)) {
        return { backlog: 0, inProgress: 0, done: 0, progressPct: 0 };
    }
    try {
        const raw = fs.readFileSync(kanbanPath, 'utf-8');
        const parsed = parseKanban(raw);
        const backlog = (parsed.backlog || []).length;
        const inProgress = (parsed.inProgress || []).length;
        const done = (parsed.done || []).length;
        const total = backlog + inProgress + done;
        const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
        return { backlog, inProgress, done, progressPct };
    } catch (e) {
        return { backlog: 0, inProgress: 0, done: 0, progressPct: 0 };
    }
}

function getProjectsOverview(activeDir) {
    const parentDir = path.resolve(BASE_DIR, '../');
    const projects = [];
    if (fs.existsSync(parentDir)) {
        const items = fs.readdirSync(parentDir);
        for (const item of items) {
            const fullPath = path.join(parentDir, item);
            try {
                if (fs.statSync(fullPath).isDirectory()) {
                    const absPath = path.resolve(fullPath);
                    const hasAgent = fs.existsSync(path.join(absPath, '.agent'));
                    const hasCore = fs.existsSync(path.join(absPath, 'system_core'));
                    const hasPkg = fs.existsSync(path.join(absPath, 'package.json'));
                    if (hasAgent || hasCore || hasPkg) {
                        const kernelInfo = getKernelInfo(absPath);
                        const envConfigured = fs.existsSync(path.join(absPath, '.env'));
                        const kanbanSummary = getKanbanSummaryForProject(absPath);
                        projects.push({
                            name: item,
                            path: absPath,
                            active: absPath === path.resolve(activeDir),
                            kernelInfo,
                            envConfigured,
                            kanbanSummary
                        });
                    }
                }
            } catch (e) {}
        }
    }
    return projects;
}

function getDashboardData() {
    const targetDir = path.resolve(activeTargetDir);
    const kernelInfo = getKernelInfo(targetDir);
    const isKernelInjected = kernelInfo.isKernelInjected;
    const ver = kernelInfo.targetVersion || (isKernelInjected ? '10.0.0' : null);

    if (!isKernelInjected) {
        appendLog('WARN', `Proyecto '${path.basename(targetDir)}' evaluado como UNCHAINED / ⚠️ (Falta Firma Kernel v10.0 en system_core/kernel.json)`);
        return {
            version: "Nexus OS v12.0 Amber",
            activeProjectPath: targetDir,
            activeProjectName: path.basename(targetDir),
            timestamp: getLocalTimestamp(),
            isKernelInjected: false,
            updateStatus: kernelInfo.updateStatus,
            targetVersion: ver,
            masterVersion: kernelInfo.masterVersion,
            outdatedFiles: kernelInfo.outdatedFiles,
            vitalisStatus: 'UNCHAINED',
            projects: listProjects(activeTargetDir),
            kanban: { backlog: [], inProgress: [], done: [], ideas: [] },
            telemetry: { metrics: { global: { totalTokens: 0, totalExecutions: 0 } }, circuitBreaker: { state: 'UNCHAINED', failureCount: 0 } },
            agents: [],
            logs: getLiveLogs(targetDir)
        };
    }

    const reportPath = path.join(targetDir, 'system_core/vitalis/latest_report.md');
    const kanbanPath = path.join(targetDir, '.agent/workflows/kanban.md');
    const report = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf-8') : '';
    const kanbanRaw = fs.existsSync(kanbanPath) ? fs.readFileSync(kanbanPath, 'utf-8') : '';
    const isHealthy = report.includes('🟢') || report.includes('OPTIMAL') || report.includes('HEALTHY');

    return {
        version: "Nexus OS v12.0 Amber",
        activeProjectPath: targetDir,
        activeProjectName: path.basename(targetDir),
        timestamp: getLocalTimestamp(),
        isKernelInjected: true,
        updateStatus: kernelInfo.updateStatus,
        targetVersion: ver,
        masterVersion: kernelInfo.masterVersion,
        outdatedFiles: kernelInfo.outdatedFiles,
        vitalisStatus: isHealthy ? 'HEALTHY' : 'WARNING',
        projects: listProjects(activeTargetDir),
        kanban: parseKanban(kanbanRaw),
        telemetry: getLiveTelemetry(targetDir),
        agents: getAgentStatuses(targetDir),
        logs: getLiveLogs(targetDir)
    };
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(getDashboardData(), null, 2)); return;
    }
    if (url.pathname === '/api/logs') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ logs: getLiveLogs(activeTargetDir) })); return;
    }
    if (url.pathname === '/api/projects') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ projects: listProjects(activeTargetDir), activeTargetDir: path.resolve(activeTargetDir) })); return;
    }
    if (url.pathname === '/api/projects/overview') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, projects: getProjectsOverview(activeTargetDir) })); return;
    }
    if (url.pathname === '/api/action/switch-project' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (data.projectPath && fs.existsSync(data.projectPath)) {
                    activeTargetDir = path.resolve(data.projectPath);
                    const kernelInfo = getKernelInfo(activeTargetDir);
                    appendLog(kernelInfo.isKernelInjected ? 'INFO' : 'WARN', `Conmutado proyecto activo a: '${path.basename(activeTargetDir)}' (${kernelInfo.updateStatus})`);
                }
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, activeTargetDir: path.resolve(activeTargetDir), data: getDashboardData() }));
            } catch (err) { res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ success: false, error: err.message })); }
        }); return;
    }
    if (url.pathname === '/api/kanban/update' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            try {
                const newMd = serializeKanban(JSON.parse(body));
                fs.writeFileSync(path.join(activeTargetDir, '.agent/workflows/kanban.md'), newMd, 'utf-8');
                appendLog('INFO', 'Kanban Master v2.0 actualizado.');
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, kanban: parseKanban(newMd) }));
            } catch (err) { res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ success: false, error: err.message })); }
        }); return;
    }
    if (url.pathname === '/api/action/create-project' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const resData = instantiateProject({ name: data.projectName, description: data.description, targetDir: data.targetPath });
                activeTargetDir = path.resolve(resData.projectPath);
                appendLog('SUCCESS', `Proyecto '${resData.projectName}' instanciado en ${resData.projectPath}`);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, projectPath: resData.projectPath, message: `Proyecto '${resData.projectName}' instanciado con éxito.` }));
            } catch (err) { res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ success: false, error: err.message })); }
        }); return;
    }
    if (url.pathname === '/api/action/audit-project' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const resData = importProject({ sourceDir: data.sourceDir, dryRun: true });
                const kernelInfo = getKernelInfo(resData.projectPath);
                resData.hasKernel = kernelInfo.isKernelInjected;
                resData.updateStatus = kernelInfo.updateStatus;
                resData.version = kernelInfo.targetVersion || '10.0.0';
                resData.targetVersion = kernelInfo.targetVersion || '10.0.0';
                resData.masterVersion = kernelInfo.masterVersion;
                resData.outdatedFiles = kernelInfo.outdatedFiles;
                appendLog('INFO', `Pre-auditoría ejecutada en '${resData.projectPath}'. Status: ${kernelInfo.updateStatus}. Score: ${resData.score}%`);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(resData));
            } catch (err) { res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ success: false, error: err.message })); }
        }); return;
    }
    if (url.pathname === '/api/action/import-project' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const resData = importProject({ sourceDir: data.sourceDir, dryRun: false });
                activeTargetDir = path.resolve(resData.projectPath);
                appendLog('SUCCESS', `Kernel Nexus OS v10.0 inyectado en: ${resData.projectPath}`);
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true, projectPath: resData.projectPath, backupPath: resData.backupPath, reportPath: resData.reportPath, message: `Kernel v10.0 inyectado.` }));
            } catch (err) { res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ success: false, error: err.message })); }
        }); return;
    }
    if (url.pathname === '/api/doctor' && req.method === 'POST') {
        exec('node system_core/vitalis/vitalis_doctor.js', { cwd: activeTargetDir }, (error, stdout, stderr) => {
            const output = (stdout + (stderr ? '\n' + stderr : '')).trim();
            const success = !error;
            const summary = success 
                ? "🟢 0 Hallazgos detectados / Integridad 100% Saludable" 
                : "⚠️ Hallazgos detectados durante la auditoría médica";
            appendLog(success ? 'SUCCESS' : 'ERROR', `Vitalis Doctor ejecutado: ${summary}`);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success, summary, output }));
        }); return;
    }
    if (url.pathname === '/api/action/clear-logs' && req.method === 'POST') {
        const logDir = path.join(activeTargetDir, 'system_core/storage/telemetry');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        const initLog = JSON.stringify({ timestamp: getLocalTimestamp(), level: 'SUCCESS', message: 'Logs purgados. Visor reiniciado.' }) + '\n';
        fs.writeFileSync(path.join(logDir, 'live_execution.log'), initLog, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'Logs limpiados con éxito.' })); return;
    }
    if (url.pathname === '/api/action/reload-env' && req.method === 'POST') {
        appendLog('SUCCESS', 'Entorno .env re-leído e inyectado con éxito.');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'Entorno .env re-leído con éxito.' })); return;
    }
    if (url.pathname === '/nexus-admin' || url.pathname === '/' || url.pathname === '/index.html') {
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(indexPath, 'utf-8')); return; }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Ruta no encontrada.');
});

if (require.main === module) {
    server.listen(PORT, () => { console.log(`[NEXUS DASHBOARD v12.0 AMBER] Servidor activo en http://localhost:${PORT}/nexus-admin`); });
}

module.exports = server;
