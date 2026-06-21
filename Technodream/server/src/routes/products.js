const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', productController.getAll);
router.get('/brands', productController.getBrands);
router.get('/:id', productController.getById);
router.post('/', authenticate, requireAdmin, upload.single('image'), productController.create);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), productController.update);
router.delete('/:id', authenticate, requireAdmin, productController.remove);

module.exports = router;