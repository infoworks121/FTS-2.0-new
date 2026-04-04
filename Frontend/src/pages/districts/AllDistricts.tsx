import { useState, useEffect } from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickFilterChip, CapacityBar, StatCard } from "@/components/districts";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";
import { geographyApi, DistrictSummary } from "@/lib/geographyApi";
import {
  LayoutDashboard,
  Package,
  Percent,
  MapPin,
  Users,
  Wallet,
  ShoppingCart,
  ShieldAlert,
  FileText,
  Settings,
  TrendingUp,
  DollarSign,
  Building2,
  AlertTriangle,
  BarChart3,
  Plus,
  Eye,
  Pencil,
  Filter,
  Download,
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
  Loader2,
} from "lucide-react";

// Navigation items
const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { 
    title: "Products & Categories", 
    icon: Package,
    submenu: [
      { title: "All Products", url: "/admin/products", icon: Package },
      { title: "Add New Product", url: "/admin/products/new", icon: Package },
      { title: "Product Pricing & Margin", url: "/admin/products/pricing", icon: DollarSign },
      { title: "Product Status", url: "/admin/products/status", icon: TrendingUp },
      { title: "Category List", url: "/admin/categories", icon: FileText },
      { title: "Add / Edit Category", url: "/admin/categories/manage", icon: FileText },
      { title: "Category Commission Rules", url: "/admin/categories/commission", icon: Percent },
      { title: "Services & Digital Products", url: "/admin/services", icon: ShoppingCart },
    ],
  },
  { 
    title: "Commission & Profit Engine", 
    icon: Percent,
    warning: true,
    submenu: [
      { title: "B2B Commission Structure", url: "/admin/commission/b2b", icon: Building2 },
      { title: "B2C Commission Structure", url: "/admin/commission/b2c", icon: Users },
      { title: "Referral Percentage Rules", url: "/admin/commission/referral", icon: UsersRound },
      { title: "Profit Distribution", url: "/admin/commission/profit", icon: DollarSign },
      { title: "Trust Fund Rules", url: "/admin/commission/trust", icon: ShieldCheck },
      { title: "Company Share Rules", url: "/admin/commission/company", icon: Building2 },
      { title: "Core Body Share Rules", url: "/admin/commission/corebody", icon: Users },
      { title: "Stock Point Share Rules", url: "/admin/commission/stockpoint", icon: Warehouse },
    ],
  },
  { 
    title: "District & Core Body", 
    icon: MapPin,
    submenu: [
      { title: "All Districts", url: "/admin/districts", icon: MapPin },
      // { title: "Add / Edit District", url: "/admin/districts/manage", icon: MapPin },
      { title: "District Performance", url: "/admin/districts/performance", icon: BarChart3 },
      { title: "Core Body List", url: "/admin/corebody", icon: Users },
      // { title: "Core Body A Management", url: "/admin/corebody/a", icon: Users },
      // { title: "Core Body B Management", url: "/admin/corebody/b", icon: Users },
    ],
  },
  { 
    title: "Users & Roles", 
    icon: Users,
    submenu: [
      { title: "All Businessmen", url: "/admin/users/businessmen", icon: Users },
      // { title: "Entry Mode Users", url: "/admin/users/entry", icon: Users },
      // { title: "Advance Mode Users", url: "/admin/users/advance", icon: Users },
      // { title: "Bulk Users", url: "/admin/users/bulk", icon: Users },
      { title: "Stock Point List", url: "/admin/users/stockpoints", icon: Warehouse },
      { title: "Role Permissions", url: "/admin/users/roles", icon: ShieldCheck },
      { title: "Feature Access Control", url: "/admin/users/features", icon: Settings },
    ],
  },
  { 
    title: "Wallets & Finance", 
    icon: Wallet,
    warning: true,
    submenu: [
      { title: "Main Wallet", url: "/admin/wallet/main", icon: DollarSign },
      { title: "Referral Wallet", url: "/admin/wallet/referral", icon: UsersRound },
      { title: "Trust Wallet", url: "/admin/wallet/trust", icon: ShieldCheck },
      { title: "Reserve Fund Wallet", url: "/admin/wallet/reserve", icon: Warehouse },
      { title: "Withdrawal Requests", url: "/admin/wallet/withdrawals", icon: DollarSign },
      { title: "Pending Approvals", url: "/admin/wallet/approvals", icon: AlertTriangle },
      { title: "Approved / Rejected History", url: "/admin/wallet/history", icon: FileText },
      { title: "TDS Configuration", url: "/admin/finance/tds", icon: Percent },
      { title: "Processing Fee Rules", url: "/admin/finance/fees", icon: DollarSign },
    ],
  },
  { 
    title: "Orders & Transactions", 
    icon: ShoppingCart,
    submenu: [
      { title: "All Orders", url: "/admin/orders", icon: ShoppingCart },
      { title: "B2B Orders", url: "/admin/orders/b2b", icon: Building2 },
      { title: "B2C Orders", url: "/admin/orders/b2c", icon: Users },
      { title: "Bulk Orders", url: "/admin/orders/bulk", icon: Package },
      { title: "Order Returns & Refunds", url: "/admin/orders/refunds", icon: Receipt },
      { title: "Transaction Logs", url: "/admin/transactions", icon: FileText },
      { title: "Ledger View", url: "/admin/ledger", icon: FileText },
    ],
  },
  { 
    title: "Risk, Fraud & Compliance", 
    icon: ShieldAlert,
    warning: true,
    submenu: [
      { title: "Suspicious Transactions", url: "/admin/fraud/transactions", icon: AlertTriangle },
      { title: "Fake Orders", url: "/admin/fraud/orders", icon: ShoppingCart },
      { title: "Duplicate Accounts", url: "/admin/fraud/accounts", icon: Users },
      { title: "Device Tracking Flags", url: "/admin/fraud/devices", icon: AlertTriangle },
      { title: "PAN / Aadhaar Verification", url: "/admin/compliance/kyc", icon: ShieldCheck },
      { title: "Cap Violation Reports", url: "/admin/compliance/cap", icon: AlertTriangle },
      { title: "Referral Abuse Detection", url: "/admin/compliance/referral", icon: Users },
      { title: "Actions & Freezes", url: "/admin/fraud/actions", icon: ShieldAlert },
    ],
  },
  { 
    title: "Audit & System Logs", 
    icon: FileText,
    submenu: [
      { title: "Admin Activity Logs", url: "/admin/audit/admin", icon: FileText },
      { title: "Financial Audit Logs", url: "/admin/audit/financial", icon: DollarSign },
      { title: "Rule Change History", url: "/admin/audit/rules", icon: FileText },
      { title: "Login & Access Logs", url: "/admin/audit/login", icon: ShieldCheck },
    ],
  },
  { 
    title: "Settings", 
    icon: Settings,
    submenu: [
      { title: "Platform Settings", url: "/admin/settings/platform", icon: Settings },
      { title: "Notification Rules", url: "/admin/settings/notifications", icon: AlertTriangle },
      { title: "API & Integration", url: "/admin/settings/api", icon: Settings },
      { title: "Language & Localization", url: "/admin/settings/language", icon: Settings },
      { title: "Maintenance Mode", url: "/admin/settings/maintenance", icon: Settings },
    ],
  },
];

