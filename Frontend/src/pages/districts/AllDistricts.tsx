import { useState } from "react";
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
} from "lucide-react";

// Sample district data
const districtsData = [
  {
    id: "1",
    name: "North Delhi",
    state: "Delhi",
    coreBodyCountA: 8,
    coreBodyCountB: 12,
    maxLimit: 20,
    totalOrders: 2456,
    totalRevenue: 45678000,
    status: "active" as const,
  },
  {
    id: "2",
    name: "South Mumbai",
    state: "Maharashtra",
    coreBodyCountA: 15,
    coreBodyCountB: 5,
    maxLimit: 20,
    totalOrders: 5823,
    totalRevenue: 89234000,
    status: "active" as const,
  },
  {
    id: "3",
    name: "East Kolkata",
    state: "West Bengal",
    coreBodyCountA: 5,
    coreBodyCountB: 14,
    maxLimit: 20,
    totalOrders: 1876,
    totalRevenue: 32456000,
    status: "active" as const,
  },
  {
    id: "4",
    name: "West Ahmedabad",
    state: "Gujarat",
    coreBodyCountA: 12,
    coreBodyCountB: 8,
    maxLimit: 20,
    totalOrders: 3245,
    totalRevenue: 56789000,
    status: "active" as const,
  },
  {
    id: "5",
    name: "Central Bangalore",
    state: "Karnataka",
    coreBodyCountA: 18,
    coreBodyCountB: 2,
    maxLimit: 20,
    totalOrders: 6543,
    totalRevenue: 98765000,
    status: "warning" as const,
  },
  {
    id: "6",
    name: "Chennai Central",
    state: "Tamil Nadu",
    coreBodyCountA: 6,
    coreBodyCountB: 10,
    maxLimit: 20,
    totalOrders: 2134,
    totalRevenue: 38765000,
    status: "active" as const,
  },
  {
    id: "7",
    name: "Hyderabad Metro",
    state: "Telangana",
    coreBodyCountA: 10,
    coreBodyCountB: 8,
    maxLimit: 20,
    totalOrders: 2876,
    totalRevenue: 45678000,
    status: "active" as const,
  },
  {
    id: "8",
    name: "Pune West",
    state: "Maharashtra",
    coreBodyCountA: 3,
    coreBodyCountB: 5,
    maxLimit: 20,
    totalOrders: 876,
    totalRevenue: 12345000,
    status: "inactive" as const,
  },
];

