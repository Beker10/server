import { Router } from 'express';
import { getActiveRule, getAllRules, createRule, updateRule, activateRule, deleteRule } from './rule.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';

const router = Router();

// Ruta pública para obtener el reglamento activo
router.get('/active', getActiveRule);

// Rutas protegidas para administración
router.use(validateJWT);

router.get('/', getAllRules);
router.post('/', createRule);
router.put('/:id', updateRule);
router.put('/:id/activate', activateRule);
router.delete('/:id', deleteRule);

export default router;
