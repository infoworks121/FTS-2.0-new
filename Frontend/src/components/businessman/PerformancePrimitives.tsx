import { AlertTriangle, CheckCircle2, Clock3, Info, ShieldAlert, TrendingUp, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type HealthStatus = "Good" | "Warning" | "Poor";
export type ComplianceStatus = "Pass" | "Fail" | "At Risk";
export type Severity = "Low" | "Medium" | "High";
export type RequirementState = "Passed" | "In Progress" | "Failed";

export const performanceTimeRanges = ["Last 30 Days", "Last 60 Days", "Last 90 Days"] as const;

export type PerformanceTimeRange = (typeof performanceTimeRanges)[number];

export const monthlyOrderTrend = [
  { month: "Jul", orders: 95 },
  { month: "Aug", orders: 118 },
  { month: "Sep", orders: 132 },
  { month: "Oct", orders: 126 },
  { month: "Nov", orders: 149 },
  { month: "Dec", orders: 163 },
  { month: "Jan", orders: 178 },
  { month: "Feb", orders: 172 },
];

export const earningsOverTime = [
  { period: "Sep", earnings: 4.8 },
  { period: "Oct", earnings: 5.4 },
  { period: "Nov", earnings: 6.1 },
  { period: "Dec", earnings: 6.6 },
  { period: "Jan", earnings: 7.2 },
  { period: "Feb", earnings: 6.9 },
];

export const orderTypeSplit = [
  { name: "B2B", value: 64, fill: "hsl(var(--primary))" },
  { name: "B2C", value: 36, fill: "hsl(var(--warning))" },
];

export const performanceMetricSummary: Array<{
  metric: string;
  value: string;
  status: HealthStatus;
}> = [
  { metric: "Total Orders Completed", value: "1,274", status: "Good" },
  { metric: "Total Revenue Generated", value: "₹48,20,000", status: "Good" },
  { metric: "Profit Contribution", value: "₹7,12,400", status: "Good" },
  { metric: "Fulfilment Success Rate", value: "94.8%", status: "Good" },
  { metric: "Referral Conversion Rate", value: "12.3%", status: "Warning" },
  { metric: "Active Days (Last 90)", value: "78", status: "Good" },
];

export const slaSummary = {
  onTimeDeliveryRate: 93,
  orderAcceptanceMinutes: 18,
  inventoryAvailability: 89,
  slaScore: 84,
};

export const slaComplianceRows: Array<{
  id: string;
  slaType: string;
  required: string;
  actual: string;
  status: ComplianceStatus;
}> = [
  { id: "sla-1", slaType: "On-Time Delivery", required: ">= 92%", actual: "93%", status: "Pass" },
  { id: "sla-2", slaType: "Order Acceptance Time", required: "<= 15 mins", actual: "18 mins", status: "At Risk" },
  { id: "sla-3", slaType: "Inventory Availability", required: ">= 90%", actual: "89%", status: "At Risk" },
  { id: "sla-4", slaType: "Return Ratio", required: "<= 4%", actual: "5.2%", status: "Fail" },
];

export const warningCards: Array<{
  id: string;
  warningType: "Delay" | "Return" | "Fraud Risk" | "Inactivity";
  severity: Severity;
  triggerReason: string;
  systemAction: "Auto" | "Manual";
  currentStatus: "Active" | "Monitoring" | "Resolved";
}> = [
  {
    id: "warn-1",
    warningType: "Delay",
    severity: "Medium",
    triggerReason: "3 late fulfilments in last 14 days",
    systemAction: "Auto",
    currentStatus: "Active",
  },
  {
    id: "warn-2",
    warningType: "Return",
    severity: "High",
    triggerReason: "Return ratio crossed monthly threshold",
    systemAction: "Auto",
    currentStatus: "Monitoring",
  },
  {
    id: "warn-3",
    warningType: "Fraud Risk",
    severity: "Low",
    triggerReason: "Unusual order pattern flagged by model",
    systemAction: "Manual",
    currentStatus: "Resolved",
  },
];

export const warningHistoryRows: Array<{
  id: string;
  warningType: string;
  date: string;
  status: "Resolved" | "Active";
  actionTaken: string;
}> = [
  { id: "hist-1", warningType: "Delay", date: "2026-02-14", status: "Active", actionTaken: "System watchlist enabled" },
  { id: "hist-2", warningType: "Return", date: "2026-02-10", status: "Resolved", actionTaken: "Review completed by Core Body" },
  { id: "hist-3", warningType: "Inactivity", date: "2026-01-28", status: "Resolved", actionTaken: "Auto notice and recovery" },
];

export const eligibilityRequirements: Array<{
  id: string;
  label: string;
  current: string;
  target: string;
  progress: number;
  state: RequirementState;
  missingHint: string;
}> = [
  {
    id: "req-orders",
    label: "Minimum Orders Completed",
    current: "1,274",
    target: "1,200",
    progress: 100,
    state: "Passed",
    missingHint: "Order target achieved",
  },
  {
    id: "req-revenue",
    label: "Minimum Revenue",
    current: "₹48.2L",
    target: "₹50L",
    progress: 96,
    state: "In Progress",
    missingHint: "₹1.8L short of threshold",
  },
  {
    id: "req-sla",
    label: "SLA Compliance",
    current: "84/100",
    target: ">= 85/100",
    progress: 99,
    state: "In Progress",
    missingHint: "Improve acceptance and inventory consistency",
  },
  {
    id: "req-risk",
    label: "Risk Score Threshold",
    current: "Medium",
    target: "Low/Medium",
    progress: 100,
    state: "Passed",
    missingHint: "Within allowed range",
  },
  {
    id: "req-active-days",
    label: "Active Days Requirement",
    current: "78 / 90",
    target: ">= 80 / 90",
    progress: 97,
    state: "In Progress",
    missingHint: "2 active days remaining",
  },
];

export function formatInrCompact(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  const styles: Record<HealthStatus, string> = {
    Good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    Warning: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    Poor: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  };

  return <Badge className={cn("font-semibold", styles[status])}>{status}</Badge>;
}

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const styles: Record<ComplianceStatus, string> = {
    Pass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    "At Risk": "border-amber-500/30 bg-amber-500/10 text-amber-500",
    Fail: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  };

  return <Badge className={cn("font-semibold", styles[status])}>{status}</Badge>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    Medium: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    High: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  };

  return <Badge className={cn("font-semibold", styles[severity])}>{severity}</Badge>;
}

