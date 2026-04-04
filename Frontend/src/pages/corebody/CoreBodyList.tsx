import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickFilterChip, CoreBodyTypeBadge, StatCard } from "@/components/districts";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";
import { coreBodyApi, CoreBodySummary } from "@/lib/coreBodyApi";
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
  Filter,
  Download,
  MoreVertical,
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
  Loader2,
} from "lucide-react";

// Navigation items (kept for layout consistency)
const navItems: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Products & Categories", icon: Package, submenu: [
    { title: "All Products", url: "/admin/products", icon: Package },
    { title: "Add New Product", url: "/admin/products/new", icon: Package },
    { title: "Product Pricing & Margin", url: "/admin/products/pricing", icon: DollarSign },
    { title: "Product Status", url: "/admin/products/status", icon: TrendingUp },
    { title: "Category List", url: "/admin/categories", icon: FileText },
    { title: "Add / Edit Category", url: "/admin/categories/manage", icon: FileText },
    { title: "Category Commission Rules", url: "/admin/categories/commission", icon: Percent },
    { title: "Services & Digital Products", url: "/admin/services", icon: ShoppingCart },
  ]},
  { title: "Commission & Profit Engine", icon: Percent, warning: true, submenu: [
    { title: "B2B Commission Structure", url: "/admin/commission/b2b", icon: Building2 },
    { title: "B2C Commission Structure", url: "/admin/commission/b2c", icon: Users },
    { title: "Referral Percentage Rules", url: "/admin/commission/referral", icon: UsersRound },
    { title: "Profit Distribution", url: "/admin/commission/profit", icon: DollarSign },
    { title: "Trust Fund Rules", url: "/admin/commission/trust", icon: ShieldCheck },
    { title: "Company Share Rules", url: "/admin/commission/company", icon: Building2 },
    { title: "Core Body Share Rules", url: "/admin/commission/corebody", icon: Users },
    { title: "Stock Point Share Rules", url: "/admin/commission/stockpoint", icon: Warehouse },
  ]},
  { title: "District & Core Body", icon: MapPin, submenu: [
    { title: "All Districts", url: "/admin/districts", icon: MapPin },
    // { title: "Add / Edit District", url: "/admin/districts/manage", icon: MapPin },
    { title: "District Performance", url: "/admin/districts/performance", icon: BarChart3 },
    { title: "Core Body List", url: "/admin/corebody", icon: Users },
    // { title: "Core Body A Management", url: "/admin/corebody/a", icon: Users },
    // { title: "Core Body B Management", url: "/admin/corebody/b", icon: Users },
  ]},
  { title: "Users & Roles", icon: Users, submenu: [
    { title: "All Businessmen", url: "/admin/users/businessmen", icon: Users },
    // { title: "Entry Mode Users", url: "/admin/users/entry", icon: Users },
    // { title: "Advance Mode Users", url: "/admin/users/advance", icon: Users },
    // { title: "Bulk Users", url: "/admin/users/bulk", icon: Users },
    { title: "Stock Point List", url: "/admin/users/stockpoints", icon: Warehouse },
    { title: "Role Permissions", url: "/admin/users/roles", icon: ShieldCheck },
    { title: "Feature Access Control", url: "/admin/users/features", icon: Settings },
  ]},
  { title: "Wallets & Finance", icon: Wallet, warning: true, submenu: [
    { title: "Main Wallet", url: "/admin/wallet/main", icon: DollarSign },
    { title: "Referral Wallet", url: "/admin/wallet/referral", icon: UsersRound },
    { title: "Trust Wallet", url: "/admin/wallet/trust", icon: ShieldCheck },
    { title: "Reserve Fund Wallet", url: "/admin/wallet/reserve", icon: Warehouse },
    { title: "Withdrawal Requests", url: "/admin/wallet/withdrawals", icon: DollarSign },
    { title: "Pending Approvals", url: "/admin/wallet/approvals", icon: AlertTriangle },
    { title: "Approved / Rejected History", url: "/admin/wallet/history", icon: FileText },
    { title: "TDS Configuration", url: "/admin/finance/tds", icon: Percent },
    { title: "Processing Fee Rules", url: "/admin/finance/fees", icon: DollarSign },
  ]},
  { title: "Orders & Transactions", icon: ShoppingCart, submenu: [
    { title: "All Orders", url: "/admin/orders", icon: ShoppingCart },
    { title: "B2B Orders", url: "/admin/orders/b2b", icon: Building2 },
    { title: "B2C Orders", url: "/admin/orders/b2c", icon: Users },
    { title: "Bulk Orders", url: "/admin/orders/bulk", icon: Package },
    { title: "Order Returns & Refunds", url: "/admin/orders/refunds", icon: Receipt },
    { title: "Transaction Logs", url: "/admin/transactions", icon: FileText },
    { title: "Ledger View", url: "/admin/ledger", icon: FileText },
  ]},
  { title: "Risk, Fraud & Compliance", icon: ShieldAlert, warning: true, submenu: [
    { title: "Suspicious Transactions", url: "/admin/fraud/transactions", icon: AlertTriangle },
    { title: "Fake Orders", url: "/admin/fraud/orders", icon: ShoppingCart },
    { title: "Duplicate Accounts", url: "/admin/fraud/accounts", icon: Users },
    { title: "Device Tracking Flags", url: "/admin/fraud/devices", icon: AlertTriangle },
    { title: "PAN / Aadhaar Verification", url: "/admin/compliance/kyc", icon: ShieldCheck },
    { title: "Cap Violation Reports", url: "/admin/compliance/cap", icon: AlertTriangle },
    { title: "Referral Abuse Detection", url: "/admin/compliance/referral", icon: Users },
    { title: "Actions & Freezes", url: "/admin/fraud/actions", icon: ShieldAlert },
  ]},
  { title: "Audit & System Logs", icon: FileText, submenu: [
    { title: "Admin Activity Logs", url: "/admin/audit/admin", icon: FileText },
    { title: "Financial Audit Logs", url: "/admin/audit/financial", icon: DollarSign },
    { title: "Rule Change History", url: "/admin/audit/rules", icon: FileText },
    { title: "Login & Access Logs", url: "/admin/audit/login", icon: ShieldCheck },
  ]},
  { title: "Settings", icon: Settings, submenu: [
    { title: "Platform Settings", url: "/admin/settings/platform", icon: Settings },
    { title: "Notification Rules", url: "/admin/settings/notifications", icon: AlertTriangle },
    { title: "API & Integration", url: "/admin/settings/api", icon: Settings },
    { title: "Language & Localization", url: "/admin/settings/language", icon: Settings },
    { title: "Maintenance Mode", url: "/admin/settings/maintenance", icon: Settings },
  ]},
];

