import Notification from './notification.model.js';

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.uid; // From validateJWT
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1, priority: -1 })
            .limit(50);
        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener notificaciones',
            error: error.message
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al marcar como leída',
            error: error.message
        });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.uid;
        await Notification.updateMany(
            { user: userId, read: false },
            { read: true }
        );
        res.status(200).json({
            success: true,
            message: 'Todas las notificaciones marcadas como leídas'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al marcar todas como leídas',
            error: error.message
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.uid;
        const count = await Notification.countDocuments({ user: userId, read: false });
        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener contador de no leídas',
            error: error.message
        });
    }
};

// Helper functions for other controllers to create notifications automatically

export const createNotification = async (userId, message, type = 'INFO', priority = 'MEDIUM', options = {}) => {
    try {
        const notification = new Notification({
            user: userId,
            message,
            type,
            priority,
            actionUrl: options.actionUrl || null,
            relatedId: options.relatedId || null,
            relatedModel: options.relatedModel || null
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error al crear notificación:', error);
    }
};

// Specific notification helpers
export const notifyTeamCreated = async (userId, teamName, teamId) => {
    return await createNotification(
        userId,
        `¡Tu equipo "${teamName}" ha sido creado exitosamente!`,
        'TEAM',
        'HIGH',
        { actionUrl: `/equipos/${teamId}`, relatedId: teamId, relatedModel: 'Team' }
    );
};

export const notifyMatchScheduled = async (userId, teamA, teamB, matchId) => {
    return await createNotification(
        userId,
        `Partido programado: ${teamA} vs ${teamB}`,
        'MATCH',
        'MEDIUM',
        { actionUrl: `/calendario`, relatedId: matchId, relatedModel: 'Match' }
    );
};

export const notifyMatchResult = async (userId, teamA, teamB, scoreA, scoreB, matchId) => {
    return await createNotification(
        userId,
        `Resultado final: ${teamA} ${scoreA} - ${scoreB} ${teamB}`,
        'MATCH',
        'HIGH',
        { actionUrl: `/calendario`, relatedId: matchId, relatedModel: 'Match' }
    );
};

export const notifyTournamentStarted = async (userId, tournamentName, tournamentId) => {
    return await createNotification(
        userId,
        `¡El torneo "${tournamentName}" ha comenzado!`,
        'TOURNAMENT',
        'URGENT',
        { actionUrl: `/torneos/${tournamentId}`, relatedId: tournamentId, relatedModel: 'Tournament' }
    );
};

export const notifyPlayerAdded = async (userId, playerName, teamId) => {
    return await createNotification(
        userId,
        `Jugador "${playerName}" agregado a tu equipo`,
        'TEAM',
        'LOW',
        { actionUrl: `/equipos/${teamId}`, relatedId: teamId, relatedModel: 'Team' }
    );
};
