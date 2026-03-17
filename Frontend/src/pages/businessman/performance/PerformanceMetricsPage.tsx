import { BarChart3, CalendarDays, Handshake, IndianRupee, PackageCheck, TrendingUp } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  HealthStatusBadge,
  MetricInfoTooltip,
  ReadOnlyPerformanceNotice,
  earningsOverTime,
  formatInrCompact,
  monthlyOrderTrend,
  orderTypeSplit,
  performanceMetricSummary,
} from "@/components/businessman/PerformancePrimitives";

const metricDefinitionMap: Record<string, string> = {
  "Total Orders Completed": "Successfully fulfilled orders across B2B and B2C channels.",
  "Total Revenue Generated": "Gross order value generated from completed orders.",
  "Profit Contribution": "Net contribution after channel-level cost allocations.",
  "Fulfilment Success Rate": "Share of orders completed without fulfilment failure.",
  "Referral Conversion Rate": "Share of referral leads converted to successful orders.",
  "Active Days (Last 90)": "Number of days with operational activity in the last 90 days.",
};

export default function PerformanceMetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Performance Metrics</h1>
        <p className="text-sm text-muted-foreground">
          Read-only business health overview for monitoring, warning visibility, and upgrade assessment.
        </p>
      </div>

      <ReadOnlyPerformanceNotice />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KPICard title="Total Orders Completed" value="1,274" icon={PackageCheck} variant="trust" change="+8.4%" changeType="positive" />
        <KPICard title="Total Revenue Generated" value="₹48,20,000" icon={IndianRupee} variant="profit" change="+6.9%" changeType="positive" />
        <KPICard title="Profit Contribution" value="₹7,12,400" icon={TrendingUp} variant="profit" change="+5.1%" changeType="positive" />
        <KPICard title="Fulfilment Success Rate" value="94.8%" icon={BarChart3} variant="trust" />
        <KPICard title="Referral Conversion Rate" value="12.3%" icon={Handshake} variant="warning" />
        <KPICard title="Active Days (Last 90 Days)" value="78" icon={CalendarDays} variant="cap" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Order Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyOrderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Earnings vs Time (₹ Lakh)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={earningsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" radius={[6, 6, 0, 0]} fill="hsl(var(--trust))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Order Type Split (B2B / B2C)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={orderTypeSplit} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
                  {orderTypeSplit.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {orderTypeSplit.map((item) => (
                <div key={item.name} className="rounded-md border p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Metric Health Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceMetricSummary.map((row) => (
                  <TableRow key={row.metric}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{row.metric}</span>
                        <MetricInfoTooltip label={row.metric} description={metricDefinitionMap[row.metric] || "Metric definition"} />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {row.metric.includes("Revenue") || row.metric.includes("Profit")
                        ? formatInrCompact(Number(row.value.replace(/[^\d]/g, "")))
                        : row.value}
                    </TableCell>
                    <TableCell>
                      <HealthStatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

