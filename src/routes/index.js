const express = require('express');
const urlRoutes = require('./urlRoutes');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

router.use('/urls', urlRoutes);


module.exports = router;
