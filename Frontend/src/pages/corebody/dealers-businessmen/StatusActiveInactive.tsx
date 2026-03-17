import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EntityStatus = "Active" | "Inactive";
type EntityType = "Dealer" | "Businessman";
type RiskLevel = "Low" | "Medium" | "High";

type NetworkEntity = {
  entityType: EntityType;
  name: string;
  status: EntityStatus;
  lastActivityDate: string;
  inactivityDuration: string;
  riskLevel: RiskLevel;
};

const DISTRICT_NAME = "District North";

const networkData: NetworkEntity[] = [
  { entityType: "Dealer", name: "Arjun Traders", status: "Active", lastActivityDate: "2026-02-21", inactivityDuration: "1 day", riskLevel: "Low" },
  { entityType: "Dealer", name: "Kumar Distribution", status: "Inactive", lastActivityDate: "2026-01-28", inactivityDuration: "25 days", riskLevel: "High" },
  { entityType: "Dealer", name: "Priya Agencies", status: "Active", lastActivityDate: "2026-02-20", inactivityDuration: "2 days", riskLevel: "Low" },
  { entityType: "Businessman", name: "Rakesh Enterprise", status: "Active", lastActivityDate: "2026-02-21", inactivityDuration: "1 day", riskLevel: "Low" },
  { entityType: "Businessman", name: "Kisan Connect", status: "Inactive", lastActivityDate: "2026-01-30", inactivityDuration: "23 days", riskLevel: "High" },
  { entityType: "Businessman", name: "FarmEdge Distributor", status: "Inactive", lastActivityDate: "2026-01-18", inactivityDuration: "35 days", riskLevel: "High" },
  { entityType: "Businessman", name: "AgroKart Point", status: "Active", lastActivityDate: "2026-02-20", inactivityDuration: "2 days", riskLevel: "Low" },
  { entityType: "Dealer", name: "Sunrise Agro", status: "Active", lastActivityDate: "2026-02-18", inactivityDuration: "4 days", riskLevel: "Medium" },
];

const riskClass: Record<RiskLevel, string> = {
  Low: "border-emerald-500/40 text-emerald-600",
  Medium: "border-amber-500/40 text-amber-600",
  High: "border-rose-500/40 text-rose-600",
};

export default function StatusActiveInactive() {
  const [tab, setTab] = useState<EntityStatus>("Active");

  const activeDealers = useMemo(
    () => networkData.filter((item) => item.entityType === "Dealer" && item.status === "Active").length,
    []
  );
  const inactiveDealers = useMemo(
    () => networkData.filter((item) => item.entityType === "Dealer" && item.status === "Inactive").length,
    []
  );
  const activeBusinessmen = useMemo(
    () => networkData.filter((item) => item.entityType === "Businessman" && item.status === "Active").length,
    []
  );
  const inactiveBusinessmen = useMemo(
    () => networkData.filter((item) => item.entityType === "Businessman" && item.status === "Inactive").length,
    []
  );

  const dataForTab = useMemo(() => networkData.filter((item) => item.status === tab), [tab]);

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Status (Active / Inactive)</h1>
          <p className="text-sm text-muted-foreground">
            District network health with inactivity and risk visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Active Dealers</p><p className="text-2xl font-bold">{activeDealers}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Inactive Dealers</p><p className="text-2xl font-bold text-amber-600">{inactiveDealers}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Active Businessmen</p><p className="text-2xl font-bold">{activeBusinessmen}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Inactive Businessmen</p><p className="text-2xl font-bold text-amber-600">{inactiveBusinessmen}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as EntityStatus)}>
              <TabsList>
                <TabsTrigger value="Active">Active</TabsTrigger>
                <TabsTrigger value="Inactive">Inactive</TabsTrigger>
              </TabsList>
              <TabsContent value={tab}>
                <div className="rounded-md border overflow-x-auto mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Last Activity Date</TableHead>
                        <TableHead>Inactivity Duration</TableHead>
                        <TableHead>Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataForTab.map((entity, idx) => (
                        <TableRow key={`${entity.name}-${idx}`}>
                          <TableCell>{entity.entityType}</TableCell>
                          <TableCell>{entity.name}</TableCell>
                          <TableCell className="font-mono text-xs">{entity.lastActivityDate}</TableCell>
                          <TableCell>{entity.inactivityDuration}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={riskClass[entity.riskLevel]}>
                              {entity.riskLevel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

