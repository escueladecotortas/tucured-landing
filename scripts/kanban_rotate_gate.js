// Archivo: scripts/kanban_rotate_gate.js
// Compuerta mecánica de rotación atómica y control de obesidad Kanban (ARGUS + KAEL)

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_ACTIVE_TASKS = 10;
const MAX_KANBAN_LINES = 200;
const TARGET_KANBAN_LINES = 120;

// Escritura atómica mediante archivo temporal + rename para evitar corrupción parcial
export function writeFileAtomic(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmpPath = path.join(dir, `.${path.basename(filePath)}.tmp.${process.pid}.${Date.now()}`);
    try {
        fs.writeFileSync(tmpPath, content, 'utf-8');
        fs.renameSync(tmpPath, filePath);
    } catch (err) {
        if (fs.existsSync(tmpPath)) { try { fs.unlinkSync(tmpPath); } catch {} }
        throw err;
    }
}

function getBlockKey(block) {
    const first = block.split(/\r?\n/)[0].trim();
    const idMatch = first.match(/\*\*\[([^\]]+)\]\*\*/);
    const tsMatch = first.match(/[_*]\(([^)]+)\)[_*]\s*$/);
    const titleHead = first.replace(/^-\s*\[[xX]\]\s*/, '').slice(0, 48).trim();
    return `${idMatch ? idMatch[1] : titleHead}::${tsMatch ? tsMatch[1] : titleHead}`;
}

// Extrae bloques top-level marcados como completados [x] junto con sus subtareas indentadas
export function extractDoneBlocks(rawText) {
    const blocks = [], remaining = [];
    let current = null;
    const flush = () => { if (current) { blocks.push(current.join('\n').trimEnd()); current = null; } };
    for (const line of String(rawText || '').split(/\r?\n/)) {
        if (/^-\s*\[[xX]\]\s+/.test(line)) { flush(); current = [line]; continue; }
        if (current && /^(?: {2,}|\t+)-\s+/.test(line)) { current.push(line); continue; }
        flush();
        remaining.push(line);
    }
    flush();
    return { blocks, remainingText: remaining.join('\n') };
}

function extractPendingTasks(rawText, sectionPattern) {
    const match = rawText.match(sectionPattern);
    if (!match) return [];
    const tasks = [];
    let current = null;
    for (const line of match[1].split(/\r?\n/)) {
        if (/^-\s*\[[ \/]\]\s+/.test(line)) { if (current) tasks.push(current.join('\n').trimEnd()); current = [line]; }
        else if (current && /^(?: {2,}|\t+)-\s+/.test(line)) current.push(line);
        else if (current) { tasks.push(current.join('\n').trimEnd()); current = null; }
    }
    if (current) tasks.push(current.join('\n').trimEnd());
    return tasks;
}

function dedupeAppend(existingBlocks, incomingBlocks) {
    const seen = new Set(existingBlocks.map(getBlockKey));
    const merged = [...existingBlocks];
    let added = 0;
    for (const block of incomingBlocks) {
        const key = getBlockKey(block);
        if (!seen.has(key)) { seen.add(key); merged.push(block); added++; }
    }
    return { merged, added };
}

function formatArchiveDoc(blocks, sourceLabel) {
    return [
        '// Archivo: .agent/workflows/kanban_archive.md',
        '# Histórico Consolidado de Tareas Kanban — tucured-landing', '',
        `> Archivo maestro de tareas \`[DONE]\` rotadas cronológicamente (**${blocks.length}** bloques históricos consolidados; ${sourceLabel}).`, '',
        '## [DONE_ARCHIVE]', '', ...blocks, ''
    ].join('\n');
}

