// src/services/promptEnhancement.services.ts

import { openai } from '../config/openai.client';
import { GenerativeModels } from '../types/GenerativeModels';
import { ollamaChat } from './ollama.services';
import { claudeChat } from './claude.services';
import { GPT_4_MODEL_NAME } from '../utils/secrets';

/**
 * Enhance a given prompt using the chosen generative model (free local Ollama,
 * Claude, or Azure OpenAI). Falls back to Azure OpenAI when no model is given.
 *
 * @param prompt - The input prompt to be enhanced.
 * @param generativeModel - Optional model key (e.g. LLAMA_3_1, CLAUDE_OPUS_4_8).
 * @returns The enhanced prompt.
 */
export const enhancePrompt = async (prompt: string, generativeModel?: string): Promise<string> => {
    if (!prompt) {
        throw new Error("Input prompt cannot be empty");
    }

    const useModel = generativeModel && GenerativeModels.isValidModel(generativeModel)
        ? generativeModel
        : null;
    const provider = useModel ? GenerativeModels.getProvider(useModel) : 'openai';
    const modelName = useModel
        ? GenerativeModels.getModelName(useModel)
        : (process.env.MODEL_NAME || GPT_4_MODEL_NAME);

    try {
        if (provider === 'ollama') {
            return await ollamaChat(modelName, systemPrompt, prompt);
        }
        if (provider === 'anthropic') {
            return await claudeChat(modelName, systemPrompt, prompt);
        }

        const response = await openai.getChatCompletions(
            modelName,
            [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            { maxTokens: 3750, temperature: 0.7 }
        );

        return response.choices[0].message?.content?.trim() || '';
    } catch (error: any) {
        console.error("Error enhancing prompt:", error.message);
        throw error;
    }
};

const systemPrompt = `
You are an advanced AI assistant specialized in enhancing user prompts. Your task is to make these prompts more detailed, comprehensive, and effective by following best practices in prompt engineering.

Rewrite the user's prompt using a clear, semi-structured format with these labelled sections (omit a section only if it is truly irrelevant):

# ROLE — the persona / expertise the AI should adopt
# GOAL — the single, clear outcome
# CONTEXT — background, audience, and inputs to use
# INSTRUCTIONS — concrete steps or rules
# CONSTRAINTS — length, tone, and what to avoid
# OUTPUT FORMAT — the exact shape of the answer

Guidelines:
1. Preserve the original intent — do not invent requirements the user did not imply.
2. Be specific and unambiguous; prefer concrete instructions over vague adjectives.
3. Keep it concise but complete.
4. Return ONLY the rewritten prompt text — no commentary, no explanation, no code fences.
`;
