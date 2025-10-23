const express = require('express');
const shortlinkController = require('../controllers/shortlinkController');
const AuthMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(AuthMiddleware.authenticatePrivateKey);

router.post('/shorten', shortlinkController.createShortUrl);

module.exports = router;
