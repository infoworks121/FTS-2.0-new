import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type AlertSeverity = "Info" | "Warning" | "Critical";

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  if (severity === "Critical") {
    return <Badge variant="destructive">Critical</Badge>;
  }

  if (severity === "Warning") {
    return (
      <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
        Warning
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-blue-500/40 text-blue-700 dark:text-blue-400">
      Info
    </Badge>
  );
}

export function SeverityIcon({ severity }: { severity: AlertSeverity }) {
  if (severity === "Critical") return <AlertCircle className="h-4 w-4 text-destructive" />;
  if (severity === "Warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <Info className="h-4 w-4 text-blue-500" />;
}

export function ReadOnlySystemBadge() {
  return (
    <Badge variant="secondary" className="text-xs">
      <ShieldAlert className="mr-1 h-3 w-3" />
      System Controlled
    </Badge>
  );
}

export function AlertFiltersCard({
  title = "Filters",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</CardContent>
    </Card>
  );
}

export function SelectFilter<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ label: string; value: T }>;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function PageControls({
  page,
  totalPages,
  shown,
  total,
  label,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  shown: number;
  total: number;
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        Showing {shown} of {total} {label}
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onPrev} disabled={page <= 1}>
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button size="sm" variant="outline" onClick={onNext} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function CapUtilizationStatus({ utilization }: { utilization: number }) {
  const status = utilization >= 100 ? "Cap Reached" : utilization >= 85 ? "Near Limit" : "Safe";
  const toneClass =
    status === "Cap Reached"
      ? "border-destructive/40 text-destructive"
      : status === "Near Limit"
        ? "border-amber-500/40 text-amber-700 dark:text-amber-400"
        : "border-emerald-500/40 text-emerald-700 dark:text-emerald-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Cap utilization</span>
        <span className="font-mono font-semibold">{utilization.toFixed(1)}%</span>
      </div>
      <Progress
        value={Math.min(utilization, 100)}
        className={cn(
          status === "Cap Reached"
            ? "[&>div]:bg-destructive"
            : status === "Near Limit"
              ? "[&>div]:bg-amber-500"
              : "[&>div]:bg-emerald-500",
        )}
      />
      <Badge variant="outline" className={toneClass}>
        {status}
      </Badge>
    </div>
  );
}

