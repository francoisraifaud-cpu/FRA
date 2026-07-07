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
export const UpdateWorkflowSchema = z.object({
    id: z.string().describe("ID du workflow à mettre à jour"),
    workflow: z
        .object({})
        .passthrough()
        .describe("Objet workflow complet (name, nodes, connections, settings...) tel que retourné par n8n_get_workflow, avec tes modifications appliquées."),
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
    {
        name: "n8n_update_workflow",
        description: "Mettre à jour un workflow n8n via PUT /api/v1/workflows/:id. Passe l'objet workflow complet (récupéré via n8n_get_workflow) avec tes modifications. Le serveur ne renvoie que les champs autorisés par l'API publique (name, nodes, connections, settings, staticData).",
        inputSchema: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    description: "ID du workflow à mettre à jour.",
                },
                workflow: {
                    type: "object",
                    description: "Objet workflow complet (name, nodes, connections, settings...) avec les modifications appliquées.",
                },
            },
            required: ["id", "workflow"],
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
export async function handleUpdateWorkflow(args) {
    const { id, workflow } = UpdateWorkflowSchema.parse(args);
    // L'API publique n8n (PUT /workflows/:id) n'accepte qu'un sous-ensemble de champs.
    // Tout champ en lecture seule (id, active, createdAt, tags, versionId...) provoque une 400.
    const allowed = ["name", "nodes", "connections", "staticData"];
    const body = {};
    for (const key of allowed) {
        if (typeof workflow[key] !== "undefined") {
            body[key] = workflow[key];
        }
    }
    // settings : l'API publique n'accepte qu'un sous-ensemble de clés.
    const ALLOWED_SETTINGS = ["saveExecutionProgress", "saveManualExecutions", "saveDataErrorExecution", "saveDataSuccessExecution", "executionTimeout", "errorWorkflow", "timezone", "executionOrder"];
    const cleanSettings = {};
    const src = workflow.settings || {};
    for (const k of ALLOWED_SETTINGS) {
        if (typeof src[k] !== "undefined")
            cleanSettings[k] = src[k];
    }
    body.settings = cleanSettings;
    if (typeof body.name === "undefined") {
        throw new Error("Le champ 'name' est requis dans l'objet workflow pour un PUT.");
    }
    const res = await n8nFetch(`/api/v1/workflows/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`Échec PUT workflow ${id} (status ${res.status}): ${text}`);
    }
    return text;
}
export async function handleTool(name, args) {
    switch (name) {
        case "n8n_list_workflows":
            return handleListWorkflows(args);
        case "n8n_get_workflow":
            return handleGetWorkflow(args);
        case "n8n_execute_workflow":
            return handleExecuteWorkflow(args);
        case "n8n_update_workflow":
            return handleUpdateWorkflow(args);
        default:
            throw new Error(`Outil inconnu: ${name}`);
    }
}
//# sourceMappingURL=tools.js.map