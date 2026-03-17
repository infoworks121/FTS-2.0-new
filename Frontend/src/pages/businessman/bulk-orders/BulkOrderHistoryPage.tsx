import { useMemo, useState } from "react";
import { Download } from "lucide-react";
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

type HistoryStatus = "Approved" | "Rejected";

type HistoryRow = {
  orderId: string;
  date: string;
  product: string;
  quantity: number;
  finalPrice: number;
  status: HistoryStatus;
  completionDate: string;
};

const rows: HistoryRow[] = [
  { orderId: "BO-260210-004", date: "2026-02-10", product: "Premium Wheat Seed", quantity: 400, finalPrice: 1330, status: "Approved", completionDate: "2026-02-14" },
  { orderId: "BO-260208-011", date: "2026-02-08", product: "Nitro Boost Fertilizer", quantity: 290, finalPrice: 945, status: "Approved", completionDate: "2026-02-12" },
  { orderId: "BO-260205-019", date: "2026-02-05", product: "Shield Pro Pesticide", quantity: 500, finalPrice: 0, status: "Rejected", completionDate: "2026-02-07" },
];

export default function BulkOrderHistoryPage() {
  const [status, setStatus] = useState<"all" | "Completed" | "Cancelled">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [product, setProduct] = useState("all");

  const products = Array.from(new Set(rows.map((item) => item.product)));

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const ts = new Date(row.date).getTime();
      const mappedStatus = row.status === "Approved" ? "Completed" : "Cancelled";
      const byStatus = status === "all" || mappedStatus === status;
      const byFrom = !fromDate || ts >= new Date(fromDate).getTime();
      const byTo = !toDate || ts <= new Date(toDate).getTime();
      const byProduct = product === "all" || row.product === product;
      return byStatus && byFrom && byTo && byProduct;
    });
  }, [fromDate, product, status, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Bulk Order History</h1>
        <p className="text-sm text-muted-foreground">Read-only archive of completed and cancelled bulk orders.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Advanced Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: "all" | "Completed" | "Cancelled") => setStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
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
            <Select value={product} onValueChange={setProduct}>
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
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">Archive Table</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Export CSV</Button>
            <Button size="sm" variant="outline">Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Final Price</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.orderId}>
                    <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell className="text-right font-mono">{row.quantity}</TableCell>
                    <TableCell className="text-right font-mono">{row.finalPrice ? formatCurrency(row.finalPrice) : "—"}</TableCell>
                    <TableCell>
                      <BulkOrderStatusBadge status={row.status === "Approved" ? "Approved" : "Rejected"} />
                    </TableCell>
                    <TableCell>{row.completionDate}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline">View Order Details</Button>
                        <Button size="sm" variant="ghost" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Download Invoice</Button>
                        <LoggedBadge />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No bulk orders yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">This archive is immutable. No actions here can affect order lifecycle state.</p>
        </CardContent>
      </Card>
    </div>
  );
}

