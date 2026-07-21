import { Schema, model } from 'mongoose';

const matchSchema = new Schema({
    teamA: {
        type: String,
        required: [true, 'El equipo local es obligatorio']
    },
    teamB: {
        type: String,
        required: [true, 'El equipo visitante es obligatorio']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es obligatoria']
    },
    time: {
        type: String,
        required: [true, 'La hora es obligatoria']
    },
    location: {
        type: String,
        default: 'Campo Central'
    },
    status: {
        type: String,
        enum: ['Próximamente', 'En juego', 'Finalizado', 'Aplazado'],
        default: 'Próximamente'
    },
    scoreA: {
        type: Number,
        default: null
    },
    scoreB: {
        type: Number,
        default: null
    },
    phase: {
        type: String,
        enum: ['Fase de Grupos', 'Octavos', 'Cuartos', 'Semifinales', 'Final'],
        default: 'Fase de Grupos'
    },
    tournament: {
        type: Schema.Types.ObjectId,
        ref: 'Tournament'
    },
    cards: [{
        player: { type: String, required: true },
        team: { type: String, required: true },
        type: { type: String, enum: ['Yellow', 'Red'], required: true },
        minute: { type: Number, required: true }
    }],
    scorers: [{
        player: { type: String, required: true },
        team: { type: String, required: true },
        minute: { type: Number, required: true },
        isOwnGoal: { type: Boolean, default: false },
        isPenalty: { type: Boolean, default: false }
    }],
    mvp: {
        type: String,
        default: null
    },
    excitementLevel: {
        type: String,
        enum: ['Bajo', 'Medio', 'Alto', 'Épico'],
        default: 'Bajo'
    },
    comments: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        username: String,
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        isModerated: { type: Boolean, default: false }
    }],
    reactions: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: String // e.g., '🔥', '👏', '⚽'
    }],
    votes: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        playerName: String
    }]
}, {
    timestamps: true,
    versionKey: false
});

export default model('Match', matchSchema);