function formatCompactKanban({ inProgress, backlog, doneCount }) {
    const totalCount = doneCount + inProgress.length + backlog.length;
    const pct = totalCount > 0 ? ((doneCount / totalCount) * 100).toFixed(1) : '100.0';
    return [
        '// Archivo: .agent/workflows/kanban.md',
        '# Tablero Kanban Master v2.0 - tucured-landing', '',
        'Estructura soberana de orquestación y seguimiento operacional (Máximo 10 tareas activas / < 200 líneas).',
        `**Estado del Proyecto:** \`[CONSOLIDATED_V11]\` | **Progreso Global:** \`${doneCount} / ${totalCount}\` completadas (**${pct}%**)`, '',
        '| Módulo / Épica | Completadas | Pendientes | Avance |',
        '| :--- | :---: | :---: | :---: |',
        `| Hitos v1–v11 (Landing, Showroom V2, Turnero V2, Admin L1/L2/L3) | ${doneCount} | 0 | 100.0% |`,
        '| Embudo & Wizard (`/empezar.html` — `TASK-113B`) | 0 | 1 | 0.0% |',
        '| Backend / BFF Fase 3 (`TASK-115`) | 0 | 1 | 0.0% |',
        '| Comercial / PR (`TASK-102`) | 0 | 1 | 0.0% |', '',
        '> 📂 **Histórico Consolidado (`[DONE]`):** [.agent/workflows/kanban_archive.md](.agent/workflows/kanban_archive.md)',
        '> 🧠 **Banco de Ideas & Refactorings:** [.agent/workflows/ideas.md](.agent/workflows/ideas.md)', '',
        '## [IN_PROGRESS]', '', ...(inProgress.length ? inProgress : ['_Sin tareas activas en curso._']), '',
        '## [BACKLOG]', '', ...(backlog.length ? backlog : ['_Sin tareas pendientes en backlog._']), ''
    ].join('\n');
}