export function RequirementStateBadge({ state }: { state: RequirementState }) {
  if (state === "Passed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
        <CheckCircle2 className="h-3.5 w-3.5" /> Passed
      </span>
    );
  }

  if (state === "In Progress") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
        <Clock3 className="h-3.5 w-3.5" /> In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
      <XCircle className="h-3.5 w-3.5" /> Failed
    </span>
  );
}

export function MetricInfoTooltip({ label, description }: { label: string; description: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`${label} info`}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function ReadOnlyPerformanceNotice() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          Performance Monitoring Policy
        </CardTitle>
        <CardDescription>
          This section is strictly read-only. Signals from these pages may influence upgrade, demotion, or suspension decisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">No financial ledger edits are allowed from the Performance module.</p>
      </CardContent>
    </Card>
  );
}

export function RiskScorePill({ scoreLabel }: { scoreLabel: "Low" | "Medium" | "High" }) {
  const styles = {
    Low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    Medium: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    High: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  } as const;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", styles[scoreLabel])}>
      <AlertTriangle className="h-3.5 w-3.5" />
      {scoreLabel}
    </span>
  );
}

export function RequirementProgressRow({
  label,
  current,
  target,
  progress,
  state,
  hint,
}: {
  label: string;
  current: string;
  target: string;
  progress: number;
  state: RequirementState;
  hint: string;
}) {
  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <RequirementStateBadge state={state} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{current}</span>
        <span>Target: {target}</span>
      </div>
      <Progress value={progress} />
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>{hint}</span>
      </div>
    </div>
  );
}

