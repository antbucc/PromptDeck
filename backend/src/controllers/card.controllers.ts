// src/controllers/card.controllers.ts

import { Request, Response, NextFunction } from 'express';
import { CardModel, ICard, propagateInconsistency } from '../models/card.models';
import { ExecutionDataModel, ExecutionDataDocument } from '../models/executionData.models';
import { TaskModel } from '../models/task.models';
import { executeCard } from '../services/execution.services';
import { evaluateCardOutput } from '../services/evaluation.services';
import { EvaluationMetricType, EvaluationMetricDefinition } from '../types';
import { Types } from 'mongoose';
import { GenerativeModels } from '../types/GenerativeModels';

type CreateCardBody = Omit<ICard, '_id'> & {
    execute?: boolean;
    evaluate?: boolean;
    taskId?: string;
};

const executeAndSaveCard = async (card: ICard): Promise<ExecutionDataDocument> => {
    // Delete the old output if it exists
    if (card.output) {
        await ExecutionDataModel.findByIdAndDelete(card.output);
    }

    // Execute the card and generate new output
    const { generatedText } = await executeCard(card);
    const executionData = new ExecutionDataModel({
        generatedText,
        evaluationMetrics: [],
    });
    await executionData.save();

    // Update the card with the new output
    card.output = executionData._id;
    card.executed = true;
    await card.save();

    return executionData;
};

const evaluateAndSaveCard = async (card: ICard, executionData: ExecutionDataDocument) => {
    const evaluationResults = await evaluateCardOutput(card._id.toString());

    executionData.evaluationMetrics = [
        { type: EvaluationMetricType.COHERENCE, evaluationDescription: EvaluationMetricDefinition.COHERENCE, evaluationResult: evaluationResults.coherence_score },
        { type: EvaluationMetricType.RELEVANCE, evaluationDescription: EvaluationMetricDefinition.RELEVANCE, evaluationResult: evaluationResults.relevance_score },
        { type: EvaluationMetricType.FLUENCY, evaluationDescription: EvaluationMetricDefinition.FLUENCY, evaluationResult: evaluationResults.fluency_score },
        { type: EvaluationMetricType.GROUNDEDNESS, evaluationDescription: EvaluationMetricDefinition.GROUNDEDNESS, evaluationResult: evaluationResults.groundedness_score },
        {
            type: EvaluationMetricType.AVERAGE, evaluationDescription: EvaluationMetricDefinition.AVERAGE,
            evaluationResult: (evaluationResults.relevance_score + evaluationResults.groundedness_score + evaluationResults.coherence_score + evaluationResults.fluency_score) / 4,
        },
    ];

    await executionData.save();
    card.evaluated = true;
    await card.save();
};

export const createCard = async (req: Request<{}, any, CreateCardBody>, res: Response, next: NextFunction) => {
    const { taskId, generativeModel, ...card } = req.body;
    const { execute = 'false', evaluate = execute } = req.query;

    // Validate generativeModel
    if (!GenerativeModels.isValidModel(generativeModel.toString())) {
        return res.status(400).json({ message: 'Invalid generative model' });
    }

    try {
        const newCard = new CardModel({
            ...card,
            generativeModel: generativeModel as keyof typeof GenerativeModels.ModelMapping, // Ensure correct type
            previousCards: [],
            nextCards: [],
            output: null,
            executed: false,
            evaluated: false,
            inconsistent: false,
        });

        await newCard.save();

        if (taskId) {
            const task = await TaskModel.findById(taskId);
            if (task) {
                task.cards.push(newCard._id);
                await task.save();
            }
        }

        let output: ExecutionDataDocument | null = null;
        if (execute === 'true') {
            output = await executeAndSaveCard(newCard);
        }

        if (evaluate === 'true' && output) {
            await evaluateAndSaveCard(newCard, output);
        }

        const populatedCard = await CardModel.findById(newCard._id);
        return res.status(201).json(populatedCard);
    } catch (err) {
        next(err);
    }
};

export const executeCardController = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { evaluate = 'true' } = req.query;


    try {
        const card = await CardModel.findById(new Types.ObjectId(id));
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const output = await executeAndSaveCard(card);
        if (evaluate === 'true') {
            await evaluateAndSaveCard(card, output);
        }
        card.inconsistent = false;
        propagateInconsistency(card._id);
        await card.save();
        return res.status(200).json(output);
    } catch (err) {
        next(err);
    }
};

