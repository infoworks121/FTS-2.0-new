const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/pending-users', protect, adminController.getPendingUsers);
router.post('/approve-user/:userId', protect, adminController.approveUser);
router.delete('/reject-user/:userId', protect, adminController.rejectUser);
router.get('/businessmen', protect, adminOnly, adminController.getAllBusinessmen);
router.get('/corebodies', protect, adminOnly, adminController.getAllCoreBodies);
router.get('/corebodies/:id', protect, adminOnly, adminController.getCoreBodyById);

// User Management
router.get('/users/businessmen/:id', protect, adminOnly, adminController.getBusinessmanById);
router.put('/users/businessmen/:id/settings', protect, adminOnly, adminController.updateBusinessmanSettings);
router.get('/users', protect, adminOnly, adminController.getAllUsers);
router.patch('/users/:id/is-sph', protect, adminOnly, adminController.updateUserSPHStatus);

module.exports = router;
