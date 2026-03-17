import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Download, Eye, ShieldAlert, TrendingUp } from "lucide-react";
import { b2bOrders } from "./orderData";

const capClass: Record<string, string> = {
  Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function B2BOrders() {
  const total = b2bOrders.reduce((sum, row) => sum + row.totalValue, 0);
  const avgMargin = b2bOrders.reduce((sum, row) => sum + row.margin, 0) / b2bOrders.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">B2B Orders</h1>
          <p className="text-sm text-muted-foreground">Business-to-business trade monitoring with cap and referral visibility</p>
        </div>
        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="B2B Volume" value={`₹${total.toLocaleString("en-IN")}`} icon={Building2} variant="trust" />
        <KPICard title="Average Margin" value={`${avgMargin.toFixed(2)}%`} icon={TrendingUp} variant="profit" />
        <KPICard title="High Cap Impact" value={String(b2bOrders.filter((x) => x.capImpact === "High").length)} icon={ShieldAlert} variant="warning" />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cap Impact</TableHead>
                <TableHead>Referral Linkage</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {b2bOrders.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.buyer}</TableCell>
                  <TableCell>{row.seller}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell className="text-right">{row.quantity}</TableCell>
                  <TableCell className="text-right font-mono">{row.margin.toFixed(2)}%</TableCell>
                  <TableCell className="text-right font-mono">₹{row.totalValue.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell><Badge className={capClass[row.capImpact]}>{row.capImpact}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.referralLinked ? "Linked" : "Not Linked"}</Badge>
                  </TableCell>
                  <TableCell>{row.sla}</TableCell>
                  <TableCell><Button variant="ghost" size="sm"><Eye className="mr-1 h-4 w-4" />View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

