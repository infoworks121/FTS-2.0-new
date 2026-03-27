const express = require('express');
const router = express.Router();
const commissionRuleController = require('../controllers/commissionRuleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, commissionRuleController.getRules);
router.post('/', protect, adminOnly, commissionRuleController.createRule);
router.put('/:id', protect, adminOnly, commissionRuleController.updateRule);
router.delete('/:id', protect, adminOnly, commissionRuleController.deleteRule);

module.exports = router;
