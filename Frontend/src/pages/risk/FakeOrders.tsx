import { useState } from "react";
import { Clock3, Eye, Lock, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/KPICard";
import {
  AlertFirstHeader,
  InvestigationDrawer,
  Severity,
  SeverityBadge,
} from "@/components/risk/RiskPrimitives";

type FakeOrder = {
  id: string;
  buyer: string;
  seller: string;
  deviceIpSimilarity: string;
  referralChain: string;
  riskLevel: Severity;
  hold: boolean;
  timeline: string[];
};

const data: FakeOrder[] = [
  {
    id: "ORD-44001",
    buyer: "Nabil R.",
    seller: "Store Nexus",
    deviceIpSimilarity: "97%",
    referralChain: "R-219 > R-219-Self",
    riskLevel: "critical",
    hold: true,
    timeline: ["Cart created", "Order placed", "Referral credit requested", "Same-device return initiated"],
  },
  {
    id: "ORD-43989",
    buyer: "Tanisha D.",
    seller: "QuickMart",
    deviceIpSimilarity: "86%",
    referralChain: "R-112 > B-778",
    riskLevel: "high",
    hold: true,
    timeline: ["Account fresh", "High-value order", "Promo stacking", "Cross-linked wallet"],
  },
  {
    id: "ORD-43976",
    buyer: "Rahul V.",
    seller: "LocalHub",
    deviceIpSimilarity: "68%",
    referralChain: "R-554 > B-991",
    riskLevel: "medium",
    hold: false,
    timeline: ["Normal cart flow", "Odd checkout timing", "Duplicate shipping signature"],
  },
];

export default function FakeOrders() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<FakeOrder | null>(null);

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6">
      <AlertFirstHeader
        title="Fake Orders"
        description="Pattern-based detection for non-genuine orders, duplicates, and referral manipulation chains."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Pattern Alerts" value="31" icon={Workflow} variant="warning" />
        <KPICard title="Auto Referral Holds" value="14" icon={Lock} variant="cap" />
        <KPICard title="Pending Timelines" value="9" icon={Clock3} variant="default" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Duplicate patterns are highlighted and linked for investigation.</p>
          <Button size="sm" variant="destructive" disabled={selectedIds.length === 0}>
            <Lock className="mr-1 h-3.5 w-3.5" />
            Bulk Freeze ({selectedIds.length})
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Device / IP similarity</TableHead>
              <TableHead>Referral chain</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} className={row.deviceIpSimilarity === "97%" ? "bg-red-500/5" : ""}>
                <TableCell>
                  <Checkbox checked={selectedIds.includes(row.id)} onCheckedChange={() => toggle(row.id)} />
                </TableCell>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.buyer}</TableCell>
                <TableCell>{row.seller}</TableCell>
                <TableCell>
                  <span className="font-mono">{row.deviceIpSimilarity}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{row.referralChain}</Badge>
                </TableCell>
                <TableCell><SeverityBadge severity={row.riskLevel} /></TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> Investigate
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
        title={`Order Investigation • ${selected?.id ?? ""}`}
        subtitle="Behavior timeline and duplicate pattern evidence"
      >
        {selected && (
          <>
            <div className="rounded-md border p-3 text-sm">
              <p><span className="font-semibold">Buyer:</span> {selected.buyer}</p>
              <p><span className="font-semibold">Seller:</span> {selected.seller}</p>
              <p><span className="font-semibold">Referral hold:</span> {selected.hold ? "Auto-hold active" : "Not held"}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="mb-2 text-sm font-semibold">Order behaviour timeline</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {selected.timeline.map((t, idx) => (
                  <li key={`${t}-${idx}`}>{t}</li>
                ))}
              </ol>
            </div>
          </>
        )}
      </InvestigationDrawer>
    </div>
  );
}

