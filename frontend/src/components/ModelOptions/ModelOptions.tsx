// src/components/ModelOptions/ModelOptions.tsx
import React from 'react';
import { ModelGroup } from '../../hooks/useModels';

interface ModelOptionsProps {
    groups: ModelGroup[];
}

/**
 * Renders grouped <optgroup> options (Free / Requires API key) for any <select>.
 * Models whose provider key isn't configured are disabled with a hint, so the
 * user can clearly see which models are usable.
 */
const ModelOptions: React.FC<ModelOptionsProps> = ({ groups }) => {
    return (
        <>
            {groups.map((group) => (
                <optgroup key={group.id} label={group.label}>
                    {group.models.map((m) => (
                        <option key={m.value} value={m.value} disabled={!m.available}>
                            {m.label}
                            {m.free ? ' — free' : ''}
                            {!m.available && !m.free ? ' (needs API key)' : ''}
                            {!m.available && m.free ? ' (start Ollama)' : ''}
                        </option>
                    ))}
                </optgroup>
            ))}
        </>
    );
};

export default ModelOptions;
