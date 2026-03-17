import { useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  DisabledReason,
  FinanceConfirmDialog,
  PurchaseTypeBadge,
  formatCurrency,
} from "@/components/businessman/PurchaseAdvancePrimitives";

type PurchaseMode = "Direct" | "Advance";
type Availability = "In Stock" | "Low Stock" | "Unavailable";

type ProductRow = {
  id: string;
  name: string;
  category: "Seeds" | "Fertilizer" | "Equipment" | "Pesticide";
  image: string;
  basePrice: number;
  marginPercent: number;
  availability: Availability;
  stock: number;
};

const products: ProductRow[] = [
  { id: "PRD-1001", name: "Premium Wheat Seed", category: "Seeds", image: "🌾", basePrice: 1400, marginPercent: 12, availability: "In Stock", stock: 120 },
  { id: "PRD-1002", name: "Nitro Boost Fertilizer", category: "Fertilizer", image: "🧪", basePrice: 980, marginPercent: 15, availability: "Low Stock", stock: 14 },
  { id: "PRD-1003", name: "Smart Drip Kit", category: "Equipment", image: "💧", basePrice: 6200, marginPercent: 10, availability: "In Stock", stock: 28 },
  { id: "PRD-1004", name: "Shield Pro Pesticide", category: "Pesticide", image: "🛡️", basePrice: 1720, marginPercent: 13, availability: "Unavailable", stock: 0 },
];

const ADVANCE_AVAILABLE = 28000;
const ADVANCE_LIMIT = 30000;

export default function ProductPurchasePage() {
  const [category, setCategory] = useState<"all" | ProductRow["category"]>("all");
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<"all" | Availability>("all");
  const [selectedId, setSelectedId] = useState(products[0].id);
  const [quantity, setQuantity] = useState(10);
  const [purchaseType, setPurchaseType] = useState<PurchaseMode>("Direct");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const byCategory = category === "all" || item.category === category;
      const bySearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const byAvailability = availability === "all" || item.availability === availability;
      return byCategory && bySearch && byAvailability;
    });
  }, [availability, category, search]);

  const selectedProduct = products.find((item) => item.id === selectedId) || products[0];
  const estimatedProfit = Math.round(selectedProduct.basePrice * quantity * (selectedProduct.marginPercent / 100));
  const advanceRequired = Math.round(selectedProduct.basePrice * quantity * 0.4);

  const disabledReason = useMemo(() => {
    if (selectedProduct.availability === "Unavailable") return "Product unavailable. Purchase is blocked until stock is restored.";
    if (quantity <= 0) return "Quantity must be at least 1.";
    if (quantity > selectedProduct.stock) return "Requested quantity exceeds available stock.";
    if (purchaseType === "Advance" && advanceRequired > ADVANCE_AVAILABLE) {
      return `Advance required (${formatCurrency(advanceRequired)}) exceeds available limit (${formatCurrency(ADVANCE_AVAILABLE)}).`;
    }
    return "";
  }, [advanceRequired, purchaseType, quantity, selectedProduct]);

  const canProceed = !disabledReason;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Product Purchase</h1>
        <p className="text-sm text-muted-foreground">Entry-level direct purchase and advance-mode purchase with rule-safe controls.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v: "all" | ProductRow["category"]) => setCategory(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Seeds">Seeds</SelectItem>
                <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Pesticide">Pesticide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Search</Label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product name / ID" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <Select value={availability} onValueChange={(v: "all" | Availability) => setAvailability(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Product List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedId === item.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-lg">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium truncate">{item.name}</p>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Base Price</p>
                        <p className="font-mono">{formatCurrency(item.basePrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin (RO)</p>
                        <p className="text-emerald-500 font-semibold">{item.marginPercent}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stock</p>
                        <p className="font-mono">{item.stock}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Availability</p>
                        <p className={item.availability === "Unavailable" ? "text-red-500" : item.availability === "Low Stock" ? "text-amber-500" : "text-emerald-500"}>{item.availability}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Action Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Selected Product</p>
              <p className="font-medium mt-1">{selectedProduct.name}</p>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                max={selectedProduct.stock || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value || 0))}
              />
            </div>

            <div className="space-y-2">
              <Label>Purchase Type</Label>
              <Select value={purchaseType} onValueChange={(v: PurchaseMode) => setPurchaseType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct">Direct</SelectItem>
                  <SelectItem value="Advance">Advance</SelectItem>
                </SelectContent>
              </Select>
              <PurchaseTypeBadge type={purchaseType} />
            </div>

            <div className="rounded-md border p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Estimated Profit (Info Only)</p>
              <p className="text-emerald-500 font-semibold font-mono">{formatCurrency(estimatedProfit)}</p>
              {purchaseType === "Advance" && (
                <p className="text-xs text-muted-foreground">
                  Advance required: <span className="font-mono">{formatCurrency(advanceRequired)}</span> / Limit: <span className="font-mono">{formatCurrency(ADVANCE_LIMIT)}</span>
                </p>
              )}
            </div>

            {!!disabledReason && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-500">Finance-safe warning</p>
                  <DisabledReason reason={disabledReason} />
                </div>
              </div>
            )}

            <Button className="w-full" disabled={!canProceed} onClick={() => setConfirmOpen(true)}>
              Proceed to Purchase
            </Button>
            <DisabledReason reason={!canProceed ? disabledReason : ""} />
          </CardContent>
        </Card>
      </div>

      <FinanceConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm purchase submission"
        description={`You are placing a ${purchaseType.toLowerCase()} purchase for ${quantity} units of ${selectedProduct.name}. This action creates a finance record and cannot be silently edited.`}
        confirmLabel="Confirm Purchase"
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}

