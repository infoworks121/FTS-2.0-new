import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { coreBodyApi } from "@/lib/coreBodyApi";
import { Loader2 } from "lucide-react";

type CapType = "Annual" | "Monthly";

type CapHistory = {
  period: string;
  capAmount: number;
  utilized: number;
};

const DISTRICT_NAME = "District North";

export default function CapStatus() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchDash = async () => {
      try {
        setLoading(true);
        const res = await coreBodyApi.getMyDashboard();
        setStats(res.stats);
      } catch (err) {
        console.error("Failed to load cap status", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDash();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isTypeA = stats?.profile?.type === 'A';
  const totalEarnings = stats ? parseFloat(stats.earnings?.ytd || 0) : 0;
  const monthlyEarnings = stats ? parseFloat(stats.earnings?.mtd || 0) : 0;
  const annualCap = stats ? parseFloat(stats.earnings?.annual_cap || 2500000) : 2500000;
  const monthlyCap = stats ? parseFloat(stats.earnings?.monthly_cap || stats.investment?.total_amount || 0) : 0;

  const activeEarnings = isTypeA ? totalEarnings : monthlyEarnings;
  const activeCap = isTypeA ? annualCap : monthlyCap;
  const capLabel = isTypeA ? "Annual" : "Monthly";
  
  const remainingAmount = Math.max(0, activeCap - activeEarnings);
  const utilization = activeCap > 0 ? Math.min(100, (activeEarnings / activeCap) * 100) : 0;

  const capHistory: CapHistory[] = [
    { period: "Current Period", capAmount: activeCap, utilized: activeEarnings },
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  const progressClass =
    utilization >= 95 ? "[&>div]:bg-red-500" : utilization >= 80 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cap Status & Earnings Posture</h1>
        <p className="text-sm text-muted-foreground">
          Earning cap visibility for district financial control. Cap logic is automated based on your investment type ({isTypeA ? "Type A - Annual" : "Type B - Monthly"}).
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
              <p className="mt-1 font-semibold">{capLabel}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-xs text-muted-foreground">Total Cap Amount</p>
              <p className="mt-1 font-mono font-semibold">{formatCurrency(activeCap)}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-xs text-muted-foreground">Utilized Earnings</p>
              <p className="mt-1 font-mono font-semibold">{formatCurrency(activeEarnings)}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="text-xs text-muted-foreground">Remaining Cap</p>
              <p className="mt-1 font-mono font-semibold">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Usage Progress</span>
              <span className="font-mono font-semibold">{utilization.toFixed(1)}%</span>
            </div>
            <Progress value={utilization} className={progressClass} />
            <div className="flex flex-wrap gap-4 mt-2">
               <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Healthy</div>
               <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-amber-500"/> Nearing Cap</div>
               <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2 h-2 rounded-full bg-red-500"/> Cap Reached</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cap Behavior Explanation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Earnings are auto-stopped immediately when the configured cap is reached.</p>
          <p>• Any excess profit after cap exhaustion is routed to the Company Reserve Fund.</p>
          <p>• Cap reset follows the configured cycle (monthly for Type B, annual for Type A).</p>
          <p>• You can view the excess profit logs in the Wallet section.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current Period Utilization</CardTitle>
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
                  const percent = ((row.utilized / row.capAmount) * 100).toFixed(1);
                  return (
                    <TableRow key={row.period}>
                      <TableCell className="font-mono text-xs">{row.period}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(row.capAmount)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(row.utilized)} ({percent}%)</TableCell>
                      <TableCell>
                        <Badge variant={reached ? "destructive" : (parseFloat(percent) > 80 ? "warning" : "secondary")}>
                          {reached ? "CAP REACHED" : (parseFloat(percent) > 80 ? "NEARING LIMIT" : "ACTIVE")}
                        </Badge>
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
  );
}

