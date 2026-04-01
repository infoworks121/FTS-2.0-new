import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, Star, ArrowLeft, Heart, Eye, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products, categories, formatINR } from "@/lib/mockData";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BrowseProducts() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [sortBy, setSortBy] = useState("relevance");
  const [inStockOnly, setInStockOnly] = useState(false);
  const { addItem } = useCart();

  const filtered = products.filter(p => {
    if (activeCategory && p.category !== categories.find(c => c.id === activeCategory)?.name) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (inStockOnly && !p.inStock) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-low") return a.sellingPrice - b.sellingPrice;
    if (sortBy === "price-high") return b.sellingPrice - a.sellingPrice;
    return 0;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link to="/marketplace"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            {activeCategory ? categories.find(c => c.id === activeCategory)?.name || "Browse" : "All Products"}
          </h1>
          <p className="text-xs text-muted-foreground">{filtered.length} products found</p>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0 mb-4 scrollbar-hide">
        <button onClick={() => setActiveCategory(null)}
          className={cn("shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm", !activeCategory ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-card border-2 border-border text-muted-foreground hover:border-primary/30 hover:text-primary")}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={cn("shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm", activeCategory === cat.id ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-card border-2 border-border text-muted-foreground hover:border-primary/30 hover:text-primary")}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search & sort */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-xl h-11 border-2 focus:border-primary/40" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border-2 rounded-xl px-4 text-sm bg-card font-medium focus:border-primary/40 transition-colors">
          <option value="relevance">Relevance</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
        </select>
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-56 shrink-0 space-y-4">
          <div className="card-base p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">Filters</h3>
            </div>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="rounded border-border accent-primary w-4 h-4" />
              <span className="group-hover:text-primary transition-colors">In Stock Only</span>
            </label>
          </div>
        </aside>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => {
            const discount = Math.round((1 - product.sellingPrice / product.mrp) * 100);
            return (
              <div key={product.id} className="card-base overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Link to={`/marketplace/product/${product.id}`} className="relative">
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-3">
                    <div className="flex gap-1.5">
                      <span className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                        <Heart className="h-3.5 w-3.5" />
                      </span>
                      <span className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                        <Eye className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="status-destructive">Out of Stock</span>
                    </div>
                  )}
                  {product.type === "subscription" && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-trust text-white text-[10px] font-semibold shadow">Subscription</span>
                  )}
                  {discount > 0 && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-destructive text-destructive-foreground text-[10px] font-bold shadow">-{discount}%</span>
                  )}
                </Link>
                <div className="p-3.5 flex flex-col flex-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-1">{product.category}</span>
                  <Link to={`/marketplace/product/${product.id}`}>
                    <p className="text-sm font-semibold line-clamp-2 hover:text-primary transition-all duration-200">{product.name}</p>
                  </Link>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-bold font-mono">{formatINR(product.sellingPrice)}</span>
                    <span className="text-xs text-muted-foreground line-through font-mono">{formatINR(product.mrp)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{product.unit}</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-profit/10 text-profit text-[11px] font-bold">
                      4.2 <Star className="h-2.5 w-2.5 fill-current" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">(128)</span>
                  </div>
                  <Button size="sm" className="mt-3 w-full" disabled={!product.inStock}
                    onClick={() => { addItem(product); toast.success(`${product.name} added to cart`); }}>
                    <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                  </Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <Search className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="font-bold text-lg">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search</p>
              <Button variant="outline" className="mt-5" onClick={() => { setActiveCategory(null); setSearchQuery(""); }}>
                <X className="h-3.5 w-3.5" /> Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
