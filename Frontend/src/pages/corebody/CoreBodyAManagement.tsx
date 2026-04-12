import { useState, useEffect, useCallback } from "react";
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
import { coreBodyApi, CoreBodyDetail, CoreBodyDetailResponse } from "@/lib/coreBodyApi";
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
  Loader2,
} from "lucide-react";


export default function CoreBodyAManagement() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  
  const [data, setData] = useState<CoreBodyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) {
      setError("No Core Body ID provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await coreBodyApi.getCoreBodyById(id);
      setData(response);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch core body data:", err);
      setError("Failed to load core body details. It may not exist or you lack permission.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading Core Body Profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div>
          <h2 className="text-xl font-bold">Data Access Error</h2>
          <p className="text-muted-foreground">{error || "Core Body not found."}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin/corebody">Back to List</Link>
        </Button>
      </div>
    );
  }

  const { profile, earningsHistory, recentActivity } = data;
  const trustFundContrib = profile.ytd_earnings * 0.10;
  const remainingCap = profile.annual_cap - profile.ytd_earnings;
  const paidInstallments = profile.installments.filter(i => i.paid_date).length;

  return (
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
                <h1 className="text-2xl font-bold text-card-foreground">{profile.name}</h1>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  Type {profile.type}
                </Badge>
                <StatusBadge status={profile.status as any} />
              </div>
              <p className="text-sm text-muted-foreground">
                {profile.district}, {profile.state} • {profile.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => fetchData()}>
              <History className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  {profile.is_active ? "Deactivate" : "Activate"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {profile.is_active ? "Deactivate" : "Activate"} Core Body
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to {profile.is_active ? "deactivate" : "activate"} {profile.name}? 
                    {profile.is_active 
                      ? " This will prevent new registrations but preserve historical data."
                      : " This hub will reappear in active lists and be able to receive earnings."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => setShowDeactivateDialog(false)}>
                    Confirm
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
            value={`₹${(profile.investment_amount / 100000).toFixed(1)}L`}
            icon={DollarSign}
            variant="default"
            subtitle={`Installment ${paidInstallments}/${profile.installment_count}`}
          />
          <KPICard
            title="Earnings (YTD)"
            value={`₹${(profile.ytd_earnings / 100000).toFixed(2)}L`}
            icon={TrendingUp}
            variant="profit"
            subtitle="Year to date"
          />
          <KPICard
            title="Remaining Cap"
            value={`₹${(remainingCap / 100000).toFixed(2)}L`}
            icon={AlertTriangle}
            variant={remainingCap < 500000 ? "warning" : "cap"}
            subtitle={`of ₹${(profile.annual_cap / 100000).toFixed(0)}L annual limit`}
          />
          <KPICard
            title="Businessmen"
            value={profile.businessman_count.toString()}
            icon={Users}
            variant="default"
            subtitle="Linked members"
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
                      amount={profile.investment_amount} 
                      installment={paidInstallments}
                      totalInstallments={profile.installment_count}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={profile.is_approved ? "default" : "secondary"}>
                        {profile.is_approved ? "Approved" : "Pending Approval"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Installment Progress</p>
                  <CapacityBar 
                    used={paidInstallments} 
                    max={profile.installment_count}
                    size="md"
                    showLabel={false}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{paidInstallments} Paid</span>
                    <span>{profile.installment_count} Total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annual Earning Cap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Annual Earning Cap</CardTitle>
                <CardDescription>₹{(profile.annual_cap ?? 0).toLocaleString()} maximum annual earnings limit</CardDescription>
              </CardHeader>
              <CardContent>
                <EarningsCapIndicator 
                  current={profile.ytd_earnings ?? 0}
                  max={profile.annual_cap ?? 0}
                  period="annual"
                />
                {(profile.ytd_earnings ?? 0) >= (profile.annual_cap ?? 0) && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Cap limit reached - earnings auto-stopped
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Earnings History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Earnings History</CardTitle>
                <CardDescription>Monthly earnings this fiscal year</CardDescription>
              </CardHeader>
              <CardContent>
                {earningsHistory.length > 0 ? (
                  <div className="space-y-3">
                    {earningsHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{item.month}</span>
                        <span className="font-mono font-semibold">₹{(item.amount ?? 0).toLocaleString()}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-muted-foreground">Total YTD</span>
                      <span className="font-mono text-profit">₹{(profile.ytd_earnings ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-muted-foreground">
                    <p>No earnings history found for this period.</p>
                  </div>
                )}
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
                  <Link to={`/admin/districts/performance?id=${profile.district_id}`} className="text-sm font-medium hover:text-primary">
                    {profile.district}
                  </Link>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm font-mono">{new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Contact</span>
                  <span className="text-sm font-mono">{profile.phone}</span>
                </div>
                <Separator />
                <TrustFundDisplay amount={trustFundContrib} percentage={10} />
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
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 text-sm">
                        <div className={`mt-1 h-2 w-2 rounded-full ${
                          activity.type === "credit" ? "bg-profit" :
                          activity.type === "debit" ? "bg-warning" : "bg-muted-foreground"
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium capitalize">{activity.action.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                        </div>
                        {activity.amount > 0 && (
                          <span className={`font-mono ${
                            activity.type === "credit" ? "text-profit" : "text-warning"
                          }`}>
                            {activity.type === "credit" ? "+" : "-"}₹{(activity.amount ?? 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <p className="text-xs">No recent transactions recorded.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="MTD Earnings" value={`₹${((profile.mtd_earnings ?? 0) / 1000).toFixed(1)}K`} />
          <StatCard title="Trust Contrib." value={`₹${(trustFundContrib / 1000).toFixed(1)}K`} />
          <StatCard title="System Type" value={profile.type} />
          <StatCard title="Hub Status" value={profile.is_active ? "Healthy" : "Suspended"} />
        </div>
      </div>
  );
}