export const evaluateCardById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const card = await CardModel.findById(new Types.ObjectId(id));
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        if (!card.output) {
            return res.status(400).json({ message: 'Card has no output to evaluate' });
        }

        const output = await ExecutionDataModel.findById(card.output);
        if (!output) {
            return res.status(404).json({ message: 'Output not found' });
        }

        await evaluateAndSaveCard(card, output);
        card.inconsistent = false;
        await card.save();
        return res.status(200).json(output);
    } catch (err) {
        next(err);
    }
};

export const setNextCard = async (req: Request<{ currentCardId: string }, any, { nextCardIds: string[] }>, res: Response, next: NextFunction) => {
    const { currentCardId } = req.params;
    const { nextCardIds } = req.body;

    try {
        const currentCard = await CardModel.findById(new Types.ObjectId(currentCardId));
        if (!currentCard) {
            return res.status(404).json({ message: 'Current card not found' });
        }

        for (const nextCardId of nextCardIds) {
            await currentCard.linkCard(new Types.ObjectId(nextCardId), 'next');
        }

        const updatedCard = await CardModel.findById(currentCardId);
        return res.status(200).json(updatedCard);
    } catch (err) {
        next(err);
    }
};

export const setPreviousCard = async (req: Request<{ currentCardId: string }, any, { previousCardIds: string[] }>, res: Response, next: NextFunction) => {
    const { currentCardId } = req.params;
    const { previousCardIds } = req.body;

    try {
        const currentCard = await CardModel.findById(new Types.ObjectId(currentCardId));
        if (!currentCard) {
            return res.status(404).json({ message: 'Current card not found' });
        }

        for (const previousCardId of previousCardIds) {
            await currentCard.linkCard(new Types.ObjectId(previousCardId), 'previous');
        }

        const updatedCard = await CardModel.findById(currentCardId);
        return res.status(200).json(updatedCard);
    } catch (err) {
        next(err);
    }
};


export const removeNextCard = async (req: Request<{ currentCardId: string }, any, { nextCardId: string }>, res: Response, next: NextFunction) => {
    const { currentCardId } = req.params;
    const { nextCardId } = req.body;

    try {
        const currentCard = await CardModel.findById(new Types.ObjectId(currentCardId));
        if (!currentCard) {
            return res.status(404).json({ message: 'Current card not found' });
        }

        await currentCard.unlinkCard(new Types.ObjectId(nextCardId), 'next');
        const nextCard = await CardModel.findById(nextCardId);
        return res.status(200).json({ currentCard, nextCard });
    } catch (err) {
        next(err);
    }
};

export const removePreviousCard = async (req: Request<{ currentCardId: string }, any, { previousCardId: string }>, res: Response, next: NextFunction) => {
    const { currentCardId } = req.params;
    const { previousCardId } = req.body;

    try {
        const currentCard = await CardModel.findById(new Types.ObjectId(currentCardId));
        if (!currentCard) {
            return res.status(404).json({ message: 'Current card not found' });
        }

        await currentCard.unlinkCard(new Types.ObjectId(previousCardId), 'previous');
        const previousCard = await CardModel.findById(previousCardId);
        return res.status(200).json({ currentCard, previousCard });
    } catch (err) {
        next(err);
    }
};

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cards = await CardModel.find();
        return res.status(200).json(cards);
    } catch (err) {
        next(err);
    }
};

export const getCardsWithoutPopulate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cards = await CardModel.find();
        return res.status(200).json(cards);
    } catch (err) {
        next(err);
    }
};

export const deleteCardById = async (req: Request<{ id: string }, any, { taskId?: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { taskId } = req.body;

    try {
        const card = await CardModel.findById(new Types.ObjectId(id));
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        // Unlink from previous cards
        for (const prevCardId of card.previousCards) {
            const prevCard = await CardModel.findById(prevCardId);
            if (prevCard) {
                await prevCard.unlinkCard(card._id, 'next');
            }
        }

        // Unlink from next cards
        for (const nextCardId of card.nextCards) {
            const nextCard = await CardModel.findById(nextCardId);
            if (nextCard) {
                await nextCard.unlinkCard(card._id, 'previous');
            }
        }

        // Remove the card from its task if taskId is specified
        if (taskId) {
            const task = await TaskModel.findById(taskId);
            if (task) {
                task.cards = task.cards.filter(taskCardId => !taskCardId.equals(card._id));
                await task.save();
            }
        }

        await CardModel.findByIdAndDelete(id);
        return res.status(204).end();
    } catch (err) {
        next(err);
    }
};




export const deleteAllCards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CardModel.deleteMany({});
        return res.status(204).end();
    } catch (err) {
        next(err);
    }
};

