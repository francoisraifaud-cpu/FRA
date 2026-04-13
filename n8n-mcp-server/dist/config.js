import { z } from "zod";
const ConfigSchema = z.object({
    /**
     * URL de base de votre instance n8n, par ex.:
     * https://votre-instance-n8n.com ou http://localhost:5678
     */
    baseUrl: z.string().url().default("http://localhost:5678"),
    /**
     * Clé d’API n8n, passée dans l’en-tête X-N8N-API-KEY.
     */
    apiKey: z.string().min(1, "N8N_API_KEY est requis"),
    /**
     * Timeout pour les appels HTTP vers n8n (en ms).
     */
    timeoutMs: z.number().int().positive().default(30000),
});
export const config = ConfigSchema.parse({
    baseUrl: process.env.N8N_BASE_URL,
    apiKey: process.env.N8N_API_KEY,
    timeoutMs: process.env.N8N_TIMEOUT_MS
        ? Number(process.env.N8N_TIMEOUT_MS)
        : undefined,
});
export async function n8nFetch(path, init = {}) {
    const url = new URL(path, config.baseUrl).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
    const headers = new Headers(init.headers || {});
    headers.set("X-N8N-API-KEY", config.apiKey);
    if (!headers.has("Content-Type") && init.body) {
        headers.set("Content-Type", "application/json");
    }
    try {
        return await fetch(url, {
            ...init,
            headers,
            signal: controller.signal,
        });
    }
    finally {
        clearTimeout(timeout);
    }
}
//# sourceMappingURL=config.js.map