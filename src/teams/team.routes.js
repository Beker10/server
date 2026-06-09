import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../../middlewares/jwt-verify.js';
import { validarCampos } from '../../middlewares/validate-values.js';
import { createTeam, updateTeam, getMyTeams, addMember, changeRole, deleteTeam, getTeamMembers, removeMember, getTeams, advanceTeams, getAdvancedStats, getPlayerCard, toggleAward, playerPhotoUpload, addPlayer } from './team.controller.js';
import { isAdminOfTeam } from '../../middlewares/team-validator.js';
import { isAdmin } from '../../middlewares/role-validator.js';
import { uploadTeamLogo, uploadPlayerPhoto } from '../../middlewares/file-uploader.js';
import { processFileUpload } from '../../middlewares/process-file-upload.js';
import { apiLimiter, authtenticatedLimiter, publicLimiter } from '../../middlewares/request-limit.js';

const router = Router();


// Routes
router.post('/', [
    uploadTeamLogo.single('logo'),
    processFileUpload,
    validateJWT,
    authtenticatedLimiter,
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], createTeam);

router.get('/', [
    validateJWT
], getMyTeams);

router.get('/public', apiLimiter, getTeams);
router.get('/stats', apiLimiter, getAdvancedStats);
router.get('/player-card/:playerName', apiLimiter, getPlayerCard);
router.post('/player-photo', [
    uploadPlayerPhoto.single('photo'), 
    processFileUpload,
    validateJWT
], playerPhotoUpload);

// Awards (Admin or Global Admin)
router.post('/player/award', [validateJWT, isAdmin], toggleAward);

// Add a single player to a team
router.post('/:teamId/players', [
    validateJWT,
    authtenticatedLimiter,
    isAdminOfTeam,
    check('name', 'El nombre del jugador es obligatorio').not().isEmpty(),
    validarCampos
], addPlayer);

// Only Global Admins can advance tournament stages
router.post('/advance', [
    publicLimiter,
    validateJWT,
    isAdmin
], advanceTeams);

router.post('/:teamId/members', [
    validateJWT,
    authtenticatedLimiter,
    isAdminOfTeam,
    check('userId', 'ID de usuario inválido').isMongoId(),
    validarCampos
], addMember);

router.put('/:teamId/members/:memberId/role', [
    validateJWT,
    isAdminOfTeam,
    check('newRole', 'El rol es obligatorio').not().isEmpty(),
    validarCampos
], changeRole);

router.put('/:teamId', [
    uploadTeamLogo.single('logo'),
    processFileUpload,
    validateJWT,
    isAdminOfTeam
], updateTeam);

router.delete('/:teamId', [
    validateJWT,
    isAdminOfTeam
], deleteTeam);

router.get('/:teamId/members', [
    validateJWT
    // Optional: Check if user belongs to team, but usually members are public or restricted. 
    // For simplicity, allowed for auth users.
], getTeamMembers);

router.delete('/:teamId/members/:memberId', [
    validateJWT,
    isAdminOfTeam
], removeMember);

export default router;
