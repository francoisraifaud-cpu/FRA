#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { toolDefinitions, handleTool } from "./tools.js";
const server = new Server({
    name: "n8n-mcp-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Liste des outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: toolDefinitions,
    };
});
// Exécution d’un outil
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const result = await handleTool(name, args);
        return {
            content: [
                {
                    type: "text",
                    text: result,
                },
            ],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // On renvoie l’erreur comme résultat pour que le client (Cursor) voie ce qui s’est passé.
        return {
            content: [
                {
                    type: "text",
                    text: `Erreur outil ${name}: ${message}`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("n8n-mcp-server démarré sur stdio");
}
main().catch((error) => {
    console.error("Erreur fatale du serveur MCP:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map