// Archivo: system_core/engine/MastraTools.js
const { z } = require('zod');
const toolRegistry = require('./ToolRegistry');

/**
 * MastraTools.js
 * Bridging NEXUS ToolRegistry to Mastra Tool Specs.
 * Uses Zod for type-safe parameter validation.
 */
const mastraTools = {
    readFile: {
        id: 'readFile',
        description: 'Read contents of a file.',
        schema: z.object({
            filePath: z.string().describe('Absolute path to the file')
        }),
        execute: async ({ context }) => toolRegistry.execute('readFile', context)
    },
    writeFile: {
        id: 'writeFile',
        description: 'Write contents to a file (Overwrite).',
        schema: z.object({
            filePath: z.string().describe('Absolute path to the file'),
            content: z.string().describe('Full content to write')
        }),
        execute: async ({ context }) => toolRegistry.execute('writeFile', context)
    },
    listDir: {
        id: 'listDir',
        description: 'List contents of a directory.',
        schema: z.object({
            dirPath: z.string().describe('Absolute path to the directory')
        }),
        execute: async ({ context }) => toolRegistry.execute('listDir', context)
    },
    apply_css_patch: {
        id: 'apply_css_patch',
        description: 'Apply visual style changes to CSS.',
        schema: z.object({
            patch: z.array(z.object({
                selector: z.string(),
                styles: z.record(z.string())
            })),
            targetPath: z.string().optional()
        }),
        execute: async ({ context }) => toolRegistry.execute('apply_css_patch', context)
    },
    update_content_json: {
        id: 'update_content_json',
        description: 'Update text content in semantic JSON layer.',
        schema: z.object({
            projectId: z.string(),
            updates: z.record(z.string())
        }),
        execute: async ({ context }) => toolRegistry.execute('update_content_json', context)
    }
};

module.exports = mastraTools;
