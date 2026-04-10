import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Info,
  Calendar,
  Box,
  Truck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  RefreshCcw,
  FileBarChart
} from "lucide-react";
import { dealerApi } from "@/lib/dealerApi";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DealerStockLedger() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  
  // Drill-down State
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dealerApi.getInventoryLedger();
      setLedger(res.ledger || []);
    } catch (err) {
      toast.error("Failed to load inventory ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLedger = useMemo(() => {
    return ledger.filter(item => {
      const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" ? true : 
                         filterType === "in" ? parseFloat(item.quantity) > 0 : 
                         parseFloat(item.quantity) < 0;
      return matchesSearch && matchesType;
    });
  }, [ledger, searchQuery, filterType]);

  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    filteredLedger.forEach(item => {
      const qty = parseFloat(item.quantity);
      if (qty > 0) totalIn += qty;
      else totalOut += Math.abs(qty);
    });
    return { totalIn, totalOut, count: filteredLedger.length };
  }, [filteredLedger]);

  const columns = [
    {
      header: "Date & Time",
      accessorKey: "created_at",
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-sm">{format(new Date(row.original.created_at), 'MMM dd, yyyy')}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(row.original.created_at), 'h:mm a')}</span>
        </div>
      )
    },
    {
      header: "Product Detail",
      accessorKey: "product_name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
             {row.original.thumbnail_url ? (
                <img src={row.original.thumbnail_url} className="h-full w-full object-cover" />
             ) : (
                <Box className="h-4 w-4 text-indigo-300" />
             )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-xs line-clamp-1">{row.original.product_name}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.original.sku}</span>
          </div>
        </div>
      )
    },
    {
      header: "Transaction Type",
      accessorKey: "transaction_type",
      cell: ({ row }: any) => {
        const qty = parseFloat(row.original.quantity);
        const isEntry = qty > 0;
        return (
          <div className="flex flex-col gap-1 items-start">
             <Badge className={`
                ${isEntry ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} 
                font-black text-[9px] uppercase shadow-none border px-2 py-0.5
             `}>
                {isEntry ? <ArrowDownLeft className="h-2 w-2 mr-1" /> : <ArrowUpRight className="h-2 w-2 mr-1" />}
                {row.original.transaction_type.replace('_', ' ')}
             </Badge>
          </div>
        );
      }
    },
    {
      header: "Source / Destination",
      accessorKey: "source_name",
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 text-xs">
            {row.original.source_name || "System Auto-Assign"}
          </span>
          {row.original.source_type && (
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Core Body Type {row.original.source_type}</span>
          )}
        </div>
      )
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: ({ row }: any) => {
        const qty = parseFloat(row.original.quantity);
        return (
          <span className={`font-black text-sm ${qty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {qty > 0 ? '+' : ''}{qty}
          </span>
        );
      }
    },
    {
      header: "Running Balance",
      accessorKey: "running_balance",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 text-sm">
                {parseFloat(row.original.running_balance).toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-300">Units</span>
        </div>
      )
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 transition-all group"
            onClick={() => {
                setSelectedTx(row.original);
                setIsModalOpen(true);
            }}
        >
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </Button>
      )
    }
  ];

  const handleExport = () => {
    toast.info("Exporting ledger to CSV...");
    // Mock export logic
  };

  const navItems = getDealerNavItems();

  return (
    <DashboardLayout role="dealer" navItems={navItems as any}>
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-2xl shadow-slate-100 border border-slate-100/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <History className="h-3 w-3" />
              <span>Financial-Grade Audit Trail</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Movement Ledger</h1>
            <p className="text-slate-500 font-medium">Full visibility into every unit added or issued from your subdivision.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" onClick={handleExport} className="h-11 rounded-xl gap-2 font-bold text-[11px] uppercase tracking-widest border-slate-200">
                <Download className="h-4 w-4" />
                Export CSV
             </Button>
             <Button onClick={fetchData} className="h-11 w-11 p-0 rounded-xl bg-slate-900 text-white hover:bg-black">
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
             </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl rounded-2xl bg-indigo-600 text-white overflow-hidden relative">
                <CardContent className="p-6">
                    <div className="relative z-10 flex flex-col gap-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Transactions</p>
                        <h4 className="text-3xl font-black">{stats.count}</h4>
                        <p className="text-[10px] font-bold opacity-60 mt-1 italic">Filtered View Results</p>
                    </div>
                    <FileBarChart className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10" />
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-emerald-100/50 rounded-2xl bg-white border-l-4 border-l-emerald-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="h-8 w-8 text-emerald-100" />
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock Additions (IN)</p>
                    <h4 className="text-2xl font-black text-slate-900">{stats.totalIn.toLocaleString()} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Units</span></h4>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-rose-100/50 rounded-2xl bg-white border-l-4 border-l-rose-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="h-8 w-8 text-rose-100" />
                        <ArrowUpRight className="h-4 w-4 text-rose-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock Issues (OUT)</p>
                    <h4 className="text-2xl font-black text-slate-900">{stats.totalOut.toLocaleString()} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Units</span></h4>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-indigo-100/50 rounded-2xl bg-white border-l-4 border-l-indigo-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <History className="h-8 w-8 text-indigo-100" />
                        <Info className="h-4 w-4 text-indigo-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Book Balance</p>
                    <h4 className="text-2xl font-black text-slate-900">
                        {ledger[0] ? parseFloat(ledger[0].running_balance).toLocaleString() : '0'} 
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-2">Units Total</span>
                    </h4>
                </CardContent>
            </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input 
                    placeholder="Search by Product name or SKU..."
                    className="pl-10 h-11 border-slate-100 rounded-xl font-medium focus-visible:ring-indigo-600 bg-slate-50/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 h-11 rounded-xl border-slate-100 font-bold text-xs uppercase tracking-widest bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Filter className="h-3 w-3" />
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent className="border-0 shadow-2xl rounded-xl">
                    <SelectItem value="all" className="font-bold text-xs uppercase tracking-widest">All Movements</SelectItem>
                    <SelectItem value="in" className="font-bold text-xs uppercase tracking-widest text-emerald-600">Stock Additions (+)</SelectItem>
                    <SelectItem value="out" className="font-bold text-xs uppercase tracking-widest text-rose-600">Stock Issues (-)</SelectItem>
                </SelectContent>
            </Select>

            <Button variant="ghost" className="h-11 rounded-xl text-slate-400 hover:text-indigo-600 gap-2 font-bold text-xs uppercase tracking-widest">
                <Calendar className="h-4 w-4" />
                Date Range
            </Button>
        </div>

        {/* Data Table */}
        <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardContent className="p-0">
                <DataTable 
                    columns={columns} 
                    data={filteredLedger} 
                    loading={loading} 
                    noDataMessage="No ledger entries found for the selected filters." 
                />
            </CardContent>
        </Card>

        {/* Transaction Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[450px] p-0 border-0 rounded-3xl shadow-2xl overflow-hidden">
                <div className={`p-8 ${selectedTx && parseFloat(selectedTx.quantity) > 0 ? 'bg-emerald-600' : 'bg-rose-600'} text-white relative`}>
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 rounded-xl bg-white/20">
                                <History className="h-5 w-5" />
                             </div>
                             <Badge className="bg-white/20 text-white border-0 font-black text-[10px] uppercase tracking-widest shadow-none">
                                 Ref ID: {selectedTx?.id.slice(-8)}
                             </Badge>
                        </div>
                        <DialogTitle className="text-2xl font-black italic">Transaction Details</DialogTitle>
                        <DialogDescription className="text-white/80 font-bold text-sm">
                            Audit trail for {selectedTx?.product_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="absolute right-[-20px] bottom-[-20px] h-32 w-32 bg-white/10 rounded-full blur-3xl opacity-50" />
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quantity</p>
                            <p className={`text-2xl font-black ${selectedTx && parseFloat(selectedTx.quantity) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {selectedTx && parseFloat(selectedTx.quantity) > 0 ? '+' : ''}{selectedTx?.quantity} Units
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">New Hub Balance</p>
                            <p className="text-2xl font-black text-slate-900">{parseFloat(selectedTx?.running_balance).toLocaleString()} Units</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Type</span>
                            <Badge className="bg-slate-100 text-slate-600 border-0 font-bold text-[10px] uppercase shadow-none">{selectedTx?.transaction_type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</span>
                            <span className="text-sm font-bold text-slate-700">{selectedTx && format(new Date(selectedTx.created_at), 'MMM dd, yyyy h:mm a')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Source Entity</span>
                            <span className="text-sm font-bold text-slate-700">{selectedTx?.source_name || "System Manual Entry"}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-xs font-bold text-slate-500 leading-relaxed shadow-inner">
                        <p className="flex gap-2">
                            <Info className="h-3 w-3 shrink-0 text-slate-400" />
                            "{selectedTx?.note || "No additional transaction notes provided."}"
                        </p>
                    </div>

                    <Button 
                        className="w-full h-12 bg-slate-900 hover:bg-black text-white font-black rounded-xl gap-2 mt-4 shadow-xl shadow-slate-200"
                        onClick={() => {
                            // Link to Order or Dispatch logic
                            toast.info("Navigating to source details...");
                        }}
                    >
                        View Source Details
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
