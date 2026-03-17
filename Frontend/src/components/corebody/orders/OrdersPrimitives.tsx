import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border",
  success: "border-emerald-500/30",
  warning: "border-amber-500/30",
  danger: "border-red-500/30",
};

export function OperationsMetricCard({
  title,
  value,
  subtitle,
  tone = "neutral",
}: {
  title: string;
  value: ReactNode;
  subtitle?: string;
  tone?: Tone;
}) {
  return (
    <Card className={cn(toneClasses[tone])}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold font-mono">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    "Awaiting Dispatch": "border-amber-500/40 text-amber-600",
    "In Transit": "border-blue-500/40 text-blue-600",
    "At Risk": "border-red-500/40 text-red-600",
    Completed: "border-emerald-500/40 text-emerald-600",
    Delivered: "border-emerald-500/40 text-emerald-600",
    Open: "border-amber-500/40 text-amber-600",
    Escalated: "border-red-500/40 text-red-600",
    "Under Review": "border-blue-500/40 text-blue-600",
  };

  return (
    <Badge variant="outline" className={styleMap[status] ?? "border-muted-foreground/30 text-muted-foreground"}>
      {status}
    </Badge>
  );
}

export function SLABadge({ status }: { status: "Normal" | "At Risk" | "Breached" | "Met" }) {
  const styleMap: Record<typeof status, string> = {
    Normal: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    "At Risk": "bg-amber-500/10 text-amber-600 border-amber-500/30",
    Breached: "bg-red-500/10 text-red-600 border-red-500/30",
    Met: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", styleMap[status])}>
      {status}
    </span>
  );
}

export function SeverityBadge({ level }: { level: "Low" | "Medium" | "High" | "Critical" }) {
  const styleMap: Record<typeof level, string> = {
    Low: "border-emerald-500/40 text-emerald-600",
    Medium: "border-blue-500/40 text-blue-600",
    High: "border-amber-500/40 text-amber-600",
    Critical: "border-red-500/40 text-red-600",
  };

  return (
    <Badge variant="outline" className={styleMap[level]}>
      {level}
    </Badge>
  );
}

