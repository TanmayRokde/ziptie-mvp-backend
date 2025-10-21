const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authToken');

const router = express.Router();

router.get('/me', authenticate, userController.profile);

module.exports = router;
