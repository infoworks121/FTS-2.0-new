import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { formatINR } from "@/lib/mockData";
import { useState } from "react";

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const [coupon, setCoupon] = useState("");

  const subtotal = items.reduce((s, i) => s + i.product.sellingPrice * i.quantity, 0);
  const delivery = subtotal > 5000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">Looks like you haven't added anything yet. Explore our marketplace!</p>
        <Button size="lg" asChild><Link to="/marketplace">Start Shopping <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart <span className="text-muted-foreground font-normal text-base">({items.length} items)</span></h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.product.id} className="card-base p-5 flex gap-4 hover:shadow-md transition-all duration-200">
              <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden shrink-0 shadow-sm">
                <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/marketplace/product/${item.product.id}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2">{item.product.name}</Link>
                {item.variant && <p className="text-xs text-muted-foreground mt-0.5">Variant: {item.variant}</p>}
                <p className="font-bold font-mono text-base mt-1.5">{formatINR(item.product.sellingPrice)}</p>
                <div className="flex items-center gap-1 mt-3">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                  <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <p className="font-bold font-mono text-lg">{formatINR(item.product.sellingPrice * item.quantity)}</p>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-9 w-9 rounded-lg" onClick={() => removeItem(item.product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card-base p-6 sticky top-20 space-y-5 shadow-md">
            <h2 className="font-bold text-lg">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono font-medium">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-mono font-medium">{delivery === 0 ? <span className="text-profit font-bold">FREE</span> : formatINR(delivery)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (5%)</span><span className="font-mono font-medium">{formatINR(tax)}</span></div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span className="font-mono">{formatINR(total)}</span></div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Coupon / Referral code" value={coupon} onChange={e => setCoupon(e.target.value)} className="rounded-xl text-sm border-2" />
              <Button variant="outline" size="sm">Apply</Button>
            </div>
            <Button size="lg" className="w-full h-12 text-base shadow-lg" asChild>
              <Link to="/checkout">Proceed to Checkout <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Truck className="h-3.5 w-3.5 text-primary" /> <span>3-5 day delivery</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-profit" /> <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
