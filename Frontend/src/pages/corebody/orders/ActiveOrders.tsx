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
import { OperationsMetricCard, OrderStatusBadge, SLABadge } from "@/components/corebody/orders/OrdersPrimitives";

type OrderType = "B2B" | "Internal";
type AssignedToType = "Dealer" | "Businessman" | "Stock Point";
type OrderStatus = "Awaiting Dispatch" | "In Transit" | "At Risk";

type ActiveOrder = {
  orderId: string;
  orderType: OrderType;
  assignedTo: string;
  assignedEntityType: AssignedToType;
  orderValue: number;
  currentStatus: OrderStatus;
  slaTimer: string;
  orderDate: string;
};

const ITEMS_PER_PAGE = 8;
const DISTRICT_NAME = "District North";

const rows: ActiveOrder[] = [
  { orderId: "AO-260222-001", orderType: "B2B", assignedTo: "Arjun Traders", assignedEntityType: "Dealer", orderValue: 182000, currentStatus: "Awaiting Dispatch", slaTimer: "03:42:10", orderDate: "2026-02-22" },
  { orderId: "AO-260222-002", orderType: "Internal", assignedTo: "North Stock Hub", assignedEntityType: "Stock Point", orderValue: 94500, currentStatus: "In Transit", slaTimer: "06:11:22", orderDate: "2026-02-22" },
  { orderId: "AO-260221-003", orderType: "B2B", assignedTo: "Priya Agencies", assignedEntityType: "Dealer", orderValue: 126700, currentStatus: "At Risk", slaTimer: "00:49:13", orderDate: "2026-02-21" },
  { orderId: "AO-260221-004", orderType: "Internal", assignedTo: "Block-3 Field Team", assignedEntityType: "Businessman", orderValue: 53500, currentStatus: "In Transit", slaTimer: "05:10:07", orderDate: "2026-02-21" },
  { orderId: "AO-260220-005", orderType: "B2B", assignedTo: "Mehta Supply", assignedEntityType: "Dealer", orderValue: 212000, currentStatus: "Awaiting Dispatch", slaTimer: "02:13:11", orderDate: "2026-02-20" },
  { orderId: "AO-260220-006", orderType: "B2B", assignedTo: "Green Valley Stores", assignedEntityType: "Dealer", orderValue: 84400, currentStatus: "In Transit", slaTimer: "07:54:02", orderDate: "2026-02-20" },
  { orderId: "AO-260219-007", orderType: "Internal", assignedTo: "Central Relay Point", assignedEntityType: "Stock Point", orderValue: 46800, currentStatus: "At Risk", slaTimer: "00:21:55", orderDate: "2026-02-19" },
  { orderId: "AO-260219-008", orderType: "B2B", assignedTo: "Sunrise Agro", assignedEntityType: "Dealer", orderValue: 110300, currentStatus: "Awaiting Dispatch", slaTimer: "01:58:14", orderDate: "2026-02-19" },
  { orderId: "AO-260218-009", orderType: "Internal", assignedTo: "Zone-B Dispatch Node", assignedEntityType: "Stock Point", orderValue: 68900, currentStatus: "In Transit", slaTimer: "08:34:40", orderDate: "2026-02-18" },
  { orderId: "AO-260218-010", orderType: "B2B", assignedTo: "Kumar Distribution", assignedEntityType: "Dealer", orderValue: 97400, currentStatus: "In Transit", slaTimer: "04:12:03", orderDate: "2026-02-18" },
  { orderId: "AO-260217-011", orderType: "Internal", assignedTo: "Village Cluster 12", assignedEntityType: "Businessman", orderValue: 40200, currentStatus: "Awaiting Dispatch", slaTimer: "03:09:22", orderDate: "2026-02-17" },
  { orderId: "AO-260217-012", orderType: "B2B", assignedTo: "Rural Connect", assignedEntityType: "Dealer", orderValue: 75500, currentStatus: "At Risk", slaTimer: "00:14:31", orderDate: "2026-02-17" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function ActiveOrders() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [orderType, setOrderType] = useState<"all" | OrderType>("all");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [assignedEntity, setAssignedEntity] = useState<"all" | AssignedToType>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ActiveOrder | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const orderDate = new Date(row.orderDate).getTime();
      const matchesFrom = !fromDate || orderDate >= new Date(fromDate).getTime();
      const matchesTo = !toDate || orderDate <= new Date(toDate).getTime();
      const matchesOrderType = orderType === "all" || row.orderType === orderType;
      const matchesStatus = status === "all" || row.currentStatus === status;
      const matchesAssigned = assignedEntity === "all" || row.assignedEntityType === assignedEntity;
      return matchesFrom && matchesTo && matchesOrderType && matchesStatus && matchesAssigned;
    });
  }, [fromDate, toDate, orderType, status, assignedEntity]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const totalActiveOrders = rows.length;
  const awaitingDispatch = rows.filter((r) => r.currentStatus === "Awaiting Dispatch").length;
  const inTransit = rows.filter((r) => r.currentStatus === "In Transit").length;
  const atRisk = rows.filter((r) => r.currentStatus === "At Risk").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Active Orders</h1>
        <p className="text-sm text-muted-foreground">District-scoped operational visibility for running B2B and internal orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <OperationsMetricCard title="Total Active Orders" value={totalActiveOrders} tone="neutral" />
        <OperationsMetricCard title="Orders Awaiting Dispatch" value={awaitingDispatch} tone="warning" />
        <OperationsMetricCard title="Orders In Transit" value={inTransit} tone="success" />
        <OperationsMetricCard title="Orders at Risk (SLA)" value={atRisk} tone="danger" />
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
            <Label>Order Type</Label>
            <Select value={orderType} onValueChange={(v: "all" | OrderType) => { setPage(1); setOrderType(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="B2B">B2B</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: "all" | OrderStatus) => { setPage(1); setStatus(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Awaiting Dispatch">Awaiting Dispatch</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assigned Entity</Label>
            <Select value={assignedEntity} onValueChange={(v: "all" | AssignedToType) => { setPage(1); setAssignedEntity(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Dealer">Dealer</SelectItem>
                <SelectItem value="Businessman">Businessman</SelectItem>
                <SelectItem value="Stock Point">Stock Point</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Order Value</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>SLA Timer</TableHead>
                  <TableHead>Order Date</TableHead>
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
                        <span>{row.assignedTo}</span>
                        <span className="text-xs text-muted-foreground">{row.assignedEntityType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{formatCurrency(row.orderValue)}</TableCell>
                    <TableCell><OrderStatusBadge status={row.currentStatus} /></TableCell>
                    <TableCell>
                      <SLABadge status={row.currentStatus === "At Risk" ? "At Risk" : "Normal"} />
                      <p className="font-mono text-xs mt-1 text-muted-foreground">{row.slaTimer}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.orderDate}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View Details</Button>
                      <Button size="sm" variant="secondary">Raise Issue</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                      No active orders match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length} records • API-ready pagination</p>
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
            <DialogTitle>Active Order Details (Read-only)</DialogTitle>
            <DialogDescription>System-calculated values and status timeline for district monitoring.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono">{selected.orderId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{selected.orderType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Assigned</span><span>{selected.assignedTo}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Order Value</span><span className="font-mono">{formatCurrency(selected.orderValue)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Current Status</span><span>{selected.currentStatus}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SLA Timer</span><span className="font-mono">{selected.slaTimer}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Order Date</span><span className="font-mono">{selected.orderDate}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

