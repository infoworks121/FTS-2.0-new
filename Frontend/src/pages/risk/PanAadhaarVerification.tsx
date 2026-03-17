import { useState } from "react";
import { BadgeCheck, CheckCircle2, FileText, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/KPICard";
import {
  AlertFirstHeader,
  EnforcementConfirmation,
  InvestigationDrawer,
  Severity,
  SeverityBadge,
} from "@/components/risk/RiskPrimitives";

type VerificationRow = {
  userName: string;
  docType: "PAN" | "Aadhaar";
  status: string;
  submittedDate: string;
  actionRequired: string;
  expiryRisk: Severity;
};

const queue: VerificationRow[] = [
  {
    userName: "Farhan I.",
    docType: "PAN",
    status: "Pending Review",
    submittedDate: "2026-02-18",
    actionRequired: "Manual validation",
    expiryRisk: "high",
  },
  {
    userName: "Mina P.",
    docType: "Aadhaar",
    status: "Auto-Verified",
    submittedDate: "2026-02-19",
    actionRequired: "None",
    expiryRisk: "low",
  },
  {
    userName: "Jiban K.",
    docType: "PAN",
    status: "Mismatch",
    submittedDate: "2026-02-17",
    actionRequired: "Reject with reason",
    expiryRisk: "critical",
  },
];

export default function PanAadhaarVerification() {
  const [selected, setSelected] = useState<VerificationRow | null>(null);

  return (
    <div className="space-y-6">
      <AlertFirstHeader
        title="PAN / Aadhaar Verification"
        description="Compliance queue with masked document preview, mandatory reasoned decisions, and expiry-risk escalation."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Pending KYC" value="17" icon={FileText} variant="warning" />
        <KPICard title="Auto Verified" value="62" icon={BadgeCheck} variant="profit" />
        <KPICard title="Expiry Alerts" value="4" icon={ShieldCheck} variant="cap" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Action Required</TableHead>
              <TableHead>Expiry Risk</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.map((row) => (
              <TableRow key={`${row.userName}-${row.docType}`}>
                <TableCell className="font-medium">{row.userName}</TableCell>
                <TableCell>{row.docType}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Auto-Verified" ? "default" : "outline"}>{row.status}</Badge>
                </TableCell>
                <TableCell>{row.submittedDate}</TableCell>
                <TableCell>{row.actionRequired}</TableCell>
                <TableCell><SeverityBadge severity={row.expiryRisk} /></TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => setSelected(row)}>Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InvestigationDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={`Verification Review • ${selected?.userName ?? ""}`}
        subtitle="Document preview is masked. Every decision must be attributable and auditable."
      >
        {selected && (
          <>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-semibold mb-1">Masked Document Preview</p>
              <p className="text-muted-foreground">{selected.docType}: XXXXXXX1234 • Name verified partially • OCR confidence 0.89</p>
              {selected.status === "Auto-Verified" && (
                <p className="mt-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Auto-verification badge present
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <EnforcementConfirmation
                triggerLabel="Approve"
                actionLabel="KYC approval"
                severity="low"
                entityId={selected.userName}
              />
              <EnforcementConfirmation
                triggerLabel="Reject"
                actionLabel="KYC rejection"
                severity="high"
                entityId={selected.userName}
              />
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <XCircle className="h-3.5 w-3.5" /> Reason required in both cases
              </span>
            </div>
          </>
        )}
      </InvestigationDrawer>
    </div>
  );
}

