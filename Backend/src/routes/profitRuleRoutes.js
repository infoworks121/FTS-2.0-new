const express = require('express');
const router = express.Router();
const profitRuleController = require('../controllers/profitRuleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/:channel', protect, profitRuleController.getProfitRuleByChannel);
router.post('/:channel', protect, adminOnly, profitRuleController.updateProfitRule);
router.get('/:channel/history', protect, profitRuleController.getProfitRuleHistory);

module.exports = router;
