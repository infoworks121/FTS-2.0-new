import { Clock3, PackageCheck, ShieldCheck, Timer } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetricInfoTooltip, ReadOnlyPerformanceNotice, slaComplianceRows, slaSummary } from "@/components/businessman/PerformancePrimitives";

function SlaStatusBadge({ status }: { status: "Pass" | "Fail" | "At Risk" }) {
  const styles = {
    Pass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    "At Risk": "border-amber-500/30 bg-amber-500/10 text-amber-500",
    Fail: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  } as const;

  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}

export default function SlaStatusPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">SLA Status</h1>
          <p className="text-sm text-muted-foreground">Delivery, inventory, and fulfilment discipline overview with early breach visibility.</p>
        </div>
        <div className="w-full sm:w-[220px]">
          <Select defaultValue="Last 30 Days">
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
              <SelectItem value="Last 60 Days">Last 60 Days</SelectItem>
              <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ReadOnlyPerformanceNotice />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="On-Time Delivery Rate" value={`${slaSummary.onTimeDeliveryRate}%`} icon={PackageCheck} variant="trust" />
        <KPICard title="Order Acceptance Time Avg" value={`${slaSummary.orderAcceptanceMinutes} mins`} icon={Timer} variant="warning" />
        <KPICard title="Inventory Availability %" value={`${slaSummary.inventoryAvailability}%`} icon={Clock3} variant="cap" />
        <KPICard title="SLA Score (0-100)" value={`${slaSummary.slaScore}`} icon={ShieldCheck} variant="profit" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            SLA Compliance Table
            <MetricInfoTooltip
              label="SLA Definitions"
              description="Pass: compliant, At Risk: near breach, Fail: violation. Yellow and red are attention states only."
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SLA Type</TableHead>
                  <TableHead>Required Value</TableHead>
                  <TableHead>Actual Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slaComplianceRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.slaType}</TableCell>
                    <TableCell className="font-mono text-xs">{row.required}</TableCell>
                    <TableCell className="font-mono text-xs">{row.actual}</TableCell>
                    <TableCell>
                      <SlaStatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

