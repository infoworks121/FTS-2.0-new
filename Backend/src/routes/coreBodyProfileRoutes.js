const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCoreBodyProfile,
  updateCoreBodyProfile,
  getCoreBodyDashboard,
  payInstallment
} = require('../controllers/coreBodyProfileController');

// Core Body profile routes
router.get('/profile', protect, getCoreBodyProfile);
router.put('/profile', protect, updateCoreBodyProfile);
router.get('/dashboard', protect, getCoreBodyDashboard);
router.post('/installment/pay', protect, payInstallment);

module.exports = router;