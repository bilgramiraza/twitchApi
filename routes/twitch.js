const express = require('express');
const router = express.Router();

const twitchController = require('../controllers/twitchController');
const { authMiddleware, twitchValidation } = require('../middlewares/validation');

router.use(authMiddleware);

/*twitchS API Routes*/
router.get('/', twitchValidation, twitchController.);

module.exports = router;
