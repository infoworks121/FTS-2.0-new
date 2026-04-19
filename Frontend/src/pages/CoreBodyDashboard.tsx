import { KPICard } from "@/components/KPICard";
import { CapProgressBar } from "@/components/CapProgressBar";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Package, Users, Wallet, TrendingUp, ArrowUpDown, ArrowRightLeft,
  DollarSign, UserCheck, AlertCircle, BarChart3, Clock, PackageCheck,
  History, RotateCcw, UserPlus, BarChart2, ShoppingBag, CheckCircle,
  Truck, AlertTriangle, CreditCard, BookOpen, TrendingDown, Award,
  CheckSquare, FileText, Download, Bell, ShieldAlert, UserX, Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

const earningsData = [
  { week: "W1", earnings: 8200 },
  { week: "W2", earnings: 12400 },
  { week: "W3", earnings: 9800 },
  { week: "W4", earnings: 15600 },
  { week: "W5", earnings: 11200 },
  { week: "W6", earnings: 18400 },
];

const todayActivity = [
  { time: "10:45 AM", action: "Stock issued to Arjun Traders", type: "stock" },
  { time: "11:20 AM", action: "New order from Priya Agencies", type: "order" },
  { time: "02:15 PM", action: "Cap warning triggered", type: "alert" },
  { time: "03:30 PM", action: "Dealer performance review completed", type: "review" },
];

const dealers = [
  { name: "Arjun Traders", zone: "Zone A", orders: 45, revenue: "₹1.8L", status: "active" as const },
  { name: "Priya Agencies", zone: "Zone B", orders: 32, revenue: "₹1.2L", status: "active" as const },
  { name: "Kumar Dist.", zone: "Zone A", orders: 12, revenue: "₹48K", status: "warning" as const },
  { name: "Singh & Co", zone: "Zone C", orders: 0, revenue: "₹0", status: "inactive" as const },
  { name: "Mehta Supply", zone: "Zone B", orders: 58, revenue: "₹2.1L", status: "cap-reached" as const },
];

