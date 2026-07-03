// src/controllers/promptEnhancement.controllers.ts

import { Request, Response, NextFunction } from 'express';
import { enhancePrompt } from '../services/promptEnhancement.services';
export const enhancePromptController = async (req: Request, res: Response, next: NextFunction) => {
    const { prompt, generativeModel } = req.body;

    try {
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        const enhancedPrompt = await enhancePrompt(prompt, generativeModel);
        return res.status(200).json({ enhancedPrompt });
    } catch (err) {
        next(err);
    }
};
