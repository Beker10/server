import { Schema, model } from "mongoose";

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    reactions: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: String
    }]
}, {
    timestamps: true,
    versionKey: false
})

export default model('Post', postSchema)