import { useState, useMemo, useEffect } from "react";
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
  History,
  Info,
  ShoppingCart,
  CheckCircle2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
import QuickListModal from "@/components/sph/QuickListModal";
import { DashboardLayout, NavItem } from "@/components/DashboardLayout";

// Sidebar Configs
import { sidebarNavItems as adminNavItems } from "@/config/sidebarConfig";
import { getBusinessmanSidebarNavItems } from "@/config/businessmanSidebarConfig";
import { getSPHSidebarNavItems } from "@/config/sphSidebarConfig";
import { getCoreBodyFlatNavItems } from "@/config/coreBodySidebarConfig";

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

function MarketplaceContent() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [quickListProduct, setQuickListProduct] = useState<any>(null);
  const { addToCart, setIsCartOpen } = useCart();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const isStockPoint = user?.role_code === "stock_point";

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
    trending: "Trending Focus",
    newest: "Latest Added",
    price_low: "Price: Low to High",
    price_high: "Price: High to Low"
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Professional Page Title */}
      <MarketplaceHero />

      {/* Optimized Filter Bar */}
      <div className="sticky top-0 z-30 flex flex-col gap-4 bg-background/95 backdrop-blur-md py-4 border-b border-slate-100 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            <Input 
              placeholder="Search products..."
              className="h-9 w-full rounded-lg border-slate-200 bg-white pl-9 focus-visible:ring-emerald-500/20 text-[11px] font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-lg border-slate-200 bg-white font-semibold gap-2 px-4 shadow-sm text-[11px]">
                  <ArrowUpDown className="h-3 w-3" /> {sortLabels[sortBy]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-lg p-1 shadow-lg border-slate-100">
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <DropdownMenuItem 
                    key={option}
                    className={cn(
                      "rounded-md text-[10px] font-bold cursor-pointer mb-0.5 p-2 px-3 uppercase tracking-wider",
                      sortBy === option ? "bg-slate-50 text-emerald-600" : "text-slate-500 hover:bg-slate-50"
                    )}
                    onClick={() => setSortBy(option)}
                  >
                    {sortLabels[option]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-9 flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-500"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-500"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <CategoryStrip 
          categories={categories} 
          selected={selectedCategory} 
          onSelect={setSelectedCategory} 
        />
      </div>

      {/* Content Grid */}
      <div className="pb-12">
        {isLoading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className={cn("rounded-xl", viewMode === "grid" ? "aspect-[4/3]" : "h-40")} />
            ))}
          </div>
        ) : processedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-10 w-10 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No matching products</h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
            <Button 
                variant="link" 
                size="sm"
                className="text-emerald-600 font-bold"
                onClick={() => {setSearch(""); setSelectedCategory("all");}}
              >
                Clear all filters
              </Button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 whitespace-normal" : "grid-cols-1 md:grid-cols-2"
          )}>
            {processedProducts.map((product) => (
              viewMode === "grid" ? (
                <ProductCardGrid 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onQuickList={isStockPoint ? (p) => setQuickListProduct(p) : undefined}
                />
              ) : (
                <ProductCardList 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onQuickList={isStockPoint ? (p) => setQuickListProduct(p) : undefined}
                />
              )
            ))}
          </div>
        )}
      </div>

      <QuickListModal 
        product={quickListProduct}
        isOpen={!!quickListProduct}
        onClose={() => setQuickListProduct(null)}
      />
    </div>
  );
}

export default function IssuedProducts() {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const roleCode = user?.role_code || "guest";
  
  const layoutProps = useMemo(() => {
    switch (roleCode) {
      case "admin":
        return {
          role: "admin" as const,
          roleLabel: "Super Admin",
          navItems: adminNavItems as NavItem[]
        };
      case "businessman":
        return {
          role: "businessman" as const,
          roleLabel: `Businessman — ${user?.full_name || 'Business'}`,
          navItems: getBusinessmanSidebarNavItems({
            isStockPoint: user?.is_sph || false,
            bulkEnabled: true,
            entryModeEnabled: true,
            advanceModeEnabled: true,
            businessmanType: user?.businessman_type,
            permissions: user?.permissions || [
              "businessman.dashboard.view",
              "businessman.purchase.view",
              "businessman.bulk.view",
              "businessman.stock.view",
              "businessman.orders.view",
              "businessman.referrals.view",
              "businessman.wallet.view",
              "businessman.performance.view",
            ],
            blockedMenus: {},
          }) as NavItem[]
        };
      case "stock_point":
        return {
          role: "stock_point" as const,
          roleLabel: "STOCK POINT HOLDER",
          navItems: getSPHSidebarNavItems({
            permissions: user?.permissions || [],
          }) as NavItem[]
        };
      case "core_body":
      case "core_body_a":
      case "core_body_b":
        const type = user?.core_body_type || (roleCode === "core_body_a" ? "A" : "B");
        return {
          role: "corebody" as const,
          roleLabel: `CORE BODY TYPE ${type}`,
          navItems: getCoreBodyFlatNavItems(type as any) as NavItem[]
        };
      case "dealer":
        return {
          role: "dealer" as const,
          roleLabel: "SUBDIVISION DEALER",
          navItems: getCoreBodyFlatNavItems("Dealer") as NavItem[]
        };
      default:
        return null;
    }
  }, [roleCode, user]);

  if (!layoutProps) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <MarketplaceContent />
         </div>
      </div>
    );
  }

  return (
    <DashboardLayout {...layoutProps}>
      <MarketplaceContent />
    </DashboardLayout>
  );
}
