// Archivo: system_core/engine/AgentRuntime.js
/**
 * AgentRuntime.js — [NEXUS PRO CORE ENGINE]
 * Unified Action-Observation execution runtime with native Function Calling support.
 */
const toolRegistry = require('./ToolRegistry');
const mastraAgents = require('./MastraAgents');

class AgentRuntime {
    constructor(profile = {}) {
        this.id = profile.id || 'nexus';
        this.role = profile.role || 'Chief Operating Officer';
        this.profile = profile;
        this.state = 'IDLE';
        this.shortTermMemory = [];
        this.agent = mastraAgents[`${this.id}Agent`] || mastraAgents.nexusAgent;
    }

    setState(newState) {
        console.log(`🔄 [${this.id.toUpperCase()}] ${newState}`);
        this.state = newState;
        if (this.onStateChange) this.onStateChange(newState);
    }

    async interact(userMessage, projectId = null) {
        this.setState('THINKING');
        this.shortTermMemory.push({ role: 'user', content: userMessage });

        try {
            if (this.agent && typeof this.agent.generate === 'function') {
                const response = await this.agent.generate(userMessage, {
                    context: this.shortTermMemory.slice(-6)
                });
                this.setState('IDLE');
                return { agentId: this.id, content: response.text || response };
            }

            // Fallback: Dynamic Tool Execution Loop via ToolRegistry
            this.setState('WORKING');
            const toolsDefinition = toolRegistry.getLiteDefinitions(this.id);
            const actionResult = await this.executeToolCall('listDir', { path: './' });

            this.setState('IDLE');
            return { 
                agentId: this.id, 
                content: `Operación procesada con herramientas dinámicas.`,
                tools: toolsDefinition,
                result: actionResult
            };
        } catch (error) {
            console.error(`💥 Error Crítico (${this.id}):`, error);
            this.setState('IDLE');
            return { agentId: this.id, content: "Error en el motor de ejecución.", error: error.message };
        }
    }

    async executeToolCall(toolName, params = {}) {
        try {
            return await toolRegistry.execute(toolName, params, { agentId: this.id });
        } catch (error) {
            return { error: `Fallo en ejecución de herramienta '${toolName}': ${error.message}` };
        }
    }
}

module.exports = AgentRuntime;
