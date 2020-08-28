const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    forum_id: {
        type: Schema.Types.ObjectId,
        required: true
    },

    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    createdOn: {
        type: Date,
        default: Date.now
    }
})

module.exports = Comment = mongoose.model("Comment", CommentSchema);