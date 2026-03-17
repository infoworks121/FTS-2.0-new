import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertFiltersCard,
  CapUtilizationStatus,
  PageControls,
  ReadOnlySystemBadge,
  SelectFilter,
} from "@/components/corebody/alerts/AlertsPrimitives";

type WarningType = "Soft" | "Final" | "Auto-Stop";
type DateRange = "all" | "7d" | "30d";

type CapWarningRow = {
  id: string;
  currentEarnings: number;
  thresholdCrossed: string;
  warningType: WarningType;
  triggerDate: string;
  daysAgo: number;
  systemNote: string;
};

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 5;

const capSummary = {
  totalCap: 250000,
  used: 226900,
};

const rows: CapWarningRow[] = [
  {
    id: "CAP-260222-001",
    currentEarnings: 226900,
    thresholdCrossed: "85% threshold crossed",
    warningType: "Final",
    triggerDate: "2026-02-22 10:10",
    daysAgo: 0,
    systemNote: "Cap utilization is in near-limit zone. Auto-stop may activate soon if earnings continue.",
  },
  {
    id: "CAP-260221-002",
    currentEarnings: 219400,
    thresholdCrossed: "80% threshold crossed",
    warningType: "Soft",
    triggerDate: "2026-02-21 14:45",
    daysAgo: 1,
    systemNote: "Soft warning generated for visibility and pacing control.",
  },
  {
    id: "CAP-260215-003",
    currentEarnings: 250000,
    thresholdCrossed: "100% threshold crossed",
    warningType: "Auto-Stop",
    triggerDate: "2026-02-15 18:25",
    daysAgo: 7,
    systemNote: "Earning stream auto-paused by system policy until cap-cycle reset.",
  },
  {
    id: "CAP-260210-004",
    currentEarnings: 211200,
    thresholdCrossed: "80% threshold crossed",
    warningType: "Soft",
    triggerDate: "2026-02-10 09:00",
    daysAgo: 12,
    systemNote: "District moved into monitored cap-usage zone.",
  },
  {
    id: "CAP-260130-005",
    currentEarnings: 237500,
    thresholdCrossed: "95% threshold crossed",
    warningType: "Final",
    triggerDate: "2026-01-30 16:20",
    daysAgo: 23,
    systemNote: "Final warning generated before cap exhaustion.",
  },
  {
    id: "CAP-260105-006",
    currentEarnings: 250000,
    thresholdCrossed: "100% threshold crossed",
    warningType: "Auto-Stop",
    triggerDate: "2026-01-05 11:05",
    daysAgo: 48,
    systemNote: "Auto-stop enforced for previous cycle, archived after reset.",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export default function CapWarnings() {
  const [warningFilter, setWarningFilter] = useState<"all" | WarningType>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange>("30d");
  const [page, setPage] = useState(1);

  const remaining = Math.max(0, capSummary.totalCap - capSummary.used);
  const utilization = (capSummary.used / capSummary.totalCap) * 100;

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesType = warningFilter === "all" || row.warningType === warningFilter;
      const rangeDays = dateRangeFilter === "7d" ? 7 : dateRangeFilter === "30d" ? 30 : Number.POSITIVE_INFINITY;
      const matchesRange = row.daysAgo <= rangeDays;
      return matchesType && matchesRange;
    });
  }, [warningFilter, dateRangeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Cap Limit Warnings</h1>
            <p className="text-sm text-muted-foreground">System-generated warnings for earning cap usage and auto-stop risk.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
              {filtered.length} Warnings
            </Badge>
            <ReadOnlySystemBadge />
          </div>
        </div>

        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-sm">Cap Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Total Cap Amount</p>
                <p className="mt-1 font-mono font-semibold">{formatCurrency(capSummary.totalCap)}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Used Amount</p>
                <p className="mt-1 font-mono font-semibold">{formatCurrency(capSummary.used)}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Remaining Amount</p>
                <p className="mt-1 font-mono font-semibold">{formatCurrency(remaining)}</p>
              </div>
            </div>
            <CapUtilizationStatus utilization={utilization} />
          </CardContent>
        </Card>

        <AlertFiltersCard>
          <SelectFilter
            label="Date range"
            value={dateRangeFilter}
            onChange={(v) => {
              setPage(1);
              setDateRangeFilter(v);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Last 7 days", value: "7d" },
              { label: "Last 30 days", value: "30d" },
            ]}
          />
          <SelectFilter
            label="Warning type"
            value={warningFilter}
            onChange={(v) => {
              setPage(1);
              setWarningFilter(v);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Soft", value: "Soft" },
              { label: "Final", value: "Final" },
              { label: "Auto-Stop", value: "Auto-Stop" },
            ]}
          />
          <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
            System Controlled: cap warnings are automatically triggered and cannot be overridden by Core Body.
          </div>
        </AlertFiltersCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Warning List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paginated.map((row) => (
              <div key={row.id} className="rounded-md border border-amber-500/25 bg-amber-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{formatCurrency(row.currentEarnings)} current earnings</p>
                    <p className="text-xs text-muted-foreground">{row.thresholdCrossed}</p>
                  </div>
                  <Badge
                    variant={row.warningType === "Auto-Stop" ? "destructive" : "outline"}
                    className={row.warningType === "Final" ? "border-amber-500/40 text-amber-700 dark:text-amber-300" : ""}
                  >
                    {row.warningType}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
                  <p className="font-mono text-muted-foreground">Trigger: {row.triggerDate}</p>
                  <p className="text-muted-foreground">{row.systemNote}</p>
                </div>
              </div>
            ))}

            {paginated.length === 0 && (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No warnings match selected filters.
              </div>
            )}

            <PageControls
              page={safePage}
              totalPages={totalPages}
              shown={paginated.length}
              total={filtered.length}
              label="warnings"
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
