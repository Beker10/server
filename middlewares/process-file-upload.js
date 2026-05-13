export const processFileUpload = (req, res, next) => {
    if (req.file) {
        // Si usamos Cloudinary, req.file.path ya es la URL completa
        // Si usamos diskStorage, construimos una ruta relativa
        if (req.file.path && req.file.path.startsWith('http')) {
            req.fileRelativePath = req.file.path;
        } else if (req.file.destination) {
            const { destination, filename } = req.file;
            const pathParts = destination.split(/[/\\]/);
            const infoFolder = pathParts.pop();
            req.fileRelativePath = `${infoFolder}/${filename}`;
        }
    }
    next();
};