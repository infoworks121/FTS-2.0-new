import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  InventorySlaBanner,
  InventoryTableCard,
  MinimumStockBadge,
  SlaWarningBadge,
  formatInventoryNumber,
  getMinimumComplianceStatus,
  inventoryProducts,
} from "@/components/businessman/StockInventoryPrimitives";

export default function MinimumStockStatusPage() {
  const navigate = useNavigate();

  const rows = useMemo(() => {
    return inventoryProducts.map((item) => {
      const status = getMinimumComplianceStatus(item.currentStock, item.minimumRequired);
      const shortfall = Math.max(0, item.minimumRequired - item.currentStock);
      return { ...item, status, shortfall };
    });
  }, []);

  const hasViolation = rows.some((row) => row.status !== "OK");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Minimum Stock Status</h1>
        <p className="text-sm text-muted-foreground">Admin-defined minimum inventory compliance monitor with SLA-aware escalation visibility.</p>
      </div>

      <InventorySlaBanner />

      {hasViolation && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm font-medium text-red-500">Minimum stock violation found</p>
          <p className="text-xs text-muted-foreground">Minimum value is admin-controlled and read-only in this panel. Immediate restock is recommended for breached SKUs.</p>
        </div>
      )}

      <InventoryTableCard title="Minimum Compliance Table">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Required</TableHead>
                <TableHead>Shortfall Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action Required</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="font-mono">{formatInventoryNumber(row.currentStock)}</TableCell>
                  <TableCell className="font-mono">{formatInventoryNumber(row.minimumRequired)}</TableCell>
                  <TableCell className="font-mono">{formatInventoryNumber(row.shortfall)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MinimumStockBadge status={row.status} />
                      {row.status === "Breach (SLA risk)" && <SlaWarningBadge />}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.status === "OK" ? (
                      <span className="text-xs text-muted-foreground">No action needed</span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => navigate("/businessman/stock/in-out")}>
                        Restock Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </InventoryTableCard>
    </div>
  );
}

