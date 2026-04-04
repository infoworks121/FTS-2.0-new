const express = require('express');
const router = express.Router();
const sphController = require('../controllers/sphController');
const { protect } = require('../middleware/authMiddleware');

// All SPH routes require authentication via protect middleware
// and we assume the user has is_sph = true (can be checked in specific middleware if needed)

router.get('/catalog/bulk', protect, sphController.getBulkCatalogForSPH);
router.get('/listings/my', protect, sphController.getMyB2CListings);
router.post('/listings/link', protect, sphController.addListingFromCatalog);
router.post('/products/custom', protect, sphController.createCustomSPHProduct);
router.patch('/listings/:id', protect, sphController.updateListing);

module.exports = router;
