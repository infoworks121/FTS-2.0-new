import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, ArrowRightLeft, Download, ShieldCheck, Wallet } from "lucide-react";
import { RefundRequest, refundRequests } from "./orderData";

const statusClass: Record<string, string> = {
  Requested: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Validated: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Reversed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function ReturnsRefunds() {
  const [selected, setSelected] = useState<RefundRequest | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Order Returns & Refunds</h1>
          <p className="text-sm text-muted-foreground">Post-order issue handling with referral reversal and wallet impact visibility</p>
        </div>
        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPICard title="Requests" value={String(refundRequests.length)} icon={ArrowRightLeft} />
        <KPICard title="Pending Reversals" value={String(refundRequests.filter((r) => r.walletAdjustment === "Pending").length)} icon={Wallet} variant="warning" />
        <KPICard title="Approved" value={String(refundRequests.filter((r) => r.status === "Approved").length)} icon={ShieldCheck} variant="profit" />
        <KPICard title="Referral Reversal" value={`₹${refundRequests.reduce((s, r) => s + r.referralReversal, 0).toLocaleString("en-IN")}`} icon={AlertTriangle} variant="trust" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Requests</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Return Reason</TableHead>
                  <TableHead className="text-right">Refund Amount</TableHead>
                  <TableHead className="text-right">Referral Reversal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundRequests.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.orderId}</TableCell>
                    <TableCell>{row.returnReason}</TableCell>
                    <TableCell className="text-right font-mono">₹{row.refundAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right font-mono">₹{row.referralReversal.toLocaleString("en-IN")}</TableCell>
                    <TableCell><Badge className={statusClass[row.status]}>{row.status}</Badge></TableCell>
                    <TableCell>{row.requestedDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border p-3">
              <p className="font-semibold">Refund impact preview</p>
              <p className="text-muted-foreground">Shows wallet delta and reversal requirements before settlement.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="font-semibold">Auto referral reversal</p>
              <p className="text-muted-foreground">Referral commission reverses automatically once refund is approved.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="font-semibold">Wallet adjustment</p>
              <p className="text-muted-foreground">Main wallet and linked wallet entries are posted in immutable ledger.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Refund Timeline • {selected.id}</SheetTitle>
                <SheetDescription>Status progression for audit and investigation</SheetDescription>
              </SheetHeader>
              <div className="mt-5 space-y-3">
                {selected.timeline.map((item, i) => (
                  <div key={`${item}-${i}`} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">Step {i + 1}</p>
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
                  <p className="font-semibold text-amber-700 dark:text-amber-300">Read-only finance data</p>
                  <p className="text-muted-foreground">No manual ledger edits. Reversal posting is system-controlled.</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

