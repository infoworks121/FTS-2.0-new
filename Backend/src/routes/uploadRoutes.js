const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/upload/public - Public route for registration-time uploads
router.post('/public', uploadController.uploadMiddleware, uploadController.uploadSingle);

// POST /api/upload - Single file upload
// Protected to ensure only logged in users can upload
router.post('/', protect, uploadController.uploadMiddleware, uploadController.uploadSingle);

module.exports = router;
