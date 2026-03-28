const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const adminWalletController = require('../controllers/adminWalletController');
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

// New: Get all user wallets overview for admin
router.get('/admin/user-wallets', authenticate, authorize('admin'), adminWalletController.getAllUserWallets);

router.get('/admin/profit-rules', authenticate, authorize('admin'), walletController.getProfitRules);
router.put('/admin/profit-rules/:id', authenticate, authorize('admin'), walletController.updateProfitRule);
router.get('/admin/withdrawals', authenticate, authorize('admin'), walletController.getWithdrawalRequests);
router.put('/admin/withdrawals/:id/approve', authenticate, authorize('admin'), walletController.approveWithdrawal);
router.put('/admin/withdrawals/:id/reject', authenticate, authorize('admin'), walletController.rejectWithdrawal);
router.post('/admin/add-funds', authenticate, authorize('admin'), walletController.addFunds);

// ── PIN & Deposits ──
router.post('/me/set-pin', authenticate, walletController.setPin);
router.post('/me/deposit-request', authenticate, walletController.createDepositRequest);
router.get('/me/deposit-requests', authenticate, walletController.getMyDepositRequests);
router.get('/admin/deposit-requests', authenticate, authorize('admin'), walletController.getAllDepositRequests);
router.put('/admin/deposit-requests/:id/status', authenticate, authorize('admin'), walletController.updateDepositStatus);


module.exports = router;
