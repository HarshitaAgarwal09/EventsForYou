const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');

const Event = require('../../models/event');
const Forum = require('../../models/forum');
const checkObjectId = require('../../middleware/checkObjectId');


//@route GET api/event/all
router.get('/all', async (req, res) => {
    try {
        const docs = await Event.find();
        return res.status(200).json({ "events": docs, success: true });
    }
    catch (err) {
        return res.status(500).json({ msg: err, success: false });
    }
})


//@route GET api/event/filter
router.get('/filter',
    [
        check('user_id').not().notEmpty().withMessage("User id is required")
    ],
    async (req, res) => {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(401).json({ errors: errors.array() });
            }

            const { user_id } = req.body;

            const user = await User.findById(user_id);
            if (!user) return res.status(404).json({ msg: "User not found! Please enter the correct user id", success: false });

            const { location, bugdet, preferred_time } = user;

            const docs = await Event.aggregate([
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [location.coordinates[0], location.coordinates[1]]
                        },
                        "distanceField": "distance",
                        "spherical": true,
                        "maxDistance": 10000 //10km
                    },
                },

                {
                    $match: {
                        entry_fee: { $lte: bugdet },
                        start_timestamp: { $lte: new Date(preferred_time) },
                        end_timestamp: { $gte: new Date() }  //current date
                    }
                }
            ]).allowDiskUse(true);

            return res.status(200).json({ events: docs, success: true });
        }
        catch (err) {
            return res.status(500).json({ msg: err, success: false });
        }
    })

//@route GET api/event/:id
router.get('/:id',
    [
        checkObjectId('id')
    ],
    async (req, res) => {
        try {
            const event = await Event.findById(req.params.id);
            if (!event) return res.status(404).json({ msg: "Event not found. Please enter the correct event id", success: false });

            res.status(200).json({ event: event, success: true });

        } catch (err) {
            res.status(400).json({ msg: err, success: false });
        }
    })

//@route POST api/event
router.post('/',
    [
        check('title').not().notEmpty().withMessage("Event titte is required"),
        check('entry_fee').not().notEmpty().isInt().withMessage("Event entry fee is required and should be a number"),
        check('latitude').not().notEmpty().withMessage("Event location latitude is required"),
        check('longitude').not().notEmpty().withMessage("Event location longitude is required"),
        check('user_id').not().notEmpty().withMessage("Event user(organiser) id is required"),
        check('contact').not().notEmpty().isNumeric().withMessage("Event orgnaiser contact is required"),
        check('start_time').not().notEmpty().withMessage("Event start time is required").isString(),
        check('end_time').not().notEmpty().withMessage("Event end time is required").isString(),
        check('start_date').not().notEmpty().withMessage("Event start date is required").isString(),
        check('end_date').not().notEmpty().withMessage("Event end date is required").isString(),
    ],
    async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(401).json({ errors: errors.array() });
            }

            const { title, description, type, entry_fee, user_id, contact, start_time, end_time, prize, latitude, longitude, start_date, end_date } = req.body;

            //converting date and time to date format
            const start_datetime = new Date(start_date + " " + start_time);
            const end_datetime = new Date(end_date + " " + end_time);

            //coverting time to minutes
            const daily_start_time = Number(start_time.slice(0, 2)) * 60 + Number(start_time.slice(3));
            const daily_end_time = Number(end_time.slice(0, 2)) * 60 + Number(end_time.slice(3));

            const newEvent = await new Event({
                title: title,
                description: description,
                type: type,
                entry_fee: entry_fee,
                organiser_id: user_id,
                organiser_contact: contact,
                daily_start_time: daily_end_time,
                daily_end_time: daily_end_time,
                prize: prize,
                start_timestamp: start_datetime,
                end_timestamp: end_datetime,
                location: {
                    type: "Point",
                    coordinates: [latitude, longitude]
                }
            });


            //Forum creation
            const newForum = await new Forum({
                event_id: newEvent._id
            })
            await newForum.save();
            const forum = await Forum.findById(newForum._id);
            if (!forum) return res.status(412).json({ msg: "Forum not saved", status: false });

            newEvent.forum_id = forum._id;

            await newEvent.save();
            const event = await Event.findById(newEvent._id);
            if (!event) return res.status(412).json({ msg: "Event not saved", status: false });

            return res.status(200).json({ msg: "Event saved", document: event, status: true });
        }
        catch (err) {
            console.log(err)
            return res.status(500).json({ msg: err, status: false })
        }

    })

//@route DELETE api/event/:id
router.delete('/:id',
    [
        checkObjectId('id')
    ],
    async (req, res) => {
        try {
            const event = await Event.findById(req.params.id);
            if (!event) return res.status(404).json({ msg: "Event does not exist, Please enter the correct event id!", success: false });

            const forum = await Forum.findById(event.forum_id);
            if (!forum) return res.status(404).json({ msg: "Forum does not exist", success: false });

            await Comment.deleteMany({ forum_id: forum._id });

            await forum.remove();
            await event.remove();

            return res.status(200).json({ msg: "Event deleted!", success: true });
        }
        catch (err) {
            return res.status(500).json({ msg: err, success: false })
        }
    })

module.exports = router;