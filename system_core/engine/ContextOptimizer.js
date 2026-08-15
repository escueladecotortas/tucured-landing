// Archivo: system_core/engine/ContextOptimizer.js
const fs = require('fs');

class ContextOptimizer {
    constructor(maxCharLimit = 12000) {
        this.maxCharLimit = maxCharLimit;
    }

    optimizeHistory(messages, targetLimit = 10) {
        if (!Array.isArray(messages) || messages.length <= targetLimit) {
            return messages;
        }

        const systemMessages = messages.filter(m => m.role === 'system');
        const recentMessages = messages.slice(-targetLimit);
        
        // Generar un resumen sintético de los mensajes antiguos descartados
        const discardedCount = messages.length - recentMessages.length - systemMessages.length;
        if (discardedCount > 0) {
            const summaryMessage = {
                role: 'system',
                content: `[RESUMEN DE CONTEXTO]: Se han comprimido ${discardedCount} turnos anteriores para mantener eficiencia de memoria.`
            };
            return [...systemMessages, summaryMessage, ...recentMessages];
        }

        return [...systemMessages, ...recentMessages];
    }

    truncateText(text, limit = this.maxCharLimit) {
        if (!text || text.length <= limit) return text;
        
        const half = Math.floor(limit / 2) - 100;
        const head = text.substring(0, half);
        const tail = text.substring(text.length - half);
        
        return `${head}\n\n... [CONTENIDO TRUNCADO POR OPTIMIZADOR DE CONTEXTO: ${text.length - limit} CARACTERES REMOVIDOS] ...\n\n${tail}`;
    }

    auditFileFootprint(filePath) {
        if (!fs.existsSync(filePath)) return { path: filePath, size: 0, healthy: true };
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const isHealthy = content.length <= this.maxCharLimit;
        
        return {
            path: filePath,
            characterCount: content.length,
            limit: this.maxCharLimit,
            healthy: isHealthy,
            recommendation: isHealthy ? 'OK' : `Reducir ${content.length - this.maxCharLimit} caracteres.`
        };
    }
}

module.exports = ContextOptimizer;
