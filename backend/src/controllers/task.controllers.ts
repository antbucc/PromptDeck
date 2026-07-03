// src/controllers/task.controllers.ts
import { Request, Response, NextFunction } from 'express';
import { TaskModel } from '../models/task.models';
import { CardModel, ICard } from '../models/card.models';
import { MilestoneModel } from '../models/milestone.models';
import { Types } from 'mongoose';
import { generateTask } from '../services/task.services';

interface CreateTaskBody {
    name: string;
    objective: string;
    milestones?: string[];
    cards?: string[];
    generate?: boolean;
    generativeModel?: string;
    // Optional grounding fields used to steer AI flow generation.
    audience?: string;
    background?: string;
    constraints?: string;
    desiredOutput?: string;
    groundingText?: string;
    importedCards?: {
        title: string;
        objective: string;
        prompt: string;
        context: string;
        exampleOutput: string;
        dependencies: string[];
        generativeModel?: string;
    }[];
}

export const createTask = async (req: Request<{}, any, CreateTaskBody>, res: Response, next: NextFunction) => {
    const { name, objective, milestones = [], cards = [], generate = false, generativeModel, importedCards = [],
        audience, background, constraints, desiredOutput, groundingText } = req.body;

    // Assemble optional grounding/guidance for AI generation, capped to keep the prompt sane.
    const groundingParts: string[] = [];
    if (audience) groundingParts.push(`Target audience: ${audience}`);
    if (background) groundingParts.push(`Background / context:\n${background}`);
    if (constraints) groundingParts.push(`Constraints to respect:\n${constraints}`);
    if (desiredOutput) groundingParts.push(`Desired output / structure:\n${desiredOutput}`);
    if (groundingText) groundingParts.push(`Source documents — base the cards strictly on this data:\n${groundingText}`);
    const grounding = groundingParts.join('\n\n').slice(0, 16000);

    try {
        // Create the new task in the database
        const newTask = await TaskModel.create({
            name,
            objective,
            milestones: milestones.map(id => new Types.ObjectId(id)),
            cards: cards.map(id => new Types.ObjectId(id)),
        });

        const cardIds: Types.ObjectId[] = [];
        const cardMap: { [key: string]: ICard } = {};

        // Handle predefined cards
        if (importedCards.length > 0) {
            for (const card of importedCards) {
                const exampleOutput = Array.isArray(card.exampleOutput)
                    ? card.exampleOutput.join(' ')
                    : card.exampleOutput;

                const newCard = await CardModel.create({
                    title: card.title,
                    objective: card.objective,
                    prompt: card.prompt,
                    generativeModel: card.generativeModel || generativeModel || null,
                    context: card.context,
                    exampleOutput,
                    previousCards: [],
                    nextCards: [],
                    output: null,
                    executed: false,
                    evaluated: false,
                    inconsistent: false,
                    plugins: [],
                });
                cardIds.push(newCard._id);
                cardMap[card.title] = newCard;
            }

            // Link cards based on dependencies
            for (const card of importedCards) {
                const currentCard = cardMap[card.title];
                for (const dependency of card.dependencies) {
                    const dependentCard = cardMap[dependency];
                    if (dependentCard) {
                        await currentCard.linkCard(dependentCard._id, 'previous');
                    }
                }
            }
        }

        // Handle generated cards
        if (generate && generativeModel) {
            const generatedData = await generateTask(newTask, generativeModel, grounding);
            const generatedCards = generatedData.cards;

            if (!Array.isArray(generatedCards)) {
                throw new Error("Invalid generated cards format");
            }

            // Track which alternative groups already have a selected option.
            const groupSeen = new Set<string>();

            for (const card of generatedCards) {
                const exampleOutput = Array.isArray(card.exampleOutput)
                    ? card.exampleOutput.join(' ')
                    : card.exampleOutput;

                // Namespace the group by task so ids never collide across tasks.
                const rawGroup = card.alternativeGroup ? String(card.alternativeGroup).trim() : '';
                const alternativeGroup = rawGroup ? `${newTask._id}:${rawGroup}` : null;
                let selected = true;
                if (alternativeGroup) {
                    if (groupSeen.has(alternativeGroup)) selected = false;
                    else groupSeen.add(alternativeGroup);
                }

                const newCard = await CardModel.create({
                    title: card.title,
                    objective: card.objective,
                    prompt: card.prompt,
                    generativeModel,
                    context: card.context,
                    exampleOutput,
                    previousCards: [],
                    nextCards: [],
                    output: null,
                    executed: false,
                    evaluated: false,
                    inconsistent: false,
                    plugins: [],
                    alternativeGroup,
                    selected,
                });
                cardIds.push(newCard._id);
                cardMap[card.title] = newCard;
            }

            // Normalize titles so dependencies match even with different casing,
            // surrounding whitespace, or leading list markers ("1. ", "- ").
            const normalize = (s: any) =>
                String(s || '').toLowerCase().trim().replace(/^[\s\-*\d.)]+/, '').replace(/\s+/g, ' ');
            const normMap: { [key: string]: any } = {};
            Object.keys(cardMap).forEach((t) => { normMap[normalize(t)] = cardMap[t]; });

            let linksCreated = 0;
            for (const card of generatedCards) {
                const currentCard = cardMap[card.title];
                if (!currentCard) continue;
                for (const dependency of card.dependencies || []) {
                    const dependentCard = cardMap[dependency] || normMap[normalize(dependency)];
                    if (dependentCard && !dependentCard._id.equals(currentCard._id)) {
                        await currentCard.linkCard(dependentCard._id, 'previous');
                        linksCreated++;
                    }
                }
            }

            // Fallback: if the model produced no usable connections at all, chain the
            // cards sequentially so the flow is never fully disconnected.
            if (linksCreated === 0 && generatedCards.length > 1) {
                for (let i = 1; i < generatedCards.length; i++) {
                    const cur = cardMap[generatedCards[i].title];
                    const prev = cardMap[generatedCards[i - 1].title];
                    if (cur && prev) await cur.linkCard(prev._id, 'previous');
                }
            }
        }

        // Add cards to the task
        newTask.cards.push(...cardIds);
        await newTask.save();

        return res.status(201).json(newTask);
    } catch (err) {
        next(err);
    }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await TaskModel.find();
        return res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
};

