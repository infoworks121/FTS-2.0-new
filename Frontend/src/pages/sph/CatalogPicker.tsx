import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Loader2, Package, ArrowLeft, ChevronUp, Tag, X, Check, IndianRupee, Eye, Layers, BarChart3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface BulkProduct {
  id: string;
  name: string;
  sku: string;
  thumbnail_url: string;
  category_name: string;
  mrp: string;
  bulk_price: string;
  recommended_retail_price: string;
}

export default function CatalogPicker({ onListingAdded }: { onListingAdded?: () => void }) {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [retailPrice, setRetailPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<BulkProduct | null>(null);
  const [detailRetailPrice, setDetailRetailPrice] = useState("");
  const navigate = useNavigate();

  const fetchCatalog = async () => {
    try {
      const res = await api.get(`/sph/catalog/bulk?search=${search}`);
      setProducts(res.data.products || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCatalog();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Derive categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category_name).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter(p => p.category_name === activeCategory);
  }, [products, activeCategory]);

  const handleLinkProduct = async (product: BulkProduct, priceValue: string, fromDialog?: boolean) => {
    if (!priceValue || isNaN(parseFloat(priceValue))) {
      toast.error("Please enter a valid customer selling price");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/sph/listings/link", { 
        product_id: product.id, 
        retail_price: priceValue 
      });

      toast.success("Product added to your marketplace!");
      setExpandedId(null);
      setRetailPrice("");
      if (fromDialog) {
        setDetailProduct(null);
        setDetailRetailPrice("");
      }
      fetchCatalog();
      if (onListingAdded) onListingAdded();
      else if (!fromDialog) navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to link product");
    } finally {
      setSubmitting(false);
    }
  };

  const computeMargin = (bulk: string, retail: string) => {
    const b = parseFloat(bulk);
    const r = parseFloat(retail);
    if (!b || !r || r <= 0) return null;
    return (((r - b) / r) * 100).toFixed(1);
  };

  const computeProfit = (bulk: string, retail: string) => {
    const b = parseFloat(bulk);
    const r = parseFloat(retail);
    if (!b || !r) return null;
    return (r - b).toFixed(2);
  };

  const openProductDetail = (product: BulkProduct) => {
    setDetailProduct(product);
    setDetailRetailPrice(product.recommended_retail_price || "");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 pt-2">
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Browse Bulk Catalog</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Select products to list in your <span className="font-semibold text-primary">B2C Marketplace</span>
            </p>
          </div>
          {!loading && (
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5 shadow-sm transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input 
          placeholder="Search by product name, SKU or category…" 
          className="border-none bg-transparent focus-visible:ring-0 h-9 text-sm placeholder:text-muted-foreground/60"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category Chips */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !activeCategory 
                ? 'bg-primary text-primary-foreground border-primary font-semibold' 
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground border-primary font-semibold' 
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          <p className="text-xs text-muted-foreground">Loading catalog…</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="rounded-full bg-muted p-5">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-muted-foreground">No products found</h4>
            <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3 border-b border-border bg-muted/40">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Product</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Bulk Cost</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">MRP</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center w-[120px]">Action</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {filteredProducts.map((p) => (
              <div key={p.id}>
                {/* Main Row */}
                <div 
                  className={`grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 transition-colors ${
                    expandedId === p.id ? 'bg-primary/[0.03]' : 'hover:bg-muted/30'
                  }`}
                >
                  {/* Product Info — clickable for details popup */}
                  <div 
                    className="flex items-center gap-3.5 cursor-pointer group/product"
                    onClick={() => openProductDetail(p)}
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted transition-all group-hover/product:border-primary/30 group-hover/product:shadow-sm">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover/product:text-primary transition-colors">{p.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground uppercase">{p.sku}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="hidden md:block">
                    <Badge variant="outline" className="text-[10px] font-medium">{p.category_name}</Badge>
                  </div>

                  {/* Bulk Cost */}
                  <div className="hidden md:block text-right">
                    <span className="text-sm font-semibold text-foreground tabular-nums">₹{p.bulk_price}</span>
                  </div>

                  {/* MRP */}
                  <div className="hidden md:block text-right">
                    <span className="text-sm text-muted-foreground tabular-nums">₹{p.mrp}</span>
                  </div>

                  <div className="flex justify-end w-full md:w-[120px]">
                    {expandedId === p.id ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1 text-muted-foreground h-8"
                        onClick={() => { setExpandedId(null); setRetailPrice(""); }}
                      >
                        <ChevronUp className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="gap-1 font-medium h-8"
                        onClick={() => { 
                          setExpandedId(p.id); 
                          setRetailPrice(p.recommended_retail_price); 
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add to B2C
                      </Button>
                    )}
                  </div>

                  {/* Mobile-only meta row */}
                  <div className="flex items-center gap-4 md:hidden">
                    <Badge variant="outline" className="text-[10px]">{p.category_name}</Badge>
                    <span className="text-xs text-muted-foreground">Cost: <span className="font-semibold text-foreground">₹{p.bulk_price}</span></span>
                    <span className="text-xs text-muted-foreground">MRP: <span className="font-medium">₹{p.mrp}</span></span>
                  </div>
                </div>

                {/* Expanded Panel – Set Retail Price */}
                {expandedId === p.id && (
                  <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 rounded-lg border border-primary/10 bg-primary/[0.02] p-4">
                      <div className="flex-1 space-y-1.5 w-full sm:w-auto">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Set Customer Selling Price
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="Enter price"
                            className="pl-8 h-10 text-sm font-semibold tabular-nums"
                            value={retailPrice}
                            autoFocus
                            onChange={(e) => setRetailPrice(e.target.value)}
                          />
                        </div>
                        {retailPrice && parseFloat(retailPrice) > 0 && (
                          <div className="flex items-center gap-3 text-[11px] mt-1">
                            <span className="text-muted-foreground">
                              Profit: <span className="font-bold text-emerald-500">
                                ₹{computeProfit(p.bulk_price, retailPrice)}
                              </span>
                            </span>
                            {computeMargin(p.bulk_price, retailPrice) && (
                              <span className="text-muted-foreground">
                                Margin: <span className="font-bold text-emerald-500">
                                  {computeMargin(p.bulk_price, retailPrice)}%
                                </span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className="gap-1.5 font-semibold px-6 h-10 shrink-0"
                        onClick={() => handleLinkProduct(p, retailPrice)}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Confirm & Add to B2C
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Product Details Popup ─── */}
      <Dialog open={!!detailProduct} onOpenChange={(open) => { if (!open) { setDetailProduct(null); setDetailRetailPrice(""); } }}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
          {detailProduct && (
            <>
              {/* Product Image Header */}
              <div className="relative aspect-[16/8] w-full bg-muted overflow-hidden">
                {detailProduct.thumbnail_url ? (
                  <img 
                    src={detailProduct.thumbnail_url} 
                    alt={detailProduct.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <Package className="h-16 w-16 text-muted-foreground/20" />
                  </div>
                )}
                {/* Category badge overlay */}
                <div className="absolute bottom-3 left-4">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[11px] font-medium shadow-sm">
                    {detailProduct.category_name}
                  </Badge>
                </div>
              </div>

              {/* Product Info */}
              <div className="px-6 pt-5 pb-2">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="text-lg font-bold tracking-tight text-foreground leading-tight">
                    {detailProduct.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-mono text-muted-foreground uppercase">
                    SKU: {detailProduct.sku}
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Pricing Grid */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <Layers className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Bulk Cost</span>
                    </div>
                    <p className="text-base font-bold text-foreground tabular-nums">₹{detailProduct.bulk_price}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <BarChart3 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">MRP</span>
                    </div>
                    <p className="text-base font-bold text-foreground tabular-nums">₹{detailProduct.mrp}</p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                      <Info className="h-3 w-3 text-primary/70" />
                      <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wide">Suggested</span>
                    </div>
                    <p className="text-base font-bold text-primary tabular-nums">₹{detailProduct.recommended_retail_price}</p>
                    <p className="text-[9px] text-primary/50 mt-0.5">B2C Price</p>
                  </div>
                </div>
              </div>

              {/* Potential Profit Info */}
              {detailProduct.recommended_retail_price && parseFloat(detailProduct.recommended_retail_price) > 0 && (
                <div className="px-6 pb-2">
                  <div className="flex items-center gap-4 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10 px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-muted-foreground">Est. Profit per unit:</span>
                      <span className="text-sm font-bold text-emerald-500 tabular-nums">
                        ₹{computeProfit(detailProduct.bulk_price, detailProduct.recommended_retail_price)}
                      </span>
                    </div>
                    {computeMargin(detailProduct.bulk_price, detailProduct.recommended_retail_price) && (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] text-muted-foreground">Margin:</span>
                        <span className="text-sm font-bold text-emerald-500 tabular-nums">
                          {computeMargin(detailProduct.bulk_price, detailProduct.recommended_retail_price)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add to Marketplace Section */}
              <div className="px-6 pt-3 pb-6">
                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    Set Your B2C Selling Price
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold text-primary border-primary/30">B2C</Badge>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Enter customer price"
                        className="pl-8 h-10 text-sm font-semibold tabular-nums"
                        value={detailRetailPrice}
                        onChange={(e) => setDetailRetailPrice(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="gap-1.5 font-semibold h-10 px-5 shrink-0"
                      onClick={() => detailProduct && handleLinkProduct(detailProduct, detailRetailPrice, true)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Add to B2C Marketplace
                    </Button>
                  </div>
                  {detailRetailPrice && parseFloat(detailRetailPrice) > 0 && (
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-muted-foreground">
                        Your Profit: <span className="font-bold text-emerald-500">₹{computeProfit(detailProduct.bulk_price, detailRetailPrice)}</span>
                      </span>
                      {computeMargin(detailProduct.bulk_price, detailRetailPrice) && (
                        <span className="text-muted-foreground">
                          Margin: <span className="font-bold text-emerald-500">{computeMargin(detailProduct.bulk_price, detailRetailPrice)}%</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
