import Gallery from './gallery.model.js';

export const getAllGallery = async (req, res) => {
    try {
        const { matchDay, tournament, featured } = req.query;
        
        const filter = {};
        if (matchDay) filter.matchDay = parseInt(matchDay);
        if (tournament) filter.tournament = tournament;
        if (featured === 'true') filter.isFeatured = true;

        const images = await Gallery.find(filter)
            .populate('uploadedBy', 'username name profilePicture')
            .populate('matchId', 'teamA teamB date')
            .populate('tournament', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            images
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener galería',
            error: error.message
        });
    }
};

export const getGalleryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const image = await Gallery.findById(id)
            .populate('uploadedBy', 'username name profilePicture')
            .populate('matchId', 'teamA teamB date')
            .populate('tournament', 'name');

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Imagen no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            image
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener imagen',
            error: error.message
        });
    }
};

export const createGalleryImage = async (req, res) => {
    try {
        const { title, description, matchDay, matchId, tournament, tags, isFeatured } = req.body;
        const userId = req.uid;
        const imageUrl = req.fileRelativePath;

        const newImage = new Gallery({
            title,
            description,
            imageUrl,
            matchDay: matchDay || 1,
            matchId,
            tournament,
            uploadedBy: userId,
            tags: tags || [],
            isFeatured: isFeatured || false
        });

        await newImage.save();

        res.status(201).json({
            success: true,
            message: 'Imagen agregada a la galería exitosamente',
            image: newImage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al agregar imagen a la galería',
            error: error.message
        });
    }
};

export const updateGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, matchDay, tags, isFeatured } = req.body;

        const image = await Gallery.findByIdAndUpdate(
            id,
            { title, description, matchDay, tags, isFeatured },
            { new: true }
        );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Imagen no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Imagen actualizada exitosamente',
            image
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar imagen',
            error: error.message
        });
    }
};

export const deleteGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;

        const image = await Gallery.findByIdAndDelete(id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Imagen no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Imagen eliminada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar imagen',
            error: error.message
        });
    }
};

export const getMatchDays = async (req, res) => {
    try {
        const { tournament } = req.query;
        
        const filter = tournament ? { tournament } : {};
        
        const matchDays = await Gallery.distinct('matchDay', filter);
        
        res.status(200).json({
            success: true,
            matchDays: matchDays.sort((a, b) => a - b)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener jornadas',
            error: error.message
        });
    }
};
