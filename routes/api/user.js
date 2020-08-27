const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const User = require('../../models/user');
const checkObjectId = require('../../middleware/checkObjectId');

//@route GET api/user/:id
router.get('/:id',
    [
        checkObjectId('id')
    ],
    async (req, res) => {
        const user_id = req.params.id;
        try {
            const user = await User.findById(user_id);
            if (!user) return res.status(404).json({ msg: "User does not exist. Please enter the correct user id", success: false });

            return res.status(200).json({ user: user, success: true });

        } catch (err) {
            res.status(500).json({ msg: err, success: false });
        }
    })

//@route POST api/user
router.post('/',
    [
        check('name').not().notEmpty().withMessage("User Name is required"),
        check('email').not().notEmpty().withMessage("User email is required").isEmail(),
        check('contact').not().notEmpty().withMessage("User Contact is required"),
        check('latitude').not().notEmpty().withMessage("User  locations latitude is required"),
        check('longitude').not().notEmpty().withMessage("User locations longitude is required"),
        check('budget').not().notEmpty().withMessage("User budget is required"),
        check('preferred_time').not().notEmpty().withMessage("User preferred time is required"),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(401).json({ errors: errors.array() });
            }

            const { name, email, password, contact, latitude, longitude, preferred_time, budget } = req.body;

            const user = await User.findOne({ email: email });
            if (user) return res.status(409).json({ msg: "User already exists", success: false });


            const newUser = new User({
                name: name,
                email: email,
                password: password,
                contact: contact,
                location: {
                    type: "Point",
                    coordinates: [latitude, longitude]
                },
                budget: budget,
                preferred_time: Date.parse(new Date(preferred_time))
            });

            await newUser.save();
            const saveduser = await User.findById(newUser._id);
            if (!saveduser) return res.status(412).json({ msg: "User not saved", success: false });

            return res.json({ msg: "User saved", document: saveduser, success: true });
        }
        catch (err) {
            return res.status(500).json({ msg: err, success: false })
        }
    })

//@route DELETE api/user/:id
router.delete('/:id',
    [
        checkObjectId('id')
    ],
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ msg: "User does not exist, Please enter the correct user id!", success: false });


            await user.remove();

            return res.status(200).json({ msg: "User deleted", success: true });
        }
        catch (err) {
            return res.status(500).json({ msg: err, success: false })
        }
    })

module.exports = router;