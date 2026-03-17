import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/KPICard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCheck, Download, Factory, ShieldCheck, Tag } from "lucide-react";
import { bulkOrders } from "./orderData";

const riskClass: Record<string, string> = {
  Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function BulkOrders() {
  const highRisk = bulkOrders.filter((o) => o.riskLevel === "High").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Bulk Orders</h1>
          <p className="text-sm text-muted-foreground">Negotiated high-volume orders with approval and exposure monitoring</p>
        </div>
        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPICard title="Bulk Orders" value={String(bulkOrders.length)} icon={Factory} />
        <KPICard title="Approved" value={String(bulkOrders.filter((x) => x.status === "Approved").length)} icon={CheckCheck} variant="profit" />
        <KPICard title="Special Pricing" value={String(bulkOrders.filter((x) => x.specialPricing).length)} icon={Tag} variant="trust" />
        <KPICard title="Risk Warnings" value={String(highRisk)} icon={AlertTriangle} variant="warning" />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead className="text-right">Negotiated Margin</TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead className="text-right">Volume</TableHead>
              <TableHead className="text-right">Final Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk & Exposure</TableHead>
              <TableHead>Admin Approval</TableHead>
              <TableHead>Special Pricing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bulkOrders.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.businessName}</TableCell>
                <TableCell className="text-right font-mono">{row.negotiatedMargin.toFixed(2)}%</TableCell>
                <TableCell>{row.approvedBy}</TableCell>
                <TableCell className="text-right">{row.volume.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right font-mono">₹{row.finalPrice.toLocaleString("en-IN")}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell><Badge className={riskClass[row.riskLevel]}>{row.riskLevel}</Badge></TableCell>
                <TableCell><Badge variant="outline"><ShieldCheck className="mr-1 h-3 w-3" />Verified</Badge></TableCell>
                <TableCell>{row.specialPricing ? <Badge>Enabled</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

