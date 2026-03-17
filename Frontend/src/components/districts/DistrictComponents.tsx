import { cn } from "@/lib/utils";

// Capacity Bar Component - Shows used vs available Core Bodies
interface CapacityBarProps {
  used: number;
  max: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CapacityBar({ used, max, showLabel = true, size = "md" }: CapacityBarProps) {
  const percentage = Math.min((used / max) * 100, 100);
  const isNearFull = percentage >= 80;
  const isFull = percentage >= 100;

  const heightClass = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size];

  const textSize = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  }[size];

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn("font-medium", textSize)}>
            {used} / {max} Core Bodies
          </span>
          <span className={cn(
            "font-bold font-mono",
            textSize,
            isFull ? "text-destructive" : isNearFull ? "text-warning" : "text-cap"
          )}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", heightClass)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isFull 
              ? "bg-destructive" 
              : isNearFull 
                ? "bg-warning animate-pulse" 
                : "bg-cap"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isFull && (
        <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
          🛑 District at maximum capacity
        </p>
      )}
      {isNearFull && !isFull && (
        <p className="text-[11px] text-warning font-medium flex items-center gap-1">
          ⚠️ Approaching limit - {max - used} slots remaining
        </p>
      )}
    </div>
  );
}

// Core Body Type Badge
interface CoreBodyTypeBadgeProps {
  type: "A" | "B";
}

export function CoreBodyTypeBadge({ type }: CoreBodyTypeBadgeProps) {
  const styles = type === "A" 
    ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
    : "bg-blue-500/10 text-blue-500 border-blue-500/20";

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
      styles
    )}>
      {type}
    </span>
  );
}

// Earnings Cap Indicator
interface EarningsCapIndicatorProps {
  current: number;
  max: number;
  period?: "monthly" | "annual";
}

export function EarningsCapIndicator({ current, max, period = "annual" }: EarningsCapIndicatorProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearCap = percentage >= 80;
  const isAtCap = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {period === "annual" ? "Annual" : "Monthly"} Earnings Cap
        </span>
        <span className={cn(
          "text-xs font-bold font-mono",
          isAtCap ? "text-destructive" : isNearCap ? "text-warning" : "text-profit"
        )}>
          ₹{current.toLocaleString()} / ₹{max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAtCap ? "bg-destructive" : isNearCap ? "bg-warning" : "bg-profit"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isAtCap && (
        <p className="text-[11px] text-destructive font-medium">
          🛑 Cap reached - earnings auto-stopped
        </p>
      )}
    </div>
  );
}

// Investment Amount Display
interface InvestmentDisplayProps {
  amount: number;
  installment?: number;
  totalInstallments?: number;
}

export function InvestmentDisplay({ amount, installment, totalInstallments }: InvestmentDisplayProps) {
  return (
    <div className="space-y-1">
      <span className="text-lg font-bold font-mono text-card-foreground">
        ₹{amount.toLocaleString()}
      </span>
      {installment !== undefined && totalInstallments !== undefined && (
        <p className="text-xs text-muted-foreground">
          Installment {installment} of {totalInstallments}
        </p>
      )}
    </div>
  );
}

// Trust Fund Contribution Display
interface TrustFundDisplayProps {
  amount: number;
  percentage?: number;
}

export function TrustFundDisplay({ amount, percentage }: TrustFundDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-md bg-trust/10 p-2">
        <span className="text-trust text-xs font-bold">TF</span>
      </div>
      <div>
        <span className="text-sm font-bold font-mono text-card-foreground">
          ₹{amount.toLocaleString()}
        </span>
        {percentage !== undefined && (
          <span className="text-xs text-muted-foreground ml-1">
            ({percentage}%)
          </span>
        )}
      </div>
    </div>
  );
}

// Quick Filter Chip
interface QuickFilterChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

export function QuickFilterChip({ label, active = false, count, onClick }: QuickFilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px]",
          active ? "bg-primary-foreground/20" : "bg-muted-foreground/20"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// Stat Card for Dashboard
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function StatCard({ title, value, subtitle, trend, trendValue }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors duration-300">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold font-mono tracking-tight text-card-foreground mt-1">{value}</p>
      {(subtitle || trendValue) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={cn(
              "text-xs font-semibold",
              trend === "up" && "text-profit",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground"
            )}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Export all components
export const DistrictComponents = {
  CapacityBar,
  CoreBodyTypeBadge,
  EarningsCapIndicator,
  InvestmentDisplay,
  TrustFundDisplay,
  QuickFilterChip,
  StatCard,
};
