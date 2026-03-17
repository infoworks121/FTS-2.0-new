import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRightLeft, CircleAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { walletSnapshot, withdrawalRules, formatCurrency } from "./walletData";

export default function WalletOverviewPage() {
  const lastTxnPrefix = walletSnapshot.lastTransactionType === "Credit" ? "+" : "-";
  const lastTxnTone = walletSnapshot.lastTransactionType === "Credit"
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Main Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold tracking-tight">{formatCurrency(walletSnapshot.mainBalance)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Referral Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold tracking-tight">{formatCurrency(walletSnapshot.referralBalance)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Pending Amount (Locked)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold tracking-tight text-amber-500">
              {formatCurrency(walletSnapshot.pendingLockedAmount)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Locked until settlement/review completion.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Withdrawable Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-semibold tracking-tight text-emerald-500">
              {formatCurrency(walletSnapshot.withdrawableAmount)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">After caps, pending locks, TDS and fee rules.</p>
          </CardContent>
        </Card>
      </div>

      {walletSnapshot.withdrawalBlockedReason && (
        <Card className="border-rose-500/30 bg-rose-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-500" />
              <p className="text-rose-300">
                Withdrawal blocked: {walletSnapshot.withdrawalBlockedReason}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Last Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md border p-4">
            <p className="text-xs text-muted-foreground">Transaction ID</p>
            <p className="mt-1 font-mono text-sm">{walletSnapshot.lastTransactionId}</p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-xs text-muted-foreground">Date & Time</p>
            <p className="mt-1 font-mono text-sm">{walletSnapshot.lastTransactionAt}</p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className={`mt-1 font-mono text-sm font-semibold ${lastTxnTone}`}>
              {lastTxnPrefix}{formatCurrency(Math.abs(walletSnapshot.lastTransactionAmount))}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Cap / Rule Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-blue-500/25 bg-blue-500/5 p-3 text-sm">
            <div className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 text-blue-500" />
              <p>{withdrawalRules.approvalNotice}</p>
            </div>
          </div>
          <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-3 text-sm">
            <div className="flex items-start gap-2">
              <ArrowRightLeft className="mt-0.5 h-4 w-4 text-amber-500" />
              <p>{withdrawalRules.deductionNotice}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono">Immutable Ledger</Badge>
            <span>Amounts reflect backend source of truth only.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

