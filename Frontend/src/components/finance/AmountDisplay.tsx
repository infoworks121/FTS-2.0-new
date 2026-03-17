import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface AmountDisplayProps {
  amount: number;
  type?: "credit" | "debit" | "neutral";
  showSign?: boolean;
  showCurrency?: boolean;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
};

const currencySizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
};

const signSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-xl",
};

export default function AmountDisplay({
  amount,
  type = "neutral",
  showSign = true,
  showCurrency = true,
  currency = "₹",
  size = "md",
  className,
  animated = false,
}: AmountDisplayProps) {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const getColorClass = () => {
    switch (type) {
      case "credit":
        return "text-green-600 dark:text-green-400";
      case "debit":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-900 dark:text-gray-100";
    }
  };

  const getSign = () => {
    if (!showSign) return "";
    switch (type) {
      case "credit":
        return "+";
      case "debit":
        return "-";
      default:
        return "";
    }
  };

  return (
    <span
      className={cn(
        "font-semibold inline-flex items-center gap-1",
        getColorClass(),
        sizeClasses[size],
        className
      )}
    >
      {type === "credit" && showSign && (
        <ArrowUpRight className={cn("w-4 h-4", signSizes[size])} />
      )}
      {type === "debit" && showSign && (
        <ArrowDownLeft className={cn("w-4 h-4", signSizes[size])} />
      )}
      {showCurrency && (
        <span className={cn("font-medium text-gray-500 dark:text-gray-400", currencySizes[size])}>
          {currency}
        </span>
      )}
      <span className={animated ? "animate-pulse" : ""}>
        {getSign()}{formattedAmount}
      </span>
    </span>
  );
}

// Compact version for tables
export function CompactAmount({
  amount,
  type = "neutral",
}: {
  amount: number;
  type?: "credit" | "debit" | "neutral";
}) {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const getColorClass = () => {
    switch (type) {
      case "credit":
        return "text-green-600 dark:text-green-400";
      case "debit":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-900 dark:text-gray-100";
    }
  };

  return (
    <span className={cn("font-semibold", getColorClass())}>
      {type === "credit" ? "+" : type === "debit" ? "-" : ""}₹{formattedAmount}
    </span>
  );
}

// Large balance display
export function BalanceDisplay({
  amount,
  label,
  type = "neutral",
}: {
  amount: number;
  label?: string;
  type?: "credit" | "debit" | "neutral";
}) {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const getColorClass = () => {
    switch (type) {
      case "credit":
        return "text-green-600 dark:text-green-400";
      case "debit":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-900 dark:text-gray-100";
    }
  };

  return (
    <div className="flex flex-col">
      {label && (
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">₹</span>
        <span className={cn("text-4xl font-bold", getColorClass())}>
          {formattedAmount}
        </span>
      </div>
    </div>
  );
}
