// ./src/controllers/settings.controllers.ts

import { Request, Response, NextFunction } from 'express';
import { GenerativeModels, ModelProvider } from '../types/GenerativeModels';
import {
    getSettingsDoc,
    updateSettingsDoc,
    resolveAnthropicKey,
    isOpenAIConfigured,
    isOllamaReachable,
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
            openai: isOpenAIConfigured()
        };

        const models = GenerativeModels.Catalog.map((m) => ({
            value: m.value,
            label: m.label,
            provider: m.provider,
            free: m.free,
            available: availabilityByProvider[m.provider]
        }));

        return res.status(200).json({
            models,
            groups: [
                { id: 'free', label: 'Free (no API key)', models: models.filter((m) => m.free) },
                { id: 'paid', label: 'Requires API key', models: models.filter((m) => !m.free) }
            ]
        });
    } catch (err) {
        next(err);
    }
};
