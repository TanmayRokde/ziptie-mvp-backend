const express = require('express');
const urlController = require('../controllers/urlController');
// const AuthMiddleware = require('../middleware/auth')
const router = express.Router();

// router.use(AuthMiddleware.authenticatePrivateKey);

router.get('/shorten', urlController.testRoute);

module.exports = router;