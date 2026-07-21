import { Router } from 'express';
import { getSystemInfo, updateSystemInfo } from './system.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';

const router = Router();

// Ruta pública para obtener información del sistema
router.get('/', getSystemInfo);

// Ruta protegida para actualizar información (solo admin)
router.use(validateJWT);
router.put('/', updateSystemInfo);

export default router;
