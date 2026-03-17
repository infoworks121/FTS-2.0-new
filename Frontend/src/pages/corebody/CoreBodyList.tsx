import { useState } from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickFilterChip, CoreBodyTypeBadge, EarningsCapIndicator, StatCard } from "@/components/districts";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";
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
} from "lucide-react";

// Sample Core Body data
const coreBodyData = [
  {
    id: "CB001",
    name: "ABC Traders",
    type: "A" as const,
    district: "North Delhi",
    investment: 100000,
    earningsYTD: 1850000,
    capUsage: 74,
    status: "active" as const,
  },
  {
    id: "CB002",
    name: "XYZ Enterprises",
    type: "A" as const,
    district: "South Mumbai",
    investment: 100000,
    earningsYTD: 2120000,
    capUsage: 85,
    status: "warning" as const,
  },
  {
    id: "CB003",
    name: "City Store",
    type: "B" as const,
    district: "North Delhi",
    investment: 50000,
    earningsYTD: 420000,
    capUsage: 42,
    status: "active" as const,
  },
  {
    id: "CB004",
    name: "Metro Goods",
    type: "B" as const,
    district: "East Kolkata",
    investment: 50000,
    earningsYTD: 380000,
    capUsage: 38,
    status: "inactive" as const,
  },
  {
    id: "CB005",
    name: "Urban Supplies",
    type: "A" as const,
    district: "West Ahmedabad",
    investment: 100000,
    earningsYTD: 1650000,
    capUsage: 66,
    status: "active" as const,
  },
  {
    id: "CB006",
    name: "Prime Distributors",
    type: "A" as const,
    district: "Central Bangalore",
    investment: 100000,
    earningsYTD: 2450000,
    capUsage: 98,
    status: "cap-reached" as const,
  },
  {
    id: "CB007",
    name: "Smart Buy",
    type: "B" as const,
    district: "Chennai Central",
    investment: 50000,
    earningsYTD: 520000,
    capUsage: 52,
    status: "active" as const,
  },
  {
    id: "CB008",
    name: "Value Mart",
    type: "B" as const,
    district: "Hyderabad Metro",
    investment: 50000,
    earningsYTD: 280000,
    capUsage: 28,
    status: "inactive" as const,
  },
];

// KPI Summary
const kpiData = {
  totalCoreBodies: 8,
  typeA: 4,
  typeB: 4,
  active: 5,
  inactive: 2,
  capWarning: 1,
  totalInvestment: 600000,
  totalEarnings: 10295000,
};

