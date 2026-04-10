const express = require('express');
const { uploadKYC, getKYCStatus, reviewKYC, getKYCAuditLog, getAllPendingKYC } = require('../controllers/kycController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All KYC routes require authentication

router.post('/upload', uploadKYC);
router.get('/status', getKYCStatus);
router.get('/audit-log', getKYCAuditLog);

// Only admins can review KYC
router.post('/review', authorize('admin'), reviewKYC);
router.get('/pending', authorize('admin'), getAllPendingKYC);

module.exports = router;
