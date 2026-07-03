// src/types/GenerativeModels.ts
import { GPT_3_5_TURBO_MODEL_NAME, GPT_4_MODEL_NAME } from '../utils/secrets';

export type ModelProvider = 'openai' | 'anthropic' | 'ollama' | 'groq';

export class GenerativeModels {
    // Maps a card's generativeModel key to the concrete model identifier:
    // an Azure deployment name for OpenAI models, or a Claude model ID for Anthropic.
    static readonly ModelMapping: { [key: string]: string } = {
        GPT_3_5_TURBO: GPT_3_5_TURBO_MODEL_NAME,
        GPT_4: GPT_4_MODEL_NAME,
        CLAUDE_OPUS_4_8: 'claude-opus-4-8',
        CLAUDE_SONNET_4_6: 'claude-sonnet-4-6',
        CLAUDE_HAIKU_4_5: 'claude-haiku-4-5',
        LLAMA_3_1: 'llama3.1:8b',
        LLAMA_3_2_1B: 'llama3.2:1b',
        GROQ_LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
        GROQ_LLAMA_3_1_8B: 'llama-3.1-8b-instant'
    };

    // Maps each model key to the provider that serves it.
    static readonly ProviderMapping: { [key: string]: ModelProvider } = {
        GPT_3_5_TURBO: 'openai',
        GPT_4: 'openai',
        CLAUDE_OPUS_4_8: 'anthropic',
        CLAUDE_SONNET_4_6: 'anthropic',
        CLAUDE_HAIKU_4_5: 'anthropic',
        LLAMA_3_1: 'ollama',
        LLAMA_3_2_1B: 'ollama',
        GROQ_LLAMA_3_3_70B: 'groq',
        GROQ_LLAMA_3_1_8B: 'groq'
    };

    // UI-facing catalog: display label, serving provider, and whether the model
    // is free (no API key required). Order controls display order within a group.
    static readonly Catalog: { value: string; label: string; provider: ModelProvider; free: boolean }[] = [
        { value: 'LLAMA_3_2_1B', label: 'Llama 3.2 1B (local, light)', provider: 'ollama', free: true },
        { value: 'LLAMA_3_1', label: 'Llama 3.1 8B (local)', provider: 'ollama', free: true },
        { value: 'GROQ_LLAMA_3_3_70B', label: 'Llama 3.3 70B (Groq cloud)', provider: 'groq', free: true },
        { value: 'GROQ_LLAMA_3_1_8B', label: 'Llama 3.1 8B (Groq cloud)', provider: 'groq', free: true },
        { value: 'CLAUDE_OPUS_4_8', label: 'Claude Opus 4.8', provider: 'anthropic', free: false },
        { value: 'CLAUDE_SONNET_4_6', label: 'Claude Sonnet 4.6', provider: 'anthropic', free: false },
        { value: 'CLAUDE_HAIKU_4_5', label: 'Claude Haiku 4.5', provider: 'anthropic', free: false },
        { value: 'GPT_4', label: 'GPT-4', provider: 'openai', free: false },
        { value: 'GPT_3_5_TURBO', label: 'GPT-3.5 Turbo', provider: 'openai', free: false }
    ];

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