export default function CoreBodyList() {
  const { theme } = useTheme();
  const [coreBodies, setCoreBodies] = useState<CoreBodySummary[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await coreBodyApi.getAllCoreBodies({
        type: typeFilter,
        status: statusFilter
      });
      setCoreBodies(data.coreBodies);
      setKpis(data.kpis);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch core bodies:", err);
      setError("Failed to load core bodies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Table columns
  const columns = [
    {
      header: "Core Body Name",
      accessor: (row: CoreBodySummary) => (
        <div>
          <Link 
            to={`/admin/corebody/${row.type.toLowerCase()}?id=${row.id}`}
            className="font-semibold text-card-foreground hover:text-primary hover:underline"
          >
            {row.name}
          </Link>
          <p className="text-xs text-muted-foreground">{row.id}</p>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row: CoreBodySummary) => <CoreBodyTypeBadge type={row.type} />,
    },
    {
      header: "District",
      accessor: (row: CoreBodySummary) => (
        <Link 
          to={`/admin/districts/performance?id=${row.district_id}`}
          className="text-sm hover:text-primary"
        >
          {row.district}
        </Link>
      ),
    },
    {
      header: "Investment",
      accessor: (row: CoreBodySummary) => (
        <span className="font-mono text-sm">₹{row.investment_amount.toLocaleString()}</span>
      ),
    },
    {
      header: "Earnings (YTD)",
      accessor: (row: CoreBodySummary) => (
        <span className="font-mono text-sm font-semibold text-profit">
          ₹{row.ytd_earnings.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Cap Usage",
      accessor: (row: CoreBodySummary) => (
        <div className="w-24">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{row.cap_usage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.cap_usage >= 100 ? "bg-destructive" :
                row.cap_usage >= 80 ? "bg-warning" : "bg-cap"
              }`}
              style={{ width: `${row.cap_usage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: CoreBodySummary) => <StatusBadge status={row.status} />,
    },
    {
      header: "Action",
      accessor: (row: CoreBodySummary) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/corebody/${row.type.toLowerCase()}?id=${row.id}`}>
              <MoreVertical className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  if (loading && coreBodies.length === 0) {
    return (
      <DashboardLayout navItems={navItems} role="admin" roleLabel="Administrator">
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Synchronizing Core Body Database...</p>
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
            <h1 className="text-2xl font-bold text-card-foreground">Core Body List</h1>
            <p className="text-sm text-muted-foreground">
              Master list of all district authorities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Core Bodies"
              value={kpis.total_core_bodies.toString()}
              icon={Users}
              variant="default"
              subtitle={`Type A: ${kpis.type_a}, Type B: ${kpis.type_b}`}
            />
            <KPICard
              title="Active Hubs"
              value={kpis.active.toString()}
              icon={TrendingUp}
              variant="profit"
              subtitle="Currently operational"
            />
            <KPICard
              title="Total Investment"
              value={`₹${(kpis.total_investment / 100000).toFixed(1)}L`}
              icon={DollarSign}
              variant="default"
              subtitle="System total"
            />
            <KPICard
              title="Total Earnings (YTD)"
              value={`₹${(kpis.total_earnings / 100000).toFixed(1)}L`}
              icon={TrendingUp}
              variant="profit"
              subtitle="Hub total performance"
            />
          </div>
        )}

        {/* Quick Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Operational Filters</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fetchList()}>
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <QuickFilterChip 
                label="All Hubs" 
                active={typeFilter === null && statusFilter === null} 
                count={coreBodies.length}
                onClick={() => { setTypeFilter(null); setStatusFilter(null); }}
              />
              <div className="w-px h-8 bg-border mx-2" />
              <QuickFilterChip 
                label="Type A" 
                active={typeFilter === "A"}
                onClick={() => setTypeFilter(typeFilter === "A" ? null : "A")}
              />
              <QuickFilterChip 
                label="Type B" 
                active={typeFilter === "B"}
                onClick={() => setTypeFilter(typeFilter === "B" ? null : "B")}
              />
              <div className="w-px h-8 bg-border mx-2" />
              <QuickFilterChip 
                label="Active" 
                active={statusFilter === "active"}
                onClick={() => setStatusFilter(statusFilter === "active" ? null : "active")}
              />
              <QuickFilterChip 
                label="Inactive" 
                active={statusFilter === "inactive"}
                onClick={() => setStatusFilter(statusFilter === "inactive" ? null : "inactive")}
              />
              <QuickFilterChip 
                label="Cap Warning" 
                active={statusFilter === "warning"}
                onClick={() => setStatusFilter(statusFilter === "warning" ? null : "warning")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <DataTable 
          columns={columns as any} 
          data={coreBodies as any}
          title={`Core Bodies (${coreBodies.length})`}
        />

        {/* Bottom Performance Grid */}
        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Avg Invest (A)" value="₹1.0L" />
            <StatCard title="Avg Invest (B)" value="₹0.5L" />
            <StatCard title="Cap Alerts" value={kpis.cap_warning.toString()} trend={kpis.cap_warning > 0 ? "down" : "up"} trendValue="Action Req" />
            <StatCard title="System Integrity" value="100%" subtitle="Verified" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
