import { cn } from "@/lib/utils";

interface CapProgressBarProps {
  current: number;
  max: number;
  label: string;
  showWarning?: boolean;
}

export function CapProgressBar({ current, max, label, showWarning = true }: CapProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearCap = percentage >= 80;
  const isAtCap = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn(
          "text-xs font-bold font-mono",
          isAtCap ? "text-destructive" : isNearCap ? "text-warning" : "text-cap"
        )}>
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAtCap ? "bg-destructive" : isNearCap ? "bg-warning" : "bg-cap"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showWarning && isNearCap && !isAtCap && (
        <p className="text-[11px] text-warning font-medium">⚠ Approaching cap limit ({percentage.toFixed(0)}%)</p>
      )}
      {showWarning && isAtCap && (
        <p className="text-[11px] text-destructive font-medium">🛑 Cap limit reached — auto-stopped</p>
      )}
    </div>
  );
}
