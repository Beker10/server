import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR', 'TEAM', 'MATCH', 'TOURNAMENT'],
        default: 'INFO'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    read: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String,
        default: null
    },
    relatedId: {
        type: Schema.Types.ObjectId,
        default: null
    },
    relatedModel: {
        type: String,
        enum: ['Team', 'Match', 'Tournament', 'User', 'Post'],
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índice para ordenar por fecha y prioridad
notificationSchema.index({ createdAt: -1, priority: -1 });

export default model('Notification', notificationSchema);
