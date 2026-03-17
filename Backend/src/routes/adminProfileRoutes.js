const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAdminProfile,
  updateAdminProfile,
  getDashboardStats
} = require('../controllers/adminProfileController');

// Admin profile routes
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);
router.get('/dashboard/stats', protect, getDashboardStats);

module.exports = router;