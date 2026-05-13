import { Router } from 'express';
import { createHistoryRecord, getHistory } from './history.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';
import { isAdmin } from '../../middlewares/role-validator.js';
import { apiLimiter } from '../../middlewares/request-limit.js';

const router = Router();

router.get('/', apiLimiter, getHistory);
router.post('/', [validateJWT, isAdmin], createHistoryRecord);

export default router;
