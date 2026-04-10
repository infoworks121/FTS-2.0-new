const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDealerProfile,
  updateDealerProfile,
  getDealerDashboard,
  assignProductToDealer,
  unassignProductFromDealer,
  getDealerAssignedProducts,
  getMyAuthorizedProducts,
  getDealerInsights,
  getDealerInventoryLedger
} = require('../controllers/dealerProfileController');
const { adminOnly } = require('../middleware/authMiddleware');

router.get('/profile', protect, getDealerProfile);
router.put('/profile', protect, updateDealerProfile);
router.get('/dashboard', protect, getDealerDashboard);
router.get('/my-products', protect, getMyAuthorizedProducts);
router.get('/insights', protect, getDealerInsights);
router.get('/inventory-ledger', protect, getDealerInventoryLedger);

// Admin mapping operations
router.post('/assign-product', protect, adminOnly, assignProductToDealer);
router.post('/unassign-product', protect, adminOnly, unassignProductFromDealer);
router.get('/:id/products', protect, getDealerAssignedProducts);

module.exports = router;