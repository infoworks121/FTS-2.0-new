import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock3, Download, Route, Star, Truck, Loader2 } from "lucide-react";
import { orderApi } from "@/lib/orderApi";
import { useToast } from "@/components/ui/use-toast";

const deliveryClass: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  assigned: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function B2COrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getMyOrders('B2C');
        setOrders(response.orders || []);
      } catch (error) {
        console.error("Failed to fetch B2C orders:", error);
        toast({
          title: "Error",
          description: "Could not load B2C orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const deliveredCount = orders.filter((x) => x.status === "delivered").length;
  const totalAmount = orders.reduce((sum, x) => sum + parseFloat(x.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Fetching B2C Intel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">B2C Orders</h1>
          <p className="text-sm text-muted-foreground">Fulfilment-oriented customer order tracking with return eligibility visibility</p>
        </div>
        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPICard title="B2C Orders" value={String(orders.length)} icon={Truck} />
        <KPICard title="Delivered" value={String(deliveredCount)} icon={Star} variant="profit" />
        <KPICard title="Transaction Volume" value={`₹${totalAmount.toLocaleString("en-IN")}`} icon={Route} variant="trust" />
        <KPICard title="Retention Lead" value="High" icon={Clock3} variant="warning" subtitle="8.5/10 CSAT" />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Product(s)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.order_number}</TableCell>
                  <TableCell className="font-medium">{row.customer_name || "Guest"}</TableCell>
                  <TableCell>{row.district_name || "N/A"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.product_names}>
                    {row.product_names || "No items"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${deliveryClass[row.status] || "bg-muted text-muted-foreground"} border-none`}>
                      {row.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="uppercase text-[10px] font-bold">{row.payment_method}</TableCell>
                  <TableCell className="text-right font-mono font-bold">₹{parseFloat(row.total_amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No B2C orders found in the system.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
