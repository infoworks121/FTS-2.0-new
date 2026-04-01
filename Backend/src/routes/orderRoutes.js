const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Base Route: /api/orders

// Place a B2B order
router.post('/b2b', protect, orderController.createB2BOrder);

// Place a B2C order
router.post('/b2c', protect, orderController.createB2COrder);

// Get my orders
router.get('/', protect, orderController.getMyOrders);

// Get order details
router.get('/:id', protect, orderController.getOrderDetails);

module.exports = router;
