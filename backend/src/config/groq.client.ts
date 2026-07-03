import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Groq exposes a free, hosted, OpenAI-compatible API — ideal for a cloud
// deployment (e.g. Railway) where a local Ollama isn't reachable. We reuse the
// official `openai` SDK pointed at Groq's endpoint. Get a free key at
// https://console.groq.com and set GROQ_API_KEY in the server environment.
let client: OpenAI | null = null;

export const getGroqClient = (): OpenAI => {
    if (!client) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error(
                "Missing GROQ_API_KEY. Add it in your server environment (free key at https://console.groq.com)."
            );
        }
        const baseURL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
        client = new OpenAI({ baseURL, apiKey });
    }
    return client;
};
