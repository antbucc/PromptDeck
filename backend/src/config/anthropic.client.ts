import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Lazily construct the client so the backend can still boot for OpenAI-only
// setups that don't configure an Anthropic API key. The key is only required
// once a Claude-backed card is actually executed or evaluated.
let client: Anthropic | null = null;

export const getAnthropicClient = (): Anthropic => {
    if (!client) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error("Missing ANTHROPIC_API_KEY for Anthropic configuration");
        }
        client = new Anthropic({ apiKey });
    }
    return client;
};
