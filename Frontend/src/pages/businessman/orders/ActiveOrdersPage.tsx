import { useMemo, useState, useEffect } from "react";
import { orderApi } from "@/lib/orderApi";
import { CheckCircle2, MessageCircle, RefreshCw, Route, TriangleAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CommonOrderFilters,
  formatCurrency,
  OrderDetailsData,
  OrderDetailsDialog,
  OrdersEmptyState,
  OrderStatusBadge,
  OrderTableSkeleton,
  OrderTrackingFilters,
  OrderType,
  OrderTypeBadge,
  PaymentStatus,
  PaymentStatusBadge,
  SlaCountdownBadge,
  SortableColumnHeader,
} from "@/components/businessman/OrderTrackingPrimitives";

type ActiveStatus = "Pending" | "Confirmed" | "Packing" | "Dispatched" | "Delivered" | "Received";

type Row = {
  orderId: string;
  orderType: OrderType;
  product: string;
  quantity: string;
  orderValue: number;
  marginEarned: number;
  fulfilmentBy: string;
  fulfilmentMode: "Self" | "Stock Point";
  orderStatus: ActiveStatus;
  createdDate: string;
  paymentStatus: PaymentStatus;
  location: string;
  customer: string;
  progress: number;
  sla: string;
  delayed?: boolean;
  realId: string;
  address?: string;
  phone?: string;
};

const ROWS: Row[] = [];

const PAGE_SIZE = 5;

