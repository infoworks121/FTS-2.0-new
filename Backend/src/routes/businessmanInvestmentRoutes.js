const express = require('express');
const { getInstallments, getMyInstallments, updateInstallmentStatus } = require('../controllers/businessmanInvestmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', protect, getMyInstallments);
router.get('/:businessman_id', protect, getInstallments);
router.patch('/:id/status', protect, updateInstallmentStatus);

module.exports = router;
