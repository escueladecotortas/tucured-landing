// Archivo: system_core/engine/NEXUSGraph.js
const { Workflow, Step } = require('mastra');
const { nexusAgent, ateneaAgent, codiAgent } = require('./MastraAgents');

// Safe-Fallback Mock para DurableSession (Desacoplado de backend legacy)
const durableSession = {
    setCheckpoint: async (projectId, step, data) => {
        console.log(`💾 [DurableSession Fallback] Checkpoint '${step}' registrado para '${projectId}'.`);
        return { success: true, checkpoint: step, timestamp: Date.now() };
    }
};

/**
 * NEXUSGraph.js
 * The Sovereign Workflow Engine (v10.0 - Local-First Resilient)
 */

// --- Step 1: Ingest & Context ---
const ingestStep = new Step({
    id: 'ingest_context',
    execute: async ({ context }) => {
        const { projectId, prompt } = context;
        console.log(`🔍 [Workflow] Ingesting context for ${projectId}...`);
        
        const res = await nexusAgent.execute({ 
            input: `Analyze project ${projectId} for this prompt: ${prompt}`
        });

        await durableSession.setCheckpoint(projectId, 'ingest_context', { res });
        return res;
    }
});

// --- Step 2: Design Strategy ---
const designStep = new Step({
    id: 'design_strategy',
    execute: async ({ context }) => {
        const { projectId } = context;
        console.log(`🎨 [Workflow] Designing strategy for ${projectId}...`);
        
        const res = await ateneaAgent.execute({
            input: 'Generate a design system and visual strategy (DESIGN.md)'
        });

        await durableSession.setCheckpoint(projectId, 'design_strategy', { res });
        return res;
    }
});

// --- Step 3: Atomic Construction ---
const buildStep = new Step({
    id: 'atomic_build',
    execute: async ({ context }) => {
        const { projectId } = context;
        console.log(`🏗️ [Workflow] Building components for ${projectId}...`);
        
        const res = await codiAgent.execute({
            input: 'Implement the designed components following the 200-line rule.'
        });

        await durableSession.setCheckpoint(projectId, 'atomic_build', { res });
        return res;
    }
});

// --- EXECUTION GRAPH DEFINITION ---
const landingWorkflow = new Workflow({
    id: 'landing_factory_v8',
    steps: [ingestStep, designStep, buildStep]
});

landingWorkflow
    .step(ingestStep)
    .then(designStep)
    .then(buildStep);

module.exports = { landingWorkflow };
