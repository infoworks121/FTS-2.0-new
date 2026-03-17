import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, AlertCircle, Clock } from "lucide-react";
import { navItems } from "@/pages/CoreBodyDashboard";

const alertSummary = {
  system: 4,
  capWarnings: 2,
  inactivity: 6,
  sla: 3,
};

const systemAlerts = [
  { title: "System Maintenance Scheduled", severity: "Info" as const, date: "2024-05-15 10:00 AM", description: "Scheduled maintenance on May 20, 2024 from 2:00 AM to 4:00 AM" },
  { title: "Commission Rule Update", severity: "Warning" as const, date: "2024-05-14 03:30 PM", description: "B2B commission structure updated. New rates effective from June 1, 2024" },
  { title: "Compliance Notice", severity: "Critical" as const, date: "2024-05-13 11:20 AM", description: "KYC verification required for 3 dealers by May 25, 2024" },
  { title: "Platform Feature Update", severity: "Info" as const, date: "2024-05-12 09:15 AM", description: "New reporting features added to the dashboard" },
];

const capWarnings = [
  { entity: "Monthly Earnings", current: "₹1,84,200", cap: "₹2,50,000", remaining: "₹65,800", percentage: 73.7, risk: "Medium" as const },
  { entity: "Businessman Slots", current: "45", cap: "50", remaining: "5", percentage: 90, risk: "High" as const },
];

const inactivityNotices = [
  { entity: "Kumar Dist. (Dealer)", type: "Dealer" as const, duration: "15 days", risk: "Medium" as const, autoDeactivation: "May 30, 2024" },
  { entity: "Singh & Co (Dealer)", type: "Dealer" as const, duration: "22 days", risk: "High" as const, autoDeactivation: "May 25, 2024" },
  { entity: "Rajesh Kumar (Businessman)", type: "Businessman" as const, duration: "8 days", risk: "Low" as const, autoDeactivation: "—" },
  { entity: "Amit Traders (Businessman)", type: "Businessman" as const, duration: "18 days", risk: "Medium" as const, autoDeactivation: "Jun 5, 2024" },
  { entity: "Priya Agencies (Dealer)", type: "Dealer" as const, duration: "5 days", risk: "Low" as const, autoDeactivation: "—" },
  { entity: "Suresh Enterprises (Businessman)", type: "Businessman" as const, duration: "12 days", risk: "Low" as const, autoDeactivation: "—" },
];

const slaAlerts = [
  { entity: "Arjun Traders", metric: "Order Fulfillment Time", expected: "24 hours", actual: "36 hours", impact: "Medium" as const },
  { entity: "Mehta Supply", metric: "Stock Return Processing", expected: "48 hours", actual: "72 hours", impact: "High" as const },
  { entity: "Kumar Dist.", metric: "Response Time", expected: "2 hours", actual: "6 hours", impact: "Low" as const },
];

const severityIcons = {
  Info: Info,
  Warning: AlertTriangle,
  Critical: AlertCircle,
};

const severityColors = {
  Info: "text-blue-500",
  Warning: "text-warning",
  Critical: "text-destructive",
};

const riskColors = {
  Low: "text-muted-foreground",
  Medium: "text-warning",
  High: "text-destructive",
};

export default function ActivityAlerts() {
  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — District North">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Activity Alerts</h1>
          <p className="text-sm text-muted-foreground">System-generated alerts and notifications</p>
        </div>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">System Alerts</p>
                  <p className="text-2xl font-bold">{alertSummary.system}</p>
                </div>
                <Info className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Cap Warnings</p>
                  <p className="text-2xl font-bold">{alertSummary.capWarnings}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Inactivity Notices</p>
                  <p className="text-2xl font-bold">{alertSummary.inactivity}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">SLA Alerts</p>
                  <p className="text-2xl font-bold">{alertSummary.sla}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert, i) => {
                const Icon = severityIcons[alert.severity];
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-md border">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${severityColors[alert.severity]}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">{alert.title}</h4>
                        <Badge variant={alert.severity === "Critical" ? "destructive" : "secondary"} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground font-mono">{alert.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cap Limit Warnings */}
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Cap Limit Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {capWarnings.map((warning, i) => (
                <div key={i} className="p-4 rounded-md bg-warning/5 border border-warning/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">{warning.entity}</h4>
                    <Badge variant="outline" className={`${riskColors[warning.risk]} border-current`}>
                      {warning.risk} Risk
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-1">Current</div>
                      <div className="font-mono font-medium">{warning.current}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Cap Limit</div>
                      <div className="font-mono font-medium">{warning.cap}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Remaining</div>
                      <div className="font-mono font-medium text-profit">{warning.remaining}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Utilization</div>
                      <div className="font-mono font-medium text-warning">{warning.percentage}%</div>
                    </div>
                  </div>
                  {warning.percentage >= 90 && (
                    <div className="mt-3 p-2 rounded bg-warning/10 text-xs text-warning">
                      ⚠️ Auto-stop will trigger when limit is reached
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inactivity Notices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Inactivity Notices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactivityNotices.map((notice, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{notice.entity}</span>
                      <Badge variant="outline" className="text-xs">{notice.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Inactive for {notice.duration}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-muted-foreground mb-1">Risk Level</div>
                      <div className={`font-medium ${riskColors[notice.risk]}`}>{notice.risk}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground mb-1">Auto-Deactivation</div>
                      <div className="font-medium">{notice.autoDeactivation}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SLA / Performance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">SLA / Performance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaAlerts.map((alert, i) => (
                <div key={i} className="p-3 rounded-md border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">{alert.entity}</h4>
                    <Badge variant={alert.impact === "High" ? "destructive" : "secondary"} className="text-xs">
                      {alert.impact} Impact
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-1">Metric</div>
                      <div className="font-medium">{alert.metric}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Expected</div>
                      <div className="font-mono font-medium text-profit">{alert.expected}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Actual</div>
                      <div className="font-mono font-medium text-destructive">{alert.actual}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
