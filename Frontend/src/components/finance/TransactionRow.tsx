import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TransactionRowProps {
  id: string;
  date: string;
  time: string;
  description: string;
  type: "credit" | "debit";
  amount: number;
  status: "completed" | "pending" | "failed" | "reversed";
  reference?: string;
  user?: string;
  onClick?: () => void;
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  pending: {
    icon: Clock,
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  reversed: {
    icon: AlertTriangle,
    label: "Reversed",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  },
};

const formatAmount = (amount: number, type: "credit" | "debit") => {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return type === "credit" ? `+₹${formatted}` : `-₹${formatted}`;
};

export default function TransactionRow({
  id,
  date,
  time,
  description,
  type,
  amount,
  status,
  reference,
  user,
  onClick,
}: TransactionRowProps) {
  const statusData = statusConfig[status];
  const StatusIcon = statusData.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700",
        "hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Left Section - Date & Description */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Type Icon */}
        <div
          className={cn(
            "p-2 rounded-lg flex-shrink-0",
            type === "credit"
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-red-100 dark:bg-red-900/30"
          )}
        >
          {type === "credit" ? (
            <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownLeft className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>

        {/* Date & Description */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {date}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {time}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {description}
          </p>
          {user && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user}
            </p>
          )}
        </div>
      </div>

      {/* Middle Section - Reference */}
      <div className="hidden md:block px-4">
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
          {reference || "-"}
        </span>
      </div>

      {/* Right Section - Amount & Status */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Amount */}
        <div className="text-right">
          <p
            className={cn(
              "text-lg font-semibold",
              type === "credit"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {formatAmount(amount, type)}
          </p>
        </div>

        {/* Status Badge */}
        <Badge className={cn("flex items-center gap-1", statusData.className)}>
          <StatusIcon className="w-3 h-3" />
          {statusData.label}
        </Badge>
      </div>
    </div>
  );
}
