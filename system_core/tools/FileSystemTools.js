const fs = require('fs');
const path = require('path');

/**
 * FileSystemTools.js (Antigravity 2.0)
 * Proporciona a los agentes la capacidad de leer, escribir y listar archivos en el disco duro.
 * Diseñado con seguridad básica para resolver rutas relativas al proyecto.
 */
class FileSystemTools {
    constructor() {
        // Establece la raíz del proyecto para evitar que los agentes modifiquen archivos fuera del entorno
        this.projectRoot = path.resolve(__dirname, '../../../');
    }

    // Helper para asegurar que la ruta sea absoluta y correcta
    resolvePath(targetPath) {
        return path.resolve(this.projectRoot, targetPath);
    }

    /**
     * Lee el contenido de un archivo.
     */
    async read({ filePath }) {
        console.log(`📂 [FileSystem] Leyendo archivo: ${filePath}`);
        try {
            const absolutePath = this.resolvePath(filePath);
            if (!fs.existsSync(absolutePath)) {
                return { success: false, error: `El archivo ${filePath} no existe en el disco.` };
            }
            const content = fs.readFileSync(absolutePath, 'utf8');
            return { success: true, content };
        } catch (error) {
            console.error(`❌ [FileSystem] Error al leer:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Escribe contenido en un archivo. Sobrescribe si ya existe.
     */
    async write({ filePath, content }) {
        console.log(`✍️ [FileSystem] Escribiendo archivo: ${filePath}`);
        try {
            const absolutePath = this.resolvePath(filePath);
            const dir = path.dirname(absolutePath);
            
            // Crea la carpeta si no existe
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(absolutePath, content, 'utf8');
            return { success: true, message: `Archivo ${filePath} guardado exitosamente.` };
        } catch (error) {
            console.error(`❌ [FileSystem] Error al escribir:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Añade contenido al final de un archivo existente.
     */
    async append({ filePath, content }) {
        console.log(`➕ [FileSystem] Añadiendo contenido a: ${filePath}`);
        try {
            const absolutePath = this.resolvePath(filePath);
            if (!fs.existsSync(absolutePath)) {
                // Si no existe, usamos la función write para crearlo
                return this.write({ filePath, content });
            }
            fs.appendFileSync(absolutePath, '\n' + content, 'utf8');
            return { success: true, message: `Contenido anexado correctamente a ${filePath}.` };
        } catch (error) {
            console.error(`❌ [FileSystem] Error al anexar:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Lista los archivos y carpetas dentro de un directorio.
     */
    async list({ dirPath }) {
        console.log(`📋 [FileSystem] Listando directorio: ${dirPath}`);
        try {
            const absolutePath = this.resolvePath(dirPath);
            if (!fs.existsSync(absolutePath)) {
                return { success: false, error: `El directorio ${dirPath} no existe.` };
            }
            const files = fs.readdirSync(absolutePath);
            return { success: true, files };
        } catch (error) {
            console.error(`❌ [FileSystem] Error al listar:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new FileSystemTools();
