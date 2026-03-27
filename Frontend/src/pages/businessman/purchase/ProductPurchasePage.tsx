import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search, Loader2 } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import {
  DisabledReason,
  FinanceConfirmDialog,
  PurchaseTypeBadge,
  formatCurrency,
} from "@/components/businessman/PurchaseAdvancePrimitives";
import { productApi } from "@/lib/productApi";
import { orderApi } from "@/lib/orderApi";

type PurchaseMode = "Direct" | "Advance";
type Availability = "In Stock" | "Low Stock" | "Unavailable";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  image: string;
  basePrice: number;
  marginPercent: number;
  availability: Availability;
  stock: number;
};

const ADVANCE_AVAILABLE = 28000;
const ADVANCE_LIMIT = 30000;

export default function ProductPurchasePage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<"all" | Availability>("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [quantity, setQuantity] = useState(10);
  const [purchaseType, setPurchaseType] = useState<PurchaseMode>("Direct");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getIssuedProducts({ limit: 100 });
      if (res && res.products) {
        const mappedProducts: ProductRow[] = res.products.map((p: any) => {
          let availStatus: Availability = "In Stock";
          const stock = parseFloat(p.available_stock || 0);
          if (stock <= 0) availStatus = "Unavailable";
          else if (stock < 20) availStatus = "Low Stock";

          return {
            id: p.id,
            name: p.name,
            category: p.category_name || "Uncategorized",
            image: p.thumbnail_url || "📦",
            basePrice: parseFloat(p.selling_price || p.mrp || 0),
            marginPercent: 10, // Assuming 10% default margin indicator
            availability: availStatus,
            stock: stock,
          };
        });
        setProducts(mappedProducts);
        if (mappedProducts.length > 0) setSelectedId(mappedProducts[0].id);
      }
    } catch (error: any) {
      toast({ title: "Error loading products", description: error.response?.data?.error || error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    try {
      setIsSubmitting(true);
      
      await orderApi.createB2BOrder({
        items: [
          {
            product_id: selectedProduct.id,
            quantity: quantity,
          }
        ],
        payment_method: "wallet",
        notes: `Purchase type: ${purchaseType}`
      });

      toast({ title: "Success", description: "B2B Order placed successfully! Funds deducted from wallet." });
      setConfirmOpen(false);
      setQuantity(1);
      
      // Refresh stock
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Order Failed", description: error.response?.data?.error || error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const byCategory = category === "all" || item.category === category;
      const bySearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
      const byAvailability = availability === "all" || item.availability === availability;
      return byCategory && bySearch && byAvailability;
    });
  }, [products, availability, category, search]);

  const uniqueCategories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  const selectedProduct = products.find((item) => item.id === selectedId) || products[0];
  const estimatedProfit = selectedProduct ? Math.round(selectedProduct.basePrice * quantity * (selectedProduct.marginPercent / 100)) : 0;
  const advanceRequired = selectedProduct ? Math.round(selectedProduct.basePrice * quantity * 0.4) : 0;

  const disabledReason = useMemo(() => {
    if (!selectedProduct) return "Product not selected.";
    if (selectedProduct.availability === "Unavailable") return "Product unavailable. Purchase is blocked until stock is restored.";
    if (quantity <= 0) return "Quantity must be at least 1.";
    if (quantity > selectedProduct.stock) return "Requested quantity exceeds available stock.";
    if (purchaseType === "Advance" && advanceRequired > ADVANCE_AVAILABLE) {
      return `Advance required (${formatCurrency(advanceRequired)}) exceeds available limit (${formatCurrency(ADVANCE_AVAILABLE)}).`;
    }
    return "";
  }, [advanceRequired, purchaseType, quantity, selectedProduct]);

  const canProceed = !disabledReason && !isSubmitting;

  if (loading) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

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
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
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
            {filteredProducts.length === 0 ? (
               <p className="text-muted-foreground text-sm py-4 text-center border rounded border-dashed">No products available to buy.</p>
            ) : filteredProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${selectedId === item.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 text-xl flex items-center justify-center shrink-0">
                    {item.image.includes('http') ? <img src={item.image} alt="pic" className="rounded object-cover" /> : item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-medium truncate">{item.name}</p>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-mono">{formatCurrency(item.basePrice)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin</p>
                        <p className="text-emerald-500 font-semibold">~{item.marginPercent}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stock Available</p>
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

        {selectedProduct && (
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
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Number(e.target.value || 0))}
                />
              </div>

              <div className="space-y-2">
                <Label>Purchase Type</Label>
                <Select value={purchaseType} onValueChange={(v: PurchaseMode) => setPurchaseType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct">Direct Wallet Buy</SelectItem>
                    <SelectItem value="Advance">Advance Balance</SelectItem>
                  </SelectContent>
                </Select>
                <PurchaseTypeBadge type={purchaseType} />
              </div>

              <div className="rounded-md border p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Total Cost via {purchaseType}</p>
                <p className="font-semibold font-mono">{formatCurrency(selectedProduct.basePrice * quantity)}</p>
                <p className="text-xs text-muted-foreground mt-2">Estimated Resell Profit (Info Only)</p>
                <p className="text-emerald-500 font-semibold font-mono">{formatCurrency(estimatedProfit)}</p>
                {purchaseType === "Advance" && (
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    Advance bounds: <span className="font-mono">{formatCurrency(advanceRequired)}</span> / Limit: <span className="font-mono">{formatCurrency(ADVANCE_LIMIT)}</span>
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
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Proceed to Purchase
              </Button>
              <DisabledReason reason={!canProceed ? disabledReason : ""} />
            </CardContent>
          </Card>
        )}
      </div>

      <FinanceConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm B2B order"
        description={`You are placing a ${purchaseType.toLowerCase()} B2B order for ${quantity} units of ${selectedProduct?.name} at a total cost of ${formatCurrency((selectedProduct?.basePrice || 0) * quantity)}. This will process immediately.`}
        confirmLabel="Confirm Purchase"
        onConfirm={handlePurchase}
      />
    </div>
  );
}
