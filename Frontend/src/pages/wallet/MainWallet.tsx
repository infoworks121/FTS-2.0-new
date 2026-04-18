import React, { useState, useEffect } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function MainWallet() {
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, ledgerRes] = await Promise.all([
        api.get("/wallet/admin/overview"),
        api.get("/wallet/admin/company-pool")
      ]);
      
      setOverview(overviewRes.data);
      
      // Transform company_pool_log to LedgerTransaction
      const transformed: LedgerTransaction[] = ledgerRes.data.transactions.map((tx: any) => ({
        id: tx.id.toString(),
        date: new Date(tx.created_at).toLocaleDateString(),
        time: new Date(tx.created_at).toLocaleTimeString(),
        description: `Core Body Share - Order #${tx.order_number}`,
        reference: `POOL/DIST/${tx.distribution_id.split('-')[0].toUpperCase()}`,
        type: "credit",
        amount: parseFloat(tx.total_pool_amount),
        balance: 0, // Backend doesn't provide running balance for pool yet, defaulting to 0 or total
        status: "completed",
        remarks: `Channel: ${tx.channel} | CB Share: ₹${tx.core_body_share}`
      }));
      
      setTransactions(transformed);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const stats = [
    { 
      label: "Total Distributed", 
      value: overview ? `₹${parseFloat(overview.total_distributed).toLocaleString()}` : "₹0.00", 
      type: "positive" as const, 
      icon: "up" as const 
    },
    { 
      label: "Withdrawals Paid", 
      value: overview ? `₹${parseFloat(overview.total_withdrawals_paid).toLocaleString()}` : "₹0.00", 
      type: "positive" as const, 
      icon: "up" as const 
    },
    { 
      label: "Pending Payouts", 
      value: overview ? `₹${parseFloat(overview.pending_withdrawals).toLocaleString()}` : "₹0.00", 
      type: "neutral" as const, 
      icon: "neutral" as const 
    },
    { 
      label: "Reserve Fund", 
      value: overview ? `₹${parseFloat(overview.reserve_fund).toLocaleString()}` : "₹0.00", 
      type: "neutral" as const, 
      icon: "neutral" as const 
    },
  ];

  return (
    <FinanceLayout
      title="Master Wallet Overview"
      description="Platform-wide financial health and system fund allocation"
      icon="wallet"
      stats={stats}
    >
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              System Health: Optimal
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              Profit Engine: Live
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <BalanceCard
            title="Company Pool"
            amount={overview ? parseFloat(overview.company_pool) : 0}
            type="available"
            subtext="Core Body & Reserve Share"
          />
          <BalanceCard
            title="Trust Fund"
            amount={overview ? parseFloat(overview.trust_fund) : 0}
            type="credit"
            subtext="System Social Security Fund"
          />
          <BalanceCard
            title="Admin Fee"
            amount={overview ? parseFloat(overview.admin_fees) : 0}
            type="available"
            subtext="Total platform fees collected"
          />
        </div>

        {/* Transaction Ledger */}
        <LedgerTable
          transactions={transactions}
          title="Pool Allocation History"
          isLoading={isLoading}
          showExport={true}
          showFilters={false}
        />
      </div>

      {/* Audit Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>
              <strong>Network:</strong> FTS Mainnet
            </span>
            <span>
              <strong>Admin View:</strong> {overview ? "Verified" : "Loading..."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Real-time ACID compliant financial ledger</span>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}

