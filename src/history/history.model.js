import { Schema, model } from 'mongoose';

const historySchema = new Schema({
    year: {
        type: Number,
        required: true,
        unique: true
    },
    champion: {
        name: String,
        logo: String,
        photo: String
    },
    topScorer: {
        name: String,
        team: String,
        goals: Number
    },
    mvp: {
        name: String,
        team: String
    },
    bestGoalkeeper: {
        name: String,
        team: String
    },
    finalMatch: {
        winnerScore: Number,
        loserScore: Number,
        goalScorers: [String],
        details: String
    },
    finalStandings: [{
        team: String,
        pts: Number,
        dg: Number
    }]
}, {
    timestamps: true,
    versionKey: false
});

export default model('History', historySchema);
