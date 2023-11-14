const express = require('express');
const router = express.Router();
const { streamInfoRoute } = require('../controllers/streamInfoController');

router.use('/:streamerName', streamInfoRoute);

module.exports = router;
