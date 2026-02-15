import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { enforceSubscription } from '../../middleware/subscription.js';
import { requireRoles } from '../../middleware/role.js';
import * as controller from './orders.controller.js';

const router = Router();
router.use(requireAuth, enforceSubscription);

router.get('/', controller.list);
router.post('/', requireRoles(['MANAGER', 'CASHIER', 'WAITER']), controller.createOrder);
router.post('/:id/payments', requireRoles(['MANAGER', 'CASHIER']), controller.addPayment);
router.post('/items/:itemId/status', requireRoles(['MANAGER', 'KITCHEN']), controller.updateItemStatus);

export default router;
