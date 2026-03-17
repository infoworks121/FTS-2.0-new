import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw, Eye, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data
const mockTransactions: LedgerTransaction[] = [
  {
    id: "TXN001",
    date: "2026-02-19",
    time: "10:30:45",
    description: "Order Commission - Order #ORD12345",
    reference: "REF/2026/02/001",
    type: "credit",
    amount: 2500.00,
    balance: 125000.00,
    status: "completed",
    user: "John Businessman",
    remarks: "Commission earned from B2C sale",
  },
  {
    id: "TXN002",
    date: "2026-02-18",
    time: "14:22:10",
    description: "Withdrawal Processed",
    reference: "WTH/2026/02/045",
    type: "debit",
    amount: 10000.00,
    balance: 122500.00,
    status: "completed",
    user: "John Businessman",
    remarks: "Bank transfer completed",
  },
  {
    id: "TXN003",
    date: "2026-02-18",
    time: "09:15:30",
    description: "Referral Bonus",
    reference: "REF/BONUS/023",
    type: "credit",
    amount: 500.00,
    balance: 132500.00,
    status: "completed",
    user: "John Businessman",
    remarks: "Referral signup bonus",
  },
  {
    id: "TXN004",
    date: "2026-02-17",
    time: "16:45:00",
    description: "TDS Deduction",
    reference: "TDS/2026/02/012",
    type: "debit",
    amount: 250.00,
    balance: 132000.00,
    status: "completed",
    user: "John Businessman",
    remarks: "TDS @ 5% on commission",
  },
  {
    id: "TXN005",
    date: "2026-02-17",
    time: "11:20:15",
    description: "Order Commission - Order #ORD12340",
    reference: "REF/2026/02/002",
    type: "credit",
    amount: 5000.00,
    balance: 132250.00,
    status: "completed",
    user: "John Businessman",
    remarks: "Commission earned from B2B sale",
  },
  {
    id: "TXN006",
    date: "2026-02-16",
    time: "15:30:00",
    description: "Processing Fee",
    reference: "FEE/2026/02/008",
    type: "debit",
    amount: 25.00,
    balance: 127250.00,
    status: "completed",
    user: "John Businessman",
    remarks: "Withdrawal processing fee",
  },
];

export default function MainWallet() {
  const [dateRange, setDateRange] = useState<string>("last30days");
  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    { label: "Current Balance", value: "₹1,25,000.00", type: "neutral" as const, icon: "neutral" as const },
    { label: "Total Credits", value: "₹45,50,000.00", type: "positive" as const, icon: "up" as const },
    { label: "Total Debits", value: "₹44,25,000.00", type: "negative" as const, icon: "down" as const },
    { label: "Blocked Amount", value: "₹0.00", type: "neutral" as const, icon: "neutral" as const },
  ];

  const handleExport = () => {
    // Export functionality
    console.log("Exporting ledger...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <FinanceLayout
      title="Main Wallet"
      description="Primary earnings wallet for the platform"
      icon="wallet"
      stats={stats}
    >
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              Wallet Status: Active
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              Auto-settlement: Enabled
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
              {dateRange === "last30days" ? "Last 30 Days" : dateRange}
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
            title="Current Balance"
            amount={125000.00}
            type="available"
            trend={{ value: 12.5, direction: "up" }}
            subtext="Available for withdrawal"
          />
          <BalanceCard
            title="Total Credits"
            amount={4550000.00}
            type="credit"
            trend={{ value: 8.2, direction: "up" }}
            subtext="Since account creation"
          />
          <BalanceCard
            title="Total Debits"
            amount={4425000.00}
            type="debit"
            trend={{ value: 5.1, direction: "down" }}
            subtext="Withdrawals & deductions"
          />
          <BalanceCard
            title="Blocked Amount"
            amount={0.00}
            type="blocked"
            subtext="No active blocks"
          />
        </div>

        {/* Transaction Ledger */}
        <LedgerTable
          transactions={mockTransactions}
          title="Transaction History"
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
            <span>All wallet operations are immutable and logged</span>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
