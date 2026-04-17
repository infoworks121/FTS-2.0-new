import React, { useState, useEffect } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw, Lock, Unlock, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { referralApi, AdminReferralStats } from "@/lib/referralApi";
import { toast } from "sonner";

export default function ReferralWallet() {
  const [stats, setStats] = useState<AdminReferralStats | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, earningsRes] = await Promise.all([
        referralApi.getAdminStats(),
        referralApi.getGlobalEarnings()
      ]);

      setStats(statsRes);
      
      // Map backend earnings to LedgerTransaction format
      const mappedTransactions: LedgerTransaction[] = earningsRes.map(item => ({
        id: item.id,
        date: new Date(item.created_at).toISOString().split('T')[0],
        time: new Date(item.created_at).toLocaleTimeString(),
        description: `Referral Earning - Order #${item.order_id.slice(0, 8)}`,
        reference: item.order_id,
        type: "credit",
        amount: parseFloat(item.gross_amount),
        balance: 0, // Balance tracking might require ledger-specific logic if needed
        status: item.status as any,
        user: `${item.referrer_name} (from ${item.referred_user_name})`,
        remarks: `Commission from referred user's purchase. Status: ${item.status}`
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Failed to load referral wallet data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleExport = () => {
    toast.success("Referral ledger exported successfully");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Synchronizing Referral Wallets...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Available Balance", value: `₹${parseFloat(stats?.available_balance || "0").toLocaleString()}`, type: "positive" as const, icon: "up" as const },
    { label: "Pending (Locked)", value: `₹${parseFloat(stats?.pending_balance || "0").toLocaleString()}`, type: "warning" as const, icon: "neutral" as const },
    { label: "Released This Month", value: `₹${parseFloat(stats?.released_this_month || "0").toLocaleString()}`, type: "positive" as const, icon: "up" as const },
    { label: "Fraud Flags", value: stats?.fraud_counts.toString() || "0", type: "negative" as const, icon: "down" as const },
  ];

  return (
    <FinanceLayout
      title="Referral Wallet"
      description="Referral-based earnings and bonuses"
      icon="referral"
      stats={statCards}
    >
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <Unlock className="w-3 h-3 mr-1" />
              Active
            </Badge>
            {parseFloat(stats?.pending_balance || "0") > 0 && (
              <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                <Lock className="w-3 h-3 mr-1" />
                Pending Releases
              </Badge>
            )}
            {stats?.fraud_counts && stats.fraud_counts > 0 ? (
              <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {stats.fraud_counts} Fraud Flags
              </Badge>
            ) : null}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <BalanceCard
            title="Available Balance"
            amount={parseFloat(stats?.available_balance || "0")}
            type="available"
            trend={{ value: 0, direction: "up" }}
            subtext="Ready for withdrawal"
          />
          <BalanceCard
            title="Pending (Locked)"
            amount={parseFloat(stats?.pending_balance || "0")}
            type="locked"
            subtext="Under 30-day return window"
          />
          <BalanceCard
            title="Released This Month"
            amount={parseFloat(stats?.released_this_month || "0")}
            type="credit"
            trend={{ value: 0, direction: "up" }}
            subtext="Successfully released"
          />
          <BalanceCard
            title="Fraud Flags"
            amount={stats?.fraud_counts || 0}
            type="blocked"
            subtext="Accounts under review"
          />
        </div>

        {/* Fraud Warning Banner */}
        {stats?.fraud_counts && stats.fraud_counts > 0 ? (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-300">
                  Fraud Monitoring Active
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  We have detected {stats.fraud_counts} flags in your referral network. 
                  Referral bonuses are subject to a 30-day return window. 
                  Any fraudulent activity will result in automatic reversal.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Return Window Info */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                Return Window Policy
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Referral bonuses are locked for 30 days to prevent fraud. 
                After 30 days, bonuses are automatically released to the available balance.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Ledger */}
        <LedgerTable
          transactions={transactions}
          title="Referral Transaction History"
          showExport={true}
          showFilters={true}
          onExport={handleExport}
        />
      </div>

      {/* Audit Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>
              <strong>Last Updated:</strong> {new Date().toLocaleString()}
            </span>
            <span>
              <strong>Admin View:</strong> Authorized System Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>All referral operations are immutable and logged</span>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
