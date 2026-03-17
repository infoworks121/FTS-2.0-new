import { useState } from "react";
import { Eye, Fingerprint, GitMerge, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { KPICard } from "@/components/KPICard";
import { AlertFirstHeader, InvestigationDrawer, Severity, SeverityBadge } from "@/components/risk/RiskPrimitives";

type AccountGroup = {
  userName: string;
  matchedIdentifier: string;
  accountCount: number;
  riskLevel: Severity;
  status: string;
  linkedAccounts: string[];
};

const accountGroups: AccountGroup[] = [
  {
    userName: "Sakib A.",
    matchedIdentifier: "PAN: AXTPS9***M",
    accountCount: 4,
    riskLevel: "critical",
    status: "Escalated",
    linkedAccounts: ["USR-1120", "USR-1128", "USR-1150", "USR-1302"],
  },
  {
    userName: "Priya S.",
    matchedIdentifier: "Mobile: +91 98***4412",
    accountCount: 3,
    riskLevel: "high",
    status: "Under Review",
    linkedAccounts: ["USR-982", "USR-1018", "USR-1201"],
  },
  {
    userName: "Arman K.",
    matchedIdentifier: "Device: DV-28811",
    accountCount: 2,
    riskLevel: "medium",
    status: "Open",
    linkedAccounts: ["USR-766", "USR-770"],
  },
];

export default function DuplicateAccounts() {
  const [selected, setSelected] = useState<AccountGroup | null>(null);
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-6">
      <AlertFirstHeader
        title="Duplicate Accounts"
        description="Detect multiple identity misuse through PAN, mobile, and device matching clusters."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Identity Clusters" value="19" icon={Fingerprint} variant="warning" />
        <KPICard title="Merge Recommended" value="7" icon={GitMerge} variant="cap" />
        <KPICard title="Freeze Recommended" value="5" icon={Users} variant="warning" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Matched Identifier</TableHead>
              <TableHead>Account Count</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountGroups.map((row) => (
              <TableRow key={`${row.userName}-${row.matchedIdentifier}`}>
                <TableCell className="font-medium">{row.userName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.matchedIdentifier}</Badge>
                </TableCell>
                <TableCell className="font-mono">{row.accountCount}</TableCell>
                <TableCell><SeverityBadge severity={row.riskLevel} /></TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> View linked
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InvestigationDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={`Identity Cluster • ${selected?.userName ?? ""}`}
        subtitle="View linked accounts, apply merge/freeze recommendation, and record investigation notes"
      >
        {selected && (
          <>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-semibold mb-2">Linked Accounts</p>
              <div className="flex flex-wrap gap-2">
                {selected.linkedAccounts.map((id) => (
                  <Badge key={id} variant="secondary">{id}</Badge>
                ))}
              </div>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-semibold mb-2">Recommendation</p>
              <p className="text-muted-foreground">Primary action: Merge identity graph and freeze payout pathways pending KYC review.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="mb-2 text-sm font-semibold">Investigation notes panel</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record findings, legal basis, and next review checkpoint"
                rows={5}
              />
            </div>
          </>
        )}
      </InvestigationDrawer>
    </div>
  );
}

