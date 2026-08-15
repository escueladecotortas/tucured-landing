const fs = require('fs');
const path = require('path');

/**
 * KnowledgeTools.js (Antigravity 2.0)
 * Gestiona la memoria semántica local (RAG) de los agentes.
 */
class KnowledgeTools {
    constructor() {
        // Ruta donde se guardará la memoria a largo plazo del sistema
        this.memoryPath = path.resolve(__dirname, '../../../backend/data/nexus_memory.json');
    }

    _ensureMemoryExists() {
        const dir = path.dirname(this.memoryPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.memoryPath)) {
            fs.writeFileSync(this.memoryPath, JSON.stringify([]), 'utf8');
        }
    }

    /**
     * Busca información en la base de conocimientos.
     */
    async search({ query }) {
        console.log(`🧠 [Knowledge] Buscando en memoria: ${query}`);
        try {
            this._ensureMemoryExists();
            const memories = JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
            
            // Búsqueda simple por coincidencias de texto
            const results = memories.filter(m => 
                m.content.toLowerCase().includes(query.toLowerCase()) || 
                (m.tags && m.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
            );

            return { 
                success: true, 
                results: results.length > 0 ? results : "No se encontró información relevante en la memoria." 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Añade un nuevo conocimiento o regla a la memoria.
     */
    async add({ content, tags }) {
        console.log(`🧠 [Knowledge] Guardando nueva memoria...`);
        try {
            this._ensureMemoryExists();
            const memories = JSON.parse(fs.readFileSync(this.memoryPath, 'utf8'));
            
            memories.push({ 
                content, 
                tags: tags || [], 
                timestamp: new Date().toISOString() 
            });
            
            fs.writeFileSync(this.memoryPath, JSON.stringify(memories, null, 2), 'utf8');
            return { success: true, message: "Memoria guardada correctamente en la Bóveda." };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new KnowledgeTools();
