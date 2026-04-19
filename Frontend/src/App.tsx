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
import CoreBodyDashboard from "./pages/CoreBodyDashboard";
import { getCoreBodyFlatNavItems } from "./config/coreBodySidebarConfig";
import BusinessmanDashboard from "./pages/BusinessmanDashboard";
import SPHDashboard from "./pages/SPHDashboard";
import MyReferralsPage from "./pages/businessman/referrals/MyReferralsPage";
import ReferralEarningsPage from "./pages/businessman/referrals/ReferralEarningsPage";
import ReferralHistoryPage from "./pages/businessman/referrals/ReferralHistoryPage";
import BusinessmanProductDetails from "./pages/businessman/purchase/BusinessmanProductDetails";
import NotFound from "./pages/NotFound";
import Login from "./pages/LoginNew";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import AuthCallback from "./pages/AuthCallback";
import SelectRole from "./pages/SelectRole";
import GoogleRedirect from "./pages/GoogleRedirect";
import { CartProvider } from "./context/CartContext";
import { PinSetupGuard } from "./components/auth/PinSetupGuard";
import api from "./lib/api";

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
import B2CManager from "./pages/sph/B2CManager";
import B2BManager from "./pages/sph/B2BManager";
import CatalogPicker from "./pages/sph/CatalogPicker";
import B2BCatalogPicker from "./pages/sph/B2BCatalogPicker";
import AddCustomProduct from "./pages/sph/AddCustomProduct";
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
import { StockAdjustment, StockSettings, StockLedger, StockBlockRelease } from "./pages/corebody/stock";
import AllDealers from "./pages/corebody/dealers-businessmen/AllDealers";
import CoreBodyAllBusinessmen from "./pages/corebody/dealers-businessmen/AllBusinessmen";
import StatusActiveInactive from "./pages/corebody/dealers-businessmen/StatusActiveInactive";
import PerformanceSnapshot from "./pages/corebody/dealers-businessmen/PerformanceSnapshot";
import CoreBodyAllUsers from "./pages/corebody/dealers-businessmen/CoreBodyAllUsers";
import ActiveOrders from "./pages/corebody/orders/ActiveOrders";
import B2CFulfillment from "./pages/corebody/orders/B2CFulfillment";
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

import UnifiedMemberProfile from "./pages/shared/UnifiedMemberProfile";

// Finance & Wallet Pages
import { MainWallet, InvestWallet, ReferralWallet, TrustWallet, ReserveFundWallet, WithdrawalRequests, ManageDeposits, PendingApprovals, WithdrawalHistory, AllUserWallets } from "./pages/wallet";
import { TDSConfiguration, ProcessingFeeRules } from "./pages/finance";
import { AllOrders, B2BOrders, B2COrders, ReturnsRefunds, TransactionLogs, LedgerView } from "./pages/orders";
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
import DirectedTasks from "./pages/corebody/stock/DirectedTasks";
import ShortageFulfillment from "./pages/admin/stock/ShortageFulfillment";
import CurrentInventory from "./pages/corebody/stock/CurrentInventory";
import CoreBodyB2BOrders from "./pages/corebody/orders/B2BOrders";
import StockArrivals from "./pages/dealer/StockArrivals";

// District & Core Body Layout
import { DistrictsLayout } from "./components/districts/DistrictsLayout";

// Wallet & Finance Layout
import { WalletPageLayout } from "./components/finance/WalletPageLayout";

// Core Body Layout
import { CoreBodyLayoutWrapper } from "./components/corebody/CoreBodyLayoutWrapper";

