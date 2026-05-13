import { Router } from 'express';
import { getMyNotifications, markAsRead } from './notification.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';

const router = Router();

router.get('/', [validateJWT], getMyNotifications);
router.put('/:id/read', [validateJWT], markAsRead);

export default router;
