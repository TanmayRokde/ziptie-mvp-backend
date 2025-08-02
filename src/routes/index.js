const express = require('express');
const urlRoutes = require('./urlRoutes');
const apiKeysRoutes = require('./apiKeysRoutes')
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

router.use('/urls', urlRoutes);
router.use('/keys', apiKeysRoutes)

module.exports = router;
