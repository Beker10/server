import { validationResult } from 'express-validator'

export const validarCampos = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        if (req.file && req.file.path) {
            try {
                // Solo eliminamos localmente si no es una URL de Cloudinary
                if (!req.file.path.startsWith('http')) {
                    const fs = await import('fs/promises');
                    await fs.unlink(req.file.path);
                }
            } catch (e) {
                console.error("Error deleting file after validation failure:", e);
            }
        }
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next()
}
