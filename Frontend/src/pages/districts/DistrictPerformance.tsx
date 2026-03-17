import { useState } from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CapacityBar, CoreBodyTypeBadge, StatCard } from "@/components/districts";
import { useTheme } from "@/hooks/useTheme";
import { Link, useSearchParams } from "react-router-dom";
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
  ArrowLeft,
  Download,
  Calendar,
  TrendingDown,
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// Sample data
const districtInfo = {
  id: "1",
  name: "North Delhi",
  state: "Delhi",
  coreBodyCountA: 8,
  coreBodyCountB: 12,
  maxLimit: 20,
  totalOrders: 2456,
  totalRevenue: 45678000,
  status: "active" as const,
};

// Revenue trend data
const revenueData = [
  { month: "Jul", b2b: 1200000, b2c: 800000 },
  { month: "Aug", b2b: 1450000, b2c: 950000 },
  { month: "Sep", b2b: 1680000, b2c: 1100000 },
  { month: "Oct", b2b: 1820000, b2c: 1280000 },
  { month: "Nov", b2b: 2100000, b2c: 1450000 },
  { month: "Dec", b2b: 2450000, b2c: 1620000 },
];

// Orders trend data
const ordersData = [
  { month: "Jul", orders: 320 },
  { month: "Aug", orders: 380 },
  { month: "Sep", orders: 420 },
  { month: "Oct", orders: 456 },
  { month: "Nov", orders: 512 },
  { month: "Dec", orders: 568 },
];

// Core body list for this district
const coreBodyList = [
  { id: "CB001", name: "ABC Traders", type: "A" as const, investment: 100000, earnings: 1850000, status: "active" as const, lastActive: "2026-02-18" },
  { id: "CB002", name: "XYZ Enterprises", type: "A" as const, investment: 100000, earnings: 2120000, status: "active" as const, lastActive: "2026-02-19" },
  { id: "CB003", name: "City Store", type: "B" as const, investment: 50000, earnings: 420000, status: "active" as const, lastActive: "2026-02-17" },
  { id: "CB004", name: "Metro Goods", type: "B" as const, investment: 50000, earnings: 380000, status: "inactive" as const, lastActive: "2025-12-10" },
  { id: "CB005", name: "Urban Supplies", type: "A" as const, investment: 100000, earnings: 1650000, status: "active" as const, lastActive: "2026-02-18" },
];

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

