import { useEffect, useState } from "react";
import { stockApi } from "@/lib/stockApi";
import { DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, AlertTriangle, TrendingUp, Info, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category_name: string;
  base_price: string;
  my_stock: string | number;
  district_stock: string | number;
  last_updated_at: string | null;
}

export default function CurrentInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtId, setDistrictId] = useState<number | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await stockApi.getCurrentInventory();
        setInventory(data.inventory);
        setDistrictId(data.district_id);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast.error("Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalSkus: inventory.length,
    lowStock: inventory.filter((item) => Number(item.my_stock) < 10 && Number(item.my_stock) > 0).length,
    outOfStock: inventory.filter((item) => Number(item.my_stock) <= 0).length,
    totalPhysicalUnits: inventory.reduce((acc, item) => acc + Number(item.my_stock), 0),
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Out of Stock", color: "bg-red-500/10 text-red-500 border-red-500/20" };
    if (stock < 10) return { label: "Low Stock", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    return { label: "In Stock", color: "bg-green-500/10 text-green-500 border-green-500/20" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Stock Inventory</h1>
        <p className="text-muted-foreground">
          Manage and monitor your physical on-hand stock and district distribution.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total SKUs"
          value={String(stats.totalSkus)}
          icon={Package}
          variant="default"
        />
        <KPICard
          title="Total Physical Units"
          value={stats.totalPhysicalUnits.toLocaleString()}
          icon={Box}
          variant="profit"
        />
        <KPICard
          title="Low Stock Warning"
          value={String(stats.lowStock)}
          icon={AlertTriangle}
          variant="warning"
          subtitle="Items below 10 units"
        />
        <KPICard
          title="Out of Stock"
          value={String(stats.outOfStock)}
          icon={TrendingUp}
          variant="risk"
          subtitle="Immediate restock needed"
        />
      </div>

      {/* Filters and Search */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                className="pl-9 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/50 text-xs font-medium">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span>District ID: <span className="text-blue-500 font-bold">{districtId || 'N/A'}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <div className="rounded-lg border border-border bg-card">
        <DataTable
          loading={loading}
          columns={[
            {
              header: "Product Detail",
              accessor: (row: InventoryItem) => (
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground">{row.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{row.sku}</span>
                  <Badge variant="outline" className="w-fit text-[9px] py-0 h-4 border-muted-foreground/20 text-muted-foreground h-auto">
                    {row.category_name}
                  </Badge>
                </div>
              ),
            },
            {
              header: "Base Price",
              accessor: (row: InventoryItem) => (
                <span className="font-mono text-xs">₹{Number(row.base_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              ),
            },
            {
              header: "My Physical Stock",
              accessor: (row: InventoryItem) => {
                const status = getStockStatus(Number(row.my_stock));
                return (
                  <div className="flex flex-col gap-2">
                     <span className="text-xl font-black font-mono tracking-tighter">
                      {Number(row.my_stock).toLocaleString()}
                    </span>
                    <Badge className={`w-fit py-0 text-[10px] uppercase font-bold border ${status.color}`}>
                      {status.label}
                    </Badge>
                  </div>
                );
              },
            },
            {
              header: "District Aggregated",
              accessor: (row: InventoryItem) => (
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold font-mono text-blue-500">
                    {Number(row.district_stock).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">Virtual Total</span>
                </div>
              ),
            },
            {
              header: "Last Update",
              accessor: (row: InventoryItem) => (
                <span className="text-xs text-muted-foreground">
                  {row.last_updated_at ? new Date(row.last_updated_at).toLocaleString() : "Never"}
                </span>
              ),
            },
          ]}
          data={filteredInventory}
        />
      </div>
    </div>
  );
}
