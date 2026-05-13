import { Router } from 'express';
import { createMatch, getMatches, updateMatch, deleteMatch, generateFixture, addComment, reactToMatch, voteMVP, getRivalries, getMatchOfTheWeek } from './match.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';
import { authtenticatedLimiter, apiLimiter } from '../../middlewares/request-limit.js';
import { isAdmin } from '../../middlewares/role-validator.js';

const router = Router();

// Pública - Ver calendario y analítica
router.get('/', apiLimiter, getMatches);
router.get('/rivalries', apiLimiter, getRivalries);
router.get('/featured', apiLimiter, getMatchOfTheWeek);

// Interacción social (requiere login)
router.post('/:id/comment', [validateJWT, authtenticatedLimiter], addComment);
router.post('/:id/react', [validateJWT, authtenticatedLimiter], reactToMatch);
router.post('/:id/vote-mvp', [validateJWT, authtenticatedLimiter], voteMVP);

// Privada - Solo profesor (Admin)
router.post('/', [validateJWT, isAdmin], createMatch);
router.post('/generate-fixture', [validateJWT, isAdmin], generateFixture);
router.put('/:id', [validateJWT, isAdmin], updateMatch);
router.delete('/:id', [validateJWT, isAdmin], deleteMatch);

export default router;
