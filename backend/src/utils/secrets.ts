// src/utils/secrets.ts
import { cleanEnv, str, port, bool } from 'envalid';

export const env = cleanEnv(process.env, {
    // Only MONGO_URL is truly required; everything else has a safe default so the
    // server always boots. Set GROQ_API_KEY to enable the free cloud LLM.
    CORS_ORIGINS: str({ default: '*' }),
    AZURE_OPENAI_API_KEY: str({ default: 'placeholder' }),
    AZURE_OPENAI_ENDPOINT: str({ default: 'https://placeholder.openai.azure.com' }),
    GPT_3_5_TURBO_MODEL_NAME: str({ default: 'gpt-35-turbo' }),
    GPT_4_MODEL_NAME: str({ default: 'gpt-4' }),
    ANTHROPIC_API_KEY: str({ default: '' }),
    CLAUDE_EVAL_MODEL: str({ default: 'claude-opus-4-8' }),
    OLLAMA_BASE_URL: str({ default: 'http://localhost:11434/v1' }),
    OLLAMA_API_KEY: str({ default: 'ollama' }),
    OLLAMA_EVAL_MODEL: str({ default: 'llama3.1:8b' }),
    GROQ_API_KEY: str({ default: '' }),
    GROQ_BASE_URL: str({ default: 'https://api.groq.com/openai/v1' }),
    GROQ_EVAL_MODEL: str({ default: 'llama-3.1-8b-instant' }),
    // Preselected model key in the UI (e.g. LLAMA_3_1 to default to Ollama). Empty = app default.
    DEFAULT_MODEL: str({ default: '' }),
    EVAL_AZURE_OPENAI_API_KEY: str({ default: 'placeholder' }),
    EVAL_AZURE_OPENAI_ENDPOINT: str({ default: 'https://placeholder.openai.azure.com' }),
    EVAL_AZURE_OPENAI_API_VERSION: str({ default: '2024-02-15-preview' }),
    EVAL_AZURE_OPENAI_DEPLOYMENT: str({ default: 'gpt-4' }),
    MONGO_INITDB_ROOT_USERNAME: str({ default: 'root' }),
    MONGO_INITDB_ROOT_PASSWORD: str({ default: 'rootpassword' }),
    MONGO_URL: str(),
    PORT: port({ default: 5000 }),
});

export const {
    CORS_ORIGINS,
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT,
    GPT_3_5_TURBO_MODEL_NAME,
    GPT_4_MODEL_NAME,
    ANTHROPIC_API_KEY,
    CLAUDE_EVAL_MODEL,
    OLLAMA_BASE_URL,
    OLLAMA_API_KEY,
    OLLAMA_EVAL_MODEL,
    GROQ_API_KEY,
    GROQ_BASE_URL,
    GROQ_EVAL_MODEL,
    DEFAULT_MODEL,
    EVAL_AZURE_OPENAI_API_KEY,
    EVAL_AZURE_OPENAI_ENDPOINT,
    EVAL_AZURE_OPENAI_API_VERSION,
    EVAL_AZURE_OPENAI_DEPLOYMENT,
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGO_URL,
    PORT
} = env;
