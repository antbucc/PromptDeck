// src/models/card.models.ts
import { Schema, model, Document, Types } from 'mongoose';
import { ExecutionDataModel, ExecutionDataDocument } from './executionData.models';
import { GenerativeModels } from '../types/GenerativeModels';


export interface ICard extends Document {
    title: string;
    objective: string;
    prompt: string;
    generativeModel: keyof typeof GenerativeModels.ModelMapping;
    context: string;
    exampleOutput?: string;
    previousCards: Types.ObjectId[];
    nextCards: Types.ObjectId[];
    output: Types.ObjectId | ExecutionDataDocument | null;
    executed: boolean;
    evaluated: boolean;
    inconsistent: boolean;
    plugins: string[];
    // Non-deterministic alternatives: cards sharing the same alternativeGroup are
    // mutually-exclusive options; only the `selected` one runs during "Run flow".
    alternativeGroup?: string | null;
    selected: boolean;
    createdAt: Date;
    updatedAt: Date;
    getFormattedDetails: () => Promise<{ answer: string | null, prompt: string, context: string, exampleOutput: string | undefined }>;
    linkCard: (cardId: Types.ObjectId, direction: 'next' | 'previous') => Promise<void>;
    unlinkCard: (cardId: Types.ObjectId, direction: 'next' | 'previous') => Promise<void>;
    getPreviousCardsOutputs: () => Promise<{ [key: string]: string | null }>;
}

const cardSchema = new Schema<ICard>(
    {
        title: { type: String, required: true },
        objective: { type: String, required: true },
        prompt: { type: String, required: true },
        generativeModel: { type: String, required: true, enum: Object.keys(GenerativeModels.ModelMapping) },
        context: { type: String, required: false },
        exampleOutput: { type: String, required: false },
        previousCards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
        nextCards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
        output: { type: Schema.Types.ObjectId, ref: 'ExecutionData', default: null },
        executed: { type: Boolean, default: false },
        evaluated: { type: Boolean, default: false },
        inconsistent: { type: Boolean, default: false },
        plugins: [{ type: String }],
        alternativeGroup: { type: String, default: null },
        selected: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

cardSchema.methods.getFormattedDetails = async function () {
    const card = this as ICard;
    const output = card.output ? await ExecutionDataModel.findById(card.output).exec() : null;

    const prompt = card.prompt;
    let context = card.context || '';
    context += "Example output:" + card.exampleOutput;
    const previousCardsOutputs = await card.getPreviousCardsOutputs();

    if (!context && Object.keys(previousCardsOutputs).length === 0) {
        context = 'No context';
    } else {
        const contextWithPreviousOutputs = `${context}\n\n\n${Object.entries(previousCardsOutputs)
            .map(([key, value]) => `${value}`)
            .join('\n')}`;
        context = contextWithPreviousOutputs.trim();
    }

    const answer = output ? output.generatedText : null;

    return { answer, prompt, context };
};


cardSchema.methods.linkCard = async function (cardId: Types.ObjectId, direction: 'next' | 'previous') {
    const card = this as ICard;
    const relatedCard = await CardModel.findById(cardId).exec() as ICard | null;
    if (!relatedCard) throw new Error('Related card not found');

    if (direction === 'next' && !card.nextCards.includes(cardId)) {
        card.nextCards.push(cardId);
        if (!relatedCard.previousCards.includes(card._id)) {
            relatedCard.previousCards.push(card._id);
        }
    } else if (direction === 'previous' && !card.previousCards.includes(cardId)) {
        card.previousCards.push(cardId);
        if (!relatedCard.nextCards.includes(card._id)) {
            relatedCard.nextCards.push(card._id);
        }
    }

    await card.save();
    await relatedCard.save();
};

cardSchema.methods.unlinkCard = async function (cardId: Types.ObjectId, direction: 'next' | 'previous') {
    const card = this as ICard;
    const relatedCard = await CardModel.findById(cardId).exec() as ICard | null;
    if (!relatedCard) throw new Error('Related card not found');

    if (direction === 'next') {
        card.nextCards = card.nextCards.filter(id => !id.equals(cardId));
        relatedCard.previousCards = relatedCard.previousCards.filter(id => !id.equals(card._id));
    } else if (direction === 'previous') {
        card.previousCards = card.previousCards.filter(id => !id.equals(cardId));
        relatedCard.nextCards = relatedCard.nextCards.filter(id => !id.equals(card._id));
    }

    await card.save();
    await relatedCard.save();
};

cardSchema.methods.getPreviousCardsOutputs = async function () {
    const card = this as ICard;
    const previousCardsOutputs: { [key: string]: string | null } = {};

    for (const prevCardId of card.previousCards) {
        const prevCard = await CardModel.findById(prevCardId).populate('output').exec() as ICard | null;
        if (prevCard && prevCard.output) {
            const output = await ExecutionDataModel.findById(prevCard.output);
            previousCardsOutputs[prevCardId.toString()] = output?.generatedText || null;
        } else {
            previousCardsOutputs[prevCardId.toString()] = null;
        }
    }

    return previousCardsOutputs;
};

export const propagateInconsistency = async (cardId: Types.ObjectId): Promise<void> => {
    const card = await CardModel.findById(cardId).exec() as ICard | null;
    if (!card) return;

    for (const nextCardId of card.nextCards) {
        const nextCard = await CardModel.findById(nextCardId).exec() as ICard | null;
        if (nextCard && !nextCard.inconsistent) {
            nextCard.inconsistent = true;
            await nextCard.save();
        }
    }
};

cardSchema.pre('save', async function (next) {
    const card = this as ICard;

    //.log('pre save');

    if (card.isNew) {
        next();
        return;
    }

    // Check if any of the specified fields have been modified
    const fieldsToCheck = ['objective', 'prompt', 'context', 'generativeModel', 'exampleOutput'];
    const isModified = fieldsToCheck.some(field => card.isModified(field));

    if (isModified) {
        card.output = null;
        card.executed = false;
        card.evaluated = false;
        card.inconsistent = true;
    }

    next();
});

cardSchema.post('save', async function () {
    const card = this as ICard;

    if (card.isModified('inconsistent') && card.inconsistent) {
        await propagateInconsistency(card._id);
    }
});

export const CardModel = model<ICard>('Card', cardSchema);
