import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Fall back to placeholders so the server always boots even when Azure OpenAI
// isn't configured (GPT cards simply fail at call time until real values are set).
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://placeholder.openai.azure.com";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "placeholder";

const openai = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
const credential = new AzureKeyCredential(apiKey);

export { openai, credential, endpoint };
