export const handleErrors = (err, req, res, next) => {
    console.error('--- INTERNAL ERROR ---');
    console.error(err);
    console.error('-----------------------');

    if(err.status === 400 && err.errors){
        return res.status(400).json({
            success: false,
            errors: err.errors
        })
    }
    
    // Cloudinary or Multer Error
    if (err.message && (err.message.includes('Cloudinary') || err.name === 'MulterError')) {
        return res.status(500).json({
            success: false,
            msg: "Error en la subida de archivos (Cloudinary/Multer)",
            error: err.message
        });
    }

    return res.status(500).json({
        success: false,
        msg: "Error interno del servidor",
        error: err.message
    })
}