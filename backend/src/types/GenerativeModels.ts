// src/types/GenerativeModels.ts
import { GPT_3_5_TURBO_MODEL_NAME, GPT_4_MODEL_NAME } from '../utils/secrets';

export type ModelProvider = 'openai' | 'anthropic';

export class GenerativeModels {
    // Maps a card's generativeModel key to the concrete model identifier:
    // an Azure deployment name for OpenAI models, or a Claude model ID for Anthropic.
    static readonly ModelMapping: { [key: string]: string } = {
        GPT_3_5_TURBO: GPT_3_5_TURBO_MODEL_NAME,
        GPT_4: GPT_4_MODEL_NAME,
        CLAUDE_OPUS_4_8: 'claude-opus-4-8',
        CLAUDE_SONNET_4_6: 'claude-sonnet-4-6',
        CLAUDE_HAIKU_4_5: 'claude-haiku-4-5'
    };

    // Maps each model key to the provider that serves it.
    static readonly ProviderMapping: { [key: string]: ModelProvider } = {
        GPT_3_5_TURBO: 'openai',
        GPT_4: 'openai',
        CLAUDE_OPUS_4_8: 'anthropic',
        CLAUDE_SONNET_4_6: 'anthropic',
        CLAUDE_HAIKU_4_5: 'anthropic'
    };

    static isValidModel(model: string): boolean {
        return model in GenerativeModels.ModelMapping;
    }

    static getModelName(model: string): string {
        return GenerativeModels.ModelMapping[model];
    }

    static getProvider(model: string): ModelProvider {
        return GenerativeModels.ProviderMapping[model];
    }
}
