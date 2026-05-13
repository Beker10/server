import TeamMembership from '../src/teams/team-membership.model.js';
import User from '../src/users/user.model.js';

// Middleware to check if user is admin of the team OR a global Platform Admin
export const isAdminOfTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const userId = req.uid;

        // 1. Check if user is a Global Admin (Platform level)
        const user = await User.findById(userId);
        if (user && user.role === 'ADMIN_ROLE') {
            return next(); // Grant access immediately
        }

        // 2. Check if user is an Admin of this specific Team
        const membership = await TeamMembership.findOne({ team: teamId, user: userId });

        if (!membership || membership.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                msg: 'No tienes permisos de administrador en este equipo'
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: 'Error de validación de permisos' });
    }
};
