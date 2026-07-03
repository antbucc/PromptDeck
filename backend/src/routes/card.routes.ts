// src/routes/card.routes.ts

import { Router } from 'express';
import {
    createCard,
    getCards,
    executeCardController,
    getCardById,
    deleteAllCards,
    deleteCardById,
    evaluateCardById,
    setNextCard,
    setPreviousCard,
    removeNextCard,
    removePreviousCard,
    getPreviousCardsOutputsController,
    updateCard,
    addPluginToCard,
    removePluginFromCard,
    updateCardOutput,
    selectAlternative,
    groupAlternatives,
    ungroupAlternatives
} from '../controllers/card.controllers';
import checkAuth from '../middlewares/auth.middleware';

const router = Router();

router.post('/', checkAuth, createCard);
router.get('/', checkAuth, getCards);
router.get('/without-populate', checkAuth, getCards);
router.get('/:id', checkAuth, getCardById);
router.post('/execute/:id', checkAuth, executeCardController);
router.delete('/:id', checkAuth, deleteCardById);
router.delete('/', checkAuth, deleteAllCards);
router.post('/evaluate/:id', checkAuth, evaluateCardById);
router.put('/set-next/:currentCardId', checkAuth, setNextCard);
router.put('/set-previous/:currentCardId', checkAuth, setPreviousCard);
router.put('/remove-next/:currentCardId', checkAuth, removeNextCard);
router.put('/remove-previous/:currentCardId', checkAuth, removePreviousCard);
router.get('/previous-cards-outputs/:id', checkAuth, getPreviousCardsOutputsController);
router.put('/:id', checkAuth, updateCard);
router.put('/:id/plugin', checkAuth, addPluginToCard); // Updated to support multiple plugins
router.delete('/:id/plugin', checkAuth, removePluginFromCard); // New route
router.put('/:id/output', checkAuth, updateCardOutput);
router.put('/:id/select-alternative', checkAuth, selectAlternative);
router.post('/group-alternatives', checkAuth, groupAlternatives);
router.post('/ungroup-alternatives', checkAuth, ungroupAlternatives);

export default router;
