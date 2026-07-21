import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount } from './notification.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';

const router = Router();

router.use(validateJWT);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.get('/unread-count', getUnreadCount);

export default router;
