import React, { useState, useEffect } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lock, Building2, AlertTriangle, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function ReserveFundWallet() {
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, ledgerRes] = await Promise.all([
        api.get("/wallet/admin/overview"),
        api.get("/wallet/admin/reserve-fund")
      ]);
      
      setOverview(overviewRes.data);
      
      // Transform reserve_fund_log to LedgerTransaction
      const transformed: LedgerTransaction[] = ledgerRes.data.transactions.map((tx: any) => ({
        id: tx.id.toString(),
        date: new Date(tx.created_at).toLocaleDateString(),
        time: new Date(tx.created_at).toLocaleTimeString(),
        description: tx.source_type === 'profit_allocation' ? 'Monthly Profit Allocation' : tx.note || 'Reserve movement',
        reference: tx.source_ref_id ? `REF-${tx.source_ref_id.split('-')[0].toUpperCase()}` : 'SYSTEM',
        type: parseFloat(tx.credit_amount) > 0 ? "credit" : "debit",
        amount: parseFloat(tx.credit_amount) > 0 ? parseFloat(tx.credit_amount) : parseFloat(tx.debit_amount),
        balance: parseFloat(tx.balance_after),
        status: "completed",
        remarks: tx.note
      }));
      
      setTransactions(transformed);
    } catch (error) {
      console.error("Error fetching reserve fund data:", error);
      toast({
        title: "Error",
        description: "Failed to load reserve fund data",
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
      label: "Reserve Balance", 
      value: overview ? `₹${parseFloat(overview.reserve_fund).toLocaleString()}` : "₹0.00", 
      type: "positive" as const, 
      icon: "up" as const 
    },
    { label: "Trust Fund Share (MTD)", value: "₹0.00", type: "neutral" as const, icon: "neutral" as const },
    { label: "Reserve Cap", value: "Unlimited", type: "neutral" as const, icon: "neutral" as const },
    { label: "Utilization Rate", value: "0%", type: "neutral" as const, icon: "neutral" as const },
  ];

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
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <BalanceCard
            title="Reserve Balance"
            amount={overview ? parseFloat(overview.reserve_fund) : 0}
            type="available"
            subtext="Total company reserve"
          />
          <BalanceCard
            title="Yearly Credit"
            amount={transactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0)}
            type="credit"
            subtext="Total added this year"
          />
          <BalanceCard
            title="Yearly Debit"
            amount={transactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0)}
            type="debit"
            subtext="Total utilized"
          />
          <BalanceCard
            title="Utilization %"
            amount={0}
            type="available"
            subtext="Within healthy range"
          />
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
          transactions={transactions}
          title="Reserve Fund Ledger (Read-Only)"
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
              <strong>Network:</strong> Internal Ledger
            </span>
            <span>
              <strong>Audit Status:</strong> {overview ? "Verified" : "Syncing..."}
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

