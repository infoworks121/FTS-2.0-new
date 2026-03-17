import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ActionType,
  ActionTypeBadge,
  AuditPagination,
  ExportButtons,
  MonospaceId,
  ReadonlyAuditStrip,
} from "@/components/audit/AuditPrimitives";

type AdminActivityRow = {
  id: string;
  adminName: string;
  adminId: string;
  action: ActionType;
  module: "Orders" | "Wallets" | "Users" | "Commission" | "Risk";
  entityId: string;
  beforeAfterSummary: string;
  fullDiff: string[];
  timestamp: string;
  date: string;
  ip: string;
  device: string;
};

const rows: AdminActivityRow[] = [
  {
    id: "AAL-900001",
    adminName: "Arif Hossain",
    adminId: "ADM-0012",
    action: "Update",
    module: "Orders",
    entityId: "ORD-487720",
    beforeAfterSummary: "Order status: Pending → Approved",
    fullDiff: ["status: Pending", "status: Approved", "approval_code: — → APR-7721"],
    timestamp: "2026-02-19 13:41:22",
    date: "2026-02-19",
    ip: "103.210.52.11",
    device: "Chrome 132 / Windows 11",
  },
  {
    id: "AAL-900002",
    adminName: "Nabila Karim",
    adminId: "ADM-0048",
    action: "Freeze",
    module: "Wallets",
    entityId: "WLT-220991",
    beforeAfterSummary: "Wallet state: Active → Frozen",
    fullDiff: ["state: Active", "state: Frozen", "reason: Fraud anomaly score > 0.94"],
    timestamp: "2026-02-19 13:08:04",
    date: "2026-02-19",
    ip: "45.114.128.92",
    device: "Edge 131 / Windows 11",
  },
  {
    id: "AAL-900003",
    adminName: "Tariq Reza",
    adminId: "ADM-0021",
    action: "Create",
    module: "Users",
    entityId: "USR-118200",
    beforeAfterSummary: "Role assigned: Businessman",
    fullDiff: ["new_user: true", "role: Businessman", "tier: Entry"],
    timestamp: "2026-02-18 21:19:57",
    date: "2026-02-18",
    ip: "103.80.142.51",
    device: "Firefox 134 / Ubuntu",
  },
  {
    id: "AAL-900004",
    adminName: "Arif Hossain",
    adminId: "ADM-0012",
    action: "Approve",
    module: "Commission",
    entityId: "RULE-COM-22",
    beforeAfterSummary: "Rule version: v21 → v22",
    fullDiff: ["b2b_rate: 4.8%", "b2b_rate: 5.0%", "effective_from: 2026-02-20"],
    timestamp: "2026-02-18 18:52:11",
    date: "2026-02-18",
    ip: "103.210.52.11",
    device: "Chrome 132 / Windows 11",
  },
  {
    id: "AAL-900005",
    adminName: "Nabila Karim",
    adminId: "ADM-0048",
    action: "Update",
    module: "Risk",
    entityId: "RISK-DEV-771",
    beforeAfterSummary: "Device risk score: 72 → 91",
    fullDiff: ["risk_score: 72", "risk_score: 91", "flag: suspicious_multi_account"],
    timestamp: "2026-02-17 17:33:45",
    date: "2026-02-17",
    ip: "45.114.128.92",
    device: "Edge 131 / Windows 11",
  },
  {
    id: "AAL-900006",
    adminName: "Sadia Noor",
    adminId: "ADM-0062",
    action: "Approve",
    module: "Orders",
    entityId: "ORD-487410",
    beforeAfterSummary: "Refund status: Review → Approved",
    fullDiff: ["refund_status: InReview", "refund_status: Approved", "approver: ADM-0062"],
    timestamp: "2026-02-17 11:05:39",
    date: "2026-02-17",
    ip: "119.148.26.140",
    device: "Safari 18 / macOS",
  },
];

const pageSize = 5;

export default function AdminActivityLogs() {
  const [search, setSearch] = useState("");
  const [admin, setAdmin] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const s = search.toLowerCase();

    return rows.filter((row) => {
      const matchSearch =
        row.entityId.toLowerCase().includes(s) ||
        row.adminId.toLowerCase().includes(s) ||
        row.adminName.toLowerCase().includes(s);
      const matchAdmin = admin === "all" || row.adminId === admin;
      const matchModule = moduleFilter === "all" || row.module === moduleFilter;
      const matchFrom = !fromDate || row.date >= fromDate;
      const matchTo = !toDate || row.date <= toDate;
      return matchSearch && matchAdmin && matchModule && matchFrom && matchTo;
    });
  }, [search, admin, moduleFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const exportLocked = !fromDate || !toDate;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Admin Activity Logs</h1>
          <p className="text-sm text-muted-foreground">Who changed what, when, from where, and with what entity impact.</p>
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
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by entity ID / admin name / admin ID"
            />
          </div>
          <Select value={admin} onValueChange={(v) => { setPage(1); setAdmin(v); }}>
            <SelectTrigger><SelectValue placeholder="Admin" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Admins</SelectItem>
              <SelectItem value="ADM-0012">Arif Hossain (ADM-0012)</SelectItem>
              <SelectItem value="ADM-0048">Nabila Karim (ADM-0048)</SelectItem>
              <SelectItem value="ADM-0021">Tariq Reza (ADM-0021)</SelectItem>
              <SelectItem value="ADM-0062">Sadia Noor (ADM-0062)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={moduleFilter} onValueChange={(v) => { setPage(1); setModuleFilter(v); }}>
            <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="Orders">Orders</SelectItem>
              <SelectItem value="Wallets">Wallets</SelectItem>
              <SelectItem value="Users">Users</SelectItem>
              <SelectItem value="Commission">Commission</SelectItem>
              <SelectItem value="Risk">Risk</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} />
          <Input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} />
        </div>

        <div className="text-xs text-muted-foreground">
          High-density audit table • Expand any row for full diff • Search supports entity drill-down
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Admin Name / ID</TableHead>
                <TableHead>Action Type</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Affected Entity ID</TableHead>
                <TableHead>Before → After</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP / Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => {
                const open = !!expandedRows[row.id];
                return (
                  <Fragment key={row.id}>
                    <TableRow className="text-xs">
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setExpandedRows((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
                        >
                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{row.adminName}</div>
                        <MonospaceId value={row.adminId} />
                      </TableCell>
                      <TableCell><ActionTypeBadge action={row.action} /></TableCell>
                      <TableCell>{row.module}</TableCell>
                      <TableCell>
                        <Link className="underline underline-offset-2" to={`/admin/orders?entity=${row.entityId}`}>
                          <MonospaceId value={row.entityId} />
                        </Link>
                      </TableCell>
                      <TableCell>{row.beforeAfterSummary}</TableCell>
                      <TableCell className="font-mono text-[11px]">{row.timestamp}</TableCell>
                      <TableCell>
                        <div className="font-mono text-[11px]">{row.ip}</div>
                        <div className="text-muted-foreground">{row.device}</div>
                      </TableCell>
                    </TableRow>
                    {open && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30 py-3">
                          <div className="space-y-1 text-xs">
                            <p className="font-medium">Detailed field-level diff</p>
                            {row.fullDiff.map((d) => (
                              <p key={d} className="font-mono text-[11px]">{d}</p>
                            ))}
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

        <AuditPagination page={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}


