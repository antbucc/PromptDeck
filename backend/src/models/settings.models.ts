// ./src/models/settings.models.ts

import { Schema, model, Document } from 'mongoose';

export interface SettingsDocument extends Document {
    key: string; // singleton discriminator, always 'global'
    anthropicApiKey: string;
    createdAt: Date;
    updatedAt: Date;
}

const settingsSchema = new Schema<SettingsDocument>(
    {
        key: { type: String, required: true, unique: true, default: 'global' },
        // Provider API keys entered via the UI. Empty string means "fall back to
        // the value from the backend .env (if any)".
        anthropicApiKey: { type: String, default: '' }
    },
    {
        timestamps: true
    }
);

export const SettingsModel = model<SettingsDocument>('Settings', settingsSchema);
