import React from "react";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Lock,
  TrendingUp,
  Ban
} from "lucide-react";
import { Badge, BadgeProps } from "@/components/ui/badge";

type FinanceStatus = 
  | "completed" 
  | "pending" 
  | "failed" 
  | "reversed" 
  | "approved" 
  | "rejected" 
  | "processing"
  | "blocked"
  | "locked"
  | "released"
  | "active"
  | "inactive";

interface FinanceStatusBadgeProps {
  status: FinanceStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<FinanceStatus, {
  label: string;
  icon: React.ElementType;
  className: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}> = {
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-200 dark:border-green-800",
    textClass: "text-green-700 dark:text-green-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-200 dark:border-yellow-800",
    textClass: "text-yellow-700 dark:text-yellow-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-200 dark:border-red-800",
    textClass: "text-red-700 dark:text-red-400",
  },
  reversed: {
    label: "Reversed",
    icon: AlertTriangle,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    bgClass: "bg-gray-500/10",
    borderClass: "border-gray-200 dark:border-gray-700",
    textClass: "text-gray-700 dark:text-gray-400",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-200 dark:border-green-800",
    textClass: "text-green-700 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-200 dark:border-red-800",
    textClass: "text-red-700 dark:text-red-400",
  },
  processing: {
    label: "Processing",
    icon: Clock,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-200 dark:border-blue-800",
    textClass: "text-blue-700 dark:text-blue-400",
  },
  blocked: {
    label: "Blocked",
    icon: Ban,
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-200 dark:border-orange-800",
    textClass: "text-orange-700 dark:text-orange-400",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-200 dark:border-purple-800",
    textClass: "text-purple-700 dark:text-purple-400",
  },
  released: {
    label: "Released",
    icon: TrendingUp,
    className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-200 dark:border-cyan-800",
    textClass: "text-cyan-700 dark:text-cyan-400",
  },
  active: {
    label: "Active",
    icon: Shield,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-200 dark:border-green-800",
    textClass: "text-green-700 dark:text-green-400",
  },
  inactive: {
    label: "Inactive",
    icon: Ban,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    bgClass: "bg-gray-500/10",
    borderClass: "border-gray-200 dark:border-gray-700",
    textClass: "text-gray-700 dark:text-gray-400",
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export default function FinanceStatusBadge({
  status,
  size = "md",
  showIcon = true,
  className,
}: FinanceStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full border",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}

// For inline status indicators (dots)
export function StatusDot({
  status,
  size = "sm",
}: {
  status: FinanceStatus;
  size?: "sm" | "md" | "lg";
}) {
  const config = statusConfig[status];

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full",
        config.bgClass,
        dotSizes[size]
      )}
    />
  );
}

// For table row status indicators
export function TableStatusCell({
  status,
}: {
  status: FinanceStatus;
}) {
  return (
    <div className="flex items-center gap-2">
      <StatusDot status={status} />
      <FinanceStatusBadge status={status} size="sm" />
    </div>
  );
}
