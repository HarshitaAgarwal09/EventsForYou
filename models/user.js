const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationPoint = require('./locationPoint');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        // required: true,
    },

    contact: {
        type: Number,
        required: true
    },

    location: {
        type: locationPoint,
        required: true
    },

    preferred_time: {
        type: Date,
        required: true
    },

    budget: {
        type: Number,
        required: true
    },

    createdOn: {
        type: Date,
        default: Date.now
    }
})

UserSchema.index({ "location": "2dsphere" });
module.exports = User = mongoose.model("User", UserSchema);