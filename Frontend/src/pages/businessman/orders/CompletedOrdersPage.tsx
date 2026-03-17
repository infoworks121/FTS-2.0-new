import { useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  SortableColumnHeader,
} from "@/components/businessman/OrderTrackingPrimitives";

type CompletedStatus = "Delivered" | "Closed";
type ReferralPayout = "Processed" | "Pending";

type Row = {
  orderId: string;
  orderType: OrderType;
  product: string;
  quantity: string;
  orderValue: number;
  marginEarned: number;
  fulfilmentBy: string;
  fulfilmentMode: "Self" | "Stock Point";
  orderStatus: CompletedStatus;
  createdDate: string;
  completionAt: string;
  paymentStatus: PaymentStatus;
  location: string;
  customer: string;
  earningsLocked: boolean;
  referralPayout: ReferralPayout;
};

const ROWS: Row[] = [
  {
    orderId: "CO-260220-101",
    orderType: "B2B",
    product: "Hybrid Corn Seed",
    quantity: "200 Bags",
    orderValue: 268000,
    marginEarned: 21440,
    fulfilmentBy: "Central Stock Point",
    fulfilmentMode: "Stock Point",
    orderStatus: "Delivered",
    createdDate: "2026-02-19",
    completionAt: "2026-02-20 16:20",
    paymentStatus: "Paid",
    location: "Kolkata / New Town",
    customer: "Rural Connect Pvt",
    earningsLocked: true,
    referralPayout: "Processed",
  },
  {
    orderId: "CO-260219-087",
    orderType: "B2C",
    product: "Crop Care Spray",
    quantity: "48 Bottles",
    orderValue: 27840,
    marginEarned: 2227,
    fulfilmentBy: "Self",
    fulfilmentMode: "Self",
    orderStatus: "Closed",
    createdDate: "2026-02-18",
    completionAt: "2026-02-19 13:02",
    paymentStatus: "Paid",
    location: "Howrah / Bally",
    customer: "S. Banerjee",
    earningsLocked: true,
    referralPayout: "Pending",
  },
];

const PAGE_SIZE = 5;

export default function CompletedOrdersPage() {
  const [loading] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
  const [sortKey, setSortKey] = useState<keyof Row>("completionAt");
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
    const list = ROWS.filter((row) => {
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
  }, [filters, sortDirection, sortKey]);

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
        timeline: ["Order Created", "Order Confirmed", "Delivered", `Closed at ${selected.completionAt}`],
        walletImpact: "Earnings locked and credited after return window closure.",
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
      <div>
        <h1 className="text-xl font-bold">Completed Orders</h1>
        <p className="text-sm text-muted-foreground">Historical order records with locked earnings and closure visibility.</p>
      </div>

      <OrderTrackingFilters filters={filters} setFilters={(next) => { setPage(1); setFilters(next); }} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <OrderTableSkeleton />
          ) : filtered.length === 0 ? (
            <OrdersEmptyState ctaLabel="No completed orders found for selected filters." />
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
                          <p className="text-xs text-muted-foreground">Completed at {row.completionAt}</p>
                          <PaymentStatusBadge value={row.paymentStatus} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <OrderStatusBadge value={row.orderStatus} tone="completed" />
                          <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
                            {row.earningsLocked ? "Earnings Locked" : "Earnings Open"}
                          </span>
                          <span className="inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-500">
                            Referral {row.referralPayout}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.createdDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View Details</Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Download Invoice">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="View Ledger Entry (read-only)">
                            <FileSpreadsheet className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">Earnings credited after return window closure</p>

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

