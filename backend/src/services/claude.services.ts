// ./src/services/claude.services.ts

import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicClient } from '../config/anthropic.client';
import { EvaluationInput, EvaluationOutput } from '../utils/evaluation.utils';

const GENERATION_SYSTEM_PROMPT =
    `You are an AI assistant that helps users complete tasks based on provided instructions and context. ` +
    `Provide clear, concise, and comprehensive responses. Ensure the answers are formatted correctly for ` +
    `display on the frontend and avoid unnecessary repetition. If uncertain, indicate that more information is needed.`;

const EVALUATION_SYSTEM_PROMPT =
    `You are an impartial evaluator of AI-generated answers. Score the answer on each metric using an ` +
    `integer from 1 (worst) to 5 (best):\n` +
    `- relevance_score: how pertinent the answer is to the question.\n` +
    `- groundedness_score: how well the answer is supported by the provided context.\n` +
    `- coherence_score: the logical and consistent flow of the answer.\n` +
    `- fluency_score: grammatical accuracy and appropriate vocabulary.\n` +
    `Be strict and objective. Respond only with the requested structured scores.`;

// JSON schema for structured-output evaluation. `enum` constrains each score to
// the 1-5 scale (numeric min/max constraints are not supported by structured outputs).
const EVALUATION_SCHEMA = {
    type: 'object',
    properties: {
        relevance_score: { type: 'integer', enum: [1, 2, 3, 4, 5] },
        groundedness_score: { type: 'integer', enum: [1, 2, 3, 4, 5] },
        coherence_score: { type: 'integer', enum: [1, 2, 3, 4, 5] },
        fluency_score: { type: 'integer', enum: [1, 2, 3, 4, 5] }
    },
    required: ['relevance_score', 'groundedness_score', 'coherence_score', 'fluency_score'],
    additionalProperties: false
} as const;

const extractText = (message: Anthropic.Message): string =>
    message.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim();

/**
 * Generic chat completion against a Claude model with a custom system prompt.
 */
export const claudeChat = async (modelName: string, system: string, user: string): Promise<string> => {
    const client = await getAnthropicClient();
    const response = await client.messages.create({
        model: modelName,
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: user }]
    });
    return extractText(response);
};

/**
 * Generate a card's output using a Claude model.
 */
export const generateWithClaude = async (modelName: string, prompt: string): Promise<string> => {
    const client = await getAnthropicClient();

    try {
        const response = await client.messages.create({
            model: modelName,
            max_tokens: 4096,
            system: GENERATION_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }]
        });

        return extractText(response);
    } catch (error: any) {
        console.error('Error generating completion with Claude:', error.message);
        throw error;
    }
};

/**
 * Evaluate a card's output with Claude acting as an LLM judge, returning the
 * same four 1-5 metric scores produced by the Azure/PromptFlow evaluator.
 */
export const evaluateWithClaude = async (
    input: EvaluationInput,
    modelName: string
): Promise<EvaluationOutput> => {
    const client = await getAnthropicClient();

    const userContent =
        `Question:\n${input.question}\n\n` +
        `Context:\n${input.context}\n\n` +
        `Answer:\n${input.answer}\n\n` +
        `Score the answer on relevance, groundedness, coherence, and fluency.`;

    try {
        const response = await client.messages.create({
            model: modelName,
            max_tokens: 4096,
            thinking: { type: 'adaptive' },
            system: EVALUATION_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userContent }],
            output_config: {
                format: { type: 'json_schema', schema: EVALUATION_SCHEMA }
            }
        });

        const text = extractText(response);
        const parsed = JSON.parse(text);

        return {
            relevance_score: parsed.relevance_score ?? 0,
            groundedness_score: parsed.groundedness_score ?? 0,
            coherence_score: parsed.coherence_score ?? 0,
            fluency_score: parsed.fluency_score ?? 0
        };
    } catch (error: any) {
        console.error('Error evaluating output with Claude:', error.message);
        throw error;
    }
};
