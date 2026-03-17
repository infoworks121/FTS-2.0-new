const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getStockPointProfile,
  updateStockPointProfile,
  getStockPointDashboard
} = require('../controllers/stockPointProfileController');

router.get('/profile', protect, getStockPointProfile);
router.put('/profile', protect, updateStockPointProfile);
router.get('/dashboard', protect, getStockPointDashboard);

module.exports = router;