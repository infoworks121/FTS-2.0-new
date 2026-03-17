import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type CapType = "Annual" | "Monthly";

type CapHistory = {
  period: string;
  capAmount: number;
  utilized: number;
};

const DISTRICT_NAME = "District North";

const capOverview = {
  capType: "Monthly" as CapType,
  totalCapAmount: 250000,
  usedAmount: 184200,
};

const capHistory: CapHistory[] = [
  { period: "2025-10", capAmount: 250000, utilized: 211400 },
  { period: "2025-11", capAmount: 250000, utilized: 237900 },
  { period: "2025-12", capAmount: 250000, utilized: 250000 },
  { period: "2026-01", capAmount: 250000, utilized: 198100 },
  { period: "2026-02", capAmount: 250000, utilized: 184200 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function CapStatus() {
  const remainingAmount = Math.max(0, capOverview.totalCapAmount - capOverview.usedAmount);
  const utilization = Math.min(100, (capOverview.usedAmount / capOverview.totalCapAmount) * 100);

  const progressClass =
    utilization >= 95 ? "[&>div]:bg-red-500" : utilization >= 80 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500";

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Cap Status</h1>
          <p className="text-sm text-muted-foreground">
            Earning cap visibility for district financial control. Cap logic is automated and non-overridable from this panel.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cap Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Cap Type</p>
                <p className="mt-1 font-semibold">{capOverview.capType}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Total Cap Amount</p>
                <p className="mt-1 font-mono font-semibold">{formatCurrency(capOverview.totalCapAmount)}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Used Amount</p>
                <p className="mt-1 font-mono font-semibold">{formatCurrency(capOverview.usedAmount)}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-xs text-muted-foreground">Remaining Amount</p>
                <p className="mt-1 font-mono font-semibold">{formatCurrency(remainingAmount)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Usage Progress</span>
                <span className="font-mono font-semibold">{utilization.toFixed(1)}%</span>
              </div>
              <Progress value={utilization} className={progressClass} />
              <p className="text-xs text-muted-foreground">Green: healthy • Amber: nearing cap • Red: cap reached / auto-stop</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cap Behavior Explanation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Earnings are auto-stopped immediately when the configured cap is reached.</p>
            <p>• Any excess profit after cap exhaustion is routed to Company Reserve.</p>
            <p>• Cap reset follows the configured cycle (monthly/annual) as defined by system rules.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Historical Cap Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Cap Amount</TableHead>
                    <TableHead>Utilized</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capHistory.map((row) => {
                    const reached = row.utilized >= row.capAmount;
                    return (
                      <TableRow key={row.period}>
                        <TableCell className="font-mono text-xs">{row.period}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(row.capAmount)}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(row.utilized)}</TableCell>
                        <TableCell>
                          <Badge variant={reached ? "destructive" : "secondary"}>{reached ? "Reached" : "Not reached"}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

