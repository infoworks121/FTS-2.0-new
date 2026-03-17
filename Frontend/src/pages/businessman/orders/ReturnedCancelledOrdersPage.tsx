import { useMemo, useState } from "react";
import { CircleDollarSign, History, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

type ReturnedStatus =
  | "Returned"
  | "Cancelled by Customer"
  | "Cancelled by System"
  | "Cancelled by Admin";

type RefundStatus = "Refund Initiated" | "Refunded" | "No Refund";
type ReferralReversal = "Reversed" | "Not Applicable" | "Pending";

type Row = {
  orderId: string;
  orderType: OrderType;
  product: string;
  quantity: string;
  orderValue: number;
  marginEarned: number;
  fulfilmentBy: string;
  fulfilmentMode: "Self" | "Stock Point";
  orderStatus: ReturnedStatus;
  createdDate: string;
  paymentStatus: PaymentStatus;
  location: string;
  customer: string;
  returnReason: string;
  refundStatus: RefundStatus;
  referralReversal: ReferralReversal;
  walletImpact: "Credit Reversed" | "No Impact";
};

const ROWS: Row[] = [
  {
    orderId: "RC-260221-011",
    orderType: "B2B",
    product: "Nitro Boost Fertilizer",
    quantity: "90 Bags",
    orderValue: 121500,
    marginEarned: -9720,
    fulfilmentBy: "South Stock Point",
    fulfilmentMode: "Stock Point",
    orderStatus: "Returned",
    createdDate: "2026-02-21",
    paymentStatus: "Refunded",
    location: "Nadia / Kalyani",
    customer: "Farm Link Traders",
    returnReason: "Damaged package reported on delivery.",
    refundStatus: "Refunded",
    referralReversal: "Reversed",
    walletImpact: "Credit Reversed",
  },
  {
    orderId: "RC-260220-022",
    orderType: "B2C",
    product: "Micro Nutrient Pack",
    quantity: "18 Units",
    orderValue: 9360,
    marginEarned: 0,
    fulfilmentBy: "Self",
    fulfilmentMode: "Self",
    orderStatus: "Cancelled by Customer",
    createdDate: "2026-02-20",
    paymentStatus: "Pending",
    location: "Hooghly / Serampore",
    customer: "A. Dey",
    returnReason: "Customer requested pre-dispatch cancellation.",
    refundStatus: "No Refund",
    referralReversal: "Not Applicable",
    walletImpact: "No Impact",
  },
  {
    orderId: "RC-260219-027",
    orderType: "B2B",
    product: "Shield Pro Pesticide",
    quantity: "40 Bottles",
    orderValue: 31400,
    marginEarned: -2512,
    fulfilmentBy: "West Stock Point",
    fulfilmentMode: "Stock Point",
    orderStatus: "Cancelled by Admin",
    createdDate: "2026-02-19",
    paymentStatus: "Refunded",
    location: "Howrah / Uluberia",
    customer: "Agro Grid",
    returnReason: "Compliance exception flagged for order route.",
    refundStatus: "Refund Initiated",
    referralReversal: "Pending",
    walletImpact: "Credit Reversed",
  },
];

const PAGE_SIZE = 5;

export default function ReturnedCancelledOrdersPage() {
  const [loading] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
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
        timeline: [
          "Order Created",
          selected.orderStatus,
          `Refund: ${selected.refundStatus}`,
          `Referral reversal: ${selected.referralReversal}`,
        ],
        walletImpact:
          selected.walletImpact === "Credit Reversed"
            ? "Wallet credit and referral earnings reversed due to cancellation/return."
            : "No wallet balance effect for this cancellation.",
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
        <h1 className="text-xl font-bold">Returned / Cancelled Orders</h1>
        <p className="text-sm text-muted-foreground">Risk and reversal visibility across returns, refunds, and cancellation lifecycle.</p>
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
            <OrdersEmptyState ctaLabel="No returned/cancelled orders for selected filter." />
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
                      <TableCell className={row.marginEarned < 0 ? "font-mono text-red-500" : "font-mono text-emerald-500"}>
                        {formatCurrency(row.marginEarned)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p>{row.fulfilmentBy}</p>
                          <p className="text-xs text-muted-foreground">{row.location}</p>
                          <PaymentStatusBadge value={row.paymentStatus} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <OrderStatusBadge value={row.orderStatus} tone="reversal" />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Info className="h-3.5 w-3.5" /> Return reason
                              </TooltipTrigger>
                              <TooltipContent>{row.returnReason}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="inline-flex rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                            {row.refundStatus}
                          </span>
                          <span className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                            Referral {row.referralReversal}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.createdDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View Details</Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="View Refund Timeline">
                            <History className="h-4 w-4" />
                          </Button>
                          {row.walletImpact === "Credit Reversed" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                              <CircleDollarSign className="h-3 w-3" /> Wallet Impact
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length} records • Wallet impact clearly flagged</p>
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

