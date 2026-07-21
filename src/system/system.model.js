import { Schema, model } from 'mongoose';

const systemInfoSchema = new Schema({
    projectName: {
        type: String,
        required: [true, 'El nombre del proyecto es obligatorio'],
        default: 'Sistema de Gestión Deportiva'
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        default: 'Plataforma completa para la gestión de torneos y equipos deportivos'
    },
    version: {
        type: String,
        default: '1.0.0'
    },
    contactEmail: {
        type: String,
        default: 'contacto@sistema.com'
    },
    contactPhone: {
        type: String,
        default: ''
    },
    socialMedia: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' }
    },
    features: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String, default: '⚡' }
    }],
    team: [{
        name: { type: String, required: true },
        role: { type: String, required: true },
        photo: { type: String, default: '' }
    }],
    lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    versionKey: false
});

// Solo debe haber un registro de información del sistema
systemInfoSchema.index({ _id: 1 });

export default model('SystemInfo', systemInfoSchema);
