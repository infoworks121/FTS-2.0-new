import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
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
  DisabledReason,
  FinanceConfirmDialog,
  RequestStatusBadge,
  formatCurrency,
} from "@/components/businessman/PurchaseAdvancePrimitives";

type RequestStatus = "Pending" | "Approved" | "Rejected";

type RequestRow = {
  requestId: string;
  product: string;
  quantity: number;
  advanceAmount: number;
  status: RequestStatus;
  remarks: string;
};

const rows: RequestRow[] = [
  { requestId: "AR-260221-001", product: "Premium Wheat Seed", quantity: 40, advanceAmount: 22400, status: "Pending", remarks: "Awaiting finance review" },
  { requestId: "AR-260220-002", product: "Nitro Boost Fertilizer", quantity: 25, advanceAmount: 9800, status: "Approved", remarks: "Approved under seasonal quota" },
  { requestId: "AR-260219-003", product: "Shield Pro Pesticide", quantity: 18, advanceAmount: 12384, status: "Rejected", remarks: "Advance cap exceeded for this product" },
];

const priceMap: Record<string, number> = {
  "Premium Wheat Seed": 1400,
  "Nitro Boost Fertilizer": 980,
  "Smart Drip Kit": 6200,
  "Shield Pro Pesticide": 1720,
};

const marginMap: Record<string, number> = {
  "Premium Wheat Seed": 12,
  "Nitro Boost Fertilizer": 15,
  "Smart Drip Kit": 10,
  "Shield Pro Pesticide": 13,
};

const ADVANCE_LIMIT = 30000;
const PENDING_ADVANCE = 22400;

export default function AdvanceRequestsPage() {
  const [product, setProduct] = useState("Premium Wheat Seed");
  const [quantity, setQuantity] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const advanceAmount = Math.round((priceMap[product] || 0) * quantity * 0.4);
  const expectedMargin = marginMap[product] || 0;
  const projectedUsage = PENDING_ADVANCE + advanceAmount;

  const activeByProduct = useMemo(
    () => rows.find((item) => item.product === product && item.status === "Pending"),
    [product]
  );

  const disabledReason = useMemo(() => {
    if (quantity <= 0) return "Quantity must be at least 1.";
    if (activeByProduct) return `Only one active advance request is allowed per product. Active ID: ${activeByProduct.requestId}.`;
    if (projectedUsage > ADVANCE_LIMIT) {
      return `Advance limit crossed. Current pending ${formatCurrency(PENDING_ADVANCE)} + request ${formatCurrency(advanceAmount)} > ${formatCurrency(ADVANCE_LIMIT)}.`;
    }
    return "";
  }, [activeByProduct, advanceAmount, projectedUsage, quantity]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Advance Requests</h1>
        <p className="text-sm text-muted-foreground">Request product advances with rule-aware validation and status-based tracking.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Advance Request Form</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(priceMap).map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Requested Quantity</Label>
              <Input type="number" value={quantity} min={1} onChange={(e) => setQuantity(Number(e.target.value || 0))} />
            </div>

            <div className="space-y-2">
              <Label>Advance Amount (Auto)</Label>
              <Input value={formatCurrency(advanceAmount)} disabled />
            </div>

            <div className="space-y-2">
              <Label>Expected Margin (Read-only)</Label>
              <Input value={`${expectedMargin}%`} disabled />
            </div>

            <div className="md:col-span-2 space-y-3">
              {!!disabledReason && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-500">Submission blocked</p>
                    <DisabledReason reason={disabledReason} />
                  </div>
                </div>
              )}
              <Button className="w-full md:w-auto" disabled={!!disabledReason} onClick={() => setConfirmOpen(true)}>
                Submit Advance Request
              </Button>
              <DisabledReason reason={disabledReason} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rule Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Current Advance Limit</p>
              <p className="font-mono font-semibold mt-1">{formatCurrency(ADVANCE_LIMIT)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Pending Advances</p>
              <p className="font-mono font-semibold mt-1 text-amber-500">{formatCurrency(PENDING_ADVANCE)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Projected Usage</p>
              <p className={`font-mono font-semibold mt-1 ${projectedUsage > ADVANCE_LIMIT ? "text-red-500" : "text-emerald-500"}`}>
                {formatCurrency(projectedUsage)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Advance Requests Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Advance Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.requestId}>
                    <TableCell className="font-mono text-xs">{row.requestId}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(row.advanceAmount)}</TableCell>
                    <TableCell><RequestStatusBadge status={row.status} /></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{row.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FinanceConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm advance request"
        description={`Submit advance request for ${product} (Qty ${quantity}) with calculated advance ${formatCurrency(advanceAmount)}.`}
        confirmLabel="Confirm Request"
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}

