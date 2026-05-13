import fs from 'fs/promises';
import { deleteImageFromCloudinary } from '../helpers/delete-cloudinary-image.js';

export const deleteFileOnError = async (err, req, res, next) => {
    if (!err) return next();

    try {
        if (req.file && req.file.path) {
            if (req.file.path.startsWith('http')) {
                await deleteImageFromCloudinary(req.file.path);
            } else {
                await fs.unlink(req.file.path);
            }
        }
    } catch (error) {
        console.error('Error al eliminar la imagen: ', error.message);
    }

    return next(err);
};