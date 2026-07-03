// ./src/routes/settings.routes.ts

import { Router } from 'express';
import { getSettings, updateSettings, getModels } from '../controllers/settings.controllers';
import checkAuth from '../middlewares/auth.middleware';

const router = Router();

router.get('/', checkAuth, getSettings);
router.put('/', checkAuth, updateSettings);
router.get('/models', checkAuth, getModels);

export default router;
