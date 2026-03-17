import { useMemo, useState } from "react";
import { Archive, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditPagination, ExportButtons, MonospaceId, ReadonlyAuditStrip } from "@/components/audit/AuditPrimitives";

type RuleEntry = {
  version: string;
  ruleType: "Commission" | "Cap" | "TDS";
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedById: string;
  effectiveFrom: string;
  changeReason: string;
  timestamp: string;
  archived: boolean;
};

const history: RuleEntry[] = [
  {
    version: "v22",
    ruleType: "Commission",
    oldValue: "B2B 4.8%",
    newValue: "B2B 5.0%",
    changedBy: "Arif Hossain",
    changedById: "ADM-0012",
    effectiveFrom: "2026-02-20",
    changeReason: "Margin stabilization for high-volume SKUs",
    timestamp: "2026-02-18 18:52:11",
    archived: false,
  },
  {
    version: "v21",
    ruleType: "Cap",
    oldValue: "Daily cap ₹50,000",
    newValue: "Daily cap ₹45,000",
    changedBy: "Nabila Karim",
    changedById: "ADM-0048",
    effectiveFrom: "2026-02-17",
    changeReason: "Risk containment for repeated refund clusters",
    timestamp: "2026-02-16 12:09:42",
    archived: true,
  },
  {
    version: "v20",
    ruleType: "TDS",
    oldValue: "1.00%",
    newValue: "1.50%",
    changedBy: "Sadia Noor",
    changedById: "ADM-0062",
    effectiveFrom: "2026-02-10",
    changeReason: "Compliance update per revised statutory circular",
    timestamp: "2026-02-09 09:41:05",
    archived: true,
  },
  {
    version: "v19",
    ruleType: "Commission",
    oldValue: "Referral 2.0%",
    newValue: "Referral 1.8%",
    changedBy: "Tariq Reza",
    changedById: "ADM-0021",
    effectiveFrom: "2026-02-01",
    changeReason: "Abuse suppression against short-cycle stacking",
    timestamp: "2026-01-31 22:01:34",
    archived: true,
  },
  {
    version: "v18",
    ruleType: "Cap",
    oldValue: "Weekly cap ₹2,20,000",
    newValue: "Weekly cap ₹2,00,000",
    changedBy: "Arif Hossain",
    changedById: "ADM-0012",
    effectiveFrom: "2026-01-20",
    changeReason: "Wallet volatility control",
    timestamp: "2026-01-19 16:15:12",
    archived: true,
  },
];

const pageSize = 4;

export default function RuleChangeHistory() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return history.filter((item) => {
      const matchSearch =
        item.version.toLowerCase().includes(s) ||
        item.changeReason.toLowerCase().includes(s) ||
        item.changedById.toLowerCase().includes(s);
      const matchType = type === "all" || item.ruleType === type;
      const matchArchive =
        archiveFilter === "all" ||
        (archiveFilter === "archived" && item.archived) ||
        (archiveFilter === "active" && !item.archived);
      const datePart = item.timestamp.split(" ")[0];
      const matchFrom = !fromDate || datePart >= fromDate;
      const matchTo = !toDate || datePart <= toDate;
      return matchSearch && matchType && matchArchive && matchFrom && matchTo;
    });
  }, [search, type, archiveFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Rule Change History</h1>
          <p className="text-sm text-muted-foreground">Timeline + table view for every governance rule transition with version retention.</p>
        </div>
        <ExportButtons disabled={!fromDate || !toDate} />
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
              placeholder="Search by version / reason / changed-by ID"
            />
          </div>
          <Select value={type} onValueChange={(v) => { setPage(1); setType(v); }}>
            <SelectTrigger><SelectValue placeholder="Rule type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Commission">Commission</SelectItem>
              <SelectItem value="Cap">Cap</SelectItem>
              <SelectItem value="TDS">TDS</SelectItem>
            </SelectContent>
          </Select>
          <Select value={archiveFilter} onValueChange={(v) => { setPage(1); setArchiveFilter(v); }}>
            <SelectTrigger><SelectValue placeholder="Version state" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Versions</SelectItem>
              <SelectItem value="active">Active Versions</SelectItem>
              <SelectItem value="archived">Archived Versions</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} />
          <Input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} />
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Type</TableHead>
                <TableHead>Old Value → New Value</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Effective From</TableHead>
                <TableHead>Change Reason</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((item) => (
                <TableRow key={item.version} className="text-xs">
                  <TableCell>
                    <div className="space-y-1">
                      <p>{item.ruleType}</p>
                      <Badge variant="outline" className="font-mono text-[10px]">{item.version}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-mono text-[11px]">{item.oldValue}</p>
                      <p className="font-mono text-[11px]">{item.newValue}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{item.changedBy}</p>
                    <MonospaceId value={item.changedById} />
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-[11px]">{item.effectiveFrom}</p>
                    <Badge variant="outline" className="mt-1 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      Affects New Transactions Only
                    </Badge>
                  </TableCell>
                  <TableCell>{item.changeReason}</TableCell>
                  <TableCell>
                    <p className="font-mono text-[11px]">{item.timestamp}</p>
                    {item.archived && (
                      <Badge variant="outline" className="mt-1 gap-1 border-muted-foreground/30 text-muted-foreground">
                        <Archive className="h-3 w-3" />Archived (read-only)
                      </Badge>
                    )}
                  </TableCell>
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

