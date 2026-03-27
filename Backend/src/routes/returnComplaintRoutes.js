const express = require('express');
const router = express.Router();
const rcController = require('../controllers/returnComplaintController');
const { protect, adminOnly, coreBodyOnly } = require('../middleware/authMiddleware');

// Returns
router.post('/returns', protect, rcController.createReturnRequest);
router.put('/returns/:id/review', protect, adminOnly, rcController.reviewReturnRequest);

// Complaints
router.post('/complaints', protect, rcController.createComplaint);
router.put('/complaints/:id/resolve', protect, adminOnly, rcController.resolveComplaint);

module.exports = router;
