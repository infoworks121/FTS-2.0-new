import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, Zap, Timer, Sprout, Droplets, Wrench, Bug, Cpu, Headphones, Beef, ArrowRight, Star, TrendingUp, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { products, categories, formatINR } from "@/lib/mockData";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import banner1 from "@/assets/banner1.jpg";
import banner2 from "@/assets/banner2.jpg";
import banner3 from "@/assets/banner3.jpg";

const banners = [
  { img: banner1, title: "Farm Essentials Sale", subtitle: "Up to 40% off on Seeds & Fertilizers", cta: "Shop Now", color: "from-green-900/80" },
  { img: banner2, title: "Smart Farming Tech", subtitle: "IoT Kits, Drones & Sensors", cta: "Explore", color: "from-blue-900/80" },
  { img: banner3, title: "Organic Range", subtitle: "100% Natural Products for Your Farm", cta: "Browse", color: "from-orange-900/80" },
];

const categoryIcons: Record<string, any> = {
  Seeds: Sprout, Fertilizers: Droplets, "Farm Tools": Wrench, Pesticides: Bug,
  Machinery: Wrench, "Livestock Feed": Beef, AgriTech: Cpu, Services: Headphones,
};

const dealProducts = products.filter(p => p.inStock).slice(0, 6);
const trendingProducts = [...products].filter(p => p.inStock).reverse().slice(0, 6);

