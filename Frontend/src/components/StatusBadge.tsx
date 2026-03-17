import { cn } from "@/lib/utils";

type BadgeStatus = "active" | "inactive" | "suspended" | "pending" | "cap-reached" | "warning";

const statusStyles: Record<BadgeStatus, string> = {
  active: "bg-profit/10 text-profit border-profit/20",
  inactive: "bg-muted text-muted-foreground border-border",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  "cap-reached": "bg-cap/10 text-cap border-cap/20",
  warning: "bg-warning/10 text-warning border-warning/20",
};

const statusLabels: Record<BadgeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
  pending: "Pending",
  "cap-reached": "Cap Reached",
  warning: "Warning",
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
      statusStyles[status]
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        status === "active" && "bg-profit animate-pulse-glow",
        status === "inactive" && "bg-muted-foreground",
        status === "suspended" && "bg-destructive",
        status === "pending" && "bg-warning",
        status === "cap-reached" && "bg-cap",
        status === "warning" && "bg-warning",
      )} />
      {statusLabels[status]}
    </span>
  );
}
