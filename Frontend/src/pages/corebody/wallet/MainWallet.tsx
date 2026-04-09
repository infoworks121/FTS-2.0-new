import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import BalanceCard from "@/components/finance/BalanceCard";
import LedgerTable, { LedgerTransaction } from "@/components/finance/LedgerTable";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, ShieldCheck, TrendingUp, Clock, AlertCircle, PlusCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import DepositRequestModal from "@/components/finance/DepositRequestModal";
import InstallmentPaymentModal from "@/components/finance/InstallmentPaymentModal";

export default function MainWallet() {
  const [isLoading, setIsLoading] = useState(true);
  const [walletOverview, setWalletOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [installments, setInstallments] = useState<any[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState<{ no: number; amount: number } | null>(null);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, transactionsRes, profileRes] = await Promise.all([
        api.get("/wallet/me"),
        api.get("/wallet/me/transactions"),
        api.get("/corebody-profile/profile")
      ]);
      
      setWalletOverview(walletRes.data.wallet);
      setInstallments(profileRes.data.profile.installments || []);
      
      // Transform backend transactions to LedgerTransaction format
      const transformed: LedgerTransaction[] = (transactionsRes.data.transactions || []).map((tx: any) => ({
        id: tx.id.toString(),
        date: new Date(tx.created_at).toLocaleDateString(),
        time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: tx.description || "Transaction",
        reference: tx.reference_id?.substring(0, 8).toUpperCase() || "N/A",
        type: tx.transaction_type === 'credit' || tx.transaction_type === 'deposit' || tx.transaction_type === 'earning' ? "credit" : "debit",
        amount: parseFloat(tx.amount),
        balance: parseFloat(tx.balance_after || 0),
        status: "completed", // Transactions in ledger are already processed
        remarks: tx.source_type ? `Source: ${tx.source_type}` : ""
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

  // Helper to determine cap info based on user type
  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role_code;
  const isTypeA = userRole === 'core_body_a';
  const capLabel = isTypeA ? "Annual Income Cap" : "Monthly Income Cap";
  const capLimit = isTypeA ? (walletOverview?.annual_cap || 2500000) : (walletOverview?.monthly_cap || 100000);
  const capUsed = isTypeA ? (walletOverview?.ytd_earnings || 0) : (walletOverview?.mtd_earnings || 0);

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — Main Wallet">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Main Wallet
            </h1>
            <p className="text-sm text-muted-foreground">
              Detailed financial ledger and income cap monitoring.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={walletOverview?.is_frozen ? "destructive" : "secondary"} className="h-7">
              {walletOverview?.is_frozen ? "Wallet Frozen" : "Wallet Active"}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsDepositModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Deposit Funds
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BalanceCard
            title="Spendable Balance"
            amount={walletOverview ? parseFloat(walletOverview.main_balance || 0) : 0}
            type="available"
            subtext="Available for withdrawal"
          />
          <BalanceCard
            title={capLabel}
            amount={capUsed}
            type="credit"
            subtext={`Limit: ₹${parseFloat(capLimit).toLocaleString()}`}
          />
          <BalanceCard
            title="Total Earned (Lifetime)"
            amount={walletOverview ? parseFloat(walletOverview.total_earned || 0) : 0}
            type="neutral"
            subtext="All sources & bonuses"
          />
          <BalanceCard
            title="Approval Pending"
            amount={walletOverview ? parseFloat(walletOverview.pending_withdrawals || 0) : 0}
            type="blocked"
            subtext="Withdrawals in queue"
          />
        </div>

        {((capUsed / capLimit) >= 0.8) && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex gap-3 animate-pulse">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">{capLabel} Warning</p>
              <p className="mt-1">
                You have utilized {((capUsed / capLimit) * 100).toFixed(1)}% of your income cap. 
                Once the limit is reached, further earnings will be diverted to the reserve fund until the next reset.
              </p>
            </div>
          </div>
        )}

        {/* Onboarding Investment Progress */}
        <div className="bg-card rounded-lg border border-border overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Onboarding Investment Progress
              </h2>
              <p className="text-sm text-muted-foreground">
                Track and pay your core body initial investment installments.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Investment</p>
              <p className="text-lg font-bold text-primary">₹{(installments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0)).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {installments.map((inst) => (
              <div 
                key={inst.installment_no} 
                className={`p-4 rounded-xl border-2 transition-all ${
                  inst.status === 'paid' ? 'bg-green-50/30 border-green-100' : 
                  inst.status === 'pending_approval' ? 'bg-amber-50/30 border-amber-100' : 
                  'bg-gray-50/30 border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    inst.status === 'paid' ? 'bg-green-100 text-green-700' : 
                    inst.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {inst.status === 'pending' ? `LEVEL ${inst.installment_no}` : inst.status.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-muted-foreground">#{inst.installment_no}</p>
                </div>
                
                <h3 className="text-lg font-bold text-card-foreground">₹{parseFloat(inst.amount).toLocaleString()}</h3>
                <p className="text-[10px] text-muted-foreground mb-4">Investment Installment</p>
                
                {inst.status === 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedInstallment({ no: inst.installment_no, amount: parseFloat(inst.amount) });
                      setIsInstallmentModalOpen(true);
                    }}
                  >
                    Pay Level {inst.installment_no}
                  </Button>
                )}
                
                {inst.status === 'paid' && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold py-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified & Paid
                  </div>
                )}

                {inst.status === 'pending_approval' && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold py-1">
                    <Clock className="h-4 w-4" />
                    Pending Approval
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-6">
            <LedgerTable
              transactions={transactions}
              title="Main Ledger History"
              isLoading={isLoading}
              showExport={true}
              showFilters={true}
            />
          </div>
        </div>

        {/* Audit Footnote */}
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-gray-500 flex gap-2">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <p>
              This financial ledger is cryptographically secured and ACID compliant. All transactions are immutable and subject to audit. 
              The balance shown reflects the real-time state of the FTS Profit Engine.
            </p>
        </div>
      </div>

      <DepositRequestModal 
        open={isDepositModalOpen} 
        onOpenChange={setIsDepositModalOpen}
        onSuccess={handleRefresh}
      />

      {selectedInstallment && (
        <InstallmentPaymentModal
          open={isInstallmentModalOpen}
          onOpenChange={setIsInstallmentModalOpen}
          installmentNo={selectedInstallment.no}
          amount={selectedInstallment.amount}
          onSuccess={handleRefresh}
        />
      )}
    </DashboardLayout>
  );
}
