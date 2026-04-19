import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Loader2, Package, ChevronUp, Tag, X, Check, IndianRupee, Eye, Layers, BarChart3, Info } from "lucide-react";
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

export default function B2BCatalogPicker({ onListingAdded }: { onListingAdded?: () => void }) {
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [b2bPrice, setB2BPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<BulkProduct | null>(null);
  const [detailB2BPrice, setDetailB2BPrice] = useState("");
  const navigate = useNavigate();

  const fetchCatalog = async () => {
    try {
      const res = await api.get(`/sph/catalog/bulk?type=B2B&search=${search}`);
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

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category_name).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter(p => p.category_name === activeCategory);
  }, [products, activeCategory]);

  const handleLinkProduct = async (product: BulkProduct, priceValue: string, fromDialog?: boolean) => {
    if (!priceValue || isNaN(parseFloat(priceValue))) {
      toast.error("Please enter a valid B2B selling price");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/sph/listings/link", { 
        product_id: product.id, 
        retail_price: priceValue, // re-using the column as discussed
        listing_type: 'B2B'
      });

      toast.success("Product added to your B2B marketplace!");
      setExpandedId(null);
      setB2BPrice("");
      if (fromDialog) {
        setDetailProduct(null);
        setDetailB2BPrice("");
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

  const openProductDetail = (product: BulkProduct) => {
    setDetailProduct(product);
    setDetailB2BPrice(product.bulk_price || "");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 pt-2">
        <div className="flex items-end justify-between mt-1">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Browse B2B Catalog</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Select products to list in your <span className="font-semibold text-blue-500">B2B District Marketplace</span>
            </p>
          </div>
          {!loading && (
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5 shadow-sm transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input 
          placeholder="Search global catalog for B2B products…" 
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
            <h4 className="text-sm font-semibold text-muted-foreground">No bulk products available</h4>
            <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or check if all products are already listed.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-3 border-b border-border bg-muted/40">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Product</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Base Bulk Cost</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right">MRP</span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center w-[120px]">Action</span>
          </div>

          <div className="divide-y divide-border">
            {filteredProducts.map((p) => (
              <div key={p.id}>
                <div 
                  className={`grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 transition-colors ${
                    expandedId === p.id ? 'bg-primary/[0.03]' : 'hover:bg-muted/30'
                  }`}
                >
                  <div 
                    className="flex items-center gap-3.5 cursor-pointer group/product"
                    onClick={() => openProductDetail(p)}
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate group-hover/product:text-primary">{p.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground uppercase">{p.sku}</p>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <Badge variant="outline" className="text-[10px]">{p.category_name}</Badge>
                  </div>

                  <div className="hidden md:block text-right">
                    <span className="text-sm font-semibold tabular-nums">₹{p.bulk_price}</span>
                  </div>

                  <div className="hidden md:block text-right">
                    <span className="text-sm text-muted-foreground tabular-nums">₹{p.mrp}</span>
                  </div>

                  <div className="flex justify-end w-full md:w-[120px]">
                    {expandedId === p.id ? (
                      <Button variant="ghost" size="sm" onClick={() => { setExpandedId(null); setB2BPrice(""); }}>
                        <ChevronUp className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-1 h-8" onClick={() => { setExpandedId(p.id); setB2BPrice(p.bulk_price); }}>
                        <Plus className="h-3.5 w-3.5" /> Add to B2B
                      </Button>
                    )}
                  </div>
                </div>

                {expandedId === p.id && (
                  <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-1">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 rounded-lg border border-blue-500/10 bg-blue-500/[0.02] p-4">
                      <div className="flex-1 space-y-1.5 w-full sm:w-auto">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Set District B2B Selling Price
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            type="number"
                            className="pl-8 h-10 text-sm font-semibold"
                            value={b2bPrice}
                            autoFocus
                            onChange={(e) => setB2BPrice(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 h-10 px-6 shrink-0"
                        onClick={() => handleLinkProduct(p, b2bPrice)}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Confirm & List for B2B
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!detailProduct} onOpenChange={(open) => { if (!open) { setDetailProduct(null); setDetailB2BPrice(""); } }}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden text-card-foreground">
          {detailProduct && (
            <>
              <div className="relative aspect-[16/8] w-full bg-muted overflow-hidden">
                {detailProduct.thumbnail_url ? (
                  <img src={detailProduct.thumbnail_url} alt={detailProduct.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <Package className="h-16 w-16 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute bottom-3 left-4">
                  <Badge className="bg-blue-500/80 backdrop-blur-sm text-[11px] font-medium shadow-sm">
                    Bulk/B2B
                  </Badge>
                </div>
              </div>

              <div className="px-6 pt-5 pb-2">
                <DialogHeader>
                  <DialogTitle>{detailProduct.name}</DialogTitle>
                  <DialogDescription className="font-mono uppercase text-xs">SKU: {detailProduct.sku}</DialogDescription>
                </DialogHeader>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Base Bulk Cost</span>
                    <p className="text-lg font-bold">₹{detailProduct.bulk_price}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">MRP</span>
                    <p className="text-lg font-bold">₹{detailProduct.mrp}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 pt-3 pb-6 border-t border-border mt-4">
                <div className="space-y-3">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    Set B2B District Price
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="number"
                        className="pl-8 h-10 text-sm font-semibold"
                        value={detailB2BPrice}
                        onChange={(e) => setDetailB2BPrice(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 h-10 px-5"
                      onClick={() => detailProduct && handleLinkProduct(detailProduct, detailB2BPrice, true)}
                      disabled={submitting}
                    >
                      Add to B2B Catalog
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
