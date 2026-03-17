import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockHistory: LedgerTransaction[] = [
  {
    id: "APR001",
    date: "2026-02-19",
    time: "10:30:45",
    description: "Withdrawal Approved",
    reference: "APR/2026/02/001",
    type: "debit",
    amount: 23725.00,
    balance: 125000.00,
    status: "completed",
    user: "John Businessman",
    remarks: "Approved by Admin - Bank Transfer",
  },
  {
    id: "REJ001",
    date: "2026-02-18",
    time: "14:22:10",
    description: "Withdrawal Rejected",
    reference: "REJ/2026/02/045",
    type: "credit",
    amount: 15000.00,
    balance: 148725.00,
    status: "completed",
    user: "Fake User",
    remarks: "KYC documents not verified",
  },
  {
    id: "APR002",
    date: "2026-02-18",
    time: "09:15:30",
    description: "Withdrawal Approved",
    reference: "APR/2026/02/002",
    type: "debit",
    amount: 47450.00,
    balance: 148725.00,
    status: "completed",
    user: "Jane Distributor",
    remarks: "Approved by Admin - UPI Transfer",
  },
  {
    id: "APR003",
    date: "2026-02-17",
    time: "16:45:00",
    description: "Withdrawal Approved",
    reference: "APR/2026/02/003",
    type: "debit",
    amount: 10000.00,
    balance: 196175.00,
    status: "completed",
    user: "Mike Stock Point",
    remarks: "Approved by Admin",
  },
  {
    id: "REJ002",
    date: "2026-02-16",
    time: "11:20:15",
    description: "Withdrawal Rejected",
    reference: "REJ/2026/02/012",
    type: "credit",
    amount: 5000.00,
    balance: 206175.00,
    status: "completed",
    user: "Suspicious Account",
    remarks: "High-risk transaction flagged",
  },
];

export default function WithdrawalHistory() {
  const [isLoading, setIsLoading] = useState(false);

  const stats = [
    { label: "Total Approved", value: "₹1,45,400.00", type: "positive" as const, icon: "up" as const },
    { label: "Total Rejected", value: "₹20,000.00", type: "negative" as const, icon: "down" as const },
    { label: "This Month", value: "₹1,65,400.00", type: "neutral" as const, icon: "neutral" as const },
    { label: "Success Rate", value: "85%", type: "positive" as const, icon: "up" as const },
  ];

  const handleExport = () => console.log("Exporting history...");

  return (
    <FinanceLayout
      title="Approved / Rejected History"
      description="Complete audit trail of all withdrawal decisions"
      icon="history"
      stats={stats}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓ Approved: 4</Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">✗ Rejected: 2</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 1000); }}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />Refresh
            </Button>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filter</Button>
            <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-2" />Date Range</Button>
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <LedgerTable
          transactions={mockHistory}
          title="Withdrawal Audit Trail"
          showExport={true}
          showFilters={true}
          onExport={handleExport}
        />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span><strong>Export Format:</strong> CSV, PDF</span>
          <span>All entries and permanently are immutable logged for audit purposes</span>
        </div>
      </div>
    </FinanceLayout>
  );
}
