import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Ollama exposes an OpenAI-compatible API, so we reuse the official `openai`
// SDK pointed at the local Ollama server. No real API key is needed (Ollama
// ignores it), but the SDK requires a non-empty value.
let client: OpenAI | null = null;

export const getOllamaClient = (): OpenAI => {
    if (!client) {
        const baseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
        client = new OpenAI({ baseURL, apiKey: "ollama" });
    }
    return client;
};
