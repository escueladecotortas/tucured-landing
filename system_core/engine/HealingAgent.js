const { Agent } = require('mastra');
const { google } = require('@ai-sdk/google');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * HealingAgent.js
 * Specialized Emergency Diagnosis & Repair Agent.
 */

const healingAgent = new Agent({
    id: 'vitalis_healer', // VITALIS heritage
    name: 'VITALIS HEALER',
    role: 'Infrastructure & Code Recovery Expert',
    model: google('gemini-3.1-pro'),
    system_prompt: `
        Eres VITALIS HEALER. Tu única misión es reparar el flujo de NEXUS-OS cuando algo falla.
        Recibirás logs de error (Next.js Build errors, Vercel/Local logs, Linter errors, FS errors).
        Debes analizar la causa raíz y proponer una acción correctiva ATÓMICA.
        Si es un error de CSS (Tailwind v4), propón el parche.
        Si es un archivo faltante, indica cuál debe generarse.
        Tu tono es clínico, preciso y resolutivo.
    `
});


/**
 * Ejecuta el diagnóstico de un error.
 */
async function diagnoseAndRepair(errorLog, context = {}) {
    console.log("🩹 [Vitalis] Diagnosing system failure...");
    
    const response = await healingAgent.execute({
        input: `ERROR LOG: ${errorLog}\nCONTEXT: ${JSON.stringify(context)}\nProvide a JSON repair plan: { action: 'patch'|'regenerate'|'skip', targetFile: string, suggestion: string }`
    });

    return response;
}

module.exports = { healingAgent, diagnoseAndRepair };
