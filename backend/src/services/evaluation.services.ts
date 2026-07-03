// ./src/services/evaluation.services.ts

import { exec } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { CardModel } from '../models/card.models';
import { v4 as uuidv4 } from 'uuid';
import { GenerativeModels } from '../types/GenerativeModels';
import { evaluateWithClaude } from './claude.services';
import { evaluateWithOllama } from './ollama.services';
import { CLAUDE_EVAL_MODEL, OLLAMA_EVAL_MODEL } from '../utils/secrets';

interface EvaluationResult {
    relevance_score: number;
    groundedness_score: number;
    coherence_score: number;
    fluency_score: number;
}

export async function evaluateCardOutput(cardId: string): Promise<EvaluationResult> {
    const card = await CardModel.findById(cardId).exec();

    if (!card) {
        throw new Error('Card not found');
    }

    const { answer, prompt, context } = await card.getFormattedDetails();

    if (!answer) {
        throw new Error('Card has no output to evaluate');
    }

    // Cards backed by a Claude model are evaluated with Claude acting as an
    // LLM judge; OpenAI-backed cards keep using the Azure/PromptFlow evaluator.
    const provider = GenerativeModels.getProvider(card.generativeModel as string);
    if (provider === 'anthropic') {
        return evaluateWithClaude({ answer, context, question: prompt }, CLAUDE_EVAL_MODEL);
    }
    if (provider === 'ollama') {
        return evaluateWithOllama({ answer, context, question: prompt }, OLLAMA_EVAL_MODEL);
    }

    const evaluationInput = {
        answer,
        context,
        question: prompt
    };

    const inputJson = JSON.stringify(evaluationInput);
    const tempFilePath = `/tmp/${uuidv4()}.json`;

    // Write the JSON input to a temporary file
    writeFileSync(tempFilePath, inputJson);

    const command = `python3 src/python/evaluate_metrics.py ${tempFilePath}`;

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            // Clean up the temporary file
            unlinkSync(tempFilePath);

            if (error) {
                console.error(`Execution error: ${error.message}`);
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                reject(`Stderr: ${stderr}`);
                return;
            }
            try {
                console.log(`Raw stdout: ${stdout}`);

                // Replace NaN with null before parsing JSON
                const sanitizedOutput = stdout.replace(/NaN/g, 'null');
                const rawOutput = JSON.parse(sanitizedOutput);

                const relevance_score = rawOutput.relevance_score?.gpt_relevance ?? 0;
                const groundedness_score = rawOutput.groundedness_score?.gpt_groundedness ?? 0;
                const coherence_score = rawOutput.coherence_score?.gpt_coherence ?? 0;
                const fluency_score = rawOutput.fluency_score?.gpt_fluency ?? 0;

                const output: EvaluationResult = {
                    relevance_score,
                    groundedness_score,
                    coherence_score,
                    fluency_score
                };
                resolve(output);
            } catch (e: any) {
                console.error(`Failed to parse output: ${e.message}`);
                reject(`Failed to parse output: ${e.message}`);
            }
        });
    });
}
