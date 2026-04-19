import { useState, useEffect } from "react";

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  ArrowUpRight,
  RefreshCcw,
  Calendar
} from "lucide-react";
import { dealerApi } from "@/lib/dealerApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DealerInsights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dealerApi.getDealerInsights();
      setData(res);
    } catch (err) {
      console.error("Failed to load dealer insights", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#a855f7', '#d946ef'];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl bg-slate-100" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-[400px] rounded-2xl bg-slate-100" />
          <Skeleton className="h-[400px] rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const trends = data?.trends || {};

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <TrendingUp className="h-3 w-3" />
              <span>Performance Analytics</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Market Insights</h1>
            <p className="text-slate-500 font-medium">Real-time demand and inventory intelligence for your subdivision.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="h-10 px-4 flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold text-xs shadow-sm"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh Data
            </button>
            <div className="h-10 px-4 flex items-center gap-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-200">
              <Calendar className="h-3.5 w-3.5" />
              Last 30 Days
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InsightsCard 
            title="Subdivision Sales" 
            value={`₹${parseFloat(stats.mtd_sales || 0).toLocaleString()}`} 
            subtitle="Current Month (MTD)"
            icon={ShoppingCart}
            color="indigo"
            trend="+12.4%"
          />
          <InsightsCard 
            title="Active Specialization" 
            value={stats.total_skus || 0} 
            subtitle="Mapped SKUs"
            icon={Package}
            color="blue"
          />
          <InsightsCard 
            title="Low Stock Alert" 
            value={stats.low_stock_skus || 0} 
            subtitle="Critical Replenishment"
            icon={AlertTriangle}
            color="orange"
            isAlert={stats.low_stock_skus > 0}
          />
          <InsightsCard 
            title="Pending Requests" 
            value={stats.pending_fulfillments || 0} 
            subtitle="Incoming Demand"
            icon={BarChart3}
            color="violet"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-white/80 border-b border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black text-slate-900">Sales Volume Trend</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Order Distribution</CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.sales || []}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                    />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-white/80 border-b border-slate-100 p-6">
              <div>
                <CardTitle className="text-lg font-black text-slate-900">Portfolio Mix</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category-wise Mapping</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trends.categories || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(trends.categories || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      formatter={(val) => <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
           <div className="relative z-10 max-w-2xl">
              <h3 className="text-xl font-black mb-2 italic">Subdivision Growth Intelligence</h3>
              <p className="text-indigo-100 font-medium leading-relaxed">
                Your performance is tracked against the regional subdivision target. Increasing your specialized category coverage directly boosts your local distribution power.
              </p>
           </div>
           <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white/10" />
        </div>
    </div>
  );
}

function InsightsCard({ title, value, subtitle, icon: Icon, color, trend, isAlert }: any) {
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl bg-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] py-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {trend}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-2xl font-black tracking-tight ${isAlert ? 'text-orange-600 animate-pulse' : 'text-slate-900'}`}>
              {value}
            </h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
