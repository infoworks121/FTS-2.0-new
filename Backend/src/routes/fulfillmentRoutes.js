const express = require('express');
const router = express.Router();
const fulfillmentController = require('../controllers/fulfillmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, fulfillmentController.getFulfillments);
router.post('/assign', protect, adminOnly, fulfillmentController.assignOrder);
router.put('/:assignment_id/status', protect, fulfillmentController.updateFulfillmentStatus);

module.exports = router;
