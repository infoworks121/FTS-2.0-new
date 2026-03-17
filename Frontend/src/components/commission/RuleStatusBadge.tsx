import { cn } from "@/lib/utils";

type RuleStatus = "active" | "scheduled" | "archived";

const statusStyles: Record<RuleStatus, string> = {
  active: "bg-profit/10 text-profit border-profit/20",
  scheduled: "bg-warning/10 text-warning border-warning/20",
  archived: "bg-muted/20 text-muted-foreground border-border",
};

const statusDotStyles: Record<RuleStatus, string> = {
  active: "bg-profit",
  scheduled: "bg-warning",
  archived: "bg-muted-foreground",
};

const statusLabels: Record<RuleStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  archived: "Archived",
};

interface RuleStatusBadgeProps {
  status: RuleStatus;
  scheduledDate?: string;
}

export function RuleStatusBadge({ status, scheduledDate }: RuleStatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
          statusStyles[status]
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            statusDotStyles[status],
            status === "active" && "animate-pulse-glow"
          )}
        />
        {statusLabels[status]}
      </span>
      {status === "scheduled" && scheduledDate && (
        <span className="text-xs text-muted-foreground">
          Effective: {scheduledDate}
        </span>
      )}
    </div>
  );
}
