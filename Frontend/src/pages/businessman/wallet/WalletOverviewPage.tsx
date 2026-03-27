import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRightLeft, CircleAlert, Wallet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function WalletOverviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/wallet/me");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching businessman wallet:", error);
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

  const wallet = data?.wallet;
  const lastTxn = data?.recent_transactions?.[0];

  const lastTxnPrefix = lastTxn?.txn_type === "credit" ? "+" : "-";
  const lastTxnTone = lastTxn?.txn_type === "credit"
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Wallet Overview</h1>
          <p className="text-sm text-muted-foreground">
            System-generated wallet snapshot. All balances are ledger-backed, immutable, and audit-safe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/businessman/wallet/transaction-ledger">View Ledger</Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white">
            <Link to="/businessman/wallet/withdrawal-request">
              <Wallet className="h-4 w-4" /> Request Withdrawal
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Main Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-bold tracking-tight text-blue-600">
              {isLoading ? "---" : formatCurrency(parseFloat(wallet?.main_balance || 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Referral Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-bold tracking-tight text-emerald-600">
              {isLoading ? "---" : formatCurrency(parseFloat(wallet?.referral_balance || 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Income Cap Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-bold tracking-tight text-purple-600">
              {isLoading ? "---" : formatCurrency(parseFloat(wallet?.income_cap_used || 0))}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground italic">Current billing cycle usage.</p>
          </CardContent>
        </Card>
      </div>

      {wallet?.is_frozen && (
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-500" />
              <p className="text-rose-600">
                Withdrawal blocked: Wallet is currently frozen by administration.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Last Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {lastTxn ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-md border p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="mt-1 font-mono text-sm">TXN-{lastTxn.id}</p>
              </div>
              <div className="rounded-md border p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="mt-1 font-mono text-sm">{new Date(lastTxn.created_at).toLocaleString()}</p>
              </div>
              <div className="rounded-md border p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className={`mt-1 font-mono text-lg font-bold ${lastTxnTone}`}>
                  {lastTxnPrefix}{formatCurrency(parseFloat(lastTxn.amount))}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">No recent transactions found.</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-100 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
            <CircleAlert className="h-4 w-4" />
            Merchant Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-blue-700/80">
            <p className="flex items-center gap-2">
              <ArrowRightLeft className="h-3 w-3" />
              All commissions are credited immediately upon order completion.
            </p>
            <p className="flex items-center gap-2 mt-2">
              <ArrowRightLeft className="h-3 w-3" />
              Withdrawal requests are typically processed within 24-48 business hours.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-blue-400 font-semibold uppercase tracking-tighter">
            <Badge variant="outline" className="border-blue-200 text-blue-600">Live Snapshot</Badge>
            <span>Balances reflect the real-time backend source of truth.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


