import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  PackageCheck, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Package,
  ArrowRightCircle,
  Info,
  RefreshCcw,
  Check
} from "lucide-react";
import { dealerApi } from "@/lib/dealerApi";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StockArrivals() {
  const [arrivals, setArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiving, setReceiving] = useState<string | null>(null);

  const fetchArrivals = async () => {
    try {
      setLoading(true);
      const res = await dealerApi.getPendingArrivals();
      setArrivals(res.arrivals || []);
    } catch (err) {
      toast.error("Failed to load incoming shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
  }, []);

  const handleReceive = async (allocationId: string) => {
    try {
        setReceiving(allocationId);
        await dealerApi.receiveTransfer(allocationId);
        toast.success("Stock received and added to inventory!");
        fetchArrivals();
    } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to receive stock");
    } finally {
        setReceiving(null);
    }
  };

  const navItems = getDealerNavItems();

  return (
    <DashboardLayout role="dealer" navItems={navItems as any}>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <Truck className="h-3 w-3" />
              <span>Incoming Logistics</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Arrivals</h1>
            <p className="text-slate-500 font-medium tracking-tight">Verify and accept physical stock arriving at your hub.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchArrivals}
            className="h-10 border-slate-200 rounded-xl gap-2 font-bold text-xs uppercase tracking-widest"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Check for Shipments
          </Button>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />)}
            </div>
        ) : arrivals.length === 0 ? (
            <div className="p-20 text-center space-y-4 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 italic">No Incoming Shipments</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">All physical items from your district core bodies have been received or are not yet dispatched.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {arrivals.map((arrival) => (
                    <Card key={arrival.id} className="border-0 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all">
                        <div className="p-6 pb-2 border-b border-slate-50 bg-white group-hover:bg-indigo-50 transition-colors">
                             <div className="flex items-center justify-between mb-4">
                                <Badge className="bg-amber-100 text-amber-600 border-amber-200 font-black text-[10px] uppercase shadow-none ring-0">
                                    <Clock className="h-3 w-3 mr-1" />
                                    In Transit
                                </Badge>
                                <span className="text-[10px] font-bold text-slate-400">{format(new Date(arrival.dispatched_at), 'h:mm a')}</span>
                             </div>
                             <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                     {arrival.thumbnail_url ? (
                                        <img src={arrival.thumbnail_url} className="h-full w-full object-cover" />
                                     ) : (
                                        <Package className="h-7 w-7 text-indigo-200" />
                                     )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-slate-900 leading-tight">{arrival.product_name}</h3>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{arrival.quantity} Units</p>
                                </div>
                             </div>
                        </div>
                        <CardContent className="p-6 space-y-5 bg-white">
                             <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">From Hub Specialist</p>
                                        <p className="text-sm font-bold text-slate-700">{arrival.sender_name}</p>
                                    </div>
                                </div>
                                {arrival.note && (
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-medium text-slate-500 italic line-clamp-2">"{arrival.note}"</p>
                                    </div>
                                )}
                             </div>

                             <Button 
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-100 gap-2 group"
                                onClick={() => handleReceive(arrival.id)}
                                disabled={receiving === arrival.id}
                            >
                                <Check className="h-4 w-4 group-hover:scale-125 transition-transform" />
                                ACCEPT PHYSICAL PACKAGE
                             </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <History className="h-8 w-8 text-indigo-400" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-black italic">Arrival Handshake</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-3xl">
                        Accepting a shipment confirms that the physical items have arrived at your subdivision. This action will update your verified inventory levels and register the transaction in your immutable stock ledger.
                    </p>
                </div>
                <div className="shrink-0">
                    <Badge className="bg-white/10 text-white border-0 py-2 px-4 rounded-xl font-bold flex flex-col gap-0.5 items-start">
                        <span className="text-[9px] uppercase tracking-widest text-indigo-300">Total Pending</span>
                        <span className="text-lg">{arrivals.length} Shipments</span>
                    </Badge>
                </div>
             </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { History } from "lucide-react";
