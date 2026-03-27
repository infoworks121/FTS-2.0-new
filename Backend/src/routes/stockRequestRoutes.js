const express = require('express');
const router = express.Router();
const stockRequestController = require('../controllers/stockRequestController');
const passport = require('passport');

// Middlewares for authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// For a stock point to make a request
router.post('/', requireAuth, stockRequestController.createStockRequest);

// For Admins / Up-lines to see requests
router.get('/', requireAuth, stockRequestController.getStockRequests);

// For Admins / Up-lines to approve or reject
router.put('/:requestId/review', requireAuth, stockRequestController.reviewStockRequest);

module.exports = router;
