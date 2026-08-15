const { execSync } = require('child_process');
const path = require('path');

/**
 * GitTools.js (Antigravity 2.0)
 * Interfaz de control de versiones para que los agentes operen sobre el repositorio.
 */
class GitTools {
    constructor() {
        // Ejecutaremos los comandos en la raíz del proyecto
        this.projectRoot = path.resolve(__dirname, '../../../');
    }

    _runCommand(command) {
        try {
            const output = execSync(command, { 
                cwd: this.projectRoot, 
                encoding: 'utf8', 
                stdio: 'pipe' 
            });
            return { success: true, output: output.trim() };
        } catch (error) {
            return { 
                success: false, 
                error: error.stderr ? error.stderr.trim() : error.message 
            };
        }
    }

    async status() {
        console.log(`🌿 [Git] Verificando estado del repositorio...`);
        return this._runCommand('git status --short');
    }

    async add({ files = '.' }) {
        console.log(`🌿 [Git] Añadiendo archivos: ${files}`);
        return this._runCommand(`git add ${files}`);
    }

    async commit({ message }) {
        console.log(`🌿 [Git] Creando commit...`);
        // Escapamos las comillas dobles para evitar inyecciones en la terminal
        const safeMessage = message.replace(/"/g, '\\"');
        return this._runCommand(`git commit -m "${safeMessage}"`);
    }

    async push() {
        console.log(`🌿 [Git] Subiendo cambios al servidor remoto...`);
        return this._runCommand('git push');
    }

    async log({ limit = 5 }) {
        console.log(`🌿 [Git] Obteniendo últimos ${limit} commits...`);
        return this._runCommand(`git log -n ${limit} --oneline`);
    }
}

module.exports = new GitTools();
