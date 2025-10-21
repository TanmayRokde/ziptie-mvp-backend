const express = require('express');
const urlRoutes = require('./urlRoutes');
const apiKeysRoutes = require('./apiKeysRoutes');
const shortlinkRoutes = require('./shortlinkRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const domainRoutes = require('./domainRoutes');
const demoRoutes = require('./demoRoutes');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/domains', domainRoutes);
router.use('/urls', urlRoutes);
router.use('/keys', apiKeysRoutes);
router.use('/shortlink', shortlinkRoutes);
router.use('/demo', demoRoutes);
module.exports = router;
