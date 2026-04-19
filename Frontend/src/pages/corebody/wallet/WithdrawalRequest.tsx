import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CircleAlert, ShieldCheck, RefreshCw, Landmark, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
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

const MIN_WITHDRAWAL = 2000;
const DISTRICT_NAME = "District North";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function WithdrawalRequest() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [amountInput, setAmountInput] = useState("");
  const [bankDetails, setBankDetails] = useState("");
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
    !bankDetails;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/wallet/withdraw", { 
        amount, 
        bank_account_id: bankDetails // Using bank_account_id field for simplicity or just general info
      });
      toast({
        title: "Request Submitted",
        description: `Withdrawal request for ${formatCurrency(amount)} has been initiated.`,
      });
      navigate("/corebody/wallet/withdrawals");
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Error submitting withdrawal request.",
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
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" asChild>
              <Link to="/corebody/wallet">
                  <ArrowLeft className="h-4 w-4" />
              </Link>
           </Button>
           <div>
              <h1 className="text-xl font-bold">Request Withdrawal</h1>
              <p className="text-sm text-muted-foreground">Certified district fund transfer initiation.</p>
           </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Balance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Available Core Balance</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="font-mono text-3xl font-bold text-emerald-600">
                      {isLoading ? "---" : formatCurrency(balance)}
                  </p>
              </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input 
                  id="amount"
                  type="number"
                  placeholder="Enter amount to withdraw"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Minimum withdrawal: {formatCurrency(MIN_WITHDRAWAL)}</p>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="bank">Bank Account / UPI Details</Label>
                  <Input 
                      id="bank"
                      placeholder="Enter account number or VPA"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                  />
              </div>

              <div className="rounded-md border p-4 bg-muted/20 space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Initialization Charge</span>
                      <span className="font-mono">₹0 (Waived)</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                      <span>Net Payable</span>
                      <span className="font-mono text-emerald-600">{formatCurrency(amount)}</span>
                  </div>
              </div>

              <label className="flex items-start gap-2 text-xs select-none cursor-pointer">
                  <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(Boolean(v))} />
                  <span className="text-muted-foreground">
                      I confirm that these funds are being withdrawn for authorized district operations and the destination details are verified.
                  </span>
              </label>

              {belowMin && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                      <CircleAlert className="h-3 w-3" /> Below minimum threshold.
                  </p>
              )}
              {exceedsBalance && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                      <CircleAlert className="h-3 w-3" /> Amount exceeds available balance.
                  </p>
              )}

              <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-500" 
                  disabled={disabledSubmit || isSubmitting}
                  onClick={() => setShowConfirm(true)}
              >
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Submit Request"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-blue-50/50 border-blue-100">
             <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Security Protocol
                </CardTitle>
             </CardHeader>
             <CardContent className="text-xs text-muted-foreground leading-relaxed">
                Every Core Body withdrawal is subject to multi-stage audit. 
                Funds are typically dispersed within 48 business hours post-approval.
             </CardContent>
          </Card>

          <Card className="border-dashed">
             <CardHeader>
                <CardTitle className="text-sm">Required Compliance</CardTitle>
             </CardHeader>
             <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• PAN/Aadhaar must be verified.</p>
                <p>• No active cap-overflow warnings.</p>
                <p>• Recent audit logs must be clear.</p>
             </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      You are initiating a withdrawal of <span className="font-bold text-foreground">{formatCurrency(amount)}</span>. 
                      This request will be logged in the permanent district ledger.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit} className="bg-emerald-600">Proceed</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
