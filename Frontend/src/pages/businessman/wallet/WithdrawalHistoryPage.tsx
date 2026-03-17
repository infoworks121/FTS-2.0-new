import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
import { withdrawalHistoryRows, formatCurrency } from "./walletData";

export default function WithdrawalHistoryPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Withdrawal History</h1>
        <p className="text-sm text-muted-foreground">
          Track all withdrawal requests with full status trail. Past records are immutable and re-request is disabled from history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Amount Requested</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalHistoryRows.map((row) => {
                  const isOpen = expanded === row.requestId;
                  return (
                    <Fragment key={row.requestId}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setExpanded(isOpen ? null : row.requestId)}
                          >
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{row.requestDate}</TableCell>
                        <TableCell className="font-mono text-xs">{row.requestId}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(row.amountRequested)}</TableCell>
                        <TableCell className="font-mono text-emerald-500">{formatCurrency(row.netAmount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.status === "Rejected"
                                ? "border-rose-500/40 text-rose-500"
                                : row.status === "Pending"
                                ? "border-amber-500/40 text-amber-500"
                                : row.status === "Paid"
                                ? "border-emerald-500/40 text-emerald-500"
                                : "border-blue-500/40 text-blue-500"
                            }
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={row.status === "Rejected" ? "text-rose-500" : "text-muted-foreground"}>
                          {row.adminRemarks}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/20">
                            <div className="grid grid-cols-1 gap-4 py-2 xl:grid-cols-2">
                              <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground mb-2">Detailed Breakdown</p>
                                <div className="space-y-1.5 text-sm">
                                  <p className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Requested</span>
                                    <span className="font-mono">{formatCurrency(row.amountRequested)}</span>
                                  </p>
                                  <p className="flex items-center justify-between">
                                    <span className="text-muted-foreground">TDS</span>
                                    <span className="font-mono text-rose-500">- {formatCurrency(row.tdsAmount)}</span>
                                  </p>
                                  <p className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Processing Fee</span>
                                    <span className="font-mono text-rose-500">- {formatCurrency(row.processingFee)}</span>
                                  </p>
                                  <p className="flex items-center justify-between border-t pt-1.5">
                                    <span className="font-medium">Net Amount</span>
                                    <span className="font-mono font-semibold text-emerald-500">{formatCurrency(row.netAmount)}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground mb-2">Timeline</p>
                                <div className="space-y-2">
                                  {row.timeline.map((item) => (
                                    <div key={`${row.requestId}-${item.label}`} className="flex items-start gap-2">
                                      <span
                                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                          item.state === "completed"
                                            ? "bg-emerald-500"
                                            : item.state === "current"
                                            ? "bg-amber-500"
                                            : "bg-muted"
                                        }`}
                                      />
                                      <div>
                                        <p className="text-sm">{item.label}</p>
                                        <p className="font-mono text-xs text-muted-foreground">{item.at}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

