const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUnifiedProfile,
  updateUnifiedProfile,
  getDashboardStats
} = require('../controllers/unifiedProfileController');

// Unified profile routes for all roles
router.get('/profile', protect, getUnifiedProfile);
router.put('/profile', protect, updateUnifiedProfile);
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;