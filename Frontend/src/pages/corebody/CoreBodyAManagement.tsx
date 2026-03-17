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
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
  History,
} from "lucide-react";

// Sample Core Body A data
const coreBodyAData = {
  id: "CB001",
  name: "ABC Traders",
  district: "North Delhi",
  state: "Delhi",
  status: "active",
  investment: 100000,
  currentInstallment: 12,
  totalInstallments: 12,
  annualCap: 2500000,
  currentEarnings: 1850000,
  stockIssuing: true,
  businessmanCount: 24,
  lastActive: "2026-02-18",
  joinedDate: "2024-06-15",
};

// Earnings breakdown
const earningsBreakdown = [
  { month: "Aug", amount: 145000 },
  { month: "Sep", amount: 168000 },
  { month: "Oct", amount: 182000 },
  { month: "Nov", amount: 195000 },
  { month: "Dec", amount: 210000 },
  { month: "Jan", amount: 225000 },
  { month: "Feb", amount: 185000 },
];

// Recent activity
const recentActivity = [
  { id: 1, action: "Earnings credited", amount: 185000, date: "2026-02-18", type: "credit" },
  { id: 2, action: "Businessman added", amount: 0, date: "2026-02-15", type: "info" },
  { id: 3, action: "Trust fund contribution", amount: 18500, date: "2026-02-10", type: "debit" },
  { id: 4, action: "Installment received", amount: 10000, date: "2026-02-01", type: "credit" },
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

export default function CoreBodyAManagement() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  // Calculate trust fund contribution
  const trustFundContrib = coreBodyAData.currentEarnings * 0.10;
  const remainingCap = coreBodyAData.annualCap - coreBodyAData.currentEarnings;

  // Inactivity countdown (90 days)
  const daysSinceActive = 1; // Sample
  const inactivityWarning = daysSinceActive > 60;

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
                <h1 className="text-2xl font-bold text-card-foreground">{coreBodyAData.name}</h1>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  Type A
                </Badge>
                <StatusBadge status={coreBodyAData.status as any} />
              </div>
              <p className="text-sm text-muted-foreground">
                {coreBodyAData.district}, {coreBodyAData.state} • {coreBodyAData.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Deactivate</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate Core Body</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to deactivate {coreBodyAData.name}? This will prevent new registrations but preserve historical data.
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
            value={`₹${(coreBodyAData.investment / 100000).toFixed(1)}L`}
            icon={DollarSign}
            variant="default"
            subtitle={`Installment ${coreBodyAData.currentInstallment}/${coreBodyAData.totalInstallments}`}
          />
          <KPICard
            title="Earnings (YTD)"
            value={`₹${(coreBodyAData.currentEarnings / 100000).toFixed(2)}L`}
            change="+18.5%"
            changeType="positive"
            icon={TrendingUp}
            variant="profit"
            subtitle="Year to date"
          />
          <KPICard
            title="Remaining Cap"
            value={`₹${(remainingCap / 100000).toFixed(2)}L`}
            icon={AlertTriangle}
            variant={remainingCap < 500000 ? "warning" : "cap"}
            subtitle={`of ₹${(coreBodyAData.annualCap / 100000).toFixed(0)}L annual limit`}
          />
          <KPICard
            title="Businessmen"
            value={coreBodyAData.businessmanCount.toString()}
            change="+3"
            changeType="positive"
            icon={Users}
            variant="default"
            subtitle="Active members"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Investment Details</CardTitle>
                <CardDescription>Payment and investment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Investment</p>
                    <InvestmentDisplay 
                      amount={coreBodyAData.investment} 
                      installment={coreBodyAData.currentInstallment}
                      totalInstallments={coreBodyAData.totalInstallments}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Stock Issuing</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={coreBodyAData.stockIssuing ? "default" : "secondary"}>
                        {coreBodyAData.stockIssuing ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Installment Progress</p>
                  <CapacityBar 
                    used={coreBodyAData.currentInstallment} 
                    max={coreBodyAData.totalInstallments}
                    size="md"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Annual Earning Cap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Annual Earning Cap</CardTitle>
                <CardDescription>₹25,00,000 maximum annual earnings limit</CardDescription>
              </CardHeader>
              <CardContent>
                <EarningsCapIndicator 
                  current={coreBodyAData.currentEarnings}
                  max={coreBodyAData.annualCap}
                  period="annual"
                />
                {coreBodyAData.currentEarnings >= coreBodyAData.annualCap && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Cap limit reached - earnings auto-stopped
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Earnings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Earnings Breakdown</CardTitle>
                <CardDescription>Monthly earnings this year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {earningsBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.month}</span>
                      <span className="font-mono font-semibold">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-mono text-profit">₹{earningsBreakdown.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                  </div>
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
                  <Link to={`/admin/districts/performance?id=${coreBodyAData.id}`} className="text-sm font-medium hover:text-primary">
                    {coreBodyAData.district}
                  </Link>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm font-mono">{coreBodyAData.joinedDate}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Active</span>
                  <span className="text-sm font-mono">{coreBodyAData.lastActive}</span>
                </div>
                <Separator />
                <TrustFundDisplay amount={trustFundContrib} percentage={10} />
              </CardContent>
            </Card>

            {/* Inactivity Warning */}
            {inactivityWarning && (
              <Card className="border-warning/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-warning">
                    <Clock className="h-4 w-4" />
                    Inactivity Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This Core Body has been inactive for {daysSinceActive} days. 
                    Consider reaching out or scheduling a review.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Send Reminder
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upgrade/Downgrade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Authority Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <ArrowDownCircle className="h-4 w-4 mr-2" />
                  Downgrade to Type B
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Type A Core Bodies cannot be downgraded while active
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                      <div className={`mt-1 h-2 w-2 rounded-full ${
                        activity.type === "credit" ? "bg-profit" :
                        activity.type === "debit" ? "bg-warning" : "bg-muted-foreground"
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                      {activity.amount > 0 && (
                        <span className={`font-mono ${
                          activity.type === "credit" ? "text-profit" : "text-warning"
                        }`}>
                          {activity.type === "credit" ? "+" : "-"}₹{activity.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Monthly Avg" value="₹1.85L" trend="up" trendValue="+12%" />
          <StatCard title="Trust Contrib." value={`₹${(trustFundContrib/1000).toFixed(0)}K`} />
          <StatCard title="Excess Profit" value="₹0" subtitle="Routed to trust" />
          <StatCard title="Health Score" value="92%" subtitle="Excellent" />
        </div>
      </div>
    </DashboardLayout>
  );
}