// Colors for charts
const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DistrictPerformance() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [timeRange, setTimeRange] = useState("6m");

  // Table columns for Core Bodies
  interface CoreBodyRow {
    id: string;
    name: string;
    type: "A" | "B";
    investment: number;
    earnings: number;
    status: "active" | "inactive";
    lastActive: string;
  }

  const columns = [
    {
      header: "Core Body",
      accessor: (row: CoreBodyRow) => (
        <div>
          <Link 
            to={`/admin/corebody/${row.type.toLowerCase()}?id=${row.id}`}
            className="font-medium text-card-foreground hover:text-primary"
          >
            {row.name}
          </Link>
          <p className="text-xs text-muted-foreground">{row.id}</p>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row: CoreBodyRow) => <CoreBodyTypeBadge type={row.type} />,
    },
    {
      header: "Investment",
      accessor: (row: CoreBodyRow) => (
        <span className="font-mono text-sm">₹{row.investment.toLocaleString()}</span>
      ),
    },
    {
      header: "Earnings (YTD)",
      accessor: (row: CoreBodyRow) => (
        <span className="font-mono text-sm font-semibold text-profit">₹{row.earnings.toLocaleString()}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row: CoreBodyRow) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: "Last Active",
      accessor: (row: CoreBodyRow) => (
        <span className="text-sm text-muted-foreground">{row.lastActive}</span>
      ),
    },
  ];

  // Calculate totals
  const totalB2B = revenueData.reduce((acc, d) => acc + d.b2b, 0);
  const totalB2C = revenueData.reduce((acc, d) => acc + d.b2c, 0);
  const totalRevenue = totalB2B + totalB2C;
  const trustFundContrib = totalRevenue * 0.10; // 10% trust fund

  return (
    <DashboardLayout navItems={navItems} role="admin" roleLabel="Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/districts">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-card-foreground">{districtInfo.name}</h1>
                <StatusBadge status={districtInfo.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {districtInfo.state} • {districtInfo.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={`₹${(totalRevenue / 100000).toFixed(2)}L`}
            change="+18.5%"
            changeType="positive"
            icon={DollarSign}
            variant="profit"
            subtitle="YTD Performance"
          />
          <KPICard
            title="Total Orders"
            value={districtInfo.totalOrders.toLocaleString()}
            change="+12.3%"
            changeType="positive"
            icon={ShoppingCart}
            variant="default"
            subtitle="All time"
          />
          <KPICard
            title="Active Core Bodies"
            value={(districtInfo.coreBodyCountA + districtInfo.coreBodyCountB).toString()}
            change="+2"
            changeType="positive"
            icon={Users}
            variant="cap"
            subtitle="Type A: 8, Type B: 12"
          />
          <KPICard
            title="Trust Fund Contrib."
            value={`₹${(trustFundContrib / 100000).toFixed(2)}L`}
            change="+15.2%"
            changeType="positive"
            icon={ShieldCheck}
            variant="trust"
            subtitle="10% of revenue"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="orders">Orders Trend</TabsTrigger>
            <TabsTrigger value="corebodies">Core Bodies</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Revenue Trend (B2B vs B2C)</CardTitle>
                  <CardDescription>Monthly breakdown by business type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${(v/1000)}K`} />
                      <Tooltip 
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Area type="monotone" dataKey="b2b" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="B2B" />
                      <Area type="monotone" dataKey="b2c" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="B2C" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Split */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Split</CardTitle>
                  <CardDescription>B2B vs B2C distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "B2B", value: totalB2B },
                          { name: "B2C", value: totalB2C },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="#8b5cf6" />
                        <Cell key="cell-1" fill="#3b82f6" />
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500" />
                      <span className="text-xs">B2B: ₹{(totalB2B/100000).toFixed(2)}L</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-xs">B2C: ₹{(totalB2C/100000).toFixed(2)}L</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Orders Trend</CardTitle>
                <CardDescription>Monthly order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ordersData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Core Bodies Tab */}
          <TabsContent value="corebodies" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Capacity Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Core Body Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                  <CapacityBar 
                    used={districtInfo.coreBodyCountA + districtInfo.coreBodyCountB} 
                    max={districtInfo.maxLimit}
                    size="lg"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type A</span>
                      <span className="font-mono font-semibold">{districtInfo.coreBodyCountA}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type B</span>
                      <span className="font-mono font-semibold">{districtInfo.coreBodyCountB}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base">Core Bodies in District</CardTitle>
                  <CardDescription>List of all registered Core Bodies</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable columns={columns} data={coreBodyList} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Heatmap Tab */}
          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">District Performance Heatmap</CardTitle>
                <CardDescription>Comparative analysis across months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {["Metric", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((header, i) => (
                    <div key={i} className={i === 0 ? "text-left font-semibold" : "text-center text-xs text-muted-foreground"}>
                      {header}
                    </div>
                  ))}
                  {[
                    { label: "Revenue", data: [2000000, 2400000, 2780000, 3100000, 3550000, 4070000], max: 5000000 },
                    { label: "Orders", data: [320, 380, 420, 456, 512, 568], max: 600 },
                    { label: "Core Bodies", data: [15, 16, 17, 18, 19, 20], max: 20 },
                    { label: "Avg Order Value", data: [6250, 6315, 6619, 6798, 6933, 7165], max: 8000 },
                  ].map((row, ri) => (
                    <>
                      <div key={`label-${ri}`} className="font-medium text-sm py-2">{row.label}</div>
                      {row.data.map((val, ci) => {
                        const intensity = val / row.max;
                        return (
                          <div 
                            key={`${ri}-${ci}`}
                            className="text-center py-2 rounded text-xs font-mono"
                            style={{ 
                              backgroundColor: `rgba(34, 197, 94, ${intensity})`,
                              color: intensity > 0.5 ? 'white' : 'inherit'
                            }}
                          >
                            {row.label.includes("Value") ? `₹${(val/1000).toFixed(1)}K` : val.toLocaleString()}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="B2B Revenue" value={`₹${(totalB2B/100000).toFixed(1)}L`} trend="up" trendValue="+18%" />
          <StatCard title="B2C Revenue" value={`₹${(totalB2C/100000).toFixed(1)}L`} trend="up" trendValue="+21%" />
          <StatCard title="Avg Order Value" value="₹6,893" trend="up" trendValue="+5%" />
          <StatCard title="Inactive Alerts" value="1" subtitle="Reactivation needed" />
        </div>
      </div>
    </DashboardLayout>
  );
}
