// Archivo: system_core/tools/init_new_project.js
const fs = require('fs');
const path = require('path');
const { importProject } = require('./import_project');

function instantiateProject({ name, description, targetDir }) {
    const projName = (name || 'nuevo-proyecto').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const descText = description || 'Especificaciones iniciales del nuevo proyecto instanciado.';
    
    const masterParentDir = path.resolve(__dirname, '../../../');
    let baseDir;

    if (targetDir && targetDir.trim()) {
        const trimmedPath = targetDir.trim();
        baseDir = path.isAbsolute(trimmedPath) ? path.resolve(trimmedPath) : path.resolve(masterParentDir, trimmedPath);
    } else {
        baseDir = path.join(masterParentDir, projName);
    }

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    // 1. Inyectar Kernel Nexus OS v10.0
    importProject({ sourceDir: baseDir, dryRun: false });

    // 2. Configurar .env propio
    const envPath = path.join(baseDir, '.env');
    const envContent = `PROJECT_NAME=${projName}\nNEXUS_OS_VERSION=v10.0\nLOCAL_FIRST_STORAGE=true\nDB_TARGET=local_db\nPORT=3000\n`;
    fs.writeFileSync(envPath, envContent, 'utf-8');

    // 3. Limpieza de telemetría y reportes antiguos
    const telemetryDir = path.join(baseDir, 'system_core/storage/telemetry');
    if (fs.existsSync(telemetryDir)) {
        fs.readdirSync(telemetryDir).forEach(f => { try { fs.unlinkSync(path.join(telemetryDir, f)); } catch (e) {} });
    } else {
        fs.mkdirSync(telemetryDir, { recursive: true });
    }

    const reportPath = path.join(baseDir, 'system_core/vitalis/latest_report.md');
    if (fs.existsSync(reportPath)) { try { fs.unlinkSync(reportPath); } catch (e) {} }

    // 4. Configurar package.json
    const pkgPath = path.join(baseDir, 'package.json');
    let pkg = { name: projName, version: "10.0.0", nexusVersion: "10.0.0", scripts: { dev: "next dev", doctor: "node system_core/vitalis/vitalis_doctor.js" } };
    if (fs.existsSync(pkgPath)) {
        try {
            pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            pkg.name = projName;
            if (!pkg.scripts) pkg.scripts = {};
            if (!pkg.scripts["dev"] || pkg.scripts["dev"].includes("dashboard/server.js")) pkg.scripts["dev"] = "next dev";
            pkg.scripts["doctor"] = "node system_core/vitalis/vitalis_doctor.js";
        } catch (e) {}
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');

    // 5. Inyectar especificaciones.md
    const specPath = path.join(baseDir, 'especificaciones.md');
    const specContent = `# ESPECIFICACIONES TÉCNICAS: ${projName.toUpperCase()}\n\n` +
        `**Fecha de Instanciación:** ${new Date().toISOString()}\n` +
        `**Motor Orchestrator:** Nexus OS v10.0 Nivel Dios\n\n` +
        `## 🎯 ALCANCE Y OBJETIVOS\n${descText}\n\n` +
        `## 🛠️ ARQUITECTURA\n- **Backend/API:** Node.js ES6+ / App Router\n- **Styling:** Tailwind CSS v4\n- **Persistencia:** Local-First Storage\n`;
    fs.writeFileSync(specPath, specContent, 'utf-8');

    // 6. Instanciar Kanban Master v2.0 desde la plantilla limpia
    const kanbanDir = path.join(baseDir, '.agent/workflows');
    if (!fs.existsSync(kanbanDir)) fs.mkdirSync(kanbanDir, { recursive: true });
    const kanbanPath = path.join(kanbanDir, 'kanban.md');
    const templatePath = path.resolve(__dirname, '../templates/kanban_template.md');
    let kanbanContent = '';
    if (fs.existsSync(templatePath)) {
        kanbanContent = fs.readFileSync(templatePath, 'utf-8').replace(/\[PROJECT_NAME\]/g, projName.toUpperCase());
    } else {
        kanbanContent = `// Archivo: .agent/workflows/kanban.md\n# Tablero Kanban Master v2.0 - ${projName.toUpperCase()}\n\n## [BACKLOG]\n- [ ] **[TASK-001]** Definición del Briefing (\`especificaciones.md\`)\n\n## [IN_PROGRESS]\n\n## [DONE]\n- [x] **[TASK-INIT]** Instanciación Limpia de Ecosistema v10.0\n`;
    }
    fs.writeFileSync(kanbanPath, kanbanContent, 'utf-8');

    return { success: true, projectPath: baseDir, projectName: projName };
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const params = {};
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i].replace(/^--/, '');
        params[key] = args[i + 1];
    }
    const res = instantiateProject(params);
    console.log(`[INIT PROJECT] Proyecto '${res.projectName}' instanciado en: ${res.projectPath}`);
}

module.exports = { instantiateProject };
