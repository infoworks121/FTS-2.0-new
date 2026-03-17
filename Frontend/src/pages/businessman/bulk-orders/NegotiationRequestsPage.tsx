import { useMemo, useState } from "react";
import { AlertTriangle, MessageSquareText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkOrderStatusBadge, LoggedBadge, formatCurrency } from "@/components/businessman/BulkOrderPrimitives";

type NegotiationStatus = "Pending" | "Negotiation" | "Rejected";

type NegotiationRow = {
  orderId: string;
  date: string;
  product: string;
  quantity: number;
  requestedPrice: number;
  counterPrice?: number;
  status: NegotiationStatus;
  phase: "Pending" | "Counter" | "Waiting";
  expired?: boolean;
};

const rows: NegotiationRow[] = [
  { orderId: "BO-260222-001", date: "2026-02-22", product: "Premium Wheat Seed", quantity: 450, requestedPrice: 1310, counterPrice: 1350, status: "Negotiation", phase: "Counter" },
  { orderId: "BO-260221-008", date: "2026-02-21", product: "Nitro Boost Fertilizer", quantity: 300, requestedPrice: 920, status: "Pending", phase: "Waiting" },
  { orderId: "BO-260219-015", date: "2026-02-19", product: "Smart Drip Kit", quantity: 120, requestedPrice: 6000, counterPrice: 6080, status: "Negotiation", phase: "Pending", expired: true },
  { orderId: "BO-260218-017", date: "2026-02-18", product: "Shield Pro Pesticide", quantity: 520, requestedPrice: 1650, status: "Rejected", phase: "Waiting" },
];

export default function NegotiationRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | NegotiationRow["phase"]>("all");
  const [productFilter, setProductFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const products = Array.from(new Set(rows.map((item) => item.product)));

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const ts = new Date(row.date).getTime();
      const byStatus = statusFilter === "all" || row.phase === statusFilter;
      const byProduct = productFilter === "all" || row.product === productFilter;
      const byFrom = !fromDate || ts >= new Date(fromDate).getTime();
      const byTo = !toDate || ts <= new Date(toDate).getTime();
      return byStatus && byProduct && byFrom && byTo;
    });
  }, [fromDate, productFilter, statusFilter, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Negotiation Requests</h1>
        <p className="text-sm text-muted-foreground">Track pending and ongoing price negotiations. Edit actions are available only during active negotiation.</p>
      </div>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
        <p className="text-xs text-amber-500">Expired negotiations require fresh submission. Policy violations and status changes are logged automatically.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(v: "all" | NegotiationRow["phase"]) => setStatusFilter(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Counter">Counter</SelectItem>
                <SelectItem value="Waiting">Waiting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Negotiation Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Requested Price</TableHead>
                  <TableHead className="text-right">Counter Price</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => {
                  const allowAcceptReject = row.status === "Negotiation";
                  return (
                    <TableRow key={row.orderId}>
                      <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                      <TableCell>{row.product}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(row.requestedPrice)}</TableCell>
                      <TableCell className="text-right font-mono">{row.counterPrice ? formatCurrency(row.counterPrice) : "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BulkOrderStatusBadge status={row.status === "Negotiation" ? "Negotiation" : row.status} />
                          {row.expired ? <span className="text-[11px] text-red-500">Expired</span> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm" disabled={!allowAcceptReject}>Accept Counter</Button>
                          <Button size="sm" variant="destructive" disabled={!allowAcceptReject}>Reject</Button>
                          <Button size="sm" variant="ghost" className="gap-1.5"><MessageSquareText className="h-3.5 w-3.5" /> Add Note</Button>
                          <LoggedBadge />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No bulk orders yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

