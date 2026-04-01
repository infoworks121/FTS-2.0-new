import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Package, Truck, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orders, formatINR, statusConfig, type OrderStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const filterTabs: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned", value: "returned" },
];

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = orders.filter(o => {
    if (activeTab === "active") return !["delivered", "cancelled", "returned"].includes(o.status);
    if (activeTab !== "all") return o.status === activeTab;
    return true;
  }).filter(o => !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="flex gap-2 overflow-x-auto mb-5 scrollbar-hide">
        {filterTabs.map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={cn("px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shrink-0 shadow-sm", activeTab === tab.value ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-card border-2 border-border text-muted-foreground hover:border-primary/30 hover:text-primary")}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by order number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11 border-2 focus:border-primary/40" />
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="card-base p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="font-mono font-bold text-base">{order.orderNumber}</span>
                  <span className={statusConfig[order.status].class}>{statusConfig[order.status].label}</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-12 h-12 rounded-xl bg-muted overflow-hidden shadow-sm">
                      <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">+{order.items.length - 3}</div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{order.items.length} item(s) · <span className="font-mono font-medium text-foreground">{formatINR(order.total)}</span> · {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!["delivered", "cancelled", "returned"].includes(order.status) && (
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/orders/${order.id}/track`}><Truck className="h-3.5 w-3.5" /> Track</Link>
                  </Button>
                )}
                <Button size="sm" asChild>
                  <Link to={`/orders/${order.id}`}><Eye className="h-3.5 w-3.5" /> Details</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <Package className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="font-bold text-lg">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">Your orders will appear here</p>
            <Button className="mt-5" asChild><Link to="/marketplace">Start Shopping <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
