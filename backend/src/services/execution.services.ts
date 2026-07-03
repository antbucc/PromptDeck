import { openai } from '../config/openai.client';
import { ICard } from '../models/card.models'; // Import the Mongoose document type
import { generatePrompt } from '../utils/prompt.utils';
import { GenerativeModels } from '../types/GenerativeModels';
import { generateWithClaude } from './claude.services';
import { generateWithOllama } from './ollama.services';
import { generateWithGroq } from './groq.services';

export const executeCard = async (
    card: ICard, // Use the Mongoose document type
): Promise<{ generatedText: string }> => {
    // Image output: generate via the free Pollinations image API (no key, no LLM).
    // The returned value is the image URL, stored as the card's output.
    if (card.outputFormat === 'image') {
        const imgPrompt = [card.objective, card.prompt].filter(Boolean).join('. ').slice(0, 600);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt)}?width=1024&height=1024&nologo=true&seed=${Date.now() % 100000}`;
        return { generatedText: url };
    }

    // Generate the prompt using the utility function
    const prompt = await generatePrompt(card._id);

    if (!prompt) {
        throw new Error("Failed to generate prompt. Cannot generate output.");
    }

    // Validate and get the actual model name
    if (!GenerativeModels.isValidModel(card.generativeModel as string)) {
        throw new Error(`Unsupported generative model: ${card.generativeModel}`);
    }
    const modelName = GenerativeModels.getModelName(card.generativeModel as string);
    const provider = GenerativeModels.getProvider(card.generativeModel as string);

    // Route to the provider that serves the selected model.
    let generatedText: string;
    if (provider === 'anthropic') {
        generatedText = await generateWithClaude(modelName, prompt);
    } else if (provider === 'ollama') {
        generatedText = await generateWithOllama(modelName, prompt);
    } else if (provider === 'groq') {
        generatedText = await generateWithGroq(modelName, prompt);
    } else {
        try {
            const response = await openai.getChatCompletions(
                modelName, // Use the actual model name
                [
                    {
                        role: 'system',
                        content: `You are an AI assistant that helps users complete tasks based on provided instructions and context. Provide clear, concise, and comprehensive responses. Ensure the answers are formatted correctly for display on the frontend and avoid unnecessary repetition. If uncertain, indicate that more information is needed.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                { maxTokens: 3750, temperature: 0.7 } // Options object
            );
            generatedText = response.choices[0].message?.content?.trim() || '';
        } catch (error: any) {
            console.error("Error generating completion:", error.message);
            throw error;
        }
    }

    // For structured formats, strip any markdown code fences the model may add.
    if (card.outputFormat === 'json' || card.outputFormat === 'csv') {
        generatedText = generatedText.replace(/^\s*```[a-zA-Z]*\s*/, '').replace(/\s*```\s*$/, '').trim();
    }

    return { generatedText };
};