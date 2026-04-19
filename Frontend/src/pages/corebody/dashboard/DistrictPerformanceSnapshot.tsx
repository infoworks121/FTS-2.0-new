import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
  BarChart3, Building2, Users, TrendingUp, AlertTriangle,
  Loader2, MapPin, Search, ChevronDown, ChevronUp,
  ShieldAlert, CheckCircle2, XCircle,
} from "lucide-react";
import { coreBodyApi } from "@/lib/coreBodyApi";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const fmtShort = (v: number) => {
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1_000)   return `₹${(v / 1_000).toFixed(1)}K`;
  return `₹${v}`;
};

const capColor = (pct: number) =>
  pct >= 95 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500";

const capProgressClass = (pct: number) =>
  pct >= 95 ? "[&>div]:bg-red-500" : pct >= 80 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DistrictRow {
  district_id: number;
  district_name: string;
  core_body_a: { total: number; active: number; ytd_earnings: number; annual_cap: number; cap_hit: number };
  core_body_b: { total: number; active: number; mtd_earnings: number; monthly_cap: number; cap_hit: number };
  dealers: { total: number; active: number; order_volume: number; order_count: number };
}

interface CBUser {
  id: string; name: string; email: string; type: string; is_active: boolean;
  district_id: number; district_name: string;
  ytd_earnings: number; mtd_earnings: number; annual_cap: number; monthly_cap: number;
  cap_hit: boolean; investment_amount: number; activated_at: string | null; cap_pct: number;
}

