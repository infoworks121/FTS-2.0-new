import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
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
import { OrderStatusBadge } from "@/components/corebody/orders/OrdersPrimitives";

type DistributionStatus = "In Transit" | "Delivered" | "At Risk";

type DistributionRow = {
  distributionId: string;
  productService: string;
  quantity: string;
  source: string;
  destination: string;
  movementDate: string;
  status: DistributionStatus;
  issuedFrom: string;
  passedThrough: string;
  deliveredTo: string;
  completionTime: string;
};

const ITEMS_PER_PAGE = 8;

const rows: DistributionRow[] = [
  { distributionId: "DST-260222-001", productService: "Hybrid Rice Seed", quantity: "120 Bag", source: "District Warehouse", destination: "Arjun Traders", movementDate: "2026-02-22", status: "In Transit", issuedFrom: "District Warehouse", passedThrough: "North Transit Node", deliveredTo: "Arjun Traders", completionTime: "ETA 5h 20m" },
  { distributionId: "DST-260222-002", productService: "NPK 20:20:20", quantity: "80 Sack", source: "District Warehouse", destination: "Priya Agencies", movementDate: "2026-02-22", status: "Delivered", issuedFrom: "District Warehouse", passedThrough: "Zone-B Dock", deliveredTo: "Priya Agencies", completionTime: "12h 15m" },
  { distributionId: "DST-260221-003", productService: "Bio Shield", quantity: "65 Bottle", source: "Central Stock Point", destination: "Mehta Supply", movementDate: "2026-02-21", status: "At Risk", issuedFrom: "Central Stock Point", passedThrough: "Rural Transfer Bay", deliveredTo: "Mehta Supply", completionTime: "Delayed" },
  { distributionId: "DST-260221-004", productService: "Sprayer Pump", quantity: "20 Piece", source: "District Warehouse", destination: "Village Cluster 12", movementDate: "2026-02-21", status: "In Transit", issuedFrom: "District Warehouse", passedThrough: "Field Ops Relay", deliveredTo: "Village Cluster 12", completionTime: "ETA 8h" },
  { distributionId: "DST-260220-005", productService: "Drip Kit Service", quantity: "14 Unit", source: "Service Hub North", destination: "Sunrise Agro", movementDate: "2026-02-20", status: "Delivered", issuedFrom: "Service Hub North", passedThrough: "Installation Team", deliveredTo: "Sunrise Agro", completionTime: "9h 40m" },
  { distributionId: "DST-260219-006", productService: "Micronutrient Mix", quantity: "52 Box", source: "District Warehouse", destination: "Green Valley Stores", movementDate: "2026-02-19", status: "In Transit", issuedFrom: "District Warehouse", passedThrough: "Cold Bay 2", deliveredTo: "Green Valley Stores", completionTime: "ETA 6h" },
];

export default function DistributionHistory() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<DistributionRow | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const movementDate = new Date(row.movementDate).getTime();
      const matchesFrom = !fromDate || movementDate >= new Date(fromDate).getTime();
      const matchesTo = !toDate || movementDate <= new Date(toDate).getTime();
      const matchesSource = sourceFilter === "all" || row.source === sourceFilter;
      const matchesDestination = destinationFilter === "all" || row.destination === destinationFilter;
      const matchesProduct = productFilter === "all" || row.productService === productFilter;
      return matchesFrom && matchesTo && matchesSource && matchesDestination && matchesProduct;
    });
  }, [fromDate, toDate, sourceFilter, destinationFilter, productFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — District North">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Distribution History</h1>
          <p className="text-sm text-muted-foreground">Track stock and order movement trails across the district network.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribution Flow View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {rows.slice(0, 3).map((item) => (
                <div key={item.distributionId} className="rounded-md border p-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-mono">{item.distributionId}</p>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Issued from:</span> {item.issuedFrom}</p>
                    <p><span className="text-muted-foreground">Passed through:</span> {item.passedThrough}</p>
                    <p><span className="text-muted-foreground">Delivered to:</span> {item.deliveredTo}</p>
                    <p><span className="text-muted-foreground">Completion time:</span> {item.completionTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Product / Category</Label>
              <Select value={productFilter} onValueChange={(v) => { setPage(1); setProductFilter(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {[...new Set(rows.map((r) => r.productService))].map((product) => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={sourceFilter} onValueChange={(v) => { setPage(1); setSourceFilter(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {[...new Set(rows.map((r) => r.source))].map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Select value={destinationFilter} onValueChange={(v) => { setPage(1); setDestinationFilter(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {[...new Set(rows.map((r) => r.destination))].map((destination) => (
                    <SelectItem key={destination} value={destination}>{destination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribution History Table</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Distribution ID</TableHead>
                    <TableHead>Product / Service</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Movement Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((row) => (
                    <TableRow key={row.distributionId}>
                      <TableCell className="font-mono text-xs">{row.distributionId}</TableCell>
                      <TableCell>{row.productService}</TableCell>
                      <TableCell className="font-mono text-xs">{row.quantity}</TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell>{row.destination}</TableCell>
                      <TableCell className="font-mono text-xs">{row.movementDate}</TableCell>
                      <TableCell><OrderStatusBadge status={row.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View Movement Trail</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                        No distribution records available for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length} records • Read-only movement tracking</p>
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
              <DialogTitle>Movement Trail</DialogTitle>
              <DialogDescription>System-generated trail for audit and district monitoring only.</DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Distribution ID</span><span className="font-mono">{selected.distributionId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Product / Service</span><span>{selected.productService}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Issued from</span><span>{selected.issuedFrom}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Passed through</span><span>{selected.passedThrough}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivered to</span><span>{selected.deliveredTo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Completion time</span><span>{selected.completionTime}</span></div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

