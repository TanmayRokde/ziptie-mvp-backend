const express = require('express');
const shortlinkController = require('../controllers/shortlinkController');
const AuthMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/shorten',AuthMiddleware.authenticatePrivateKey, shortlinkController.createShortUrl);
router.post('/resolve', shortlinkController.resolveShortUrl)
module.exports = router;
