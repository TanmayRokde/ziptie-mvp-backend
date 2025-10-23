const express = require('express');
const apiKeysController = require('../controllers/apiKeysController');
const { authenticate } = require('../middleware/authToken');

const router = express.Router();

router.get('/generate', authenticate, apiKeysController.generateKey);

module.exports = router;