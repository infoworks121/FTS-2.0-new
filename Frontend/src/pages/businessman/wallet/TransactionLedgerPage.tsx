import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ledgerRows, type LedgerRow, formatCurrency } from "./walletData";

export default function TransactionLedgerPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [txnType, setTxnType] = useState<"all" | LedgerRow["type"]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return ledgerRows.filter((row) => {
      const ts = new Date(row.dateTime.replace(" ", "T")).getTime();
      const byFrom = !fromDate || ts >= new Date(fromDate).getTime();
      const byTo = !toDate || ts <= new Date(toDate).getTime() + 86400000 - 1;
      const byType = txnType === "all" || row.type === txnType;
      const byQuery = !query.trim() || row.transactionId.toLowerCase().includes(query.trim().toLowerCase());
      return byFrom && byTo && byType && byQuery;
    });
  }, [fromDate, query, toDate, txnType]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Transaction Ledger</h1>
        <p className="text-sm text-muted-foreground">
          Complete immutable wallet history. This ledger is read-only, audit-safe, and sourced from backend records.
        </p>
      </div>

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
            <Label>Transaction Type</Label>
            <Select value={txnType} onValueChange={(value: "all" | LedgerRow["type"]) => setTxnType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Search Transaction ID</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="TXN-BW-..."
                className="pl-8 font-mono"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            Ledger Entries
            <Badge variant="outline" className="font-mono">Ledger is immutable and audit-safe</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount (+ / −)</TableHead>
                  <TableHead>Balance After Transaction</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const isCredit = row.amount >= 0;
                  return (
                    <TableRow key={row.id} className={row.status === "Reversed" ? "bg-amber-500/5" : ""}>
                      <TableCell className="font-mono text-xs">{row.dateTime}</TableCell>
                      <TableCell className="font-mono text-xs">{row.transactionId}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={isCredit ? "border-emerald-500/40 text-emerald-500" : "border-rose-500/40 text-rose-500"}
                        >
                          {row.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell className={`font-mono ${isCredit ? "text-emerald-500" : "text-rose-500"}`}>
                        {isCredit ? "+" : "-"}
                        {formatCurrency(Math.abs(row.amount))}
                      </TableCell>
                      <TableCell className="font-mono">{formatCurrency(row.balanceAfter)}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === "Completed" ? "secondary" : "outline"}>{row.status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      No transactions found for selected filters.
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

