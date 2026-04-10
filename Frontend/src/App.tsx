import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import React, { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import CoreBodyDashboard, { navItems as coreBodyNavItems } from "./pages/CoreBodyDashboard";
import BusinessmanDashboard from "./pages/BusinessmanDashboard";
import MyReferralsPage from "./pages/businessman/referrals/MyReferralsPage";
import ReferralEarningsPage from "./pages/businessman/referrals/ReferralEarningsPage";
import ReferralHistoryPage from "./pages/businessman/referrals/ReferralHistoryPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/LoginNew";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import AuthCallback from "./pages/AuthCallback";
import SelectRole from "./pages/SelectRole";
import GoogleRedirect from "./pages/GoogleRedirect";
import { CartProvider } from "./context/CartContext";
import { PinSetupGuard } from "./components/auth/PinSetupGuard";

// Settings Layout
import { SettingsLayout } from "./components/settings/SettingsLayout";

// Commission Layout
import { CommissionPageLayout } from "./components/commission/CommissionPageLayout";

// Settings Pages
import PlatformSettings from "./pages/settings/PlatformSettings";
import NotificationRules from "./pages/settings/NotificationRules";
import APIIntegration from "./pages/settings/APIIntegration";
import LanguageLocalization from "./pages/settings/LanguageLocalization";
import MaintenanceMode from "./pages/settings/MaintenanceMode";
import DeviceManagement from "./pages/settings/DeviceManagement";
import LoginHistory from "./pages/settings/LoginHistory";
import SessionManagement from "./pages/settings/SessionManagement";
import PaymentSettingsPage from "./pages/admin/PaymentSettingsPage";

// Commission & Profit Engine Pages
import B2BCommission from "./pages/commission/B2BCommission";
import B2CCommission from "./pages/commission/B2CCommission";
import ReferralRules from "./pages/commission/ReferralRules";
import ProfitDistribution from "./pages/commission/ProfitDistribution";
import TrustFundRules from "./pages/commission/TrustFundRules";
import CompanyShareRules from "./pages/commission/CompanyShareRules";
import CoreBodyShareRules from "./pages/commission/CoreBodyShareRules";
import StockPointShareRules from "./pages/commission/StockPointShareRules";

// Products & Categories Pages
import AllProducts from "./pages/products/AllProducts";
import AddNewProduct from "./pages/products/AddNewProduct";

import ProductPricing from "./pages/products/ProductPricing";
import ProductStatus from "./pages/products/ProductStatus";
import ProductDetails from "./pages/products/ProductDetails";
import IssuedProducts from "./pages/products/IssuedProducts";
import CategoryList from "./pages/categories/CategoryList";
import ManageCategory from "./pages/categories/ManageCategory";
import CategoryCommissionRules from "./pages/categories/CategoryCommissionRules";

// Services Pages
import AllServices from "./pages/services/AllServices";
import AddNewService from "./pages/services/AddNewService";
import ReferralNetwork from "./pages/admin/referral/ReferralNetwork";
import GlobalReferralEarnings from "./pages/admin/referral/GlobalReferralEarnings";

// Products Page Layout
import { ProductsPageLayout } from "./components/products/ProductsPageLayout";

// District & Core Body Pages
import { AllDistricts, ManageDistrict, DistrictPerformance } from "./pages/districts";
import { CoreBodyList, CoreBodyAManagement, CoreBodyBManagement, MainWallet as CoreBodyMainWallet, DepositRequest as CoreBodyDepositRequest } from "./pages/corebody";
import UpgradeStatus from "./pages/corebody/UpgradeStatus";
import SystemAlerts from "./pages/corebody/alerts/SystemAlerts";
import CapWarnings from "./pages/corebody/alerts/CapWarnings";
import InactivityNotices from "./pages/corebody/alerts/InactivityNotices";
import PerformanceAlerts from "./pages/corebody/alerts/PerformanceAlerts";
import EarningsReport from "./pages/corebody/reports/EarningsReport";
import StockMovementReport from "./pages/corebody/reports/StockMovementReport";
import OrderReport from "./pages/corebody/reports/OrderReport";
import DealerPerformanceReport from "./pages/corebody/reports/DealerPerformanceReport";
import { StockAdjustment, StockSettings } from "./pages/corebody/stock";
import AllDealers from "./pages/corebody/dealers-businessmen/AllDealers";
import CoreBodyAllBusinessmen from "./pages/corebody/dealers-businessmen/AllBusinessmen";
import StatusActiveInactive from "./pages/corebody/dealers-businessmen/StatusActiveInactive";
import PerformanceSnapshot from "./pages/corebody/dealers-businessmen/PerformanceSnapshot";
import CoreBodyAllUsers from "./pages/corebody/dealers-businessmen/CoreBodyAllUsers";
import ActiveOrders from "./pages/corebody/orders/ActiveOrders";
import CompletedOrders from "./pages/corebody/orders/CompletedOrders";
import DistributionHistory from "./pages/corebody/orders/DistributionHistory";
import FulfilmentIssues from "./pages/corebody/orders/FulfilmentIssues";
import WalletSummary from "./pages/corebody/wallet/WalletSummary";
import EarningsLedger from "./pages/corebody/wallet/EarningsLedger";
import CapStatus from "./pages/corebody/wallet/CapStatus";
import CoreBodyWithdrawalHistory from "./pages/corebody/wallet/WithdrawalHistory";
import CoreBodyWithdrawalRequest from "./pages/corebody/wallet/WithdrawalRequest";

// Users Layout
import { UsersLayout } from "./components/users/UsersLayoutWrapper";
import { AllUsers, AllBusinessmen, EntryModeUsers, AdvanceModeUsers, BulkUsers, StockPointList, RolePermissions, FeatureAccessControl } from "./pages/users";
import BusinessmanSettings from "./pages/users/BusinessmanSettings";
import CoreBodySettings from "./pages/users/CoreBodySettings";
import UserApproval from "./pages/users/UserApproval";
import AdminProfile from "./pages/admin/AdminProfile";
import CoreBodyProfile from "./pages/corebody/CoreBodyProfile";
import DistrictPerformanceSnapshot from "./pages/corebody/dashboard/DistrictPerformanceSnapshot";
import DealerDashboard from "./pages/dealer/DealerDashboard";
import DealerProducts from "./pages/dealer/DealerProducts";
import DealerInventory from "./pages/dealer/DealerInventory";
import DealerOrders from "./pages/dealer/DealerOrders";
import DealerNetwork from "./pages/dealer/DealerNetwork";
import DealerWallet from "./pages/dealer/DealerWallet";
import DealerProfile from "./pages/dealer/DealerProfile";
import DealerInsights from "./pages/dealer/DealerInsights";
import DealerStockLedger from "./pages/dealer/DealerStockLedger";
import DealerFulfillmentHistory from "./pages/dealer/DealerFulfillmentHistory";
import DealerTransactionHistory from "./pages/dealer/DealerTransactionHistory";
import StockPointProfile from "./pages/stockpoint/StockPointProfile";
import { KYCReview } from "./pages/kyc";
import { DashboardLayout } from "./components/DashboardLayout";

// Core Body Directory Detailed Views
import CoreBodyMemberDetails from "./pages/corebody/dealers-businessmen/CoreBodyMemberDetails";
import DealerDetails from "./pages/corebody/dealers-businessmen/DealerDetails";
import BusinessmanDetails from "./pages/corebody/dealers-businessmen/BusinessmanDetails";

// Finance & Wallet Pages
import { MainWallet, ReferralWallet, TrustWallet, ReserveFundWallet, WithdrawalRequests, ManageDeposits, PendingApprovals, WithdrawalHistory, AllUserWallets } from "./pages/wallet";
import { TDSConfiguration, ProcessingFeeRules } from "./pages/finance";
import { AllOrders, B2BOrders, B2COrders, BulkOrders, ReturnsRefunds, TransactionLogs, LedgerView } from "./pages/orders";
import { AdminActivityLogs, FinancialAuditLogs, RuleChangeHistory, LoginAccessLogs } from "./pages/audit";
import SuspiciousTransactions from "./pages/risk/SuspiciousTransactions";
import FakeOrders from "./pages/risk/FakeOrders";
import DuplicateAccounts from "./pages/risk/DuplicateAccounts";
import DeviceTrackingFlags from "./pages/risk/DeviceTrackingFlags";
import PanAadhaarVerification from "./pages/risk/PanAadhaarVerification";
import CapViolationReports from "./pages/risk/CapViolationReports";
import ReferralAbuseDetection from "./pages/risk/ReferralAbuseDetection";
import ActionsAndFreezes from "./pages/risk/ActionsAndFreezes";
import DemandSignals from "./pages/corebody/stock/DemandSignals";
import PhysicalTransfer from "./pages/corebody/stock/PhysicalTransfer";
import StockArrivals from "./pages/dealer/StockArrivals";

// Wallet & Finance Layout
import { WalletPageLayout } from "./components/finance/WalletPageLayout";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Only show splash on landing page
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path !== '/') {
      setLoading(false);
      setShowSplash(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <CartProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              {(loading && showSplash) ? (
                <SplashScreen onComplete={() => setLoading(false)} />
              ) : (
                <PinSetupGuard>
                  <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/google/redirect" element={<GoogleRedirect />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/corebody/profile" element={<CoreBodyProfile />} />
            <Route path="/dealer" element={<DealerDashboard />} />
            <Route path="/dealer/products" element={<DealerProducts />} />
            <Route path="/dealer/products/insights" element={<DealerInsights />} />
            <Route path="/dealer/inventory" element={<DealerInventory />} />
            <Route path="/dealer/inventory/ledger" element={<DealerStockLedger />} />
            <Route path="/dealer/orders" element={<DealerOrders />} />
            <Route path="/dealer/orders/history" element={<DealerFulfillmentHistory />} />
            <Route path="/dealer/network" element={<DealerNetwork />} />
            <Route path="/dealer/wallet" element={<DealerWallet />} />
            <Route path="/dealer/wallet/history" element={<DealerTransactionHistory />} />
            <Route path="/dealer/profile" element={<DealerProfile />} />
            <Route path="/stockpoint/profile" element={<StockPointProfile />} />

            {/* Commission & Profit Engine Routes */}
            <Route path="/admin/commission/b2b" element={<CommissionPageLayout><B2BCommission /></CommissionPageLayout>} />
            <Route path="/admin/commission/b2c" element={<CommissionPageLayout><B2CCommission /></CommissionPageLayout>} />
            <Route path="/admin/commission/referral" element={<CommissionPageLayout><ReferralRules /></CommissionPageLayout>} />
            <Route path="/admin/commission/profit" element={<CommissionPageLayout><ProfitDistribution /></CommissionPageLayout>} />
            <Route path="/admin/commission/trust" element={<CommissionPageLayout><TrustFundRules /></CommissionPageLayout>} />
            <Route path="/admin/commission/company" element={<CommissionPageLayout><CompanyShareRules /></CommissionPageLayout>} />
            <Route path="/admin/commission/corebody" element={<CommissionPageLayout><CoreBodyShareRules /></CommissionPageLayout>} />
            <Route path="/admin/commission/stockpoint" element={<CommissionPageLayout><StockPointShareRules /></CommissionPageLayout>} />

            {/* Settings Routes */}
            <Route path="/admin/settings/platform" element={<SettingsLayout><PlatformSettings /></SettingsLayout>} />
            <Route path="/admin/settings/notifications" element={<SettingsLayout><NotificationRules /></SettingsLayout>} />
            <Route path="/admin/settings/api" element={<SettingsLayout><APIIntegration /></SettingsLayout>} />
            <Route path="/admin/settings/language" element={<SettingsLayout><LanguageLocalization /></SettingsLayout>} />
            <Route path="/admin/settings/payment" element={<SettingsLayout><PaymentSettingsPage /></SettingsLayout>} />
            <Route path="/admin/settings/maintenance" element={<SettingsLayout><MaintenanceMode /></SettingsLayout>} />
            <Route path="/admin/settings/devices" element={<SettingsLayout><DeviceManagement /></SettingsLayout>} />
            <Route path="/admin/settings/login-history" element={<SettingsLayout><LoginHistory /></SettingsLayout>} />
            <Route path="/admin/settings/sessions" element={<SettingsLayout><SessionManagement /></SettingsLayout>} />

            {/* Products & Categories Routes */}
            <Route path="/admin/products" element={<ProductsPageLayout><AllProducts /></ProductsPageLayout>} />
            <Route path="/admin/products/new" element={<ProductsPageLayout><AddNewProduct /></ProductsPageLayout>} />
            <Route path="/admin/products/pricing" element={<ProductsPageLayout><ProductPricing /></ProductsPageLayout>} />
            <Route path="/admin/products/status" element={<ProductsPageLayout><ProductStatus /></ProductsPageLayout>} />
            <Route path="/admin/products/:id" element={<ProductsPageLayout><ProductDetails /></ProductsPageLayout>} />

            <Route path="/products-issued" element={<IssuedProducts />} />
            
            {/* Service Catalog Routes */}
            <Route path="/admin/services" element={<ProductsPageLayout><AllServices /></ProductsPageLayout>} />
            <Route path="/admin/services/new" element={<ProductsPageLayout><AddNewService /></ProductsPageLayout>} />

            <Route path="/admin/categories" element={<ProductsPageLayout><CategoryList /></ProductsPageLayout>} />
            <Route path="/admin/categories/manage" element={<ProductsPageLayout><ManageCategory /></ProductsPageLayout>} />
            <Route path="/admin/categories/commission" element={<ProductsPageLayout><CategoryCommissionRules /></ProductsPageLayout>} />

            {/* District & Core Body Routes */}
            <Route path="/admin/districts" element={<AllDistricts />} />
            <Route path="/admin/districts/manage" element={<ManageDistrict />} />
            <Route path="/admin/districts/performance" element={<DistrictPerformance />} />
            <Route path="/admin/corebody" element={<CoreBodyList />} />
            <Route path="/admin/corebody/a" element={<CoreBodyAManagement />} />
            <Route path="/admin/corebody/b" element={<CoreBodyBManagement />} />

            {/* Referral Management */}
            <Route path="/admin/referral/network" element={<UsersLayout><ReferralNetwork /></UsersLayout>} />
            <Route path="/admin/referral/earnings" element={<UsersLayout><GlobalReferralEarnings /></UsersLayout>} />

            {/* Users & Roles Routes */}
            <Route path="/admin/users" element={<UsersLayout><AllUsers /></UsersLayout>} />
            <Route path="/admin/approval" element={<UsersLayout><UserApproval /></UsersLayout>} />
            <Route path="/admin/users/approval" element={<UsersLayout><UserApproval /></UsersLayout>} />
            <Route path="/admin/users/businessmen" element={<UsersLayout><AllBusinessmen /></UsersLayout>} />
            <Route path="/admin/users/businessmen/:id/settings" element={<UsersLayout><BusinessmanSettings /></UsersLayout>} />
            <Route path="/admin/users/corebody/:id/settings" element={<UsersLayout><CoreBodySettings /></UsersLayout>} />
            <Route path="/admin/users/entry" element={<UsersLayout><EntryModeUsers /></UsersLayout>} />
            <Route path="/admin/users/advance" element={<UsersLayout><AdvanceModeUsers /></UsersLayout>} />
            <Route path="/admin/users/bulk" element={<UsersLayout><BulkUsers /></UsersLayout>} />
            <Route path="/admin/users/stockpoints" element={<UsersLayout><StockPointList /></UsersLayout>} />
            <Route path="/admin/users/roles" element={<UsersLayout><RolePermissions /></UsersLayout>} />
            <Route path="/admin/users/features" element={<UsersLayout><FeatureAccessControl /></UsersLayout>} />
            <Route path="/admin/kyc/review" element={<UsersLayout><KYCReview /></UsersLayout>} />

            {/* Wallets & Finance Routes */}
            <Route path="/admin/wallet/main" element={<WalletPageLayout><MainWallet /></WalletPageLayout>} />
            <Route path="/admin/wallet/referral" element={<WalletPageLayout><ReferralWallet /></WalletPageLayout>} />
            <Route path="/admin/wallet/trust" element={<WalletPageLayout><TrustWallet /></WalletPageLayout>} />
            <Route path="/admin/wallet/reserve" element={<WalletPageLayout><ReserveFundWallet /></WalletPageLayout>} />
            <Route path="/admin/wallet/withdrawals" element={<WalletPageLayout><WithdrawalRequests /></WalletPageLayout>} />
            <Route path="/admin/wallet/user-wallets" element={<WalletPageLayout><AllUserWallets /></WalletPageLayout>} />
            <Route path="/admin/wallet/deposits" element={<WalletPageLayout><ManageDeposits /></WalletPageLayout>} />
            <Route path="/admin/wallet/approvals" element={<WalletPageLayout><PendingApprovals /></WalletPageLayout>} />
            <Route path="/admin/wallet/history" element={<WalletPageLayout><WithdrawalHistory /></WalletPageLayout>} />
            <Route path="/admin/finance/tds" element={<WalletPageLayout><TDSConfiguration /></WalletPageLayout>} />
            <Route path="/admin/finance/fees" element={<WalletPageLayout><ProcessingFeeRules /></WalletPageLayout>} />
            <Route path="/admin/orders" element={<WalletPageLayout><AllOrders /></WalletPageLayout>} />
            <Route path="/admin/orders/b2b" element={<WalletPageLayout><B2BOrders /></WalletPageLayout>} />
            <Route path="/admin/orders/b2c" element={<WalletPageLayout><B2COrders /></WalletPageLayout>} />
            <Route path="/admin/orders/bulk" element={<WalletPageLayout><BulkOrders /></WalletPageLayout>} />
            <Route path="/admin/orders/refunds" element={<WalletPageLayout><ReturnsRefunds /></WalletPageLayout>} />
            <Route path="/admin/transactions" element={<WalletPageLayout><TransactionLogs /></WalletPageLayout>} />
            <Route path="/admin/ledger" element={<WalletPageLayout><LedgerView /></WalletPageLayout>} />

            {/* Risk, Fraud & Compliance Routes */}
            <Route path="/admin/fraud/transactions" element={<WalletPageLayout><SuspiciousTransactions /></WalletPageLayout>} />
            <Route path="/admin/fraud/orders" element={<WalletPageLayout><FakeOrders /></WalletPageLayout>} />
            <Route path="/admin/fraud/accounts" element={<WalletPageLayout><DuplicateAccounts /></WalletPageLayout>} />
            <Route path="/admin/fraud/devices" element={<WalletPageLayout><DeviceTrackingFlags /></WalletPageLayout>} />
            <Route path="/admin/compliance/kyc" element={<WalletPageLayout><PanAadhaarVerification /></WalletPageLayout>} />
            <Route path="/admin/compliance/cap" element={<WalletPageLayout><CapViolationReports /></WalletPageLayout>} />
            <Route path="/admin/compliance/referral" element={<WalletPageLayout><ReferralAbuseDetection /></WalletPageLayout>} />
            <Route path="/admin/fraud/actions" element={<WalletPageLayout><ActionsAndFreezes /></WalletPageLayout>} />

            {/* Audit & System Logs Routes */}
            <Route path="/admin/audit/admin" element={<WalletPageLayout><AdminActivityLogs /></WalletPageLayout>} />
            <Route path="/admin/audit/financial" element={<WalletPageLayout><FinancialAuditLogs /></WalletPageLayout>} />
            <Route path="/admin/audit/rules" element={<WalletPageLayout><RuleChangeHistory /></WalletPageLayout>} />
            <Route path="/admin/audit/login" element={<WalletPageLayout><LoginAccessLogs /></WalletPageLayout>} />

            {/* Core Body Panel Routes */}
            <Route path="/corebody" element={<CoreBodyDashboard />} />
            <Route path="/corebody/upgrade" element={<UpgradeStatus />} />
            <Route path="/corebody/upgrade/eligibility" element={<UpgradeStatus />} />
            <Route path="/corebody/upgrade/requirements" element={<UpgradeStatus />} />
            <Route path="/corebody/upgrade/history" element={<UpgradeStatus />} />
            <Route path="/corebody/alerts/system" element={<SystemAlerts />} />
            <Route path="/corebody/alerts/cap" element={<CapWarnings />} />
            <Route path="/corebody/alerts/inactivity" element={<InactivityNotices />} />
            <Route path="/corebody/alerts/performance" element={<PerformanceAlerts />} />
            <Route path="/corebody/reports/earnings" element={<EarningsReport />} />
            <Route path="/corebody/reports/stock" element={<StockMovementReport />} />
            <Route path="/corebody/reports/orders" element={<OrderReport />} />
            <Route path="/corebody/reports/dealer-performance" element={<DealerPerformanceReport />} />
            <Route path="/corebody/stock/adjustment" element={<StockAdjustment />} />
            <Route path="/corebody/stock/settings" element={<StockSettings />} />
            <Route path="/corebody/stock/demand-signals" element={<DemandSignals />} />
            <Route path="/corebody/stock/physical-transfer" element={<PhysicalTransfer />} />
            <Route path="/dealer/inventory/arrivals" element={<StockArrivals />} />
            <Route path="/corebody/dealers-businessmen/all-dealers" element={<AllDealers />} />
            <Route path="/corebody/dealers-businessmen/all-businessmen" element={<CoreBodyAllBusinessmen />} />
            <Route path="/corebody/dealers-businessmen/status" element={<StatusActiveInactive />} />
            <Route path="/corebody/dealers-businessmen/all-users" element={<CoreBodyAllUsers />} />
            <Route path="/corebody/directory/corebody/:id" element={<CoreBodyMemberDetails />} />
            <Route path="/corebody/directory/dealers/:id" element={<DealerDetails />} />
            <Route path="/corebody/directory/businessmen/:id" element={<BusinessmanDetails />} />
            <Route path="/corebody/dealers-businessmen/performance-snapshot" element={<PerformanceSnapshot />} />
            <Route path="/corebody/orders/active" element={<ActiveOrders />} />
            <Route path="/corebody/orders/completed" element={<CompletedOrders />} />
            <Route path="/corebody/orders/distribution" element={<DistributionHistory />} />
            <Route path="/corebody/orders/issues" element={<FulfilmentIssues />} />
            <Route path="/corebody/wallet/main-wallet" element={<CoreBodyMainWallet />} />
            <Route path="/corebody/wallet/deposit" element={<CoreBodyDepositRequest />} />
            <Route path="/corebody/wallet" element={<WalletSummary />} />
            <Route path="/corebody/wallet/ledger" element={<EarningsLedger />} />
            <Route path="/corebody/wallet/cap" element={<CapStatus />} />
            <Route path="/corebody/dashboard/earnings-vs-cap" element={<CapStatus />} />
            <Route path="/corebody/dashboard/district-performance-snapshot" element={<DistrictPerformanceSnapshot />} />
            <Route path="/corebody/wallet/withdrawals" element={<CoreBodyWithdrawalHistory />} />
            <Route path="/corebody/wallet/withdrawal-request" element={<CoreBodyWithdrawalRequest />} />

            {/* Core Body Referral Routes */}
            <Route path="/corebody/referrals" element={<DashboardLayout role="corebody" navItems={coreBodyNavItems as any}><MyReferralsPage /></DashboardLayout>} />
            <Route path="/corebody/referrals/my-referrals" element={<DashboardLayout role="corebody" navItems={coreBodyNavItems as any}><MyReferralsPage /></DashboardLayout>} />
            <Route path="/corebody/referrals/earnings" element={<DashboardLayout role="corebody" navItems={coreBodyNavItems as any}><ReferralEarningsPage /></DashboardLayout>} />
            <Route path="/corebody/referrals/history" element={<DashboardLayout role="corebody" navItems={coreBodyNavItems as any}><ReferralHistoryPage /></DashboardLayout>} />

            {/* Other Routes */}
            <Route path="/businessman/*" element={<BusinessmanDashboard />} />
            <Route path="*" element={<NotFound />} />
                  </Routes>
                </PinSetupGuard>
              )}
            </BrowserRouter>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
