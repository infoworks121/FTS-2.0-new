import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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
  ChevronLeft,
  ShieldCheck,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IMAGE_BASE_URL } from "@/lib/api";

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
  onBuyNow,
  onQuickList
}: { 
  product: Product, 
  onAddToCart: (p: any) => void, 
  onBuyNow: (p: any) => void,
  onQuickList?: (p: any) => void
}) => {
  const discount = product.mrp && Number(product.mrp) > Number(product.selling_price)
    ? Math.round(((Number(product.mrp) - Number(product.selling_price)) / Number(product.mrp)) * 100)
    : 0;

  return (
    <Card className="group relative overflow-hidden border-slate-200 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-md rounded-xl bg-white shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 flex items-center justify-center p-4">
        {product.thumbnail_url ? (
          <img 
            src={product.thumbnail_url.startsWith('http') ? product.thumbnail_url : `${IMAGE_BASE_URL}${product.thumbnail_url}`} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Package className="h-10 w-10 text-slate-300" />
        )}
        
        {/* Minimal Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-blue-100">
              New
            </span>
          )}
          {product.isTrending && (
            <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-orange-100">
              Trending
            </span>
          )}
          {discount > 0 && (
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-100">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Hover Actions Bar */}
        <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-1.5">
          <Button 
            size="sm"
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 h-8 text-[11px] font-semibold"
          >
            <ShoppingCart className="h-3 w-3 mr-1.5" /> Cart
          </Button>
          {onQuickList && (
            <Button 
              size="sm"
              onClick={() => onQuickList(product)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-[11px] font-semibold border-none"
            >
              <TrendingUp className="h-3 w-3 mr-1.5" /> List
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-1 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{product.category_name}</span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="h-2.5 w-2.5 fill-current" />
              <span className="text-[10px] font-bold">{product.rating || "4.5"}</span>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{product.business_name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">{formatCurrency(product.selling_price)}</span>
            {discount > 0 && (
              <span className="text-[11px] text-slate-400 line-through font-medium">{formatCurrency(product.mrp)}</span>
            )}
          </div>
          <Button 
            size="sm"
            onClick={() => onBuyNow(product)}
            className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white p-0"
          >
            <Zap className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductCardList = ({ 
  product, 
  onAddToCart, 
  onBuyNow,
  onQuickList
}: { 
  product: Product, 
  onAddToCart: (p: any) => void, 
  onBuyNow: (p: any) => void,
  onQuickList?: (p: any) => void
}) => {
  return (
    <Card className="group overflow-hidden border-slate-200 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-sm bg-white shadow-sm rounded-xl">
      <CardContent className="p-4">
        <div className="flex gap-6">
          <div className="w-32 aspect-square bg-slate-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-3 relative">
            {product.thumbnail_url ? (
              <img 
                src={product.thumbnail_url.startsWith('http') ? product.thumbnail_url : `${IMAGE_BASE_URL}${product.thumbnail_url}`} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            ) : (
              <Package className="h-8 w-8 text-slate-200" />
            )}
            <div className="absolute top-1.5 left-1.5">
               <span className="bg-white/90 backdrop-blur-sm text-[9px] font-bold text-slate-500 uppercase tracking-tighter border border-slate-100 px-1.5 rounded">
                 {product.category_name}
               </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span className="font-medium text-slate-500">{product.business_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{product.business_address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 leading-none">
                    {formatCurrency(product.selling_price)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">per {product.unit}</p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex items-center text-amber-500 text-[10px] font-bold gap-0.5">
                  <Star className="h-3 w-3 fill-current" /> {product.rating || "4.5"}
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <div className="text-slate-500 text-[10px] font-semibold">
                   {product.available_stock} items left
                </div>
                {product.isTrending && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="text-orange-600 text-[10px] font-bold uppercase tracking-wider">
                      Trending
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button 
                size="sm"
                onClick={() => onBuyNow(product)}
                className="bg-slate-900 hover:bg-emerald-600 text-white rounded-lg px-4 h-8 text-xs font-semibold shadow-sm"
              >
                Buy Now
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAddToCart(product)}
                className="rounded-lg px-4 h-8 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Add to Cart
              </Button>
              {onQuickList && (
                <Button 
                  size="sm"
                  onClick={() => onQuickList(product)}
                  className="rounded-lg px-4 h-8 bg-emerald-600 hover:bg-emerald-700 text-white border-none text-xs font-semibold shadow-sm"
                >
                  List to B2C
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MarketplaceHero = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const slides = [
    {
      title: "Global Wholesale Network",
      description: "Direct access to original source products with verified fulfillment quality.",
      icon: ShieldCheck,
      color: "from-emerald-500/10 to-transparent"
    },
    {
      title: "Real-time Tracking",
      description: "Monitor your assignments and inventory with enterprise-grade precision.",
      icon: Truck,
      color: "from-blue-500/10 to-transparent"
    },
    {
      title: "Scalable Distribution",
      description: "Grow your reach with FTS integrated logistics and subdivision dealer support.",
      icon: TrendingUp,
      color: "from-purple-500/10 to-transparent"
    }
  ];

  return (
    <div className="space-y-4 mb-10 px-0 md:px-2">
      <div className="relative overflow-hidden group rounded-xl border border-slate-200 bg-white" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-32 md:h-40" key={index}>
              <div className={cn("absolute inset-0 bg-gradient-to-r", slide.color)} />
              <div className="relative h-full flex items-center px-8 md:px-12 gap-6">
                <div className="hidden sm:flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white border border-slate-100 shadow-sm shrink-0">
                  <slide.icon className="h-6 w-6 md:h-8 md:w-8 text-slate-700" />
                </div>
                <div className="max-w-xl">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                selectedIndex === i ? "w-6 bg-slate-900" : "w-2 bg-slate-200"
              )} 
            />
          ))}
        </div>

        {/* Controls */}
        <button 
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 backdrop-blur-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button 
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 backdrop-blur-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-100 pb-4 ml-1">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Real-time
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Direct
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
    <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide no-scrollbar">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300",
          selected === "all" 
            ? "bg-slate-900 text-white shadow-sm" 
            : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
        )}
      >
        All Products
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id.toString())}
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300",
            selected === cat.id.toString() 
              ? "bg-emerald-600 text-white shadow-sm" 
              : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
