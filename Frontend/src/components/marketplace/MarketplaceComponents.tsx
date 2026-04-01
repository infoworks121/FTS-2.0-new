import { 
  Package, 
  ShoppingCart, 
  Zap, 
  Star, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Building2,
  ChevronRight,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category_name: string;
  thumbnail_url: string;
  selling_price: string;
  mrp: string;
  unit: string;
  business_name: string;
  business_address: string;
  available_stock: number;
  isNew?: boolean;
  isTrending?: boolean;
  rating?: number;
}

export const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const ProductCardGrid = ({ 
  product, 
  onAddToCart, 
  onBuyNow 
}: { 
  product: Product, 
  onAddToCart: (p: any) => void, 
  onBuyNow: (p: any) => void 
}) => {
  const discount = product.mrp && Number(product.mrp) > Number(product.selling_price)
    ? Math.round(((Number(product.mrp) - Number(product.selling_price)) / Number(product.mrp)) * 100)
    : 0;

  return (
    <Card className="group relative overflow-hidden border-slate-100 hover:border-emerald-200 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 rounded-2xl bg-white">
      <div className="relative aspect-square overflow-hidden bg-slate-50/50 p-6 flex items-center justify-center">
        {product.thumbnail_url ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <Package className="h-16 w-16 text-slate-200" />
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none text-[10px] font-bold uppercase tracking-wider">
              New
            </Badge>
          )}
          {product.isTrending && (
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none text-[10px] font-bold uppercase tracking-wider">
              <TrendingUp className="h-3 w-3 mr-1" /> Trending
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none text-[10px] font-bold">
              {discount}% OFF
            </Badge>
          )}
        </div>

        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300">
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <Button 
            onClick={() => onAddToCart(product)}
            className="w-full bg-white/95 backdrop-blur-sm text-slate-900 border border-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 rounded-xl shadow-lg transition-all duration-300 font-bold"
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="mb-2">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{product.category_name}</span>
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors mt-0.5">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
          <Building2 className="h-3 w-3 text-slate-400" />
          <span className="truncate">{product.business_name}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{formatCurrency(product.selling_price)}</span>
              {discount > 0 && (
                <span className="text-sm text-slate-400 line-through font-medium">{formatCurrency(product.mrp)}</span>
              )}
            </div>
          </div>
          <Button 
            size="icon"
            onClick={() => onBuyNow(product)}
            className="rounded-full bg-slate-900 hover:bg-emerald-600 text-white shadow-lg transition-all duration-300 scale-90 group-hover:scale-100"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductCardList = ({ 
  product, 
  onAddToCart, 
  onBuyNow 
}: { 
  product: Product, 
  onAddToCart: (p: any) => void, 
  onBuyNow: (p: any) => void 
}) => {
  return (
    <Card className="group overflow-hidden border-slate-100 hover:border-emerald-100 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-6 p-5">
          <div className="w-full md:w-52 aspect-square bg-slate-50 rounded-2xl overflow-hidden shrink-0 relative group-hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center p-6">
            {product.thumbnail_url ? (
              <img 
                src={product.thumbnail_url} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            ) : (
              <Package className="h-12 w-12 text-slate-200" />
            )}
            <div className="absolute top-3 left-3">
               <Badge className="bg-white/90 backdrop-blur-sm text-emerald-700 border-none shadow-sm text-[10px] uppercase font-bold tracking-tighter capitalize px-2">
                 {product.category_name}
               </Badge>
            </div>
          </div>

          <div className="flex-1 flex flex-col py-1">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                  {product.name}
                </h2>
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-slate-700">{product.business_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs">{product.business_address}</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Selling Price</p>
                <p className="text-2xl font-black text-slate-900 leading-none">
                  {formatCurrency(product.selling_price)}
                </p>
                <p className="text-xs text-slate-400 mt-1">per {product.unit}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold gap-1 border border-amber-100">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {product.rating || "4.5"}
              </div>
              <div className="flex items-center bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold gap-1">
                <Package className="h-3 w-3" /> {product.available_stock} in stock
              </div>
              {product.isTrending && (
                <div className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded-lg text-xs font-bold gap-1 border border-orange-100">
                  <TrendingUp className="h-3 w-3" /> Trending
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 flex flex-wrap gap-2.5">
              <Button 
                onClick={() => onBuyNow(product)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-7 h-11 font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Zap className="mr-2 h-4 w-4" /> Buy Now
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onAddToCart(product)}
                className="rounded-xl px-6 h-11 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700 transition-all font-bold"
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button 
                variant="ghost" 
                className="rounded-xl px-4 h-11 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-bold"
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MarketplaceHero = () => {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0f172a] text-white p-8 md:p-16 mb-12 group">
      {/* Abstract Background Shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-colors duration-1000" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-colors duration-1000" />
      
      <div className="relative z-10 max-w-2xl">
        <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-4 py-1.5 rounded-full mb-6 text-xs font-bold tracking-widest uppercase">
          Marketplace 2.0
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
          Redefining <span className="text-emerald-400">Wholesale</span> Experience
        </h1>
        <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
          Connect with trusted suppliers, explore premium products, and scale your business with FTS Marketplace.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 transition-all hover:translate-y-[-2px] active:translate-y-0">
            Explore All Products
          </Button>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-700 text-white hover:bg-slate-800 font-bold text-lg transition-all hover:translate-y-[-2px]">
            Become a Supplier
          </Button>
        </div>
      </div>

      {/* Decorative Image/Element */}
      <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center p-12">
        <div className="relative w-full aspect-square animate-pulse-slow">
           <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl rotate-12 blur-2xl" />
           <div className="relative z-10 w-full h-full border-2 border-white/10 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/50">
                <Package className="h-10 w-10 text-white" />
              </div>
              <p className="text-2xl font-black text-white">5000+</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Premium Products</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryStrip = ({ 
  categories, 
  selected, 
  onSelect 
}: { 
  categories: any[], 
  selected: string, 
  onSelect: (id: string) => void 
}) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide no-scrollbar">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
          selected === "all" 
            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
            : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
        )}
      >
        All Products
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id.toString())}
          className={cn(
            "shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
            selected === cat.id.toString() 
              ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20" 
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