import api from "@/lib/api";
import { coreBodyApi } from "@/lib/coreBodyApi";
import { dealerApi } from "@/lib/dealerApi";
import { fulfillmentApi, FulfillmentAssignment } from "@/lib/fulfillmentApi";
import { stockApi } from "@/lib/stockApi";
import { XCircle, Store, Box, PlusCircle, LayoutGrid } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CoreBodyDashboard() {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [roleCode, setRoleCode] = useState<string>('');
  const [pendingAssignments, setPendingAssignments] = useState<FulfillmentAssignment[]>([]);
  
  // Stock Issuance State
  const [districtDealers, setDistrictDealers] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [issuing, setIssuing] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ dealer_id: '', product_id: '', quantity: 0, note: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.full_name || 'Core Body');
    setRoleCode(user.role_code || '');

    const fetchDash = async () => {
      try {
        setLoading(true);
        if (user.role_code === 'dealer') {
          const res = await dealerApi.getDealerDashboard();
          setStats(res.stats);
          
          const assignmentsRes = await fulfillmentApi.getAssignments('assigned');
          setPendingAssignments(assignmentsRes.fulfillments || []);
        } else {
          const res = await coreBodyApi.getMyDashboard();
          setStats(res.stats);

          // Fetch Dealers and Products for issuance
          try {
            const dealersRes = await api.get('/admin/dealers'); // Using generic dealer list for now, ideally filtered by CB district in backend
            setDistrictDealers(dealersRes.data.dealers.filter((d: any) => d.district_id === res.stats.profile.district_id));
            
            const productsRes = await api.get('/products');
            setAvailableProducts(productsRes.data.products);
          } catch (e) { console.error("Aux Data Load Fail", e); }
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDash();
  }, []);

  const totalEarnings = stats ? parseFloat(stats.earnings?.ytd || 0) : 184200;
  const monthlyEarnings = stats ? parseFloat(stats.earnings?.mtd || 0) : 84200;
  const annualCap = stats ? parseFloat(stats.earnings?.annual_cap || 2500000) : 250000;
  const monthlyCap = stats ? parseFloat(stats.earnings?.monthly_cap || stats.investment?.total_amount || 500000) : 50000;
  
  const isTypeA = stats?.profile?.type === 'A';
  const isDealer = roleCode === 'dealer';
  
  // Decide which tracker to show
  const activeEarnings = isTypeA ? totalEarnings : monthlyEarnings;
  const activeCap = isTypeA ? annualCap : monthlyCap;
  const capLabel = isTypeA ? "Annual Cap" : "Monthly Cap";
  const typeStr = stats?.profile?.type ? `Type ${stats.profile.type}` : "Type A";
  const distName = stats?.profile?.district_name || "North";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground">Good Morning, {userName} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's your business summary for today</p>
        </div>
        {!isDealer && (
          <Dialog open={showIssueModal} onOpenChange={setShowIssueModal}>
            <DialogTrigger asChild>
              <Button className="bg-profit hover:bg-profit/90 text-white gap-2">
                <PlusCircle className="h-4 w-4" />
                Issue Physical Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
              <DialogHeader>
                <DialogTitle>Issue stock to Dealer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="dealer">Select Dealer</Label>
                  <Select onValueChange={(v) => setIssueForm({...issueForm, dealer_id: v})}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose a dealer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {districtDealers.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.full_name || d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select onValueChange={(v) => setIssueForm({...issueForm, product_id: v})}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Choose product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    className="bg-background"
                    onChange={(e) => setIssueForm({...issueForm, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Dispatch Note (Internal)</Label>
                  <Input 
                    id="note" 
                    placeholder="e.g. Batch 42 dispatch" 
                    className="bg-background"
                    onChange={(e) => setIssueForm({...issueForm, note: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowIssueModal(false)}
                  disabled={issuing}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-profit text-white hover:bg-profit/90"
                  disabled={issuing || !issueForm.dealer_id || !issueForm.product_id || issueForm.quantity <= 0}
                  onClick={async () => {
                    try {
                      setIssuing(true);
                      await stockApi.issuePhysicalStock(issueForm);
                      toast.success("Stock issued successfully!");
                      setShowIssueModal(false);
                    } catch (err: any) {
                      toast.error(err.response?.data?.error || "Failed to issue stock");
                    } finally {
                      setIssuing(false);
                    }
                  }}
                >
                  {issuing ? "Issuing..." : "Confirm Dispatch"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">District</span>
              <span className="font-medium">{distName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Core Body Type</span>
              <span className="font-medium">{typeStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Since</span>
              <span className="font-medium">{stats?.profile?.activated_at ? new Date(stats.profile.activated_at).toLocaleDateString() : "Pending"}</span>
            </div>
          </CardContent>
        </Card>


        {isDealer ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-emerald-500" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-border/30 pb-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase tracking-tight">Virtual (District)</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">{stats?.inventory?.district_stock || stats?.inventory?.total_stock || 0}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground uppercase tracking-tight">Physical On-Hand</span>
                    <span className="text-2xl font-bold font-mono text-blue-400">{stats?.inventory?.physical_stock || 0}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Available for allocation</span>
                    <span>Ready for delivery</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                Earnings vs Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current</span>
                  <span className="font-mono font-medium">₹{activeEarnings.toLocaleString('en-IN')}</span>
                </div>
                <CapProgressBar current={activeEarnings} max={activeCap} label={capLabel} />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Cap Limit</span>
                  <span className="font-mono">₹{activeCap.toLocaleString('en-IN')}</span>
                </div>
                <Badge variant={stats?.earnings?.cap_hit ? "destructive" : "secondary"} className="w-full justify-center text-xs">
                   {stats?.earnings?.cap_hit ? "CAP LIMIT EXCEEDED" : `${((activeEarnings / activeCap) * 100).toFixed(1)}% utilized`}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}


        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Active Network
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dealers</span>
              <span className="font-medium">12 / 15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Businessmen</span>
              <span className="font-medium">45 / 50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Network</span>
              <span className="font-medium">57</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">{item.time}</span>
                  <span className="text-foreground line-clamp-1">{item.action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isDealer ? (
          <>
            <KPICard title="Total Orders Handled" value="38" change="+12%" changeType="positive" icon={ShoppingBag} variant="profit" />
            <KPICard title="Local Stock units" value={String(stats?.inventory?.total_stock || 0)} icon={Box} />
            <KPICard title="Assigned Products" value={String(stats?.assigned_products?.length || 0)} icon={Store} variant="warning" />
            <KPICard title="Pending Delivery" value="4" icon={Truck} variant="risk" />
          </>
        ) : (
          <>
            <KPICard title="Total Earnings (YTD)" value={`₹${totalEarnings.toLocaleString('en-IN')}`} change="" changeType="positive" icon={DollarSign} variant="profit" />
            <KPICard title="Active Dealers" value="12" icon={UserCheck} variant="cap" subtitle="3 inactive" />
            <KPICard title="Businessmen" value="45" change="+4" changeType="positive" icon={Users} />
            {["A", "B"].includes(stats?.profile?.type) ? (
              <KPICard title="Referral Earnings" value="₹2,100" change="+3 new" changeType="positive" icon={UserPlus} variant="reserve" />
            ) : (
              <KPICard title="Pending Orders" value="23" icon={Package} variant="warning" />
            )}
          </>
        )}
      </div>

      {/* Cap Progress + Chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {isDealer ? (
          <div className="rounded-lg border border-border bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold text-card-foreground">Specialized Products</h3>
            <div className="space-y-3">
              {stats?.assigned_products?.length > 0 ? (
                stats.assigned_products.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                        <Store className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{p.sku}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px]">ACTIVE</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                  No products assigned yet.
                </div>
              )}
            </div>
            <div className="mt-4 rounded-md bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">Assigned Subdivision</p>
              <p className="text-sm font-semibold text-foreground mt-1">{stats?.profile?.subdivision_name || "N/A"}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold text-card-foreground">Cap & Limits</h3>
            <CapProgressBar current={activeEarnings} max={activeCap} label={capLabel} />
            <CapProgressBar current={45} max={50} label="Businessman Slots (Demo)" />
            <CapProgressBar current={12} max={15} label="Active Dealer Limit (Demo)" />
            <div className="mt-4 rounded-md bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">Upgrade Eligibility</p>
              <p className="text-sm font-semibold text-profit mt-1">✓ Eligible for Tier 2 upgrade</p>
            </div>
            {["A", "B"].includes(stats?.profile?.type) && (
              <button 
                onClick={() => window.location.href='/corebody/referrals/my-referrals'}
                className="w-full flex items-center justify-between gap-3 rounded-md border border-border bg-profit/5 px-4 py-3 text-left transition-colors hover:bg-profit/10"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-profit/10 p-2">
                    <UserPlus className="h-4 w-4 text-profit" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">View Referral Link</p>
                    <p className="text-xs text-muted-foreground">Share & earn commission</p>
                  </div>
                </div>
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Weekly Earnings Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 15%, 18%)" />
              <XAxis dataKey="week" stroke="hsl(215, 15%, 55%)" fontSize={11} />
              <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} tickFormatter={(v) => `₹${v/1000}K`} />
              <Tooltip contentStyle={{ background: "hsl(224, 25%, 10%)", border: "1px solid hsl(224, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="earnings" stroke="hsl(192, 91%, 50%)" strokeWidth={2.5} dot={{ fill: "hsl(192, 91%, 50%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dealers Table / Assigned Orders */}
      <DataTable
        title={isDealer ? "Pending B2B Assignments" : "Dealers & Businessmen"}
        columns={isDealer ? [
          { header: "Order #", accessor: "order_number" },
          { header: "Customer", accessor: "customer_name" },
          { header: "Product", accessor: "product_name" },
          { header: "Qty", accessor: (row) => <span className="font-mono">{String(row.quantity)}</span> },
          { header: "Status", accessor: (row) => <StatusBadge status={row.status as any} /> },
        ] : [
          { header: "Name", accessor: "name" },
          { header: "Zone", accessor: "zone" },
          { header: "Orders", accessor: (row) => <span className="font-mono">{String(row.orders)}</span> },
          { header: "Revenue", accessor: "revenue", className: "font-mono" },
          { header: "Status", accessor: (row) => <StatusBadge status={row.status as any} /> },
        ]}
        data={isDealer ? pendingAssignments : dealers} // Add mock data for dealers if needed or fetch
      />
    </div>
  );
}

