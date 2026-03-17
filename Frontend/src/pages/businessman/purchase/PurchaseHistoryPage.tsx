import { useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  PurchaseTypeBadge,
  RequestStatusBadge,
  formatCurrency,
} from "@/components/businessman/PurchaseAdvancePrimitives";

type PurchaseType = "Direct" | "Advance";
type RowStatus = "Pending" | "Approved" | "Rejected";

type HistoryRow = {
  orderId: string;
  date: string;
  product: string;
  quantity: number;
  purchaseType: PurchaseType;
  amount: number;
  status: RowStatus;
};

const rows: HistoryRow[] = [
  { orderId: "PO-260221-001", date: "2026-02-21", product: "Premium Wheat Seed", quantity: 40, purchaseType: "Direct", amount: 56000, status: "Approved" },
  { orderId: "PO-260221-002", date: "2026-02-21", product: "Nitro Boost Fertilizer", quantity: 25, purchaseType: "Advance", amount: 24500, status: "Pending" },
  { orderId: "PO-260220-005", date: "2026-02-20", product: "Smart Drip Kit", quantity: 6, purchaseType: "Direct", amount: 37200, status: "Approved" },
  { orderId: "PO-260219-007", date: "2026-02-19", product: "Shield Pro Pesticide", quantity: 18, purchaseType: "Advance", amount: 30960, status: "Rejected" },
];

export default function PurchaseHistoryPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [product, setProduct] = useState("all");
  const [purchaseType, setPurchaseType] = useState<"all" | PurchaseType>("all");
  const [status, setStatus] = useState<"all" | RowStatus>("all");
  const [selected, setSelected] = useState<HistoryRow | null>(null);

  const products = Array.from(new Set(rows.map((row) => row.product)));

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const ts = new Date(row.date).getTime();
      const byFrom = !fromDate || ts >= new Date(fromDate).getTime();
      const byTo = !toDate || ts <= new Date(toDate).getTime();
      const byProduct = product === "all" || row.product === product;
      const byType = purchaseType === "all" || row.purchaseType === purchaseType;
      const byStatus = status === "all" || row.status === status;
      return byFrom && byTo && byProduct && byType && byStatus;
    });
  }, [fromDate, product, purchaseType, status, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Purchase History</h1>
        <p className="text-sm text-muted-foreground">Read-only purchase records for direct and advance-based transactions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
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
          <div className="space-y-2">
            <Label>Purchase Type</Label>
            <Select value={purchaseType} onValueChange={(v: "all" | PurchaseType) => setPurchaseType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="Advance">Advance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: "all" | RowStatus) => setStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">History Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Purchase Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.orderId} className="cursor-pointer" onClick={() => setSelected(row)}>
                    <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell><PurchaseTypeBadge type={row.purchaseType} /></TableCell>
                    <TableCell className="font-mono">{formatCurrency(row.amount)}</TableCell>
                    <TableCell><RequestStatusBadge status={row.status} /></TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">No records match selected filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Drawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Purchase Detail</DrawerTitle>
            <DrawerDescription>Read-only detail view for audit-safe transaction inspection.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pt-0 pb-6 space-y-3">
            {selected && (
              <>
                <div className="rounded-md border p-3 text-sm space-y-2">
                  <p><span className="text-muted-foreground">Order ID:</span> <span className="font-mono">{selected.orderId}</span></p>
                  <p><span className="text-muted-foreground">Product:</span> {selected.product}</p>
                  <p><span className="text-muted-foreground">Quantity:</span> {selected.quantity}</p>
                  <p><span className="text-muted-foreground">Amount:</span> <span className="font-mono">{formatCurrency(selected.amount)}</span></p>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Type:</span>
                    <PurchaseTypeBadge type={selected.purchaseType} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <RequestStatusBadge status={selected.status} />
                  </div>
                </div>
                <Button variant="outline" className="gap-1.5">
                  <FileText className="h-4 w-4" /> View Invoice Snapshot
                </Button>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

