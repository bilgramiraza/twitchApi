const express = require('express');
const router = express.Router();

const twitchRouter = require('./twitch');

router.use('/twitch', twitchRouter);

module.exports = router;
