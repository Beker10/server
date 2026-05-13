import { Schema, model } from 'mongoose';

const teamMembershipSchema = new Schema({
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['MEMBER', 'ADMIN'],
        default: 'MEMBER',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Compound index to prevent duplicate memberships
teamMembershipSchema.index({ team: 1, user: 1 }, { unique: true });

export default model('TeamMembership', teamMembershipSchema);