export const addMilestonesToTask = async (req: Request<{ id: string }, any, { milestoneIds: string[] }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { milestoneIds } = req.body;

    try {
        const task = await TaskModel.findById(new Types.ObjectId(id));
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.milestones.push(...milestoneIds.map(id => new Types.ObjectId(id)));
        await task.save();

        return res.status(200).json(task);
    } catch (err) {
        next(err);
    }
};

export const removeMilestonesFromTask = async (req: Request<{ id: string }, any, { milestoneIds: string[] }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { milestoneIds } = req.body;

    try {
        const task = await TaskModel.findById(new Types.ObjectId(id));
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.milestones = task.milestones.filter(milestoneId => !milestoneIds.includes(milestoneId.toHexString()));
        await task.save();

        return res.status(200).json(task);
    } catch (err) {
        next(err);
    }
};

export const addCardsToTask = async (req: Request<{ id: string }, any, { cardIds: string[] }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { cardIds } = req.body;

    try {
        const task = await TaskModel.findById(new Types.ObjectId(id));
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.cards.push(...cardIds.map(id => new Types.ObjectId(id)));
        await task.save();

        return res.status(200).json(task);
    } catch (err) {
        next(err);
    }
};

export const removeCardsFromTask = async (req: Request<{ id: string }, any, { cardIds: string[] }>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { cardIds } = req.body;

    try {
        const task = await TaskModel.findById(new Types.ObjectId(id));
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.cards = task.cards.filter(cardId => !cardIds.includes(cardId.toHexString()));
        await task.save();

        return res.status(200).json(task);
    } catch (err) {
        next(err);
    }
};

export const getTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const task = await TaskModel.findById(new Types.ObjectId(id)).populate('milestones cards');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        return res.status(200).json(task);
    } catch (err) {
        next(err);
    }
};

export const updateTask = async (req: Request<{ id: string }, any, CreateTaskBody>, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, objective, milestones, cards } = req.body;

    try {
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (objective !== undefined) updateData.objective = objective;
        if (milestones !== undefined) updateData.milestones = milestones.map(id => new Types.ObjectId(id));
        if (cards !== undefined) updateData.cards = cards.map(id => new Types.ObjectId(id));

        const updatedTask = await TaskModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json(updatedTask);
    } catch (err) {
        next(err);
    }
};

export const deleteTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const task = await TaskModel.findByIdAndDelete(new Types.ObjectId(id));
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        return res.status(200).json(task);
    } catch (err) {
        next(err);
    }
};

export const getTaskMilestones = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const task = await TaskModel.findById(new Types.ObjectId(id)).populate('milestones');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        return res.status(200).json(task.milestones);
    } catch (err) {
        next(err);
    }
};

export const getTaskCards = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const task = await TaskModel.findById(new Types.ObjectId(id)).populate('cards');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const milestones = await MilestoneModel.find({ _id: { $in: task.milestones } }).populate('cards');
        const milestoneCards = milestones.reduce((acc, milestone) => {
            acc.push(...milestone.cards);
            return acc;
        }, [] as Types.ObjectId[]);

        const allCards = [...task.cards, ...milestoneCards];

        return res.status(200).json(allCards);
    } catch (err) {
        next(err);
    }
};

// Delete all tasks
export const deleteAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tasks = await TaskModel.find();
        await TaskModel.deleteMany({});
        await CardModel.updateMany(
            { tasks: { $in: tasks.map(task => task._id) } },
            { $pull: { tasks: { $in: tasks.map(task => task._id) } } }
        );
        await MilestoneModel.updateMany(
            { tasks: { $in: tasks.map(task => task._id) } },
            { $pull: { tasks: { $in: tasks.map(task => task._id) } } }
        );
        return res.status(200).json(tasks);
    } catch (err) {
        next(err);
    }
};

export const exportTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const task = await TaskModel.findById(new Types.ObjectId(id)).populate('milestones cards');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Retrieve associated cards
        const cards = await CardModel.find({ _id: { $in: task.cards } });

        // Format the response
        const exportedTask = {
            name: task.name,
            objective: task.objective,
            milestones: task.milestones.map(milestone => milestone.toHexString()),
            importedCards: await Promise.all(cards.map(async card => ({
                title: card.title,
                objective: card.objective,
                prompt: card.prompt,
                context: card.context,
                exampleOutput: card.exampleOutput,
                dependencies: await Promise.all(card.previousCards.map(async prevCardId => {
                    const prevCard = await CardModel.findById(prevCardId);
                    return prevCard ? prevCard.title : null;
                })).then(dependencies => dependencies.filter(dep => dep !== null)),
                generativeModel: card.generativeModel || undefined
            })))
        };

        return res.status(200).json(exportedTask);
    } catch (err) {
        next(err);
    }
};