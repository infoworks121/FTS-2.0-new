import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ArrowRightLeft, Download, ShieldCheck, Wallet, Loader2, Info } from "lucide-react";
import { orderApi } from "@/lib/orderApi";
import { useToast } from "@/components/ui/use-toast";

const statusClass: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function ReturnsRefunds() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getRefundRequests();
      setRequests(response.returnRequests || []);
    } catch (error) {
      console.error("Failed to fetch refund requests:", error);
      toast({
        title: "Error",
        description: "Could not load return requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (id: string) => {
    try {
      setTimelineLoading(true);
      const response = await orderApi.getRefundTimeline(id);
      setTimeline(response.timeline || []);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleOpenTimeline = (request: any) => {
    setSelected(request);
    fetchTimeline(request.id);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalRefunded = requests.reduce((sum, r) => sum + parseFloat(r.amount_to_refund || 0), 0);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading Audit Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Order Returns & Refunds</h1>
          <p className="text-sm text-muted-foreground">Post-order issue handling with referral reversal and wallet impact visibility</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests}><Download className="mr-2 h-4 w-4" />Sync Data</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPICard title="Total Requests" value={String(requests.length)} icon={ArrowRightLeft} />
        <KPICard title="Pending Review" value={String(pendingCount)} icon={Wallet} variant="warning" />
        <KPICard title="Approved" value={String(approvedCount)} icon={ShieldCheck} variant="profit" />
        <KPICard title="Total Portfolio Refund" value={`₹${totalRefunded.toLocaleString("en-IN")}`} icon={AlertTriangle} variant="trust" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Historical Requests</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.order_number}</TableCell>
                      <TableCell className="font-medium">{row.customer_name}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={row.reason}>{row.reason}</TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        ₹{parseFloat(row.amount_to_refund || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusClass[row.status] || "bg-muted text-muted-foreground"} border-none`}>
                          {row.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenTimeline(row)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No return requests logged.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Audit Protocol</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex gap-2 rounded-md border p-3 bg-blue-500/5">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  Referral commissions are automatically reversed upon refund approval.
                </p>
              </div>
              <div className="flex gap-2 rounded-md border p-3 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  Approved refunds post an immutable debit entry in the master ledger.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  Timeline • {selected.order_number}
                </SheetTitle>
                <SheetDescription>Transaction status progression and audit notes</SheetDescription>
              </SheetHeader>
              <div className="mt-8 space-y-6">
                {timelineLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                  </div>
                ) : timeline.length > 0 ? (
                  <div className="relative border-l-2 border-primary/20 ml-2 space-y-8 pb-4">
                    {timeline.map((item, i) => (
                      <div key={item.id} className="relative pl-6">
                        <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                        <div>
                          <p className="font-bold text-sm tracking-tight">{item.new_status.toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                          {item.note && (
                            <div className="mt-2 p-2 rounded bg-muted/50 text-xs italic text-muted-foreground border-l-2 border-muted leading-relaxed">
                              "{item.note}"
                            </div>
                          )}
                          <p className="text-xs font-medium mt-2 text-primary/70">
                            By: {item.performed_by_name || "System"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-muted-foreground text-sm">No timeline logs found.</p>
                )}

                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                  <p className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Immutable Hash
                  </p>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    This timeline represents an immutable audit trail. Manual adjustments to this sequence are prohibited by the financial core.
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

