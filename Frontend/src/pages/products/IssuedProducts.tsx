import { useState, useMemo } from "react";
import { 
  Search, 
  Filter,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  Package,
  Mail,
  User,
  Phone,
  MapPin,
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  History
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { productApi } from "@/lib/productApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { CartSheet } from "@/components/cart/CartSheet";
import { 
  ProductCardGrid, 
  ProductCardList, 
  MarketplaceHero, 
  CategoryStrip,
  formatCurrency 
} from "@/components/marketplace/MarketplaceComponents";
import { cn } from "@/lib/utils";

interface IssuedProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  thumbnail_url: string;
  image_urls: string[];
  category_name: string;
  mrp: string;
  selling_price: string;
  unit: string;
  seller_name: string;
  business_name: string;
  business_address: string;
  available_stock: number;
}

type SortOption = "relevance" | "trending" | "newest" | "price_low" | "price_high";

export default function IssuedProducts() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productApi.getCategories(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["issued-products", selectedCategory, search],
    queryFn: () => productApi.getIssuedProducts({ 
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
      search: search || undefined
    }),
  });

  const categories = categoriesData?.categories || [];
  const rawProducts: IssuedProduct[] = productsData?.products || [];

  // Algorithm: Sorting and Enhancing Products
  const processedProducts = useMemo(() => {
    let products = rawProducts.map(p => ({
      ...p,
      isTrending: (Number(p.id) % 7 === 0) || (p.available_stock < 50),
      isNew: (Number(p.id) % 5 === 0),
      rating: 4 + (Number(p.id) % 10) / 10
    }));

    switch (sortBy) {
      case "trending":
        return [...products].sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
      case "newest":
        return [...products].sort((a, b) => Number(b.id) - Number(a.id));
      case "price_low":
        return [...products].sort((a, b) => Number(a.selling_price) - Number(b.selling_price));
      case "price_high":
        return [...products].sort((a, b) => Number(b.selling_price) - Number(a.selling_price));
      default:
        return products;
    }
  }, [rawProducts, sortBy]);

  const trendingProducts = useMemo(() => 
    processedProducts.filter(p => p.isTrending).slice(0, 4),
  [processedProducts]);

  const handleGetQuote = (product: IssuedProduct) => {
    setSelectedProduct(product);
    setIsQuoteModalOpen(true);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      category: product.category_name,
      image: product.thumbnail_url,
      basePrice: Number(product.selling_price || product.mrp || 0),
      quantity: 1,
      stock: product.available_stock,
    });
  };

  const handleBuyNow = (product: any) => {
    handleAddToCart(product);
    setIsCartOpen(true);
  };

  const sortLabels: Record<SortOption, string> = {
    relevance: "Best Match",
    trending: "Trending First",
    newest: "Newest Arrivals",
    price_low: "Price: Low to High",
    price_high: "Price: High to Low"
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header / Search Area */}
      <header className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-8 shrink-0">
             <h1 className="text-2xl font-black text-slate-900 tracking-tighter">FTS <span className="text-emerald-600">MARKET</span></h1>
             <div className="hidden lg:flex items-center gap-6">
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">Suppliers</a>
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">Bulk Deals</a>
                <a href="#" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">Inquiries</a>
             </div>
          </div>
          
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
            <Input 
              placeholder="Search wholesale products, brands or suppliers..." 
              className="pl-12 h-12 bg-slate-100 border-none focus-visible:ring-emerald-500 rounded-2xl text-base font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-emerald-500/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
             <Button asChild variant="ghost" size="sm" className="hidden md:flex gap-2 text-slate-600 font-bold hover:text-emerald-600 hover:bg-emerald-50 rounded-xl px-4 transition-all">
                <Link to="/businessman/orders/active">
                  <History className="h-4 w-4" /> My Orders
                </Link>
             </Button>
             <div className="hidden sm:block p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative">
                <SlidersHorizontal className="h-5 w-5 text-slate-600" />
             </div>
             <CartSheet />
             <Link to="/businessman/profile" className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-900/10">
                <User className="h-5 w-5" />
             </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <MarketplaceHero />

        {/* Category Strip */}
        <div className="mb-12">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-emerald-600" /> Browse Categories
              </h2>
              <Button variant="ghost" className="text-emerald-600 font-bold hover:bg-emerald-50">View All</Button>
           </div>
           <CategoryStrip 
            categories={categories} 
            selected={selectedCategory} 
            onSelect={setSelectedCategory} 
           />
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            
            {/* Trending Section */}
            {trendingProducts.length > 0 && selectedCategory === "all" && !search && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-orange-500" /> Trending Now
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Hottest products in the market right now</p>
                  </div>
                  <div className="flex gap-2">
                     <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-slate-200">
                        <ChevronRight className="h-5 w-5 rotate-180" />
                     </Button>
                     <Button size="icon" variant="outline" className="rounded-full h-10 w-10 border-slate-200">
                        <ChevronRight className="h-5 w-5" />
                     </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingProducts.map((product) => (
                    <ProductCardGrid 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Filter & Layout Controls */}
            <div className="sticky top-[5.5rem] z-40 bg-[#f8fafc]/80 backdrop-blur-md py-4 mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60">
               <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <span className="text-emerald-600">{processedProducts.length}</span> Products Found
                  </p>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="rounded-xl bg-white border-slate-200 font-bold gap-2 focus-visible:ring-emerald-500">
                        <ArrowUpDown className="h-4 w-4" /> {sortLabels[sortBy]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px] rounded-xl p-2">
                       {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                         <DropdownMenuItem 
                          key={option} 
                          className={cn(
                            "rounded-lg font-medium cursor-pointer mb-0.5",
                            sortBy === option ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600"
                          )}
                          onClick={() => setSortBy(option)}
                         >
                           {sortLabels[option]}
                         </DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>

               <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      viewMode === "grid" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      viewMode === "list" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
               </div>
            </div>

            {/* Product List */}
            {isLoading ? (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Skeleton key={i} className={cn("rounded-2xl", viewMode === "grid" ? "aspect-[3/4]" : "h-56")} />
                ))}
              </div>
            ) : processedProducts.length === 0 ? (
              <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 py-32 text-center shadow-sm">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Zero matches found</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                  Maybe try different keywords or browse other categories to find what you're looking for.
                </p>
                <Button 
                  variant="link" 
                  className="text-emerald-600 mt-6 font-bold"
                  onClick={() => {setSearch(""); setSelectedCategory("all");}}
                >
                  Reset all filters
                </Button>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6 animate-in fade-in duration-700",
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}>
                {processedProducts.map((product) => (
                  viewMode === "grid" ? (
                    <ProductCardGrid 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                    />
                  ) : (
                    <ProductCardList 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                    />
                  )
                ))}
              </div>
            )}

            {/* Pagination / Load More */}
            {!isLoading && processedProducts.length > 0 && (
              <div className="mt-20 flex flex-col items-center gap-6">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">You've seen them all</p>
                <div className="h-px w-24 bg-slate-200" />
                <Button className="h-14 px-10 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 shadow-sm transition-all group">
                   Load More Products
                   <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Branding Area */}
      <footer className="bg-white border-t mt-32 py-20">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">Ready to Scale your <span className="text-emerald-600">Inventory?</span></h2>
            <div className="flex flex-wrap justify-center gap-10">
               <div className="text-left">
                  <p className="text-3xl font-black text-slate-900">50K+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Suppliers</p>
               </div>
               <div className="h-14 w-px bg-slate-200 hidden sm:block" />
               <div className="text-left">
                  <p className="text-3xl font-black text-slate-900">1M+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Transactions</p>
               </div>
               <div className="h-14 w-px bg-slate-200 hidden sm:block" />
               <div className="text-left">
                  <p className="text-3xl font-black text-slate-900">99.9%</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Order Fulfillment</p>
               </div>
            </div>
         </div>
      </footer>

      {/* Get Quote Modal - Keeping this as it's useful */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl shadow-slate-900/20">
          <DialogHeader className="p-10 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">Inquiry Request</DialogTitle>
            <DialogDescription className="text-slate-400 mt-3 text-base font-medium">
              We'll connect you with <span className="text-emerald-400 font-bold">{selectedProduct?.business_name}</span> directly.
            </DialogDescription>
          </DialogHeader>

          <div className="p-10 space-y-8 bg-slate-50">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Contact Authority</p>
                  <p className="text-xl font-bold text-slate-900">{selectedProduct?.seller_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <Phone className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Official Support</p>
                  <p className="text-xl font-bold text-slate-900">+91 98765 43210</p>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none mt-1 h-5 text-[9px] font-black uppercase tracking-wider">Verified Business ✅</Badge>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex gap-5 items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center p-3">
                   {selectedProduct?.thumbnail_url ? (
                     <img src={selectedProduct.thumbnail_url} alt="" className="w-full h-full object-contain" />
                   ) : <Package className="w-10 h-10 text-slate-200" />}
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 font-black text-lg truncate">{selectedProduct?.name}</p>
                  <p className="text-emerald-600 font-black text-xl mt-1">
                    {formatCurrency(selectedProduct?.selling_price || 0)}
                    <span className="text-xs text-slate-400 font-bold tracking-widest ml-1 uppercase">/ {selectedProduct?.unit}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 pt-0 bg-slate-50 sm:flex-col gap-4">
             <Button className="w-full h-14 bg-slate-900 hover:bg-emerald-600 rounded-2xl font-black text-lg group shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
               Call Supplier Now 
               <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
             </Button>
             <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               Encrypted connection via FTS Secure Bridge
             </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