// KPI Summary data
const kpiData = {
  totalDistricts: 8,
  activeDistricts: 7,
  totalCoreBodies: 156,
  totalRevenue: 419665000,
  avgOrdersPerDistrict: 2844,
};

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
      { title: "Add / Edit District", url: "/admin/districts/manage", icon: MapPin },
      { title: "District Performance", url: "/admin/districts/performance", icon: BarChart3 },
      { title: "Core Body List", url: "/admin/corebody", icon: Users },
      { title: "Core Body A Management", url: "/admin/corebody/a", icon: Users },
      { title: "Core Body B Management", url: "/admin/corebody/b", icon: Users },
    ],
  },
  { 
    title: "Users & Roles", 
    icon: Users,
    submenu: [
      { title: "All Businessmen", url: "/admin/users/businessmen", icon: Users },
      { title: "Entry Mode Users", url: "/admin/users/entry", icon: Users },
      { title: "Advance Mode Users", url: "/admin/users/advance", icon: Users },
      { title: "Bulk Users", url: "/admin/users/bulk", icon: Users },
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
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);

  // Get unique states
  const states = [...new Set(districtsData.map(d => d.state))];

  // Filter data based on selected filters
  const filteredData = districtsData.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (stateFilter && d.state !== stateFilter) return false;
    return true;
  });

  // Count by status
  const activeCount = districtsData.filter(d => d.status === "active").length;
  const warningCount = districtsData.filter(d => d.status === "warning").length;
  const inactiveCount = districtsData.filter(d => d.status === "inactive").length;

  // Table columns
  interface DistrictRow {
    id: string;
    name: string;
    state: string;
    coreBodyCountA: number;
    coreBodyCountB: number;
    maxLimit: number;
    totalOrders: number;
    totalRevenue: number;
    status: "active" | "inactive" | "warning";
  }

  const columns = [
    {
      header: "District Name",
      accessor: (row: DistrictRow) => (
        <div>
          <Link 
            to={`/admin/districts/performance?id=${row.id}`}
            className="font-semibold text-card-foreground hover:text-primary hover:underline"
          >
            {row.name}
          </Link>
          <p className="text-xs text-muted-foreground">{row.id}</p>
        </div>
      ),
    },
    {
      header: "State",
      accessor: (row: DistrictRow) => row.state,
    },
    {
      header: "Core Bodies (A / B)",
      accessor: (row: DistrictRow) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            A: {row.coreBodyCountA}
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            B: {row.coreBodyCountB}
          </Badge>
        </div>
      ),
    },
    {
      header: "Capacity",
      accessor: (row: DistrictRow) => (
        <CapacityBar 
          used={row.coreBodyCountA + row.coreBodyCountB} 
          max={row.maxLimit}
          showLabel={false}
          size="sm"
        />
      ),
    },
    {
      header: "Total Orders",
      accessor: (row: DistrictRow) => (
        <span className="font-mono text-sm">{row.totalOrders.toLocaleString()}</span>
      ),
    },
    {
      header: "Total Revenue",
      accessor: (row: DistrictRow) => (
        <span className="font-mono text-sm font-semibold">₹{(row.totalRevenue / 100000).toFixed(1)}L</span>
      ),
    },
    {
      header: "Status",
      accessor: (row: DistrictRow) => (
        <StatusBadge status={row.status === "active" ? "active" : row.status === "warning" ? "warning" : "inactive"} />
      ),
    },
    {
      header: "Action",
      accessor: (row: DistrictRow) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/districts/performance?id=${row.id}`}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/districts/manage?id=${row.id}`}>
              <Pencil className="h-3.5 w-3.5" />
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
            <h1 className="text-2xl font-bold text-card-foreground">All Districts</h1>
            <p className="text-sm text-muted-foreground">
              Central view of territorial expansion and management
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
            value={kpiData.totalDistricts.toString()}
            change="+2"
            changeType="positive"
            icon={MapPin}
            variant="default"
            subtitle="Active: 7, Inactive: 1"
          />
          <KPICard
            title="Total Core Bodies"
            value={kpiData.totalCoreBodies.toString()}
            change="+12"
            changeType="positive"
            icon={Users}
            variant="cap"
            subtitle="Across all districts"
          />
          <KPICard
            title="Total Revenue"
            value={`₹${(kpiData.totalRevenue / 10000000).toFixed(2)}Cr`}
            change="+18.5%"
            changeType="positive"
            icon={DollarSign}
            variant="profit"
            subtitle="YTD Performance"
          />
          <KPICard
            title="Avg Orders/District"
            value={kpiData.avgOrdersPerDistrict.toLocaleString()}
            change="+8.2%"
            changeType="positive"
            icon={ShoppingCart}
            variant="default"
            subtitle="Monthly average"
          />
        </div>

        {/* Quick Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filter Districts</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <QuickFilterChip 
                label="All" 
                active={statusFilter === null} 
                count={districtsData.length}
                onClick={() => setStatusFilter(null)}
              />
              <QuickFilterChip 
                label="Active" 
                active={statusFilter === "active"} 
                count={activeCount}
                onClick={() => setStatusFilter("active")}
              />
              <QuickFilterChip 
                label="Warning" 
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

        {/* Data Table */}
        <DataTable 
          columns={columns} 
          data={filteredData}
          title={`Districts (${filteredData.length})`}
        />

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard title="Max Limit" value="20" subtitle="Per district" />
          <StatCard title="Available Slots" value="44" subtitle="Across all" />
          <StatCard title="Type A Bodies" value="77" trend="up" trendValue="+8" />
          <StatCard title="Type B Bodies" value="79" trend="up" trendValue="+4" />
          <StatCard title="Avg Revenue/Dist" value="₹5.2Cr" trend="up" trendValue="+12%" />
          <StatCard title="Health Score" value="94%" subtitle="System healthy" />
        </div>
      </div>
    </DashboardLayout>
  );
}
