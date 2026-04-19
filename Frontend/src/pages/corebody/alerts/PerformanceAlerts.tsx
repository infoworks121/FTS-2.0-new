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
} from "@/components/corebody/alerts/AlertsPrimitives";

type EntityType = "Dealer" | "Stock Point";
type ImpactLevel = "Low" | "Medium" | "High";

type PerformanceAlert = {
  id: string;
  entityType: EntityType;
  entityName: string;
  dealerGroup: string;
  severity: AlertSeverity;
  metricBreached: string;
  expected: string;
  actual: string;
  impactLevel: ImpactLevel;
  recordedDate: string;
};

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 5;

const rows: PerformanceAlert[] = [
  {
    id: "SLA-260222-001",
    entityType: "Dealer",
    entityName: "Kumar Distribution",
    dealerGroup: "Kumar Distribution",
    severity: "Critical",
    metricBreached: "Delivery time SLA",
    expected: "24 hours",
    actual: "41 hours",
    impactLevel: "High",
    recordedDate: "2026-02-22",
  },
  {
    id: "SLA-260221-002",
    entityType: "Stock Point",
    entityName: "North Relay Point - 03",
    dealerGroup: "Kumar Distribution",
    severity: "Warning",
    metricBreached: "Fulfilment SLA",
    expected: "95%",
    actual: "88%",
    impactLevel: "Medium",
    recordedDate: "2026-02-21",
  },
  {
    id: "SLA-260219-003",
    entityType: "Dealer",
    entityName: "Priya Agencies",
    dealerGroup: "Priya Agencies",
    severity: "Warning",
    metricBreached: "Dispatch confirmation time",
    expected: "2 hours",
    actual: "5.5 hours",
    impactLevel: "Medium",
    recordedDate: "2026-02-19",
  },
  {
    id: "SLA-260218-004",
    entityType: "Stock Point",
    entityName: "City Stock Point - 01",
    dealerGroup: "Priya Agencies",
    severity: "Info",
    metricBreached: "Return processing SLA",
    expected: "48 hours",
    actual: "52 hours",
    impactLevel: "Low",
    recordedDate: "2026-02-18",
  },
  {
    id: "SLA-260214-005",
    entityType: "Dealer",
    entityName: "Mehta Supply",
    dealerGroup: "Mehta Supply",
    severity: "Critical",
    metricBreached: "Order fulfilment backlog",
    expected: "< 10 pending",
    actual: "22 pending",
    impactLevel: "High",
    recordedDate: "2026-02-14",
  },
  {
    id: "SLA-260211-006",
    entityType: "Stock Point",
    entityName: "Rural Link Stock Point - 09",
    dealerGroup: "Mehta Supply",
    severity: "Info",
    metricBreached: "Inventory sync delay",
    expected: "15 min",
    actual: "28 min",
    impactLevel: "Low",
    recordedDate: "2026-02-11",
  },
];

const impactBadge = (impact: ImpactLevel) => {
  if (impact === "High") return <Badge variant="destructive">High</Badge>;
  if (impact === "Medium") {
    return (
      <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
        Medium
      </Badge>
    );
  }
  return <Badge variant="secondary">Low</Badge>;
};

export default function PerformanceAlerts() {
  const [dealerFilter, setDealerFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<"all" | EntityType>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | AlertSeverity>("all");
  const [page, setPage] = useState(1);

  const dealerOptions = ["all", ...new Set(rows.map((r) => r.dealerGroup))];

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesDealer = dealerFilter === "all" || row.dealerGroup === dealerFilter;
      const matchesEntity = entityFilter === "all" || row.entityType === entityFilter;
      const matchesSeverity = severityFilter === "all" || row.severity === severityFilter;
      return matchesDealer && matchesEntity && matchesSeverity;
    });
  }, [dealerFilter, entityFilter, severityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">SLA / Performance Alerts</h1>
          <p className="text-sm text-muted-foreground">Read-only SLA and operations performance deviations for district oversight.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filtered.length} Alerts</Badge>
          <ReadOnlySystemBadge />
        </div>
      </div>

      <AlertFiltersCard title="Performance Alert Header">
        <SelectFilter
          label="Dealer"
          value={dealerFilter}
          onChange={(v) => {
            setPage(1);
            setDealerFilter(v);
          }}
          options={dealerOptions.map((d) => ({
            label: d === "all" ? "All" : d,
            value: d,
          }))}
        />
        <SelectFilter
          label="Stock Point / Dealer"
          entityFilter={entityFilter}
          onChange={(v) => {
            setPage(1);
            setEntityFilter(v);
          }}
          options={[
            { label: "All", value: "all" },
            { label: "Dealer", value: "Dealer" },
            { label: "Stock Point", value: "Stock Point" },
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
      </AlertFiltersCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alert List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {paginated.map((row) => (
            <div key={row.id} className="rounded-md border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {row.entityName} <span className="text-xs text-muted-foreground">({row.entityType})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{row.metricBreached}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={row.severity} />
                  {impactBadge(row.impactLevel)}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Expected vs Actual</p>
                  <p className="font-mono">
                    {row.expected} vs {row.actual}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dealer</p>
                  <p>{row.dealerGroup}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recorded date</p>
                  <p className="font-mono">{row.recordedDate}</p>
                </div>
              </div>
            </div>
          ))}

          {paginated.length === 0 && (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No performance alerts match selected filters.
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
