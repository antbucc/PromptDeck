// ./src/controllers/settings.controllers.ts

import { Request, Response, NextFunction } from 'express';
import { GenerativeModels, ModelProvider } from '../types/GenerativeModels';
import { DEFAULT_MODEL } from '../utils/secrets';
import {
    getSettingsDoc,
    updateSettingsDoc,
    resolveAnthropicKey,
    isOpenAIConfigured,
    isOllamaReachable,
    isGroqConfigured,
    maskKey
} from '../services/settings.services';

// GET /api/settings — provider configuration status. Never returns full keys.
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doc = await getSettingsDoc();
        const anthropicKey = await resolveAnthropicKey();

        return res.status(200).json({
            anthropic: {
                editable: true,
                configured: !!anthropicKey,
                masked: maskKey(anthropicKey),
                // True when the active key comes from the UI rather than .env.
                fromUi: !!doc.anthropicApiKey
            },
            openai: {
                editable: false,
                configured: isOpenAIConfigured(),
                note: 'Configured server-side via backend/.env (Azure key, endpoint, deployments).'
            }
        });
    } catch (err) {
        next(err);
    }
};

// PUT /api/settings — update UI-editable provider keys. Empty string clears.
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    const { anthropicApiKey } = req.body as { anthropicApiKey?: string };
    try {
        await updateSettingsDoc({ anthropicApiKey });
        return getSettings(req, res, next);
    } catch (err) {
        next(err);
    }
};

// GET /api/models — model catalog grouped by free/paid with live availability.
export const getModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [anthropicKey, ollamaUp] = await Promise.all([
            resolveAnthropicKey(),
            isOllamaReachable()
        ]);

        const availabilityByProvider: Record<ModelProvider, boolean> = {
            ollama: ollamaUp,
            anthropic: !!anthropicKey,
            openai: isOpenAIConfigured(),
            groq: isGroqConfigured()
        };

        const models = GenerativeModels.Catalog.map((m) => ({
            value: m.value,
            label: m.label,
            provider: m.provider,
            free: m.free,
            available: availabilityByProvider[m.provider]
        }));

        // Group by provider so the user explicitly picks Ollama vs Groq vs Claude vs GPT.
        const providerGroups: { id: ModelProvider; label: string }[] = [
            { id: 'ollama', label: 'Ollama — local (free)' },
            { id: 'groq', label: 'Groq — cloud (free)' },
            { id: 'anthropic', label: 'Claude — Anthropic (API key)' },
            { id: 'openai', label: 'GPT — Azure OpenAI (API key)' }
        ];

        const groups = providerGroups
            .map((g) => ({ id: g.id, label: g.label, models: models.filter((m) => m.provider === g.id) }))
            .filter((g) => g.models.length > 0);

        // Preselected model for the UI (env-configurable, e.g. LLAMA_3_1 to default to Ollama).
        const defaultModel = DEFAULT_MODEL && GenerativeModels.isValidModel(DEFAULT_MODEL)
            ? DEFAULT_MODEL
            : 'GROQ_LLAMA_3_3_70B';

        return res.status(200).json({ models, groups, defaultModel });
    } catch (err) {
        next(err);
    }
};