export default function ActiveOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [dataRows, setDataRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchOrderDetails = async (id: string) => {
    setFetchingDetails(true);
    try {
      const data = await orderApi.getOrderDetails(id);
      setSelectedDetails(data);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      toast.error("Could not load timeline details");
    } finally {
      setFetchingDetails(false);
    }
  };

  useEffect(() => {
    if (selected?.realId) {
      fetchOrderDetails(selected.realId);
    } else {
      setSelectedDetails(null);
    }
  }, [selected]);

  const formatAddress = (addr: any): string => {
    if (!addr) return "N/A";
    try {
      const p = typeof addr === "string" ? JSON.parse(addr) : addr;
      return `${p.street || p.address || ""}, ${p.city || ""}${p.pincode ? " - " + p.pincode : ""}, ${p.district || ""}, ${p.state || ""}`.replace(/^, |, $/g, "");
    } catch {
      return String(addr);
    }
  };

  const parseAddressCity = (addr: any): string => {
    if (!addr) return "Local";
    try {
      const parsed = typeof addr === "string" ? JSON.parse(addr) : addr;
      return parsed?.city || parsed?.street || "Local";
    } catch {
      return String(addr) || "Local";
    }
  };

  const mapStatus = (status: string): ActiveStatus => {
    const s = status.toLowerCase();
    if (s === 'pending') return "Pending";
    if (s === 'accepted') return "Confirmed";
    if (s === 'assigned') return "Confirmed";
    if (s === 'packing') return "Packing";
    if (s === 'dispatched') return "Dispatched";
    if (s === 'delivered') return "Delivered";
    if (s === 'received') return "Received";
    return "Pending";
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getMyOrders();
      if (!res || !res.orders) {
        setError("No response from server.");
        return;
      }
      // Active = NOT received/cancelled/returned/closed
      const activeOrders = res.orders.filter((o: any) =>
        !["received", "cancelled", "returned", "closed"].includes((o.status || "").toLowerCase())
      );
      const mapped: Row[] = activeOrders.map((o: any) => {
        const status = (o.status || "pending").toLowerCase();
        let progress = 10;
        if (status === 'accepted' || status === 'assigned') progress = 30;
        else if (status === 'packing') progress = 50;
        else if (status === 'dispatched') progress = 75;
        else if (status === 'delivered') progress = 95;
        else if (status === 'received') progress = 100;

        return {
          orderId: o.order_number || o.id,
          orderType: (o.order_type || "B2B") as OrderType,
          product: o.product_names || "Order Items",
          quantity: o.total_quantity ? `${o.total_quantity} units` : "-",
          orderValue: parseFloat(o.total_amount || 0),
          marginEarned: parseFloat(o.total_profit || 0),
          fulfilmentBy: status === "assigned" ? "Stock Point" : "Admin (Central)",
          fulfilmentMode: "Stock Point",
          orderStatus: mapStatus(status),
          createdDate: new Date(o.created_at).toISOString().split("T")[0],
          paymentStatus: o.payment_method === "wallet" ? "Paid" : "Pending",
          location: o.district_name || parseAddressCity(o.delivery_address),
          customer: o.customer_name || "Self",
          progress,
          sla: "24:00:00",
          realId: o.id,
          address: formatAddress(o.delivery_address),
          phone: o.customer_phone,
        };
      });
      setDataRows(mapped);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setError(err?.response?.data?.details || err?.response?.data?.error || err?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    
    setCancellingId(orderId);
    try {
      await orderApi.cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (err: any) {
      console.error("Cancellation failed:", err);
      toast.error(err?.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmReceipt = async (orderId: string) => {
    if (!window.confirm("Please confirm that you have received all items in good condition.")) return;
    
    setConfirmingId(orderId);
    try {
      await orderApi.confirmOrderReceipt(orderId);
      toast.success("Order received and transaction completed!");
      fetchOrders();
    } catch (err: any) {
      console.error("Confirmation failed:", err);
      toast.error(err?.response?.data?.error || "Failed to confirm receipt");
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [sortKey, setSortKey] = useState<keyof Row>("createdDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<CommonOrderFilters>({
    fromDate: "",
    toDate: "",
    search: "",
    orderType: "all",
    fulfilmentMode: "all",
    location: "",
    paymentStatus: "all",
  });

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const list = dataRows.filter((row) => {
      const ts = new Date(row.createdDate).getTime();
      const byFrom = !filters.fromDate || ts >= new Date(filters.fromDate).getTime();
      const byTo = !filters.toDate || ts <= new Date(filters.toDate).getTime();
      const byType = filters.orderType === "all" || row.orderType === filters.orderType;
      const byFulfilment = filters.fulfilmentMode === "all" || row.fulfilmentMode === filters.fulfilmentMode;
      const byPayment = filters.paymentStatus === "all" || row.paymentStatus === filters.paymentStatus;
      const byLocation = !filters.location || row.location.toLowerCase().includes(filters.location.toLowerCase());
      const bySearch =
        !query ||
        row.orderId.toLowerCase().includes(query) ||
        row.product.toLowerCase().includes(query) ||
        row.customer.toLowerCase().includes(query) ||
        row.location.toLowerCase().includes(query);

      return byFrom && byTo && byType && byFulfilment && byPayment && byLocation && bySearch;
    });

    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const dir = sortDirection === "asc" ? 1 : -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filters, sortDirection, sortKey, dataRows]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const details: OrderDetailsData | null = selected
    ? {
        orderId: selected.orderId,
        orderType: selected.orderType,
        product: selected.product,
        quantity: selected.quantity,
        orderValue: selected.orderValue,
        marginEarned: selected.marginEarned,
        fulfilmentBy: selected.fulfilmentBy,
        status: selected.orderStatus,
        createdDate: selected.createdDate,
        paymentStatus: selected.paymentStatus,
        location: selected.location,
        address: selected.address,
        phone: selected.phone,
        trackingInfo: selectedDetails?.assignments?.[0] ? {
          carrier: selectedDetails.assignments[0].carrier,
          trackingNumber: selectedDetails.assignments[0].tracking_number,
          invoiceUrl: selectedDetails.assignments[0].invoice_url
        } : undefined,
        timeline: selectedDetails?.status_log?.map((log: any) => ({
          status: log.new_status,
          date: log.created_at,
          note: log.note
        })) || [
          { status: "Processing Order", date: selected.createdDate + "T00:00:00Z" }
        ],
        walletImpact: "Margin will be credited after successful delivery and return-window closure.",
      }
    : null;

  const onSort = (column: keyof Row) => {
    if (sortKey === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column);
    setSortDirection("asc");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Active Orders</h1>
          <p className="text-sm text-muted-foreground">Operational queue of ongoing orders and SLA-linked movement visibility.</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600 flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          <span><strong>Error loading orders:</strong> {error}</span>
        </div>
      )}

      <OrderTrackingFilters filters={filters} setFilters={(next) => { setPage(1); setFilters(next); }} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order List ({dataRows.length} total)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <OrderTableSkeleton />
          ) : filtered.length === 0 ? (
            <OrdersEmptyState />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><SortableColumnHeader label="Order ID" column="orderId" sortKey={sortKey} sortDirection={sortDirection} onSort={(c) => onSort(c as keyof Row)} /></TableHead>
                    <TableHead><SortableColumnHeader label="Order Type" column="orderType" sortKey={sortKey} sortDirection={sortDirection} onSort={(c) => onSort(c as keyof Row)} /></TableHead>
                    <TableHead><SortableColumnHeader label="Product / Service" column="product" sortKey={sortKey} sortDirection={sortDirection} onSort={(c) => onSort(c as keyof Row)} /></TableHead>
                    <TableHead><SortableColumnHeader label="Quantity" column="quantity" sortKey={sortKey} sortDirection={sortDirection} onSort={(c) => onSort(c as keyof Row)} /></TableHead>
                    <TableHead><SortableColumnHeader label="Order Value" column="orderValue" sortKey={sortKey} sortDirection={sortDirection} onSort={(c) => onSort(c as keyof Row)} /></TableHead>
                    <TableHead><SortableColumnHeader label="Margin Earned" column="marginEarned" sortKey={sortKey} sortDirection={sortDirection} onSort={(c) => onSort(c as keyof Row)} /></TableHead>
                    <TableHead><SortableColumnHeader label="Fulfilment By" column="fulfilmentBy" sortKey={sortKey} sortDirection={sortDirection} onSort={(c) => onSort(c as keyof Row)} /></TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead><SortableColumnHeader label="Created Date" column="createdDate" sortKey={sortKey} sortDirection={sortDirection} onSort={(c) => onSort(c as keyof Row)} /></TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((row) => (
                    <TableRow key={row.orderId}>
                      <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                      <TableCell><OrderTypeBadge value={row.orderType} /></TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p>{row.product}</p>
                          <p className="text-xs text-muted-foreground">{row.customer}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{row.quantity}</TableCell>
                      <TableCell className="font-mono text-emerald-500">{formatCurrency(row.orderValue)}</TableCell>
                      <TableCell className="font-mono text-emerald-500">{formatCurrency(row.marginEarned)}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p>{row.fulfilmentBy}</p>
                          <p className="text-xs text-muted-foreground">{row.location}</p>
                          <PaymentStatusBadge value={row.paymentStatus} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <OrderStatusBadge value={row.orderStatus} tone="active" />
                          <Progress value={row.progress} className="h-2" />
                          <SlaCountdownBadge value={row.sla} delayed={row.delayed} />
                          {row.delayed ? <TriangleAlert className="h-3.5 w-3.5 text-red-500" /> : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.createdDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View Details</Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Contact Stock Point / Admin">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Track Shipment">
                            <Route className="h-4 w-4" />
                          </Button>
                          {row.orderStatus === "Delivered" && (
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                              title="Confirm Receipt"
                              onClick={() => handleConfirmReceipt(row.realId)}
                              disabled={confirmingId === row.realId}
                            >
                              <CheckCircle2 className={`mr-2 h-4 w-4 ${confirmingId === row.realId ? "animate-spin" : ""}`} />
                              Confirm Receipt
                            </Button>
                          )}
                          {["Pending", "Confirmed"].includes(row.orderStatus) && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" 
                              title="Cancel Order"
                              onClick={() => handleCancel(row.realId)}
                              disabled={cancellingId === row.realId}
                            >
                              <XCircle className={`h-4 w-4 ${cancellingId === row.realId ? "animate-spin" : ""}`} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length} records • Server-side filtering ready</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {safePage} / {pages}</span>
              <Button size="sm" variant="outline" disabled={safePage >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderDetailsDialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)} order={details} />
    </div>
  );
}

