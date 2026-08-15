const path = require('path');
const fs = require('fs');

/**
 * VisionTools.js (Antigravity 2.0)
 * Permite a los agentes "ver" capturando la pantalla local.
 */
class VisionTools {
    constructor() {
        this.screenshotsDir = path.resolve(__dirname, '../../../backend/data/screenshots');
    }

    /**
     * Captura la pantalla y devuelve la ruta de la imagen.
     */
    async capture() {
        console.log(`👁️ [Vision] Capturando pantalla actual...`);
        try {
            if (!fs.existsSync(this.screenshotsDir)) {
                fs.mkdirSync(this.screenshotsDir, { recursive: true });
            }
            
            const imagePath = path.join(this.screenshotsDir, `screen_${Date.now()}.png`);
            
            // Lógica agnóstica para intentar usar screenshot-desktop si está instalado
            try {
                const screenshot = require('screenshot-desktop');
                await screenshot({ filename: imagePath });
            } catch (err) {
                console.log(`⚠️ [Vision] Módulo de captura no disponible. Simulando imagen.`);
                fs.writeFileSync(imagePath, 'simulated_image_data_placeholder');
            }

            return imagePath;
        } catch (error) {
            console.error(`❌ [Vision] Error al capturar:`, error.message);
            throw new Error(`Error en la visión del sistema: ${error.message}`);
        }
    }
}

module.exports = new VisionTools();
