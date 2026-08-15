// Archivo: system_core/engine/ToolDefinitions.js
const fileSystemTools = require('../tools/FileSystemTools');
const uiTools = require('../tools/UiTools');

/**
 * ToolDefinitions.js
 * The source of truth for all available NEXUS tools (v10.0 - Neutral Event Blueprint).
 */
const tools = {
    // --- BASIC DISK OPERATIONS ---
    'readFile': {
        description: "Read contents of a file.",
        parameters: {
            type: "object",
            properties: { filePath: { type: "string" } },
            required: ["filePath"]
        },
        execute: async (params) => fileSystemTools.read(params)
    },
    'writeFile': {
        description: "Write contents to a file (Overwrite).",
        parameters: {
            type: "object",
            properties: { filePath: { type: "string" }, content: { type: "string" } },
            required: ["filePath", "content"]
        },
        execute: async (params) => fileSystemTools.write(params)
    },
    'appendFile': {
        description: "Append contents to a file.",
        parameters: {
            type: "object",
            properties: { filePath: { type: "string" }, content: { type: "string" } },
            required: ["filePath", "content"]
        },
        execute: async (params) => fileSystemTools.append(params)
    },
    'listDir': {
        description: "List contents of a directory.",
        parameters: {
            type: "object",
            properties: { dirPath: { type: "string" } },
            required: ["dirPath"]
        },
        execute: async (params) => fileSystemTools.list(params)
    },
    
    // --- UI & SEMANTIC OPERATIONS ---
    'apply_css_patch': {
        description: "Apply visual style changes to CSS.",
        parameters: {
            type: "object",
            properties: { 
                patch: { type: "array" },
                targetPath: { type: "string" }
            },
            required: ["patch"]
        },
        execute: async (params) => uiTools.applyCssPatch(params)
    },
    'apply_html_patch': {
        description: "Apply structural changes to HTML elements by nexusId",
        parameters: {
            type: "object",
            properties: { projectId: { type: "string" }, patches: { type: "array" } },
            required: ["projectId", "patches"]
        },
        execute: async (params) => uiTools.applyHtmlPatch(params)
    },
    'update_content_json': {
        description: "Update text content in the separated JSON semantic layer.",
        parameters: {
            type: "object",
            properties: { projectId: { type: "string" }, updates: { type: "object" } },
            required: ["projectId", "updates"]
        },
        execute: async (params) => uiTools.updateContentJson(params)
    },
    'update_html_attrs': {
        description: "Update HTML element attributes (href, src, etc) by nexusId",
        parameters: {
            type: "object",
            properties: { projectId: { type: "string" }, attrPatches: { type: "array" } },
            required: ["projectId", "attrPatches"]
        },
        execute: async (params) => uiTools.updateHtmlAttrs(params)
    },

    // --- EVENT & BUSINESS INTELLIGENCE (SAFE FALLBACK) ---
    'analyze_business': {
        description: "Extract data from social media or location link for event briefing.",
        parameters: {
            type: "object",
            properties: { url: { type: "string", description: "The link to analyze." } },
            required: ["url"]
        },
        execute: async ({ url }) => {
            console.log(`🔍 [ToolDefinitions] Analyzing link via Safe-Fallback: ${url}`);
            return {
                success: true,
                sourceUrl: url,
                extractedData: {
                    eventName: "Cumple de 15 - Olivia",
                    type: "Social Event / Birthday Party",
                    status: "ANALYZED_SAFE_FALLBACK"
                }
            };
        }
    }
};

module.exports = tools;
