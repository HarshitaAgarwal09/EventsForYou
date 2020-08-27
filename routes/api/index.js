const express = require('express');
const router = express.Router();

router.use('/event/forum', require('./forum'));
router.use('/event/interesteduser', require('./interesteduser'));
router.use('/event', require('./event'));
router.use('/user', require('./user'));

module.exports = router;