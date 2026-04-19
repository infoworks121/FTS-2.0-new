const express = require('express');
const router = express.Router();
const productCatalogController = require('../controllers/productCatalogController');
const { protect, adminOnly, canIssueStock } = require('../middleware/authMiddleware');

const fs = require('fs');
const multer = require('multer');

// Configure multer for temporary file storage
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Categories
router.get('/categories', productCatalogController.getCategories);
router.post('/categories', protect, adminOnly, productCatalogController.createCategory);
router.put('/categories/:id', protect, adminOnly, productCatalogController.updateCategory);
router.delete('/categories/:id', protect, adminOnly, productCatalogController.deleteCategory);

// Products
router.get('/products', productCatalogController.getProducts);
router.post('/products', protect, adminOnly, productCatalogController.createProduct);

// Bulk Product Management
router.get('/admin/products/bulk/template', protect, adminOnly, productCatalogController.downloadBulkTemplate);
router.post('/admin/products/bulk', protect, adminOnly, upload.single('file'), productCatalogController.bulkUploadProducts);

// Admin Product Management (full CRUD)
router.get('/admin/products', protect, adminOnly, productCatalogController.getAdminProducts);
router.get('/admin/products/:id', protect, adminOnly, productCatalogController.getAdminProductById);
router.post('/admin/products', protect, adminOnly, productCatalogController.createAdminProduct);
router.put('/admin/products/:id', protect, adminOnly, productCatalogController.updateAdminProduct);
router.patch('/admin/products/:id/toggle-status', protect, adminOnly, productCatalogController.toggleAdminProductStatus);
router.delete('/admin/products/:id', protect, adminOnly, productCatalogController.deleteAdminProduct);

// Pricing — admin only
router.put('/pricing', protect, adminOnly, productCatalogController.updatePricing);
router.get('/products/:id/price-history', protect, adminOnly, productCatalogController.getPriceHistory);

// Stock Issue — admin, core_body_a, core_body_b, dealer (if approved), businessman (stock_point only)
router.post('/stock/issue', protect, canIssueStock, productCatalogController.issueStock);

// Market Catalog (Issued Products) - Public/Authenticated
router.get('/issued-products', productCatalogController.getIssuedProducts);
router.get('/issued-products/sku/:sku', productCatalogController.getIssuedProductBySku);

// Dealer Stock Permission — admin only
router.post('/dealer/permission/grant', protect, adminOnly, productCatalogController.grantDealerStockPermission);
router.post('/dealer/permission/revoke', protect, adminOnly, productCatalogController.revokeDealerStockPermission);
router.get('/dealer/permissions', protect, adminOnly, productCatalogController.getDealerStockPermissions);

// Services
router.get('/services', productCatalogController.getServices);
router.get('/services/:id', productCatalogController.getServiceById);
router.post('/services', protect, adminOnly, productCatalogController.createService);
router.put('/services/:id', protect, adminOnly, productCatalogController.updateService);

// Subscription Plans
router.get('/subscription-plans', productCatalogController.getSubscriptionPlans);
router.post('/subscription-plans', protect, adminOnly, productCatalogController.createSubscriptionPlan);

// Availability Checks
router.get('/check-availability', protect, productCatalogController.checkAvailability);

module.exports = router;