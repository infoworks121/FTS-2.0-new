import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "../../CoreBodyDashboard";
import { useEffect, useState } from "react";
import { coreBodyApi, CoreBodyInventoryItem } from "@/lib/coreBodyApi";
import { DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Ban, Unlock, Info, Package, AlertCircle, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function StockBlockRelease() {
  const [inventory, setInventory] = useState<CoreBodyInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CoreBodyInventoryItem | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    quantity: 0,
    note: ""
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await coreBodyApi.getCoreBodyInventory();
      setInventory(data.inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalBlockedItems: inventory.filter(item => Number(item.reserved) > 0).length,
    totalBlockedUnits: inventory.reduce((acc, item) => acc + Number(item.reserved), 0),
    totalAvailableUnits: inventory.reduce((acc, item) => acc + (Number(item.quantity) - Number(item.reserved)), 0),
  };

  const handleAction = async (type: 'block' | 'release') => {
    if (!selectedProduct) return;
    if (formData.quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        product_id: selectedProduct.product_id,
        quantity: formData.quantity,
        note: formData.note
      };

      if (type === 'block') {
        await coreBodyApi.blockStock(payload);
        toast.success(`Successfully blocked ${formData.quantity} units of ${selectedProduct.product_name}`);
      } else {
        await coreBodyApi.releaseStock(payload);
        toast.success(`Successfully released ${formData.quantity} units of ${selectedProduct.product_name}`);
      }

      setShowManageModal(false);
      setFormData({ quantity: 0, note: "" });
      fetchInventory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${type} stock`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout role="corebody" navItems={navItems as any} roleLabel="Stock Block & Release">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Block / Release Stock</h1>
          <p className="text-muted-foreground">
            Manage stock availability by manually blocking units from order fulfillment or releasing them.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KPICard
            title="Total Blocked Units"
            value={stats.totalBlockedUnits.toLocaleString()}
            icon={Ban}
            variant="risk"
          />
          <KPICard
            title="Available to Sell"
            value={stats.totalAvailableUnits.toLocaleString()}
            icon={Package}
            variant="profit"
          />
          <KPICard
            title="Blocked SKU Count"
            value={String(stats.totalBlockedItems)}
            icon={AlertCircle}
            variant="warning"
            subtitle="Products with active holds"
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
              <Button 
                variant="outline" 
                className="gap-2 shrink-0 h-10"
                onClick={() => window.location.href = '/corebody/stock/ledger'}
              >
                <History className="h-4 w-4" />
                View Block History
              </Button>
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
                accessor: (row: CoreBodyInventoryItem) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-foreground">{row.product_name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{row.sku}</span>
                  </div>
                ),
              },
              {
                header: "Available to Sell",
                accessor: (row: CoreBodyInventoryItem) => {
                  const available = Number(row.quantity) - Number(row.reserved);
                  return (
                    <div className="flex flex-col">
                      <span className={`text-lg font-black font-mono tracking-tighter ${available > 0 ? 'text-profit' : 'text-risk'}`}>
                        {available.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-muted-foreground uppercase font-bold">Unreserved Units</span>
                    </div>
                  );
                },
              },
              {
                header: "Currently Blocked",
                accessor: (row: CoreBodyInventoryItem) => (
                  <div className="flex flex-col">
                    <span className={`text-lg font-black font-mono tracking-tighter ${Number(row.reserved) > 0 ? 'text-amber-500' : 'text-muted-foreground/30'}`}>
                      {Number(row.reserved).toLocaleString()}
                    </span>
                    <Badge variant="outline" className={`w-fit py-0 text-[9px] uppercase h-4 ${Number(row.reserved) > 0 ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' : 'text-muted-foreground border-muted-foreground/20'}`}>
                      {Number(row.reserved) > 0 ? "Active Hold" : "No Block"}
                    </Badge>
                  </div>
                ),
              },
              {
                header: "Total on Hand",
                accessor: (row: CoreBodyInventoryItem) => (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold font-mono text-muted-foreground">
                      {Number(row.quantity).toLocaleString()}
                    </span>
                  </div>
                ),
              },
              {
                header: "Actions",
                accessor: (row: CoreBodyInventoryItem) => (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="h-8 gap-2 bg-muted/50 hover:bg-muted"
                    onClick={() => {
                      setSelectedProduct(row);
                      setShowManageModal(true);
                    }}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Manage
                  </Button>
                ),
              },
            ]}
            data={filteredInventory}
          />
        </div>

        {/* Manage Modal */}
        <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adjust Stock Hold</DialogTitle>
              <DialogDescription>
                {selectedProduct?.product_name} ({selectedProduct?.sku})
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="block" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="block" className="gap-2">
                  <Ban className="h-4 w-4" /> Block
                </TabsTrigger>
                <TabsTrigger value="release" className="gap-2">
                  <Unlock className="h-4 w-4" /> Release
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="block" className="space-y-4 pt-4">
                <div className="rounded-md bg-muted/50 p-3 text-xs flex gap-2 items-start text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 text-blue-500" />
                  Blocking stock reserves it from B2B/B2C fulfillment. Available to block: <b className="text-foreground ml-1">{(Number(selectedProduct?.quantity) - Number(selectedProduct?.reserved)).toLocaleString()}</b>
                </div>
                
                <div className="space-y-2">
                  <Label>Quantity to Block</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter units..." 
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Note / Reason</Label>
                  <Input 
                    placeholder="e.g. Quality check hold" 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button variant="outline" onClick={() => setShowManageModal(false)}>Cancel</Button>
                  <Button 
                    className="bg-risk text-white hover:bg-risk/90 gap-2"
                    disabled={actionLoading || !formData.quantity}
                    onClick={() => handleAction('block')}
                  >
                    {actionLoading ? "Blocking..." : "Confirm Block"}
                  </Button>
                </DialogFooter>
              </TabsContent>

              <TabsContent value="release" className="space-y-4 pt-4">
                <div className="rounded-md bg-muted/50 p-3 text-xs flex gap-2 items-start text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 text-amber-500" />
                  Releasing blocked stock makes it available for orders. Currently blocked: <b className="text-foreground ml-1">{Number(selectedProduct?.reserved).toLocaleString()}</b>
                </div>
                
                <div className="space-y-2">
                  <Label>Quantity to Release</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter units..." 
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Note / Reason</Label>
                  <Input 
                    placeholder="e.g. Cleared quality check" 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button variant="outline" onClick={() => setShowManageModal(false)}>Cancel</Button>
                  <Button 
                    className="bg-profit text-white hover:bg-profit/90 gap-2"
                    disabled={actionLoading || !formData.quantity}
                    onClick={() => handleAction('release')}
                  >
                    {actionLoading ? "Releasing..." : "Confirm Release"}
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
import { Settings } from "lucide-react";
