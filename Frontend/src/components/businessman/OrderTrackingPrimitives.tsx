import { ReactNode } from "react";
import { AlertTriangle, CalendarRange, Search, ExternalLink, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type OrderType = "B2B" | "B2C";
export type FulfilmentMode = "Self" | "Stock Point";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";

export type CommonOrderFilters = {
  fromDate: string;
  toDate: string;
  search: string;
  orderType: "all" | OrderType;
  fulfilmentMode: "all" | FulfilmentMode;
  location: string;
  paymentStatus: "all" | PaymentStatus;
};

export type OrderDetailsData = {
  orderId: string;
  orderType: OrderType;
  product: string;
  quantity: string;
  orderValue: number;
  marginEarned: number;
  fulfilmentBy: string;
  status: string;
  createdDate: string;
  paymentStatus: PaymentStatus;
  location: string;
  address?: string;
  phone?: string;
  trackingInfo?: {
    carrier?: string;
    trackingNumber?: string;
    invoiceUrl?: string;
  };
  timeline: { status: string; date: string; note?: string }[];
  walletImpact: string;
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export function OrderTypeBadge({ value }: { value: OrderType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold",
        value === "B2B"
          ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
          : "border-violet-500/40 bg-violet-500/10 text-violet-400"
      )}
    >
      {value}
    </Badge>
  );
}

export function PaymentStatusBadge({ value }: { value: PaymentStatus }) {
  const classes: Record<PaymentStatus, string> = {
    Paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    Pending: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    Refunded: "border-red-500/40 bg-red-500/10 text-red-500",
  };

  return (
    <Badge variant="outline" className={classes[value]}>
      {value}
    </Badge>
  );
}

export function OrderStatusBadge({
  value,
  tone,
}: {
  value: string;
  tone: "active" | "completed" | "reversal";
}) {
  const classes = {
    active: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    reversal: "border-red-500/40 bg-red-500/10 text-red-500",
  };

  return (
    <Badge variant="outline" className={classes[tone]}>
      {value}
    </Badge>
  );
}

export function SlaCountdownBadge({
  value,
  delayed,
}: {
  value: string;
  delayed?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        delayed
          ? "border-red-500/40 bg-red-500/10 text-red-500"
          : "border-amber-500/40 bg-amber-500/10 text-amber-500"
      )}
    >
      {delayed ? <AlertTriangle className="h-3 w-3" /> : null}
      SLA {value}
    </span>
  );
}

