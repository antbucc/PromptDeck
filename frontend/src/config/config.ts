// src/config/config.ts

// Per-card output format options.
export const OUTPUT_FORMATS = [
    { value: 'markdown', label: 'Markdown (rich text)' },
    { value: 'text', label: 'Plain text' },
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV (table)' },
    { value: 'image', label: 'Image (AI-generated)' },
];

export const GENERATIVE_MODELS = [
    { value: 'GPT_3_5_TURBO', label: 'GPT-3.5 Turbo' },
    { value: 'GPT_4', label: 'GPT-4' },
    { value: 'CLAUDE_OPUS_4_8', label: 'Claude Opus 4.8' },
    { value: 'CLAUDE_SONNET_4_6', label: 'Claude Sonnet 4.6' },
    { value: 'CLAUDE_HAIKU_4_5', label: 'Claude Haiku 4.5' },
    { value: 'LLAMA_3_1', label: 'Llama 3.1 (local, free)' },
];
export const MUSIC_INSTRUMENTS = [
    "AcousticGrandPiano",
    "ElectricGrandPiano",
    "ElectricPiano1",
    "AcousticGuitarNylon",
    "ElectricGuitarClean",
    "OverdrivenGuitar",
    "AcousticBass",
    "ElectricBassFinger",
    "Violin",
    "Cello",
    "OrchestralHarp",
    "StringEnsemble1",
    "SynthStrings1",
    "ChoirAahs",
    "Trumpet",
    "Trombone",
    "FrenchHorn",
    "AltoSax",
    "TenorSax",
    "Flute",
    "PanFlute",
    "Lead1Square",
    "Lead2Sawtooth",
    "TinkleBell",
    "SteelDrums",
];
