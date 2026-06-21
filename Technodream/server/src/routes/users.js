const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.put('/me', authenticate, userController.updateProfile);
router.get('/', authenticate, requireAdmin, userController.getAll);

module.exports = router;