import { useState } from "react";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EarningsCapIndicator, InvestmentDisplay, TrustFundDisplay, CapacityBar, StatCard } from "@/components/districts";
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
  ArrowUpCircle,
  Clock,
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
  History,
  Ban,
} from "lucide-react";

// Sample Core Body B data
const coreBodyBData = {
  id: "CB003",
  name: "City Store",
  district: "North Delhi",
  state: "Delhi",
  status: "active",
  investment: 50000,
  monthlyCap: 100000,
  currentMonthlyEarnings: 42000,
  category: "Retail",
  dealerConnections: 8,
  lastActive: "2026-02-17",
  joinedDate: "2025-03-10",
};

// Earnings history
const earningsHistory = [
  { month: "Aug", amount: 35000 },
  { month: "Sep", amount: 42000 },
  { month: "Oct", amount: 38000 },
  { month: "Nov", amount: 45000 },
  { month: "Dec", amount: 52000 },
  { month: "Jan", amount: 48000 },
  { month: "Feb", amount: 42000 },
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

export default function CoreBodyBManagement() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  // Calculate values
  const monthlyCapPercentage = (coreBodyBData.currentMonthlyEarnings / coreBodyBData.monthlyCap) * 100;
  const remainingMonthlyCap = coreBodyBData.monthlyCap - coreBodyBData.currentMonthlyEarnings;
  const isEligibleForUpgrade = coreBodyBData.investment >= 100000 && coreBodyBData.dealerConnections >= 10;

  return (
    <DashboardLayout navItems={navItems} role="admin" roleLabel="Administrator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin/corebody">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-card-foreground">{coreBodyBData.name}</h1>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Type B
                </Badge>
                <StatusBadge status={coreBodyBData.status as any} />
              </div>
              <p className="text-sm text-muted-foreground">
                {coreBodyBData.district}, {coreBodyBData.state} • {coreBodyBData.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Deactivate</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate Core Body</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to deactivate {coreBodyBData.name}? This will prevent new registrations but preserve historical data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setShowDeactivateDialog(false)}>
                    Confirm Deactivation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Investment"
            value={`₹${(coreBodyBData.investment / 1000).toFixed(0)}K`}
            icon={DollarSign}
            variant="default"
            subtitle="One-time payment"
          />
          <KPICard
            title="Current Earnings"
            value={`₹${(coreBodyBData.currentMonthlyEarnings / 1000).toFixed(1)}K`}
            change="+8.5%"
            changeType="positive"
            icon={TrendingUp}
            variant="profit"
            subtitle="This month"
          />
          <KPICard
            title="Monthly Cap"
            value={`₹${(coreBodyBData.monthlyCap / 1000).toFixed(0)}K`}
            icon={AlertTriangle}
            variant="cap"
            subtitle={`${remainingMonthlyCap / 1000}K remaining`}
          />
          <KPICard
            title="Dealer Connections"
            value={coreBodyBData.dealerConnections.toString()}
            change="+2"
            changeType="positive"
            icon={Users}
            variant="default"
            subtitle="Active dealers"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Earning Cap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Earning Cap</CardTitle>
                <CardDescription>Flexible monthly limit for Type B Core Bodies</CardDescription>
              </CardHeader>
              <CardContent>
                <EarningsCapIndicator 
                  current={coreBodyBData.currentMonthlyEarnings}
                  max={coreBodyBData.monthlyCap}
                  period="monthly"
                />
                {monthlyCapPercentage >= 80 && monthlyCapPercentage < 100 && (
                  <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-sm text-warning font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Approaching monthly cap limit ({monthlyCapPercentage.toFixed(0)}%)
                    </p>
                  </div>
                )}
                {monthlyCapPercentage >= 100 && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium flex items-center gap-2">
                      <Ban className="h-4 w-4" />
                      Monthly cap reached - earnings stopped until next month
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment & Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Investment & Specialization</CardTitle>
                <CardDescription>Core Body profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Investment Amount</p>
                    <InvestmentDisplay amount={coreBodyBData.investment} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
                    <Badge variant="outline">{coreBodyBData.category}</Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Restrictions</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-muted">
                      <Ban className="h-3 w-3 mr-1" />
                      No Stock Issue
                    </Badge>
                    <Badge variant="secondary" className="bg-muted">
                      Monthly Cap Only
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Earnings History</CardTitle>
                <CardDescription>Monthly breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {earningsHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-profit rounded-full"
                            style={{ width: `${(item.amount / coreBodyBData.monthlyCap) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm w-16 text-right">₹{(item.amount / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">District</span>
                  <Link to={`/admin/districts/performance?id=${coreBodyBData.id}`} className="text-sm font-medium hover:text-primary">
                    {coreBodyBData.district}
                  </Link>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm font-mono">{coreBodyBData.joinedDate}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Active</span>
                  <span className="text-sm font-mono">{coreBodyBData.lastActive}</span>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Eligibility */}
            <Card className={isEligibleForUpgrade ? "border-profit/30" : ""}>
              <CardHeader>
                <CardTitle className="text-base">Upgrade to Type A</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Investment ₹1L+</span>
                    <span className={coreBodyBData.investment >= 100000 ? "text-profit" : "text-muted-foreground"}>
                      {coreBodyBData.investment >= 100000 ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">10+ Dealers</span>
                    <span className={coreBodyBData.dealerConnections >= 10 ? "text-profit" : "text-muted-foreground"}>
                      {coreBodyBData.dealerConnections >= 10 ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
                <Separator />
                {isEligibleForUpgrade ? (
                  <Button className="w-full bg-profit hover:bg-profit/90">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Upgrade to Type A
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" disabled>
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Not Eligible
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Need ₹1L investment and 10+ dealers
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Reactivation Option (for inactive) */}
            {coreBodyBData.status === "inactive" && (
              <Card className="border-warning/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-warning">
                    <Clock className="h-4 w-4" />
                    Reactivation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    This Core Body is currently inactive. Reactivate to restore full access.
                  </p>
                  <Button className="w-full bg-profit hover:bg-profit/90">
                    Reactivate
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Dealer Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dealer Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold font-mono text-card-foreground">
                    {coreBodyBData.dealerConnections}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Dealers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Monthly Avg" value="₹44K" trend="up" trendValue="+5%" />
          <StatCard title="YTD Earnings" value="₹3.0L" trend="up" trendValue="+18%" />
          <StatCard title="Cap Utilization" value={`${monthlyCapPercentage.toFixed(0)}%`} />
          <StatCard title="Health Score" value="85%" subtitle="Good" />
        </div>
      </div>
    </DashboardLayout>
  );
}
