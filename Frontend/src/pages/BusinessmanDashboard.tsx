import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { getBusinessmanSidebarNavItems } from "@/config/businessmanSidebarConfig";
import {
  ShoppingCart, Package, Wallet, TrendingUp, Users,
  ArrowUpRight, Clock, IndianRupee
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import ProductPurchasePage from "./businessman/purchase/ProductPurchasePage";
import AdvanceRequestsPage from "./businessman/purchase/AdvanceRequestsPage";
import AdvanceLedgerPage from "./businessman/purchase/AdvanceLedgerPage";
import PurchaseHistoryPage from "./businessman/purchase/PurchaseHistoryPage";
import CreateBulkOrderPage from "./businessman/bulk-orders/CreateBulkOrderPage";
import NegotiationRequestsPage from "./businessman/bulk-orders/NegotiationRequestsPage";
import ApprovedBulkOrdersPage from "./businessman/bulk-orders/ApprovedBulkOrdersPage";
import BulkOrderHistoryPage from "./businessman/bulk-orders/BulkOrderHistoryPage";
import InventoryOverviewPage from "./businessman/stock/InventoryOverviewPage";
import StockInOutPage from "./businessman/stock/StockInOutPage";
import MinimumStockStatusPage from "./businessman/stock/MinimumStockStatusPage";
import InventoryHistoryPage from "./businessman/stock/InventoryHistoryPage";
import ActiveOrdersPage from "./businessman/orders/ActiveOrdersPage";
import CompletedOrdersPage from "./businessman/orders/CompletedOrdersPage";
import ReturnedCancelledOrdersPage from "./businessman/orders/ReturnedCancelledOrdersPage";
import MyReferralsPage from "./businessman/referrals/MyReferralsPage";
import ReferralEarningsPage from "./businessman/referrals/ReferralEarningsPage";
import ReferralHistoryPage from "./businessman/referrals/ReferralHistoryPage";
import WalletOverviewPage from "./businessman/wallet/WalletOverviewPage";
import TransactionLedgerPage from "./businessman/wallet/TransactionLedgerPage";
import WithdrawalRequestPage from "./businessman/wallet/WithdrawalRequestPage";
import WithdrawalHistoryPage from "./businessman/wallet/WithdrawalHistoryPage";
import PerformanceMetricsPage from "./businessman/performance/PerformanceMetricsPage";
import SlaStatusPage from "./businessman/performance/SlaStatusPage";
import RiskWarningsPage from "./businessman/performance/RiskWarningsPage";
import UpgradeEligibilityPage from "./businessman/performance/UpgradeEligibilityPage";
import BusinessmanProfile from "./businessman/BusinessmanProfile";

// Marketplace Pages
import B2CManager from "./sph/B2CManager";
import CatalogPicker from "./sph/CatalogPicker";
import AddCustomProduct from "./sph/AddCustomProduct";

const dailyEarnings = [
  { day: "Mon", amount: 2400 },
  { day: "Tue", amount: 3100 },
  { day: "Wed", amount: 1800 },
  { day: "Thu", amount: 4200 },
  { day: "Fri", amount: 3600 },
  { day: "Sat", amount: 5100 },
  { day: "Sun", amount: 2800 },
];

const orders = [
  { id: "ORD-891", product: "Organic Fertilizer", qty: "50 kg", total: "₹3,500", status: "active" as const, date: "Today" },
  { id: "ORD-890", product: "Seed Pack Premium", qty: "200 units", total: "₹12,000", status: "pending" as const, date: "Yesterday" },
  { id: "ORD-889", product: "Irrigation Kit", qty: "5 sets", total: "₹8,750", status: "active" as const, date: "2 days ago" },
  { id: "ORD-888", product: "Pesticide Spray", qty: "100 L", total: "₹6,200", status: "active" as const, date: "3 days ago" },
];

function DashboardHome({ userName }: { userName: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await api.get("/wallet/me");
        if (response.data && response.data.wallet) {
          setBalance(response.data.wallet.main_balance);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Good Morning, {userName} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's your business summary for today</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5 bg-profit text-profit-foreground hover:bg-profit/90">
            <ShoppingCart className="h-3.5 w-3.5" /> New Purchase
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <IndianRupee className="h-3.5 w-3.5" /> Withdraw
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Today's Earnings" value="₹4,200" change="+₹800" changeType="positive" icon={TrendingUp} variant="profit" />
        <KPICard title="Wallet Balance" value={isLoading ? "Loading..." : formatCurrency(balance || 0)} icon={Wallet} variant="trust" subtitle="Available for withdrawal" />
        <KPICard title="Active Orders" value="4" icon={Package} variant="cap" />
        <KPICard title="Referral Earnings" value="₹2,100" change="+3 new" changeType="positive" icon={Users} variant="reserve" />
      </div>

      {/* Quick Actions + Chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h3 className="text-sm font-semibold text-card-foreground">Quick Actions</h3>
          {[
            { label: "Place Bulk Order", icon: Package, desc: "Negotiate & order in bulk" },
            { label: "Request Withdrawal", icon: ArrowUpRight, desc: "Min ₹500 • Instant" },
            { label: "Track Shipments", icon: Clock, desc: "4 active deliveries" },
            { label: "View Referral Link", icon: Users, desc: "Share & earn commission" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex w-full items-center gap-3 rounded-md border border-border bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <div className="rounded-md bg-primary/10 p-2">
                <action.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">This Week's Earnings</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyEarnings}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 15%, 18%)" />
              <XAxis dataKey="day" stroke="hsl(215, 15%, 55%)" fontSize={11} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} tickFormatter={(v) => `₹${v/1000}K`} />
              <Tooltip contentStyle={{ background: "hsl(224, 25%, 10%)", border: "1px solid hsl(224, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="amount" fill="hsl(152, 69%, 46%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        title="Recent Orders"
        columns={[
          { header: "Order ID", accessor: "id", className: "font-mono text-xs" },
          { header: "Product", accessor: "product" },
          { header: "Qty", accessor: "qty" },
          { header: "Total", accessor: "total", className: "font-mono" },
          { header: "Status", accessor: (row) => <StatusBadge status={row.status as any} /> },
          { header: "Date", accessor: "date", className: "text-muted-foreground text-xs" },
        ]}
        data={orders}
      />
    </div>
  );
}

export default function BusinessmanDashboard() {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const navItems = getBusinessmanSidebarNavItems({
    isStockPoint: user?.is_sph || false,
    bulkEnabled: true,
    entryModeEnabled: true,
    advanceModeEnabled: true,
    permissions: [
      "businessman.dashboard.view",
      "businessman.purchase.view",
      "businessman.bulk.view",
      "businessman.stock.view",
      "businessman.orders.view",
      "businessman.referrals.view",
      "businessman.wallet.view",
      "businessman.performance.view",
    ],
    blockedMenus: {},
  });

  const renderBusinessmanPage = () => {
    switch (location.pathname) {
      case "/businessman/purchase/product-purchase":
        return <ProductPurchasePage />;
      case "/businessman/purchase/advance-requests":
        return <AdvanceRequestsPage />;
      case "/businessman/purchase/advance-ledger":
        return <AdvanceLedgerPage />;
      case "/businessman/purchase/purchase-history":
        return <PurchaseHistoryPage />;
      case "/businessman/bulk-orders/create":
        return <CreateBulkOrderPage />;
      case "/businessman/bulk-orders/negotiations":
        return <NegotiationRequestsPage />;
      case "/businessman/bulk-orders/approved":
        return <ApprovedBulkOrdersPage />;
      case "/businessman/bulk-orders/history":
        return <BulkOrderHistoryPage />;
      case "/businessman/stock":
      case "/businessman/stock/inventory-overview":
        return <InventoryOverviewPage />;
      case "/businessman/stock/in-out":
        return <StockInOutPage />;
      case "/businessman/stock/minimum-status":
        return <MinimumStockStatusPage />;
      case "/businessman/stock/history":
        return <InventoryHistoryPage />;
      case "/businessman/orders":
      case "/businessman/orders/active":
        return <ActiveOrdersPage />;
      case "/businessman/orders/completed":
        return <CompletedOrdersPage />;
      case "/businessman/orders/returned-cancelled":
        return <ReturnedCancelledOrdersPage />;
      case "/businessman/referrals":
      case "/businessman/referrals/my-referrals":
        return <MyReferralsPage />;
      case "/businessman/referrals/earnings":
        return <ReferralEarningsPage />;
      case "/businessman/referrals/history":
        return <ReferralHistoryPage />;
      case "/businessman/wallet":
      case "/businessman/wallet/overview":
        return <WalletOverviewPage />;
      case "/businessman/wallet/transaction-ledger":
        return <TransactionLedgerPage />;
      case "/businessman/wallet/withdrawal-request":
        return <WithdrawalRequestPage />;
      case "/businessman/wallet/withdrawal-history":
        return <WithdrawalHistoryPage />;
      case "/businessman/performance":
      case "/businessman/performance/metrics":
        return <PerformanceMetricsPage />;
      case "/businessman/performance/sla-status":
        return <SlaStatusPage />;
      case "/businessman/performance/risk-warnings":
        return <RiskWarningsPage />;
      case "/businessman/performance/upgrade-eligibility":
        return <UpgradeEligibilityPage />;
        
      case "/businessman/profile":
        return <BusinessmanProfile />;
      
      // Marketplace Routes
      case "/businessman/b2c-manager":
      case "/businessman/b2c-manager/listings":
        return <B2CManager />;
      case "/businessman/b2c-manager/browse":
        return <CatalogPicker />;
      case "/businessman/b2c-manager/add-custom":
        return <AddCustomProduct />;

      default:
        return <DashboardHome userName={user?.full_name || 'Businessman'} />;
    }
  };

  return (
    <DashboardLayout role="businessman" navItems={navItems as any} roleLabel={`Businessman — ${user?.full_name || 'Businessman'}`}>
      {renderBusinessmanPage()}
    </DashboardLayout>
  );
}
