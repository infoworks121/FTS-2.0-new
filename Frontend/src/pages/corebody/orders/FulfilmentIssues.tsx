import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OperationsMetricCard, OrderStatusBadge, SeverityBadge, SLABadge } from "@/components/corebody/orders/OrdersPrimitives";

type IssueType = "Delay" | "Shortage" | "Mismatch";
type Severity = "Low" | "Medium" | "High" | "Critical";
type IssueStatus = "Open" | "Under Review" | "Escalated";

type FulfilmentIssue = {
  issueId: string;
  relatedOrderId: string;
  issueType: IssueType;
  reportedBy: string;
  severityLevel: Severity;
  reportedDate: string;
  currentStatus: IssueStatus;
};

const ITEMS_PER_PAGE = 6;

const rows: FulfilmentIssue[] = [
  { issueId: "ISSUE-260222-001", relatedOrderId: "AO-260221-003", issueType: "Delay", reportedBy: "Priya Agencies", severityLevel: "High", reportedDate: "2026-02-22", currentStatus: "Open" },
  { issueId: "ISSUE-260222-002", relatedOrderId: "AO-260219-007", issueType: "Shortage", reportedBy: "Central Relay Point", severityLevel: "Critical", reportedDate: "2026-02-22", currentStatus: "Escalated" },
  { issueId: "ISSUE-260221-003", relatedOrderId: "AO-260217-012", issueType: "Mismatch", reportedBy: "Rural Connect", severityLevel: "Medium", reportedDate: "2026-02-21", currentStatus: "Under Review" },
  { issueId: "ISSUE-260220-004", relatedOrderId: "AO-260220-005", issueType: "Delay", reportedBy: "Mehta Supply", severityLevel: "Low", reportedDate: "2026-02-20", currentStatus: "Open" },
  { issueId: "ISSUE-260219-005", relatedOrderId: "AO-260218-010", issueType: "Mismatch", reportedBy: "Kumar Distribution", severityLevel: "High", reportedDate: "2026-02-19", currentStatus: "Under Review" },
];

export default function FulfilmentIssues() {
  const [issueTypeFilter, setIssueTypeFilter] = useState<"all" | IssueType>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | Severity>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | IssueStatus>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<FulfilmentIssue | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesIssueType = issueTypeFilter === "all" || row.issueType === issueTypeFilter;
      const matchesSeverity = severityFilter === "all" || row.severityLevel === severityFilter;
      const matchesStatus = statusFilter === "all" || row.currentStatus === statusFilter;
      return matchesIssueType && matchesSeverity && matchesStatus;
    });
  }, [issueTypeFilter, severityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const totalIssues = rows.length;
  const highPriority = rows.filter((r) => r.severityLevel === "High" || r.severityLevel === "Critical").length;
  const slaBreaches = rows.filter((r) => r.currentStatus === "Escalated").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Fulfilment Issues</h1>
        <p className="text-sm text-muted-foreground">Problematic district orders requiring monitoring and escalation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OperationsMetricCard title="Total Issues" value={totalIssues} tone="neutral" />
        <OperationsMetricCard title="High Priority" value={highPriority} tone="warning" />
        <OperationsMetricCard title="SLA Breaches" value={slaBreaches} tone="danger" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Issue Type</Label>
            <Select value={issueTypeFilter} onValueChange={(v: "all" | IssueType) => { setPage(1); setIssueTypeFilter(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Delay">Delay</SelectItem>
                <SelectItem value="Shortage">Shortage</SelectItem>
                <SelectItem value="Mismatch">Mismatch</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <Select value={severityFilter} onValueChange={(v: "all" | Severity) => { setPage(1); setSeverityFilter(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={(v: "all" | IssueStatus) => { setPage(1); setStatusFilter(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Issues Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue ID</TableHead>
                  <TableHead>Related Order ID</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Severity Level</TableHead>
                  <TableHead>Reported Date</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((row) => (
                  <TableRow key={row.issueId}>
                    <TableCell className="font-mono text-xs">{row.issueId}</TableCell>
                    <TableCell className="font-mono text-xs">{row.relatedOrderId}</TableCell>
                    <TableCell>{row.issueType}</TableCell>
                    <TableCell>{row.reportedBy}</TableCell>
                    <TableCell><SeverityBadge level={row.severityLevel} /></TableCell>
                    <TableCell className="font-mono text-xs">{row.reportedDate}</TableCell>
                    <TableCell><OrderStatusBadge status={row.currentStatus} /></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(row)}>View Issue Details</Button>
                      <Button size="sm" variant="secondary">Escalate to Admin</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                      No issues match the current filter set.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length} records • Escalation-only action scope</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-xs text-muted-foreground">Page {safePage} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>No direct resolution controls unless system enables automation.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Issue ID</span><span className="font-mono">{selected.issueId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Related Order</span><span className="font-mono">{selected.relatedOrderId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Issue Type</span><span>{selected.issueType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reported By</span><span>{selected.reportedBy}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Severity</span><SeverityBadge level={selected.severityLevel} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SLA</span><SLABadge status={selected.currentStatus === "Escalated" ? "Breached" : "At Risk"} /></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

