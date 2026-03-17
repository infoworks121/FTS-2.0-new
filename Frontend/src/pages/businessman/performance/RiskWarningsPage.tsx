import { CalendarClock, ShieldAlert, Siren, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ReadOnlyPerformanceNotice,
  RiskScorePill,
  SeverityBadge,
  warningCards,
  warningHistoryRows,
} from "@/components/businessman/PerformancePrimitives";

function WarningStatusBadge({ status }: { status: "Active" | "Monitoring" | "Resolved" }) {
  const styles = {
    Active: "border-rose-500/30 bg-rose-500/10 text-rose-500",
    Monitoring: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    Resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  } as const;

  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}

export default function RiskWarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Risk & Warnings</h1>
        <p className="text-sm text-muted-foreground">
          Transparent, system-detected warning signals for monitoring and policy decisions.
        </p>
      </div>

      <ReadOnlyPerformanceNotice />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" /> Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskScorePill scoreLabel="Medium" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Siren className="h-4 w-4 text-warning" /> Active Warnings Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" /> Last Flagged Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">2026-02-14</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {warningCards.map((warning) => (
          <Card key={warning.id} className="border-border/80">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                <div>
                  <p className="text-xs text-muted-foreground">Warning Type</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <TriangleAlert className="h-3.5 w-3.5 text-warning" /> {warning.warningType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Severity</p>
                  <SeverityBadge severity={warning.severity} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trigger Reason</p>
                  <p className="text-sm">{warning.triggerReason}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">System Action</p>
                  <p className="text-sm font-medium">{warning.systemAction}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <WarningStatusBadge status={warning.currentStatus} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Warning History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warning Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warningHistoryRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.warningType}</TableCell>
                    <TableCell className="font-mono text-xs">{row.date}</TableCell>
                    <TableCell>
                      <WarningStatusBadge status={row.status === "Active" ? "Active" : "Resolved"} />
                    </TableCell>
                    <TableCell>{row.actionTaken}</TableCell>
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

