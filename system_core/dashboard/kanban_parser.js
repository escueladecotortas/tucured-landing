// Archivo: system_core/dashboard/kanban_parser.js

function parseKanban(content) {
    const sections = { backlog: [], inProgress: [], done: [], ideas: [] };
    if (!content) return sections;
    let sec = null, task = null;

    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes('## [BACKLOG]')) { sec = 'backlog'; task = null; }
        else if (trimmed.includes('## [IN_PROGRESS]')) { sec = 'inProgress'; task = null; }
        else if (trimmed.includes('## [DONE]')) { sec = 'done'; task = null; }
        else if (trimmed.includes('## 🧠 BANCO DE IDEAS')) { sec = 'ideas'; task = null; }
        else if (trimmed.startsWith('## ')) { sec = null; task = null; }
        else if (sec && sec !== 'ideas') {
            if (line.startsWith('- [')) {
                task = { title: line.replace(/^-\s*\[[\s/xX]\]\s*/, '').trim(), subtasks: [], notes: [] };
                sections[sec].push(task);
            } else if (task && (line.startsWith('  - [') || line.startsWith('\t- ['))) {
                task.subtasks.push({ text: line.replace(/^\s*-\s*\[[\s/xX]\]\s*/, '').trim(), done: line.includes('[x]') || line.includes('[X]') });
            } else if (task && (line.startsWith('  - ') || line.startsWith('\t- '))) {
                task.notes.push(line.replace(/^\s*-\s*/, '').trim());
            }
        } else if (sec === 'ideas' && line.startsWith('- [')) {
            sections.ideas.push({ title: line.replace(/^-\s*\[[\s/xX]\]\s*/, '').trim(), done: line.includes('[x]') || line.includes('[X]') });
        }
    });
    return sections;
}

function serializeKanban(data) {
    let md = `// Archivo: .agent/workflows/kanban.md\n# Tablero Kanban Master v2.0 - Nexus OS v10.0\n\nEstructura soberana de orquestación, dependencias y seguimiento asíncrono.\n\n`;
    const renderSec = (label, key, mark) => {
        md += `## ${label}\n`;
        (data[key] || []).forEach(item => {
            if (typeof item === 'string') { md += `- [${mark}] ${item}\n`; return; }
            md += `- [${mark}] ${item.title}\n`;
            (item.subtasks || []).forEach(st => md += `  - [${st.done ? 'x' : ' '}] ${st.text}\n`);
            (item.notes || []).forEach(n => md += `  - ${n}\n`);
        });
        md += `\n`;
    };
    renderSec('[BACKLOG]', 'backlog', ' ');
    renderSec('[IN_PROGRESS]', 'inProgress', '/');
    renderSec('[DONE]', 'done', 'x');

    md += `## 🧠 BANCO DE IDEAS & REFACTORINGS FUTUROS\n`;
    (data.ideas || []).forEach(i => {
        const title = typeof i === 'string' ? i : i.title;
        const isDone = typeof i === 'object' && i.done ? 'x' : ' ';
        md += `- [${isDone}] ${title}\n`;
    });
    md += `\n---\n**Estado del Proyecto:** [MASTER_BLUEPRINT_READY]\n`;
    return md;
}

module.exports = { parseKanban, serializeKanban };
