import { useMemo, useState } from "react";
import { UserRound, UserCheck, UserX, Search } from "lucide-react";
import { KPICard } from "@/components/KPICard";
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ReferralMemberStatus, ReferralMemberStatusBadge, ReferralRuleIndicators } from "@/components/businessman/ReferralPrimitives";

type RoleType = "Customer" | "Businessman";

type ReferralMember = {
  id: string;
  name: string;
  mobile: string;
  userId: string;
  roleType: RoleType;
  joinedDate: string;
  status: ReferralMemberStatus;
  lastTransactionDate: string;
};

const MEMBERS: ReferralMember[] = [
  {
    id: "R-001",
    name: "Subhajit Das",
    mobile: "9876543210",
    userId: "CUS-220918",
    roleType: "Customer",
    joinedDate: "2026-01-05",
    status: "Active",
    lastTransactionDate: "2026-02-20",
  },
  {
    id: "R-002",
    name: "Mina Pal",
    mobile: "9123456780",
    userId: "BUS-219001",
    roleType: "Businessman",
    joinedDate: "2026-01-09",
    status: "Inactive",
    lastTransactionDate: "2026-01-19",
  },
  {
    id: "R-003",
    name: "Rakesh Modak",
    mobile: "9033001122",
    userId: "CUS-230112",
    roleType: "Customer",
    joinedDate: "2026-01-21",
    status: "Suspended",
    lastTransactionDate: "2026-01-28",
  },
  {
    id: "R-004",
    name: "Priya Koley",
    mobile: "9000011122",
    userId: "CUS-231554",
    roleType: "Customer",
    joinedDate: "2026-02-03",
    status: "Active",
    lastTransactionDate: "2026-02-22",
  },
  {
    id: "R-005",
    name: "Nirmal Sen",
    mobile: "9887002233",
    userId: "BUS-223087",
    roleType: "Businessman",
    joinedDate: "2026-02-10",
    status: "Active",
    lastTransactionDate: "2026-02-18",
  },
];

export default function MyReferralsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ReferralMemberStatus>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<ReferralMember | null>(null);

  const totals = useMemo(() => {
    return {
      total: MEMBERS.length,
      active: MEMBERS.filter((m) => m.status === "Active").length,
      blocked: MEMBERS.filter((m) => m.status === "Inactive" || m.status === "Suspended").length,
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEMBERS.filter((member) => {
      const ts = new Date(member.joinedDate).getTime();
      const byFrom = !fromDate || ts >= new Date(fromDate).getTime();
      const byTo = !toDate || ts <= new Date(toDate).getTime() + 86400000 - 1;
      const byStatus = status === "all" || member.status === status;
      const byQuery =
        !q ||
        member.name.toLowerCase().includes(q) ||
        member.mobile.includes(q) ||
        member.userId.toLowerCase().includes(q);
      return byFrom && byTo && byStatus && byQuery;
    });
  }, [fromDate, query, status, toDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">My Referrals</h1>
        <p className="text-sm text-muted-foreground">Direct referrals only. Data is read-only for transparent audit visibility.</p>
      </div>

      <ReferralRuleIndicators />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Total Referrals" value={String(totals.total)} icon={UserRound} variant="trust" />
        <KPICard title="Active Referrals" value={String(totals.active)} icon={UserCheck} variant="profit" />
        <KPICard title="Inactive / Blocked" value={String(totals.blocked)} icon={UserX} variant="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Name / Mobile</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" placeholder="Search by name, mobile, user ID" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: "all" | ReferralMemberStatus) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Joined From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Joined To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Referral List (Read-only)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {filtered.map((row) => (
              <div key={row.id} className="rounded-md border bg-card p-3 space-y-2" onClick={() => setSelected(row)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{row.mobile}</p>
                  </div>
                  <ReferralMemberStatusBadge status={row.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p><span className="text-muted-foreground">User ID:</span> <span className="font-mono">{row.userId}</span></p>
                  <p><span className="text-muted-foreground">Role:</span> {row.roleType}</p>
                  <p><span className="text-muted-foreground">Joined:</span> <span className="font-mono">{row.joinedDate}</span></p>
                  <p><span className="text-muted-foreground">Last Txn:</span> <span className="font-mono">{row.lastTransactionDate}</span></p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-md border py-8 text-center text-sm text-muted-foreground">
                No referrals match current filters.
              </div>
            )}
          </div>

          <div className="hidden md:block rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referral Name</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Last Transaction Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => setSelected(row)}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{row.mobile}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.userId}</TableCell>
                    <TableCell>{row.roleType}</TableCell>
                    <TableCell className="font-mono text-xs">{row.joinedDate}</TableCell>
                    <TableCell>
                      <ReferralMemberStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.lastTransactionDate}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No referrals match current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Drawer open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Referral Profile</DrawerTitle>
            <DrawerDescription>Read-only profile drawer. Referral records are immutable and cannot be edited or deleted.</DrawerDescription>
          </DrawerHeader>
          {selected && (
            <div className="p-4 pt-0 pb-6">
              <div className="rounded-md border p-3 text-sm space-y-2">
                <p><span className="text-muted-foreground">Name:</span> {selected.name}</p>
                <p><span className="text-muted-foreground">Mobile:</span> <span className="font-mono">{selected.mobile}</span></p>
                <p><span className="text-muted-foreground">User ID:</span> <span className="font-mono">{selected.userId}</span></p>
                <p><span className="text-muted-foreground">Role Type:</span> {selected.roleType}</p>
                <p><span className="text-muted-foreground">Joined Date:</span> <span className="font-mono">{selected.joinedDate}</span></p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Current Status:</span>
                  <ReferralMemberStatusBadge status={selected.status} />
                </div>
                <p><span className="text-muted-foreground">Last Transaction:</span> <span className="font-mono">{selected.lastTransactionDate}</span></p>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

