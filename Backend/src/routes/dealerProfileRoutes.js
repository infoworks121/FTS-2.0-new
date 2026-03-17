const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDealerProfile,
  updateDealerProfile,
  getDealerDashboard
} = require('../controllers/dealerProfileController');

router.get('/profile', protect, getDealerProfile);
router.put('/profile', protect, updateDealerProfile);
router.get('/dashboard', protect, getDealerDashboard);

module.exports = router;