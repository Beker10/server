import Rule from './rule.model.js';

export const getActiveRule = async (req, res) => {
    try {
        const rule = await Rule.findOne({ isActive: true }).populate('lastUpdatedBy', 'username name');
        
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'No hay reglamento activo'
            });
        }

        res.status(200).json({
            success: true,
            rule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reglamento',
            error: error.message
        });
    }
};

export const getAllRules = async (req, res) => {
    try {
        const rules = await Rule.find().populate('lastUpdatedBy', 'username name').sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            rules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reglamentos',
            error: error.message
        });
    }
};

export const createRule = async (req, res) => {
    try {
        const { title, content, sections } = req.body;
        const userId = req.uid;

        // Desactivar reglamentos anteriores
        await Rule.updateMany({ isActive: true }, { isActive: false });

        const newRule = new Rule({
            title,
            content,
            sections,
            lastUpdatedBy: userId,
            isActive: true
        });

        await newRule.save();

        res.status(201).json({
            success: true,
            message: 'Reglamento creado exitosamente',
            rule: newRule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear reglamento',
            error: error.message
        });
    }
};

export const updateRule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, sections } = req.body;
        const userId = req.uid;

        const rule = await Rule.findByIdAndUpdate(
            id,
            {
                title,
                content,
                sections,
                lastUpdatedBy: userId
            },
            { new: true }
        );

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Reglamento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reglamento actualizado exitosamente',
            rule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar reglamento',
            error: error.message
        });
    }
};

export const activateRule = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.uid;

        // Desactivar todos los reglamentos
        await Rule.updateMany({ isActive: true }, { isActive: false });

        // Activar el reglamento seleccionado
        const rule = await Rule.findByIdAndUpdate(
            id,
            { 
                isActive: true,
                lastUpdatedBy: userId
            },
            { new: true }
        );

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Reglamento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reglamento activado exitosamente',
            rule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al activar reglamento',
            error: error.message
        });
    }
};

export const deleteRule = async (req, res) => {
    try {
        const { id } = req.params;

        const rule = await Rule.findByIdAndDelete(id);

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Reglamento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reglamento eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar reglamento',
            error: error.message
        });
    }
};
