import { Router } from 'express';
import { updateProfile, updateEmail, sendVerificationCode, changePasswordWithCode, searchUsers, verifyCurrentPassword, changePasswordDirect, updateThemePreference } from './user.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';
import { authtenticatedLimiter } from '../../middlewares/request-limit.js';
import { uploadProfilePicture } from '../../middlewares/file-uploader.js';
import { processFileUpload } from '../../middlewares/process-file-upload.js';

const router = Router();

// Todas las rutas de usuario requieren Token
router.use(validateJWT);

router.get('/search', searchUsers);
router.put('/update-profile', [uploadProfilePicture.single('profilePicture'), processFileUpload], updateProfile);
router.put('/update-email', updateEmail);
router.post('/request-password-code', authtenticatedLimiter, sendVerificationCode);
router.put('/change-password', authtenticatedLimiter, changePasswordWithCode);
router.post('/verify-password', authtenticatedLimiter, verifyCurrentPassword);
router.put('/update-password-direct', authtenticatedLimiter, changePasswordDirect);
router.put('/theme-preference', updateThemePreference);

export default router;
