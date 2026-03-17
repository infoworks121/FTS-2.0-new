import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EntityType = "Dealer" | "Businessman";
type PerformanceStatus = "Good" | "Attention" | "Risk";

type SnapshotRow = {
  name: string;
  entityType: EntityType;
  ordersHandled: number;
  orderVolume: number;
  slaScore: number;
  performanceStatus: PerformanceStatus;
};

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 6;

const snapshotData: SnapshotRow[] = [
  { name: "Arjun Traders", entityType: "Dealer", ordersHandled: 186, orderVolume: 1346000, slaScore: 93, performanceStatus: "Good" },
  { name: "Priya Agencies", entityType: "Dealer", ordersHandled: 142, orderVolume: 1124000, slaScore: 88, performanceStatus: "Good" },
  { name: "Kumar Distribution", entityType: "Dealer", ordersHandled: 61, orderVolume: 428000, slaScore: 74, performanceStatus: "Attention" },
  { name: "Rakesh Enterprise", entityType: "Businessman", ordersHandled: 83, orderVolume: 376000, slaScore: 86, performanceStatus: "Good" },
  { name: "AgroKart Point", entityType: "Businessman", ordersHandled: 126, orderVolume: 522000, slaScore: 79, performanceStatus: "Attention" },
  { name: "FarmEdge Distributor", entityType: "Businessman", ordersHandled: 22, orderVolume: 98000, slaScore: 62, performanceStatus: "Risk" },
  { name: "Village Supply Hub", entityType: "Businessman", ordersHandled: 174, orderVolume: 783000, slaScore: 91, performanceStatus: "Good" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const statusClass: Record<PerformanceStatus, string> = {
  Good: "border-emerald-500/40 text-emerald-600",
  Attention: "border-amber-500/40 text-amber-600",
  Risk: "border-rose-500/40 text-rose-600",
};

export default function PerformanceSnapshot() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalOrders = useMemo(() => snapshotData.reduce((sum, row) => sum + row.ordersHandled, 0), []);
  const averageFulfilmentRate = useMemo(() => 92.4, []);
  const averageSla = useMemo(() => Math.round(snapshotData.reduce((sum, row) => sum + row.slaScore, 0) / snapshotData.length), []);
  const networkHealth = useMemo(() => {
    const riskCount = snapshotData.filter((row) => row.performanceStatus === "Risk").length;
    if (riskCount >= 2) return "Risk";
    if (riskCount === 1) return "Attention";
    return "Good";
  }, []);

  const totalPages = Math.max(1, Math.ceil(snapshotData.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = snapshotData.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Performance Snapshot</h1>
          <p className="text-sm text-muted-foreground">
            Non-gamified district performance overview for compliance-focused monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total Orders (District)</p><p className="text-2xl font-bold font-mono">{totalOrders}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Average Fulfilment Rate</p><p className="text-2xl font-bold">{averageFulfilmentRate}%</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Average SLA Score</p><p className="text-2xl font-bold">{averageSla}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Network Activity Health</p><Badge variant="outline" className={statusClass[networkHealth]}>{networkHealth}</Badge></CardContent></Card>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Orders Handled</TableHead>
                    <TableHead>Order Volume</TableHead>
                    <TableHead>SLA Score</TableHead>
                    <TableHead>Performance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((row) => (
                    <TableRow key={`${row.entityType}-${row.name}`}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.entityType}</TableCell>
                      <TableCell className="font-mono">{row.ordersHandled}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(row.orderVolume)}</TableCell>
                      <TableCell className="font-mono">{row.slaScore}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass[row.performanceStatus]}>
                          {row.performanceStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {paginated.length} of {snapshotData.length} records
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">Page {safePage} of {totalPages}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

