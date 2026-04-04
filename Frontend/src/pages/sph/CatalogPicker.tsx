import { useState, useEffect } from "react";
import { Search, Plus, ExternalLink, Loader2, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const [listingId, setListingId] = useState<string | null>(null);
  const [retailPrice, setRetailPrice] = useState("");
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

  const handleLinkProduct = async (product: BulkProduct) => {
    if (!retailPrice || isNaN(parseFloat(retailPrice))) {
      toast.error("Please enter a valid retail price");
      return;
    }

    try {
      await api.post("/sph/listings/link", { 
        product_id: product.id, 
        retail_price: retailPrice 
      });

      toast.success("Product added to your marketplace!");
      setListingId(null);
      setRetailPrice("");
      fetchCatalog();
      if (onListingAdded) onListingAdded();
      else navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to link product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back to Manager
        </Button>
        <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold tracking-tight">Import from Global Catalog</h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
                Select products from the FTS Bulk catalog to sell in the B2C Marketplace. 
                You can set your own retail price within the MRP and Bulk Cost limits.
            </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search products by name, SKU or category..." 
          className="border-none bg-transparent focus-visible:ring-0 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:border-primary/20">
              <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                {p.thumbnail_url ? (
                  <img src={p.thumbnail_url} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-10 w-10 opacity-20" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px]">{p.category_name}</Badge>
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">{p.name}</h4>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">{p.sku}</p>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 mb-4">
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Bulk Cost</p>
                    <p className="text-xs font-extrabold text-foreground">₹{p.bulk_price}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">MRP</p>
                    <p className="text-xs font-extrabold text-foreground">₹{p.mrp}</p>
                  </div>
                </div>

                {listingId === p.id ? (
                  <div className="space-y-3 pt-3 border-t border-border animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Your Retail Price</label>
                        <Input 
                            type="number" 
                            placeholder="₹ Set Price" 
                            className="h-9 text-sm font-bold text-emerald-500"
                            value={retailPrice}
                            autofocus
                            onChange={(e) => setRetailPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" className="flex-1 font-bold" onClick={() => handleLinkProduct(p)}>Confirm</Button>
                        <Button size="sm" variant="ghost" onClick={() => setListingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full gap-2 font-bold"
                    onClick={() => {
                        setListingId(p.id);
                        setRetailPrice(p.recommended_retail_price);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Add to Marketplace
                  </Button>
                )}
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-24 text-center">
                <div className="mb-4 flex justify-center opacity-10"><Package className="h-20 w-20" /></div>
                <h4 className="text-lg font-bold text-muted-foreground">No products found</h4>
                <p className="text-sm text-muted-foreground">Try searching for something else or browse another category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
