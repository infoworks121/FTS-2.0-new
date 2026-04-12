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
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import geographyApi, { DistrictPerformanceResponse, SubdivisionDealers } from "@/lib/geographyApi";

export default function DistrictPerformance() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const districtId = searchParams.get("id");
  
  const [data, setData] = useState<DistrictPerformanceResponse | null>(null);
  const [dealers, setDealers] = useState<SubdivisionDealers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("6m");

  useEffect(() => {
    async function loadPerformance() {
      if (!districtId) {
        setError("District ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [perfData, dealerData] = await Promise.all([
          geographyApi.getDistrictPerformance(districtId),
          geographyApi.getDistrictDealers(districtId)
        ]);
        setData(perfData);
        setDealers(dealerData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load district performance:", err);
        setError("Failed to load district performance data");
        toast({
          title: "Error",
          description: "Could not fetch performance data for this district.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadPerformance();
  }, [districtId, toast]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading Performance Metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">{error || "Data not available"}</p>
        <Button variant="outline" asChild>
          <Link to="/admin/districts">Go Back to Districts</Link>
        </Button>
      </div>
    );
  }

  const { districtInfo, revenueTrend, ordersTrend, coreBodies } = data;

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
  const totalB2B = revenueTrend.reduce((acc, d) => acc + d.b2b, 0);
  const totalB2C = revenueTrend.reduce((acc, d) => acc + d.b2c, 0);
  const totalRevenue = totalB2B + totalB2C;
  const trustFundContrib = totalRevenue * 0.10; // 10% trust fund

  return (
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
                {districtInfo.state} • District ID: {districtInfo.id}
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
            icon={DollarSign}
            variant="profit"
            subtitle="Current Window"
          />
          <KPICard
            title="Total Orders"
            value={(districtInfo.totalOrders ?? 0).toLocaleString()}
            icon={ShoppingCart}
            variant="default"
            subtitle="All time"
          />
          <KPICard
            title="Active Core Bodies"
            value={(districtInfo.coreBodyCountA + districtInfo.coreBodyCountB).toString()}
            icon={Users}
            variant="cap"
            subtitle={`Type A: ${districtInfo.coreBodyCountA}, Type B: ${districtInfo.coreBodyCountB}`}
          />
          <KPICard
            title="Trust Fund Contrib."
            value={`₹${(trustFundContrib / 100000).toFixed(2)}L`}
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
            <TabsTrigger value="dealers">Dealers (Subdivision)</TabsTrigger>
            <TabsTrigger value="heatmap">Weekly Snapshot</TabsTrigger>
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
                    <AreaChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${(v/1000)}K`} />
                      <Tooltip 
                        formatter={(value: number) => [`₹${(value ?? 0).toLocaleString()}`, ""]}
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
                          { name: "B2B", value: Math.max(0.1, totalB2B) },
                          { name: "B2C", value: Math.max(0.1, totalB2C) },
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
                      <Tooltip formatter={(value: number) => `₹${(value ?? 0).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500" />
                        <span>B2B Volume</span>
                      </div>
                      <span className="font-semibold">₹{(totalB2B/100000).toFixed(2)}L</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span>B2C Volume</span>
                      </div>
                      <span className="font-semibold">₹{(totalB2C/100000).toFixed(2)}L</span>
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
                <CardDescription>Monthly order volume fluctuation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ordersTrend}>
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
                  <CardTitle className="text-base">Distribution Capacity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground uppercase text-[10px] font-bold">Total Utilization</span>
                      <span className="font-mono font-bold">{districtInfo.coreBodyCountA + districtInfo.coreBodyCountB} / {districtInfo.maxLimit}</span>
                    </div>
                    <CapacityBar 
                      used={districtInfo.coreBodyCountA + districtInfo.coreBodyCountB} 
                      max={districtInfo.maxLimit}
                      size="lg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border bg-card">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Type A</p>
                      <p className="text-2xl font-bold">{districtInfo.coreBodyCountA}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Type B</p>
                      <p className="text-2xl font-bold">{districtInfo.coreBodyCountB}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* List */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base">Active Force Map</CardTitle>
                  <CardDescription>Registered Core Bodies in {districtInfo.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable columns={cbColumns as any} data={coreBodies as any} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dealers Tab */}
          <TabsContent value="dealers" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
               {dealers.map((sub) => (
                 <Card key={sub.id} className="overflow-hidden">
                   <CardHeader className="bg-muted/30 py-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">{sub.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className="bg-background">
                          {sub.dealers.length} Dealers assigned
                        </Badge>
                     </div>
                   </CardHeader>
                   <CardContent className="p-0">
                     {sub.dealers.length > 0 ? (
                       <div className="divide-y">
                         {sub.dealers.map((dealer) => (
                           <div key={dealer.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">{dealer.name}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {dealer.phone}</span>
                                    <span className="flex items-center gap-1"><PackageCheck className="h-3 w-3" /> {dealer.productCount} Specializations</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <StatusBadge status={dealer.status} />
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/admin/users/corebody/${dealer.userId}/settings`}>View Profile</Link>
                                </Button>
                              </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="p-8 text-center text-muted-foreground">
                         <Users className="h-10 w-10 mx-auto opacity-20 mb-2" />
                         <p>No dealers assigned to this subdivision</p>
                       </div>
                     )}
                   </CardContent>
                 </Card>
               ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="B2B Share" value={totalRevenue > 0 ? `${((totalB2B/totalRevenue)*100).toFixed(0)}%` : "0%"} trend="up" trendValue={totalB2B.toLocaleString()} />
          <StatCard title="B2C Share" value={totalRevenue > 0 ? `${((totalB2C/totalRevenue)*100).toFixed(0)}%` : "0%"} trend="up" trendValue={totalB2C.toLocaleString()} />
          <StatCard title="Avg Order Value" value={districtInfo.totalOrders > 0 ? `₹${(totalRevenue/districtInfo.totalOrders).toFixed(0)}` : "₹0"} />
          <StatCard title="Slot Availability" value={(districtInfo.maxLimit - (districtInfo.coreBodyCountA + districtInfo.coreBodyCountB)).toString()} subtitle="Remaining slots" />
        </div>
      </div>
  );
}
