import { useMemo, useState, useEffect } from "react";
import { Download, Eye, PackageCheck, Search, ShoppingCart, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UnifiedOrder } from "./orderData";
import { orderApi } from "@/lib/orderApi";
import { toast } from "sonner";

const orderTypeClass: Record<string, string> = {
  B2B: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  B2C: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Bulk: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const paymentStatusClass: Record<string, string> = {
  Paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Partially Paid": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Refunded: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function AllOrders() {
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(null);
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderApi.getMyOrders();
      
      // Map backend data to UnifiedOrder interface
      const mappedOrders: UnifiedOrder[] = data.orders.map((ord: any) => ({
        id: ord.order_number,
        dbId: ord.id, // Store real ID for details fetching
        orderType: ord.order_type as any,
        customer: ord.customer_name || `User #${ord.customer_id}`,
        district: ord.district_name || "N/A",
        orderValue: parseFloat(ord.total_amount),
        paymentStatus: ord.payment_method === 'wallet' ? 'Paid' : 'Pending',
        orderStatus: ord.status.charAt(0).toUpperCase() + ord.status.slice(1) as any,
        createdDate: new Date(ord.created_at).toISOString().split('T')[0],
        paymentMode: ord.payment_method === 'wallet' ? 'Wallet' : 'UPI',
        referralImpact: ord.referral_user_id ? "Referral linked" : "No referral",
        notes: ord.notes || ""
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    setSelectedOrderDetails(null);
    try {
      if (order.dbId) {
        const details = await orderApi.getOrderDetails(order.dbId);
        setSelectedOrderDetails(details);
      }
    } catch (err) {
      console.error("Error fetching details", err);
      toast.error("Failed to load order details");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase());
      const matchesType = orderType === "all" || order.orderType === orderType;
      const matchesStatus = orderStatus === "all" || order.orderStatus === orderStatus;
      const matchesDate = dateFilter === "all" || order.createdDate === dateFilter;
      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [dateFilter, orderStatus, orderType, search, orders]);

  const totalValue = filteredOrders.reduce((sum, order) => sum + order.orderValue, 0);
  const paidOrders = filteredOrders.filter((o) => o.paymentStatus === "Paid").length;
  const pendingOps = filteredOrders.filter((o) => o.orderStatus !== "Delivered").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">All Orders</h1>
          <p className="text-sm text-muted-foreground">Operational visibility for all order flows across businesses</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Orders" value={String(filteredOrders.length)} icon={ShoppingCart} variant="default" />
        <KPICard title="Order Value" value={`₹${totalValue.toLocaleString("en-IN")}`} icon={Wallet} variant="trust" />
        <KPICard title="Paid Orders" value={String(paidOrders)} icon={PackageCheck} variant="profit" />
        <KPICard title="Open Operations" value={String(pendingOps)} icon={Eye} variant="warning" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID / User"
              className="pl-8"
            />
          </div>
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger>
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="B2B">B2B</SelectItem>
              <SelectItem value="B2C">B2C</SelectItem>
              <SelectItem value="Bulk">Bulk</SelectItem>
            </SelectContent>
          </Select>
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {Array.from(new Set(orders.map((o) => o.createdDate))).map((date: any) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Customer / Businessman</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead className="text-right">Order Value</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => handleViewOrder(order)}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <Badge className={orderTypeClass[order.orderType]}>{order.orderType}</Badge>
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.district}</TableCell>
                      <TableCell className="text-right font-mono">₹{order.orderValue.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge className={paymentStatusClass[order.paymentStatus]}>{order.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell>{order.orderStatus}</TableCell>
                      <TableCell>{order.createdDate}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="sm:max-w-xl">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Order Detail • {selectedOrder.id}</SheetTitle>
                <SheetDescription>Operational detail drawer (financial values are read-only)</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm">
                <div className="rounded-md border p-3">
                  <p><span className="font-semibold">Order Type:</span> {selectedOrder.orderType}</p>
                  <p><span className="font-semibold">Customer:</span> {selectedOrder.customer}</p>
                  <p><span className="font-semibold">District:</span> {selectedOrder.district}</p>
                  <p><span className="font-semibold">Payment Mode:</span> {selectedOrder.paymentMode}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p><span className="font-semibold">Order Value:</span> ₹{selectedOrder.orderValue.toLocaleString("en-IN")}</p>
                  <p><span className="font-semibold">Payment Status:</span> {selectedOrder.paymentStatus}</p>
                  <p><span className="font-semibold">Referral Impact:</span> {selectedOrder.referralImpact}</p>
                </div>

                {selectedOrderDetails && (
                  <div className="mt-4 space-y-4">
                    <h3 className="font-semibold text-base">Order Items</h3>
                    <div className="space-y-2">
                       {selectedOrderDetails.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-muted/50 border">
                           <div>
                             <p className="font-medium">{item.product_name}</p>
                             <p className="text-xs text-muted-foreground">{item.variant_name || 'Standard Variant'} x {item.quantity}</p>
                           </div>
                           <p className="font-mono">₹{parseFloat(item.total_price).toLocaleString("en-IN")}</p>
                         </div>
                       ))}
                    </div>

                    <h3 className="font-semibold text-base">Status Timeline</h3>
                    <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                       {selectedOrderDetails.status_log.map((log: any, idx: number) => (
                         <div key={idx} className="pl-6 relative">
                           <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-background" />
                           <p className="font-medium capitalize">{log.new_status}</p>
                           <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                           {log.note && <p className="text-sm mt-1">{log.note}</p>}
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {!selectedOrderDetails && (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="font-semibold text-amber-700 dark:text-amber-300">Finance Safety Guardrail</p>
                  <p className="text-muted-foreground">Ledger entries are immutable and cannot be edited from this view.</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

