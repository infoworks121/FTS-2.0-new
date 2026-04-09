import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Lock, AlertTriangle } from "lucide-react";

interface BalanceCardProps {
  title: string;
  amount: number;
  currency?: string;
  type: "credit" | "debit" | "blocked" | "available" | "pending" | "locked" | "neutral";
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  subtext?: string;
  showCurrency?: boolean;
}

const typeStyles = {
  credit: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-400",
    icon: "text-green-500",
  },
  debit: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    icon: "text-red-500",
  },
  blocked: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-400",
    icon: "text-orange-500",
  },
  available: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-500",
  },
  pending: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: "text-yellow-500",
  },
  locked: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-400",
    icon: "text-purple-500",
  },
  neutral: {
    bg: "bg-gray-50 dark:bg-gray-900/30",
    border: "border-gray-200 dark:border-gray-800",
    text: "text-gray-700 dark:text-gray-400",
    icon: "text-gray-500",
  },
};

const typeLabels = {
  credit: "Total Credits",
  debit: "Total Debits",
  blocked: "Blocked Amount",
  available: "Available Balance",
  pending: "Pending",
  locked: "Locked",
  neutral: "Total",
};

const typeIcons = {
  credit: TrendingUp,
  debit: TrendingDown,
  blocked: Lock,
  available: TrendingUp,
  pending: AlertTriangle,
  locked: Lock,
  neutral: TrendingUp,
};

export default function BalanceCard({
  title,
  amount,
  currency = "₹",
  type = "available",
  icon,
  trend,
  subtext,
  showCurrency = true,
}: BalanceCardProps) {
  const styles = typeStyles[type as keyof typeof typeStyles] || typeStyles.available;
  const TypeIcon = typeIcons[type as keyof typeof typeIcons] || typeIcons.available;

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all hover:shadow-md",
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {showCurrency && (
              <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                {currency}
              </span>
            )}
            <span className={cn("text-3xl font-bold", styles.text)}>
              {formatAmount(amount)}
            </span>
          </div>
          
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.direction === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.direction === "up" ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.value}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}

          {subtext && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </div>

        <div
          className={cn(
            "p-3 rounded-lg",
            styles.bg,
            "border",
            styles.border
          )}
        >
          {icon || <TypeIcon className={cn("w-6 h-6", styles.icon)} />}
        </div>
      </div>
    </div>
  );
}

export { typeLabels, typeStyles };
