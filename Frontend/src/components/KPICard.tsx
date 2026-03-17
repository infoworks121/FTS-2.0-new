import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KPIVariant = "default" | "profit" | "warning" | "cap" | "trust" | "reserve";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  variant?: KPIVariant;
  subtitle?: string;
}

const variantStyles: Record<KPIVariant, string> = {
  default: "border-border",
  profit: "border-profit/30 glow-profit",
  warning: "border-warning/30 glow-warning",
  cap: "border-cap/30 glow-cap",
  trust: "border-trust/30 glow-trust",
  reserve: "border-reserve/30",
};

const iconVariantStyles: Record<KPIVariant, string> = {
  default: "bg-primary/10 text-primary",
  profit: "bg-profit/10 text-profit",
  warning: "bg-warning/10 text-warning",
  cap: "bg-cap/10 text-cap",
  trust: "bg-trust/10 text-trust",
  reserve: "bg-reserve/10 text-reserve",
};

export function KPICard({ title, value, change, changeType = "neutral", icon: Icon, variant = "default", subtitle }: KPICardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 animate-slide-in transition-colors duration-300", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("rounded-lg p-2.5", iconVariantStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={cn(
            "text-xs font-semibold font-mono",
            changeType === "positive" && "text-profit",
            changeType === "negative" && "text-destructive",
            changeType === "neutral" && "text-muted-foreground"
          )}>
            {change}
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}
