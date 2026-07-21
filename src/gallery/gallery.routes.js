import { Router } from 'express';
import { getAllGallery, getGalleryById, createGalleryImage, updateGalleryImage, deleteGalleryImage, getMatchDays } from './gallery.controller.js';
import { validateJWT } from '../../middlewares/jwt-verify.js';
import { uploadGalleryImage } from '../../middlewares/file-uploader.js';
import { processFileUpload } from '../../middlewares/process-file-upload.js';

const router = Router();

// Ruta pública para ver galería
router.get('/', getAllGallery);
router.get('/match-days', getMatchDays);
router.get('/:id', getGalleryById);

// Rutas protegidas para administración
router.use(validateJWT);

router.post('/', [uploadGalleryImage.single('image'), processFileUpload], createGalleryImage);
router.put('/:id', updateGalleryImage);
router.delete('/:id', deleteGalleryImage);

export default router;
