// Archivo: system_core/tools/VectorStoreTools.js
const fs = require('fs');
const path = require('path');

class VectorStoreTools {
    constructor(storageDir = null) {
        this.storageDir = storageDir || path.join(__dirname, '../storage/vector');
        this.indexPath = path.join(this.storageDir, 'vector_index.json');
        this.documents = [];
        this.loadIndex();
    }

    tokenize(text) {
        if (!text) return [];
        return text.toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }

    calculateTfIdf(tokens, corpus) {
        const tf = {};
        tokens.forEach(token => { tf[token] = (tf[token] || 0) + 1; });
        const docCount = corpus.length || 1;
        const vector = {};
        
        Object.keys(tf).forEach(token => {
            const matches = corpus.filter(doc => doc.tokens.includes(token)).length || 1;
            const idf = Math.log(docCount / matches) + 1;
            vector[token] = (tf[token] / tokens.length) * idf;
        });
        return vector;
    }

    cosineSimilarity(vecA, vecB) {
        const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
        let dotProduct = 0, normA = 0, normB = 0;
        keys.forEach(key => {
            const valA = vecA[key] || 0;
            const valB = vecB[key] || 0;
            dotProduct += valA * valB;
            normA += valA * valA;
            normB += valB * valB;
        });
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    addDocument(id, content, metadata = {}) {
        const tokens = this.tokenize(content);
        const doc = { id, content, metadata, tokens, timestamp: new Date().toISOString() };
        const existingIndex = this.documents.findIndex(d => d.id === id);
        if (existingIndex >= 0) {
            this.documents[existingIndex] = doc;
        } else {
            this.documents.push(doc);
        }
        this.saveIndex();
        return doc;
    }

    searchSimilar(queryText, limit = 5) {
        const queryTokens = this.tokenize(queryText);
        if (queryTokens.length === 0 || this.documents.length === 0) return [];
        
        const queryVector = this.calculateTfIdf(queryTokens, this.documents);
        const results = this.documents.map(doc => {
            const docVector = this.calculateTfIdf(doc.tokens, this.documents);
            const score = this.cosineSimilarity(queryVector, docVector);
            return { id: doc.id, content: doc.content, metadata: doc.metadata, score };
        });

        return results.sort((a, b) => b.score - a.score).slice(0, limit);
    }

    saveIndex() {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
        fs.writeFileSync(this.indexPath, JSON.stringify(this.documents, null, 2), 'utf-8');
    }

    loadIndex() {
        if (fs.existsSync(this.indexPath)) {
            try {
                this.documents = JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
            } catch (err) {
                this.documents = [];
            }
        }
    }
}

module.exports = VectorStoreTools;
