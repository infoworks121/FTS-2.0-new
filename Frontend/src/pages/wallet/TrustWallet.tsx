import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw, Lock, Shield, AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data
const mockTransactions: LedgerTransaction[] = [
  {
    id: "TRUST001",
    date: "2026-02-19",
    time: "00:00:00",
    description: "Monthly Contribution - February",
    reference: "TRUST/CONTRIB/2026/02",
    type: "credit",
    amount: 50000.00,
    balance: 2500000.00,
    status: "completed",
    remarks: "Auto-contribution from platform fees",
  },
  {
    id: "TRUST002",
    date: "2026-02-15",
    time: "14:30:00",
    description: "Fraud Protection Payout",
    reference: "TRUST/PAYOUT/045",
    type: "debit",
    amount: 25000.00,
    balance: 2450000.00,
    status: "completed",
    user: "Refund Recipient",
    remarks: "Fraud victim reimbursement",
  },
  {
    id: "TRUST003",
    date: "2026-02-01",
    time: "00:00:00",
    description: "Monthly Contribution - January",
    reference: "TRUST/CONTRIB/2026/01",
    type: "credit",
    amount: 50000.00,
    balance: 2475000.00,
    status: "completed",
    remarks: "Auto-contribution from platform fees",
  },
  {
    id: "TRUST004",
    date: "2026-01-20",
    time: "10:15:00",
    description: "Dispute Resolution Payout",
    reference: "TRUST/DISPUTE/012",
    type: "debit",
    amount: 15000.00,
    balance: 2425000.00,
    status: "completed",
    user: "Dispute Winner",
    remarks: "Customer dispute settlement",
  },
  {
    id: "TRUST005",
    date: "2026-01-15",
    time: "09:00:00",
    description: "Trust Fund Utilization Report",
    reference: "AUDIT/2026/01",
    type: "debit",
    amount: 0.00,
    balance: 2440000.00,
    status: "completed",
    remarks: "Monthly audit verification",
  },
];

export default function TrustWallet() {
  const [dateRange, setDateRange] = useState<string>("last30days");
  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    { label: "Total Trust Balance", value: "₹25,00,000.00", type: "positive" as const, icon: "up" as const },
    { label: "Monthly Contribution", value: "₹50,000.00", type: "neutral" as const, icon: "neutral" as const },
    { label: "Utilization This Month", value: "₹40,000.00", type: "negative" as const, icon: "down" as const },
    { label: "Active Disputes", value: "2", type: "warning" as const, icon: "neutral" as const },
  ];

  const handleExport = () => {
    console.log("Exporting trust fund ledger...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <FinanceLayout
      title="Trust Wallet"
      description="System trust & safety fund - read-only for admins"
      icon="trust"
      stats={stats}
    >
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800">
              <Shield className="w-3 h-3 mr-1" />
              System Protected
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              Read-Only Access
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
            title="Total Trust Balance"
            amount={2500000.00}
            type="available"
            trend={{ value: 2.1, direction: "up" }}
            subtext="Cumulative trust fund"
          />
          <BalanceCard
            title="Monthly Contribution"
            amount={50000.00}
            type="credit"
            trend={{ value: 0, direction: "up" }}
            subtext="Auto-contribution from fees"
          />
          <BalanceCard
            title="Utilization This Month"
            amount={40000.00}
            type="debit"
            subtext="Disputes & fraud protection"
          />
          <BalanceCard
            title="Active Disputes"
            amount={2}
            type="blocked"
            subtext="Under review"
          />
        </div>

        {/* Legal Notice Banner */}
        <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-cyan-800 dark:text-cyan-300">
                Trust & Safety Fund - Legal Notice
              </h4>
              <p className="text-sm text-cyan-700 dark:text-cyan-400 mt-1">
                This is a system-protected fund managed according to regulatory guidelines. 
                Allocations require multi-level authorization. This wallet is read-only 
                for standard admins and cannot be manually edited.
              </p>
            </div>
          </div>
        </div>

        {/* No Manual Edit Warning */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
                Read-Only Access
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Direct balance modifications are disabled. All fund movements are 
                automated based on system rules. Any changes require compliance 
                team authorization with full audit trail.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Ledger */}
        <LedgerTable
          transactions={mockTransactions}
          title="Trust Fund Ledger (Read-Only)"
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
              <strong>Last Updated:</strong> 2026-02-19 00:00:00 IST
            </span>
            <span>
              <strong>Audit Reference:</strong> TR-AUD-2026-02-001
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Trust fund operations are immutable and compliance-logged</span>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
