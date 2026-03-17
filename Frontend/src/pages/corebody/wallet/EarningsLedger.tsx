import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LedgerSource = "Order" | "Referral" | "Adjustment";
type WalletType = "Main" | "Referral" | "Trust";
type LedgerStatus = "Confirmed" | "Reversed";

type LedgerEntry = {
  dateTime: string;
  source: LedgerSource;
  referenceId: string;
  creditAmount: number;
  walletType: WalletType;
  status: LedgerStatus;
};

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 8;

const entries: LedgerEntry[] = [
  { dateTime: "2026-02-22 10:12", source: "Order", referenceId: "ORD-882145", creditAmount: 18200, walletType: "Main", status: "Confirmed" },
  { dateTime: "2026-02-22 09:30", source: "Referral", referenceId: "REF-319842", creditAmount: 2100, walletType: "Referral", status: "Confirmed" },
  { dateTime: "2026-02-21 18:05", source: "Order", referenceId: "ORD-882001", creditAmount: 15400, walletType: "Main", status: "Confirmed" },
  { dateTime: "2026-02-21 16:22", source: "Adjustment", referenceId: "ADJ-110091", creditAmount: 900, walletType: "Trust", status: "Confirmed" },
  { dateTime: "2026-02-21 12:14", source: "Referral", referenceId: "REF-319655", creditAmount: 1800, walletType: "Referral", status: "Reversed" },
  { dateTime: "2026-02-20 19:11", source: "Order", referenceId: "ORD-881744", creditAmount: 13100, walletType: "Main", status: "Confirmed" },
  { dateTime: "2026-02-20 10:40", source: "Adjustment", referenceId: "ADJ-109817", creditAmount: 1200, walletType: "Trust", status: "Confirmed" },
  { dateTime: "2026-02-19 14:08", source: "Order", referenceId: "ORD-881342", creditAmount: 10200, walletType: "Main", status: "Confirmed" },
  { dateTime: "2026-02-19 09:27", source: "Referral", referenceId: "REF-319101", creditAmount: 1700, walletType: "Referral", status: "Confirmed" },
  { dateTime: "2026-02-18 17:59", source: "Order", referenceId: "ORD-880993", creditAmount: 14600, walletType: "Main", status: "Confirmed" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function EarningsLedger() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [walletType, setWalletType] = useState<"all" | WalletType>("all");
  const [sourceType, setSourceType] = useState<"all" | LedgerSource>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.dateTime.replace(" ", "T")).getTime();
      const matchesFrom = !fromDate || entryDate >= new Date(fromDate).getTime();
      const matchesTo = !toDate || entryDate <= new Date(toDate).getTime() + 86400000 - 1;
      const matchesWallet = walletType === "all" || entry.walletType === walletType;
      const matchesSource = sourceType === "all" || entry.source === sourceType;
      return matchesFrom && matchesTo && matchesWallet && matchesSource;
    });
  }, [fromDate, toDate, walletType, sourceType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Earnings Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Immutable earnings history for district finance visibility. Entries are ledger-backed and non-editable.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} />
            </div>
            <div className="space-y-2">
              <Label>Wallet Type</Label>
              <Select value={walletType} onValueChange={(value: "all" | WalletType) => { setPage(1); setWalletType(value); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Main">Main</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Trust">Trust</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select value={sourceType} onValueChange={(value: "all" | LedgerSource) => { setPage(1); setSourceType(value); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Order">Order</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ledger Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>Credit Amount</TableHead>
                    <TableHead>Wallet Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((entry) => (
                    <TableRow key={entry.referenceId + entry.dateTime}>
                      <TableCell className="font-mono text-xs">{entry.dateTime}</TableCell>
                      <TableCell>{entry.source}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.referenceId}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(entry.creditAmount)}</TableCell>
                      <TableCell>{entry.walletType}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === "Confirmed" ? "secondary" : "destructive"}>{entry.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        No ledger entries match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing {paginated.length} of {filtered.length} records • API-ready pagination</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <span className="text-xs text-muted-foreground">Page {safePage} of {totalPages}</span>
                <Button size="sm" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Ledger Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All entries are system-generated and cannot be modified. Reversal records are posted as separate immutable events.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

