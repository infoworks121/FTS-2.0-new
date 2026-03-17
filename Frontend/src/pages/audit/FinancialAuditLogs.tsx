import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AuditPagination,
  CreditDebitBadge,
  ExportButtons,
  MonospaceId,
  ReadonlyAuditStrip,
} from "@/components/audit/AuditPrimitives";

type Entry = {
  id: string;
  source: "Order" | "Refund" | "Commission";
  walletType: "Main" | "Referral" | "Trust" | "Reserve";
  direction: "Credit" | "Debit";
  amount: number;
  balanceAfter: number;
  referenceId: string;
  timestamp: string;
  date: string;
  linkedOrderId: string;
};

const entries: Entry[] = [
  { id: "LGR-772001", source: "Order", walletType: "Main", direction: "Credit", amount: 15800, balanceAfter: 912500, referenceId: "TXN-001902", timestamp: "2026-02-19 13:02:11", date: "2026-02-19", linkedOrderId: "ORD-487720" },
  { id: "LGR-772002", source: "Refund", walletType: "Main", direction: "Debit", amount: 3400, balanceAfter: 909100, referenceId: "TXN-001903", timestamp: "2026-02-19 13:06:30", date: "2026-02-19", linkedOrderId: "ORD-487410" },
  { id: "LGR-772003", source: "Commission", walletType: "Referral", direction: "Credit", amount: 820, balanceAfter: 120340, referenceId: "TXN-001907", timestamp: "2026-02-19 13:08:44", date: "2026-02-19", linkedOrderId: "ORD-487501" },
  { id: "LGR-772004", source: "Order", walletType: "Trust", direction: "Credit", amount: 1550, balanceAfter: 435600, referenceId: "TXN-001910", timestamp: "2026-02-18 20:11:20", date: "2026-02-18", linkedOrderId: "ORD-487332" },
  { id: "LGR-772005", source: "Commission", walletType: "Reserve", direction: "Credit", amount: 450, balanceAfter: 78220, referenceId: "TXN-001914", timestamp: "2026-02-18 18:21:02", date: "2026-02-18", linkedOrderId: "ORD-487210" },
  { id: "LGR-772006", source: "Refund", walletType: "Referral", direction: "Debit", amount: 220, balanceAfter: 120120, referenceId: "TXN-001918", timestamp: "2026-02-17 15:42:54", date: "2026-02-17", linkedOrderId: "ORD-486993" },
];

const pageSize = 5;

export default function FinancialAuditLogs() {
  const [search, setSearch] = useState("");
  const [wallet, setWallet] = useState("all");
  const [source, setSource] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return entries.filter((entry) => {
      const matchSearch =
        entry.id.toLowerCase().includes(s) ||
        entry.referenceId.toLowerCase().includes(s) ||
        entry.linkedOrderId.toLowerCase().includes(s);
      const matchWallet = wallet === "all" || entry.walletType === wallet;
      const matchSource = source === "all" || entry.source === source;
      const matchFrom = !fromDate || entry.date >= fromDate;
      const matchTo = !toDate || entry.date <= toDate;
      return matchSearch && matchWallet && matchSource && matchFrom && matchTo;
    });
  }, [search, wallet, source, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const exportLocked = !fromDate || !toDate;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Financial Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Immutable money-trail ledger answering source, direction, amount, and balance impact.</p>
        </div>
        <ExportButtons disabled={exportLocked} />
      </div>

      <ReadonlyAuditStrip />

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search by ledger / order / reference"
            />
          </div>
          <Select value={wallet} onValueChange={(v) => { setPage(1); setWallet(v); }}>
            <SelectTrigger><SelectValue placeholder="Wallet type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wallets</SelectItem>
              <SelectItem value="Main">Main</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Trust">Trust</SelectItem>
              <SelectItem value="Reserve">Reserve</SelectItem>
            </SelectContent>
          </Select>
          <Select value={source} onValueChange={(v) => { setPage(1); setSource(v); }}>
            <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Order">Order</SelectItem>
              <SelectItem value="Refund">Refund</SelectItem>
              <SelectItem value="Commission">Commission</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} />
          <Input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ledger Entry ID</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Wallet Type</TableHead>
                <TableHead>Credit / Debit</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
                <TableHead>Reference ID</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((entry) => (
                <TableRow key={entry.id} className="text-xs">
                  <TableCell><MonospaceId value={entry.id} /></TableCell>
                  <TableCell>{entry.source}</TableCell>
                  <TableCell>{entry.walletType}</TableCell>
                  <TableCell><CreditDebitBadge direction={entry.direction} /></TableCell>
                  <TableCell className="text-right font-mono">₹{entry.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-right font-mono">₹{entry.balanceAfter.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Link className="underline underline-offset-2" to={`/admin/transactions?ref=${entry.referenceId}`}>
                      <MonospaceId value={entry.referenceId} />
                    </Link>
                    <p>
                      <Link className="text-muted-foreground underline underline-offset-2" to={`/admin/orders?entity=${entry.linkedOrderId}`}>
                        <MonospaceId value={entry.linkedOrderId} />
                      </Link>
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">{entry.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AuditPagination page={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}

