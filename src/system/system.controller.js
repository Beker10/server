import SystemInfo from './system.model.js';

export const getSystemInfo = async (req, res) => {
    try {
        let systemInfo = await SystemInfo.findOne();
        
        // Si no existe, crear uno con valores por defecto
        if (!systemInfo) {
            systemInfo = new SystemInfo();
            await systemInfo.save();
        }

        res.status(200).json({
            success: true,
            systemInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del sistema',
            error: error.message
        });
    }
};

export const updateSystemInfo = async (req, res) => {
    try {
        const userId = req.uid;
        const updateData = req.body;

        let systemInfo = await SystemInfo.findOne();
        
        if (!systemInfo) {
            systemInfo = new SystemInfo({
                ...updateData,
                lastUpdatedBy: userId
            });
        } else {
            Object.assign(systemInfo, updateData);
            systemInfo.lastUpdatedBy = userId;
        }

        await systemInfo.save();

        res.status(200).json({
            success: true,
            message: 'Información del sistema actualizada exitosamente',
            systemInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar información del sistema',
            error: error.message
        });
    }
};
