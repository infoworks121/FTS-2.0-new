import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Wallet as WalletIcon, Plus, ArrowRight, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentUser, walletTransactions, formatINR, timeAgo } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function WalletPage() {
  const [filter, setFilter] = useState("all");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wdStep, setWdStep] = useState(1);
  const [wdAmount, setWdAmount] = useState("");

  const txns = walletTransactions.filter(t => {
    if (filter === "credits") return t.type === "credit";
    if (filter === "debits") return t.type === "debit";
    if (filter === "withdrawals") return t.source === "withdrawal";
    return true;
  });

  const amount = Number(wdAmount) || 0;
  const tds = Math.round(amount * 0.1);
  const fee = amount >= 1000 ? 25 : 10;
  const net = amount - tds - fee;

  if (showWithdraw) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        <button onClick={() => { setShowWithdraw(false); setWdStep(1); }} className="text-sm text-muted-foreground hover:text-foreground transition-default">← Back to Wallet</button>
        <h1 className="text-xl font-bold">Withdraw Funds</h1>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map(s => <div key={s} className={cn("flex-1 h-1.5 rounded-full", wdStep >= s ? "bg-primary" : "bg-muted")} />)}
        </div>

        {wdStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Amount</label>
              <Input type="number" value={wdAmount} onChange={e => setWdAmount(e.target.value)} placeholder="Enter amount" className="rounded-lg font-mono text-lg" />
            </div>
            {amount > 0 && (
              <div className="card-base p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Withdrawal</span><span className="font-mono">{formatINR(amount)}</span></div>
                <div className="flex justify-between text-destructive"><span>TDS (10%)</span><span className="font-mono">-{formatINR(tds)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Processing Fee</span><span className="font-mono">-{formatINR(fee)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold text-profit"><span>Net Payable</span><span className="font-mono">{formatINR(Math.max(0, net))}</span></div>
              </div>
            )}
            <Button className="rounded-lg" onClick={() => setWdStep(2)} disabled={amount <= 0}>Continue</Button>
          </div>
        )}
        {wdStep === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Bank Details</h2>
            <div className="card-base p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">HDFC Bank ****4521</p>
                <p className="text-xs text-muted-foreground">Rajesh Kumar</p>
              </div>
              <input type="radio" defaultChecked className="accent-primary" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-lg" onClick={() => setWdStep(1)}>Back</Button>
              <Button className="rounded-lg" onClick={() => setWdStep(3)}>Continue</Button>
            </div>
          </div>
        )}
        {wdStep === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Confirm Withdrawal</h2>
            <div className="card-base p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Net Payable</span><span className="font-mono text-profit font-bold">{formatINR(Math.max(0, net))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">To</span><span>HDFC Bank ****4521</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-lg" onClick={() => setWdStep(2)}>Back</Button>
              <Button className="rounded-lg" onClick={() => { toast.success("Withdrawal request submitted! Processed in 2-3 business days."); setShowWithdraw(false); setWdStep(1); }}>Submit Withdrawal</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Wallet</h1>

      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card-base p-5 bg-gradient-to-br from-primary to-company text-white rounded-2xl">
          <p className="text-sm opacity-80">Main Wallet</p>
          <p className="text-3xl font-bold font-mono mt-1">{formatINR(currentUser.walletBalance)}</p>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="secondary" className="rounded-lg text-foreground" onClick={() => setShowWithdraw(true)}>
              <Download className="h-3.5 w-3.5 mr-1" /> Withdraw
            </Button>
            <Button size="sm" variant="secondary" className="rounded-lg text-foreground">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Money
            </Button>
          </div>
        </div>
        <div className="card-base p-5 border-l-4 border-l-cyan">
          <p className="text-sm text-muted-foreground">Referral Wallet</p>
          <p className="text-2xl font-bold font-mono mt-1">{formatINR(currentUser.referralWalletBalance)}</p>
        </div>
        <div className="card-base p-5 border-l-4 border-l-trust">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Trust Fund</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-trust/10 text-trust font-medium">View Only</span>
          </div>
          <p className="text-2xl font-bold font-mono mt-1">{formatINR(currentUser.trustFundBalance)}</p>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Transaction History</h2>
        </div>
        <div className="flex gap-2 mb-4">
          {["all", "credits", "debits", "withdrawals"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-default capitalize", filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {f}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {txns.map(txn => (
            <div key={txn.id} className="card-base p-4 flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", txn.type === "credit" ? "bg-profit/10" : "bg-destructive/10")}>
                {txn.type === "credit" ? <ArrowDownRight className="h-4 w-4 text-profit" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{txn.description}</p>
                <p className="text-xs text-muted-foreground">{txn.source} · Bal: {formatINR(txn.balanceAfter)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("font-mono font-semibold text-sm", txn.type === "credit" ? "text-profit" : "text-destructive")}>
                  {txn.type === "credit" ? "+" : "-"}{formatINR(txn.amount)}
                </p>
                <p className="text-[10px] text-muted-foreground">{timeAgo(txn.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
