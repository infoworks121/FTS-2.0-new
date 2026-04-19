import { useMemo, useState, useEffect } from "react";
import { Download, Eye, PackageCheck, Search, ShoppingCart, Wallet, Loader2, CheckCircle2, Package, Truck, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { uploadApi } from "@/lib/uploadApi";
import { toast } from "sonner";

const orderStatusColors: Record<string, string> = {
  Pending: "bg-orange-100 text-orange-700",
  Assigned: "bg-blue-100 text-blue-700",
  Accepted: "bg-indigo-100 text-indigo-700",
  Packing: "bg-purple-100 text-purple-700",
  Dispatched: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
  Received: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-700",
};

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
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderApi.getMyOrders();
      
      const mappedOrders: UnifiedOrder[] = data.orders.map((ord: any) => ({
        id: ord.order_number,
        dbId: ord.id,
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

  const handleUpdateStatus = async (newStatus: string, trackingData?: { carrier: string; tracking_number: string }) => {
    if (!selectedOrderDetails?.assignments?.[0]) {
      toast.error("No fulfillment assignment found for this order");
      return;
    }

    try {
      setIsUpdating(true);
      const assignmentId = selectedOrderDetails.assignments[0].id;
      
      let invoiceUrl = "";
      if (newStatus === 'dispatched' && invoiceFile) {
        const uploadRes = await uploadApi.uploadSingle(invoiceFile);
        if (uploadRes.success) {
          invoiceUrl = uploadRes.url;
        }
      }

      await orderApi.updateFulfillmentStatus(assignmentId, {
        status: newStatus,
        ...trackingData,
        invoice_url: invoiceUrl || undefined
      });
      
      toast.success(`Order marked as ${newStatus}`);
      if (selectedOrder?.dbId) {
        const details = await orderApi.getOrderDetails(selectedOrder.dbId);
        setSelectedOrderDetails(details);
        
        setOrders(prev => prev.map(o => o.dbId === selectedOrder.dbId ? { ...o, orderStatus: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) as any } : o));
      }
      setShowDispatchModal(false);
      setInvoiceFile(null);
    } catch (err: any) {
      console.error("Status update failed:", err);
      toast.error(err.response?.data?.error || "Failed to update status");
    } finally {
      setIsUpdating(false);
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
  const pendingOps = filteredOrders.filter((o) => !["Delivered", "Received", "Cancelled"].includes(o.orderStatus)).length;

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
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Packing">Packing</SelectItem>
              <SelectItem value="Dispatched">Dispatched</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Received">Received</SelectItem>
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
                      <TableCell className="font-medium text-xs font-mono">{order.id}</TableCell>
                      <TableCell>
                        <Badge className={orderTypeClass[order.orderType]}>{order.orderType}</Badge>
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.district}</TableCell>
                      <TableCell className="text-right font-mono">₹{order.orderValue.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge className={paymentStatusClass[order.paymentStatus]}>{order.paymentStatus}</Badge>
                      </TableCell>
                      <TableCell>
                         <Badge className={orderStatusColors[order.orderStatus] || "bg-gray-100 text-gray-700"}>{order.orderStatus}</Badge>
                      </TableCell>
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
              <div className="mt-6 space-y-4 text-sm scrollbar-hide overflow-y-auto max-h-[85vh] pb-10">
                
                {/* Status-Based Administrative Actions */}
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                        <PackageCheck className="h-4 w-4" /> Fulfillment Action Center
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {selectedOrder.orderStatus === 'Pending' || selectedOrder.orderStatus === 'Assigned' ? (
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isUpdating} onClick={() => handleUpdateStatus('accepted')}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Accept Order
                            </Button>
                        ) : null}
                        
                        {selectedOrder.orderStatus === 'Accepted' ? (
                            <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={isUpdating} onClick={() => handleUpdateStatus('packing')}>
                                <Package className="mr-2 h-4 w-4" /> Start Packing
                            </Button>
                        ) : null}

                        {selectedOrder.orderStatus === 'Packing' ? (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isUpdating} onClick={() => setShowDispatchModal(true)}>
                                <Truck className="mr-2 h-4 w-4" /> Dispatch Order
                            </Button>
                        ) : null}

                        {selectedOrder.orderStatus === 'Dispatched' ? (
                            <Button className="w-full bg-green-600 hover:bg-green-700" disabled={isUpdating} onClick={() => handleUpdateStatus('delivered')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark Delivered
                            </Button>
                        ) : null}
                        
                        {selectedOrder.orderStatus === 'Delivered' ? (
                            <div className="col-span-2 text-center p-2 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                                Waiting for Customer to Confirm Receipt
                            </div>
                        ) : null}

                        {selectedOrder.orderStatus === 'Received' ? (
                            <div className="col-span-2 text-center p-2 rounded bg-emerald-100 text-emerald-800 text-xs font-medium">
                                Transaction Completed Successfully
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground">Order Type</p>
                        <p className="font-semibold">{selectedOrder.orderType}</p>
                    </div>
                    <div className="rounded-md border p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground">Created Date</p>
                        <p className="font-semibold">{selectedOrder.createdDate}</p>
                    </div>
                </div>

                <div className="rounded-md border p-3">
                  <p><span className="font-semibold text-xs text-muted-foreground uppercase">Customer Information</span></p>
                  <p className="mt-1"><span className="font-semibold">Name:</span> {selectedOrder.customer}</p>
                  {selectedOrderDetails?.order?.customer_phone && (
                    <p><span className="font-semibold">Mobile:</span> {selectedOrderDetails.order.customer_phone}</p>
                  )}
                  <p><span className="font-semibold">District:</span> {selectedOrder.district}</p>
                  <p><span className="font-semibold">Payment:</span> {selectedOrder.paymentMode}</p>
                </div>

                {selectedOrderDetails?.order?.delivery_address && (
                  <div className="rounded-md border p-3 bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                    <p className="font-semibold text-xs text-blue-700 dark:text-blue-300 uppercase mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Delivery Address
                    </p>
                    <div className="text-sm space-y-0.5">
                      {(() => {
                        const addr = selectedOrderDetails.order.delivery_address;
                        const parsed = typeof addr === 'string' ? JSON.parse(addr) : addr;
                        return (
                          <>
                            <p className="font-medium">{parsed.street || parsed.address || 'N/A'}</p>
                            <p>{parsed.city}{parsed.pincode ? ` - ${parsed.pincode}` : ''}</p>
                            <p className="text-xs text-muted-foreground">{parsed.district}, {parsed.state}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {selectedOrderDetails && (
                  <div className="mt-4 space-y-4">
                    <h3 className="font-semibold text-base flex items-center gap-2 italic">
                       Order Items
                    </h3>
                    <div className="space-y-2">
                       {selectedOrderDetails.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-muted/50 border">
                           <div>
                             <p className="font-medium text-xs">{item.product_name}</p>
                             <p className="text-[10px] text-muted-foreground">{item.variant_name || 'Standard Variant'} x {item.quantity}</p>
                           </div>
                           <p className="font-mono text-xs font-bold">₹{parseFloat(item.total_price).toLocaleString("en-IN")}</p>
                         </div>
                       ))}
                       <div className="flex justify-between items-center p-2 border-t mt-2">
                          <p className="font-bold">Total Amount</p>
                          <p className="font-bold text-emerald-600">₹{selectedOrder.orderValue.toLocaleString("en-IN")}</p>
                       </div>
                    </div>

                    <h3 className="font-semibold text-base">Status Timeline</h3>
                    <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                       {selectedOrderDetails.status_log.map((log: any, idx: number) => (
                         <div key={idx} className="pl-6 relative">
                           <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-background" />
                           <p className="font-medium capitalize text-xs">{log.new_status}</p>
                           <p className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                           {log.note && <p className="text-xs mt-0.5 italic">{log.note}</p>}
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
                  <p className="font-semibold text-xs text-amber-700 dark:text-amber-300">Finance Safety Guardrail</p>
                  <p className="text-[11px] text-muted-foreground">Stock and Profit ledger entries will be finalized only after Customer confirms receipt.</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dispatch Modal */}
      <Dialog open={showDispatchModal} onOpenChange={setShowDispatchModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Courier & Shipment Details</DialogTitle>
            <DialogDescription>
              Provide tracking information for the customer before marking as dispatched.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courier" className="text-right">Courier</Label>
              <Input
                id="courier"
                placeholder="e.g. RedX, FedEx"
                className="col-span-3"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tracking" className="text-right">Tracking ID</Label>
              <Input
                id="tracking"
                placeholder="Shipment Tracking Number"
                className="col-span-3"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoice" className="text-right text-xs">Invoice (Opt)</Label>
              <Input
                id="invoice"
                type="file"
                className="col-span-3 text-xs"
                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispatchModal(false)}>Cancel</Button>
            <Button 
                disabled={!courierName || !trackingId || isUpdating} 
                onClick={() => handleUpdateStatus('dispatched', { carrier: courierName, tracking_number: trackingId })}
            >
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Dispatch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

