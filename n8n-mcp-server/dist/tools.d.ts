import { z } from "zod";
/**
 * Schémas Zod pour les entrées des outils MCP.
 */
export declare const ListWorkflowsSchema: z.ZodObject<{
    active: z.ZodOptional<z.ZodBoolean>;
    limit: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    active?: boolean | undefined;
    limit?: number | undefined;
    name?: string | undefined;
    tags?: string | undefined;
}, {
    active?: boolean | undefined;
    limit?: number | undefined;
    name?: string | undefined;
    tags?: string | undefined;
}>;
export declare const GetWorkflowSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const ExecuteWorkflowSchema: z.ZodObject<{
    id: z.ZodString;
    startNodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    destinationNode: z.ZodOptional<z.ZodString>;
    inputData: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    startNodes?: string[] | undefined;
    destinationNode?: string | undefined;
    inputData?: unknown;
}, {
    id: string;
    startNodes?: string[] | undefined;
    destinationNode?: string | undefined;
    inputData?: unknown;
}>;
export type ListWorkflowsInput = z.infer<typeof ListWorkflowsSchema>;
export type GetWorkflowInput = z.infer<typeof GetWorkflowSchema>;
export type ExecuteWorkflowInput = z.infer<typeof ExecuteWorkflowSchema>;
/**
 * Définitions des outils exposés au client MCP.
 */
export declare const toolDefinitions: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            active: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            tags: {
                type: string;
                description: string;
            };
            id?: undefined;
            startNodes?: undefined;
            destinationNode?: undefined;
            inputData?: undefined;
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            id: {
                type: string;
                description: string;
            };
            active?: undefined;
            limit?: undefined;
            name?: undefined;
            tags?: undefined;
            startNodes?: undefined;
            destinationNode?: undefined;
            inputData?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            id: {
                type: string;
                description: string;
            };
            startNodes: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            destinationNode: {
                type: string;
                description: string;
            };
            inputData: {
                type: string;
                description: string;
            };
            active?: undefined;
            limit?: undefined;
            name?: undefined;
            tags?: undefined;
        };
        required: string[];
    };
})[];
/**
 * Implémentations des outils.
 */
export declare function handleListWorkflows(args: unknown): Promise<string>;
export declare function handleGetWorkflow(args: unknown): Promise<string>;
export declare function handleExecuteWorkflow(args: unknown): Promise<string>;
export declare function handleTool(name: string, args: unknown): Promise<string>;
//# sourceMappingURL=tools.d.ts.map