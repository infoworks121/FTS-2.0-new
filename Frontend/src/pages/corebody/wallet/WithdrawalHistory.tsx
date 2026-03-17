import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type WithdrawalStatus = "Pending" | "Approved" | "Rejected" | "Paid";

type WithdrawalRow = {
  requestId: string;
  requestedAmount: number;
  requestDate: string;
  status: WithdrawalStatus;
  tdsDeducted: number;
  netPayable: number;
  processedDate: string;
};

const DISTRICT_NAME = "District North";

const withdrawals: WithdrawalRow[] = [
  {
    requestId: "WD-260222-001",
    requestedAmount: 45000,
    requestDate: "2026-02-22",
    status: "Pending",
    tdsDeducted: 0,
    netPayable: 45000,
    processedDate: "—",
  },
  {
    requestId: "WD-260215-014",
    requestedAmount: 60000,
    requestDate: "2026-02-15",
    status: "Approved",
    tdsDeducted: 6000,
    netPayable: 54000,
    processedDate: "2026-02-20",
  },
  {
    requestId: "WD-260210-011",
    requestedAmount: 52000,
    requestDate: "2026-02-10",
    status: "Paid",
    tdsDeducted: 5200,
    netPayable: 46800,
    processedDate: "2026-02-14",
  },
  {
    requestId: "WD-260203-006",
    requestedAmount: 30000,
    requestDate: "2026-02-03",
    status: "Rejected",
    tdsDeducted: 0,
    netPayable: 0,
    processedDate: "2026-02-05",
  },
  {
    requestId: "WD-260129-022",
    requestedAmount: 75000,
    requestDate: "2026-01-29",
    status: "Paid",
    tdsDeducted: 7500,
    netPayable: 67500,
    processedDate: "2026-02-01",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function WithdrawalHistory() {
  const totalWithdrawn = withdrawals
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + item.netPayable, 0);

  const pendingWithdrawals = withdrawals
    .filter((item) => item.status === "Pending" || item.status === "Approved")
    .reduce((sum, item) => sum + item.requestedAmount, 0);

  const lastWithdrawalDate = withdrawals.find((item) => item.status === "Paid")?.processedDate ?? "—";

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Withdrawal History</h1>
          <p className="text-sm text-muted-foreground">
            Read-only withdrawal records and status trail for district financial audit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Total Withdrawn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-lg font-semibold">{formatCurrency(totalWithdrawn)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Pending Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-lg font-semibold">{formatCurrency(pendingWithdrawals)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Last Withdrawal Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-lg font-semibold">{lastWithdrawalDate}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Withdrawal Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Requested Amount</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>TDS Deducted</TableHead>
                    <TableHead>Net Payable</TableHead>
                    <TableHead>Processed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((item) => (
                    <TableRow key={item.requestId}>
                      <TableCell className="font-mono text-xs">{item.requestId}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(item.requestedAmount)}</TableCell>
                      <TableCell className="font-mono text-xs">{item.requestDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Rejected"
                              ? "destructive"
                              : item.status === "Paid"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{formatCurrency(item.tdsDeducted)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(item.netPayable)}</TableCell>
                      <TableCell className="font-mono text-xs">{item.processedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Compliance Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Withdrawals are processed after admin approval and applicable deductions.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

