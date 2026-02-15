import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import orderRoutes from '../modules/orders/orders.routes.js';
import productRoutes from '../modules/products/products.routes.js';
import tableRoutes from '../modules/tables/tables.routes.js';
import reportRoutes from '../modules/reports/reports.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/tables', tableRoutes);
router.use('/reports', reportRoutes);

export default router;
