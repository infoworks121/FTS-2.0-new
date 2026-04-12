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
  PurchaseTypeBadge,
  formatCurrency,
} from "@/components/businessman/PurchaseAdvancePrimitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { productApi } from "@/lib/productApi";
import { orderApi } from "@/lib/orderApi";
import { addressApi, UserAddress } from "@/lib/addressApi";

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
  fulfillerId: string;
  fulfillerType: string;
  sourceDistrictId: number | null;
  sellerName: string;
};

const ADVANCE_AVAILABLE = 28000;
const ADVANCE_LIMIT = 30000;

export default function ProductPurchasePage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<"all" | Availability>("all");
  const [selectedId, setSelectedId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseMode>("Direct");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pin, setPin] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    pincode: "",
  });
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("manual");

  useEffect(() => {
    fetchProfileAndProducts();
    fetchAddresses();
  }, []);

  const fetchProfileAndProducts = async () => {
    try {
      setLoading(true);
      // 1. Fetch User Profile for District Matching
      const profile = await orderApi.getBusinessmanProfile(); // Assuming this is available or standard
      setUserProfile(profile);

      // 2. Fetch Products
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
            marginPercent: 10,
            availability: availStatus,
            stock: stock,
            fulfillerId: p.fulfiller_id,
            fulfillerType: p.fulfiller_type,
            sourceDistrictId: p.source_district_id,
            sellerName: p.seller_name
          };
        });
        setProducts(mappedProducts);
        if (mappedProducts.length > 0) setSelectedId(mappedProducts[0].id);
      }
    } catch (error: any) {
      toast({ title: "Initialization Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const data = await addressApi.getAddresses();
      setSavedAddresses(data);
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setDeliveryAddress({
          street: defaultAddr.street_address,
          city: defaultAddr.city,
          pincode: defaultAddr.pincode
        });
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    if (pin.length !== 6) {
      toast({ title: "Invalid PIN", description: "Please enter a 6-digit transaction PIN.", variant: "destructive" });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await orderApi.createB2BOrder({
        items: [
          {
            product_id: selectedProduct.id,
            quantity: quantity,
          }
        ],
        preferred_fulfiller: {
          id: selectedProduct.fulfillerId,
          type: selectedProduct.fulfillerType
        },
        payment_method: "wallet",
        transaction_pin: pin,
        delivery_address: deliveryAddress.city ? deliveryAddress : undefined,
        notes: `Purchase type: ${purchaseType}`
      });

      toast({ title: "Success", description: "B2B Order placed successfully! Selection honored." });
      setConfirmOpen(false);
      setQuantity(1);
      setPin("");
      setDeliveryAddress({ street: "", city: "", pincode: "" });
      
      // Refresh
      fetchProfileAndProducts();
    } catch (error: any) {
      toast({ title: "Order Failed", description: error.response?.data?.error || error.message, variant: "destructive" });
      setPin("");
    } finally {
      setIsSubmitting(false);
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
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{item.name}</p>
                        {/* FTS SOURCE BADGES */}
                        {item.fulfillerType === 'admin' ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Admin</Badge>
                        ) : userProfile?.district_id === item.sourceDistrictId ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Local</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Through Admin</Badge>
                        )}
                      </div>
                      <Badge variant="secondary" className="opacity-70">{item.category}</Badge>
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Purchase & PIN</DialogTitle>
            <DialogDescription>
              You are placing a {purchaseType.toLowerCase()} B2B order for {quantity} units of {selectedProduct?.name} at a total cost of {formatCurrency((selectedProduct?.basePrice || 0) * quantity)}.
              Please enter your 6-digit transaction PIN to confirm the payment from your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Delivery Address</Label>
              <Select 
                value={selectedAddressId} 
                onValueChange={(val) => {
                  setSelectedAddressId(val);
                  if (val !== "manual") {
                    const addr = savedAddresses.find(a => a.id === val);
                    if (addr) {
                      setDeliveryAddress({
                        street: addr.street_address,
                        city: addr.city,
                        pincode: addr.pincode
                      });
                    }
                  } else {
                    setDeliveryAddress({ street: "", city: "", pincode: "" });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an address" />
                </SelectTrigger>
                <SelectContent>
                  {savedAddresses.map(addr => (
                    <SelectItem key={addr.id} value={addr.id}>
                      {addr.label} ({addr.city})
                    </SelectItem>
                  ))}
                  <SelectItem value="manual">Enter Manually / Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedAddressId === "manual" ? (
              <>
                <div className="space-y-2">
                  <Label>Delivery Street / Area</Label>
                  <Input
                    placeholder="e.g. 12, Park Street, Block A"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>City / District</Label>
                    <Input
                      placeholder="e.g. Kolkata"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input
                      placeholder="e.g. 700001"
                      value={deliveryAddress.pincode}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, pincode: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border text-sm">
                <p className="font-medium text-xs text-muted-foreground uppercase mb-1">Selected Destination</p>
                <p>{deliveryAddress.street}</p>
                <p>{deliveryAddress.city}, {deliveryAddress.pincode}</p>
              </div>
            )}

            <div className="border-t pt-4 flex flex-col items-center space-y-2">
              <Label htmlFor="pin-input">Transaction PIN</Label>
              <InputOTP
                id="pin-input"
                maxLength={6}
                value={pin}
                onChange={setPin}
                disabled={isSubmitting}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePurchase}
              disabled={pin.length !== 6 || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
