const express = require('express');
const { getActiveSessions, revokeSession, revokeAllSessions } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getActiveSessions);
router.delete('/:session_id', protect, revokeSession);
router.delete('/', protect, revokeAllSessions);

module.exports = router;
