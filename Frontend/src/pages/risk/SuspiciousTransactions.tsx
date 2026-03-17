import { useState } from "react";
import { ExternalLink, Eye, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { KPICard } from "@/components/KPICard";
import {
  AlertFirstHeader,
  AuditLogCard,
  EnforcementConfirmation,
  InvestigationDrawer,
  ReadOnlyFinancialNotice,
  RiskScoreBand,
  Severity,
  SeverityBadge,
} from "@/components/risk/RiskPrimitives";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = {
  id: string;
  user: string;
  wallet: string;
  amount: string;
  riskScore: number;
  rule: string;
  reason: string;
  timestamp: string;
  status: string;
  severity: Severity;
  ledgerRef: string;
};

const rows: Row[] = [
  {
    id: "TXN-99021",
    user: "Arif M.",
    wallet: "WLT-2211",
    amount: "₹95,000",
    riskScore: 92,
    rule: "High velocity transfer",
    reason: "7 transfers in 4 minutes, same destination cluster",
    timestamp: "2026-02-19 12:41",
    status: "Flagged",
    severity: "critical",
    ledgerRef: "LDG-889120",
  },
  {
    id: "TXN-99018",
    user: "Sujata K.",
    wallet: "WLT-1098",
    amount: "₹41,300",
    riskScore: 74,
    rule: "Geo deviation",
    reason: "Login and settlement from distant geolocation mismatch",
    timestamp: "2026-02-19 11:57",
    status: "Under Review",
    severity: "high",
    ledgerRef: "LDG-889101",
  },
  {
    id: "TXN-99011",
    user: "Rubel S.",
    wallet: "WLT-9081",
    amount: "₹12,600",
    riskScore: 56,
    rule: "Referral loop indicator",
    reason: "Circular referral payouts detected over 3 linked accounts",
    timestamp: "2026-02-19 10:25",
    status: "Pending Triage",
    severity: "medium",
    ledgerRef: "LDG-889062",
  },
];

export default function SuspiciousTransactions() {
  const [selected, setSelected] = useState<Row | null>(null);

  return (
    <div className="space-y-6">
      <AlertFirstHeader
        title="Suspicious Transactions"
        description="Detect abnormal financial activity with rule-linked evidence and immutable ledger references."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Open Alerts" value="23" change="+5" changeType="negative" icon={ShieldAlert} variant="warning" />
        <KPICard title="Critical Risk" value="6" icon={ShieldAlert} variant="warning" subtitle="Immediate analyst response required" />
        <KPICard title="Ledger Linked" value="100%" icon={ExternalLink} variant="trust" subtitle="Every alert maps to read-only ledger record" />
      </div>

      <ReadOnlyFinancialNotice />

      <div className="rounded-lg border border-border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>User / Wallet</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Trigger Rule</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>
                  <p>{row.user}</p>
                  <p className="text-xs text-muted-foreground">{row.wallet}</p>
                </TableCell>
                <TableCell className="font-mono">{row.amount}</TableCell>
                <TableCell>
                  <RiskScoreBand score={row.riskScore} />
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-left text-sm underline decoration-dotted">{row.rule}</button>
                    </TooltipTrigger>
                    <TooltipContent>{row.reason}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-xs">{row.timestamp}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    Investigate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AuditLogCard
        title="Recent enforcement audit"
        items={[
          { at: "2026-02-19 12:12", actor: "risk.analyst@fts", event: "Wallet freeze initiated for TXN-98995" },
          { at: "2026-02-19 11:48", actor: "compliance.lead@fts", event: "Escalated suspicious transfer cluster to legal" },
        ]}
      />

      <InvestigationDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={`Investigation • ${selected?.id ?? ""}`}
        subtitle="Monitoring → Investigation → Action → Audit"
      >
        {selected && (
          <>
            <div className="rounded-md border p-3 text-sm">
              <p><span className="font-semibold">User:</span> {selected.user}</p>
              <p><span className="font-semibold">Wallet:</span> {selected.wallet}</p>
              <p><span className="font-semibold">Trigger:</span> {selected.rule}</p>
              <p><span className="font-semibold">Ledger Ref:</span> {selected.ledgerRef} (read-only)</p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-semibold mb-2">Auto-flag reasons</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                <li>{selected.reason}</li>
                <li>Behavioral profile confidence: 0.93</li>
                <li>Peer group deviation: +4.8σ</li>
              </ul>
            </div>
            <div className="flex items-center gap-3">
              <SeverityBadge severity={selected.severity} />
              <EnforcementConfirmation
                triggerLabel="Freeze Wallet"
                actionLabel="Temporary wallet freeze"
                severity={selected.severity}
                entityId={selected.wallet}
              />
            </div>
          </>
        )}
      </InvestigationDrawer>
    </div>
  );
}

