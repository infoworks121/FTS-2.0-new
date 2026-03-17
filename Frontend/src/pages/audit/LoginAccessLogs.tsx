import { useMemo, useState } from "react";
import { AlertTriangle, Globe2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AccessResultBadge,
  AuditPagination,
  ExportButtons,
  MonospaceId,
  ReadonlyAuditStrip,
} from "@/components/audit/AuditPrimitives";

type AccessLogRow = {
  id: string;
  userName: string;
  role: "Admin" | "Core Body" | "Businessman";
  method: "Password" | "2FA" | "SSO";
  result: "Success" | "Failed";
  ip: string;
  deviceBrowser: string;
  location: string;
  timestamp: string;
  date: string;
  fingerprint: string;
  suspicious: boolean;
};

const logs: AccessLogRow[] = [
  {
    id: "ACC-55001",
    userName: "Arif Hossain",
    role: "Admin",
    method: "2FA",
    result: "Success",
    ip: "103.210.52.11",
    deviceBrowser: "Win11 / Chrome 132",
    location: "Dhaka, BD",
    timestamp: "2026-02-19 13:39:48",
    date: "2026-02-19",
    fingerprint: "fp-1f4a8c90",
    suspicious: false,
  },
  {
    id: "ACC-55002",
    userName: "Unknown Attempt",
    role: "Admin",
    method: "Password",
    result: "Failed",
    ip: "185.244.25.3",
    deviceBrowser: "Linux / Headless Chrome",
    location: "Frankfurt, DE",
    timestamp: "2026-02-19 13:17:12",
    date: "2026-02-19",
    fingerprint: "fp-8cbf102d",
    suspicious: true,
  },
  {
    id: "ACC-55003",
    userName: "Nabila Karim",
    role: "Admin",
    method: "SSO",
    result: "Success",
    ip: "45.114.128.92",
    deviceBrowser: "Win11 / Edge 131",
    location: "Chattogram, BD",
    timestamp: "2026-02-18 21:03:07",
    date: "2026-02-18",
    fingerprint: "fp-23d1aa8e",
    suspicious: false,
  },
  {
    id: "ACC-55004",
    userName: "Tariq Reza",
    role: "Core Body",
    method: "2FA",
    result: "Success",
    ip: "103.80.142.51",
    deviceBrowser: "Ubuntu / Firefox 134",
    location: "Rajshahi, BD",
    timestamp: "2026-02-18 20:55:43",
    date: "2026-02-18",
    fingerprint: "fp-e71e4410",
    suspicious: false,
  },
  {
    id: "ACC-55005",
    userName: "Sadia Noor",
    role: "Admin",
    method: "Password",
    result: "Failed",
    ip: "119.148.26.140",
    deviceBrowser: "macOS / Safari 18",
    location: "Dhaka, BD",
    timestamp: "2026-02-17 22:43:10",
    date: "2026-02-17",
    fingerprint: "fp-623ba231",
    suspicious: false,
  },
  {
    id: "ACC-55006",
    userName: "Hasib Rahman",
    role: "Businessman",
    method: "Password",
    result: "Success",
    ip: "118.179.90.62",
    deviceBrowser: "Android / Chrome 131",
    location: "Khulna, BD",
    timestamp: "2026-02-17 18:12:58",
    date: "2026-02-17",
    fingerprint: "fp-0cba9932",
    suspicious: false,
  },
];

const pageSize = 5;

export default function LoginAccessLogs() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return logs.filter((log) => {
      const matchSearch =
        log.userName.toLowerCase().includes(s) ||
        log.ip.toLowerCase().includes(s) ||
        log.fingerprint.toLowerCase().includes(s);
      const matchRole = roleFilter === "all" || log.role === roleFilter;
      const matchResult = resultFilter === "all" || log.result === resultFilter;
      const matchFrom = !fromDate || log.date >= fromDate;
      const matchTo = !toDate || log.date <= toDate;
      return matchSearch && matchRole && matchResult && matchFrom && matchTo;
    });
  }, [search, roleFilter, resultFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Login &amp; Access Logs</h1>
          <p className="text-sm text-muted-foreground">Security-grade access journal with authentication outcome, geo context, and device fingerprinting.</p>
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
              placeholder="Search user / IP / fingerprint"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setPage(1); setRoleFilter(v); }}>
            <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Core Body">Core Body</SelectItem>
              <SelectItem value="Businessman">Businessman</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resultFilter} onValueChange={(v) => { setPage(1); setResultFilter(v); }}>
            <SelectTrigger><SelectValue placeholder="Result" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} onChange={(e) => { setPage(1); setFromDate(e.target.value); }} />
          <Input type="date" value={toDate} onChange={(e) => { setPage(1); setToDate(e.target.value); }} />
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name / Role</TableHead>
                <TableHead>Login Method</TableHead>
                <TableHead>Success / Failed</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device / Browser</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow key={row.id} className="text-xs">
                  <TableCell>
                    <p className="font-medium">{row.userName}</p>
                    <p className="text-muted-foreground">{row.role}</p>
                  </TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <AccessResultBadge result={row.result} />
                      {row.result === "Failed" && (
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                          Failed login alert
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">{row.ip}</TableCell>
                  <TableCell>
                    <p>{row.deviceBrowser}</p>
                    <p className="text-muted-foreground">
                      <MonospaceId value={row.fingerprint} />
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{row.location}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">Geo preview available</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-[11px]">{row.timestamp}</p>
                    {row.suspicious && (
                      <Badge variant="outline" className="mt-1 gap-1 border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
                        <AlertTriangle className="h-3 w-3" />Suspicious access
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