export default function Marketplace() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    const interval = setInterval(() => setCurrentBanner(prev => (prev + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const ProductCard = ({ product }: { product: typeof products[0] }) => {
    const discount = Math.round((1 - product.sellingPrice / product.mrp) * 100);
    return (
      <div className="card-base overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <Link to={`/marketplace/product/${product.id}`} className="relative">
          <div className="aspect-square bg-muted overflow-hidden">
            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" loading="lazy" />
          </div>
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-3">
            <div className="flex gap-1.5">
              <span className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-all">
                <Heart className="h-3.5 w-3.5 text-foreground" />
              </span>
              <span className="w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition-all">
                <Eye className="h-3.5 w-3.5 text-foreground" />
              </span>
            </div>
          </div>
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
              <span className="status-destructive text-xs font-bold">Out of Stock</span>
            </div>
          )}
          {product.type === "subscription" && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-trust text-white text-[10px] font-semibold shadow-sm">Subscription</span>
          )}
          {discount > 0 && (
            <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-destructive text-destructive-foreground text-[10px] font-bold shadow-sm">
              -{discount}%
            </span>
          )}
        </Link>
        <div className="p-3.5 flex flex-col flex-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-1">{product.category}</span>
          <Link to={`/marketplace/product/${product.id}`}>
            <p className="text-sm font-semibold line-clamp-2 hover:text-primary transition-all duration-200 leading-snug">{product.name}</p>
          </Link>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-bold font-mono text-foreground">{formatINR(product.sellingPrice)}</span>
            <span className="text-xs text-muted-foreground line-through font-mono">{formatINR(product.mrp)}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5">{product.unit}</span>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-profit/10 text-profit text-[11px] font-bold">
              4.2 <Star className="h-2.5 w-2.5 fill-current" />
            </div>
            <span className="text-[10px] text-muted-foreground">(128)</span>
          </div>
          <Button size="sm" className="mt-3 w-full" disabled={!product.inStock}
            onClick={(e) => { e.preventDefault(); addItem(product); toast.success(`${product.name} added to cart`); }}>
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-8">
      {/* === HERO BANNER CAROUSEL === */}
      <div className="relative overflow-hidden rounded-b-3xl shadow-lg">
        <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
          {banners.map((banner, i) => (
            <div key={i} className="w-full shrink-0 relative">
              <img src={banner.img} alt={banner.title} className="w-full h-[220px] sm:h-[300px] md:h-[380px] object-cover" width={1440} height={512} />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} to-transparent flex items-center`}>
                <div className="px-8 md:px-14 max-w-lg">
                  <h2 className="text-white text-2xl md:text-5xl font-extrabold mb-3 leading-tight drop-shadow-lg">{banner.title}</h2>
                  <p className="text-white/85 text-sm md:text-lg mb-5 drop-shadow">{banner.subtitle}</p>
                  <Button size="lg" className="bg-white text-foreground hover:bg-white/90 shadow-xl hover:shadow-2xl border-0" asChild>
                    <Link to="/marketplace/browse">{banner.cta} <ArrowRight className="h-4 w-4 ml-1" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrentBanner(i)}
              className={cn("h-2 rounded-full transition-all duration-300", i === currentBanner ? "bg-white w-8 shadow" : "bg-white/40 w-2 hover:bg-white/60")} />
          ))}
        </div>
        <button onClick={() => setCurrentBanner((currentBanner - 1 + banners.length) % banners.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hidden sm:flex">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => setCurrentBanner((currentBanner + 1) % banners.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hidden sm:flex">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* === CATEGORY STRIP === */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between overflow-x-auto py-4 px-4 gap-1">
            {categories.map(cat => {
              const Icon = categoryIcons[cat.name] || Sprout;
              return (
                <Link key={cat.id} to={`/marketplace/browse?category=${cat.id}`}
                  className="flex flex-col items-center gap-2 min-w-[80px] px-3 py-2 rounded-xl hover:bg-primary/5 transition-all duration-200 group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-center whitespace-nowrap group-hover:text-primary transition-colors">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* === DEALS OF THE DAY === */}
        <section className="mt-8">
          <div className="card-base overflow-hidden shadow-md">
            <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-primary/8 via-primary/3 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Deals of the Day</h2>
                  <p className="text-xs text-muted-foreground">Grab before they're gone</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold ml-2">
                  <Timer className="h-3.5 w-3.5" />
                  <span>12h 34m left</span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/marketplace/browse">View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide">
              {dealProducts.map((product, i) => (
                <Link key={product.id} to={`/marketplace/product/${product.id}`}
                  className={cn("shrink-0 w-[190px] md:w-[210px] p-5 flex flex-col items-center text-center hover:bg-primary/3 transition-all duration-300 group", i < dealProducts.length - 1 && "border-r")}>
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" loading="lazy" />
                  </div>
                  <p className="text-sm font-semibold line-clamp-2 mb-1.5">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-sm">{formatINR(product.sellingPrice)}</span>
                    <span className="text-xs text-muted-foreground line-through font-mono">{formatINR(product.mrp)}</span>
                  </div>
                  <span className="text-xs text-profit font-bold mt-1 bg-profit/10 px-2 py-0.5 rounded-full">{Math.round((1 - product.sellingPrice / product.mrp) * 100)}% off</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* === PROMOTIONAL BANNERS ROW === */}
        <section className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-2xl overflow-hidden relative h-40 md:h-48 bg-gradient-to-br from-profit/20 via-profit/10 to-profit/5 p-6 flex flex-col justify-end cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-profit/10">
            <div className="w-12 h-12 rounded-xl bg-profit/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sprout className="h-6 w-6 text-profit" />
            </div>
            <p className="font-bold text-base">Seeds Collection</p>
            <p className="text-sm text-muted-foreground mt-0.5">Starting ₹99</p>
          </div>
          <div className="rounded-2xl overflow-hidden relative h-40 md:h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-6 flex flex-col justify-end cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-primary/10">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <p className="font-bold text-base">Smart Farm Tech</p>
            <p className="text-sm text-muted-foreground mt-0.5">Up to 30% off</p>
          </div>
          <div className="rounded-2xl overflow-hidden relative h-40 md:h-48 bg-gradient-to-br from-warning/20 via-warning/10 to-warning/5 p-6 flex flex-col justify-end cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-warning/10 hidden md:flex">
            <div className="w-12 h-12 rounded-xl bg-warning/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="h-6 w-6 text-warning" />
            </div>
            <p className="font-bold text-base">Farm Tools</p>
            <p className="text-sm text-muted-foreground mt-0.5">Best Prices</p>
          </div>
        </section>

        {/* === TRENDING PRODUCTS === */}
        <section className="mt-8">
          <div className="card-base overflow-hidden shadow-md">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Trending Now</h2>
                  <p className="text-xs text-muted-foreground">Most popular this week</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/marketplace/browse">View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide">
              {trendingProducts.map((product, i) => (
                <Link key={product.id} to={`/marketplace/product/${product.id}`}
                  className={cn("shrink-0 w-[190px] md:w-[210px] p-5 flex flex-col items-center text-center hover:bg-primary/3 transition-all duration-300 group", i < trendingProducts.length - 1 && "border-r")}>
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" loading="lazy" />
                  </div>
                  <p className="text-sm font-semibold line-clamp-2 mb-1.5">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-sm">{formatINR(product.sellingPrice)}</span>
                    <span className="text-xs text-muted-foreground line-through font-mono">{formatINR(product.mrp)}</span>
                  </div>
                  <span className="text-xs text-profit font-bold mt-1 bg-profit/10 px-2 py-0.5 rounded-full">{Math.round((1 - product.sellingPrice / product.mrp) * 100)}% off</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* === SHOP BY CATEGORY GRID === */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-bold">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map(cat => {
              const Icon = categoryIcons[cat.name] || Sprout;
              return (
                <Link key={cat.id} to={`/marketplace/browse?category=${cat.id}`}
                  className="card-base p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 group-hover:from-primary/25 group-hover:to-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.subCategories.length} sub-categories</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* === ALL PRODUCTS GRID === */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-bold">Recommended For You</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/marketplace/browse">Browse All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* === REFERRAL BANNER === */}
        <section className="mt-8 mb-4">
          <div className="card-base p-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border-primary/10">
            <div>
              <h3 className="text-xl font-bold">Refer a Friend & Earn ₹500</h3>
              <p className="text-sm text-muted-foreground mt-1.5">Share FTS with fellow farmers and earn on every order they place</p>
            </div>
            <Button size="lg" className="shrink-0 shadow-lg" asChild>
              <Link to="/referrals">Start Earning <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
