import { Link } from "react-router-dom";
import { Package, Truck, Wallet, Users, MapPin, Pencil, ShoppingBag, AlertCircle, ArrowRight, Copy, Share2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentUser, orders, products, spendingData, formatINR, statusConfig, referrals } from "@/lib/mockData";
import { useCart } from "@/contexts/CartContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="card-base p-4 min-w-[160px] flex-1">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "18", color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold font-mono">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { addItem } = useCart();
  const activeOrder = orders.find(o => o.status === "dispatched");

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="card-base p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Welcome back, {currentUser.name.split(" ")[0]}! 👋</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {currentUser.city} — {currentUser.pincode}
              <Pencil className="h-3 w-3 ml-1 cursor-pointer hover:text-foreground transition-default" />
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" asChild><Link to="/marketplace"><ShoppingBag className="h-4 w-4 mr-1" /> Shop Now</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/orders"><Truck className="h-4 w-4 mr-1" /> Track Order</Link></Button>
          <Button size="sm" variant="outline" asChild><Link to="/complaints"><AlertCircle className="h-4 w-4 mr-1" /> Raise Complaint</Link></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        <StatCard icon={Package} label="Total Orders" value={String(orders.length)} color="#2666CF" />
        <StatCard icon={Truck} label="Active Orders" value={String(orders.filter(o => !["delivered", "cancelled", "returned"].includes(o.status)).length)} color="#F59E0B" />
        <StatCard icon={Wallet} label="Wallet Balance" value={formatINR(currentUser.walletBalance)} color="#20A060" />
        <StatCard icon={Users} label="Referral Earned" value={formatINR(referrals.reduce((s, r) => s + r.earned, 0))} color="#07C0D9" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map(order => (
              <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-default">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-mono">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.items.length} item(s) · {formatINR(order.total)}</p>
                </div>
                <span className={statusConfig[order.status].class}>{statusConfig[order.status].label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Spending Analytics */}
        <div className="card-base p-5">
          <h2 className="font-semibold mb-4">Spending Analytics</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendingData}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2666CF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2666CF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(val: number) => formatINR(val)} labelStyle={{ fontWeight: 600 }} contentStyle={{ borderRadius: 12, border: "1px solid hsl(224,16%,90%)", fontSize: 13 }} />
              <Area type="monotone" dataKey="amount" stroke="#2666CF" fill="url(#spendGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Order Tracker */}
      {activeOrder && (
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Active Order Tracker</h2>
            <Link to={`/orders/${activeOrder.id}`} className="text-sm text-primary hover:underline">View Details</Link>
          </div>
          <div className="flex items-center gap-2">
            {activeOrder.timeline.map((step, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-initial">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${step.completed ? "bg-profit text-profit-foreground" : step === activeOrder.timeline.find(s => !s.completed) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step.completed ? <CheckCircle className="h-4 w-4 text-white" /> : i + 1}
                </div>
                {i < activeOrder.timeline.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${step.completed ? "bg-profit" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {activeOrder.timeline.map((step, i) => (
              <span key={i} className="text-[10px] text-muted-foreground text-center" style={{ width: i === activeOrder.timeline.length - 1 ? "auto" : undefined, flex: i === activeOrder.timeline.length - 1 ? "none" : 1 }}>
                {step.step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Featured Products</h2>
          <Link to="/marketplace" className="text-sm text-primary hover:underline flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {products.slice(0, 5).map(product => (
            <div key={product.id} className="card-base p-3 min-w-[200px] w-[200px] shrink-0 flex flex-col">
              <div className="aspect-square rounded-xl bg-muted overflow-hidden mb-3">
                <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-sm font-medium line-clamp-2 flex-1">{product.name}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-semibold font-mono text-sm">{formatINR(product.sellingPrice)}</span>
                <span className="text-xs text-muted-foreground line-through font-mono">{formatINR(product.mrp)}</span>
              </div>
              <Button size="sm" className="mt-2 w-full rounded-lg" onClick={() => { addItem(product); toast.success("Added to cart"); }}>
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Strip */}
      <div className="card-base p-5 bg-gradient-to-r from-primary/5 to-cyan/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-semibold mb-1">Refer & Earn</h2>
            <p className="text-sm text-muted-foreground">Share your referral code and earn on every order</p>
            <div className="flex items-center gap-2 mt-3">
              <code className="font-mono text-lg font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">{currentUser.referralCode}</code>
              <Button size="icon" variant="outline" className="rounded-lg" onClick={() => { navigator.clipboard.writeText(currentUser.referralCode); toast.success("Code copied!"); }}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-lg">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{referrals.length}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-profit">{formatINR(referrals.reduce((s, r) => s + r.earned, 0))}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
