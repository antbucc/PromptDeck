// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * JSON error handler: turns raw errors (esp. AI provider failures) into a clear,
 * user-friendly message + status, instead of Express's default HTML error page.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorJsonHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const raw: string = (err && (err.message || String(err))) || 'Unknown error';
    const low = raw.toLowerCase();

    let status = err?.status || err?.statusCode || 500;
    let message = raw;

    if (low.includes('per day') || low.includes('tpd') || low.includes('per day (tpd)')) {
        status = 429;
        message = 'The free daily token limit of the AI provider (Groq) has been reached. It resets in ~24h. In the meantime use the local Ollama model, or upgrade the Groq plan for more tokens.';
    } else if (low.includes('tokens per minute') || low.includes('request too large') || low.includes('rate limit') || low.includes('429') || low.includes('too many requests')) {
        status = 429;
        message = 'The AI provider hit a per-minute rate/size limit on the free tier. Try a more capable model (e.g. Groq Llama 3.3 70B), shorten the input/documents, then retry in a minute.';
    } else if (low.includes('groq_api_key')) {
        status = 400;
        message = 'Groq is not configured on the server (missing GROQ_API_KEY).';
    } else if (low.includes('anthropic api key') || low.includes('anthropic_api_key')) {
        status = 400;
        message = 'Claude is not configured (missing Anthropic API key).';
    } else if (low.includes('access denied') || low.includes('subscription key')) {
        status = 400;
        message = 'The selected GPT/Azure model is not configured on the server. Pick a Groq model instead.';
    } else if (low.includes('econnrefused') || low.includes('11434') || low.includes('ollama')) {
        status = 503;
        message = 'The local model (Ollama) is not reachable from the server. Use a Groq model instead.';
    } else if (low.includes('not a valid json') || low.includes('unterminated') || low.includes('invalid generated cards')) {
        status = 502;
        message = 'The model returned malformed output for this task. Try again, or use a more capable model (e.g. Groq Llama 3.3 70B).';
    }

    console.error('API error:', raw);
    res.status(status).json({ message, detail: raw.slice(0, 300) });
};
