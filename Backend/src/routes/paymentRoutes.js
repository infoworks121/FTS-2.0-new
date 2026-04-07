const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const adminGatewayController = require('../controllers/adminGatewayController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── ADMIN ROUTES (Super Admin Only) ───
// These routes allow management of the API keys stored in the database.
router.get('/admin/gateways', protect, adminOnly, adminGatewayController.getGateways);
router.put('/admin/gateways/:id', protect, adminOnly, adminGatewayController.updateGateway);

// ─── PAYMENT ROUTES (User Facing) ───
// Razorpay creation and verification
router.post('/razorpay/create-order', protect, paymentController.createRazorpayOrder);
router.post('/razorpay/verify', protect, paymentController.verifyRazorpayPayment);

module.exports = router;
