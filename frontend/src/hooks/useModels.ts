// src/hooks/useModels.ts
import { useEffect, useState, useCallback } from 'react';
import { fetchModels } from '../services/api';

export interface ModelInfo {
    value: string;
    label: string;
    provider: 'ollama' | 'anthropic' | 'openai';
    free: boolean;
    available: boolean;
}

export interface ModelGroup {
    id: string;
    label: string;
    models: ModelInfo[];
}

// Fallback used before the API responds (or if it fails), so dropdowns are never empty.
const FALLBACK_GROUPS: ModelGroup[] = [
    { id: 'free', label: 'Free (no API key)', models: [
        { value: 'LLAMA_3_1', label: 'Llama 3.1 (local)', provider: 'ollama', free: true, available: true }
    ] },
    { id: 'paid', label: 'Requires API key', models: [
        { value: 'CLAUDE_OPUS_4_8', label: 'Claude Opus 4.8', provider: 'anthropic', free: false, available: false },
        { value: 'CLAUDE_SONNET_4_6', label: 'Claude Sonnet 4.6', provider: 'anthropic', free: false, available: false },
        { value: 'CLAUDE_HAIKU_4_5', label: 'Claude Haiku 4.5', provider: 'anthropic', free: false, available: false },
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
