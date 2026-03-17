const express = require('express');
const { getLoginAttempts, getAllLoginAttempts } = require('../controllers/loginAttemptsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-attempts', protect, getLoginAttempts);
router.get('/all', protect, adminOnly, getAllLoginAttempts);

module.exports = router;
