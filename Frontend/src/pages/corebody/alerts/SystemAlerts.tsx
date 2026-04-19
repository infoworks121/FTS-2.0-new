import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertFiltersCard,
  AlertSeverity,
  PageControls,
  ReadOnlySystemBadge,
  SelectFilter,
  SeverityBadge,
  SeverityIcon,
} from "@/components/corebody/alerts/AlertsPrimitives";

type DateRange = "all" | "7d" | "30d" | "90d";

type SystemAlert = {
  id: string;
  title: string;
  category: "System";
  severity: AlertSeverity;
  timestamp: string;
  daysAgo: number;
  description: string;
};

const ITEMS_PER_PAGE = 5;
const DISTRICT_NAME = "District North";

const rows: SystemAlert[] = [
  {
    id: "SYS-260222-001",
    title: "Compliance Rule Update Released",
    category: "System",
    severity: "Warning",
    timestamp: "2026-02-22 09:40",
    daysAgo: 0,
    description: "Revised district KYC check interval is now applied for all downstream dealer records.",
  },
  {
    id: "SYS-260221-002",
    title: "System Maintenance Window Scheduled",
    category: "System",
    severity: "Info",
    timestamp: "2026-02-21 20:10",
    daysAgo: 1,
    description: "Planned platform maintenance on 24 Feb, 02:00–03:30 IST. Alerts remain visible during maintenance.",
  },
  {
    id: "SYS-260220-003",
    title: "Cap Logic Enforcement Reminder",
    category: "System",
    severity: "Critical",
    timestamp: "2026-02-20 11:25",
    daysAgo: 2,
    description: "District earning stream is approaching strict auto-stop threshold based on monthly cap rules.",
  },
  {
    id: "SYS-260217-004",
    title: "Policy Broadcast: Read-only Alert Scope",
    category: "System",
    severity: "Info",
    timestamp: "2026-02-17 10:15",
    daysAgo: 5,
    description: "Activity Alerts module remains system-managed. No close, dismiss, or manual action is enabled.",
  },
  {
    id: "SYS-260210-005",
    title: "Dealer Compliance Lag Notice",
    category: "System",
    severity: "Warning",
    timestamp: "2026-02-10 15:40",
    daysAgo: 12,
    description: "3 district dealers have incomplete compliance records and are under automated monitoring.",
  },
  {
    id: "SYS-260125-006",
    title: "Alert Retention Policy Applied",
    category: "System",
    severity: "Info",
    timestamp: "2026-01-25 08:00",
    daysAgo: 28,
    description: "Resolved alerts now move to historical view automatically while preserving audit continuity.",
  },
  {
    id: "SYS-260101-007",
    title: "Security Patch Completion",
    category: "System",
    severity: "Info",
    timestamp: "2026-01-01 07:30",
    daysAgo: 52,
    description: "Core notification channels were upgraded with hardened transport policies.",
  },
];

export default function SystemAlerts() {
  const [severityFilter, setSeverityFilter] = useState<"all" | AlertSeverity>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange>("30d");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesSeverity = severityFilter === "all" || row.severity === severityFilter;
      const rangeDays =
        dateRangeFilter === "7d" ? 7 : dateRangeFilter === "30d" ? 30 : dateRangeFilter === "90d" ? 90 : Number.POSITIVE_INFINITY;
      const matchesRange = row.daysAgo <= rangeDays;
      return matchesSeverity && matchesRange;
    });
  }, [severityFilter, dateRangeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">System Alerts</h1>
          <p className="text-sm text-muted-foreground">Platform-generated notices for compliance and operational awareness.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filtered.length} Active</Badge>
          <ReadOnlySystemBadge />
        </div>
      </div>

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
            { label: "Last 90 days", value: "90d" },
          ]}
        />
        <SelectFilter
          label="Severity"
          value={severityFilter}
          onChange={(v) => {
            setPage(1);
            setSeverityFilter(v);
          }}
          options={[
            { label: "All", value: "all" },
            { label: "Info", value: "Info" },
            { label: "Warning", value: "Warning" },
            { label: "Critical", value: "Critical" },
          ]}
        />
        <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
          Timeline is read-only and sorted latest first. Alerts auto-expire once resolved by system logic.
        </div>
      </AlertFiltersCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alerts Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {paginated.map((alert) => (
            <div key={alert.id} className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SeverityIcon severity={alert.severity} />
                    <h3 className="text-sm font-semibold">{alert.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {alert.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SeverityBadge severity={alert.severity} />
                  <span className="font-mono text-xs text-muted-foreground">{alert.timestamp}</span>
                </div>
              </div>
            </div>
          ))}

          {paginated.length === 0 && (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No system alerts match selected filters.
            </div>
          )}

          <PageControls
            page={safePage}
            totalPages={totalPages}
            shown={paginated.length}
            total={filtered.length}
            label="alerts"
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
