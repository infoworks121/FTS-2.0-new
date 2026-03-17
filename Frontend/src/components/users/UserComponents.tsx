import { cn } from "@/lib/utils";
import { UserMode, userModeConfig } from "@/types/users";

// Mode Badge Component
export function ModeBadge({ mode }: { mode: UserMode }) {
  const config = userModeConfig[mode] ?? userModeConfig["entry"];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
      config.bgColor,
      config.color,
      "border-current/20"
    )}>
      {config.label} Mode
    </span>
  );
}

// Role Badge Component
export function RoleBadge({ 
  role, 
  size = "default" 
}: { 
  role: string; 
  size?: "sm" | "default";
}) {
  const roleColors: Record<string, { label: string; color: string; bgColor: string }> = {
    admin: { label: "Admin", color: "text-red-400", bgColor: "bg-red-500/10" },
    corebody_a: { label: "Core Body A", color: "text-purple-400", bgColor: "bg-purple-500/10" },
    corebody_b: { label: "Core Body B", color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
    businessman: { label: "Businessman", color: "text-green-400", bgColor: "bg-green-500/10" },
    stock_point: { label: "Stock Point", color: "text-amber-400", bgColor: "bg-amber-500/10" },
  };
  
  const config = roleColors[role] || roleColors.businessman;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]";
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-semibold uppercase tracking-wider",
      sizeClasses,
      config.bgColor,
      config.color,
      "border-current/20"
    )}>
      {config.label}
    </span>
  );
}

// Inactivity Warning Badge
export function InactivityBadge({ days }: { days: number }) {
  const isWarning = days > 30;
  const isCritical = days > 60;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
      isCritical && "bg-destructive/10 text-destructive border-destructive/20",
      isWarning && !isCritical && "bg-warning/10 text-warning border-warning/20",
      !isWarning && "bg-muted text-muted-foreground border-border"
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        isCritical ? "bg-destructive" : isWarning ? "bg-warning" : "bg-muted-foreground"
      )} />
      {days} days inactive
    </span>
  );
}

// Upgrade Eligibility Badge
export function UpgradeEligibleBadge({ eligible }: { eligible: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
      eligible 
        ? "bg-profit/10 text-profit border-profit/20" 
        : "bg-muted text-muted-foreground border-border"
    )}>
      {eligible ? "✓ Eligible for Upgrade" : "Not Eligible"}
    </span>
  );
}

// Over-exposure Warning Badge
export function OverExposureBadge({ isOverExposed }: { isOverExposed: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
      isOverExposed 
        ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" 
        : "bg-profit/10 text-profit border-profit/20"
    )}>
      {isOverExposed ? "⚠ Over-exposed" : "✓ Healthy"}
    </span>
  );
}

// Risk Indicator Badge
export function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const riskConfig = {
    low: { label: "Low Risk", color: "text-green-400", bgColor: "bg-green-500/10" },
    medium: { label: "Medium Risk", color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
    high: { label: "High Risk", color: "text-red-400", bgColor: "bg-red-500/10" },
  };
  
  const config = riskConfig[level];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
      config.bgColor,
      config.color,
      "border-current/20"
    )}>
      {config.label}
    </span>
  );
}

// Negotiation Status Badge
export function NegotiationStatusBadge({ status }: { status: "pending" | "approved" | "rejected" | "negotiating" }) {
  const config = {
    pending: { label: "Pending", color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
    approved: { label: "Approved", color: "text-green-400", bgColor: "bg-green-500/10" },
    rejected: { label: "Rejected", color: "text-red-400", bgColor: "bg-red-500/10" },
    negotiating: { label: "Negotiating", color: "text-blue-400", bgColor: "bg-blue-500/10" },
  };
  
  const statusConfig = config[status];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
      statusConfig.bgColor,
      statusConfig.color,
      "border-current/20"
    )}>
      {statusConfig.label}
    </span>
  );
}

// SLA Score Indicator
export function SLAScore({ score, showTrend }: { score: number; showTrend?: "up" | "down" | "stable" }) {
  const getScoreColor = () => {
    if (score >= 90) return "text-profit";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };
  
  const getTrendIcon = () => {
    if (!showTrend) return null;
    if (showTrend === "up") return "↑";
    if (showTrend === "down") return "↓";
    return "→";
  };
  
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("font-mono font-semibold", getScoreColor())}>
        {score}%
      </span>
      {showTrend && (
        <span className={cn(
          "text-xs",
          showTrend === "up" && "text-profit",
          showTrend === "down" && "text-destructive",
          showTrend === "stable" && "text-muted-foreground"
        )}>
          {getTrendIcon()}
        </span>
      )}
    </div>
  );
}

// Inventory Warning Badge
export function InventoryWarning({ level, threshold }: { level: number; threshold: number }) {
  const isLow = level <= threshold;
  const isCritical = level <= threshold * 0.5;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
      isCritical 
        ? "bg-destructive/10 text-destructive border-destructive/20" 
        : isLow 
          ? "bg-warning/10 text-warning border-warning/20"
          : "bg-muted text-muted-foreground border-border"
    )}>
      {isCritical ? "⚠ Critical" : isLow ? "⚠ Low Stock" : "✓ OK"}
    </span>
  );
}

// User Status Badge
export function UserStatusBadge({ status }: { status: "active" | "inactive" | "suspended" }) {
  const statusStyles: Record<string, string> = {
    active: "bg-profit/10 text-profit border-profit/20",
    inactive: "bg-muted text-muted-foreground border-border",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
  };
  
  const statusDots: Record<string, string> = {
    active: "bg-profit",
    inactive: "bg-muted-foreground",
    suspended: "bg-destructive",
  };
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
      statusStyles[status]
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", statusDots[status])} />
      {status}
    </span>
  );
}

// Permission Badge
export function PermissionBadge({ permission }: { permission: string }) {
  const permissionColors: Record<string, string> = {
    view: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    create: "bg-green-500/10 text-green-400 border-green-500/20",
    edit: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    approve: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    withdraw: "bg-red-500/10 text-red-400 border-red-500/20",
    audit: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };
  
  const color = permissionColors[permission.toLowerCase()] || "bg-muted text-muted-foreground border-border";
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      color
    )}>
      {permission}
    </span>
  );
}

// Financial Summary (Read-only)
export function FinancialSummary({ 
  label, 
  value, 
  variant = "default" 
}: { 
  label: string; 
  value: string; 
  variant?: "default" | "positive" | "negative" | "warning";
}) {
  const variantStyles = {
    default: "text-card-foreground",
    positive: "text-profit",
    negative: "text-destructive",
    warning: "text-warning",
  };
  
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("font-mono font-semibold text-lg", variantStyles[variant])}>{value}</p>
    </div>
  );
}

// Toggle Switch with confirmation
export function SafeToggle({ 
  enabled, 
  onChange, 
  disabled = false,
}: { 
  enabled: boolean; 
  onChange: (value: boolean) => void; 
  disabled?: boolean;
}) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={handleToggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        enabled ? "bg-profit" : "bg-muted"
      )}
    >
      <span className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
        enabled ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  );
}
