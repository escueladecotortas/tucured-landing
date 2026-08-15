// Archivo: system_core/engine/ToolRegistry.js
/**
 * ToolRegistry.js
 * Atomic Tool Orchestration Engine (v3.0)
 * Adheres to the 200-line limit by offloading definitions to ToolDefinitions.js.
 */
const tools = require('./ToolDefinitions');

class ToolRegistry {
    constructor() {
        this.tools = tools;
    }

    /**
     * Get list of tools formatted for Gemini Function Calling
     */
    getToolDefinitions() {
        return Object.keys(this.tools).map(key => ({
            name: key,
            description: this.tools[key].description,
            parameters: this.tools[key].parameters
        }));
    }

    /**
     * TOKEN DIET: Get 'Lite' definitions based on Agent Role.
     */
    getLiteDefinitions(role = 'nexus') {
        const rolePermissions = {
            'codi': ['readFile', 'writeFile', 'appendFile', 'listDir', 'update_content_json', 'git_status', 'git_add', 'git_commit', 'read_url_content'],
            'atenea': ['readFile', 'listDir', 'apply_css_patch', 'apply_html_patch', 'update_html_attrs', 'look_at_screen', 'update_content_json'],
            'nexus': ['getSystemTime', 'listDir', 'readFile', 'searchKnowledgeBase', 'remember', 'analyze_business']
        };

        const allowedTools = rolePermissions[role] || rolePermissions['nexus'];
        return allowedTools.map(toolName => {
            const tool = this.tools[toolName];
            if (!tool) return null;
            const params = tool.parameters?.properties ? Object.keys(tool.parameters.properties) : [];
            return `- ${toolName}(${params.join(', ')}): ${tool.description}`;
        }).filter(Boolean).join('\n');
    }

    /**
     * Execute a tool by name
     */
    async execute(name, params, context = {}) {
        const tool = this.tools[name];
        if (!tool) throw new Error(`Tool '${name}' not found.`);
        try {
            return await tool.execute(params || {}, context);
        } catch (error) {
            console.error(`❌ [ToolRegistry] Execution failed for ${name}:`, error);
            return { error: error.message };
        }
    }
}

module.exports = new ToolRegistry();
