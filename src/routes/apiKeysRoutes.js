const express = require('express');
const apiKeysController = require('../controllers/apiKeysController');

const router = express.Router();

router.get('/generate', apiKeysController.generateKey);

module.exports = router;