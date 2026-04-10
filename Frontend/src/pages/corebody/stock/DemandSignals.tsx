import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  MessageSquare, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Info,
  RefreshCcw,
  Search,
  Filter,
  Check,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  MousePointer2,
  XCircle
} from "lucide-react";
import { dealerApi } from "@/lib/dealerApi";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";

const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#a855f7', '#d946ef'];
const URGENCY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  normal: '#10b981'
};

export default function DemandSignals() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [replyNote, setReplyNote] = useState("");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pivot / Interaction State
  const [filterProduct, setFilterProduct] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dealerApi.getDemandSignals();
      setSignals(res.stock_requests || []);
    } catch (err) {
      console.error("Failed to load demand signals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aggregated Data for Charts
  const chartData = useMemo(() => {
    const productMap: Record<string, number> = {};
    const urgencyMap: Record<string, number> = { normal: 0, high: 0, critical: 0 };
    let totalQty = 0;

    signals.forEach(s => {
      productMap[s.product_name] = (productMap[s.product_name] || 0) + 1;
      urgencyMap[s.urgency_level] = (urgencyMap[s.urgency_level] || 0) + 1;
      if (s.requested_qty) totalQty += parseInt(s.requested_qty);
    });

    const products = Object.entries(productMap).map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10

    const urgencies = Object.entries(urgencyMap).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value,
        key: name 
    })).filter(u => u.value > 0);

    return { products, urgencies, totalQty };
  }, [signals]);

  const handleAcknowledge = async (requestId: string, message: string) => {
    try {
      await dealerApi.acknowledgeDemandSignal(requestId, {
        status: 'acknowledged',
        review_note: message
      });
      toast.success("Signal acknowledged and dealer notified!");
      setIsReplyOpen(false);
      setReplyNote("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update signal");
    }
  };

  const filteredSignals = signals.filter(s => {
    const matchesSearch = s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.requester_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProduct = filterProduct ? s.product_name === filterProduct : true;
    const matchesUrgency = filterUrgency ? s.urgency_level === filterUrgency : true;
    return matchesSearch && matchesProduct && matchesUrgency;
  });

  const suggestedMessages = [
    "Stock purchase in progress for your area.",
    "Higher stock allocation scheduled for next week.",
    "Demand noted. Buying more units from the company now.",
    "Working on replenishing this product soon.",
    "Units are being dispatched as per high demand."
  ];

  const columns = [
    {
      header: "Urgency",
      accessorKey: "urgency_level",
      cell: ({ row }: any) => {
        const levels: any = {
          critical: "bg-red-50 text-red-600 border-red-100",
          high: "bg-orange-50 text-orange-600 border-orange-100",
          normal: "bg-emerald-50 text-emerald-600 border-emerald-100"
        };
        return (
          <Badge className={`${levels[row.original.urgency_level]} font-black text-[10px] uppercase shadow-none`}>
            {row.original.urgency_level}
          </Badge>
        );
      }
    },
    {
      header: "Source Dealer",
      accessorKey: "requester_name",
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <p className="font-bold text-slate-900 text-sm">{row.original.requester_name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{row.original.subdivision_name}</p>
        </div>
      )
    },
    {
      header: "Product Demand",
      accessorKey: "product_name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-slate-900 text-sm line-clamp-1">{row.original.product_name}</p>
            {row.original.requested_qty ? (
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest italic">{row.original.requested_qty} Units Requested</p>
            ) : (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">High Demand Focus</p>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Context Message",
      accessorKey: "request_note",
      cell: ({ row }: any) => (
        <div className="max-w-[400px] py-2">
          <p className="text-xs font-medium text-slate-500 italic">
            "{row.original.request_note}"
          </p>
        </div>
      )
    },
    {
      header: "Response",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.status === 'pending' ? (
            <Dialog open={isReplyOpen && selectedSignal?.id === row.original.id} onOpenChange={(open) => {
                setIsReplyOpen(open);
                if(open) setSelectedSignal(row.original);
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest gap-2">
                  <Check className="h-3 w-3" />
                  Reply
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] border-0 rounded-2xl shadow-2xl p-0 overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
                    <DialogHeader className="relative z-10 space-y-1">
                        <DialogTitle className="text-xl font-black italic">Acknowledge Alert</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-bold opacity-80 text-sm">
                            Reply to {row.original.requester_name}'s market signal.
                        </DialogDescription>
                    </DialogHeader>
                    <CheckCircle2 className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10" />
                </div>
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Suggested Replies</Label>
                        <div className="flex flex-wrap gap-2">
                            {suggestedMessages.map((msg, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setReplyNote(msg)}
                                    className="text-[10px] font-bold p-2 px-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-slate-600 hover:text-indigo-700 text-left"
                                >
                                    {msg}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custom Response</Label>
                        <Textarea 
                            value={replyNote}
                            onChange={(e) => setReplyNote(e.target.value)}
                            className="min-h-[100px] rounded-xl font-medium"
                            placeholder="Stock is coming..."
                        />
                    </div>
                    <Button 
                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-100"
                        onClick={() => handleAcknowledge(row.original.id, replyNote)}
                    >
                        Send Reply
                    </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex flex-col gap-1 items-start">
                 <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] uppercase tracking-widest shadow-none">
                    <Check className="h-3 w-3 mr-1" />
                    Acknowledged
                </Badge>
                {row.original.reply_note && (
                    <p className="text-[10px] font-bold text-slate-400 italic line-clamp-1 max-w-[150px]">"{row.original.reply_note}"</p>
                )}
            </div>
          )}
        </div>
      )
    }
  ];

  const handleBarClick = (data: any) => {
    if (filterProduct === data.name) setFilterProduct(null);
    else setFilterProduct(data.name);
  };

  const handlePieClick = (data: any) => {
    if (filterUrgency === data.payload.key) setFilterUrgency(null);
    else setFilterUrgency(data.payload.key);
  };

  return (
    <DashboardLayout role="dealer" navItems={[]} roleLabel="Core Body Dashboard">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <TrendingUp className="h-3 w-3" />
              <span>District Demand Intelligence</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Market Demand Analysis</h1>
            <p className="text-slate-500 font-medium">Aggregated signals from subdivision dealers to guide your stock acquisition strategy.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" onClick={fetchData} className="h-10 rounded-xl gap-2 font-bold text-xs uppercase tracking-widest">
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh Insights
             </Button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Products Bar Chart */}
          <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-white/80 border-b border-slate-100 p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black text-slate-900 italic">Demand Highlights</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-400 tracking-tight">Click a bar to drill down into dealer requests</CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.products} onClick={(e: any) => e && e.activePayload && handleBarClick(e.activePayload[0].payload)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                        interval={0}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                    />
                    <Bar 
                        dataKey="count" 
                        fill="#6366f1" 
                        radius={[6, 6, 0, 0]} 
                        className="cursor-pointer"
                    >
                         {chartData.products.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={filterProduct === entry.name ? '#4f46e5' : '#818cf8'} 
                                opacity={filterProduct && filterProduct !== entry.name ? 0.3 : 1}
                            />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Urgency Pie Chart */}
          <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardHeader className="bg-white/80 border-b border-slate-100 p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black text-slate-900 italic">District Urgency</CardTitle>
                  <CardDescription className="text-xs font-bold text-slate-400 tracking-tight">Market signal sensitivity</CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <PieChartIcon className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.urgencies}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      className="cursor-pointer"
                      onClick={handlePieClick}
                    >
                      {chartData.urgencies.map((entry: any, index: number) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={(URGENCY_COLORS as any)[entry.key] || '#94a3b8'} 
                            opacity={filterUrgency && filterUrgency !== entry.key ? 0.3 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                         contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        iconType="circle"
                        formatter={(val) => <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drill-down Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-200">
                    <MousePointer2 className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 italic">Drill-down: Breakdown</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specific Dealer Requirements</p>
                </div>
             </div>

             <div className="flex items-center gap-3">
                {(filterProduct || filterUrgency || searchQuery) && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {setFilterProduct(null); setFilterUrgency(null); setSearchQuery("");}}
                        className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <XCircle className="h-3 w-3 mr-1.5" />
                        Clear All Filters
                    </Button>
                )}
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                        placeholder="Filter by Dealer..." 
                        className="pl-9 h-10 border-slate-200 rounded-xl font-medium text-xs shadow-none bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                 {filterProduct && (
                     <Badge className="bg-indigo-600 text-white rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-between w-full">
                         <span>Product: {filterProduct}</span>
                         <XCircle className="h-3 w-3 cursor-pointer" onClick={() => setFilterProduct(null)} />
                     </Badge>
                 )}
                 {filterUrgency && (
                     <Badge className="bg-orange-600 text-white rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center justify-between w-full">
                         <span>Urgency: {filterUrgency}</span>
                         <XCircle className="h-3 w-3 cursor-pointer" onClick={() => setFilterUrgency(null)} />
                     </Badge>
                 )}
          </div>

          <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardContent className="p-0">
                <DataTable 
                    columns={columns} 
                    data={filteredSignals} 
                    loading={loading} 
                    noDataMessage={filterProduct || filterUrgency ? "No signals match the selected filters." : "No demand signals from subdivisions yet."} 
                />
            </CardContent>
          </Card>
        </div>

        {/* Strategic Insight Footer */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-10 w-10 text-indigo-400" />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black italic">Strategic Purchasing Opportunity</h3>
                    <p className="text-slate-400 font-medium leading-relaxed max-w-4xl text-sm">
                        You have <span className="text-indigo-400 font-bold underline decoration-2 underline-offset-4">{chartData.totalQty.toLocaleString()} estimated units</span> in requested demand from your subdivisions. 
                        Targeting the top products in your "Demand Highlights" bar chart will maximize the District's auto- fulfillment capacity and overall profit distribution.
                    </p>
                </div>
                <div className="shrink-0 flex gap-4">
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[120px]">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Stock Signals</p>
                        <p className="text-2xl font-black">{signals.length}</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[120px]">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Critial Alerts</p>
                        <p className="text-2xl font-black text-red-500">{chartData.urgencies.find(u => u.key === 'critical')?.value || 0}</p>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
