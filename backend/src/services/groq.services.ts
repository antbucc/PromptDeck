// ./src/services/groq.services.ts

import { getGroqClient } from '../config/groq.client';
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
    `Be strict and objective. Respond ONLY with a JSON object of the form ` +
    `{"relevance_score": <1-5>, "groundedness_score": <1-5>, "coherence_score": <1-5>, "fluency_score": <1-5>}.`;

const clamp = (value: unknown): number => {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return 0;
    return Math.min(5, Math.max(1, n));
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const HIGHER_LIMIT_MODEL = 'llama-3.3-70b-versatile';
const isRateOrSizeError = (e: any): boolean =>
    /rate limit|tokens per minute|request too large|too many requests|\b429\b|\b413\b/i.test(String(e?.message || ''));

// Chat completion with one automatic retry on free-tier rate/size limits: waits
// for the per-minute window and, if on a small 8B model, upgrades to a higher-limit one.
const groqCreate = async (params: any) => {
    const client = getGroqClient();
    try {
        return await client.chat.completions.create(params);
    } catch (e) {
        // Daily-token-limit errors won't recover in seconds — fail fast.
        const isDaily = /per day|\btpd\b/i.test(String((e as any)?.message || ''));
        if (isRateOrSizeError(e) && !isDaily) {
            await sleep(5000);
            const model = /(^|[^0-9])8b/i.test(String(params.model)) ? HIGHER_LIMIT_MODEL : params.model;
            return await client.chat.completions.create({ ...params, model });
        }
        throw e;
    }
};

/**
 * Generic chat completion against a Groq-hosted model. `json` enables JSON mode.
 */
export const groqChat = async (
    modelName: string,
    system: string,
    user: string,
    json: boolean = false
): Promise<string> => {
    const response = await groqCreate({
        model: modelName,
        max_tokens: 4096,
        temperature: 0.7,
        ...(json ? { response_format: { type: 'json_object' as const } } : {}),
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user }
        ]
    });
    return response.choices[0]?.message?.content?.trim() || '';
};

/**
 * Generate a card's output using a Groq-hosted model.
 */
export const generateWithGroq = async (modelName: string, prompt: string): Promise<string> => {
    try {
        const response = await groqCreate({
            model: modelName,
            max_tokens: 4096,
            temperature: 0.7,
            messages: [
                { role: 'system', content: GENERATION_SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ]
        });

        return response.choices[0]?.message?.content?.trim() || '';
    } catch (error: any) {
        console.error('Error generating completion with Groq:', error.message);
        throw error;
    }
};

/**
 * Evaluate a card's output with a Groq-hosted model acting as an LLM judge,
 * returning the same four 1-5 metric scores as the other evaluators.
 */
export const evaluateWithGroq = async (
    input: EvaluationInput,
    modelName: string
): Promise<EvaluationOutput> => {
    const userContent =
        `Question:\n${input.question}\n\n` +
        `Context:\n${input.context}\n\n` +
        `Answer:\n${input.answer}\n\n` +
        `Score the answer on relevance, groundedness, coherence, and fluency.`;

    try {
        const response = await groqCreate({
            model: modelName,
            max_tokens: 512,
            temperature: 0,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: EVALUATION_SYSTEM_PROMPT },
                { role: 'user', content: userContent }
            ]
        });

        const parsed = JSON.parse(response.choices[0]?.message?.content || '{}');

        return {
            relevance_score: clamp(parsed.relevance_score),
            groundedness_score: clamp(parsed.groundedness_score),
            coherence_score: clamp(parsed.coherence_score),
            fluency_score: clamp(parsed.fluency_score)
        };
    } catch (error: any) {
        console.error('Error evaluating output with Groq:', error.message);
        throw error;
    }
};
