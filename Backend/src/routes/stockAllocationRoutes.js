const express = require('express');
const router = express.Router();
const stockAllocationController = require('../controllers/stockAllocationController');
const { protect } = require('../middleware/authMiddleware');

// Core Body: Send Physical Stock to Dealer
router.post('/transfer', protect, stockAllocationController.createPhysicalTransfer);

// Dealer: List Pending Arrivals
router.get('/pending-arrivals', protect, stockAllocationController.getDealerPendingArrivals);

// Dealer: Confirm Receipt
router.put('/receive/:allocation_id', protect, stockAllocationController.receivePhysicalTransfer);

module.exports = router;
