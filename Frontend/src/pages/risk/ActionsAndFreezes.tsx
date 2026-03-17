import { useState } from "react";
import { Ban, Clock3, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/KPICard";
import {
  AlertFirstHeader,
  AuditLogCard,
  EnforcementConfirmation,
  Severity,
  SeverityBadge,
} from "@/components/risk/RiskPrimitives";

type ActionRow = {
  entity: string;
  action: string;
  severity: Severity;
  currentStatus: string;
  duration: string;
  reversalHistory: string;
};

const actions: ActionRow[] = [
  {
    entity: "Wallet WLT-2211",
    action: "Temporary wallet freeze",
    severity: "critical",
    currentStatus: "Active",
    duration: "72h",
    reversalHistory: "No reversal",
  },
  {
    entity: "Order ORD-44001",
    action: "Order hold",
    severity: "high",
    currentStatus: "Pending Review",
    duration: "24h",
    reversalHistory: "1 prior reversal",
  },
  {
    entity: "Account USR-1120",
    action: "Referral suspension",
    severity: "medium",
    currentStatus: "Active",
    duration: "7d",
    reversalHistory: "No reversal",
  },
  {
    entity: "Account USR-1302",
    action: "Permanent ban",
    severity: "critical",
    currentStatus: "Active",
    duration: "Permanent",
    reversalHistory: "Legal review closed",
  },
];

export default function ActionsAndFreezes() {
  const [selected, setSelected] = useState<ActionRow | null>(null);

  return (
    <div className="space-y-6">
      <AlertFirstHeader
        title="Actions & Freezes"
        description="Apply enforcement controls with mandatory justification, duration control, and immutable reversal audit history."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Active Enforcements" value="14" icon={ShieldAlert} variant="warning" />
        <KPICard title="Critical Actions" value="4" icon={Ban} variant="warning" />
        <KPICard title="Pending Reversals" value="3" icon={Clock3} variant="cap" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Action Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reversal History</TableHead>
              <TableHead>Execute</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((row) => (
              <TableRow key={`${row.entity}-${row.action}`}>
                <TableCell className="font-medium">{row.entity}</TableCell>
                <TableCell>{row.action}</TableCell>
                <TableCell><SeverityBadge severity={row.severity} /></TableCell>
                <TableCell>
                  <Badge variant={row.currentStatus === "Active" ? "destructive" : "outline"}>{row.currentStatus}</Badge>
                </TableCell>
                <TableCell>{row.duration}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.reversalHistory}</TableCell>
                <TableCell>
                  <EnforcementConfirmation
                    triggerLabel="Enforce"
                    actionLabel={row.action}
                    severity={row.severity}
                    entityId={row.entity}
                    onConfirmed={() => setSelected(row)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AuditLogCard
        title="Enforcement & reversal audit"
        items={[
          { at: "2026-02-19 12:22", actor: "fraud.ops@fts", event: "Temporary wallet freeze applied to WLT-2211" },
          { at: "2026-02-19 12:33", actor: "compliance.audit@fts", event: "Reversal denied for ORD-43880 due to unresolved evidence" },
          selected
            ? { at: "2026-02-19 12:46", actor: "current.session.admin", event: `Action confirmed: ${selected.action} on ${selected.entity}` }
            : { at: "2026-02-19 12:41", actor: "legal.team@fts", event: "Permanent retention confirmed for risk record set" },
        ]}
      />
    </div>
  );
}

