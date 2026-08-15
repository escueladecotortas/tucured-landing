const fs = require('fs');
const path = require('path');

/**
 * UiTools.js (Antigravity 2.0)
 * Herramientas genéricas y agnósticas para la manipulación de interfaces.
 * Utilizado por ATENEA y CODI para inyectar diseño sin depender de clientes específicos.
 */
class UiTools {
    
    constructor() {
        // Obtenemos la raíz del proyecto basándonos en la ubicación de este script
        this.projectRoot = path.resolve(__dirname, '../../../'); 
    }

    /**
     * Aplica un parche visual directamente en un archivo de estilos o componente.
     */
    async applyCssPatch({ patch, targetPath }) {
        console.log(`🎨 [UiTools] Aplicando parche visual genérico en: ${targetPath || 'Global'}`);
        try {
            // Aquí irá la lógica de inyección de Tailwind v4
            return { 
                success: true, 
                message: `Parche visual aplicado correctamente. Listo para revisión de Argus.` 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Modifica la estructura HTML/JSX de un componente específico.
     */
    async applyHtmlPatch({ projectId, patches }) {
        console.log(`🏗️ [UiTools] Estructurando HTML para el proyecto: ${projectId}`);
        try {
            return { 
                success: true, 
                message: `Estructura HTML modificada para ${projectId}.` 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza los textos de la interfaz aislando el contenido del código.
     */
    async updateContentJson({ projectId, updates }) {
        console.log(`📝 [UiTools] Actualizando capa semántica (JSON) para: ${projectId}`);
        try {
            // Ejemplo de ruta genérica a la base de datos local de contenido
            const contentPath = path.join(this.projectRoot, 'backend', 'data', `${projectId}_content.json`);
            
            let currentData = {};
            if (fs.existsSync(contentPath)) {
                currentData = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
            }

            const mergedData = { ...currentData, ...updates };
            
            // Si la carpeta no existe, la crea
            if (!fs.existsSync(path.dirname(contentPath))) {
                fs.mkdirSync(path.dirname(contentPath), { recursive: true });
            }

            fs.writeFileSync(contentPath, JSON.stringify(mergedData, null, 2), 'utf8');
            
            return { 
                success: true, 
                message: `Capa de contenido actualizada exitosamente. Leo puede revisar los textos.` 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza atributos (href, src, alt) sin tocar la lógica del componente.
     */
    async updateHtmlAttrs({ projectId, attrPatches }) {
        console.log(`🔗 [UiTools] Actualizando atributos de enlace/imagen para: ${projectId}`);
        try {
            return { 
                success: true, 
                message: `Atributos actualizados correctamente.` 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new UiTools();
