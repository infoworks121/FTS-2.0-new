import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock3, Download, Route, Star, Truck } from "lucide-react";
import { b2cOrders } from "./orderData";

const deliveryClass: Record<string, string> = {
  Assigned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Out for Delivery": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function B2COrders() {
  const delivered = b2cOrders.filter((x) => x.deliveryStatus === "Delivered").length;
  const totalAmount = b2cOrders.reduce((sum, x) => sum + x.totalAmount, 0);

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
        <KPICard title="B2C Orders" value={String(b2cOrders.length)} icon={Truck} />
        <KPICard title="Delivered" value={String(delivered)} icon={Star} variant="profit" />
        <KPICard title="Order Amount" value={`₹${totalAmount.toLocaleString("en-IN")}`} icon={Route} variant="trust" />
        <KPICard title="Return Eligible" value={String(b2cOrders.filter((x) => x.returnWindowDays > 0).length)} icon={Clock3} variant="warning" />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Stock Point</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead>Payment Mode</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Return Window</TableHead>
              <TableHead>Fulfilment Route</TableHead>
              <TableHead>Auto Assignment</TableHead>
              <TableHead>Rating & Feedback</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {b2cOrders.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.stockPoint}</TableCell>
                <TableCell>{row.product}</TableCell>
                <TableCell><Badge className={deliveryClass[row.deliveryStatus]}>{row.deliveryStatus}</Badge></TableCell>
                <TableCell>{row.paymentMode}</TableCell>
                <TableCell className="text-right font-mono">₹{row.totalAmount.toLocaleString("en-IN")}</TableCell>
                <TableCell>{row.returnWindowDays} days</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.route}</TableCell>
                <TableCell><Badge variant="outline">{row.autoAssigned ? "Auto" : "Manual"}</Badge></TableCell>
                <TableCell>{row.rating}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

