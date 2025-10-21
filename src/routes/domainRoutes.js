const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authToken');

const router = express.Router();

router.use(authenticate);

router.get('/', userController.listDomains);
router.post('/', userController.upsertDomain);
router.put('/:id', (req, res, next) => {
  req.body.id = req.params.id;
  return userController.upsertDomain(req, res, next);
});

module.exports = router;
