import { Schema, model } from 'mongoose';

const ruleSchema = new Schema({
    title: {
        type: String,
        required: [true, 'El título es obligatorio'],
        default: 'Reglamento del Torneo'
    },
    content: {
        type: String,
        required: [true, 'El contenido es obligatorio']
    },
    version: {
        type: String,
        default: '1.0'
    },
    lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    sections: [{
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Solo debe haber un reglamento activo
ruleSchema.index({ isActive: 1 });

export default model('Rule', ruleSchema);
