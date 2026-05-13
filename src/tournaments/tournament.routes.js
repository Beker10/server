import { Router } from 'express';
import { createTournament, getTournaments } from './tournament.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';

const router = Router();

router.post('/', validateJWT, createTournament);
router.get('/', validateJWT, getTournaments);

export default router;
