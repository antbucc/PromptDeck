// src/hooks/useModels.ts
import { useEffect, useState, useCallback } from 'react';
import { fetchModels } from '../services/api';

export interface ModelInfo {
    value: string;
    label: string;
    provider: 'ollama' | 'anthropic' | 'openai' | 'groq';
    free: boolean;
    available: boolean;
}

export interface ModelGroup {
    id: string;
    label: string;
    models: ModelInfo[];
}

// Fallback used before the API responds (or if it fails), so dropdowns are never empty.
// Grouped by provider so the choice between Ollama and Groq is explicit.
const FALLBACK_GROUPS: ModelGroup[] = [
    { id: 'ollama', label: 'Ollama — local (free)', models: [
        { value: 'LLAMA_3_2_1B', label: 'Llama 3.2 1B (local, light)', provider: 'ollama', free: true, available: true },
        { value: 'LLAMA_3_1', label: 'Llama 3.1 8B (local)', provider: 'ollama', free: true, available: true }
    ] },
    { id: 'groq', label: 'Groq — cloud (free)', models: [
        { value: 'GROQ_LLAMA_3_3_70B', label: 'Llama 3.3 70B (Groq cloud)', provider: 'groq', free: true, available: false },
        { value: 'GROQ_LLAMA_3_1_8B', label: 'Llama 3.1 8B (Groq cloud)', provider: 'groq', free: true, available: false }
    ] },
    { id: 'anthropic', label: 'Claude — Anthropic (API key)', models: [
        { value: 'CLAUDE_OPUS_4_8', label: 'Claude Opus 4.8', provider: 'anthropic', free: false, available: false },
        { value: 'CLAUDE_SONNET_4_6', label: 'Claude Sonnet 4.6', provider: 'anthropic', free: false, available: false },
        { value: 'CLAUDE_HAIKU_4_5', label: 'Claude Haiku 4.5', provider: 'anthropic', free: false, available: false }
    ] },
    { id: 'openai', label: 'GPT — Azure OpenAI (API key)', models: [
        { value: 'GPT_4', label: 'GPT-4', provider: 'openai', free: false, available: false },
        { value: 'GPT_3_5_TURBO', label: 'GPT-3.5 Turbo', provider: 'openai', free: false, available: false }
    ] }
];

export const useModels = () => {
    const [groups, setGroups] = useState<ModelGroup[]>(FALLBACK_GROUPS);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const data = await fetchModels();
            if (data?.groups) setGroups(data.groups);
        } catch {
            // keep fallback groups
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { groups, loading, reload: load };
};
