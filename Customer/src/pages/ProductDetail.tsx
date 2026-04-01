import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Minus, Plus, ShoppingCart, Zap, Truck, RotateCcw, Building2, Shield, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products, formatINR } from "@/lib/mockData";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [pincode, setPincode] = useState("");
  const { addItem } = useCart();

  if (!product) return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <Package className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <p className="font-bold text-lg">Product not found</p>
      <Button variant="outline" className="mt-4" asChild><Link to="/marketplace">Back to Shop</Link></Button>
    </div>
  );

  const discount = Math.round((1 - product.sellingPrice / product.mrp) * 100);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link to="/marketplace" className="hover:text-primary transition-colors font-medium">Marketplace</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{product.category}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl bg-muted overflow-hidden group cursor-zoom-in shadow-md">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
          </div>
          <div className="flex gap-2.5">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={cn("w-18 h-18 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:shadow-md", selectedImage === i ? "border-primary shadow-md shadow-primary/20 scale-105" : "border-transparent opacity-70 hover:opacity-100")}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-profit/10 text-profit text-xs font-bold">
                4.2 <Star className="h-3 w-3 fill-current" />
              </div>
              <span className="text-xs text-muted-foreground">(128 ratings)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground font-mono mt-2">SKU: {product.sku}</p>
          </div>

          <div className="card-base p-4 bg-primary/3 border-primary/10">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-mono text-primary">{formatINR(product.sellingPrice)}</span>
              <span className="text-lg text-muted-foreground line-through font-mono">{formatINR(product.mrp)}</span>
              {discount > 0 && <span className="px-3 py-1 rounded-full bg-profit/10 text-profit text-sm font-bold">{discount}% off</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
          </div>

          {product.variants && product.variants.map(v => (
            <div key={v.name}>
              <p className="text-sm font-bold mb-2.5">{v.name}</p>
              <div className="flex gap-2.5">
                {v.options.map(opt => (
                  <button key={opt} onClick={() => setSelectedVariant(opt)}
                    className={cn("px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200", selectedVariant === opt ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10" : "border-border hover:border-primary/40 hover:bg-primary/3")}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-sm font-bold mb-2.5">Quantity</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
              <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="w-16 text-center rounded-xl h-10 font-bold border-2" />
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap gap-2">
            {product.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">#{tag}</span>
            ))}
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1 h-14 text-base shadow-lg" disabled={!product.inStock}
              onClick={() => { for (let i = 0; i < quantity; i++) addItem(product, selectedVariant); toast.success(`${quantity} item(s) added to cart`); }}>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>
            <Button variant="outline" size="lg" className="flex-1 h-14 text-base" disabled={!product.inStock} asChild>
              <Link to="/checkout"><Zap className="h-5 w-5" /> Buy Now</Link>
            </Button>
          </div>

          {/* Delivery check */}
          <div className="card-base p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold">Check Delivery</p>
            </div>
            <div className="flex gap-2.5">
              <Input placeholder="Enter pincode" value={pincode} onChange={e => setPincode(e.target.value)} className="rounded-xl border-2" />
              <Button variant="outline" onClick={() => toast.success("Delivery available in 3-5 days")}>Check</Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card-base p-3 flex flex-col items-center text-center gap-2">
              <Building2 className="h-5 w-5 text-company" />
              <span className="text-[10px] text-muted-foreground font-medium">Fulfilled by FTS</span>
            </div>
            <div className="card-base p-3 flex flex-col items-center text-center gap-2">
              <RotateCcw className="h-5 w-5 text-warning" />
              <span className="text-[10px] text-muted-foreground font-medium">7-Day Returns</span>
            </div>
            <div className="card-base p-3 flex flex-col items-center text-center gap-2">
              <Shield className="h-5 w-5 text-profit" />
              <span className="text-[10px] text-muted-foreground font-medium">Secure Payment</span>
            </div>
          </div>

          {product.subscription && (
            <div className="space-y-3">
              <h3 className="font-bold text-base">Subscription Plans</h3>
              {product.subscription.map(plan => (
                <div key={plan.cycle} className="card-base p-5 flex items-center justify-between border-trust/20 hover:border-trust/40 hover:shadow-md transition-all duration-200">
                  <div>
                    <p className="font-bold">{plan.cycle}</p>
                    <p className="text-sm text-muted-foreground">{plan.trialDays}-day free trial</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-lg">{formatINR(plan.price)}</p>
                    <Button size="sm" className="mt-1.5 bg-trust hover:bg-trust/90 text-white shadow-md shadow-trust/25">Subscribe</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
