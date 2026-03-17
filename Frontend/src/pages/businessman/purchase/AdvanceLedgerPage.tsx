import { Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SettlementStatusBadge, formatCurrency } from "@/components/businessman/PurchaseAdvancePrimitives";

type LedgerStatus = "Open" | "Partially Settled" | "Settled" | "Overdue";

type LedgerRow = {
  date: string;
  referenceId: string;
  product: string;
  debit: number;
  credit: number;
  balance: number;
  status: LedgerStatus;
};

const rows: LedgerRow[] = [
  { date: "2026-02-18", referenceId: "AR-260218-009", product: "Premium Wheat Seed", debit: 12000, credit: 0, balance: 12000, status: "Open" },
  { date: "2026-02-19", referenceId: "AR-260219-011", product: "Nitro Boost Fertilizer", debit: 0, credit: 5000, balance: 7000, status: "Partially Settled" },
  { date: "2026-02-20", referenceId: "AR-260220-014", product: "Smart Drip Kit", debit: 14000, credit: 14000, balance: 0, status: "Settled" },
  { date: "2026-02-12", referenceId: "AR-260212-003", product: "Shield Pro Pesticide", debit: 9200, credit: 1000, balance: 8200, status: "Overdue" },
];

export default function AdvanceLedgerPage() {
  const totalAdvanceTaken = rows.reduce((sum, row) => sum + row.debit, 0);
  const settledAmount = rows.reduce((sum, row) => sum + row.credit, 0);
  const outstandingAmount = rows.reduce((sum, row) => sum + row.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Advance Ledger</h1>
          <p className="text-sm text-muted-foreground">Immutable, read-only financial trail of advance debit/credit activity.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Advance Taken</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-mono font-semibold">{formatCurrency(totalAdvanceTaken)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Outstanding Amount</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-mono font-semibold text-red-500">{formatCurrency(outstandingAmount)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Settled Amount</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-mono font-semibold text-emerald-500">{formatCurrency(settledAmount)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ledger Entries (Read-only)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Settlement Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.referenceId} className={row.status === "Overdue" ? "bg-red-500/5" : ""}>
                    <TableCell className="font-mono text-xs">{row.date}</TableCell>
                    <TableCell className="font-mono text-xs">{row.referenceId}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell className="font-mono">{row.debit ? formatCurrency(row.debit) : "—"}</TableCell>
                    <TableCell className="font-mono text-emerald-500">{row.credit ? formatCurrency(row.credit) : "—"}</TableCell>
                    <TableCell className={`font-mono ${row.balance > 0 ? "text-red-500" : "text-emerald-500"}`}>
                      {formatCurrency(row.balance)}
                    </TableCell>
                    <TableCell><SettlementStatusBadge status={row.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

