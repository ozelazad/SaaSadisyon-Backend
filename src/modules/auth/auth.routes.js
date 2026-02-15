import { Router } from 'express';
import * as controller from './auth.controller.js';

const router = Router();

router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/platform/login', controller.platformAdminLogin);

export default router;