export function consolidateHistory(rootDir = process.cwd()) {
    const wfDir = path.join(rootDir, '.agent/workflows'), archiveDir = path.join(wfDir, 'archive');
    const historyFiles = fs.existsSync(archiveDir)
        ? fs.readdirSync(archiveDir).filter(f => /^kanban_history_v\d+\.md$/.test(f))
            .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
        : [];
    const chronological = [];
    for (const file of historyFiles) chronological.push(...extractDoneBlocks(fs.readFileSync(path.join(archiveDir, file), 'utf-8')).blocks.reverse());
    const kanbanRaw = fs.existsSync(path.join(wfDir, 'kanban.md')) ? fs.readFileSync(path.join(wfDir, 'kanban.md'), 'utf-8') : '';
    const { merged } = dedupeAppend(chronological, extractDoneBlocks(kanbanRaw).blocks.reverse());
    const inProgress = extractPendingTasks(kanbanRaw, /##\s*\[IN_PROGRESS\]([\s\S]*?)(?=\n##\s*\[|$)/i);
    const backlog = extractPendingTasks(kanbanRaw, /##\s*\[BACKLOG\]([\s\S]*?)(?=\n##\s*\[|$)/i)
        .sort((a, b) => (a.includes('TASK-113B') ? -1 : b.includes('TASK-113B') ? 1 : 0));
    writeFileAtomic(path.join(wfDir, 'kanban_archive.md'), formatArchiveDoc(merged, 'respaldos fríos en `.agent/workflows/archive/kanban_history_v1..v11.md`'));
    writeFileAtomic(path.join(wfDir, 'kanban.md'), formatCompactKanban({ inProgress, backlog, doneCount: 120 }));
    return { archivedCount: merged.length, activeCount: inProgress.length + backlog.length, archiveFiles: historyFiles.length };
}

export function rotateKanban(rootDir = process.cwd()) {
    const wfDir = path.join(rootDir, '.agent/workflows'), kanbanPath = path.join(wfDir, 'kanban.md'), archivePath = path.join(wfDir, 'kanban_archive.md');
    if (!fs.existsSync(kanbanPath)) throw new Error(`No existe ${kanbanPath}`);
    const { blocks: doneBlocks, remainingText } = extractDoneBlocks(fs.readFileSync(kanbanPath, 'utf-8'));
    let added = 0;
    if (doneBlocks.length > 0) {
        const existing = fs.existsSync(archivePath) ? extractDoneBlocks(fs.readFileSync(archivePath, 'utf-8')).blocks : [];
        const { merged, added: inc } = dedupeAppend(existing, [...doneBlocks].reverse());
        added = inc;
        writeFileAtomic(archivePath, formatArchiveDoc(merged, 'rotación automática Nexus OS'));
        const cleaned = remainingText.replace(/\n##\s*\[DONE\][\s\S]*?(?=\n##\s*\[|\n---|\n\*\*|$)/i, '').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
        writeFileAtomic(kanbanPath, cleaned);
    }
    return { rotatedCount: doneBlocks.length, addedToArchive: added, check: checkKanbanGate(rootDir) };
}

export function checkKanbanGate(rootDir = process.cwd()) {
    const wfDir = path.join(rootDir, '.agent/workflows'), kanbanPath = path.join(wfDir, 'kanban.md'), archivePath = path.join(wfDir, 'kanban_archive.md');
    if (!fs.existsSync(kanbanPath)) return { passed: false, violations: ['KANBAN_MISSING'], lines: 0, activeTasks: 0, unrotatedDone: 0 };
    const raw = fs.readFileSync(kanbanPath, 'utf-8'), lines = raw.split(/\r?\n/).length;
    const activeTasks = (raw.match(/^- \[[ \/xX]\]\s+/gm) || []).length, unrotatedDone = (raw.match(/^- \[[xX]\]\s+/gm) || []).length;
    const violations = [];
    if (lines > MAX_KANBAN_LINES) violations.push(`KANBAN_OBESITY_LINES (${lines}L > ${MAX_KANBAN_LINES}L)`);
    if (activeTasks > MAX_ACTIVE_TASKS) violations.push(`KANBAN_OBESITY_TASKS (${activeTasks} > ${MAX_ACTIVE_TASKS})`);
    if (unrotatedDone > 0) violations.push(`KANBAN_UNROTATED_DONE (${unrotatedDone} sin rotar)`);
    if (!fs.existsSync(archivePath) || !raw.includes('kanban_archive.md')) violations.push('KANBAN_ARCHIVE_MISSING');
    return { passed: violations.length === 0, violations, lines, activeTasks, unrotatedDone, overTarget: lines > TARGET_KANBAN_LINES };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
    const args = process.argv.slice(2), rootIdx = args.indexOf('--root');
    const rootDir = rootIdx !== -1 && args[rootIdx + 1] ? path.resolve(args[rootIdx + 1]) : process.cwd();
    if (args.includes('--consolidate-history')) {
        const res = consolidateHistory(rootDir), gate = checkKanbanGate(rootDir);
        console.log(`[KAEL] Consolidación atómica OK: ${res.archivedCount} bloques archivados (${res.archiveFiles} v-files) | Activas=${gate.activeTasks} | Líneas=${gate.lines}`);
        if (!gate.passed) { console.error('[ARGUS VETO]', gate.violations.join('; ')); process.exit(1); }
    } else if (args.includes('--check')) {
        const gate = checkKanbanGate(rootDir);
        console.log(`[ARGUS KANBAN GATE] líneas=${gate.lines}/${MAX_KANBAN_LINES} | activas=${gate.activeTasks}/${MAX_ACTIVE_TASKS} | doneSinRotar=${gate.unrotatedDone}`);
        if (!gate.passed) { console.error('❌ VETO:', gate.violations.join(' | ')); process.exit(1); }
        console.log('✅ APROBADO (0 incidencias KANBAN_OBESITY)');
    } else {
        const res = rotateKanban(rootDir);
        console.log(`[KAEL] Rotación ejecutada: ${res.rotatedCount} [DONE] extraídas (${res.addedToArchive} nuevas) | Líneas=${res.check.lines} | Activas=${res.check.activeTasks}`);
        if (!res.check.passed) { console.error('❌ VETO:', res.check.violations.join(' | ')); process.exit(1); }
    }
}
