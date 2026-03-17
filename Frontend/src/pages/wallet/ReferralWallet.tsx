import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw, Lock, Unlock, AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data
const mockTransactions: LedgerTransaction[] = [
  {
    id: "REF001",
    date: "2026-02-19",
    time: "10:30:45",
    description: "Referral Signup Bonus",
    reference: "REF/SIGNUP/001",
    type: "credit",
    amount: 500.00,
    balance: 15000.00,
    status: "completed",
    user: "New User John",
    remarks: "Referral bonus for successful signup",
  },
  {
    id: "REF002",
    date: "2026-02-18",
    time: "14:22:10",
    description: "Referral Purchase Commission",
    reference: "REF/COMM/045",
    type: "credit",
    amount: 250.00,
    balance: 14500.00,
    status: "completed",
    user: "Referred User Jane",
    remarks: "Commission from first purchase",
  },
  {
    id: "REF003",
    date: "2026-02-17",
    time: "09:15:30",
    description: "Referral Bonus Locked",
    reference: "REF/LOCK/023",
    type: "credit",
    amount: 1000.00,
    balance: 14250.00,
    status: "pending",
    user: "New User Mike",
    remarks: "Bonus locked - 30 day return window",
  },
  {
    id: "REF004",
    date: "2026-02-16",
    time: "16:45:00",
    description: "Referral Bonus Released",
    reference: "REF/REL/012",
    type: "credit",
    amount: 500.00,
    balance: 13250.00,
    status: "completed",
    user: "Previous User Sarah",
    remarks: "30 day return window completed",
  },
  {
    id: "REF005",
    date: "2026-02-15",
    time: "11:20:15",
    description: "Fraud Flag - Referral Reversed",
    reference: "FRAUD/REF/008",
    type: "debit",
    amount: 500.00,
    balance: 12750.00,
    status: "reversed",
    user: "Fake Account",
    remarks: "Account flagged as duplicate - bonus reversed",
  },
];

export default function ReferralWallet() {
  const [dateRange, setDateRange] = useState<string>("last30days");
  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    { label: "Available Balance", value: "₹15,000.00", type: "positive" as const, icon: "up" as const },
    { label: "Pending (Locked)", value: "₹8,500.00", type: "warning" as const, icon: "neutral" as const },
    { label: "Released This Month", value: "₹4,200.00", type: "positive" as const, icon: "up" as const },
    { label: "Fraud Flags", value: "3", type: "negative" as const, icon: "down" as const },
  ];

  const handleExport = () => {
    console.log("Exporting referral ledger...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <FinanceLayout
      title="Referral Wallet"
      description="Referral-based earnings and bonuses"
      icon="referral"
      stats={stats}
    >
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <Unlock className="w-3 h-3 mr-1" />
              Active
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
              <Lock className="w-3 h-3 mr-1" />
              3 Pending Releases
            </Badge>
            <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              3 Fraud Flags
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
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
            amount={15000.00}
            type="available"
            trend={{ value: 15.2, direction: "up" }}
            subtext="Ready for withdrawal"
          />
          <BalanceCard
            title="Pending (Locked)"
            amount={8500.00}
            type="locked"
            subtext="Under 30-day return window"
          />
          <BalanceCard
            title="Released This Month"
            amount={4200.00}
            type="credit"
            trend={{ value: 22.5, direction: "up" }}
            subtext="Successfully released"
          />
          <BalanceCard
            title="Fraud Flags"
            amount={3}
            type="blocked"
            subtext="Accounts under review"
          />
        </div>

        {/* Fraud Warning Banner */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">
                Fraud Monitoring Active
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Referral bonuses are subject to a 30-day return window. 
                Any fraudulent activity including duplicate accounts, fake signups, 
                or abuse will result in automatic reversal and account suspension.
              </p>
            </div>
          </div>
        </div>

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
          transactions={mockTransactions}
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
              <strong>Last Updated:</strong> 2026-02-19 10:30:45 IST
            </span>
            <span>
              <strong>Admin View:</strong> System Admin
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
