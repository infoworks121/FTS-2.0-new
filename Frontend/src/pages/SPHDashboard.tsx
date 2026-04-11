import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { getSPHSidebarNavItems } from "@/config/sphSidebarConfig";
import {
  Package, Wallet, TrendingUp, ShoppingCart,
  ArrowUpRight, Clock, IndianRupee, ClipboardList, ShieldCheck
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";

// Reusing same components from businessman folder since functionality is identical
import InventoryOverviewPage from "./businessman/stock/InventoryOverviewPage";
import StockInOutPage from "./businessman/stock/StockInOutPage";
import InventoryHistoryPage from "./businessman/stock/InventoryHistoryPage";
import ActiveOrdersPage from "./businessman/orders/ActiveOrdersPage";
import CompletedOrdersPage from "./businessman/orders/CompletedOrdersPage";
import WalletOverviewPage from "./businessman/wallet/WalletOverviewPage";
import TransactionLedgerPage from "./businessman/wallet/TransactionLedgerPage";
import WithdrawalRequestPage from "./businessman/wallet/WithdrawalRequestPage";
import SlaStatusPage from "./businessman/performance/SlaStatusPage";
import RiskWarningsPage from "./businessman/performance/RiskWarningsPage";
import BusinessmanProfile from "./businessman/BusinessmanProfile"; // Currently used for all profile views

// Marketplace Pages
import B2CManager from "./sph/B2CManager";
import CatalogPicker from "./sph/CatalogPicker";
import AddNewProduct from "./products/AddNewProduct";

function SPHHome({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/unified-profile/dashboard-stats");
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching SPH stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">SPH Operational Control 👋</h1>
          <p className="text-sm text-muted-foreground">Manage your fulfillment and inventory performance</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5 bg-profit text-profit-foreground hover:bg-profit/90">
            <ClipboardList className="h-3.5 w-3.5" /> Market Listing
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Listings"
          value={stats?.fulfillment?.active_listings || "0"}
          icon={ShoppingCart}
          description="Products live on marketplace"
          trend={{ value: 2, isPositive: true }}
          className="border-l-4 border-l-blue-500"
        />
        <KPICard
          title="SLA Performance"
          value={`${stats?.fulfillment?.sla_score || "100"}%`}
          icon={ShieldCheck}
          description="Average fulfillment score"
          trend={{ value: 0, isPositive: true }}
          className="border-l-4 border-l-green-500"
        />
        <KPICard
          title="Inventory Value"
          value={`₹${(stats?.inventory?.value || 0).toLocaleString()}`}
          icon={Package}
          description="Current stock value"
          className="border-l-4 border-l-yellow-500"
        />
        <KPICard
          title="Pending Tasks"
          value="5"
          icon={Clock}
          description="Assignments awaiting action"
          warning={true}
          className="border-l-4 border-l-orange-500"
        />
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-xl border bg-card shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-profit" /> 
                    Fulfillment Operations
                </h2>
                <div className="text-sm text-muted-foreground mb-4">
                    Your Stock Point is currently <span className={stats?.fulfillment?.is_active ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                        {stats?.fulfillment?.is_active ? "ACTIVE" : "INACTIVE"}
                    </span> for new assignments.
                </div>
                <div className="flex gap-3">
                   <Button variant="outline" size="sm">View Active Orders</Button>
                   <Button variant="outline" size="sm">Manage Inventory</Button>
                </div>
            </div>
         </div>
         <div className="space-y-4">
            <div className="p-6 rounded-xl border bg-card shadow-sm">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" /> Quick Wallet
                </h3>
                <div className="text-2xl font-black mb-1">₹42,500.00</div>
                <p className="text-xs text-muted-foreground mb-4">Main balance available for withdrawal</p>
                <Button className="w-full text-xs" size="sm">Go to Wallet</Button>
            </div>
         </div>
      </div>
    </div>
  );
}

export default function SPHDashboard() {
  const location = useLocation();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const navItems = getSPHSidebarNavItems({
    permissions: user?.permissions || [],
  });

  const renderContent = () => {
    const path = location.pathname;

    // Fulfillment
    if (path === "/stockpoint/orders/active") return <ActiveOrdersPage />;
    if (path === "/stockpoint/orders/history") return <CompletedOrdersPage />;

    // Inventory
    if (path === "/stockpoint/stock/inventory-overview") return <InventoryOverviewPage />;
    if (path === "/stockpoint/stock/in-out") return <StockInOutPage />;
    if (path === "/stockpoint/stock/history") return <InventoryHistoryPage />;

    // B2C Manager
    if (path === "/stockpoint/b2c-manager/listings") return <B2CManager />;
    if (path === "/stockpoint/b2c-manager/browse") return <CatalogPicker />;
    if (path === "/stockpoint/b2c-manager/add-custom") return <AddNewProduct />;

    // Wallet
    if (path === "/stockpoint/wallet") return <WalletOverviewPage />;
    if (path === "/stockpoint/wallet/transaction-ledger") return <TransactionLedgerPage />;
    if (path === "/stockpoint/wallet/withdrawal-request") return <WithdrawalRequestPage />;

    // Performance
    if (path === "/stockpoint/performance/sla-status") return <SlaStatusPage />;
    if (path === "/stockpoint/performance/risk-warnings") return <RiskWarningsPage />;

    // Profile
    if (path === "/stockpoint/profile") return <BusinessmanProfile />;

    // Default Home
    return <SPHHome user={user} />;
  };

  return (
    <DashboardLayout 
      role="stock_point" 
      roleLabel="STOCK POINT HOLDER" 
      navItems={navItems}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
