const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, orderController.create);
router.get('/my', authenticate, orderController.getMyOrders);
router.get('/', authenticate, requireAdmin, orderController.getAll);
router.get('/:id', authenticate, orderController.getById);
router.patch('/:id', authenticate, requireAdmin, orderController.updateStatus);

module.exports = router;