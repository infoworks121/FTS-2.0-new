import { useMemo, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { OperationsMetricCard, OrderStatusBadge, SLABadge } from "@/components/corebody/orders/OrdersPrimitives";

type OrderType = "B2B" | "Internal";
type FulfilledByType = "Dealer" | "Businessman";

type CompletedOrder = {
  orderId: string;
  orderType: OrderType;
  fulfilledBy: string;
  fulfilledByType: FulfilledByType;
  orderValue: number;
  completionDate: string;
  slaStatus: "Met" | "Breached";
  fulfilmentHours: number;
};

const ITEMS_PER_PAGE = 8;

const rows: CompletedOrder[] = [
  { orderId: "CO-260222-001", orderType: "B2B", fulfilledBy: "Arjun Traders", fulfilledByType: "Dealer", orderValue: 142300, completionDate: "2026-02-22", slaStatus: "Met", fulfilmentHours: 14 },
  { orderId: "CO-260222-002", orderType: "Internal", fulfilledBy: "Block-3 Field Team", fulfilledByType: "Businessman", orderValue: 48600, completionDate: "2026-02-22", slaStatus: "Met", fulfilmentHours: 10 },
  { orderId: "CO-260221-003", orderType: "B2B", fulfilledBy: "Priya Agencies", fulfilledByType: "Dealer", orderValue: 120500, completionDate: "2026-02-21", slaStatus: "Breached", fulfilmentHours: 29 },
  { orderId: "CO-260221-004", orderType: "B2B", fulfilledBy: "Mehta Supply", fulfilledByType: "Dealer", orderValue: 198000, completionDate: "2026-02-21", slaStatus: "Met", fulfilmentHours: 13 },
  { orderId: "CO-260220-005", orderType: "Internal", fulfilledBy: "Village Cluster 12", fulfilledByType: "Businessman", orderValue: 35700, completionDate: "2026-02-20", slaStatus: "Met", fulfilmentHours: 11 },
  { orderId: "CO-260220-006", orderType: "B2B", fulfilledBy: "Sunrise Agro", fulfilledByType: "Dealer", orderValue: 88600, completionDate: "2026-02-20", slaStatus: "Met", fulfilmentHours: 15 },
  { orderId: "CO-260219-007", orderType: "B2B", fulfilledBy: "Green Valley Stores", fulfilledByType: "Dealer", orderValue: 96200, completionDate: "2026-02-19", slaStatus: "Breached", fulfilmentHours: 31 },
  { orderId: "CO-260219-008", orderType: "Internal", fulfilledBy: "North Ops Team", fulfilledByType: "Businessman", orderValue: 41200, completionDate: "2026-02-19", slaStatus: "Met", fulfilmentHours: 9 },
  { orderId: "CO-260218-009", orderType: "B2B", fulfilledBy: "Kumar Distribution", fulfilledByType: "Dealer", orderValue: 78200, completionDate: "2026-02-18", slaStatus: "Met", fulfilmentHours: 16 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function CompletedOrders() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fulfilledByType, setFulfilledByType] = useState<"all" | FulfilledByType>("all");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CompletedOrder | null>(null);

  const filtered = useMemo(() => {
    const min = minValue ? Number(minValue) : 0;
    const max = maxValue ? Number(maxValue) : Number.MAX_SAFE_INTEGER;
    return rows.filter((row) => {
      const completionDate = new Date(row.completionDate).getTime();
      const matchesFrom = !fromDate || completionDate >= new Date(fromDate).getTime();
      const matchesTo = !toDate || completionDate <= new Date(toDate).getTime();
      const matchesFulfilledBy = fulfilledByType === "all" || row.fulfilledByType === fulfilledByType;
      const matchesValue = row.orderValue >= min && row.orderValue <= max;
      return matchesFrom && matchesTo && matchesFulfilledBy && matchesValue;
    });
  }, [fromDate, toDate, fulfilledByType, minValue, maxValue]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const totalCompleted = rows.length;
  const totalValue = rows.reduce((sum, item) => sum + item.orderValue, 0);
  const avgFulfilmentTime = (rows.reduce((sum, item) => sum + item.fulfilmentHours, 0) / rows.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Completed Orders</h1>
        <p className="text-sm text-muted-foreground">Immutable district-level record of successfully fulfilled orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <OperationsMetricCard title="Total Completed Orders" value={totalCompleted} tone="success" />
        <OperationsMetricCard title="Total Order Value" value={formatCurrency(totalValue)} tone="neutral" />
        <OperationsMetricCard title="Average Fulfilment Time" value={`${avgFulfilmentTime} hrs`} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Date From</Label>
            <Input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} />
          </div>
          <div className="space-y-2">
            <Label>Date To</Label>
            <Input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} />
          </div>
          <div className="space-y-2">
            <Label>Dealer / Businessman</Label>
            <Select value={fulfilledByType} onValueChange={(v: "all" | FulfilledByType) => { setPage(1); setFulfilledByType(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Dealer">Dealer</SelectItem>
                <SelectItem value="Businessman">Businessman</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Min Order Value</Label>
            <Input type="number" placeholder="0" value={minValue} onChange={(e) => { setPage(1); setMinValue(e.target.value); }} />
          </div>
          <div className="space-y-2">
            <Label>Max Order Value</Label>
            <Input type="number" placeholder="500000" value={maxValue} onChange={(e) => { setPage(1); setMaxValue(e.target.value); }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">Completed Orders Table</CardTitle>
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export Snapshot
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Fulfilled By</TableHead>
                  <TableHead>Order Value</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>SLA Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((row) => (
                  <TableRow key={row.orderId}>
                    <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                    <TableCell>{row.orderType}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{row.fulfilledBy}</span>
                        <span className="text-xs text-muted-foreground">{row.fulfilledByType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{formatCurrency(row.orderValue)}</TableCell>
                    <TableCell className="font-mono text-xs">{row.completionDate}</TableCell>
                    <TableCell>
                      {row.slaStatus === "Met" ? <SLABadge status="Met" /> : <SLABadge status="Breached" />}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View Details</Button>
                      <Button size="sm" variant="secondary">Download Invoice</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                      No completed orders found for the selected filter values.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length} records • Read-only historical data</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {safePage} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completed Order Details</DialogTitle>
            <DialogDescription>Immutable system record with district-level visibility only.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono">{selected.orderId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{selected.orderType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fulfilled By</span><span>{selected.fulfilledBy}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Order Value</span><span className="font-mono">{formatCurrency(selected.orderValue)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Completion Date</span><span className="font-mono">{selected.completionDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SLA</span><OrderStatusBadge status={selected.slaStatus === "Met" ? "Completed" : "At Risk"} /></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

