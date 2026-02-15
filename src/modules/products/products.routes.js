import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforceSubscription } from '../../middleware/subscription.js';
import * as controller from './products.controller.js';

const router = Router();
router.use(requireAuth, enforceSubscription);
router.get('/', controller.list);

export default router;
