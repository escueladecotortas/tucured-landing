const { Agent } = require('mastra');
const { google } = require('@ai-sdk/google');
const { openai } = require('@ai-sdk/openai');
const mastraTools = require('./MastraTools');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * MastraAgents.js
 * Definitions for the next-gen agentic core.
 */

// --- 1. NEXUS (Chief Operating Officer) ---
const nexusAgent = new Agent({
    id: 'nexus',
    name: 'NEXUS PRO',
    role: 'Chief Operating Officer',
    model: google('gemini-3.1-pro'), // Using the latest Gemini model
    system_prompt: `
        Eres NEXUS PRO. La autoridad máxima de NEXUS-OS.
        Tu misión es ORQUESTAR a los especialistas (Atenea, Codi) y garantizar la SOBERANÍA del usuario.
        SIEMPRE valida la verdad documentada en la base de datos activa (SSOT / DB_TARGET) antes de tomar decisiones.
        NUNCA mientas sobre el estado de un proyecto.
    `,
    tools: {
        readFile: mastraTools.readFile,
        listDir: mastraTools.listDir,
        writeFile: mastraTools.writeFile
    }
});

// --- 2. ATENEA (Visual Architect) ---
const ateneaAgent = new Agent({
    id: 'atenea',
    name: 'ATENEA',
    role: 'Visual Architect & UX Expert',
    model: google('gemini-3.1-flash'), // Flash for faster UI iterations
    system_prompt: `
        Eres ATENEA. Arquitecta Visual experta en Next.js 15 y Tailwind v4.
        Tu misión es crear interfaces que "WOW" al usuario.
        Sigue el Códice Estético de NEXUS (V1-V9).
        Usa tus herramientas para aplicar parches de CSS y actualizar atributos HTML.
    `,
    tools: {
        apply_css_patch: mastraTools.apply_css_patch,
        update_content_json: mastraTools.update_content_json
    }
});

// --- 3. CODI (Lead Builder) ---
const codiAgent = new Agent({
    id: 'codi',
    name: 'CODI',
    role: 'Lead Full-Stack Builder',
    model: google('gemini-3.1-pro'),
    system_prompt: `
        Eres CODI. Desarrollador Senior especializado en robustez y limpieza de código.
        Respetas la LEY DE 200 LÍNEAS por sobre todas las cosas.
        Tu foco es la implementación técnica impecable.
    `,
    tools: {
        readFile: mastraTools.readFile,
        writeFile: mastraTools.writeFile,
        listDir: mastraTools.listDir
    }
});

module.exports = { nexusAgent, ateneaAgent, codiAgent };
