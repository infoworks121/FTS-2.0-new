import { useMemo, useState } from "react";
import { Download } from "lucide-react";
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
  InventoryProductCombobox,
  InventorySlaBanner,
  InventoryTableCard,
  MovementTypeBadge,
  formatInventoryNumber,
  inventoryLedger,
} from "@/components/businessman/StockInventoryPrimitives";

const ITEMS_PER_PAGE = 8;

export default function InventoryHistoryPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [product, setProduct] = useState("");
  const [movementType, setMovementType] = useState<"all" | "In" | "Out">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return inventoryLedger.filter((entry) => {
      const ts = new Date(entry.dateTime.replace(" ", "T")).getTime();
      const byFrom = !fromDate || ts >= new Date(fromDate).getTime();
      const byTo = !toDate || ts <= new Date(toDate).getTime() + 86400000 - 1;
      const byProduct = !product || entry.product === product;
      const byType = movementType === "all" || entry.type === movementType;
      return byFrom && byTo && byProduct && byType;
    });
  }, [fromDate, toDate, product, movementType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const exportCsv = () => {
    const header = ["Date & Time", "Product", "Type", "Quantity", "Reference", "Performed By", "Balance After"];
    const rows = filtered.map((item) => [
      item.dateTime,
      item.product,
      item.type,
      String(item.quantity),
      item.reference,
      item.performedBy,
      String(item.balanceAfter),
    ]);

    const csv = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-history.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Inventory History</h1>
        <p className="text-sm text-muted-foreground">Immutable stock movement ledger with wallet-style filtering and export support.</p>
      </div>

      <InventorySlaBanner />

      <InventoryTableCard
        title="Filter Bar"
        actions={
          <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Date Range From</Label>
            <Input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} />
          </div>
          <div className="space-y-2">
            <Label>Date Range To</Label>
            <Input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} />
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <InventoryProductCombobox value={product} onValueChange={(v) => { setPage(1); setProduct(v); }} />
          </div>
          <div className="space-y-2">
            <Label>Movement Type</Label>
            <Select value={movementType} onValueChange={(v: "all" | "In" | "Out") => { setPage(1); setMovementType(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="In">In</SelectItem>
                <SelectItem value="Out">Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </InventoryTableCard>

      <InventoryTableCard title="Inventory Ledger">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Balance After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((entry) => (
                <TableRow key={`${entry.dateTime}-${entry.reference}`}>
                  <TableCell className="font-mono text-xs">{entry.dateTime}</TableCell>
                  <TableCell>{entry.product}</TableCell>
                  <TableCell><MovementTypeBadge type={entry.type} /></TableCell>
                  <TableCell className="font-mono">{formatInventoryNumber(entry.quantity)}</TableCell>
                  <TableCell className="font-mono text-xs">{entry.reference}</TableCell>
                  <TableCell>{entry.performedBy}</TableCell>
                  <TableCell className="font-mono">{formatInventoryNumber(entry.balanceAfter)}</TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">No ledger records match selected filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length} immutable records</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <span className="text-xs text-muted-foreground">Page {safePage} of {totalPages}</span>
            <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      </InventoryTableCard>
    </div>
  );
}

