const express = require('express');
const router = express.Router();
const stockAllocationController = require('../controllers/stockAllocationController');
const { protect } = require('../middleware/authMiddleware');

// Core Body: Send Physical Stock to Dealer
router.post('/transfer', protect, stockAllocationController.createPhysicalTransfer);

// Admin: Direct a Core Body to dispatch stock to a Dealer
router.post('/admin/direct-dispatch', protect, stockAllocationController.requestDirectedDispatch);

// Core Body: Get requests directed by Admin
router.get('/directed-requests', protect, stockAllocationController.getDirectedRequests);

// Dealer: List Pending Arrivals
router.get('/pending-arrivals', protect, stockAllocationController.getDealerPendingArrivals);

// Dealer: Confirm Receipt
router.put('/receive/:allocation_id', protect, stockAllocationController.receivePhysicalTransfer);

module.exports = router;
