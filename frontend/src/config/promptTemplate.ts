// src/config/promptTemplate.ts

// A lightweight, semi-structured language to help users write effective prompts.
// Each section is a "# TAG" header followed by the user's content. Models read
// these tags as clear, labelled instructions which improves output quality.
export const STRUCTURED_PROMPT_TEMPLATE = `# ROLE
Act as <role / area of expertise>.

# GOAL
<the single, clear outcome you want>

# CONTEXT
<background, target audience, and any inputs to use>

# INSTRUCTIONS
- <step or rule 1>
- <step or rule 2>

# CONSTRAINTS
- <length, tone, and what to avoid>

# OUTPUT FORMAT
<e.g. Markdown with headings, a table, or JSON>

# EXAMPLES (optional)
<short input -> expected output>`;

// Metadata used to render the inline legend explaining each section.
export const PROMPT_SECTIONS: { tag: string; hint: string; placeholder: string }[] = [
  { tag: 'ROLE', hint: 'Who the AI should act as (persona / expertise).', placeholder: 'e.g. a senior travel writer' },
  { tag: 'GOAL', hint: 'The single, clear outcome you want.', placeholder: 'e.g. a 3-day Rome itinerary' },
  { tag: 'CONTEXT', hint: 'Background, audience, and inputs to use.', placeholder: 'audience, inputs, constraints…' },
  { tag: 'INSTRUCTIONS', hint: 'Concrete steps or rules to follow.', placeholder: 'one rule per line' },
  { tag: 'CONSTRAINTS', hint: 'Length, tone, format limits, what to avoid.', placeholder: 'e.g. max 300 words, friendly tone' },
  { tag: 'OUTPUT FORMAT', hint: 'Exact shape of the answer (Markdown, table, JSON…).', placeholder: 'e.g. Markdown with headings' },
  { tag: 'EXAMPLES', hint: 'Optional input→output examples to guide style.', placeholder: 'optional' },
];

// A semi-structured template for the CONTEXT field. Good context (especially
// SOURCE DATA) improves grounded, on-topic answers.
export const STRUCTURED_CONTEXT_TEMPLATE = `# BACKGROUND
<domain background the AI should know>

# AUDIENCE
<who the output is for, and their level>

# SOURCE DATA
<facts, data, or references the answer must be based on>

# PRIOR RESULTS
<relevant outputs from previous cards to build on>

# DEFINITIONS
<key terms and what they mean here>

# ASSUMPTIONS
<assumptions to make when information is missing>`;

export const CONTEXT_SECTIONS: { tag: string; hint: string; placeholder: string }[] = [
  { tag: 'BACKGROUND', hint: 'Domain background the AI should know.', placeholder: 'e.g. this is for an internal tooling team' },
  { tag: 'AUDIENCE', hint: 'Who the output is for, and their level.', placeholder: 'e.g. non-technical stakeholders' },
  { tag: 'SOURCE DATA', hint: 'Facts/data the answer must be grounded on.', placeholder: 'paste the inputs or references' },
  { tag: 'PRIOR RESULTS', hint: 'Relevant outputs from previous cards.', placeholder: 'e.g. use the summary from card 1' },
  { tag: 'DEFINITIONS', hint: 'Key terms and what they mean here.', placeholder: 'term — meaning' },
  { tag: 'ASSUMPTIONS', hint: 'Assumptions to make when info is missing.', placeholder: 'e.g. assume EU regulations' },
];

type Section = { tag: string };

// Compose a structured string from per-section field values, skipping empties.
export const composeStructured = (fields: Record<string, string>, sections: Section[]): string =>
  sections
    .map((s) => ({ tag: s.tag, val: (fields[s.tag] || '').trim() }))
    .filter((x) => x.val)
    .map((x) => `# ${x.tag}\n${x.val}`)
    .join('\n\n');

// Parse an existing structured string back into per-section field values, so the
// guided builder can pre-fill from whatever is already in the field.
export const parseStructured = (text: string, sections: Section[]): Record<string, string> => {
  const fields: Record<string, string> = {};
  if (!text) return fields;
  const tags = sections.map((s) => s.tag);
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => { if (current) fields[current] = buf.join('\n').trim(); buf = []; };
  for (const line of text.split('\n')) {
    const m = line.match(/^#\s*(.+?)\s*$/);
    if (m) {
      const raw = m[1].replace(/\(optional\)/i, '').trim().toUpperCase();
      const tag = tags.find((t) => t === raw);
      if (tag) { flush(); current = tag; continue; }
    }
    if (current) buf.push(line);
  }
  flush();
  return fields;
};
