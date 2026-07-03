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

  const structuredPrompt = `
        ${instructions}

        ${mainPromptSection}

        ${contextSection}

        ${exampleOutputSection}

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
export async function generateCardSequencePrompt(name: string, objective: string, generativeModel: string): Promise<string> {
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

Generate the cards based on the following task:

**Name**: _Research and Summarize the Impact of the Renaissance on Modern Science_
**Objective**: _To explore and summarize how the Renaissance period influenced the development of modern scientific thought and practices._
**Generative Model**: _GPT_3_5_TURBO_

\`\`\`json
{
  "cards": [
    {
      "title": "Overview of the Renaissance",
      "objective": "Introduce the Renaissance period and its general significance.",
      "prompt": "Provide an overview of the Renaissance period, highlighting its major cultural, artistic, and intellectual achievements.",
      "context": "The Renaissance was a period of great cultural and intellectual activity that spanned from the 14th to the 17th century.",
      "exampleOutput": "The Renaissance was characterized by a renewed interest in classical antiquity, leading to significant advancements in art, literature, and science.",
      "dependencies": []
    },
    {
      "title": "Key Figures of the Renaissance",
      "objective": "Identify and describe the contributions of key figures in the Renaissance.",
      "prompt": "List and describe the contributions of at least five key figures of the Renaissance in the fields of science and philosophy.",
      "context": "Important figures such as Leonardo da Vinci, Galileo Galilei, and Nicolaus Copernicus made groundbreaking contributions during the Renaissance.",
      "exampleOutput": "Leonardo da Vinci was known for his diverse talents and contributions to art and science, including anatomical studies and inventions.",
      "dependencies": ["Overview of the Renaissance"]
    },
    {
      "title": "Scientific Discoveries of the Renaissance",
      "objective": "Summarize significant scientific discoveries made during the Renaissance.",
      "prompt": "Summarize the most significant scientific discoveries and advancements made during the Renaissance period.",
      "context": "The Renaissance period saw many scientific discoveries that laid the groundwork for modern science, including the heliocentric model of the solar system.",
      "exampleOutput": "Nicolaus Copernicus proposed the heliocentric model, challenging the geocentric view and revolutionizing astronomy.",
      "dependencies": ["Overview of the Renaissance"]
    },
    {
      "title": "The Impact of Renaissance Art on Science",
      "objective": "Explain how advancements in Renaissance art influenced scientific progress.",
      "prompt": "Explain how advancements in Renaissance art, such as perspective and anatomy, influenced scientific progress.",
      "context": "Renaissance artists developed techniques like linear perspective and detailed anatomical studies, which enhanced scientific understanding.",
      "exampleOutput": "The use of linear perspective in art allowed for more accurate depictions of the natural world, aiding scientific illustrations and studies.",
      "dependencies": ["Overview of the Renaissance", "Key Figures of the Renaissance"]
    },
    {
      "title": "Legacy of the Renaissance in Modern Science",
      "objective": "Discuss the long-term impact of the Renaissance on modern scientific thought.",
      "prompt": "Discuss the long-term impact of the Renaissance on modern scientific thought and practices.",
      "context": "The Renaissance laid the foundation for the Scientific Revolution and the Enlightenment, influencing modern scientific methods and philosophies.",
      "exampleOutput": "The emphasis on observation and experimentation during the Renaissance led to the development of the scientific method, which is central to modern science.",
      "dependencies": ["Scientific Discoveries of the Renaissance", "The Impact of Renaissance Art on Science"]
    }
  ]
}
\`\`\`

**Name**: _Research and Summarize the Impact of the Enlightenment on Modern Science_  
**Objective**: _To explore and summarize how the Enlightenment period influenced the development of modern scientific thought and practices._  
**Generative Model**: _GPT_3_5_TURBO_


\`\`\`json
{
  "cards": [
    {
      "title": "Overview of the Enlightenment",
      "objective": "Introduce the Enlightenment period and its general significance.",
      "prompt": "Provide an overview of the Enlightenment period, highlighting its major cultural, intellectual, and philosophical achievements.",
      "context": "The Enlightenment was an intellectual and philosophical movement that dominated the world of ideas in Europe during the 17th and 18th centuries.",
      "exampleOutput": "The Enlightenment was characterized by an emphasis on reason, science, and individualism, leading to significant advancements in philosophy, political theory, and science.",
      "dependencies": []
    },
    {
      "title": "Key Figures of the Enlightenment",
      "objective": "Identify and describe the contributions of key figures in the Enlightenment.",
      "prompt": "List and describe the contributions of at least five key figures of the Enlightenment in the fields of science and philosophy.",
      "context": "Important figures such as Isaac Newton, John Locke, and Voltaire made groundbreaking contributions during the Enlightenment.",
      "exampleOutput": "Isaac Newton was known for his laws of motion and universal gravitation, which laid the foundation for classical mechanics.",
      "dependencies": ["Overview of the Enlightenment"]
    },
    {
      "title": "Scientific Discoveries of the Enlightenment",
      "objective": "Summarize significant scientific discoveries made during the Enlightenment.",
      "prompt": "Summarize the most significant scientific discoveries and advancements made during the Enlightenment period.",
      "context": "The Enlightenment period saw many scientific discoveries that laid the groundwork for modern science, including advancements in physics, astronomy, and biology.",
      "exampleOutput": "Isaac Newton's Principia Mathematica formulated the laws of motion and universal gravitation, revolutionizing physics.",
      "dependencies": ["Overview of the Enlightenment"]
    },
    {
      "title": "The Impact of Enlightenment Philosophy on Science",
      "objective": "Explain how advancements in Enlightenment philosophy influenced scientific progress.",
      "prompt": "Explain how advancements in Enlightenment philosophy, such as empiricism and rationalism, influenced scientific progress.",
      "context": "Enlightenment philosophers developed ideas like empiricism and rationalism, which promoted scientific inquiry and skepticism of traditional authorities.",
      "exampleOutput": "The empirical approach advocated by John Locke emphasized observation and experimentation, which became fundamental to the scientific method.",
      "dependencies": ["Overview of the Enlightenment", "Key Figures of the Enlightenment"]
    },
    {
      "title": "Legacy of the Enlightenment in Modern Science",
      "objective": "Discuss the long-term impact of the Enlightenment on modern scientific thought.",
      "prompt": "Discuss the long-term impact of the Enlightenment on modern scientific thought and practices.",
      "context": "The Enlightenment laid the foundation for the Scientific Revolution and modern scientific thought, influencing contemporary scientific methods and philosophies.",
      "exampleOutput": "The Enlightenment's emphasis on reason and scientific inquiry led to the development of the scientific method, which is central to modern science.",
      "dependencies": ["Scientific Discoveries of the Enlightenment", "The Impact of Enlightenment Philosophy on Science"]
    }
  ]
}
\`\`\`

**Name**: _Python Code Generation_
**Objective**: _Generate and integrate various code components to build a coherent and functional project that performs basic arithmetic operations_
**Generative Model**: _GPT_3_5_TURBO_

\`\`\`json
{
  "cards": [
    {
      "title": "Main Template",
      "objective": "Create the main template for the project.",
      "prompt": "Generate the main template for the project, including the basic structure and necessary imports.",
      "context": "This is the starting point for the project, setting up the basic structure and imports.",
      "exampleOutput": "\`\`\`python\n# src/main.py\nif __name__ == '__main__':\n    pass\n\`\`\`",
  "dependencies": []
},
{
  "title": "Function to Calculate Sum",
    "objective": "Add a function to calculate the sum of two numbers.",
      "prompt": "Write a function to calculate the sum of two numbers and add it to main.py.",
        "context": "This function will be part of the main.py file and will calculate the sum of two numbers.",
          "exampleOutput": "\`\`\`python\n# src/main.py\ndef calculate_sum(a, b):\n    return a + b\n\`\`\`",
  "dependencies": ["Main Template"]
},
{
  "title": "Function to Calculate Difference",
    "objective": "Add a function to calculate the difference between two numbers.",
      "prompt": "Write a function to calculate the difference between two numbers and add it to main.py.",
        "context": "This function will be part of the main.py file and will calculate the difference between two numbers.",
          "exampleOutput": "\`\`\`python\n# src/main.py\ndef calculate_difference(a, b):\n    return a - b\n\`\`\`",
            "dependencies": ["Main Template"]
},
{
  "title": "Call Functions in Main",
    "objective": "Call the previously created functions in the main template.",
      "prompt": "Modify the main template to call the calculate_sum and calculate_difference functions.",
        "context": "This step integrates the functions into the main template, demonstrating their use.",
          "exampleOutput": "\`\`\`python\n# src/main.py\ndef calculate_sum(a, b):\n    return a + b\n\ndef calculate_difference(a, b):\n    return a - b\n\nif __name__ == '__main__':\n    sum_result = calculate_sum(5, 3)\n    diff_result = calculate_difference(5, 3)\n    print(f'Sum: {sum_result}, Difference: {diff_result}')\n\`\`\`",
            "dependencies": ["Function to Calculate Sum", "Function to Calculate Difference"]
},
{
  "title": "Helper Function in Utility Module",
    "objective": "Create a helper function in a utility module.",
      "prompt": "Write a helper function to format results and add it to a new module, utility.py.",
        "context": "This helper function will format the results and be used in the main template.",
          "exampleOutput": "\`\`\`python\n# src/utility.py\ndef format_result(result):\n    return f'Result: {result}'\n\`\`\`",
            "dependencies": []
},
{
  "title": "Using Helper Function in Main",
    "objective": "Use the helper function in the main template.",
      "prompt": "Modify the main template to use the helper function from the utility module.",
        "context": "This step integrates the helper function into the main template for better output formatting.",
          "exampleOutput": "\`\`\`python\n# src/main.py\nfrom utility import format_result\n\ndef calculate_sum(a, b):\n    return a + b\n\ndef calculate_difference(a, b):\n    return a - b\n\nif __name__ == '__main__':\n    sum_result = calculate_sum(5, 3)\n    diff_result = calculate_difference(5, 3)\n    formatted_sum = format_result(sum_result)\n    formatted_diff = format_result(diff_result)\n    print(formatted_sum)\n    print(formatted_diff)\n\`\`\`",
            "dependencies": ["Call Functions in Main", "Helper Function in Utility Module"]
},
{
  "title": "Check for Consistency",
    "objective": "Ensure consistency across all modules and functions.",
      "prompt": "Check the project to ensure that all modules and functions are consistent in their usage and naming conventions.",
        "context": "Consistency across modules and functions is essential for maintainability and readability.",
          "exampleOutput": "\`\`\`python\n# src/main.py\nfrom utility import format_result\n\ndef calculate_sum(a, b):\n    return a + b\n\ndef calculate_difference(a, b):\n    return a - b\n\nif __name__ == '__main__':\n    sum_result = calculate_sum(5, 3)\n    diff_result = calculate_difference(5, 3)\n    formatted_sum = format_result(sum_result)\n    formatted_diff = format_result(diff_result)\n    print(formatted_sum)\n    print(formatted_diff)\n\n# src/utility.py\ndef format_result(result):\n    return f'Result: {result}'\n\`\`\`",
            "dependencies": ["Using Helper Function in Main"]
},
{
  "title": "Check for Errors",
    "objective": "Ensure that the code is free of syntax and runtime errors.",
      "prompt": "Run tests and checks to ensure that the code is free of syntax and runtime errors.",
        "context": "Testing and error checking are crucial steps to ensure the code runs smoothly without issues.",
          "exampleOutput": "\`\`\`python\n# src/main.py\nfrom utility import format_result\n\ndef calculate_sum(a, b):\n    return a + b\n\ndef calculate_difference(a, b):\n    return a - b\n\nif __name__ == '__main__':\n    sum_result = calculate_sum(5, 3)\n    diff_result = calculate_difference(5, 3)\n    formatted_sum = format_result(sum_result)\n    formatted_diff = format_result(diff_result)\n    print(formatted_sum)\n    print(formatted_diff)\n\n# src/utility.py\ndef format_result(result):\n    return f'Result: {result}'\n\`\`\`",
            "dependencies": ["Check for Consistency"]
},
{
  "title": "Ensure Correct Formatting",
    "objective": "Format the code according to standard coding conventions.",
      "prompt": "Ensure that the code is formatted correctly according to PEP 8 standards or the relevant coding style guide.",
        "context": "Proper code formatting improves readability and maintainability.",
          "exampleOutput": "\`\`\`python\n# src/main.py\nfrom utility import format_result\n\ndef calculate_sum(a, b):\n    return a + b\n\ndef calculate_difference(a, b):\n    return a - b\n\nif __name__ == '__main__':\n    sum_result = calculate_sum(5, 3)\n    diff_result = calculate_difference(5, 3)\n    formatted_sum = format_result(sum_result)\n    formatted_diff = format_result(diff_result)\n    print(formatted_sum)\n    print(formatted_diff)\n\n# src/utility.py\ndef format_result(result):\n    return f'Result: {result}'\n\`\`\`",
            "dependencies": ["Check for Errors"]
}
  ]
}
\`\`\`

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

    `;
  return cardSequencePrompt.trim();
}
