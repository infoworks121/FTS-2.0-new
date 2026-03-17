import { ReactNode, useMemo, useState } from "react";
import { AlertTriangle, ClipboardList, FileText, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type Severity = "low" | "medium" | "high" | "critical";

const severityStyles: Record<Severity, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const severityLabel: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge className={cn("font-semibold", severityStyles[severity])}>{severityLabel[severity]}</Badge>
  );
}

export function RiskScoreBand({ score }: { score: number }) {
  const { severity, colorClass } = useMemo(() => {
    if (score >= 85) return { severity: "Critical", colorClass: "text-red-500" };
    if (score >= 70) return { severity: "High", colorClass: "text-orange-500" };
    if (score >= 45) return { severity: "Medium", colorClass: "text-amber-500" };
    return { severity: "Low", colorClass: "text-emerald-500" };
  }, [score]);

  return (
    <div className="flex items-center gap-2">
      <span className={cn("font-mono text-sm font-bold", colorClass)}>{score}</span>
      <span className="text-xs text-muted-foreground">{severity}</span>
    </div>
  );
}

export function ReadOnlyFinancialNotice() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Financial Safety Guardrail</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Financial and ledger values in this module are read-only. Enforcement changes impact access state only.
      </p>
    </div>
  );
}

interface InvestigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function InvestigationDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
}: InvestigationDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            {title}
          </SheetTitle>
          <SheetDescription>{subtitle}</SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

interface EnforcementConfirmationProps {
  triggerLabel: string;
  actionLabel: string;
  severity: Severity;
  entityId: string;
  onConfirmed?: (reason: string, duration: string) => void;
}

export function EnforcementConfirmation({
  triggerLabel,
  actionLabel,
  severity,
  entityId,
  onConfirmed,
}: EnforcementConfirmationProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("24h");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={severity === "critical" ? "destructive" : "outline"}>
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm enforcement action</AlertDialogTitle>
          <AlertDialogDescription>
            This action is legally sensitive and will be permanently logged. Provide reason and duration.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 text-sm">
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="font-medium">Action: {actionLabel}</p>
            <p className="text-muted-foreground">Entity: {entityId}</p>
            <div className="mt-2">
              <SeverityBadge severity={severity} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`reason-${entityId}`}>Mandatory reason</Label>
            <Input
              id={`reason-${entityId}`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe investigation findings and legal basis"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="72h">72 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!reason.trim()}
            onClick={() => onConfirmed?.(reason.trim(), duration)}
            className={!reason.trim() ? "opacity-50 pointer-events-none" : ""}
          >
            Confirm & Log
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface AuditItem {
  at: string;
  actor: string;
  event: string;
}

export function AuditLogCard({ title, items }: { title: string; items: AuditItem[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ClipboardList className="h-4 w-4" />
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={`${item.at}-${idx}`} className="rounded-md border p-2.5 text-xs">
            <p className="font-medium">{item.event}</p>
            <p className="text-muted-foreground mt-0.5">
              {item.at} • {item.actor}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-md border border-dashed p-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span>Permanent retention enabled. Deletion is disabled for compliance records.</span>
        </div>
      </div>
    </div>
  );
}

export function AlertFirstHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" />
          Alert-first mode active
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Prioritize Critical and High severity events for investigation, then execute enforcement with mandatory confirmation.
        </p>
      </div>
    </div>
  );
}

