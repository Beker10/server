import Notification from './notification.model.js';

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.uid; // From validateJWT
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener notificaciones',
            error: error.message
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({
            message: 'Error al marcar como leída',
            error: error.message
        });
    }
};

// Helper for other controllers to create notifications
export const createNotification = async (userId, message, type = 'INFO') => {
    const notification = new Notification({
        user: userId,
        message,
        type
    });
    await notification.save();
};
