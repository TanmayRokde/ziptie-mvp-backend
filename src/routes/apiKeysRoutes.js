const express = require('express');
const apiKeysController = require('../controllers/apiKeysController');

const router = express.Router();

router.post('/generate', apiKeysController.generateKey);

module.exports = router;