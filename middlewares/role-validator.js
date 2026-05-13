import User from '../src/users/user.model.js';

export const isAdmin = async (req, res, next) => {
    try {
        const { uid } = req;
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        if (user.role !== 'ADMIN_ROLE') {
            return res.status(401).json({
                message: 'No tienes permisos de administrador (Profesor)'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error al validar el rol del usuario',
            error: error.message
        });
    }
};
