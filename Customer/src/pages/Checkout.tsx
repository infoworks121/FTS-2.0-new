import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, MapPin, CreditCard, Package, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { addresses, formatINR, currentUser } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(addresses[0].id);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [useWallet, setUseWallet] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = items.reduce((s, i) => s + i.product.sellingPrice * i.quantity, 0);
  const delivery = subtotal > 5000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;
  const walletDeduction = useWallet ? Math.min(currentUser.walletBalance, total) : 0;
  const remaining = total - walletDeduction;

  const steps = [
    { num: 1, label: "Address", icon: MapPin },
    { num: 2, label: "Review", icon: Package },
    { num: 3, label: "Payment", icon: CreditCard },
  ];

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="w-24 h-24 rounded-full bg-profit/10 flex items-center justify-center mb-6 animate-check-bounce shadow-lg shadow-profit/20">
          <Check className="h-12 w-12 text-profit" strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-extrabold mb-3">Order Placed Successfully!</h2>
        <p className="font-mono text-xl text-primary font-bold mb-1">FTS-{Math.floor(100000 + Math.random() * 900000)}</p>
        <p className="text-sm text-muted-foreground mb-8">Estimated delivery: 3-5 business days</p>
        <div className="flex gap-3">
          <Button size="lg" asChild><Link to="/orders">Track Order <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
          <Button variant="outline" size="lg" asChild><Link to="/marketplace">Continue Shopping</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
              step > s.num ? "bg-profit/10 text-profit shadow-sm" : step === s.num ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-muted text-muted-foreground")}>
              {step > s.num ? <Check className="h-4 w-4" strokeWidth={3} /> : <s.icon className="h-4 w-4" />}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={cn("w-10 md:w-20 h-1 mx-2 rounded-full transition-all", step > s.num ? "bg-profit" : "bg-muted")} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Select Delivery Address</h2>
          {addresses.map(addr => (
            <button key={addr.id} onClick={() => setSelectedAddress(addr.id)}
              className={cn("card-base p-5 w-full text-left transition-all duration-200 hover:shadow-md", selectedAddress === addr.id ? "ring-2 ring-primary shadow-md shadow-primary/10 bg-primary/3" : "hover:border-primary/20")}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{addr.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                </div>
                {addr.isDefault && <span className="status-primary">Default</span>}
              </div>
            </button>
          ))}
          <Button size="lg" onClick={() => setStep(2)}>Continue to Review <ArrowRight className="h-4 w-4 ml-1" /></Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Review Your Order</h2>
          <div className="card-base p-5 space-y-4 shadow-sm">
            {items.map(item => (
              <div key={item.product.id} className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0 shadow-sm">
                  <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-mono text-sm font-bold">{formatINR(item.product.sellingPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="card-base p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold">Delivery Address</p>
            </div>
            <p className="text-sm text-muted-foreground ml-6">{addresses.find(a => a.id === selectedAddress)?.line1}, {addresses.find(a => a.id === selectedAddress)?.city}</p>
          </div>
          <div className="card-base p-5 bg-company/5 border-company/20 shadow-sm">
            <p className="text-sm font-medium">📦 Your order will be fulfilled by <strong>FTS Central Warehouse</strong></p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>Back</Button>
            <Button size="lg" onClick={() => setStep(3)}>Continue to Payment <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold">Payment</h2>
          <div className="space-y-3">
            {[{ val: "online", label: "Online Payment", desc: "UPI / Card / Net Banking", icon: "💳" }, { val: "wallet", label: "Wallet Balance", desc: formatINR(currentUser.walletBalance), icon: "👛" }, { val: "cod", label: "Cash on Delivery", desc: "Pay when delivered", icon: "💵" }].map(opt => (
              <button key={opt.val} onClick={() => setPaymentMethod(opt.val)}
                className={cn("card-base p-5 w-full text-left transition-all duration-200 hover:shadow-md", paymentMethod === opt.val ? "ring-2 ring-primary shadow-md shadow-primary/10 bg-primary/3" : "hover:border-primary/20")}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {paymentMethod !== "wallet" && (
            <label className="flex items-center gap-3 text-sm cursor-pointer card-base p-4 hover:shadow-sm transition-all">
              <input type="checkbox" checked={useWallet} onChange={e => setUseWallet(e.target.checked)} className="rounded accent-primary w-4 h-4" />
              <span className="font-medium">Use wallet balance ({formatINR(currentUser.walletBalance)})</span>
            </label>
          )}
          <div className="card-base p-5 space-y-3 text-sm shadow-md">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono font-medium">{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-mono font-medium">{delivery === 0 ? <span className="text-profit font-bold">FREE</span> : formatINR(delivery)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-mono font-medium">{formatINR(tax)}</span></div>
            {walletDeduction > 0 && <div className="flex justify-between text-profit font-bold"><span>Wallet</span><span className="font-mono">-{formatINR(walletDeduction)}</span></div>}
            <div className="border-t pt-3 flex justify-between font-bold text-xl"><span>Total</span><span className="font-mono text-primary">{formatINR(remaining)}</span></div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(2)}>Back</Button>
            <Button size="lg" className="flex-1 h-14 text-base shadow-lg" onClick={() => { setOrderPlaced(true); clearCart(); toast.success("Order placed successfully!"); }}>
              <ShieldCheck className="h-5 w-5" /> Place Order — {formatINR(remaining)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
