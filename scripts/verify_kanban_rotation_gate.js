// Archivo: scripts/verify_kanban_rotation_gate.js
// Suite QA de certificación para rotación atómica y compuerta KANBAN_OBESITY (ARGUS + KAEL)

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { rotateKanban, checkKanbanGate } from './kanban_rotate_gate.js';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const hubRoot = 'C:/Users/leola/Downloads/blueprint-nexus';
const { auditFleet } = require(path.join(hubRoot, 'system_core/vitalis/modules/audit_fleet.js'));
const { applyHealing } = require(path.join(hubRoot, 'system_core/vitalis/remediation_logic.js'));

let passed = 0;
let failed = 0;

function check(label, fn) {
    try {
        fn();
        console.log(`  ✅ [PASS] ${label}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ [FAIL] ${label} -> ${err.message}`);
        failed++;
    }
}

async function runSuite() {
    console.log('\n🛡️ [ARGUS & KAEL] Verificación de Rotación Atómica y Compuerta KANBAN_OBESITY\n');
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'tucu-kanban-gate-'));

    try {
        // (a) Rotación automática en directorio aislado con 12 [DONE] + 3 [BACKLOG]
        const satA = path.join(tmpBase, 'sat-a');
        const wfA = path.join(satA, '.agent/workflows');
        fs.mkdirSync(wfA, { recursive: true });
        const doneSample = Array.from({ length: 12 }, (_, i) => `- [x] **[TASK-${String(12 - i).padStart(3, '0')}]** Hito ${12 - i}`).join('\n');
        const backlogSample = '- [ ] **[TASK-020]** Pendiente 1\n- [ ] **[TASK-021]** Pendiente 2\n- [ ] **[TASK-022]** Pendiente 3';
        fs.writeFileSync(path.join(wfA, 'kanban.md'), `# Kanban\n\n> Archivo: kanban_archive.md\n\n## [BACKLOG]\n${backlogSample}\n\n## [DONE]\n${doneSample}\n`, 'utf-8');

        const rotA = rotateKanban(satA);
        check('a) Rotación automática extrae 12 [DONE] y deja 3 activas en kanban.md', () => {
            assert.equal(rotA.rotatedCount, 12);
            assert.equal(rotA.check.passed, true);
            assert.equal(rotA.check.activeTasks, 3);
            const arch = fs.readFileSync(path.join(wfA, 'kanban_archive.md'), 'utf-8');
            assert.ok(arch.includes('TASK-001') && arch.includes('TASK-012'));
            assert.ok(arch.indexOf('TASK-001') < arch.indexOf('TASK-012'), 'Orden cronológico');
        });

        // (b) VETO por > 10 tareas activas
        const satB = path.join(tmpBase, 'sat-b');
        const wfB = path.join(satB, '.agent/workflows');
        fs.mkdirSync(wfB, { recursive: true });
        fs.writeFileSync(path.join(wfB, 'kanban_archive.md'), '# Archive\n', 'utf-8');
        const eleven = Array.from({ length: 11 }, (_, i) => `- [ ] **[TASK-${i + 1}]** Activa`).join('\n');
        fs.writeFileSync(path.join(wfB, 'kanban.md'), `# Kanban\n> kanban_archive.md\n\n## [BACKLOG]\n${eleven}\n`, 'utf-8');
        check('b) VETO mecánico ante > 10 tareas activas (KANBAN_OBESITY_TASKS)', () => {
            const g = checkKanbanGate(satB);
            assert.equal(g.passed, false);
            assert.ok(g.violations.some(v => v.includes('KANBAN_OBESITY_TASKS')));
        });

        // (c) VETO por > 200 líneas
        const satC = path.join(tmpBase, 'sat-c');
        const wfC = path.join(satC, '.agent/workflows');
        fs.mkdirSync(wfC, { recursive: true });
        fs.writeFileSync(path.join(wfC, 'kanban_archive.md'), '# Archive\n', 'utf-8');
        fs.writeFileSync(path.join(wfC, 'kanban.md'), `# Kanban\n> kanban_archive.md\n${'\n'.repeat(210)}- [ ] **[TASK-1]** Ok\n`, 'utf-8');
        check('c) VETO mecánico ante > 200 líneas (KANBAN_OBESITY_LINES)', () => {
            const g = checkKanbanGate(satC);
            assert.equal(g.passed, false);
            assert.ok(g.violations.some(v => v.includes('KANBAN_OBESITY_LINES')));
        });

        // (d) VETO por [DONE] sin rotar
        const satD = path.join(tmpBase, 'sat-d');
        const wfD = path.join(satD, '.agent/workflows');
        fs.mkdirSync(wfD, { recursive: true });
        fs.writeFileSync(path.join(wfD, 'kanban_archive.md'), '# Archive\n', 'utf-8');
        fs.writeFileSync(path.join(wfD, 'kanban.md'), '# Kanban\n> kanban_archive.md\n\n- [x] **[TASK-9]** Sin rotar\n', 'utf-8');
        check('d) VETO mecánico ante tarea [DONE] sin rotar (KANBAN_UNROTATED_DONE)', () => {
            const g = checkKanbanGate(satD);
            assert.equal(g.passed, false);
            assert.ok(g.violations.some(v => v.includes('KANBAN_UNROTATED_DONE')));
        });

        // (e) Vitalis auditFleet + applyHealing en mock aislado
        const mockHub = path.join(tmpBase, 'blueprint-nexus');
        const mockSat = path.join(tmpBase, 'mock-sat');
        fs.mkdirSync(path.join(mockHub, 'system_core/storage'), { recursive: true });
        fs.mkdirSync(path.join(mockSat, '.agent/workflows'), { recursive: true });
        fs.writeFileSync(path.join(mockHub, 'system_core/storage/fleet_registry.json'), JSON.stringify({ curatedProjects: ['mock-sat'] }), 'utf-8');
        const mix = [
            ...Array.from({ length: 5 }, (_, i) => `- [ ] **[TASK-P${i}]** Pendiente`),
            ...Array.from({ length: 6 }, (_, i) => `- [x] **[TASK-D${i}]** Hecha`)
        ].join('\n');
        fs.writeFileSync(path.join(mockSat, '.agent/workflows/kanban.md'), `# Mock\n${mix}\n`, 'utf-8');

        const preAudit = auditFleet(mockHub);
        const healing = await applyHealing(preAudit.issues, mockHub);
        const postAudit = auditFleet(mockHub);
        check('e) Vitalis auditFleet + applyHealing detecta y auto-rota KANBAN_OBESITY', () => {
            assert.ok(preAudit.issues.some(i => i.code === 'KANBAN_OBESITY'));
            assert.ok(healing.some(h => h.code === 'KANBAN_OBESITY' && h.status === 'FIXED'));
            assert.equal(postAudit.issues.filter(i => i.code === 'KANBAN_OBESITY').length, 0);
            assert.ok(fs.readFileSync(path.join(mockSat, '.agent/workflows/kanban_archive.md'), 'utf-8').includes('TASK-D5'));
        });

        // (f) Auditoría de verdad sobre tucured-landing real + Ley 200L
        check('f1) Estado real de tucured-landing/.agent/workflows/kanban.md (<120L, <=10 tareas, 0 DONE)', () => {
            const realGate = checkKanbanGate(repoRoot);
            assert.equal(realGate.passed, true, realGate.violations.join('; '));
            assert.ok(realGate.lines < 120, `Líneas: ${realGate.lines}`);
            assert.ok(realGate.activeTasks <= 10, `Activas: ${realGate.activeTasks}`);
            const kRaw = fs.readFileSync(path.join(repoRoot, '.agent/workflows/kanban.md'), 'utf-8');
            assert.ok(kRaw.includes('TASK-113B') && kRaw.includes('TASK-115') && kRaw.includes('TASK-102'));
        });

        check('f2) Histórico consolidado kanban_archive.md (>=120 entradas, TASK-001 a TASK-112G) y v1..v11 intactos', () => {
            const archRaw = fs.readFileSync(path.join(repoRoot, '.agent/workflows/kanban_archive.md'), 'utf-8');
            const count = (archRaw.match(/^- \[[xX]\]\s+/gm) || []).length;
            assert.ok(count >= 120, `Entradas archivadas: ${count}`);
            assert.ok(archRaw.includes('TASK-001') && archRaw.includes('TASK-112G'));
            const vFiles = fs.readdirSync(path.join(repoRoot, '.agent/workflows/archive')).filter(f => /^kanban_history_v\d+\.md$/.test(f));
            assert.equal(vFiles.length, 11);
        });

        check('f3) Ley de 200L y encabezado PEAC en scripts y módulos modificados', () => {
            const targets = [
                path.join(repoRoot, 'scripts/kanban_rotate_gate.js'),
                path.join(repoRoot, 'scripts/verify_kanban_rotation_gate.js'),
                path.join(hubRoot, 'system_core/vitalis/modules/audit_fleet.js'),
                path.join(hubRoot, 'system_core/vitalis/remediation_logic.js')
            ];
            for (const f of targets) {
                const text = fs.readFileSync(f, 'utf-8');
                const lines = text.split(/\r?\n/).length;
                assert.ok(lines < 200, `${path.basename(f)} excede 200L (${lines}L)`);
                assert.ok(text.startsWith('// Archivo: '), `Falta encabezado PEAC en ${path.basename(f)}`);
            }
        });
    } finally {
        fs.rmSync(tmpBase, { recursive: true, force: true });
    }

    console.log(`\n📊 Resultado QA: ${passed}/${passed + failed} PASS | FAIL=${failed}\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runSuite().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