// Dealer Layout
import { DealerLayoutWrapper } from "./components/dealer/DealerLayoutWrapper";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));

  const syncSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Session sync failed:", error);
    }
  };

  // Only show splash on landing page
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path === '/' || path === '') {
       // Only show on root
    } else {
       setLoading(false);
       setShowSplash(false);
    }
    syncSession();
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
            {/* ── Dealer Panel (centralized DealerLayoutWrapper) ── */}
            <Route path="/dealer" element={<DealerLayoutWrapper><DealerDashboard /></DealerLayoutWrapper>} />
            <Route path="/dealer/products" element={<DealerLayoutWrapper><DealerProducts /></DealerLayoutWrapper>} />
            <Route path="/dealer/products/insights" element={<DealerLayoutWrapper><DealerInsights /></DealerLayoutWrapper>} />
            <Route path="/dealer/inventory" element={<DealerLayoutWrapper><DealerInventory /></DealerLayoutWrapper>} />
            <Route path="/dealer/inventory/ledger" element={<DealerLayoutWrapper><DealerStockLedger /></DealerLayoutWrapper>} />
            <Route path="/dealer/inventory/arrivals" element={<DealerLayoutWrapper><StockArrivals /></DealerLayoutWrapper>} />
            <Route path="/dealer/orders" element={<DealerLayoutWrapper><DealerOrders /></DealerLayoutWrapper>} />
            <Route path="/dealer/orders/history" element={<DealerLayoutWrapper><DealerFulfillmentHistory /></DealerLayoutWrapper>} />
            <Route path="/dealer/network" element={<DealerLayoutWrapper><DealerNetwork /></DealerLayoutWrapper>} />
            <Route path="/dealer/wallet" element={<DealerLayoutWrapper><DealerWallet /></DealerLayoutWrapper>} />
            <Route path="/dealer/wallet/history" element={<DealerLayoutWrapper><DealerTransactionHistory /></DealerLayoutWrapper>} />
            <Route path="/dealer/profile" element={<DealerLayoutWrapper><DealerProfile /></DealerLayoutWrapper>} />
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
            <Route path="/admin/stock/shortages" element={<ShortageFulfillment />} />
            <Route path="/corebody/stock/directed-tasks" element={<DirectedTasks />} />
            <Route path="/corebody/stock/current-inventory" element={<CurrentInventory />} />

            <Route path="/products-issued" element={<IssuedProducts />} />
            <Route path="/products-issued/:slug" element={<BusinessmanProductDetails />} />
            
            {/* Service Catalog Routes */}
            <Route path="/admin/services" element={<ProductsPageLayout><AllServices /></ProductsPageLayout>} />
            <Route path="/admin/services/new" element={<ProductsPageLayout><AddNewService /></ProductsPageLayout>} />

            <Route path="/admin/categories" element={<ProductsPageLayout><CategoryList /></ProductsPageLayout>} />
            <Route path="/admin/categories/manage" element={<ProductsPageLayout><ManageCategory /></ProductsPageLayout>} />
            <Route path="/admin/categories/commission" element={<ProductsPageLayout><CategoryCommissionRules /></ProductsPageLayout>} />

            {/* District & Core Body Routes */}
            <Route path="/admin/districts" element={<DistrictsLayout><AllDistricts /></DistrictsLayout>} />
            <Route path="/admin/districts/manage" element={<DistrictsLayout><ManageDistrict /></DistrictsLayout>} />
            <Route path="/admin/districts/performance" element={<DistrictsLayout><DistrictPerformance /></DistrictsLayout>} />
            <Route path="/admin/corebody" element={<DistrictsLayout><CoreBodyList /></DistrictsLayout>} />
            <Route path="/admin/corebody/a" element={<DistrictsLayout><CoreBodyAManagement /></DistrictsLayout>} />
            <Route path="/admin/corebody/b" element={<DistrictsLayout><CoreBodyBManagement /></DistrictsLayout>} />
            <Route path="/admin/corebody/dealer" element={<UnifiedMemberProfile />} />

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
            <Route path="/admin/users/profile/:id" element={<UnifiedMemberProfile />} />
            <Route path="/admin/corebody/dealer" element={<UnifiedMemberProfile />} />
            <Route path="/admin/users/features" element={<UsersLayout><FeatureAccessControl /></UsersLayout>} />
            <Route path="/admin/kyc/review" element={<UsersLayout><KYCReview /></UsersLayout>} />

            {/* Wallets & Finance Routes */}
            <Route path="/admin/wallet/main" element={<WalletPageLayout><MainWallet /></WalletPageLayout>} />
            <Route path="/admin/wallet/invest" element={<WalletPageLayout><InvestWallet /></WalletPageLayout>} />
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
            <Route path="/corebody" element={<CoreBodyLayoutWrapper><CoreBodyDashboard /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/profile" element={<CoreBodyLayoutWrapper><CoreBodyProfile /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/upgrade" element={<CoreBodyLayoutWrapper><UpgradeStatus /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/upgrade/eligibility" element={<CoreBodyLayoutWrapper><UpgradeStatus /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/upgrade/requirements" element={<CoreBodyLayoutWrapper><UpgradeStatus /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/upgrade/history" element={<CoreBodyLayoutWrapper><UpgradeStatus /></CoreBodyLayoutWrapper>} />
            
            {/* Alerts & Notifications */}
            <Route path="/corebody/alerts/system" element={<CoreBodyLayoutWrapper><SystemAlerts /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/alerts/cap" element={<CoreBodyLayoutWrapper><CapWarnings /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/alerts/inactivity" element={<CoreBodyLayoutWrapper><InactivityNotices /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/alerts/performance" element={<CoreBodyLayoutWrapper><PerformanceAlerts /></CoreBodyLayoutWrapper>} />
            
            {/* Reports */}
            <Route path="/corebody/reports/earnings" element={<CoreBodyLayoutWrapper><EarningsReport /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/reports/stock" element={<CoreBodyLayoutWrapper><StockMovementReport /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/reports/orders" element={<CoreBodyLayoutWrapper><OrderReport /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/reports/dealer-performance" element={<CoreBodyLayoutWrapper><DealerPerformanceReport /></CoreBodyLayoutWrapper>} />
            
            {/* Stock & Inventory */}
            <Route path="/corebody/stock/adjustment" element={<CoreBodyLayoutWrapper><StockAdjustment /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/stock/ledger" element={<CoreBodyLayoutWrapper><StockLedger /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/stock/block-release" element={<CoreBodyLayoutWrapper><StockBlockRelease /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/stock/settings" element={<CoreBodyLayoutWrapper><StockSettings /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/stock/demand-signals" element={<CoreBodyLayoutWrapper><DemandSignals /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/stock/physical-transfer" element={<CoreBodyLayoutWrapper><PhysicalTransfer /></CoreBodyLayoutWrapper>} />
            
            {/* Dealer & Businessman Management */}
            <Route path="/corebody/dealers-businessmen/all-dealers" element={<CoreBodyLayoutWrapper><AllDealers /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/dealers-businessmen/all-businessmen" element={<CoreBodyLayoutWrapper><CoreBodyAllBusinessmen /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/dealers-businessmen/status" element={<CoreBodyLayoutWrapper><StatusActiveInactive /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/dealers-businessmen/all-users" element={<CoreBodyLayoutWrapper><CoreBodyAllUsers /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/dealers-businessmen/performance-snapshot" element={<CoreBodyLayoutWrapper><PerformanceSnapshot /></CoreBodyLayoutWrapper>} />
            
            {/* Directory Profile Views */}
            <Route path="/corebody/directory/corebody/:id" element={<CoreBodyLayoutWrapper><UnifiedMemberProfile /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/directory/dealers/:id" element={<CoreBodyLayoutWrapper><UnifiedMemberProfile /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/directory/businessmen/:id" element={<CoreBodyLayoutWrapper><UnifiedMemberProfile /></CoreBodyLayoutWrapper>} />
            
            {/* Orders & Fulfillment */}
            <Route path="/corebody/orders/active" element={<CoreBodyLayoutWrapper><ActiveOrders /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/orders/b2c-fulfillment" element={<CoreBodyLayoutWrapper><B2CFulfillment /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/orders/b2b-orders" element={<CoreBodyLayoutWrapper><CoreBodyB2BOrders /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/orders/completed" element={<CoreBodyLayoutWrapper><CompletedOrders /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/orders/distribution" element={<CoreBodyLayoutWrapper><DistributionHistory /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/orders/issues" element={<CoreBodyLayoutWrapper><FulfilmentIssues /></CoreBodyLayoutWrapper>} />
            
            {/* Wallet & Finance */}
            <Route path="/corebody/wallet" element={<CoreBodyLayoutWrapper><WalletSummary /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/wallet/main-wallet" element={<CoreBodyLayoutWrapper><CoreBodyMainWallet /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/wallet/deposit" element={<CoreBodyLayoutWrapper><CoreBodyDepositRequest /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/wallet/ledger" element={<CoreBodyLayoutWrapper><EarningsLedger /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/wallet/cap" element={<CoreBodyLayoutWrapper><CapStatus /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/wallet/withdrawals" element={<CoreBodyLayoutWrapper><CoreBodyWithdrawalHistory /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/wallet/withdrawal-request" element={<CoreBodyLayoutWrapper><CoreBodyWithdrawalRequest /></CoreBodyLayoutWrapper>} />
            
            {/* Dashboard Visuals */}
            <Route path="/corebody/dashboard/earnings-vs-cap" element={<CoreBodyLayoutWrapper><CapStatus /></CoreBodyLayoutWrapper>} />
            <Route path="/corebody/dashboard/district-performance-snapshot" element={<CoreBodyLayoutWrapper><DistrictPerformanceSnapshot /></CoreBodyLayoutWrapper>} />

             {/* Core Body Referral Routes */}
             <Route path="/corebody/referrals" element={<CoreBodyLayoutWrapper><MyReferralsPage /></CoreBodyLayoutWrapper>} />
             <Route path="/corebody/referrals/my-referrals" element={<CoreBodyLayoutWrapper><MyReferralsPage /></CoreBodyLayoutWrapper>} />
             <Route path="/corebody/referrals/earnings" element={<CoreBodyLayoutWrapper><ReferralEarningsPage /></CoreBodyLayoutWrapper>} />
             <Route path="/corebody/referrals/history" element={<CoreBodyLayoutWrapper><ReferralHistoryPage /></CoreBodyLayoutWrapper>} />

             {/* Core Body SPH Market Management (B2B & B2C) */}
             <Route path="/corebody/b2c-manager/listings" element={<CoreBodyLayoutWrapper><B2CManager /></CoreBodyLayoutWrapper>} />
             <Route path="/corebody/b2c-manager/browse" element={<CoreBodyLayoutWrapper><CatalogPicker /></CoreBodyLayoutWrapper>} />
             <Route path="/corebody/b2c-manager/add-custom" element={<CoreBodyLayoutWrapper><AddCustomProduct /></CoreBodyLayoutWrapper>} />
             <Route path="/corebody/b2b-manager/listings" element={<CoreBodyLayoutWrapper><B2BManager /></CoreBodyLayoutWrapper>} />
             <Route path="/corebody/b2b-manager/browse" element={<CoreBodyLayoutWrapper><B2BCatalogPicker /></CoreBodyLayoutWrapper>} />

            {/* Other Routes */}
            <Route path="/stockpoint/*" element={<SPHDashboard />} />
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
