import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import { KPICard } from "@/components/KPICard";
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
  InventoryHealthBadge,
  InventorySlaBanner,
  InventoryTableCard,
  formatInventoryNumber,
  getInventoryHealth,
  inventoryProducts,
  MinimumStockBadge,
} from "@/components/businessman/StockInventoryPrimitives";

type ProductDetail = (typeof inventoryProducts)[number];

export default function InventoryOverviewPage() {
  const [selected, setSelected] = useState<ProductDetail | null>(null);

  const kpis = useMemo(() => {
    const totalSkus = inventoryProducts.length;
    const totalStock = inventoryProducts.reduce((acc, item) => acc + item.currentStock, 0);
    const lowStockItems = inventoryProducts.filter((item) => getInventoryHealth(item.currentStock, item.minimumRequired) === "Low").length;
    const outOfStock = inventoryProducts.filter((item) => item.currentStock <= 0).length;

    return { totalSkus, totalStock, lowStockItems, outOfStock };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Inventory Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time inventory health snapshot with read-only stock compliance visibility.</p>
      </div>

      <InventorySlaBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total SKUs" value={formatInventoryNumber(kpis.totalSkus)} icon={PackageSearch} variant="trust" />
        <KPICard title="Total Stock Quantity" value={formatInventoryNumber(kpis.totalStock)} icon={PackageSearch} variant="profit" />
        <KPICard title="Low Stock Items" value={formatInventoryNumber(kpis.lowStockItems)} icon={PackageSearch} variant="cap" />
        <KPICard title="Out of Stock Items" value={formatInventoryNumber(kpis.outOfStock)} icon={PackageSearch} variant="reserve" />
      </div>

      <InventoryTableCard title="Inventory Summary">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryProducts.map((row) => {
                const status = getInventoryHealth(row.currentStock, row.minimumRequired);

                return (
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => setSelected(row)}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell className="font-mono">{formatInventoryNumber(row.currentStock)}</TableCell>
                    <TableCell className="font-mono">{formatInventoryNumber(row.minimumRequired)}</TableCell>
                    <TableCell>
                      <InventoryHealthBadge status={status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{row.lastUpdated}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </InventoryTableCard>

      <Drawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Product Inventory Detail</DrawerTitle>
            <DrawerDescription>Read-only inventory detail drawer. Stock mutations are only allowed in Stock In / Stock Out.</DrawerDescription>
          </DrawerHeader>
          {selected && (
            <div className="p-4 pt-0 pb-6">
              <div className="rounded-md border p-3 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Product:</span> {selected.name}</p>
                <p><span className="text-muted-foreground">Category:</span> {selected.category}</p>
                <p><span className="text-muted-foreground">Current Stock:</span> <span className="font-mono">{formatInventoryNumber(selected.currentStock)}</span></p>
                <p><span className="text-muted-foreground">Minimum Required:</span> <span className="font-mono">{formatInventoryNumber(selected.minimumRequired)}</span></p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Health Status:</span>
                  <InventoryHealthBadge status={getInventoryHealth(selected.currentStock, selected.minimumRequired)} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Compliance:</span>
                  <MinimumStockBadge
                    status={
                      selected.currentStock >= selected.minimumRequired
                        ? "OK"
                        : selected.currentStock <= Math.floor(selected.minimumRequired * 0.4)
                          ? "Breach (SLA risk)"
                          : "Below Minimum"
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">Last Updated: {selected.lastUpdated}</p>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

