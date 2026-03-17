import React from "react";
import { cn } from "@/lib/utils";
import { Wallet, Shield, Building2, TrendingUp } from "lucide-react";

interface WalletSummaryCardProps {
  title: string;
  walletType: "main" | "referral" | "trust" | "reserve";
  currentBalance: number;
  totalCredits: number;
  totalDebits: number;
  blockedAmount?: number;
  pendingAmount?: number;
  lockedAmount?: number;
  onViewDetails?: () => void;
}

const walletConfig = {
  main: {
    icon: Wallet,
    color: "blue",
    bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  referral: {
    icon: TrendingUp,
    color: "green",
    bgGradient: "from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
  trust: {
    icon: Shield,
    color: "cyan",
    bgGradient: "from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/20",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  reserve: {
    icon: Building2,
    color: "purple",
    bgGradient: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function WalletSummaryCard({
  title,
  walletType,
  currentBalance,
  totalCredits,
  totalDebits,
  blockedAmount = 0,
  pendingAmount = 0,
  lockedAmount = 0,
  onViewDetails,
}: WalletSummaryCardProps) {
  const config = walletConfig[walletType];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border-2 p-6 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800",
        config.bgGradient,
        config.borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-xl", config.iconBg)}>
            <Icon className={cn("w-6 h-6", config.iconColor)} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Wallet Type: {walletType.charAt(0).toUpperCase() + walletType.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Balance */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Current Balance
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            ₹{formatAmount(currentBalance)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Total Credits
          </p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            +₹{formatAmount(totalCredits)}
          </p>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Total Debits
          </p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            -₹{formatAmount(totalDebits)}
          </p>
        </div>
        
        {blockedAmount > 0 && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Blocked
            </p>
            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
              ₹{formatAmount(blockedAmount)}
            </p>
          </div>
        )}
        
        {pendingAmount > 0 && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Pending
            </p>
            <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              ₹{formatAmount(pendingAmount)}
            </p>
          </div>
        )}

        {lockedAmount > 0 && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Locked
            </p>
            <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              ₹{formatAmount(lockedAmount)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