interface DealerUser {
  id: string; name: string; email: string; is_active: boolean;
  district_id: number; district_name: string;
  order_count: number; order_volume: number; joined_at: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusPill({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
      <CheckCircle2 className="h-3 w-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
      <XCircle className="h-3 w-3" /> Inactive
    </span>
  );
}

function CapBar({ pct, cap_hit }: { pct: number; cap_hit: boolean }) {
  return (
    <div className="space-y-1 min-w-[100px]">
      <Progress value={pct} className={capProgressClass(pct)} />
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">{pct.toFixed(1)}%</span>
        {cap_hit && (
          <span className="text-red-400 flex items-center gap-0.5">
            <AlertTriangle className="h-2.5 w-2.5" /> Hit
          </span>
        )}
      </div>
    </div>
  );
}

// ─── District Card (expandable) ──────────────────────────────────────────────

function DistrictCard({
  d, cbUsers, dealerUsers,
}: {
  d: DistrictRow;
  cbUsers: CBUser[];
  dealerUsers: DealerUser[];
}) {
  const [open, setOpen] = useState(false);
  const capAPct = d.core_body_a.annual_cap > 0
    ? Math.min(100, (d.core_body_a.ytd_earnings / d.core_body_a.annual_cap) * 100) : 0;
  const capBPct = d.core_body_b.monthly_cap > 0
    ? Math.min(100, (d.core_body_b.mtd_earnings / d.core_body_b.monthly_cap) * 100) : 0;

  const districtCB = cbUsers.filter(u => u.district_id === d.district_id);
  const districtDealers = dealerUsers.filter(u => u.district_id === d.district_id);

  return (
    <Card className="overflow-hidden">
      {/* District Header Row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{d.district_name}</p>
            <p className="text-xs text-muted-foreground">
              {d.core_body_a.total + d.core_body_b.total} Core Bodies · {d.dealers.total} Dealers
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">CB-A YTD</p>
            <p className="text-sm font-mono font-medium">{fmtShort(d.core_body_a.ytd_earnings)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">CB-B MTD</p>
            <p className="text-sm font-mono font-medium">{fmtShort(d.core_body_b.mtd_earnings)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Order Vol.</p>
            <p className="text-sm font-mono font-medium">{fmtShort(d.dealers.order_volume)}</p>
          </div>
          {(d.core_body_a.cap_hit + d.core_body_b.cap_hit) > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {d.core_body_a.cap_hit + d.core_body_b.cap_hit} Cap Hit
            </Badge>
          )}
        </div>

        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
        )}
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {/* District Aggregate Strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
            {[
              { label: "CB-A Members", value: `${d.core_body_a.active}/${d.core_body_a.total}`, sub: "active/total" },
              { label: "CB-A Cap Usage", value: `${capAPct.toFixed(1)}%`, sub: fmt(d.core_body_a.ytd_earnings) },
              { label: "CB-B Members", value: `${d.core_body_b.active}/${d.core_body_b.total}`, sub: "active/total" },
              { label: "CB-B Cap Usage", value: `${capBPct.toFixed(1)}%`, sub: fmt(d.core_body_b.mtd_earnings) },
              { label: "Active Dealers", value: `${d.dealers.active}/${d.dealers.total}`, sub: `${d.dealers.order_count} orders` },
              { label: "Total Order Vol.", value: fmtShort(d.dealers.order_volume), sub: fmt(d.dealers.order_volume) },
            ].map((s) => (
              <div key={s.label} className="bg-card p-3">
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-sm font-semibold font-mono mt-0.5">{s.value}</p>
                <p className="text-[10px] text-muted-foreground truncate">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Core Body Individual Users */}
          {districtCB.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Core Body Members ({districtCB.length})
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs text-center">Type</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                      <TableHead className="text-xs">Earnings</TableHead>
                      <TableHead className="text-xs">Cap</TableHead>
                      <TableHead className="text-xs min-w-[120px]">Cap Usage</TableHead>
                      <TableHead className="text-xs">Invested</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {districtCB.map((u) => {
                      const earnings = u.type === "A" ? u.ytd_earnings : u.mtd_earnings;
                      const cap = u.type === "A" ? u.annual_cap : u.monthly_cap;
                      return (
                        <TableRow key={u.id} className={u.cap_hit ? "bg-red-500/5" : ""}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{u.name}</p>
                              <p className="text-[10px] text-muted-foreground">{u.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              u.type === "A"
                                ? "border-violet-500/40 text-violet-600 bg-violet-500/5"
                                : "border-indigo-500/40 text-indigo-500 bg-indigo-500/5"
                            }>
                              Type {u.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center"><StatusPill active={u.is_active} /></TableCell>
                          <TableCell className="font-mono text-sm">{fmtShort(earnings)}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{fmtShort(cap)}</TableCell>
                          <TableCell><CapBar pct={u.cap_pct} cap_hit={u.cap_hit} /></TableCell>
                          <TableCell className="font-mono text-sm">{fmtShort(u.investment_amount)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Dealer Individual Users */}
          {districtDealers.length > 0 && (
            <div>
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Dealers ({districtDealers.length})
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                      <TableHead className="text-xs text-center">Orders</TableHead>
                      <TableHead className="text-xs">Order Volume</TableHead>
                      <TableHead className="text-xs">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {districtDealers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">{u.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center"><StatusPill active={u.is_active} /></TableCell>
                        <TableCell className="text-center font-mono text-sm">{u.order_count}</TableCell>
                        <TableCell className="font-mono text-sm">{fmtShort(u.order_volume)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.joined_at ? new Date(u.joined_at).toLocaleDateString("en-IN") : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {districtCB.length === 0 && districtDealers.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              No individual users found for this district.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DistrictPerformanceSnapshot() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | cap-warning | active-only

  useEffect(() => {
    coreBodyApi.getDistrictPerformance()
      .then((res) => { setData(res); setLoading(false); })
      .catch(() => { setError("Failed to load district performance data."); setLoading(false); });
  }, []);

  const districts: DistrictRow[] = data?.districts ?? [];
  const coreBodyUsers: CBUser[] = data?.coreBodyUsers ?? [];
  const dealerUsers: DealerUser[] = data?.dealerUsers ?? [];
  const summary = data?.summary ?? {};

  const filtered = useMemo(() => {
    return districts.filter((d) => {
      if (search && !d.district_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus === "cap-warning") {
        const hasCapHit = (d.core_body_a.cap_hit + d.core_body_b.cap_hit) > 0;
        const capAPct = d.core_body_a.annual_cap > 0
          ? (d.core_body_a.ytd_earnings / d.core_body_a.annual_cap) * 100 : 0;
        const capBPct = d.core_body_b.monthly_cap > 0
          ? (d.core_body_b.mtd_earnings / d.core_body_b.monthly_cap) * 100 : 0;
        return hasCapHit || capAPct >= 80 || capBPct >= 80;
      }
      return true;
    });
  }, [districts, search, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 text-destructive p-8">
        <AlertTriangle className="h-5 w-5" /> <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          District Performance Snapshot
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Click any district card to see individual Core Body & Dealer performance with cap tracking.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Districts", value: summary.total_districts ?? 0, icon: MapPin, cls: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Core Body A", value: summary.total_core_body_a ?? 0, icon: Building2, cls: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Core Body B", value: summary.total_core_body_b ?? 0, icon: Building2, cls: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Dealers", value: summary.total_dealers ?? 0, icon: Users, cls: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Total Order Vol.", value: fmtShort(summary.total_order_volume ?? 0), icon: TrendingUp, cls: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Cap Hit", value: summary.total_cap_hit ?? 0, icon: ShieldAlert, cls: "text-red-500", bg: "bg-red-500/10" },
        ].map((k) => (
          <Card key={k.label} className="overflow-hidden">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-start justify-between">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <div className={`rounded-md p-1.5 ${k.bg}`}>
                  <k.icon className={`h-3.5 w-3.5 ${k.cls}`} />
                </div>
              </div>
              <p className="text-xl font-bold font-mono mt-1">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {[
          { color: "bg-emerald-500", label: "Healthy (<80%)" },
          { color: "bg-amber-500", label: "Nearing cap (80–95%)" },
          { color: "bg-red-500", label: "Cap reached (>95%)" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            <SelectItem value="cap-warning">⚠ Cap Warning / Hit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* District Cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            {search || filterStatus !== "all"
              ? "No districts match the current filters."
              : "No district data available yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DistrictCard
              key={d.district_id}
              d={d}
              cbUsers={coreBodyUsers}
              dealerUsers={dealerUsers}
            />
          ))}
        </div>
      )}
    </div>
  );
}
