const express = require('express');
const router = express.Router();
const geogController = require('../controllers/geographyController');

// In a real scenario, you'd add middleware to ensure only admins can use POST/PUT requests
// For example: const { authenticate, authorize } = require('../middleware/authMiddleware');
// Let's implement basic public vs restricted routes

// Countries
router.get('/countries', geogController.getCountries);
router.post('/countries', geogController.createCountry);

// States
router.get('/countries/:countryId/states', geogController.getStatesByCountry);
router.post('/states', geogController.createState);

// Districts
router.get('/states/:stateId/districts', geogController.getDistrictsByState);
router.post('/districts', geogController.createDistrict);
// Subdivisions
router.get('/districts/:districtId/subdivisions', geogController.getSubdivisionsByDistrict);
router.get('/subdivisions/:subdivisionId/assigned-products', geogController.getSubdivisionAssignedProducts);
router.post('/subdivisions', geogController.createSubdivision);

// Cities
router.get('/districts/:districtId/cities', geogController.getCitiesByDistrict);
router.post('/cities', geogController.createCity);

// Pincodes
router.get('/cities/:cityId/pincodes', geogController.getPincodesByCity);
router.post('/pincodes', geogController.createPincode);

// District Quota
router.get('/districts/summary', geogController.getDistrictsSummary);
router.get('/quotas', geogController.getAllDistrictQuotas);
router.get('/districts/:districtId/quota', geogController.getDistrictQuota);
router.put('/districts/:districtId/quota', geogController.updateDistrictQuota);

module.exports = router;
