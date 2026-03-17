const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, rejectUser, getAllBusinessmen } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/pending-users', protect, getPendingUsers);
router.post('/approve-user/:userId', protect, approveUser);
router.delete('/reject-user/:userId', protect, rejectUser);
router.get('/businessmen', protect, adminOnly, getAllBusinessmen);

module.exports = router;
