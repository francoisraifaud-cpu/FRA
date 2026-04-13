import { z } from "zod";
declare const ConfigSchema: z.ZodObject<{
    /**
     * URL de base de votre instance n8n, par ex.:
     * https://votre-instance-n8n.com ou http://localhost:5678
     */
    baseUrl: z.ZodDefault<z.ZodString>;
    /**
     * Clé d’API n8n, passée dans l’en-tête X-N8N-API-KEY.
     */
    apiKey: z.ZodString;
    /**
     * Timeout pour les appels HTTP vers n8n (en ms).
     */
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    baseUrl: string;
    apiKey: string;
    timeoutMs: number;
}, {
    apiKey: string;
    baseUrl?: string | undefined;
    timeoutMs?: number | undefined;
}>;
export type Config = z.infer<typeof ConfigSchema>;
export declare const config: Config;
export declare function n8nFetch(path: string, init?: RequestInit): Promise<Response>;
export {};
//# sourceMappingURL=config.d.ts.map