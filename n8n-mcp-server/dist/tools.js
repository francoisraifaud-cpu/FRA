import { z } from "zod";
import { n8nFetch } from "./config.js";
/**
 * Schémas Zod pour les entrées des outils MCP.
 */
export const ListWorkflowsSchema = z.object({
    active: z
        .boolean()
        .optional()
        .describe("Filtrer par statut actif (true) ou inactif (false)"),
    limit: z
        .number()
        .int()
        .positive()
        .max(250)
        .optional()
        .describe("Nombre maximum de workflows à retourner (max 250)"),
    name: z
        .string()
        .optional()
        .describe("Filtrer par nom de workflow (recherche partielle)"),
    tags: z
        .string()
        .optional()
        .describe("Liste de tags séparés par des virgules"),
});
export const GetWorkflowSchema = z.object({
    id: z.string().describe('ID du workflow, par ex. "workflow_abc123"'),
});
export const ExecuteWorkflowSchema = z.object({
    id: z.string().describe("ID du workflow à exécuter"),
    startNodes: z
        .array(z.string())
        .optional()
        .describe("Noms de nœuds à partir desquels démarrer l’exécution"),
    destinationNode: z
        .string()
        .optional()
        .describe("Nom du nœud jusqu’auquel exécuter le workflow"),
    inputData: z
        .unknown()
        .optional()
        .describe("Données d’entrée injectées dans le workflow"),
});
/**
 * Définitions des outils exposés au client MCP.
 */
export const toolDefinitions = [
    {
        name: "n8n_list_workflows",
        description: "Lister les workflows n8n via l’API /api/v1/workflows avec quelques filtres utiles.",
        inputSchema: {
            type: "object",
            properties: {
                active: {
                    type: "boolean",
                    description: "Filtrer par statut actif (true) ou inactif (false). Optionnel.",
                },
                limit: {
                    type: "number",
                    description: "Nombre maximum de workflows à retourner (max 250). Optionnel.",
                },
                name: {
                    type: "string",
                    description: "Filtrer par nom de workflow (recherche partielle). Optionnel.",
                },
                tags: {
                    type: "string",
                    description: "Liste de tags séparés par des virgules, pour filtrer. Optionnel.",
                },
            },
            required: [],
        },
    },
    {
        name: "n8n_get_workflow",
        description: "Récupérer un workflow n8n précis via /api/v1/workflows/:id.",
        inputSchema: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    description: 'ID du workflow, par ex. "workflow_abc123".',
                },
            },
            required: ["id"],
        },
    },
    {
        name: "n8n_execute_workflow",
        description: "Exécuter manuellement un workflow n8n via /api/v1/workflows/:id/run. Le serveur récupère d’abord la définition complète du workflow, puis lance l’exécution.",
        inputSchema: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    description: "ID du workflow à exécuter.",
                },
                startNodes: {
                    type: "array",
                    items: { type: "string" },
                    description: "Noms de nœuds à partir desquels démarrer l’exécution (facultatif).",
                },
                destinationNode: {
                    type: "string",
                    description: "Nom du nœud jusqu’auquel exécuter le workflow (facultatif).",
                },
                inputData: {
                    type: "object",
                    description: "Données d’entrée injectées dans le workflow (facultatif).",
                },
            },
            required: ["id"],
        },
    },
];
/**
 * Implémentations des outils.
 */
export async function handleListWorkflows(args) {
    const params = ListWorkflowsSchema.parse(args);
    const searchParams = new URLSearchParams();
    if (typeof params.active === "boolean") {
        searchParams.set("active", String(params.active));
    }
    if (typeof params.limit === "number") {
        searchParams.set("limit", String(params.limit));
    }
    if (params.name) {
        searchParams.set("name", params.name);
    }
    if (params.tags) {
        searchParams.set("tags", params.tags);
    }
    const query = searchParams.toString();
    const path = query ? `/api/v1/workflows?${query}` : "/api/v1/workflows";
    const res = await n8nFetch(path, { method: "GET" });
    const json = await res.json();
    return JSON.stringify(json, null, 2);
}
export async function handleGetWorkflow(args) {
    const { id } = GetWorkflowSchema.parse(args);
    const res = await n8nFetch(`/api/v1/workflows/${encodeURIComponent(id)}`, {
        method: "GET",
    });
    const json = await res.json();
    return JSON.stringify(json, null, 2);
}
export async function handleExecuteWorkflow(args) {
    const { id, startNodes, destinationNode, inputData } = ExecuteWorkflowSchema.parse(args);
    // 1) Récupérer la définition complète du workflow
    const workflowRes = await n8nFetch(`/api/v1/workflows/${encodeURIComponent(id)}`, { method: "GET" });
    if (!workflowRes.ok) {
        const text = await workflowRes.text();
        throw new Error(`Impossible de récupérer le workflow ${id} (status ${workflowRes.status}): ${text}`);
    }
    const workflowData = await workflowRes.json();
    // 2) Lancer l’exécution avec /run
    const body = {
        workflowData,
    };
    if (startNodes && startNodes.length > 0) {
        body.startNodes = startNodes;
    }
    if (destinationNode) {
        body.destinationNode = destinationNode;
    }
    if (typeof inputData !== "undefined") {
        body.inputData = inputData;
    }
    const runRes = await n8nFetch(`/api/v1/workflows/${encodeURIComponent(id)}/run`, {
        method: "POST",
        body: JSON.stringify(body),
    });
    const json = await runRes.json();
    return JSON.stringify(json, null, 2);
}
export async function handleTool(name, args) {
    switch (name) {
        case "n8n_list_workflows":
            return handleListWorkflows(args);
        case "n8n_get_workflow":
            return handleGetWorkflow(args);
        case "n8n_execute_workflow":
            return handleExecuteWorkflow(args);
        default:
            throw new Error(`Outil inconnu: ${name}`);
    }
}
//# sourceMappingURL=tools.js.map