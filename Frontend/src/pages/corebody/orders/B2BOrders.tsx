import { useEffect, useState } from "react";
import { orderApi } from "@/lib/orderApi";
import { DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye, Clock, TrendingUp, Building2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function B2BOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [stats, setStats] = useState({
    totalB2B: 0,
    totalVolume: 0,
    pending: 0,
    completed: 0
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getMyOrders('B2B');
      setOrders(data.orders);
      
      // Calculate stats
      const vol = data.orders.reduce((acc: number, o: any) => acc + Number(o.total_amount), 0);
      const pen = data.orders.filter((o: any) => o.status === 'pending').length;
      const com = data.orders.filter((o: any) => o.status === 'completed' || o.status === 'delivered').length;
      
      setStats({
        totalB2B: data.orders.length,
        totalVolume: vol,
        pending: pen,
        completed: com
      });
    } catch (error) {
      console.error("Error fetching B2B orders:", error);
      toast.error("Failed to load B2B orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetails = async (order: any) => {
    setSelectedOrder(order);
    setOrderDetails(null);
    setDetailsLoading(true);
    try {
      const data = await orderApi.getOrderDetails(order.id);
      setOrderDetails(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return "bg-warning/10 text-warning border-warning/20";
      case 'processing': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'completed':
      case 'delivered': return "bg-profit/10 text-profit border-profit/20";
      case 'cancelled': return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">B2B District Orders</h1>
        <p className="text-sm text-muted-foreground">Monitor and manage business trade across your district network.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total B2B Orders" value={String(stats.totalB2B)} icon={ShoppingBag} variant="default" />
        <KPICard title="District B2B Volume" value={`₹${stats.totalVolume.toLocaleString('en-IN')}`} icon={TrendingUp} variant="profit" />
        <KPICard title="Pending Orders" value={String(stats.pending)} icon={Clock} variant="warning" />
        <KPICard title="Active Sellers" value="12" icon={Building2} variant="trust" subtitle="In your district" />
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <DataTable
          loading={loading}
          columns={[
            {
              header: "Order Details",
              accessor: (row) => (
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground">#{row.order_number}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{format(new Date(row.created_at), 'PPP p')}</span>
                </div>
              ),
            },
            {
              header: "Customer/Buyer",
              accessor: (row) => (
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm">{row.customer_name}</span>
                  <Badge variant="outline" className="w-fit text-[9px] h-4 py-0 uppercase">Member</Badge>
                </div>
              ),
            },
            {
              header: "Products",
              accessor: (row) => (
                <div className="flex items-center gap-2 max-w-[200px]">
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <span className="text-xs truncate text-muted-foreground" title={row.product_names}>
                    {row.product_names}
                  </span>
                </div>
              ),
            },
            {
              header: "Total Value",
              accessor: (row) => (
                <div className="flex flex-col">
                  <span className="font-black font-mono text-profit">₹{Number(row.total_amount).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{row.payment_method}</span>
                </div>
              ),
            },
            {
              header: "Status",
              accessor: (row) => (
                <Badge className={`uppercase font-bold text-[10px] ${getStatusColor(row.status)}`}>
                  {row.status}
                </Badge>
              ),
            },
            {
              header: "Actions",
              accessor: (row) => (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenDetails(row)}>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </Button>
              ),
            },
          ]}
          data={orders}
        />
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Order Detail • #{selectedOrder.order_number}</SheetTitle>
                <SheetDescription>Comprehensive order view and financial breakdown</SheetDescription>
              </SheetHeader>
              
              <div className="mt-8 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Customer</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Payment Method</p>
                    <p className="font-medium uppercase">{selectedOrder.payment_method}</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Amount</p>
                    <p className="font-bold text-profit">₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Items Section */}
                <div>
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" /> Order Items
                  </h3>
                  <div className="space-y-2">
                    {detailsLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : orderDetails?.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-lg border bg-card/50">
                        <div>
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</p>
                        </div>
                        <p className="font-bold">₹{Number(item.total_price).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status History */}
                <div>
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Status Timeline
                  </h3>
                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border pl-6">
                    {detailsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : orderDetails?.status_log?.map((log: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-background" />
                        <p className="text-sm font-semibold capitalize">{log.new_status}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(log.created_at), 'PPP p')}</p>
                        {log.note && <p className="text-xs mt-1 italic text-muted-foreground">"{log.note}"</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 mt-auto">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">FTS Log ID</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{selectedOrder.id}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
