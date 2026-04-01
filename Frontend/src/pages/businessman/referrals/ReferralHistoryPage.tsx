import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileSpreadsheet } from "lucide-react";
import referralApi, { ReferralEarningHistory } from "@/lib/api/referral";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  ReferralLedgerEvent,
  ReferralLedgerEventBadge,
  ReferralRuleIndicators,
} from "@/components/businessman/ReferralPrimitives";

type FinalStatus = "Confirmed" | "Reversed";

type HistoryRow = {
  id: string;
  dateTime: string;
  referenceId: string;
  eventType: ReferralLedgerEvent;
  relatedOrderId: string;
  amount: number;
  finalStatus: FinalStatus;
};

export default function ReferralHistoryPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState<"all" | FinalStatus>("all");
  const [eventType, setEventType] = useState<"all" | ReferralLedgerEvent>("all");

  const { data: rawEarnings = [], isLoading } = useQuery({
    queryKey: ["referral-earnings"],
    queryFn: referralApi.getEarnings,
  });

  const historyRows: HistoryRow[] = useMemo(() => {
    return rawEarnings.map((row: ReferralEarningHistory) => {
      // Basic mapping. Since ReferralEarnings API captures profit engine credits and reversals,
      // we assume negative amount = Reversal, else Credit. 
      // Also map API 'status' which might be 'Pending'/'Credited'/'Reversed' to FinalStatus
      const amount = parseFloat(row.gross_amount as string) || 0;
      const finalStat = row.status === "Reversed" ? "Reversed" : "Confirmed";
      
      return {
        id: row.id,
        dateTime: new Date(row.created_at).toISOString().replace("T", " ").slice(0, 16),
        referenceId: `REF-LDG-${row.id.split("-")[0] || Math.floor(Math.random() * 9000 + 1000)}`, // Rough mock of ref ID
        eventType: amount < 0 ? "Reversal" : "Credit",
        relatedOrderId: row.order_id,
        amount: amount,
        finalStatus: finalStat as FinalStatus,
      };
    });
  }, [rawEarnings]);

  const filtered = useMemo(() => {
    return historyRows.filter((row) => {
      const ts = new Date(row.dateTime.replace(" ", "T")).getTime();
      const byFrom = !fromDate || ts >= new Date(fromDate).getTime();
      const byTo = !toDate || ts <= new Date(toDate).getTime() + 86400000 - 1;
      const byStatus = status === "all" || row.finalStatus === status;
      const byEvent = eventType === "all" || row.eventType === eventType;
      return byFrom && byTo && byStatus && byEvent;
    });
  }, [historyRows, eventType, fromDate, status, toDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Referral History</h1>
          <p className="text-sm text-muted-foreground">
            Immutable, ledger-style history of all referral events. Entries are read-only and audit-safe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <ReferralRuleIndicators />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Date From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: "all" | FinalStatus) => setStatus(value)}>
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Reversed">Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Credit / Reversal</Label>
            <Select value={eventType} onValueChange={(value: "all" | ReferralLedgerEvent) => setEventType(value)}>
              <SelectTrigger><SelectValue placeholder="All events" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Reversal">Reversal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ledger Events (Read-only)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
            {filtered.map((row) => (
              <div key={row.id} className={`rounded-md border bg-card p-3 space-y-2 ${row.eventType === "Reversal" ? "border-rose-500/30" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs">{row.referenceId}</p>
                    <p className="text-xs text-muted-foreground font-mono">{row.dateTime}</p>
                  </div>
                  <ReferralLedgerEventBadge event={row.eventType} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><span className="text-muted-foreground">Order:</span> <span className="font-mono">{row.relatedOrderId}</span></p>
                  <p>
                    <span className="text-muted-foreground">Amount:</span>{" "}
                    <span className={`font-mono ${row.amount < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {row.amount > 0 ? `+${formatCurrency(row.amount)}` : `-${formatCurrency(Math.abs(row.amount))}`}
                    </span>
                  </p>
                  <p className="col-span-2">
                    <span className="text-muted-foreground">Final Status:</span>{" "}
                    <span className={row.finalStatus === "Reversed" ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}>{row.finalStatus}</span>
                  </p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-md border py-8 text-center text-sm text-muted-foreground">
                No referral history records match selected filters.
              </div>
            )}
          </div>

          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Related Order ID</TableHead>
                  <TableHead>Amount (+ / -)</TableHead>
                  <TableHead>Final Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className={row.eventType === "Reversal" ? "bg-rose-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{row.dateTime}</TableCell>
                    <TableCell className="font-mono text-xs">{row.referenceId}</TableCell>
                    <TableCell>
                      <ReferralLedgerEventBadge event={row.eventType} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.relatedOrderId}</TableCell>
                    <TableCell className={`font-mono ${row.amount < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {row.amount > 0 ? `+${formatCurrency(row.amount)}` : `-${formatCurrency(Math.abs(row.amount))}`}
                    </TableCell>
                    <TableCell>
                      <span className={row.finalStatus === "Reversed" ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}>
                        {row.finalStatus}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No referral history records match selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
        )}
        </CardContent>
      </Card>
    </div>
  );
}

