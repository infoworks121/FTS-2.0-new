import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Circle, Truck, Copy, RefreshCcw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orders } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OrderTracking() {
  const { id } = useParams();
  const order = orders.find(o => o.id === id);

  if (!order) return <div className="p-6 text-center">Order not found</div>;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <Link to={`/orders/${order.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-default">
        <ArrowLeft className="h-4 w-4" /> Back to Order
      </Link>

      <div className="card-base p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold">Track Order</h1>
            <p className="font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => toast.success("Status refreshed")}>
            <RefreshCcw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
        </div>

        {order.estimatedDelivery && (
          <div className="card-base p-4 bg-primary/5 border-primary/20 mb-6 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-lg font-bold text-primary">{new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>
        )}

        <div className="space-y-0">
          {order.timeline.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-profit shrink-0" />
                ) : i === order.timeline.findIndex(s => !s.completed) ? (
                  <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center shrink-0 animate-pulse"><div className="h-2.5 w-2.5 rounded-full bg-primary" /></div>
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/30 shrink-0" />
                )}
                {i < order.timeline.length - 1 && <div className={cn("w-0.5 flex-1 min-h-[40px]", step.completed ? "bg-profit" : "bg-muted")} />}
              </div>
              <div className="pb-6">
                <p className={cn("font-medium", !step.completed && i !== order.timeline.findIndex(s => !s.completed) && "text-muted-foreground")}>{step.step}</p>
                {step.timestamp && <p className="text-sm text-muted-foreground mt-0.5">{new Date(step.timestamp).toLocaleString("en-IN")}</p>}
              </div>
            </div>
          ))}
        </div>

        {order.carrier && (
          <div className="card-base p-4 mt-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{order.carrier}</p>
                {order.trackingNumber && (
                  <button onClick={() => { navigator.clipboard.writeText(order.trackingNumber!); toast.success("Copied!"); }}
                    className="flex items-center gap-1 text-sm text-primary hover:underline font-mono">
                    {order.trackingNumber} <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
