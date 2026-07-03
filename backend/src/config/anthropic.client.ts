import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { resolveAnthropicKey } from "../services/settings.services";

// Load environment variables from .env file
dotenv.config();

// Build a client using the resolved Anthropic key (UI-entered value via the
// settings store, falling back to ANTHROPIC_API_KEY from .env). Constructed per
// call so a key entered through the UI takes effect without a server restart.
export const getAnthropicClient = async (): Promise<Anthropic> => {
    const apiKey = await resolveAnthropicKey();
    if (!apiKey) {
        throw new Error(
            "Missing Anthropic API key. Add it in the app Settings or set ANTHROPIC_API_KEY in backend/.env."
        );
    }
    return new Anthropic({ apiKey });
};
