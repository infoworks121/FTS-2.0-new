const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// ── User Wallet ──
router.get('/me', authenticate, walletController.getMyWallet);
router.get('/me/transactions', authenticate, walletController.getMyTransactions);
router.get('/me/withdrawals', authenticate, walletController.getMyWithdrawals);
router.post('/withdraw', authenticate, walletController.requestWithdrawal);

// ── Admin Wallet ──
router.get('/admin/overview', authenticate, authorize('admin'), walletController.getAdminWalletOverview);
router.get('/admin/trust-fund', authenticate, authorize('admin'), walletController.getTrustFundLog);
router.get('/admin/reserve-fund', authenticate, authorize('admin'), walletController.getReserveFundLog);
router.get('/admin/company-pool', authenticate, authorize('admin'), walletController.getCompanyPoolLog);
router.get('/admin/profit-distributions', authenticate, authorize('admin'), walletController.getProfitLog);

router.get('/admin/profit-rules', authenticate, authorize('admin'), walletController.getProfitRules);
router.put('/admin/profit-rules/:id', authenticate, authorize('admin'), walletController.updateProfitRule);
router.get('/admin/withdrawals', authenticate, authorize('admin'), walletController.getWithdrawalRequests);
router.put('/admin/withdrawals/:id/approve', authenticate, authorize('admin'), walletController.approveWithdrawal);
router.put('/admin/withdrawals/:id/reject', authenticate, authorize('admin'), walletController.rejectWithdrawal);


module.exports = router;
