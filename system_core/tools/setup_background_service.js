// Archivo: system_core/tools/setup_background_service.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../../');

function getPaths() {
    const userProfile = process.env.USERPROFILE || 'C:\\Users\\leola';
    const appData = process.env.APPDATA || path.join(userProfile, 'AppData', 'Roaming');
    const startupDir = path.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');

    const desktopCandidates = [
        path.join(userProfile, 'Desktop'),
        path.join(userProfile, 'OneDrive', 'Desktop'),
        path.join(userProfile, 'OneDrive', 'Escritorio'),
        path.join(userProfile, 'Escritorio')
    ];
    const existingDesktops = desktopCandidates.filter(p => fs.existsSync(p));
    const targetDesktops = existingDesktops.length > 0 ? existingDesktops : [path.join(userProfile, 'Desktop')];

    return { userProfile, appData, startupDir, targetDesktops };
}

function installService() {
    const { startupDir, targetDesktops } = getPaths();
    const silentVbsPath = path.join(ROOT_DIR, 'start_nexus_silent.vbs');
    const normRootDir = ROOT_DIR.replace(/\//g, '\\');

    // 1. Script VBScript Silencioso con Hot-Reload (node --watch)
    const vbsContent = `' Script Silencioso de Arranque Nexus OS v10.0 (Hot-Reload & SW_HIDE)\n` +
        `Set WshShell = CreateObject("WScript.Shell")\n` +
        `WshShell.CurrentDirectory = "${normRootDir}"\n` +
        `WshShell.Run "node --watch system_core/dashboard/server.js", 0, False\n`;

    fs.writeFileSync(silentVbsPath, vbsContent, 'utf-8');

    // 2. Autostart en Inicio de Windows
    const startupVbsPath = path.join(startupDir, 'Nexus_Dashboard_Autostart.vbs');
    if (!fs.existsSync(startupDir)) fs.mkdirSync(startupDir, { recursive: true });
    fs.writeFileSync(startupVbsPath, vbsContent, 'utf-8');

    // 3. Atajo URL y Launcher VBScript 100% Invisible en el Escritorio
    const writtenShortcuts = [];
    const urlShortcutContent = `[InternetShortcut]\n` +
        `URL=http://localhost:3000/nexus-admin\n` +
        `IconFile=C:\\Windows\\System32\\shell32.dll\n` +
        `IconIndex=14\n`;

    const desktopVbsContent = `' Launcher Silencioso Escritorio Nexus OS v10.0\n` +
        `Set WshShell = CreateObject("WScript.Shell")\n` +
        `WshShell.CurrentDirectory = "${normRootDir}"\n` +
        `WshShell.Run "node --watch system_core/dashboard/server.js", 0, False\n` +
        `WScript.Sleep 1000\n` +
        `WshShell.Run "http://localhost:3000/nexus-admin", 1, False\n`;

    for (const dDir of targetDesktops) {
        try {
            if (!fs.existsSync(dDir)) fs.mkdirSync(dDir, { recursive: true });
            const urlPath = path.join(dDir, 'Nexus Dashboard OS.url');
            const vbsPath = path.join(dDir, 'Abrir Nexus Control Panel.vbs');
            fs.writeFileSync(urlPath, urlShortcutContent, 'utf-8');
            fs.writeFileSync(vbsPath, desktopVbsContent, 'utf-8');
            writtenShortcuts.push(urlPath, vbsPath);

            // Purgar viejos ejecutables .bat para erradicar ventanas de consola
            const oldBats = [
                path.join(dDir, 'Abrir Nexus Control Plane.bat'),
                path.join(dDir, 'Abrir Nexus Control Panel.bat')
            ];
            oldBats.forEach(b => { if (fs.existsSync(b)) { try { fs.unlinkSync(b); } catch (e) {} } });
        } catch (e) {}
    }

    try {
        execSync(`wscript.exe "${silentVbsPath}"`, { stdio: 'ignore' });
    } catch (e) {}

    return {
        success: true,
        silentVbsPath,
        startupVbsPath,
        writtenShortcuts
    };
}

function uninstallService() {
    const { startupDir, targetDesktops } = getPaths();
    const silentVbsPath = path.join(ROOT_DIR, 'start_nexus_silent.vbs');
    const startupVbsPath = path.join(startupDir, 'Nexus_Dashboard_Autostart.vbs');

    const removed = [];
    [silentVbsPath, startupVbsPath].forEach(file => {
        if (fs.existsSync(file)) {
            try { fs.unlinkSync(file); removed.push(file); } catch (e) {}
        }
    });

    for (const dDir of targetDesktops) {
        const toClean = [
            path.join(dDir, 'Nexus Dashboard OS.url'),
            path.join(dDir, 'Abrir Nexus Control Panel.vbs'),
            path.join(dDir, 'Abrir Nexus Control Plane.bat'),
            path.join(dDir, 'Abrir Nexus Control Panel.bat')
        ];
        toClean.forEach(f => {
            if (fs.existsSync(f)) { try { fs.unlinkSync(f); removed.push(f); } catch (e) {} }
        });
    }

    return { success: true, removedFiles: removed };
}

if (require.main === module) {
    const isUninstall = process.argv.includes('--uninstall');
    if (isUninstall) {
        console.log(`[SERVICE SETUP] Desinstalando servicio en segundo plano...`);
        const res = uninstallService();
        console.log(`[SERVICE SETUP] Archivos removidos: ${res.removedFiles.length}`);
    } else {
        console.log(`[SERVICE SETUP] Configurando e iniciando Servicio en Segundo Plano Nexus OS v10.0 (Hot-Reload & SW_HIDE)...`);
        const res = installService();
        console.log(`[SERVICE SETUP] ✅ VBS Silencioso: ${res.silentVbsPath}`);
        console.log(`[SERVICE SETUP] ✅ Autostart: ${res.startupVbsPath}`);
        console.log(`[SERVICE SETUP] ✅ Atajos creados: ${res.writtenShortcuts.join(', ')}`);
        console.log(`[SERVICE SETUP] 🚀 Proceso 100% invisible y con Hot-Reload (--watch) escuchando en http://localhost:3000/nexus-admin`);
    }
}

module.exports = { installService, uninstallService };
