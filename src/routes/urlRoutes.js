const express = require('express');
const urlController = require('../controllers/urlController');

const router = express.Router();

router.get('/test', (req, res) => {
  urlController.testRoute(req, res);
});

module.exports = router;