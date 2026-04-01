import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserRound, UserCheck, UserX, Search } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import referralApi, { ReferredUser } from "@/lib/api/referral";
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

export default function MyReferralsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ReferralMemberStatus>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selected, setSelected] = useState<ReferralMember | null>(null);

  const { data: rawMembers = [], isLoading } = useQuery({
    queryKey: ["referral-list"],
    queryFn: referralApi.getList,
  });

  const members: ReferralMember[] = useMemo(() => {
    return rawMembers.map((member: ReferredUser) => ({
      id: member.id,
      name: member.full_name,
      mobile: member.phone || "N/A",
      userId: member.id.split('-')[0].toUpperCase(), // Rough mock of short user id
      roleType: member.role_label as RoleType,
      joinedDate: new Date(member.created_at).toISOString().split('T')[0],
      status: "Active", // For now we assume active unless backend tells otherwise
      lastTransactionDate: "N/A", // We might not have this from backend directly yet
    }));
  }, [rawMembers]);

  const totals = useMemo(() => {
    return {
      total: members.length,
      active: members.filter((m) => m.status === "Active").length,
      blocked: members.filter((m) => m.status === "Inactive" || m.status === "Suspended").length,
    };
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
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
  }, [members, fromDate, query, status, toDate]);

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
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
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
        </>
        )}
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

