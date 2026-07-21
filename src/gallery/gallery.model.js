import { Schema, model } from 'mongoose';

const gallerySchema = new Schema({
    title: {
        type: String,
        required: [true, 'El título es obligatorio']
    },
    description: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        required: [true, 'La imagen es obligatoria']
    },
    matchDay: {
        type: Number,
        default: 1
    },
    matchId: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        default: null
    },
    tournament: {
        type: Schema.Types.ObjectId,
        ref: 'Tournament',
        default: null
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

gallerySchema.index({ matchDay: 1, createdAt: -1 });
gallerySchema.index({ tournament: 1 });

export default model('Gallery', gallerySchema);
