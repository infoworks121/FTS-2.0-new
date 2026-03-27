import { useEffect, useState } from "react";
import { CircleAlert, ShieldCheck, RefreshCw, Landmark } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const MIN_WITHDRAWAL = 1000;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function WithdrawalRequestPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [amountInput, setAmountInput] = useState("");
  const [upiId, setUpiId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/wallet/me");
      setWallet(response.data.wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet balance",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const amount = Number(amountInput || 0);
  const balance = parseFloat(wallet?.main_balance || 0);
  
  const belowMin = amount > 0 && amount < MIN_WITHDRAWAL;
  const exceedsBalance = amount > balance;
  const isFrozen = wallet?.is_frozen;

  const disabledSubmit =
    !amount ||
    belowMin ||
    exceedsBalance ||
    isFrozen ||
    !confirmed ||
    !upiId;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/wallet/withdraw", { 
        amount, 
        upi_id: upiId 
      });
      toast({
        title: "Request Submitted",
        description: `Your withdrawal request for ${formatCurrency(amount)} has been initiated.`,
      });
      navigate("/businessman/wallet/withdrawal-history");
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Internal system error during withdrawal.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Withdrawal Request</h1>
          <p className="text-sm text-muted-foreground">
            Controlled withdrawal initiation with immutable ledger posting after admin processing.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Balance
        </Button>
      </div>

      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Available Main Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-3xl font-bold text-emerald-600">
            {isLoading ? "---" : formatCurrency(balance)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground italic">Source: Distributed Merchant Ledger (L1)</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="withdrawal-amount" className="flex items-center gap-1.5">
                    Withdrawal Amount
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <CircleAlert className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                        Minimum withdrawal is {formatCurrency(MIN_WITHDRAWAL)}.
                        </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                </Label>
                <Input
                    id="withdrawal-amount"
                    type="number"
                    min={MIN_WITHDRAWAL}
                    placeholder="Enter amount"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="font-mono"
                />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="upi-id">UPI ID (VPA)</Label>
                    <Input 
                        id="upi-id"
                        placeholder="e.g. user@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="font-mono"
                    />
                </div>
            </div>

            <div className="rounded-md border p-4 space-y-2 text-sm bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount to Transfer</span>
                <span className="font-mono font-bold">{formatCurrency(amount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">TDS & Charges</span>
                <span className="font-mono text-rose-500">Processed at Admin Payout</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <span className="font-medium">Total Deduction from Wallet</span>
                <span className="font-mono font-semibold text-emerald-600">{formatCurrency(amount)}</span>
              </div>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                  <Landmark className="h-4 w-4" />
                  Transfer Destination
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                  Funds will be dispatched to <span className="font-mono font-bold text-blue-900">{upiId || '___'}</span>. 
                  Ensure this VPA is correctly linked to your primary business account.
              </p>
            </div>

            <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
              <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(Boolean(v))} />
              <span className="text-muted-foreground">I verify that the above UPI ID belongs to me and I accept the terms of withdrawal.</span>
            </label>

            {belowMin && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <CircleAlert className="h-3 w-3" /> Minimum payload: {formatCurrency(MIN_WITHDRAWAL)}
              </p>
            )}
            {exceedsBalance && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <CircleAlert className="h-3 w-3" /> Insufficient ledger depth for this amount.
              </p>
            )}
            {isFrozen && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 border border-rose-200 rounded">
                CRITICAL: Wallet is frozen. Outbound transfers are currently restricted.
              </p>
            )}

            <Button 
                disabled={disabledSubmit || isSubmitting} 
                onClick={() => setShowConfirm(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
              ) : "Initialize Transfer"}
            </Button>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Submit withdrawal for <span className="font-mono font-bold text-foreground">{formatCurrency(amount)}</span>? 
                    This action will create a locked ledger entry awaiting admin dispatch.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit} className="bg-emerald-600">
                    Confirm Submission
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="bg-muted/10">
          <CardHeader>
            <CardTitle className="text-sm">Withdrawal Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <div className="p-3 border rounded border-amber-200 bg-amber-50/50 text-amber-800">
                Administration reserves 24-72 hours for risk-review of all payout requests.
            </div>
            <p>• Settlement is subject to valid UPI verification.</p>
            <p>• TDS and Service Fees are applicable as per Merchant Tier rules.</p>
            <div className="pt-4 border-t flex items-start gap-2 text-[10px] uppercase font-bold tracking-tight">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Identity Verified Transaction</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


