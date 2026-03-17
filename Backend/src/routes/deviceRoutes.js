const express = require('express');
const router = express.Router();
const { getUserDevices, flagDevice, removeDevice } = require('../controllers/deviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getUserDevices);
router.post('/flag', protect, authorize('admin'), flagDevice);
router.delete('/:device_id', protect, removeDevice);

module.exports = router;
