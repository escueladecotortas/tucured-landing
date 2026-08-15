// Archivo: system_core/engine/CircuitBreaker.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CircuitBreaker {
    constructor(options = {}) {
        this.maxFailures = options.maxFailures || 3;
        this.resetTimeoutMs = options.resetTimeoutMs || 30000;
        this.failureCount = 0;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.lastStateChange = Date.now();
        this.logPath = options.logPath || path.join(__dirname, '../storage/circuit_breaker.json');
    }

    recordSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
        this.persistState();
    }

    recordFailure(errorDetails = '') {
        this.failureCount += 1;
        console.warn(`[CIRCUIT-BREAKER] Fallo registrado (${this.failureCount}/${this.maxFailures}): ${errorDetails}`);

        if (this.failureCount >= this.maxFailures) {
            this.state = 'OPEN';
            this.lastStateChange = Date.now();
            this.triggerAutoRollback(errorDetails);
        }
        this.persistState();
    }

    triggerAutoRollback(reason) {
        console.error(`[CIRCUIT-BREAKER] 🚨 Límite alcanzado (${this.maxFailures} fallos). Activando Auto-Rollback...`);
        try {
            // Guardar cambios pendientes en stash de seguridad
            execSync('git stash save "circuit_breaker_emergency_stash"', { stdio: 'pipe' });
            // Revertir a la versión limpia del último commit
            execSync('git checkout HEAD -- .', { stdio: 'pipe' });
            console.log(`[CIRCUIT-BREAKER] ✅ Auto-Rollback completado con éxito. Estado del código restaurado.`);
        } catch (err) {
            console.error(`[CIRCUIT-BREAKER] ❌ Fallo durante Auto-Rollback Git: ${err.message}`);
        }
    }

    canExecute() {
        if (this.state === 'CLOSED') return true;
        
        const now = Date.now();
        if (this.state === 'OPEN' && (now - this.lastStateChange) > this.resetTimeoutMs) {
            this.state = 'HALF_OPEN';
            console.log(`[CIRCUIT-BREAKER] Transicionando a HALF_OPEN. Permitiendo prueba de recuperación...`);
            return true;
        }

        return this.state !== 'OPEN';
    }

    persistState() {
        const payload = {
            state: this.state,
            failureCount: this.failureCount,
            lastStateChange: new Date(this.lastStateChange).toISOString()
        };
        try {
            const dir = path.dirname(this.logPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.logPath, JSON.stringify(payload, null, 2));
        } catch (e) {
            // Silencioso si no se puede escribir
        }
    }
}

module.exports = CircuitBreaker;
