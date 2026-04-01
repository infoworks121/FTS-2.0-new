import { useParams, Link } from "react-router-dom";
import { CheckCircle, Circle, Truck, Copy, ArrowLeft, RotateCcw, XCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orders, formatINR, statusConfig } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OrderDetail() {
  const { id } = useParams();
  const order = orders.find(o => o.id === id);

  if (!order) return <div className="p-6 text-center">Order not found</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-default">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="card-base p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono">{order.orderNumber}</h1>
              <span className={statusConfig[order.status].class}>{statusConfig[order.status].label}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Placed on {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {order.paymentMethod} · <span className={order.paymentStatus === "paid" ? "text-profit" : "text-warning"}>{order.paymentStatus}</span></p>
          </div>
          <div className="flex gap-2">
            {(order.status === "pending" || order.status === "confirmed") && (
              <Button size="sm" variant="outline" className="rounded-lg text-destructive border-destructive/30"><XCircle className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
            )}
            {order.status === "delivered" && (
              <>
                <Button size="sm" variant="outline" className="rounded-lg text-warning border-warning/30"><RotateCcw className="h-3.5 w-3.5 mr-1" /> Return</Button>
                <Button size="sm" variant="outline" className="rounded-lg"><MessageSquare className="h-3.5 w-3.5 mr-1" /> Complaint</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card-base p-5">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="font-mono text-sm font-medium">{formatINR(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card-base p-5">
        <h2 className="font-semibold mb-4">Order Timeline</h2>
        <div className="space-y-0">
          {order.timeline.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-profit shrink-0" />
                ) : i === order.timeline.findIndex(s => !s.completed) ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0"><div className="h-2 w-2 rounded-full bg-primary" /></div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                )}
                {i < order.timeline.length - 1 && <div className={cn("w-0.5 flex-1 min-h-[24px]", step.completed ? "bg-profit" : "bg-muted")} />}
              </div>
              <div className="pb-4">
                <p className={cn("text-sm font-medium", !step.completed && i !== order.timeline.findIndex(s => !s.completed) && "text-muted-foreground")}>{step.step}</p>
                {step.timestamp && <p className="text-xs text-muted-foreground">{new Date(step.timestamp).toLocaleString("en-IN")}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Financial */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-base p-5">
          <h2 className="font-semibold mb-3">Delivery Info</h2>
          <p className="text-sm">{order.deliveryAddress.name}</p>
          <p className="text-sm text-muted-foreground">{order.deliveryAddress.line1}, {order.deliveryAddress.city} — {order.deliveryAddress.pincode}</p>
          {order.carrier && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm"><Truck className="h-3.5 w-3.5 inline mr-1" /> {order.carrier}</p>
              {order.trackingNumber && (
                <button onClick={() => { navigator.clipboard.writeText(order.trackingNumber!); toast.success("Tracking number copied"); }}
                  className="flex items-center gap-1 text-sm text-primary mt-1 hover:underline">
                  <span className="font-mono">{order.trackingNumber}</span>
                  <Copy className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="card-base p-5">
          <h2 className="font-semibold mb-3">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{formatINR(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-profit"><span>Discount</span><span className="font-mono">-{formatINR(order.discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-mono">{order.delivery === 0 ? "Free" : formatINR(order.delivery)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-mono">{formatINR(order.tax)}</span></div>
            <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span className="font-mono">{formatINR(order.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
