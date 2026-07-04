// src/utils/prompt.utils.ts
import { CardModel } from '../models/card.models';
import { enhancePrompt } from '../services/promptEnhancement.services';

/**
 * Generates a prompt for a generative AI task based on the provided card details.
 * 
 * @param cardId - The ID of the card containing details of the task.
 * @returns The generated prompt string.
 */
export async function generatePrompt(cardId: string): Promise<string> {
  const card = await CardModel.findById(cardId).exec();

  if (!card) {
    throw new Error('Card not found');
  }

  const { prompt, context, exampleOutput } = await card.getFormattedDetails();

  const instructions = `
        ## Task
        **Objective:** ${card.objective}

        ## Important
        - Follow closely the instructions of the prompt. Do not praise this prompt, provide only the requested information.
        - Avoid repeating the question or rephrasing the prompt. Directly address the task requirements.

        ## Instructions
        - Provide a detailed and comprehensive response based on the task. Do not include any detail on the task itself.
        - Ensure the response is relevant to the task and follows the given instructions closely.
        - The response should be complete and formatted correctly for display on the frontend.
        - Avoid repeating unnecessary information and focus on the key points.
        - Ensure clarity in the answer.
        - Consider that the output may be used as the next card input and included in subsequent prompts.
        - Use bullet points, headings, and clear syntax to structure the response.
    `;

  const mainPromptSection = `
        ## Main Prompt
        ${prompt}
    `;

  const contextSection = `
        ## Context
        ${context}
    `;

  const exampleOutputSection = exampleOutput ? `
        ## Respond using this format and structure, nothing less, nothing more. Do not include any other additional information or explanation of the output.
        ## Example Outputs
        ${exampleOutput}
    ` : '';

  const attachmentsSection = (card.attachments && card.attachments.length)
    ? `\n        ## Source Documents (ground your answer strictly on this data)\n${card.attachments.map((a: any) => `        === ${a.name} ===\n        ${a.text}`).join('\n\n')}\n`
    : '';

  const fmt = card.outputFormat || 'markdown';
  const formatSection =
    fmt === 'json' ? `\n        ## Output format\n        Respond with ONLY a single valid JSON value (object or array). No prose, no explanation, no markdown code fences.\n`
      : fmt === 'csv' ? `\n        ## Output format\n        Respond with ONLY CSV: a header row followed by data rows, comma-separated. No prose, no code fences.\n`
        : fmt === 'text' ? `\n        ## Output format\n        Respond with plain text only. No markdown.\n`
          : '';

  const structuredPrompt = `
        ${instructions}

        ${mainPromptSection}

        ${contextSection}

        ${attachmentsSection}

        ${exampleOutputSection}

        ${formatSection}

        ## Note
        Ensure the answer is exhaustive and clear even without reading the context above. Use Markdown format for better readability.
        Do not include any explanation of the output or introduction of the answer.
    `;
  console.log(structuredPrompt);
  return structuredPrompt.trim();
}

/**
 * Generates a prompt for a generative AI task based on the provided card details.
 * 
 * @param cardId - The ID of the card containing details of the task.
 * @returns The generated prompt string.
 */
export async function generateEnhancedPrompt(cardId: string): Promise<string> {
  // Fetch the card details
  const card = await CardModel.findById(cardId).exec();

  if (!card) {
    throw new Error('Card not found');
  }

  const { prompt, context } = await card.getFormattedDetails();

  // Construct the base prompt
  const basePrompt = `
        ## Task
        **Objective:** ${card.objective}

        ## Main Prompt
        ${prompt}

        ## Context
        ${context}

        ## Instructions
        - Provide a detailed and comprehensive response based on the task.
        - Ensure the response is relevant to the task and follows the given instructions closely.
        - The response should be complete and formatted correctly for display on the frontend.
        - Avoid repeating unnecessary information and focus on the key points.
        - Ensure clarity in the answer.
        - Consider that the output may be used as the next card input and included in subsequent prompts.
        - Use bullet points, headings, and clear syntax to structure the response.
        - Stick strictly to the request. Do not add any unnecessary or additional information. For example, if asked for a number between 2 and 30, simply provide a number like 5.

        ## Note
        Ensure the answer is exhaustive and clear even without reading the context above. Provide any relevant citations if needed. Use Markdown format for better readability.
    `;

  // Enhance the base prompt
  const systemMessage = `
        You are an advanced AI assistant specialized in enhancing user prompts. Your task is to make these prompts more detailed, comprehensive, and engaging by following best practices in prompt engineering.

        **Important**: Do not tell the user that they have made a good example. Instead, follow the instructions given and enhance the prompt accordingly.

        **Instructions**:
        1. **Clarity**: Ensure the enhanced prompt is clear and easy to understand.
        2. **Detail**: Add relevant details to make the prompt more informative.
        3. **Engagement**: Use engaging language to capture attention and encourage interaction.
        4. **Structure**: Organize the prompt logically with proper headings, bullet points, and numbering where appropriate.
        5. **Context**: Include necessary context to make the prompt self-contained and meaningful.
        6. **Relevance**: Maintain the original intent of the prompt while enhancing it.
        7. **Consistency**: Keep a consistent tone and style throughout.
        8. **Examples**: Provide examples or scenarios if they help clarify the prompt.
        9. **Brevity**: Be concise but thorough, avoiding unnecessary content.
        10. **Adherence**: Stick strictly to the request. Do not add any unnecessary or additional information.

        Enhance the following prompt while adhering to these guidelines.
    `;

  const enhancedPrompt = await enhancePrompt(`${systemMessage}\n\n${basePrompt}`);

  return enhancedPrompt.trim();
}


