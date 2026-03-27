import { Fragment, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, RefreshCw, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function WithdrawalHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
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
        description: "Failed to load withdrawal records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Withdrawal History</h1>
          <p className="text-sm text-muted-foreground">
            Track all withdrawal requests with full status trail. Past records are immutable and re-request is disabled from history.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchWithdrawals} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Remarks</TableHead>
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
                ) : withdrawals.map((row) => {
                  const isOpen = expanded === row.id;
                  const statusLabel = row.status.charAt(0).toUpperCase() + row.status.slice(1);
                  return (
                    <Fragment key={row.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setExpanded(isOpen ? null : row.id)}
                          >
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{new Date(row.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs">REQ-{row.id}</TableCell>
                        <TableCell className="font-mono font-bold text-blue-600">
                          {formatCurrency(parseFloat(row.requested_amount))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.status === "rejected"
                                ? "border-rose-500/40 text-rose-500"
                                : row.status === "pending"
                                ? "border-amber-500/40 text-amber-500"
                                : row.status === "approved"
                                ? "border-emerald-500/40 text-emerald-500"
                                : "border-gray-500/40 text-gray-500"
                            }
                          >
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {row.admin_notes || "No remarks yet."}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction Details</h4>
                                <div className="rounded-lg border p-3 bg-white space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method:</span>
                                    <span className="font-medium">{row.upi_id ? 'UPI' : 'Bank Transfer'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Destination:</span>
                                    <span className="font-mono">{row.upi_id || 'Bank Acct #'+row.bank_account_id}</span>
                                  </div>
                                  {row.transaction_ref && (
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-muted-foreground">Ref ID:</span>
                                        <span className="font-mono text-xs">{row.transaction_ref}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status Trail</h4>
                                <div className="rounded-lg border p-3 bg-white space-y-3">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                                    <div>
                                      <p className="text-xs font-semibold">Request Initiated</p>
                                      <p className="text-[10px] text-muted-foreground">{new Date(row.created_at).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full ${row.processed_at ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
                                    <div>
                                      <p className="text-xs font-semibold">
                                        {row.status === "pending" ? "Awaiting Admin Review" : statusLabel}
                                      </p>
                                      {row.processed_at && (
                                        <p className="text-[10px] text-muted-foreground">{new Date(row.processed_at).toLocaleString()}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
                {!isLoading && withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground font-italic">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No withdrawal history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


