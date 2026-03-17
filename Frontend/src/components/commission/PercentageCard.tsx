import React from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";

interface PercentageCardProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  variant?: "default" | "profit" | "trust" | "company" | "admin" | "reserve";
  locked?: boolean;
}

const variantStyles = {
  default: "border-border",
  profit: "border-profit/30",
  trust: "border-trust/30",
  company: "border-company/30",
  admin: "border-admin/30",
  reserve: "border-reserve/30",
};

const variantAccentStyles = {
  default: "bg-primary",
  profit: "bg-profit",
  trust: "bg-trust",
  company: "bg-company",
  admin: "bg-admin",
  reserve: "bg-reserve",
};

export function PercentageCard({
  label,
  value,
  onChange,
  tooltip,
  min = 0,
  max = 100,
  disabled = false,
  variant = "default",
  locked = false,
}: PercentageCardProps) {
  const handleSliderChange = (values: number[]) => {
    if (!disabled && !locked) {
      onChange(values[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value) || 0;
    const clampedValue = Math.min(Math.max(numValue, min), max);
    if (!disabled && !locked) {
      onChange(clampedValue);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-all duration-300",
        variantStyles[variant],
        (disabled || locked) && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-card-foreground">{label}</span>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {locked && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Locked
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            disabled={disabled || locked}
            min={min}
            max={max}
            className={cn(
              "w-20 text-center font-mono text-lg font-bold",
              variant === "profit" && "text-profit",
              variant === "trust" && "text-trust",
              variant === "company" && "text-company",
              variant === "admin" && "text-admin",
              variant === "reserve" && "text-reserve"
            )}
          />
          <span className="text-lg font-bold text-muted-foreground">%</span>
        </div>
        
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          max={max}
          step={0.1}
          disabled={disabled || locked}
          className={cn("py-2")}
        />
        
        <div className={cn(
          "h-1.5 rounded-full overflow-hidden",
          variantAccentStyles[variant],
          "opacity-30"
        )}>
          <div
            className={cn("h-full rounded-full transition-all duration-300", variantAccentStyles[variant])}
            style={{ width: `${(value / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface PercentageSummaryProps {
  total: number;
  target?: number;
  showWarning?: boolean;
}

export function PercentageSummary({ total, target = 100, showWarning = true }: PercentageSummaryProps) {
  const isValid = total === target;
  const difference = total - target;
  
  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border p-3 text-sm",
      isValid ? "border-profit/30 bg-profit/5" : "border-warning/30 bg-warning/5"
    )}>
      <span className="text-muted-foreground">Total Allocation</span>
      <div className="flex items-center gap-2">
        <span className={cn(
          "font-mono font-bold",
          isValid ? "text-profit" : "text-warning"
        )}>
          {total.toFixed(1)}%
        </span>
        {!isValid && showWarning && (
          <span className="text-xs text-warning">
            ({difference > 0 ? "+" : ""}{difference.toFixed(1)}% {difference > 0 ? "over" : "under"})
          </span>
        )}
      </div>
    </div>
  );
}
