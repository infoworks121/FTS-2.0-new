import React, { useState, useEffect } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lock, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";



export default function TrustWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const [trustBalance, setTrustBalance] = useState(0);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, logRes] = await Promise.all([
        api.get('/wallet/admin/overview'),
        api.get('/wallet/admin/trust-fund?limit=20'),
      ]);
      setTrustBalance(overviewRes.data.trust_fund || 0);
      // Map backend data to LedgerTransaction shape
      const mapped = (logRes.data.transactions || []).map((t: any) => ({
        id: t.id,
        date: new Date(t.created_at).toLocaleDateString('en-IN'),
        time: new Date(t.created_at).toLocaleTimeString('en-IN'),
        description: t.note || t.source_type,
        reference: `TRUST/${t.source_type}/${t.source_ref_id || t.id}`,
        type: t.credit_amount > 0 ? 'credit' : 'debit',
        amount: parseFloat(t.credit_amount || t.debit_amount || 0),
        balance: parseFloat(t.balance_after || 0),
        status: 'completed',
        remarks: t.note || '',
      }));
      setTransactions(mapped);
    } catch (err) {
      console.error('Failed to fetch trust fund data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(n);


  const stats = [
    { label: "Trust Balance", value: `₹${fmt(trustBalance)}`, type: "positive" as const, icon: "up" as const },
    { label: "Monthly Contribution", value: "Auto", type: "neutral" as const, icon: "neutral" as const },
    { label: "Total Entries", value: String(transactions.length), type: "neutral" as const, icon: "neutral" as const },
    { label: "Active Disputes", value: "—", type: "warning" as const, icon: "neutral" as const },
  ];

  const handleRefresh = () => { fetchData(); };

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
            title="Trust Fund Balance"
            amount={trustBalance}
            type="available"
            subtext="Live from backend"
          />
          <BalanceCard
            title="Recent Credits"
            amount={transactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0)}
            type="credit"
            subtext="This page (20 entries)"
          />
          <BalanceCard
            title="Recent Debits"
            amount={transactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0)}
            type="debit"
            subtext="This page (20 entries)"
          />
          <BalanceCard
            title="Net"
            amount={transactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0) - transactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0)}
            type="blocked"
            subtext="Page net"
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
          transactions={transactions}
          title="Trust Fund Ledger (Live)"
          showExport={true}
          showFilters={true}
          onExport={() => console.log('export')}
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
