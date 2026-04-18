import { useMemo, useState, useEffect } from "react";
import { orderApi } from "@/lib/orderApi";
import { MessageCircle, RefreshCw, Route, TriangleAlert, XCircle } from "lucide-react";
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

type ActiveStatus = "Pending" | "Confirmed" | "Packed" | "Out for Delivery";

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
};

const ROWS: Row[] = [
  {
    orderId: "AO-260222-001",
    orderType: "B2B",
    product: "Premium Wheat Seed",
    quantity: "120 Bags",
    orderValue: 156000,
    marginEarned: 12480,
    fulfilmentBy: "North Stock Point",
    fulfilmentMode: "Stock Point",
    orderStatus: "Packed",
    createdDate: "2026-02-22",
    paymentStatus: "Paid",
    location: "Kolkata / Salt Lake",
    customer: "Arjun Traders",
    progress: 70,
    sla: "08:21:12",
  },
  {
    orderId: "AO-260222-002",
    orderType: "B2C",
    product: "Drip Irrigation Kit",
    quantity: "8 Units",
    orderValue: 46400,
    marginEarned: 3712,
    fulfilmentBy: "Self",
    fulfilmentMode: "Self",
    orderStatus: "Out for Delivery",
    createdDate: "2026-02-22",
    paymentStatus: "Pending",
    location: "Howrah / Liluah",
    customer: "M. Roy",
    progress: 90,
    sla: "01:05:44",
    delayed: true,
  },
  {
    orderId: "AO-260221-004",
    orderType: "B2B",
    product: "Bio Soil Conditioner",
    quantity: "75 Bags",
    orderValue: 82500,
    marginEarned: 6600,
    fulfilmentBy: "East Stock Point",
    fulfilmentMode: "Stock Point",
    orderStatus: "Confirmed",
    createdDate: "2026-02-21",
    paymentStatus: "Paid",
    location: "Nadia / Ranaghat",
    customer: "Kisan Mart",
    progress: 40,
    sla: "12:44:08",
  },
  {
    orderId: "AO-260220-007",
    orderType: "B2C",
    product: "Crop Care Spray",
    quantity: "30 Bottles",
    orderValue: 17400,
    marginEarned: 1392,
    fulfilmentBy: "Self",
    fulfilmentMode: "Self",
    orderStatus: "Pending",
    createdDate: "2026-02-20",
    paymentStatus: "Pending",
    location: "Hooghly / Chinsurah",
    customer: "S. Ghosh",
    progress: 15,
    sla: "18:02:25",
  },
];

const PAGE_SIZE = 5;

export default function ActiveOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [dataRows, setDataRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const parseAddress = (addr: any): string => {
    if (!addr) return "Local";
    try {
      const parsed = typeof addr === "string" ? JSON.parse(addr) : addr;
      return parsed?.city || parsed?.street || "Local";
    } catch {
      return String(addr) || "Local";
    }
  };

  const mapStatus = (status: string): ActiveStatus => {
    const s = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const valid: ActiveStatus[] = ["Pending", "Confirmed", "Packed", "Out for Delivery"];
    return valid.includes(s as ActiveStatus) ? (s as ActiveStatus) : "Pending";
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
      // Active = NOT delivered/cancelled/returned/closed
      const activeOrders = res.orders.filter((o: any) =>
        !["delivered", "cancelled", "returned", "closed"].includes((o.status || "").toLowerCase())
      );
      const mapped: Row[] = activeOrders.map((o: any) => ({
        orderId: o.order_number || o.id,
        orderType: (o.order_type || "B2B") as OrderType,
        product: o.product_names || "Order Items",
        quantity: o.total_quantity ? `${o.total_quantity} units` : "-",
        orderValue: parseFloat(o.total_amount || 0),
        marginEarned: parseFloat(o.total_profit || 0),
        fulfilmentBy: o.status === "assigned" ? "Stock Point" : "Admin (Central)",
        fulfilmentMode: "Stock Point",
        orderStatus: mapStatus(o.status || "pending"),
        createdDate: new Date(o.created_at).toISOString().split("T")[0],
        paymentStatus: o.payment_method === "wallet" ? "Paid" : "Pending",
        location: o.district_name || parseAddress(o.delivery_address),
        customer: o.customer_name || "Self",
        progress:
          o.status === "pending" ? 15
          : o.status === "confirmed" ? 40
          : o.status === "packed" ? 70
          : o.status === "out_for_delivery" ? 85
          : o.status === "assigned" ? 50
          : 10,
        sla: "24:00:00",
        realId: o.id, // Store real UUID for API calls
      }));
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
      // Find the row to get the internal ID if order_number is used
      // Actually the backend endpoint needs the UUID ID. 
      // In mapped rows, orderId is o.order_number || o.id.
      // Let's ensure we have the real UUID in the Row type or fetch it.
      // For now, I'll assume we used the ID.
      
      await orderApi.cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      fetchOrders(); // Refresh list
    } catch (err: any) {
      console.error("Cancellation failed:", err);
      toast.error(err?.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancellingId(null);
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
        timeline: ["Order Created", "Order Confirmed", "Packed", selected.orderStatus],
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

