import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Truck, 
  Users, 
  Wallet, 
  Store, 
  Box, 
  ArrowRightCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { dealerApi } from "@/lib/dealerApi";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

export default function DealerDashboard() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const navItems = getDealerNavItems();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(user.full_name || "Dealer");

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dealerApi.getDealerDashboard();
        setStats(res.stats);
      } catch (err) {
        console.error("Failed to load dealer stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout 
      role="dealer" 
      navItems={navItems as any} 
      roleLabel="Subdivision Agent"
    >
      <div className="space-y-6 text-foreground">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dealer Portal: {userName} 👋</h1>
          <p className="text-muted-foreground">Manage your subdivision products and B2B fulfillment</p>
        </header>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Territory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Subdivision</span>
                  <span className="text-lg font-black text-slate-800">{stats?.profile?.subdivision_name || "Loading..."}</span>
                </div>
                <div className="flex flex-col border-t border-blue-500/10 pt-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">District</span>
                  <span className="text-sm font-bold text-slate-700">{stats?.profile?.district_name || "N/A"} District</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Stock Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-mono text-emerald-600">{stats?.inventory?.total_stock || 0}</span>
                <span className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">Auto-assigned Units</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Assigned Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{stats?.assigned_products?.length || 0}</span>
                <span className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">Core Specializations</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Active Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-mono">₹0.00</span>
                <span className="text-[10px] text-muted-foreground mt-1 tracking-wider uppercase">Earnings Tracked Soon</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="B2B Orders Handled" 
            value="38" 
            icon={Truck} 
            variant="profit" 
            subtitle="Lifetime fulfillments"
          />
          <KPICard 
            title="Pending Orders" 
            value="4" 
            icon={Clock} 
            variant="warning" 
            subtitle="Awaiting dispatch"
          />
          <KPICard 
            title="Active Network" 
            value="45" 
            icon={Users} 
            subtitle="Businessmen in zone"
          />
          <KPICard 
            title="Stock Alerts" 
            value="0" 
            icon={Box} 
            variant="risk" 
            subtitle="Low stock warnings"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                My Assigned Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.assigned_products?.length > 0 ? (
                  stats.assigned_products.map((p: any) => (
                    <div key={p.id} className="group p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{p.sku}</span>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold text-emerald-500 border-emerald-500/30 bg-emerald-500/5">Dealer-Routed</Badge>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{p.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic">
                        <ArrowRightCircle className="h-3 w-3" />
                        Exclusive in {stats?.profile?.subdivision_name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    <Box className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-xs font-medium italic">No products currently assigned to your profile.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Recent B2B Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                 title=""
                 columns={[
                   { header: "Order ID", accessor: "order_no" },
                   { header: "Businessman", accessor: "customer" },
                   { header: "Qty", accessor: "qty" },
                   { header: "Status", accessor: (row) => <StatusBadge status={row.status as any} /> }
                 ]}
                 data={[
                   { order_no: "#ORD-1029", customer: "Arjun Traders", qty: "50", status: "processing" },
                   { order_no: "#ORD-1025", customer: "Singh Supply", qty: "120", status: "completed" },
                   { order_no: "#ORD-1021", customer: "Priya Agencies", qty: "75", status: "completed" }
                 ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
