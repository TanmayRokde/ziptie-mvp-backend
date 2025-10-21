const express = require('express');
const demoController = require('../controllers/demoController');

const router = express.Router();

router.post('/shorten', demoController.shorten);

module.exports = router;
