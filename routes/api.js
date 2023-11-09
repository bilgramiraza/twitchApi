const express = require('express');
const router = express.Router();

router.use('/:streamerName', (req, res)=>{
  res.send(`NOT IMPLEMENTED: api/${req.params.streamerName} Route`);
});

module.exports = router;
