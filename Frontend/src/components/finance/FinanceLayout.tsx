import React from "react";
import { cn } from "@/lib/utils";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Shield,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface FinanceLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: "wallet" | "referral" | "trust" | "reserve" | "withdrawal" | "approval" | "history" | "tds" | "fee";
  stats?: FinanceStat[];
}

interface FinanceStat {
  label: string;
  value: string;
  change?: number;
  type: "positive" | "negative" | "neutral" | "warning";
  icon?: "up" | "down" | "neutral";
}

const iconMap = {
  wallet: Wallet,
  referral: TrendingUp,
  trust: Shield,
  reserve: Building2,
  withdrawal: ArrowUpRight,
  approval: Clock,
  history: CheckCircle,
  tds: FileText,
  fee: DollarSign,
};

const iconColors: Record<string, string> = {
  wallet: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  referral: "bg-green-500/10 text-green-600 dark:text-green-400",
  trust: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  reserve: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  withdrawal: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  approval: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  history: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  tds: "bg-red-500/10 text-red-600 dark:text-red-400",
  fee: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
};

// Mock FileText and DollarSign imports - using Lucide icons
import { FileText, DollarSign } from "lucide-react";

export default function FinanceLayout({ 
  children, 
  title, 
  description, 
  icon = "wallet",
  stats 
}: FinanceLayoutProps) {
  const IconComponent = iconMap[icon] || Wallet;
  const iconClass = iconColors[icon] || iconColors.wallet;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-xl", iconClass)}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.label}
                </span>
                {stat.icon === "up" && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                {stat.icon === "down" && (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={cn(
                  "text-2xl font-bold",
                  stat.type === "positive" && "text-green-600 dark:text-green-400",
                  stat.type === "negative" && "text-red-600 dark:text-red-400",
                  stat.type === "neutral" && "text-gray-900 dark:text-gray-100",
                  stat.type === "warning" && "text-yellow-600 dark:text-yellow-400"
                )}>
                  {stat.value}
                </span>
                {stat.change !== undefined && (
                  <span className={cn(
                    "text-sm font-medium",
                    stat.change >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.change >= 0 ? "+" : ""}{stat.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {children}
      </div>
    </div>
  );
}

// Re-export icons for use in other components
export { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Shield,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign
};
