const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.get('/stats', authenticate, requireAdmin, adminController.getStats);

module.exports = router;