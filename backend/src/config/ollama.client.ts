import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Ollama exposes an OpenAI-compatible API, so we reuse the official `openai`
// SDK pointed at an Ollama server. A local Ollama ignores the API key, so the
// dummy value "ollama" works. Set OLLAMA_API_KEY only if you point OLLAMA_BASE_URL
// at a hosted/protected Ollama that requires a bearer token (auth proxy, cloud).
let client: OpenAI | null = null;

export const getOllamaClient = (): OpenAI => {
    if (!client) {
        const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
        const apiKey = process.env.OLLAMA_API_KEY || "ollama";
        client = new OpenAI({ baseURL, apiKey });
    }
    return client;
};
