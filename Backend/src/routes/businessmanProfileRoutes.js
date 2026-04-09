const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getBusinessmanProfile,
  updateBusinessmanProfile,
  getBusinessmanDashboard,
  payBusinessmanInvestment
} = require('../controllers/businessmanProfileController');

router.get('/profile', protect, getBusinessmanProfile);
router.put('/profile', protect, updateBusinessmanProfile);
router.get('/dashboard', protect, getBusinessmanDashboard);
router.post('/investment/pay', protect, payBusinessmanInvestment);

module.exports = router;