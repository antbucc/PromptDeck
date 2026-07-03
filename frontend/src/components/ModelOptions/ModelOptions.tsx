// src/components/ModelOptions/ModelOptions.tsx
import React from 'react';
import { ModelGroup } from '../../hooks/useModels';

interface ModelOptionsProps {
    groups: ModelGroup[];
}

// Provider-specific hint shown when a model isn't currently usable.
const unavailableHint = (provider: string): string => {
    switch (provider) {
        case 'ollama': return ' (start Ollama / set OLLAMA_BASE_URL)';
        case 'groq': return ' (set GROQ_API_KEY)';
        case 'anthropic': return ' (needs Anthropic key)';
        case 'openai': return ' (needs Azure config)';
        default: return ' (unavailable)';
    }
};

/**
 * Renders grouped <optgroup> options (one group per provider) for any <select>.
 * Models whose provider isn't configured/reachable are disabled with a hint,
 * so the user can clearly see which models are usable.
 */
const ModelOptions: React.FC<ModelOptionsProps> = ({ groups }) => {
    return (
        <>
            {groups.map((group) => (
                <optgroup key={group.id} label={group.label}>
                    {group.models.map((m) => (
                        <option key={m.value} value={m.value} disabled={!m.available}>
                            {m.label}
                            {m.available ? '' : unavailableHint(m.provider)}
                        </option>
                    ))}
                </optgroup>
            ))}
        </>
    );
};

export default ModelOptions;
