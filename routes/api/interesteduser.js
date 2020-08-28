const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

const Event = require('../../models/event');
const User = require('../../models/user');


//@router POST /api/event/interesteduser
router.post('/',
    [
        check('user_id').not().notEmpty().withMessage("Event user(organiser) id is required"),
        check('event_id').not().notEmpty().withMessage("Event event id is required")
    ],
    async (req, res) => {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(401).json({ errors: errors.array() });
            }

            const { event_id, user_id } = req.body;

            const event = await Event.findById(event_id);
            if (!event) return res.status(404).json({ msg: "event not found", success: false });

            const user = await User.findById(user_id);
            if (!user) return res.status(404).json({ msg: "user not found", success: false });

            const list = event.interested_users
            await list.forEach(user => {
                if (user_id == user.user_id) {
                    return res.status(409).json({ msg: "user already interested", success: false });
                }
            })

            event.interested_users.push({ user_id: user_id });
            await event.save();

            return res.status(200).json({ msg: "user added to list!", success: true })
        }
        catch (err) {
            return res.status(500).json({ msg: err.message, success: false });
        }
    })

//@router POST /api/event/interesteduser
router.get('/',
    [
        check('event_id').not().notEmpty().withMessage("Event event id is required")
    ],
    async (req, res) => {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(401).json({ errors: errors.array() });
            }

            const { event_id } = req.body;

            const event = await Event.findById(event_id);
            if (!event) return res.status(404).json({ msg: "event not found", success: false });


            const docs = event.interested_users;
            const result = [];

            for (let i = 0; i < docs.length; i++) {
                const interested_user = await User.findById(docs[i].user_id);

                const user_detail = {
                    user_id: interested_user._id,
                    name: interested_user.name,
                    email: interested_user.email,
                    contact: interested_user.contact
                }
                result.push(user_detail);
            }

            return res.status(200).json({ document: result, success: true })
        }
        catch (err) {
            return res.status(500).json({ msg: err.message, success: false });
        }
    })

module.exports = router