const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ForumSchema = new Schema({
    event_id: {
        type: Schema.Types.ObjectId
    },

    createdOn: {
        type: Date,
        default: Date.now
    }
})

module.exports = Forum = mongoose.model("Forum", ForumSchema);