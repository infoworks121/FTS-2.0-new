const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/upload - Single file upload
// Protected to ensure only logged in users can upload
router.post('/', protect, uploadController.uploadMiddleware, uploadController.uploadSingle);

module.exports = router;
