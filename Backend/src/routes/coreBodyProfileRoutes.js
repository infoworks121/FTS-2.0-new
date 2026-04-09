const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCoreBodyProfile,
  updateCoreBodyProfile,
  getCoreBodyDashboard,
  payInstallment,
  getCoreBodyReports,
  getDistrictUsers,
  getDirectoryUsers,
  getDirectoryUserDetail
} = require('../controllers/coreBodyProfileController');

// Core Body profile routes
router.get('/profile', protect, getCoreBodyProfile);
router.put('/profile', protect, updateCoreBodyProfile);
router.get('/dashboard', protect, getCoreBodyDashboard);
router.post('/installment/pay', protect, payInstallment);
router.get('/reports', protect, getCoreBodyReports);
router.get('/users', protect, getDistrictUsers);
router.get('/directory-users', protect, getDirectoryUsers);
router.get('/directory-users/:id', protect, getDirectoryUserDetail);

module.exports = router;