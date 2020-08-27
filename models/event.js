const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationPoint = require('./locationPoint');

const EventSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    type: {
        type: String
    },

    description: {
        type: String
    },

    entry_fee: {
        type: Number,
        required: true
    },

    location: {
        type: locationPoint,
        required: true
    },

    organiser_id: {
        type: Schema.Types.ObjectId,
        ref: 'organiser',
        required: true
    },

    organiser_contact: {
        type: String,
        required: true
    },

    start_timestamp: {
        type: Date,
        required: true
    },

    end_timestamp: {
        type: Date,
        required: true
    },

    daily_start_time: {
        type: Number,
        required: true
    },

    daily_end_time: {
        type: Number,
        required: true
    },

    prize: {
        type: String
    },

    interested_users: [
        {
            user_id: {
                type: Schema.Types.ObjectId
            },
        }
    ],

    forum_id: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

EventSchema.index({ "location": "2dsphere" });
module.exports = Event = mongoose.model("Event", EventSchema);