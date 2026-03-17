import { AlertTriangle, History, PauseCircle, Scale } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertFirstHeader, SeverityBadge } from "@/components/risk/RiskPrimitives";

const rows = [
  {
    entity: "Core Body North",
    capLimit: 500000,
    current: 582400,
    excess: 82400,
    status: "Auto-Stopped",
    severity: "critical" as const,
    history: "3 breaches in 60 days",
  },
  {
    entity: "User: Priyansh D.",
    capLimit: 75000,
    current: 80800,
    excess: 5800,
    status: "Flagged",
    severity: "high" as const,
    history: "1 breach in 30 days",
  },
  {
    entity: "Core Body East",
    capLimit: 500000,
    current: 471200,
    excess: 0,
    status: "Within Limit",
    severity: "low" as const,
    history: "No recent breach",
  },
];

export default function CapViolationReports() {
  return (
    <div className="space-y-6">
      <AlertFirstHeader
        title="Cap Violation Reports"
        description="Enforce earning limits with automatic stop controls, excess routing previews, and breach history."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Cap Breaches" value="8" icon={AlertTriangle} variant="warning" />
        <KPICard title="Auto-Stops Triggered" value="5" icon={PauseCircle} variant="cap" />
        <KPICard title="Excess Routed" value="₹2.81L" icon={Scale} variant="trust" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User / Core Body</TableHead>
              <TableHead>Cap Limit</TableHead>
              <TableHead>Current Earnings</TableHead>
              <TableHead>Cap Usage</TableHead>
              <TableHead>Excess Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Historical Breach</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const usage = Math.round((row.current / row.capLimit) * 100);
              return (
                <TableRow key={row.entity}>
                  <TableCell className="font-medium">{row.entity}</TableCell>
                  <TableCell className="font-mono">₹{row.capLimit.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="font-mono">₹{row.current.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={Math.min(usage, 100)} className="h-2" />
                      <p className="text-xs text-muted-foreground">{usage}% used</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">₹{row.excess.toLocaleString("en-IN")}</TableCell>
                  <TableCell><SeverityBadge severity={row.severity} /></TableCell>
                  <TableCell className="text-xs">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <History className="h-3.5 w-3.5" /> {row.history}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

