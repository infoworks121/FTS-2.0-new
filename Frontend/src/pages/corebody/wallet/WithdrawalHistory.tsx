import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const DISTRICT_NAME = "District North";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function WithdrawalHistory() {
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/wallet/me/withdrawals");
      setWithdrawals(response.data.withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const totalWithdrawn = withdrawals
    .filter((item) => item.status === "approved" || item.status === "paid")
    .reduce((sum, item) => sum + parseFloat(item.requested_amount), 0);

  const pendingWithdrawalsCount = withdrawals
    .filter((item) => item.status === "pending")
    .length;

  const lastWithdrawal = withdrawals.find((item) => item.status === "approved" || item.status === "paid");
  const lastWithdrawalDate = lastWithdrawal ? new Date(lastWithdrawal.processed_at || lastWithdrawal.created_at).toLocaleDateString() : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Withdrawal History</h1>
          <p className="text-sm text-muted-foreground">
            Read-only withdrawal records and status trail for district financial audit.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchWithdrawals} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Total Withdrawn (Approved)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg font-semibold text-emerald-600">{formatCurrency(totalWithdrawn)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg font-semibold text-amber-600">{pendingWithdrawalsCount} Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Last Payout Date</CardTitle>
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
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Requested Amount</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Remarks</TableHead>
                  <TableHead>Processed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Loading history...</p>
                    </TableCell>
                  </TableRow>
                ) : withdrawals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">REQ-{item.id}</TableCell>
                    <TableCell className="font-mono font-bold">{formatCurrency(parseFloat(item.requested_amount))}</TableCell>
                    <TableCell className="font-mono text-xs">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "rejected"
                            ? "border-rose-500/40 text-rose-500"
                            : item.status === "pending"
                            ? "border-amber-500/40 text-amber-500"
                            : "border-emerald-500/40 text-emerald-500"
                        }
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {item.admin_notes || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.processed_at ? new Date(item.processed_at).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No withdrawal activity recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed bg-muted/20">
        <CardHeader>
          <CardTitle className="text-sm">Compliance & Transparency</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Withdrawal requests are processed according to system-wide finance rules. 
            All transfers are settled only after bank verification or UPI confirmation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


