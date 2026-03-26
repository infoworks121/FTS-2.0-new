const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Base Route: /api/orders

// Place a B2B order
router.post('/b2b', protect, orderController.createB2BOrder);

module.exports = router;
