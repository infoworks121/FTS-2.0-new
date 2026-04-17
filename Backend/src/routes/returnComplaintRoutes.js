const express = require('express');
const router = express.Router();
const rcController = require('../controllers/returnComplaintController');
const { protect, adminOnly, coreBodyOnly } = require('../middleware/authMiddleware');

// Returns
router.post('/returns', protect, rcController.createReturnRequest);
router.get('/returns', protect, adminOnly, rcController.getAllReturnRequests);
router.get('/returns/:id/timeline', protect, adminOnly, rcController.getReturnTimeline);
router.put('/returns/:id/review', protect, adminOnly, rcController.reviewReturnRequest);

// Complaints
router.post('/complaints', protect, rcController.createComplaint);
router.put('/complaints/:id/resolve', protect, adminOnly, rcController.resolveComplaint);

module.exports = router;