export default function AllDistricts() {
  const { theme } = useTheme();
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = (await geographyApi.getDistrictsSummary()) as any;
        setDistricts(data.districts);
        setKpiData(data.kpiData);
        setError(null);
      } catch (err) {
        console.error("Failed to load district summary:", err);
        setError("Failed to load districts. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Get unique states
  const states = [...new Set(districts.map(d => d.state_name))];

  // Filter data based on selected filters
  const filteredData = districts.filter(d => {
    const status = d.current_count >= d.max_limit ? "warning" : d.is_active ? "active" : "inactive";
    if (statusFilter && status !== statusFilter) return false;
    if (stateFilter && d.state_name !== stateFilter) return false;
    return true;
  });

  // Count by status for filters
  const activeCount = districts.filter(d => d.is_active && d.current_count < d.max_limit).length;
  const warningCount = districts.filter(d => d.current_count >= d.max_limit).length;
  const inactiveCount = districts.filter(d => !d.is_active).length;

  const columns = [
    {
      header: "District Name",
      accessor: (row: DistrictSummary) => (
        <div>
          <Link 
            to={`/admin/districts/performance?id=${row.id}`}
            className="font-semibold text-card-foreground hover:text-primary hover:underline"
          >
            {row.name}
          </Link>
          <p className="text-xs text-muted-foreground">ID: {row.id}</p>
        </div>
      ),
    },
    {
      header: "State",
      accessor: (row: DistrictSummary) => row.state_name,
    },
    {
      header: "Core Bodies (A / B)",
      accessor: (row: DistrictSummary) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            A: {row.core_body_count_a}
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            B: {row.core_body_count_b}
          </Badge>
        </div>
      ),
    },
    {
      header: "Capacity",
      accessor: (row: DistrictSummary) => (
        <CapacityBar 
          used={row.current_count} 
          max={row.max_limit}
          showLabel={false}
          size="sm"
        />
      ),
    },
    {
      header: "Total Orders",
      accessor: (row: DistrictSummary) => (
        <span className="font-mono text-sm">{row.total_orders.toLocaleString()}</span>
      ),
    },
    {
      header: "Total Revenue",
      accessor: (row: DistrictSummary) => (
        <span className="font-mono text-sm font-semibold">₹{(row.total_revenue / 100000).toFixed(1)}L</span>
      ),
    },
    {
      header: "Status",
      accessor: (row: DistrictSummary) => {
        const districtStatus = row.current_count >= row.max_limit ? "warning" : row.is_active ? "active" : "inactive";
        return <StatusBadge status={districtStatus} />;
      },
    },
    {
      header: "Action",
      accessor: (row: DistrictSummary) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild title="View Performance">
            <Link to={`/admin/districts/performance?id=${row.id}`}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild title="Edit District">
            <Link to={`/admin/districts/manage?id=${row.id}`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} role="admin" roleLabel="Administrator">
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading Strategic Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={navItems} role="admin" roleLabel="Administrator">
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} role="admin" roleLabel="Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">District Management</h1>
            <p className="text-sm text-muted-foreground">
              Strategic oversight across territorial distribution hubs
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/districts/manage">
              <Plus className="h-4 w-4 mr-2" />
              Add District
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Districts"
            value={kpiData?.totalDistricts?.toString() || "0"}
            icon={MapPin}
            variant="default"
            subtitle={`Active: ${kpiData?.activeDistricts || 0}`}
          />
          <KPICard
            title="Total Core Bodies"
            value={kpiData?.totalCoreBodies?.toString() || "0"}
            icon={Users}
            variant="cap"
            subtitle="Across all districts"
          />
          <KPICard
            title="Total Revenue"
            value={`₹${(kpiData?.totalRevenue / 10000000).toFixed(2)}Cr`}
            icon={DollarSign}
            variant="profit"
            subtitle="System Total"
          />
          <KPICard
            title="Avg Orders/District"
            value={parseInt(kpiData?.avgOrdersPerDistrict || 0).toLocaleString()}
            icon={ShoppingCart}
            variant="default"
            subtitle="Overall performance"
          />
        </div>

        {/* Strategic Controls */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Strategic Filters</CardTitle>
                <p className="text-xs text-muted-foreground">Isolate hubs by state or operational status</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  Advanced
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <QuickFilterChip 
                label="All Hubs" 
                active={statusFilter === null} 
                count={districts.length}
                onClick={() => setStatusFilter(null)}
              />
              <QuickFilterChip 
                label="Active" 
                active={statusFilter === "active"} 
                count={activeCount}
                onClick={() => setStatusFilter("active")}
              />
              <QuickFilterChip 
                label="At Capacity" 
                active={statusFilter === "warning"} 
                count={warningCount}
                onClick={() => setStatusFilter("warning")}
              />
              <QuickFilterChip 
                label="Inactive" 
                active={statusFilter === "inactive"} 
                count={inactiveCount}
                onClick={() => setStatusFilter("inactive")}
              />
              <div className="w-px h-8 bg-border mx-2" />
              {states.map(state => (
                <QuickFilterChip 
                  key={state}
                  label={state} 
                  active={stateFilter === state}
                  onClick={() => setStateFilter(stateFilter === state ? null : state)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hubs Table */}
        <DataTable 
          columns={columns as any} 
          data={filteredData as any}
          title={`Distribution Hubs (${filteredData.length})`}
        />

        {/* Strategic Performance Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard title="Policy Limit" value="20" subtitle="Max CB/Hub" />
          <StatCard title="Slot Avail." value={((kpiData?.totalDistricts || 0) * 20 - (kpiData?.totalCoreBodies || 0)).toString()} subtitle="System vacancy" />
          <StatCard title="Core Body A" value={districts.reduce((s,d) => s + d.core_body_count_a, 0).toString()} trend="up" trendValue="Growth" />
          <StatCard title="Core Body B" value={districts.reduce((s,d) => s + d.core_body_count_b, 0).toString()} trend="up" trendValue="Growth" />
          <StatCard title="Yield/Hub" value={`₹${((kpiData?.totalRevenue || 0) / (kpiData?.totalDistricts || 1) / 10000000).toFixed(2)}Cr`} trend="up" trendValue="Target" />
          <StatCard title="Integrity" value="98%" subtitle="Audit-grade" />
        </div>
      </div>
    </DashboardLayout>
  );
}