export function SortableColumnHeader({
  label,
  column,
  sortKey,
  sortDirection,
  onSort,
}: {
  label: string;
  column: string;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-auto px-0 py-0 text-xs font-semibold text-muted-foreground hover:text-foreground"
      onClick={() => onSort(column)}
    >
      {label}
      <span className="ml-1 text-[10px]">{sortKey === column ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
    </Button>
  );
}

export function OrderTrackingFilters({
  filters,
  setFilters,
}: {
  filters: CommonOrderFilters;
  setFilters: (next: CommonOrderFilters) => void;
}) {
  return (
    <Card className="sticky top-2 z-10 border-border/80 bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-sm">Global Filters</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
        <div className="space-y-2">
          <Label>Date From</Label>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
          />
        </div>

        <div className="space-y-2 xl:col-span-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Order ID / Product / Customer / Location"
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Order Type</Label>
          <Select
            value={filters.orderType}
            onValueChange={(v: "all" | OrderType) => setFilters({ ...filters, orderType: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="B2B">B2B</SelectItem>
              <SelectItem value="B2C">B2C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Fulfilment Mode</Label>
          <Select
            value={filters.fulfilmentMode}
            onValueChange={(v: "all" | FulfilmentMode) => setFilters({ ...filters, fulfilmentMode: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Self">Self</SelectItem>
              <SelectItem value="Stock Point">Stock Point</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="District / Area"
          />
        </div>

        <div className="space-y-2">
          <Label>Payment Status</Label>
          <Select
            value={filters.paymentStatus}
            onValueChange={(v: "all" | PaymentStatus) => setFilters({ ...filters, paymentStatus: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetailsData | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Audit-safe read-only order visibility for Businessman panel operations.</DialogDescription>
        </DialogHeader>

        {order ? (
          <div className="space-y-4 text-sm">
            <Section title="Order Summary">
              <KeyValue label="Order ID" value={<span className="font-mono text-xs">{order.orderId}</span>} />
              <KeyValue label="Order Type" value={<OrderTypeBadge value={order.orderType} />} />
              <KeyValue label="Order Status" value={order.status} />
              {order.phone && <KeyValue label="Contact Number" value={order.phone} />}
              <KeyValue label="Created Date" value={<span className="font-mono text-xs">{order.createdDate}</span>} />
            </Section>

            <Section title="Product & Quantity">
              <KeyValue label="Product / Service" value={order.product} />
              <KeyValue label="Quantity" value={<span className="font-mono">{order.quantity}</span>} />
            </Section>

            <Section title="Pricing & Margin Breakdown">
              <KeyValue label="Order Value" value={<span className="font-mono text-emerald-500">{formatCurrency(order.orderValue)}</span>} />
              <KeyValue label="Margin Earned" value={<span className="font-mono text-emerald-500">{formatCurrency(order.marginEarned)}</span>} />
              <KeyValue label="Payment Status" value={<PaymentStatusBadge value={order.paymentStatus} />} />
            </Section>

            {order.trackingInfo && (order.trackingInfo.carrier || order.trackingInfo.trackingNumber) && (
              <Section title="Tracking & Logistics">
                {order.trackingInfo.carrier && <KeyValue label="Carrier" value={order.trackingInfo.carrier} />}
                {order.trackingInfo.trackingNumber && <KeyValue label="Tracking ID" value={<span className="font-bold text-blue-500">{order.trackingInfo.trackingNumber}</span>} />}
                {order.trackingInfo.invoiceUrl && (
                  <div className="mt-3 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-8 text-[11px] gap-2 border-primary/40 hover:bg-primary/5"
                      onClick={() => window.open(order.trackingInfo?.invoiceUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" /> View Invoice
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full h-8 text-[11px] gap-2"
                      onClick={() => toast.info(`Tracking with ${order.trackingInfo?.carrier}...`)}
                    >
                      <Truck className="h-3 w-3" /> Track Order
                    </Button>
                  </div>
                )}
              </Section>
            )}

            <Section title="Order Journey Timeline">
              <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                {order.timeline.map((item, idx) => (
                  <div key={idx} className="pl-6 relative">
                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-emerald-500 bg-background shadow-sm" />
                    <div className="flex flex-col">
                      <p className="font-semibold text-xs capitalize text-foreground">{item.status}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CalendarRange className="h-2.5 w-2.5" /> 
                        {new Date(item.date).toLocaleString('en-IN', {
                           day: '2-digit', month: 'short', year: 'numeric',
                           hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {item.note && (
                        <p className="text-[11px] mt-1 italic text-muted-foreground/80 bg-muted/40 p-1.5 rounded border border-dashed">
                          "{item.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Wallet Impact Summary">
              <p className="text-muted-foreground">{order.walletImpact}</p>
            </Section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-border/70 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function OrderTableSkeleton() {
  return (
    <div className="rounded-md border border-border/70 p-4">
      <Skeleton className="mb-3 h-8 w-full" />
      <Skeleton className="mb-2 h-10 w-full" />
      <Skeleton className="mb-2 h-10 w-full" />
      <Skeleton className="mb-2 h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function OrdersEmptyState({ ctaLabel }: { ctaLabel?: string }) {
  return (
    <div className="rounded-md border border-dashed border-border/80 bg-muted/20 p-10 text-center">
      <CalendarRange className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No orders found for selected filter</p>
      <p className="mt-1 text-xs text-muted-foreground">{ctaLabel ?? "Adjust filters and retry to fetch operational records."}</p>
    </div>
  );
}