// Navigation items
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
    { title: "Add / Edit District", url: "/admin/districts/manage", icon: MapPin },
    { title: "District Performance", url: "/admin/districts/performance", icon: BarChart3 },
    { title: "Core Body List", url: "/admin/corebody", icon: Users },
    { title: "Core Body A Management", url: "/admin/corebody/a", icon: Users },
    { title: "Core Body B Management", url: "/admin/corebody/b", icon: Users },
  ]},
  { title: "Users & Roles", icon: Users, submenu: [
    { title: "All Businessmen", url: "/admin/users/businessmen", icon: Users },
    { title: "Entry Mode Users", url: "/admin/users/entry", icon: Users },
    { title: "Advance Mode Users", url: "/admin/users/advance", icon: Users },
    { title: "Bulk Users", url: "/admin/users/bulk", icon: Users },
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
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter data
  const filteredData = coreBodyData.filter(cb => {
    if (typeFilter && cb.type !== typeFilter) return false;
    if (statusFilter && cb.status !== statusFilter) return false;
    return true;
  });

  // Count filters
  const activeTypeA = coreBodyData.filter(cb => cb.type === "A" && cb.status === "active").length;
  const activeTypeB = coreBodyData.filter(cb => cb.type === "B" && cb.status === "active").length;
  const inactiveCount = coreBodyData.filter(cb => cb.status === "inactive").length;
  const capWarningCount = coreBodyData.filter(cb => cb.capUsage >= 80).length;

  // Table columns
  const columns = [
    {
      header: "Core Body Name",
      accessor: (row: any) => (
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
      accessor: (row: any) => <CoreBodyTypeBadge type={row.type} />,
    },
    {
      header: "District",
      accessor: (row: any) => (
        <Link 
          to={`/admin/districts/performance?id=${row.id}`}
          className="text-sm hover:text-primary"
        >
          {row.district}
        </Link>
      ),
    },
    {
      header: "Investment",
      accessor: (row: any) => (
        <span className="font-mono text-sm">₹{row.investment.toLocaleString()}</span>
      ),
    },
    {
      header: "Earnings (YTD)",
      accessor: (row: any) => (
        <span className="font-mono text-sm font-semibold text-profit">
          ₹{row.earningsYTD.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Cap Usage",
      accessor: (row: any) => (
        <div className="w-24">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{row.capUsage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.capUsage >= 100 ? "bg-destructive" :
                row.capUsage >= 80 ? "bg-warning" : "bg-cap"
              }`}
              style={{ width: `${row.capUsage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      header: "Action",
      accessor: (row: any) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Core Bodies"
            value={kpiData.totalCoreBodies.toString()}
            icon={Users}
            variant="default"
            subtitle={`Type A: ${kpiData.typeA}, Type B: ${kpiData.typeB}`}
          />
          <KPICard
            title="Active Core Bodies"
            value={kpiData.active.toString()}
            change="+2"
            changeType="positive"
            icon={TrendingUp}
            variant="profit"
            subtitle="Currently operational"
          />
          <KPICard
            title="Total Investment"
            value={`₹${(kpiData.totalInvestment / 100000).toFixed(1)}L`}
            icon={DollarSign}
            variant="default"
            subtitle="Across all bodies"
          />
          <KPICard
            title="Total Earnings (YTD)"
            value={`₹${(kpiData.totalEarnings / 100000).toFixed(1)}L`}
            change="+22.5%"
            changeType="positive"
            icon={TrendingUp}
            variant="profit"
            subtitle="YTD Performance"
          />
        </div>

        {/* Quick Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filter Core Bodies</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <QuickFilterChip 
                label="All" 
                active={typeFilter === null && statusFilter === null} 
                count={coreBodyData.length}
                onClick={() => { setTypeFilter(null); setStatusFilter(null); }}
              />
              <div className="w-px h-8 bg-border mx-2" />
              <QuickFilterChip 
                label="Type A" 
                active={typeFilter === "A"}
                count={activeTypeA}
                onClick={() => setTypeFilter(typeFilter === "A" ? null : "A")}
              />
              <QuickFilterChip 
                label="Type B" 
                active={typeFilter === "B"}
                count={activeTypeB}
                onClick={() => setTypeFilter(typeFilter === "B" ? null : "B")}
              />
              <div className="w-px h-8 bg-border mx-2" />
              <QuickFilterChip 
                label="Active" 
                active={statusFilter === "active"}
                count={kpiData.active}
                onClick={() => setStatusFilter(statusFilter === "active" ? null : "active")}
              />
              <QuickFilterChip 
                label="Inactive" 
                active={statusFilter === "inactive"}
                count={inactiveCount}
                onClick={() => setStatusFilter(statusFilter === "inactive" ? null : "inactive")}
              />
              <QuickFilterChip 
                label="Cap Warning" 
                active={statusFilter === "warning"}
                count={capWarningCount}
                onClick={() => setStatusFilter(statusFilter === "warning" ? null : "warning")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <DataTable 
          columns={columns} 
          data={filteredData}
          title={`Core Bodies (${filteredData.length})`}
        />

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Avg Investment (A)" value="₹1,00,000" />
          <StatCard title="Avg Investment (B)" value="₹50,000" />
          <StatCard title="Avg Earnings (A)" value="₹20.2L" trend="up" trendValue="+15%" />
          <StatCard title="Avg Earnings (B)" value="₹4.0L" trend="up" trendValue="+8%" />
        </div>
      </div>
    </DashboardLayout>
  );
}