/**
 * Generates a sequence of interconnected cards based on the provided task details.
 * 
 * @param name - The title of the task.
 * @param objective - The objective of the task.
 * @param generativeModel - The generative model to be used.
 * @returns The generated prompt string for creating interconnected cards.
 */
export async function generateCardSequencePrompt(name: string, objective: string, generativeModel: string, grounding?: string): Promise<string> {
  const cardSequencePrompt = `
**Instructions for Card Generation**:

You are an advanced AI designed to generate a GRAPH of interconnected cards (a DAG), not a plain linear list. Each card contributes towards the overall task defined by the given title and objective. Follow the guidelines below.

### Guidelines:

1. **Number of Cards**:
    - Generate an appropriate number of cards to comprehensively cover the task. Aim for at least 5 cards.

2. **Card Structure**:
    Each card should include the following attributes:
    - **Title**: A concise, descriptive title.
    - **Objective**: The specific goal of the card.
    - **Prompt**: The main prompt that the card will address.
    - **Context**: Additional context that helps in understanding the task.
    - **Example Output**: An example output illustrating the expected result (if applicable).
    - **Dependencies**: The list of prerequisite card titles that must complete before this card.
    - **alternativeGroup**: (optional) a short group id shared by cards that are MUTUALLY-EXCLUSIVE alternative approaches to the same sub-goal.

3. **Branching (make it non-linear)**:
    - Do NOT produce a purely linear chain. The graph MUST contain at least:
      - one **branch point**: a card that is a dependency of two or more independent cards (fan-out), and
      - one **convergence**: a card that has two or more dependencies (fan-in).
    - Independent sub-tasks that don't depend on each other should run in PARALLEL branches (they share a predecessor but not each other).

4. **Alternatives (non-determinism)**:
    - When a sub-goal can be tackled with genuinely different approaches, emit 2–3 cards that share the SAME "alternativeGroup" id and the SAME dependencies. They are mutually-exclusive options the user will choose between.
    - Cards in the same alternativeGroup must have distinct objectives/prompts representing the different approaches.

5. **Logical Flow**:
    - Use "dependencies" (by card title) to define the graph relationships precisely.
    - Prefer a real graph shape (branches + convergence, and an alternativeGroup where meaningful) over a straight line.

Here is a COMPACT example of the expected JSON output (keep every card concise — short prompt/context/exampleOutput):

**Name**: _Plan a Product Launch Campaign_
**Objective**: _Produce a launch plan covering audience, messaging, channels and creative._

\`\`\`json
{
  "cards": [
    { "title": "Audience Research", "objective": "Identify the target audience and their needs.", "prompt": "Research and describe the target audience, segments and key pain points.", "context": "Foundation for the whole campaign.", "exampleOutput": "Primary segment: ...", "dependencies": [] },
    { "title": "Messaging Strategy", "objective": "Define the core message and value proposition.", "prompt": "Define the positioning and 3 key messages based on the audience.", "context": "Uses the audience research.", "exampleOutput": "Positioning: ...", "dependencies": ["Audience Research"] },
    { "title": "Channel Plan", "objective": "Choose the distribution channels.", "prompt": "Select and justify the marketing channels for the launch.", "context": "Runs in parallel with the creative work.", "exampleOutput": "Channels: ...", "dependencies": ["Audience Research"] },
    { "title": "Creative — Bold & Playful", "objective": "Bold, playful creative direction.", "prompt": "Draft creative concepts in a bold, playful tone.", "context": "Alternative creative approach A.", "exampleOutput": "Concept: ...", "dependencies": ["Messaging Strategy"], "alternativeGroup": "creative-direction" },
    { "title": "Creative — Formal & Trustworthy", "objective": "Formal, trust-building creative direction.", "prompt": "Draft creative concepts in a formal, trustworthy tone.", "context": "Alternative creative approach B.", "exampleOutput": "Concept: ...", "dependencies": ["Messaging Strategy"], "alternativeGroup": "creative-direction" },
    { "title": "Final Launch Plan", "objective": "Assemble the complete launch plan.", "prompt": "Combine messaging, channels and the chosen creative into a launch plan.", "context": "Convergence point of the graph.", "exampleOutput": "Launch plan: ...", "dependencies": ["Channel Plan", "Messaging Strategy"] }
  ]
}
\`\`\`

Note how "Audience Research" branches into two parallel cards, the two "Creative — ..." cards share the alternativeGroup "creative-direction" (mutually-exclusive options), and "Final Launch Plan" converges multiple dependencies.

Generate the cards based on the given title and objective (produce a real graph with branches, a convergence, and an alternativeGroup when approaches differ):

**Name**: _${name}_
**Objective**: _${objective}_
**Generative Model**: _${generativeModel}_
${grounding ? `\n**Grounding & guidance (base the cards on this — reflect the audience, background, and constraints, and especially any provided source data/documents; prefer facts from the source over invented ones):**\n${grounding}\n` : ''}
    `;
  return cardSequencePrompt.trim();
}
