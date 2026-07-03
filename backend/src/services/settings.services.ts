// ./src/services/settings.services.ts

import { SettingsModel, SettingsDocument } from '../models/settings.models';
import {
    ANTHROPIC_API_KEY,
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT,
    OLLAMA_BASE_URL,
    GROQ_API_KEY
} from '../utils/secrets';

// Fetch the singleton settings document, creating it on first use.
export const getSettingsDoc = async (): Promise<SettingsDocument> => {
    let doc = await SettingsModel.findOne({ key: 'global' }).exec();
    if (!doc) {
        doc = await SettingsModel.create({ key: 'global' });
    }
    return doc;
};

// Update editable settings. Pass an empty string to clear a key (revert to .env).
export const updateSettingsDoc = async (patch: { anthropicApiKey?: string }): Promise<SettingsDocument> => {
    const doc = await getSettingsDoc();
    if (typeof patch.anthropicApiKey === 'string') {
        doc.anthropicApiKey = patch.anthropicApiKey.trim();
    }
    await doc.save();
    return doc;
};

// Resolve the Anthropic key: UI-entered value wins, otherwise fall back to .env.
export const resolveAnthropicKey = async (): Promise<string> => {
    const doc = await getSettingsDoc();
    return doc.anthropicApiKey || ANTHROPIC_API_KEY || '';
};

// Azure placeholder values from the local .env should not count as "configured".
const isRealAzureValue = (value: string | undefined): boolean =>
    !!value && !value.toLowerCase().includes('placeholder');

export const isOpenAIConfigured = (): boolean =>
    isRealAzureValue(AZURE_OPENAI_API_KEY) && isRealAzureValue(AZURE_OPENAI_ENDPOINT);

// Groq (free hosted) is available when an API key is configured in the environment.
export const isGroqConfigured = (): boolean => !!GROQ_API_KEY;

// Best-effort reachability check for the local Ollama server.
export const isOllamaReachable = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${OLLAMA_BASE_URL}/models`, { signal: controller.signal });
        clearTimeout(timeout);
        return res.ok;
    } catch {
        return false;
    }
};

// Show only the last 4 characters of a secret, masking the rest.
export const maskKey = (value: string): string => {
    if (!value) return '';
    if (value.length <= 4) return '••••';
    return `••••••••${value.slice(-4)}`;
};
