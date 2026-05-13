import { Schema, model } from 'mongoose';

const teamSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del equipo es obligatorio'],
        maxLength: [50, 'El nombre no puede exceder los 50 caracteres'],
        trim: true
    },
    description: {
        type: String,
        maxLength: [200, 'La descripción no puede exceder los 200 caracteres'],
        trim: true
    },
    logo: {
        type: String,
        default: ''
    },
    secondaryAdmins: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    players: [{
        name: { type: String, required: true },
        number: { type: String, default: '--' },
        position: { type: String, required: true, default: 'Delantero' },
        photo: { type: String, required: true }, // Base64 or URL
        goals: { type: Number, default: 0 },
        goalsAgainst: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        isSuspended: { type: Boolean, default: false },
        mvpCount: { type: Number, default: 0 },
        awards: { type: [String], default: [] }
    }],
    pts: { type: Number, default: 0 },
    jj: { type: Number, default: 0 },
    pg: { type: Number, default: 0 },
    pe: { type: Number, default: 0 },
    pp: { type: Number, default: 0 },
    gf: { type: Number, default: 0 },
    gc: { type: Number, default: 0 },
    dg: { type: Number, default: 0 },
    currentStage: {
        type: String,
        enum: ['Fase de Grupos', 'Octavos', 'Cuartos', 'Semifinales', 'Finales', 'Campeón'],
        default: 'Fase de Grupos'
    },
    tournament: {
        type: Schema.Types.ObjectId,
        ref: 'Tournament'
    }
}, {
    timestamps: true,
    versionKey: false
});

teamSchema.methods.toJSON = function () {
    const { _id, ...team } = this.toObject();
    return { uid: _id, ...team };
}

export default model('Team', teamSchema);
