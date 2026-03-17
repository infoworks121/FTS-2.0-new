import { BarChart3, Pause, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/KPICard";
import { AlertFirstHeader, SeverityBadge } from "@/components/risk/RiskPrimitives";

const rows = [
  {
    referrer: "R-2101",
    referralCount: 48,
    selfPurchaseRatio: "71%",
    linkedDevices: 9,
    riskLevel: "critical" as const,
    explanation: "Self-purchase rings across shared device clusters",
    autoHold: true,
  },
  {
    referrer: "R-1992",
    referralCount: 22,
    selfPurchaseRatio: "43%",
    linkedDevices: 5,
    riskLevel: "high" as const,
    explanation: "Unusual referral velocity + payout timing",
    autoHold: true,
  },
  {
    referrer: "R-1809",
    referralCount: 16,
    selfPurchaseRatio: "19%",
    linkedDevices: 2,
    riskLevel: "medium" as const,
    explanation: "Elevated but below hard-threshold rules",
    autoHold: false,
  },
];

export default function ReferralAbuseDetection() {
  return (
    <div className="space-y-6">
      <AlertFirstHeader
        title="Referral Abuse Detection"
        description="Behavior analytics for referral manipulation with anomaly evidence and automatic earnings hold safeguards."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Anomaly Cases" value="27" icon={ShieldAlert} variant="warning" />
        <KPICard title="Auto-Held Earnings" value="₹1.34L" icon={Pause} variant="cap" />
        <KPICard title="Rule Triggered" value="11" icon={BarChart3} variant="trust" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referrer</TableHead>
              <TableHead>Referral Count</TableHead>
              <TableHead>Self-purchase ratio</TableHead>
              <TableHead>Linked devices</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Auto-Hold</TableHead>
              <TableHead>Rule Trigger Explanation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.referrer}>
                <TableCell className="font-medium">{row.referrer}</TableCell>
                <TableCell className="font-mono">{row.referralCount}</TableCell>
                <TableCell>{row.selfPurchaseRatio}</TableCell>
                <TableCell className="font-mono">{row.linkedDevices}</TableCell>
                <TableCell><SeverityBadge severity={row.riskLevel} /></TableCell>
                <TableCell>
                  <Badge variant={row.autoHold ? "destructive" : "outline"}>{row.autoHold ? "Held" : "Not Held"}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.explanation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

