const express = require('express');
const router = express.Router();
const { getAllRoles, getRoleByCode } = require('../controllers/roleController');

router.get('/', getAllRoles);
router.get('/:role_code', getRoleByCode);

module.exports = router;
