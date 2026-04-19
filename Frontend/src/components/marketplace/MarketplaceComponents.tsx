import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link, useNavigate } from "react-router-dom";
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
  Truck,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { IMAGE_BASE_URL } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
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
  fulfiller_type?: string;
  source_district_id?: number;
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLocal = product.fulfiller_type !== 'admin' && user?.district_id === product.source_district_id;
  const detailUrl = (() => {
    if (product.slug) return `/products-issued/${product.slug}`;
    const cleanName = (product.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const suffix = product.sku ? `-${product.sku.toLowerCase()}` : '';
    return `/products-issued/${cleanName}${suffix}`;
  })();

  const discount = product.mrp && Number(product.mrp) > Number(product.selling_price)
    ? Math.round(((Number(product.mrp) - Number(product.selling_price)) / Number(product.mrp)) * 100)
    : 0;

  return (
    <Card className="group relative overflow-hidden border-slate-100/80 hover:border-primary/30 transition-all duration-500 hover:shadow-md rounded-xl bg-white shadow-sm ring-1 ring-slate-200/5 hover:ring-primary/5">
      <Link to={detailUrl} className="absolute inset-0 z-10" aria-label={`View details for ${product.name}`} />
      
      {/* Dynamic Image Container */}
      <div className="relative aspect-video overflow-hidden bg-slate-50/50 flex items-center justify-center p-4 group-hover:bg-white transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url.startsWith('http') ? product.thumbnail_url : `${IMAGE_BASE_URL}${product.thumbnail_url}`}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <Package className="h-12 w-12 text-slate-200" />
        )}

        {/* Premium Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {product.fulfiller_type === 'admin' ? (
            <span className="bg-slate-900 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-black/10 border border-white/10">
              Admin Exclusive
            </span>
          ) : isLocal ? (
            <span className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 border border-blue-400/20">
              Local Stock
            </span>
          ) : (
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 border border-amber-400/20">
              Outbound
            </span>
          )}
          
          <div className="flex gap-1">
            {product.isNew && (
              <span className="bg-white/90 backdrop-blur-md text-blue-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border border-blue-100">
                New
              </span>
            )}
            {product.isTrending && (
              <span className="bg-white/90 backdrop-blur-md text-orange-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border border-orange-100">
                Trending
              </span>
            )}
          </div>
        </div>

        {/* Discount Tag */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-emerald-500 text-white h-10 w-10 rounded-full flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20 border-2 border-white ring-1 ring-emerald-100">
              <span className="text-[10px] font-black leading-none">{discount}%</span>
              <span className="text-[7px] font-bold uppercase tracking-tighter">Off</span>
            </div>
          </div>
        )}

        {/* Hover Action Gradient Overlays */}
        <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex gap-2 z-20">
          <Button
            size="sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 h-8 text-[10px] font-bold rounded-lg shadow-sm"
          >
            <ShoppingCart className="h-3 w-3 mr-1.5" /> Cart
          </Button>
          {onQuickList && (
            <Button
              size="sm"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickList(product); }}
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-8 text-[10px] font-bold rounded-lg border-none shadow-sm"
            >
              <TrendingUp className="h-3 w-3 mr-1.5" /> List
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-3 pt-2">
        <div className="space-y-1.5 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.category_name}</span>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">
              <Star className="h-2 w-2 fill-amber-500 text-amber-500" />
              <span className="text-[9px] font-black text-amber-700">{product.rating || "4.5"}</span>
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors duration-300">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1.5 group/biz">
            <div className="p-0.5 rounded bg-slate-50 border border-slate-100 group-hover/biz:bg-emerald-50 group-hover/biz:border-emerald-100 transition-colors">
              <Building2 className="h-2.5 w-2.5 text-slate-400 group-hover/biz:text-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 truncate group-hover/biz:text-slate-700 transition-colors">{product.business_name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tight">{formatCurrency(product.selling_price)}</span>
              {discount > 0 && (
                <span className="text-[10px] text-slate-300 line-through font-bold">{formatCurrency(product.mrp)}</span>
              )}
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Price Per {product.unit}</span>
          </div>
          
          <div className="relative z-20">
            <Button
              size="sm"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBuyNow(product); }}
              className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 hover:scale-110 active:scale-95 text-white p-0 shadow-lg shadow-primary/10 transition-all duration-300"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
            </Button>
          </div>
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLocal = product.fulfiller_type !== 'admin' && user?.district_id === product.source_district_id;
  const detailUrl = `/products-issued/${product.slug || product.sku}`;

  return (
    <Card className="group overflow-hidden border-slate-100 hover:border-primary/20 transition-all duration-500 hover:shadow-md rounded-xl bg-white shadow-sm relative ring-1 ring-slate-200/5 hover:ring-primary/5">
      <Link to={detailUrl} className="absolute inset-0 z-10" aria-label={`View details for ${product.name}`} />
      <CardContent className="p-3">
        <div className="flex gap-4">
          <div className="w-24 aspect-square bg-slate-50/80 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-3 relative group-hover:bg-white transition-colors duration-500">
            {product.thumbnail_url ? (
              <img
                src={product.thumbnail_url.startsWith('http') ? product.thumbnail_url : `${IMAGE_BASE_URL}${product.thumbnail_url}`}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <Package className="h-8 w-8 text-slate-200" />
            )}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
              <span className="bg-white/90 backdrop-blur-md text-[7px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 px-1.5 py-0.5 rounded-full shadow-sm">
                {product.category_name}
              </span>
            </div>
            {product.isTrending && (
              <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                <TrendingUp className="h-2.5 w-2.5" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-0.5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
                      {product.name}
                    </h2>
                    {product.fulfiller_type === 'admin' ? (
                      <Badge className="bg-slate-900 text-[6px] h-3 px-1.5 uppercase tracking-tighter">Admin</Badge>
                    ) : isLocal ? (
                      <Badge className="bg-blue-600 text-[6px] h-3 px-1.5 uppercase tracking-tighter">Local</Badge>
                    ) : null}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-slate-400 text-[10px] font-bold">
                    <div className="flex items-center gap-1 group/biz">
                      <Building2 className="h-2.5 w-2.5 text-slate-300 group-hover/biz:text-emerald-500 transition-colors" />
                      <span className="text-slate-500 truncate max-w-[120px]">{product.business_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-slate-300" />
                      <span className="truncate max-w-[180px]">{product.business_address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                    {formatCurrency(product.selling_price)}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-black tracking-widest">per {product.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-100 gap-1">
                  <Star className="h-2.5 w-2.5 fill-current" /> {product.rating || "4.5"}
                </div>
                <div className="flex items-center bg-slate-50 text-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-100 gap-1">
                   <Package className="h-2.5 w-2.5" /> {product.available_stock}
                </div>
                {product.available_stock < 20 && (
                  <div className="animate-pulse bg-rose-50 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-rose-100 tracking-widest uppercase">
                    Low Stock
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3">
              <Button
                size="sm"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBuyNow(product); }}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 h-7 text-[10px] font-black uppercase tracking-widest shadow-sm relative z-20 transition-all active:scale-95"
              >
                Buy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
                className="rounded-lg px-4 h-7 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-[10px] font-bold uppercase tracking-widest relative z-20 transition-all shadow-sm active:scale-95"
              >
                Cart
              </Button>
              {onQuickList && (
                <Button
                  size="sm"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickList(product); }}
                  className="rounded-lg px-4 h-7 bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] font-bold uppercase tracking-widest relative z-20 transition-all shadow-sm active:scale-95"
                >
                  List
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
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
      title: "VIRTUAL DISTRIBUTION NETWORK",
      subtitle: "Enterprise Wholesale Solution",
      description: "Direct access to original source products with verified fulfillment quality protocols.",
      icon: ShieldCheck,
      color: "bg-blue-600",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
      accent: "text-blue-400"
    },
    {
      title: "PRECISION STOCK TRACKING",
      subtitle: "Real-time Inventory Management",
      description: "Monitor your assignments and inventory with state-of-the-art cryptographic precision.",
      icon: Zap,
      color: "bg-emerald-600",
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800",
      accent: "text-emerald-400"
    },
    {
      title: "SCALABLE LOGISTICS ENGINE",
      subtitle: "Integrated Supply Chain",
      description: "Expand your reach throughout the district with FTS automated routing and dealer support.",
      icon: TrendingUp,
      color: "bg-indigo-600",
      image: "https://images.unsplash.com/photo-1494412574743-019475a77671?auto=format&fit=crop&q=80&w=800",
      accent: "text-indigo-400"
    }
  ];

  return (
    <div className="space-y-6 mb-12">
      <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-black/5 border border-slate-100" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-[180px] md:h-[220px]" key={index}>
              {/* Background with Overlay */}
              <div className="absolute inset-0">
                <img 
                  src={slide.image} 
                  alt="" 
                  className="w-full h-full object-cover grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-1000"
                />
                <div className={cn("absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent")} />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center px-10 md:px-20">
                <div className="max-w-xl space-y-4 animate-in slide-in-from-left duration-700">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md border border-white/5", slide.accent)}>
                      {slide.subtitle}
                    </span>
                  </div>
                  
                  <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter leading-none mb-1">
                    {slide.title}
                  </h2>
                  
                  <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed max-w-sm line-clamp-2">
                    {slide.description}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-2">
                     <Button className={cn("px-5 py-2 h-9 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-2xl transition-all hover:scale-105 active:scale-95", slide.color)}>
                        Explore
                     </Button>
                     <Button variant="outline" className="px-5 py-2 h-9 rounded-xl font-black uppercase tracking-widest text-[9px] bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all">
                        Notes
                     </Button>
                  </div>
                </div>
              </div>
              
              {/* Decorative side element */}
              <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                 <slide.icon className={cn("h-32 w-32 transition-transform duration-1000 group-hover:rotate-12", slide.accent)} strokeWidth={0.5} />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Pagination Indicators */}
        <div className="absolute bottom-10 left-10 md:left-20 flex gap-3 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                selectedIndex === i ? "w-12 bg-white" : "w-3 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="absolute bottom-10 right-10 md:right-20 flex gap-4 z-30">
          <Button
            variant="outline"
            size="icon"
            onClick={() => emblaApi?.scrollPrev()}
            className="rounded-2xl h-12 w-12 bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => emblaApi?.scrollNext()}
            className="rounded-2xl h-12 w-12 bg-white/5 backdrop-blur-md border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Trust Features Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
        {[
          { icon: ShieldCheck, label: "Verified Source", color: "text-emerald-500", bg: "bg-emerald-500/5" },
          { icon: Zap, label: "Instant Settlement", color: "text-amber-500", bg: "bg-amber-500/5" },
          { icon: Truck, label: "Express Logistics", color: "text-blue-500", bg: "bg-blue-500/5" },
          { icon: Activity, label: "Live Utilization", color: "text-purple-500", bg: "bg-purple-500/5" }
        ].map((feat, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all duration-300">
            <div className={cn("p-2 rounded-xl", feat.bg)}>
              <feat.icon className={cn("h-4 w-4", feat.color)} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-700">{feat.label}</span>
          </div>
        ))}
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
    <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1 py-1">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95",
          selected === "all"
            ? "bg-primary text-white shadow-xl shadow-primary/20 ring-4 ring-primary/10"
            : "bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm"
        )}
      >
        Universal Access
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id.toString())}
          className={cn(
            "shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95",
            selected === cat.id.toString()
              ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 ring-4 ring-emerald-500/10"
              : "bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-sm"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};
