import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw, Lock, Building2, AlertTriangle, Eye, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data
const mockTransactions: LedgerTransaction[] = [
  {
    id: "RSV001",
    date: "2026-02-01",
    time: "00:00:00",
    description: "Profit Allocation - January",
    reference: "RSV/PROFIT/2026/01",
    type: "credit",
    amount: 500000.00,
    balance: 15000000.00,
    status: "completed",
    remarks: "Monthly profit allocation to reserve",
  },
  {
    id: "RSV002",
    date: "2026-01-25",
    time: "10:00:00",
    description: "Emergency Fund Utilization",
    reference: "RSV/EMERGENCY/008",
    type: "debit",
    amount: 200000.00,
    balance: 14500000.00,
    status: "completed",
    remarks: "Platform infrastructure upgrade",
  },
  {
    id: "RSV003",
    date: "2026-01-15",
    time: "14:30:00",
    description: "Legal Expense Coverage",
    reference: "RSV/LEGAL/023",
    type: "debit",
    amount: 150000.00,
    balance: 14700000.00,
    status: "completed",
    remarks: "Legal proceedings settlement",
  },
  {
    id: "RSV004",
    date: "2026-01-01",
    time: "00:00:00",
    description: "Profit Allocation - December",
    reference: "RSV/PROFIT/2025/12",
    type: "credit",
    amount: 450000.00,
    balance: 14850000.00,
    status: "completed",
    remarks: "Monthly profit allocation to reserve",
  },
  {
    id: "RSV005",
    date: "2025-12-20",
    time: "09:00:00",
    description: "Reserve Fund Audit",
    reference: "AUDIT/RSV/2025/12",
    type: "debit",
    amount: 0.00,
    balance: 14400000.00,
    status: "completed",
    remarks: "Quarterly audit verification",
  },
];

export default function ReserveFundWallet() {
  const [dateRange, setDateRange] = useState<string>("last30days");
  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    { label: "Reserve Balance", value: "₹1,50,00,000.00", type: "positive" as const, icon: "up" as const },
    { label: "Profit Allocation", value: "₹5,00,000.00", type: "neutral" as const, icon: "neutral" as const },
    { label: "YTD Utilization", value: "₹3,50,000.00", type: "negative" as const, icon: "down" as const },
    { label: "Utilization Rate", value: "2.3%", type: "neutral" as const, icon: "neutral" as const },
  ];

  const handleExport = () => {
    console.log("Exporting reserve fund ledger...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <FinanceLayout
      title="Reserve Fund Wallet"
      description="Company reserve & buffer fund - executive access only"
      icon="reserve"
      stats={stats}
    >
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">
              <Building2 className="w-3 h-3 mr-1" />
              Executive Access
            </Badge>
            <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
              <Lock className="w-3 h-3 mr-1" />
              Locked by Default
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
            title="Reserve Balance"
            amount={15000000.00}
            type="available"
            trend={{ value: 3.5, direction: "up" }}
            subtext="Total company reserve"
          />
          <BalanceCard
            title="Profit Allocation"
            amount={500000.00}
            type="credit"
            trend={{ value: 11.1, direction: "up" }}
            subtext="This month's allocation"
          />
          <BalanceCard
            title="YTD Utilization"
            amount={350000.00}
            type="debit"
            subtext="Operational expenses"
          />
          <BalanceCard
            title="Utilization Rate"
            amount={2.3}
            type="available"
            subtext="Within healthy range"
          />
        </div>

        {/* Source Breakdown */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Reserve Fund Source Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Profit Allocation</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">₹1,00,00,000</p>
              <p className="text-xs text-green-600 dark:text-green-400">66.7%</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Revenue Surplus</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">₹40,00,000</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">26.7%</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Asset Sales</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">₹10,00,000</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">6.6%</p>
            </div>
          </div>
        </div>

        {/* Executive Warning Banner */}
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-800 dark:text-purple-300">
                Executive-Only Access
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                This is a highly sensitive company reserve fund. All access and 
                modifications require executive-level authorization with full 
                audit trail. Standard admins have read-only visibility.
              </p>
            </div>
          </div>
        </div>

        {/* Locked by Default Warning */}
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">
                Locked by Default
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                Direct fund withdrawals from reserve require multi-level approval 
                from CFO and CEO. Emergency withdrawals require board notification 
                within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Ledger */}
        <LedgerTable
          transactions={mockTransactions}
          title="Reserve Fund Ledger (Read-Only)"
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
              <strong>Audit Reference:</strong> RSV-AUD-2026-02-001
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Reserve fund operations require executive authorization</span>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