export const getCardById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const card = await CardModel.findById(new Types.ObjectId(id)).populate('output');
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        return res.status(200).json(card);
    } catch (err) {
        next(err);
    }
};

export const getPreviousCardsOutputsController = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const card = await CardModel.findById(new Types.ObjectId(id));
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const previousCardsOutputs = await card.getPreviousCardsOutputs();
        return res.status(200).json(previousCardsOutputs);
    } catch (err) {
        next(err);
    }
};

export const updateCard = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, objective, prompt, context, exampleOutput, generativeModel, inconsistent } = req.body;

    // Validate generativeModel
    if (!GenerativeModels.isValidModel(generativeModel)) {
        return res.status(400).json({ message: 'Invalid generative model' });
    }

    try {
        const card = await CardModel.findById(new Types.ObjectId(id));

        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        card.title = title;
        card.objective = objective;
        card.prompt = prompt;
        card.context = context;
        card.exampleOutput = exampleOutput;
        card.generativeModel = generativeModel; // Include generativeModel field
        card.inconsistent = inconsistent;

        await card.save();

        res.status(200).json(card);
    } catch (error) {
        console.error(`Error updating card with id ${id}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addPluginToCard = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { plugin } = req.body;

    try {
        const card = await CardModel.findById(id).exec();
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        if (!card.plugins.includes(plugin)) {
            card.plugins.push(plugin);
            await card.save();
        }

        return res.status(200).json(card);
    } catch (err) {
        next(err);
    }
};

export const removePluginFromCard = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { plugin } = req.body;

    try {
        const card = await CardModel.findById(id).exec();
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        card.plugins = card.plugins.filter(p => p !== plugin);
        await card.save();

        return res.status(200).json(card);
    } catch (err) {
        next(err);
    }
};

export const updateCardOutput = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { generatedText } = req.body;

    try {
        const card = await CardModel.findById(id).populate('output').exec();
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        let executionData;
        if (card.output) {
            // Update existing execution data
            executionData = await ExecutionDataModel.findById(card.output._id);
            if (!executionData) {
                return res.status(404).json({ message: 'Execution Data not found' });
            }
            executionData.generatedText = generatedText;
            // Remove evaluation metrics
            executionData.evaluationMetrics = [];
        } else {
            // Create new execution data
            executionData = new ExecutionDataModel({
                generatedText,
                evaluationMetrics: [],
            });
            await executionData.save();

            card.output = executionData._id;
        }

        // Set card.evaluated to false
        card.evaluated = false;

        await executionData.save();
        await card.save();

        return res.status(200).json({ message: 'Card output updated successfully', executionData });
    } catch (err) {
        next(err);
    }
};

// Select this card as the chosen option within its alternative group,
// deselecting all sibling alternatives.
export const selectAlternative = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const card = await CardModel.findById(id).exec();
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        if (!card.alternativeGroup) {
            return res.status(400).json({ message: 'Card is not part of an alternative group' });
        }

        await CardModel.updateMany(
            { alternativeGroup: card.alternativeGroup, _id: { $ne: card._id } },
            { selected: false }
        );
        card.selected = true;
        await card.save();

        return res.status(200).json(card);
    } catch (err) {
        next(err);
    }
};

// Mark a set of existing cards as mutually-exclusive alternatives (the first is
// selected by default). Lets the user create decision points manually.
export const groupAlternatives = async (req: Request<{}, any, { cardIds: string[] }>, res: Response, next: NextFunction) => {
    const { cardIds } = req.body;

    try {
        if (!Array.isArray(cardIds) || cardIds.length < 2) {
            return res.status(400).json({ message: 'Provide at least two card ids to group as alternatives' });
        }

        const group = `manual-${cardIds[0]}`;
        for (let i = 0; i < cardIds.length; i++) {
            await CardModel.findByIdAndUpdate(cardIds[i], { alternativeGroup: group, selected: i === 0 });
        }

        return res.status(200).json({ alternativeGroup: group });
    } catch (err) {
        next(err);
    }
};

// Remove the given cards from any alternative group (all become selected again).
export const ungroupAlternatives = async (req: Request<{}, any, { cardIds: string[] }>, res: Response, next: NextFunction) => {
    const { cardIds } = req.body;

    try {
        if (!Array.isArray(cardIds) || cardIds.length === 0) {
            return res.status(400).json({ message: 'Provide the card ids to ungroup' });
        }

        await CardModel.updateMany({ _id: { $in: cardIds } }, { alternativeGroup: null, selected: true });
        return res.status(200).json({ ok: true });
    } catch (err) {
        next(err);
    }
};
