import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { navItems } from "@/pages/CoreBodyDashboard";
import { toast } from "sonner";

type RequestRow = {
  requestId: string;
  requester: string;
  product: string;
  requestedQuantity: string;
  requestDate: string;
  status: "Pending" | "High Priority" | "Under Review";
};

const rows: RequestRow[] = [
  {
    requestId: "REQ-240222-012",
    requester: "Arjun Traders",
    product: "Hybrid Rice Seed",
    requestedQuantity: "100 Bag",
    requestDate: "2026-02-22",
    status: "Pending",
  },
  {
    requestId: "REQ-240222-009",
    requester: "Priya Agencies",
    product: "NPK 20:20:20",
    requestedQuantity: "80 Sack",
    requestDate: "2026-02-22",
    status: "High Priority",
  },
  {
    requestId: "REQ-240221-017",
    requester: "Mehta Supply",
    product: "Bio Shield",
    requestedQuantity: "65 Bottle",
    requestDate: "2026-02-21",
    status: "Under Review",
  },
];

export default function PendingRequests() {
  const [approveTarget, setApproveTarget] = useState<RequestRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RequestRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const totalPending = rows.length;
  const todaysRequests = rows.filter((r) => r.requestDate === "2026-02-22").length;
  const highPriorityRequests = rows.filter((r) => r.status === "High Priority").length;

  const onApprove = () => {
    if (!approveTarget) return;
    toast.success(`Request approved: ${approveTarget.requestId}. Audit entry created.`);
    setApproveTarget(null);
  };

  const onReject = () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    toast.success(`Request rejected: ${rejectTarget.requestId}. Reason logged for audit.`);
    setRejectTarget(null);
    setRejectReason("");
  };

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — District North">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Pending Requests</h1>
          <p className="text-sm text-muted-foreground">
            Review incoming stock requests with controlled approval and mandatory-reason rejection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalPending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Today&apos;s Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{todaysRequests}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-500">High-Priority Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-500">{highPriorityRequests}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Request Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: "Request ID", accessor: "requestId", className: "font-mono text-xs" },
                { header: "Requester", accessor: "requester" },
                { header: "Product", accessor: "product" },
                { header: "Requested Quantity", accessor: "requestedQuantity", className: "font-mono text-xs" },
                { header: "Request Date", accessor: "requestDate", className: "font-mono text-xs" },
                {
                  header: "Status",
                  accessor: (row: RequestRow) => (
                    <Badge variant={row.status === "High Priority" ? "destructive" : row.status === "Pending" ? "secondary" : "outline"}>
                      {row.status}
                    </Badge>
                  ),
                },
                {
                  header: "Actions",
                  accessor: (row: RequestRow) => (
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs" onClick={() => setApproveTarget(row)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setRejectTarget(row)}>
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => toast.info(`Request ${row.requestId}: ${row.requestedQuantity} of ${row.product}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={rows}
            />
          </CardContent>
        </Card>

        <AlertDialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Request</AlertDialogTitle>
              <AlertDialogDescription>
                Approval will initiate controlled stock issuance flow and record an immutable audit event.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-xs rounded-md border p-3">
              <p>
                <span className="text-muted-foreground">Request:</span> {approveTarget?.requestId}
              </p>
              <p>
                <span className="text-muted-foreground">Requester:</span> {approveTarget?.requester}
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onApprove}>Confirm Approval</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Request</AlertDialogTitle>
              <AlertDialogDescription>
                Rejection reason is mandatory and will be stored in the audit trail.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Request: {rejectTarget?.requestId}</p>
              <Textarea
                placeholder="Enter rejection reason (mandatory)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRejectReason("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onReject}>Submit Rejection</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

