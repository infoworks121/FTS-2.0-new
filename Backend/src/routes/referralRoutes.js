const express = require('express');
const { 
    getReferralStats, 
    getMyReferrals, 
    getEarningsHistory,
    adminGetAllReferrals,
    adminGetGlobalEarnings,
    adminGetReferralStats
} = require('../controllers/referralController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/referral/stats
 * @desc    Get current user's referral statistics and link
 * @access  Private
 */
router.get('/stats', protect, getReferralStats);

/**
 * @route   GET /api/referral/list
 * @desc    Get list of users referred by the current user
 * @access  Private
 */
router.get('/list', protect, getMyReferrals);

/**
 * @route   GET /api/referral/earnings
 * @desc    Get history of earnings from referrals
 * @access  Private
 */
router.get('/earnings', protect, getEarningsHistory);

/**
 * @route   GET /api/referral/admin/list
 * @desc    Get all referral registrations (Admin)
 * @access  Private/Admin
 */
router.get('/admin/list', protect, authorize('admin'), adminGetAllReferrals);

/**
 * @route   GET /api/referral/admin/earnings
 * @desc    Get all referral earnings log (Admin)
 * @access  Private/Admin
 */
router.get('/admin/admin-earnings', protect, authorize('admin'), adminGetGlobalEarnings);

/**
 * @route   GET /api/referral/admin/stats
 * @desc    Get global referral statistics (Admin)
 * @access  Private/Admin
 */
router.get('/admin/stats', protect, authorize('admin'), adminGetReferralStats);

module.exports = router;
