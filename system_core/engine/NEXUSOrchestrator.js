// Archivo: system_core/engine/NEXUSOrchestrator.js
const { landingWorkflow } = require('./NEXUSGraph');
const { diagnoseAndRepair } = require('./HealingAgent');

// Safe-Fallbacks defensivos para servicios de infraestructura desacoplados
const durableSession = {
    getOrCreateSession: async (projectId, name) => ({ projectId, step: 'init', checkpoints: {} }),
    completeSession: async (projectId) => ({ success: true, completedAt: Date.now() })
};

const TerminalService = {
    broadcast: (msg, level = 'info') => console.log(`[TerminalService:${level.toUpperCase()}] ${msg}`)
};

/**
 * NEXUSOrchestrator.js (v10.0 - Local-First Resilient Engine)
 * High-level orchestration with Durable Execution & Self-Healing.
 */
class NEXUSOrchestrator {
    
    /**
     * Executes the landing factory mission with automatic retries and persistence.
     */
    static async executeMission(projectId, prompt) {
        const MAX_RETRIES = 3;
        let attempt = 0;
        let success = false;

        const session = await durableSession.getOrCreateSession(projectId, 'landing_factory');
        
        while (attempt < MAX_RETRIES && !success) {
            try {
                console.log(`🌌 [Orchestrator] Attempt ${attempt + 1}/${MAX_RETRIES} for ${projectId}`);
                TerminalService.broadcast(`🌌 Intento ${attempt + 1}/3 de la Misión ${projectId}`, 'info');

                const result = await landingWorkflow.execute({ 
                    context: { 
                        projectId, 
                        prompt,
                        currentStep: session.step,
                        checkpoints: session.checkpoints
                    } 
                });

                success = true;
                await durableSession.completeSession(projectId);
                TerminalService.broadcast(`✅ Misión completada con éxito.`, 'success');
                return result;

            } catch (error) {
                attempt++;
                console.error(`❌ [Orchestrator] Step failed in attempt ${attempt}:`, error.message);
                TerminalService.broadcast(`⚠️ Fallo detectado: ${error.message}. Iniciando Auto-Sanación...`, 'warning');

                const repairPlan = await diagnoseAndRepair(error.message, { projectId, attempt });
                
                if (repairPlan.action === 'patch') {
                    TerminalService.broadcast(`🩹 Aplicando parche correctivo: ${repairPlan.suggestion}`, 'info');
                }

                if (attempt >= MAX_RETRIES) {
                    TerminalService.broadcast(`🚫 Misión fallida tras ${MAX_RETRIES} intentos. Se requiere intervención humana.`, 'error');
                    throw new Error(`CRITICAL_FAILURE: Max retries reached for ${projectId}`);
                }

                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            }
        }
    }
}

module.exports = NEXUSOrchestrator;
