const express = require('express');
const router = express.Router();

const Event = require('../../models/event');
const User = require('../../models/user');

//@router POST /api/event/interesteduser
router.post('/', async (req, res) => {
    const { event_id, user_id } = req.body;
    try {
        const event = await Event.findById(event_id);
        if (!event) throw Error("event not found");

        const user = await User.findById(user_id);
        if (!user) throw Error("user not found");

        const list = event.interested_users
        list.forEach(user => {
            if (user_id == user.user_id) {
                throw Error("User already interested!");
            }
        })

        event.interested_users.push({ user_id: user_id });
        await event.save();

        return res.status(200).json({ msg: "user added to list!", document: event.interested_users })
    }
    catch (err) {
        return res.status(500).json({ msg: err.message });
    }
})

module.exports = router