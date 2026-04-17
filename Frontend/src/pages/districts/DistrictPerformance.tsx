import { useState, useEffect } from "react";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CapacityBar, CoreBodyTypeBadge, StatCard } from "@/components/districts";
import { useToast } from "@/components/ui/use-toast";
import { Link, useSearchParams } from "react-router-dom";
import {
  Users,
  ShoppingCart,
  DollarSign,
  ArrowLeft,
  Download,
  Calendar,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Building2,
  Phone,
  PackageCheck,
  BarChart3,
  TrendingUp,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import geographyApi, { DistrictPerformanceResponse, SubdivisionDealers, GlobalDistrictPerformance } from "@/lib/geographyApi";

export default function DistrictPerformance() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const districtId = searchParams.get("id");

  // State for Detail View
  const [data, setData] = useState<DistrictPerformanceResponse | null>(null);
  const [dealers, setDealers] = useState<SubdivisionDealers[]>([]);
  
  // State for Global View
  const [globalData, setGlobalData] = useState<GlobalDistrictPerformance[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("6m");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (districtId) {
          // Load specific district detail
          const [perfData, dealerData] = await Promise.all([
            geographyApi.getDistrictPerformance(districtId),
            geographyApi.getDistrictDealers(districtId)
          ]);
          setData(perfData);
          setDealers(dealerData);
        } else {
          // Load global comparative performance
          const gData = await geographyApi.getGlobalPerformance();
          setGlobalData(gData);
        }
        setError(null);
      } catch (err: any) {
        console.error("Failed to load performance data:", err);
        setError("Failed to load performance data from the server.");
        toast({
          title: "Network Error",
          description: "Could not fetch performance metrics. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [districtId, toast]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Aggregating Strategic Meta-data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">System Error</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button variant="outline" asChild>
          <Link to="/admin/districts">Return to Hubs</Link>
        </Button>
      </div>
    );
  }

  // --- GLOBAL VIEW COMPONENT ---
  if (!districtId) {
    const totalGlobalRevenue = globalData.reduce((acc, d) => acc + d.total_revenue, 0);
    const totalGlobalOrders = globalData.reduce((acc, d) => acc + d.total_orders, 0);
    const avgGrowth = globalData.reduce((acc, d) => acc + parseFloat(d.growth), 0) / (globalData.length || 1);

    const columns = [
      {
        header: "District Hub",
        accessor: (row: GlobalDistrictPerformance) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Link to={`/admin/districts/performance?id=${row.id}`} className="font-bold hover:text-primary transition-colors">
                {row.name}
              </Link>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{row.state}</p>
            </div>
          </div>
        )
      },
      {
        header: "Revenue",
        accessor: (row: GlobalDistrictPerformance) => (
          <div className="space-y-1">
            <span className="font-mono font-bold text-sm text-foreground">₹{(row.total_revenue / 100000).toFixed(2)}L</span>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${parseFloat(row.growth) >= 0 ? 'text-profit' : 'text-destructive'}`} />
              <span className={`text-[10px] font-bold ${parseFloat(row.growth) >= 0 ? 'text-profit' : 'text-destructive'}`}>
                {parseFloat(row.growth) > 0 ? '+' : ''}{row.growth}%
              </span>
            </div>
          </div>
        )
      },
      {
        header: "Order Volume",
        accessor: (row: GlobalDistrictPerformance) => <span className="font-mono text-xs">{row.total_orders.toLocaleString()}</span>
      },
      {
        header: "Utilization",
        accessor: (row: GlobalDistrictPerformance) => (
          <div className="w-32">
            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
              <span>{Math.round((row.active_cb / row.max_cb) * 100)}%</span>
              <span className="text-muted-foreground">{row.active_cb}/{row.max_cb} Slots</span>
            </div>
            <CapacityBar used={row.active_cb} max={row.max_cb} size="xs" />
          </div>
        )
      },
      {
        header: "Yield Score",
        accessor: (row: GlobalDistrictPerformance) => {
          const score = row.total_orders > 0 ? (row.total_revenue / row.total_orders) : 0;
          return (
            <Badge variant="outline" className="bg-muted font-mono text-[10px]">
              Y: {(score/1000).toFixed(1)}k
            </Badge>
          );
        }
      }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Performance</h1>
            <p className="text-muted-foreground">System-wide territorial comparative analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Detailed CSV
            </Button>
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Portfolio" value={`₹${(totalGlobalRevenue / 10000000).toFixed(2)}Cr`} icon={DollarSign} variant="profit" subtitle="Current Cycle" />
          <KPICard title="Aggregate Orders" value={totalGlobalOrders.toLocaleString()} icon={ShoppingCart} variant="default" subtitle="All Hubs" />
          <KPICard title="Network Growth" value={`${avgGrowth.toFixed(1)}%`} icon={TrendingUp} variant="cap" subtitle="Avg. MTD Growth" />
          <KPICard title="Market Maturity" value="Alpha" icon={ShieldCheck} variant="trust" subtitle="High-Yield Territory" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-primary/10 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Ranking</CardTitle>
                <CardDescription>Territorial distribution by financial yield</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={globalData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.4)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total_revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                    {globalData.slice(0, 10).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.6)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
              <CardTitle>Market Leaders</CardTitle>
              <CardDescription>Highest conversion hubs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {globalData.slice(0, 5).map((dist, i) => (
                  <div key={dist.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{dist.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{dist.state}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold tracking-tighter">₹{(dist.total_revenue / 100000).toFixed(1)}L</p>
                      <Badge variant="outline" className="text-[9px] h-4 py-0 bg-profit/5 text-profit border-profit/20">+{dist.growth}%</Badge>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs group" asChild>
                  <Link to="/admin/districts" className="flex items-center justify-center gap-2">
                    View Comprehensive Meta-data
                    <ArrowUpRight className="h-3 w-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Territorial Audit Table</CardTitle>
            <CardDescription>Live metrics for all registered districts</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns as any} data={globalData as any} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- DETAIL VIEW LOGIC ---
  const { districtInfo, revenueTrend, ordersTrend, coreBodies, weeklySnapshot } = data;

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

  const cbColumns = [
    {
      header: "Core Body",
      accessor: (row: CoreBodyRow) => (
        <div>
          <Link
            to={`/admin/users/profile/${row.id.replace('CB-','')}`}
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
        <span className="font-mono text-sm">₹{(row.investment ?? 0).toLocaleString()}</span>
      ),
    },
    {
      header: "Earnings (YTD)",
      accessor: (row: CoreBodyRow) => (
        <span className="font-mono text-sm font-semibold text-profit">₹{(row.earnings ?? 0).toLocaleString()}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row: CoreBodyRow) => <StatusBadge status={row.status} />,
    },
    {
      header: "Last Active",
      accessor: (row: CoreBodyRow) => (
        <span className="text-sm text-muted-foreground">{row.lastActive}</span>
      ),
    },
  ];

  const totalB2B = revenueTrend.reduce((acc, d) => acc + d.b2b, 0);
  const totalB2C = revenueTrend.reduce((acc, d) => acc + d.b2c, 0);
  const totalRevenue = totalB2B + totalB2C;
  const trustFundContrib = totalRevenue * 0.10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8 hover:bg-primary/10">
            <Link to="/admin/districts/performance">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{districtInfo.name}</h1>
              <StatusBadge status={districtInfo.status} />
            </div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
              {districtInfo.state} • HUB ID: {districtInfo.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] bg-card border-primary/20">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last Quarter</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Full Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-primary/20 bg-card hover:bg-primary/5">
            <Download className="h-4 w-4 mr-2" />
            PDF Audit
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Revenue Hub" value={`₹${(totalRevenue / 100000).toFixed(2)}L`} icon={DollarSign} variant="profit" subtitle="Current Window" />
        <KPICard title="Total Fulfilled" value={(districtInfo.totalOrders ?? 0).toLocaleString()} icon={ShoppingCart} variant="default" subtitle="Success Rate 98%" />
        <KPICard title="Active Force" value={(districtInfo.coreBodyCountA + districtInfo.coreBodyCountB).toString()} icon={Users} variant="cap" subtitle={`A: ${districtInfo.coreBodyCountA} | B: ${districtInfo.coreBodyCountB}`} />
        <KPICard title="Trust Provision" value={`₹${(trustFundContrib / 100000).toFixed(2)}L`} icon={ShieldCheck} variant="trust" subtitle="10% Protected Fund" />
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 border border-primary/10 backdrop-blur-sm">
          <TabsTrigger value="revenue">Financial Yield</TabsTrigger>
          <TabsTrigger value="orders">Volume Trends</TabsTrigger>
          <TabsTrigger value="corebodies">Force Structure</TabsTrigger>
          <TabsTrigger value="dealers">Territory Map</TabsTrigger>
          <TabsTrigger value="heatmap">Peak Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm border-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Stratification</CardTitle>
                <CardDescription>B2B High-Volume vs B2C Micro-Transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorB2C" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000)}K`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    />
                    <Area type="monotone" dataKey="b2b" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorB2B)" name="B2B (Corporate)" strokeWidth={3} />
                    <Area type="monotone" dataKey="b2c" stroke="#3b82f6" fillOpacity={1} fill="url(#colorB2C)" name="B2C (Retail)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Split</CardTitle>
                <CardDescription>Yield distribution audit</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "B2B Yield", value: Math.max(0.1, totalB2B) },
                        { name: "B2C Yield", value: Math.max(0.1, totalB2C) },
                      ]}
                      cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none"
                    >
                      <Cell key="cell-0" fill="#8b5cf6" />
                      <Cell key="cell-1" fill="#3b82f6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 group hover:bg-purple-500/10 transition-colors">
                    <span className="text-xs font-bold text-purple-600">B2B STRATUM</span>
                    <span className="font-mono font-bold">₹{(totalB2B / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 group hover:bg-blue-500/10 transition-colors">
                    <span className="text-xs font-bold text-blue-600">B2C STRATUM</span>
                    <span className="font-mono font-bold">₹{(totalB2C / 100000).toFixed(2)}L</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card className="border-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Velocity Pulse</CardTitle>
              <CardDescription>Daily lifecycle of fulfilled transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={ordersTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} />
                  <YAxis axisLine={false} tickLine={false} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Line type="stepAfter" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} name="Volume" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corebodies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="shadow-md border-primary/20 bg-gradient-to-b from-card to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Slot Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
                    <span>UTILIZATION INDEX</span>
                    <span>{districtInfo.coreBodyCountA + districtInfo.coreBodyCountB} / {districtInfo.maxLimit}</span>
                  </div>
                  <CapacityBar used={districtInfo.coreBodyCountA + districtInfo.coreBodyCountB} max={districtInfo.maxLimit} size="xl" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-card border shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase font-black">TYPE ALPHA</p>
                    <p className="text-3xl font-black text-primary">{districtInfo.coreBodyCountA}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-card border shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase font-black">TYPE BETA</p>
                    <p className="text-3xl font-black text-blue-500">{districtInfo.coreBodyCountB}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Force Deployment Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={cbColumns as any} data={coreBodies as any} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dealers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dealers.map((sub) => (
              <Card key={sub.id} className="overflow-hidden border-primary/5 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-primary/5 py-3 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <CardTitle className="text-base">{sub.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-bold text-[10px]">{sub.dealers.length} SPECIALISTS</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {sub.dealers.length > 0 ? (
                    <div className="divide-y divide-primary/5">
                      {sub.dealers.map((dealer) => (
                        <div key={dealer.id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-card border flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                              {dealer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-sm tracking-tight">{dealer.name}</p>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium mt-0.5">
                                <span className="flex items-center gap-1 uppercase"><Phone className="h-2.5 w-2.5" /> {dealer.phone}</span>
                                <span className="flex items-center gap-1 uppercase"><PackageCheck className="h-2.5 w-2.5" /> {dealer.productCount} Sku</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <StatusBadge status={dealer.status} />
                            <Button variant="ghost" size="sm" asChild className="h-8 text-[11px] font-bold">
                              <Link to={`/admin/users/profile/${dealer.userId}`}>Profile</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-muted/20 mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">Unmapped Territory</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card className="border-primary/5 bg-gradient-to-br from-card to-muted/10">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Operations Heatmap</CardTitle>
              <CardDescription>Transactional density across 168-hour tactical window</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 overflow-x-auto pb-4">
                <div className="flex gap-1 ml-12">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="w-8 text-[9px] text-center text-muted-foreground font-mono">
                      {i}h
                    </div>
                  ))}
                </div>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, dIdx) => (
                  <div key={day} className="flex gap-1 items-center">
                    <div className="w-12 text-xs font-black text-muted-foreground uppercase">{day}</div>
                    {weeklySnapshot?.[dIdx]?.map((val, hIdx) => {
                      // Color based on density
                      const intensity = Math.min(100, (val / 10) * 100);
                      const color = val === 0 ? 'bg-muted/10' : 
                                  val < 3 ? 'bg-primary/20' : 
                                  val < 6 ? 'bg-primary/50' : 
                                  'bg-primary';
                      return (
                        <div 
                          key={hIdx} 
                          className={`w-8 h-8 rounded-sm ${color} transition-all hover:scale-110 hover:z-10 cursor-pointer border border-background/50 flex items-center justify-center`}
                          title={`${day} ${hIdx}:00 - ${val} orders`}
                        >
                          {val > 5 && <span className="text-[9px] font-bold text-white/50">{val}</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-8 pt-4 border-t border-primary/5">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Density Scale:</p>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted/10 rounded-sm" />
                  <span className="text-[10px] text-muted-foreground">Idle</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/20 rounded-sm" />
                  <span className="text-[10px] text-muted-foreground">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/50 rounded-sm" />
                  <span className="text-[10px] text-muted-foreground">Moderate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded-sm" />
                  <span className="text-[10px] text-muted-foreground">Tactical Peak</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Portfolio Alpha" value={totalRevenue > 0 ? `${((totalB2B / totalRevenue) * 100).toFixed(0)}%` : "0%"} trend="up" trendValue="Yield" />
        <StatCard title="Portfolio Beta" value={totalRevenue > 0 ? `${((totalB2C / totalRevenue) * 100).toFixed(0)}%` : "0%"} trend="up" trendValue="Yield" />
        <StatCard title="Mean Unit Yield" value={districtInfo.totalOrders > 0 ? `₹${(totalRevenue / districtInfo.totalOrders).toFixed(0)}` : "₹0"} />
        <StatCard title="Vacancy Delta" value={(districtInfo.maxLimit - (districtInfo.coreBodyCountA + districtInfo.coreBodyCountB)).toString()} subtitle="Slot Reserves" />
      </div>
    </div>
  );
}
