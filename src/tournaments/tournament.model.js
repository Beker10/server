import { Schema, model } from 'mongoose';

const tournamentSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    status: {
        type: String,
        enum: ['Activo', 'Finalizado'],
        default: 'Activo'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Tournament', tournamentSchema);
