import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertFiltersCard, PageControls, ReadOnlySystemBadge, SelectFilter } from "@/components/corebody/alerts/AlertsPrimitives";

type EntityType = "Self" | "Dealer" | "Businessman";
type RiskLevel = "Low" | "Medium" | "High";

type InactivityRow = {
  id: string;
  entityType: EntityType;
  nameOrId: string;
  lastActivityDate: string;
  inactiveDays: number;
  riskLevel: RiskLevel;
  autoActionDate: string;
};

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 6;

const rows: InactivityRow[] = [
  {
    id: "INACT-260222-001",
    entityType: "Self",
    nameOrId: "Core Body - DN-01",
    lastActivityDate: "2026-02-19",
    inactiveDays: 3,
    riskLevel: "Low",
    autoActionDate: "—",
  },
  {
    id: "INACT-260222-002",
    entityType: "Dealer",
    nameOrId: "Kumar Distribution / DL-119",
    lastActivityDate: "2026-02-05",
    inactiveDays: 17,
    riskLevel: "Medium",
    autoActionDate: "2026-02-28",
  },
  {
    id: "INACT-260222-003",
    entityType: "Dealer",
    nameOrId: "Singh & Co / DL-083",
    lastActivityDate: "2026-01-31",
    inactiveDays: 22,
    riskLevel: "High",
    autoActionDate: "2026-02-24",
  },
  {
    id: "INACT-260222-004",
    entityType: "Businessman",
    nameOrId: "Amit Traders / BM-902",
    lastActivityDate: "2026-02-08",
    inactiveDays: 14,
    riskLevel: "Medium",
    autoActionDate: "2026-03-03",
  },
  {
    id: "INACT-260222-005",
    entityType: "Businessman",
    nameOrId: "Rajesh Kumar / BM-741",
    lastActivityDate: "2026-02-16",
    inactiveDays: 6,
    riskLevel: "Low",
    autoActionDate: "—",
  },
  {
    id: "INACT-260222-006",
    entityType: "Businessman",
    nameOrId: "Suresh Enterprises / BM-312",
    lastActivityDate: "2026-02-01",
    inactiveDays: 21,
    riskLevel: "High",
    autoActionDate: "2026-02-23",
  },
  {
    id: "INACT-260222-007",
    entityType: "Dealer",
    nameOrId: "Priya Agencies / DL-041",
    lastActivityDate: "2026-02-11",
    inactiveDays: 11,
    riskLevel: "Low",
    autoActionDate: "—",
  },
];

const riskBadge = (risk: RiskLevel) => {
  if (risk === "High") return <Badge variant="destructive">High</Badge>;
  if (risk === "Medium") {
    return (
      <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
        Medium
      </Badge>
    );
  }
  return <Badge variant="secondary">Low</Badge>;
};

export default function InactivityNotices() {
  const [entityFilter, setEntityFilter] = useState<"all" | EntityType>("all");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const [page, setPage] = useState(1);

  const summary = {
    self: rows.filter((r) => r.entityType === "Self" && r.inactiveDays >= 1).length,
    dealer: rows.filter((r) => r.entityType === "Dealer" && r.inactiveDays >= 1).length,
    businessman: rows.filter((r) => r.entityType === "Businessman" && r.inactiveDays >= 1).length,
  };

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesEntity = entityFilter === "all" || row.entityType === entityFilter;
      const matchesRisk = riskFilter === "all" || row.riskLevel === riskFilter;
      return matchesEntity && matchesRisk;
    });
  }, [entityFilter, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Inactivity Notices</h1>
            <p className="text-sm text-muted-foreground">System monitoring of inactivity risk for self, dealers, and businessmen.</p>
          </div>
          <ReadOnlySystemBadge />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Self inactivity</p>
              <p className="mt-1 text-2xl font-semibold">{summary.self}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Dealer inactivity</p>
              <p className="mt-1 text-2xl font-semibold">{summary.dealer}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Businessman inactivity</p>
              <p className="mt-1 text-2xl font-semibold">{summary.businessman}</p>
            </CardContent>
          </Card>
        </div>

        <AlertFiltersCard>
          <SelectFilter
            label="Entity type"
            value={entityFilter}
            onChange={(v) => {
              setPage(1);
              setEntityFilter(v);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Self", value: "Self" },
              { label: "Dealer", value: "Dealer" },
              { label: "Businessman", value: "Businessman" },
            ]}
          />
          <SelectFilter
            label="Risk level"
            value={riskFilter}
            onChange={(v) => {
              setPage(1);
              setRiskFilter(v);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Low", value: "Low" },
              { label: "Medium", value: "Medium" },
              { label: "High", value: "High" },
            ]}
          />
          <div className="rounded-md border p-3 text-xs text-muted-foreground">
            Informational only. Auto-action is executed by system policies where applicable.
          </div>
        </AlertFiltersCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Inactivity Table</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Name / ID</TableHead>
                    <TableHead>Last Activity Date</TableHead>
                    <TableHead>Inactive Days</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Auto-action Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((row) => {
                    const isNearAutoDeactivation = row.riskLevel === "High" && row.autoActionDate !== "—";
                    return (
                      <TableRow key={row.id} className={isNearAutoDeactivation ? "bg-destructive/5" : ""}>
                        <TableCell>{row.entityType}</TableCell>
                        <TableCell className="text-xs">{row.nameOrId}</TableCell>
                        <TableCell className="font-mono text-xs">{row.lastActivityDate}</TableCell>
                        <TableCell className="font-mono">{row.inactiveDays}</TableCell>
                        <TableCell>{riskBadge(row.riskLevel)}</TableCell>
                        <TableCell className={isNearAutoDeactivation ? "font-mono text-xs text-destructive" : "font-mono text-xs"}>
                          {row.autoActionDate}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No inactivity notices match selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <PageControls
              page={safePage}
              totalPages={totalPages}
              shown={paginated.length}
              total={filtered.length}
              label="records"
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
