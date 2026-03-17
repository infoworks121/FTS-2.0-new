import { useMemo, useState } from "react";
import { CircleAlert, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bankDetails, walletSnapshot, withdrawalRules, formatCurrency } from "./walletData";

export default function WithdrawalRequestPage() {
  const [amountInput, setAmountInput] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const amount = Number(amountInput || 0);
  const tdsAmount = useMemo(() => Math.max(0, Math.round(amount * withdrawalRules.tdsRate)), [amount]);
  const processingFee = useMemo(() => Math.max(0, Math.round(amount * withdrawalRules.processingFeeRate)), [amount]);
  const netPayable = useMemo(() => Math.max(0, amount - tdsAmount - processingFee), [amount, processingFee, tdsAmount]);

  const belowMin = amount > 0 && amount < withdrawalRules.minWithdrawalAmount;
  const exceedsBalance = amount > walletSnapshot.withdrawableAmount;
  const hasPending = walletSnapshot.hasPendingWithdrawal;
  const disabledSubmit =
    !amount ||
    belowMin ||
    exceedsBalance ||
    hasPending ||
    !confirmed ||
    !!walletSnapshot.withdrawalBlockedReason;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Withdrawal Request</h1>
        <p className="text-sm text-muted-foreground">
          Controlled withdrawal initiation with immutable ledger posting after admin processing.
        </p>
      </div>

      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="text-sm">Current Withdrawable Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-3xl font-semibold text-emerald-500">
            {formatCurrency(walletSnapshot.withdrawableAmount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Source of truth: backend ledger balance.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-amount" className="flex items-center gap-1.5">
                Withdrawal Amount
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CircleAlert className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Minimum withdrawal is {formatCurrency(withdrawalRules.minWithdrawalAmount)}.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="withdrawal-amount"
                type="number"
                min={withdrawalRules.minWithdrawalAmount}
                placeholder="Enter amount"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="rounded-md border p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Requested Amount</span>
                <span className="font-mono">{formatCurrency(amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">TDS</span>
                <span className="font-mono text-rose-500">- {formatCurrency(tdsAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-mono text-rose-500">- {formatCurrency(processingFee)}</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <span className="font-medium">Net Payable Amount</span>
                <span className="font-mono font-semibold text-emerald-500">{formatCurrency(netPayable)}</span>
              </div>
            </div>

            <div className="rounded-md border p-4 space-y-2">
              <p className="text-xs text-muted-foreground">Bank Details (masked)</p>
              <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <p><span className="text-muted-foreground">Account Holder:</span> {bankDetails.accountHolder}</p>
                <p><span className="text-muted-foreground">Bank:</span> {bankDetails.bankName}</p>
                <p><span className="text-muted-foreground">Account Number:</span> <span className="font-mono">{bankDetails.accountNumberMasked}</span></p>
                <p><span className="text-muted-foreground">IFSC:</span> <span className="font-mono">{bankDetails.ifscMasked}</span></p>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(Boolean(v))} />
              <span>I confirm the withdrawal details are correct</span>
            </label>

            {belowMin && (
              <p className="text-xs text-amber-500">
                Amount is below minimum threshold ({formatCurrency(withdrawalRules.minWithdrawalAmount)}).
              </p>
            )}
            {exceedsBalance && (
              <p className="text-xs text-rose-500">Amount exceeds current withdrawable balance.</p>
            )}
            {hasPending && (
              <p className="text-xs text-amber-500">A pending withdrawal already exists. New request is disabled.</p>
            )}
            {walletSnapshot.withdrawalBlockedReason && (
              <p className="text-xs text-rose-500">Withdrawal blocked: {walletSnapshot.withdrawalBlockedReason}</p>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={disabledSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Submit Withdrawal Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Withdrawal Request</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to submit a withdrawal request for <span className="font-mono">{formatCurrency(amount)}</span>.
                    Net payable after deductions is <span className="font-mono">{formatCurrency(netPayable)}</span>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Confirm and Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rules & Security Notice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md border border-blue-500/25 bg-blue-500/5 p-3">{withdrawalRules.approvalNotice}</div>
            <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-3">{withdrawalRules.deductionNotice}</div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Applied Rules</p>
              <p className="mt-1">• {withdrawalRules.tdsRuleLabel}</p>
              <p>• {withdrawalRules.processingFeeRuleLabel}</p>
            </div>
            <div className="rounded-md border p-3 text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5" />
              <span>No optimistic balance movement. Wallet values update only after backend ledger confirmation.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

