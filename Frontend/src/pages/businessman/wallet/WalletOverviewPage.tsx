import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Lock, ShieldCheck, PlusCircle, CreditCard, Banknote, History, AlertTriangle, ArrowRightLeft, CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import api from "@/lib/api";
import walletApi, { DepositRequest } from "@/lib/walletApi";
import { useToast } from "@/components/ui/use-toast";

// Helper to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function WalletOverviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  
  // Dialog States
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  
  // PIN State
  const [pinValue, setPinValue] = useState("");
  
  // Deposit State
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"online" | "manual">("online");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [txnRef, setTxnRef] = useState("");
  
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, depositsRes] = await Promise.all([
        api.get("/wallet/me"),
        walletApi.getMyDepositRequests()
      ]);
      setData(walletRes.data);
      setDepositRequests(depositsRes.requests);
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

  const handleSetPin = async () => {
    if (pinValue.length !== 6) {
      toast({ title: "Invalid PIN", description: "PIN must be 6 digits", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await walletApi.setTransactionPin(pinValue);
      toast({ title: "Success", description: "Transaction PIN set successfully" });
      setIsPinDialogOpen(false);
      setPinValue("");
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to set PIN", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (paymentType === "online") {
      handleOnlinePayment();
      return;
    }

    setIsSubmitting(true);
    try {
      await walletApi.submitDepositRequest({
        amount: parseFloat(depositAmount),
        payment_method: paymentMethod,
        transaction_ref: txnRef,
      });
      toast({ title: "Success", description: "Deposit request submitted successfully" });
      setIsDepositDialogOpen(false);
      setDepositAmount("");
      setTxnRef("");
      fetchData(); // Refresh history
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to submit deposit", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnlinePayment = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create order on backend
      const { data: orderData } = await api.post("/payment/razorpay/create-order", {
        amount: parseFloat(depositAmount)
      });

      // 2. Load script
      const res = await loadRazorpayScript();
      if (!res) {
        toast({ title: "Error", description: "Razorpay SDK failed to load. Check your internet connection.", variant: "destructive" });
        return;
      }

      // 3. Open Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FTS Wallet",
        description: "Add funds to your main wallet balance",
        image: "/logo.png",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // 4. Verify on backend
          try {
            const verifyRes = await api.post("/payment/razorpay/verify", {
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature
            });
            
            if (verifyRes.data.success) {
               toast({ title: "Deposit Successful", description: "Funds have been added to your wallet." });
               setIsDepositDialogOpen(false);
               setDepositAmount("");
               fetchData();
            }
          } catch (err: any) {
             toast({ 
                title: "Verification Failed", 
                description: err.response?.data?.error || "Payment was successful but verification failed. Support will review.", 
                variant: "destructive" 
             });
          }
        },
        prefill: {
          name: data?.user?.full_name || "",
          email: data?.user?.email || "",
          contact: data?.user?.phone || "",
        },
        theme: { color: "#3b82f6" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Online payment error:", error);
      toast({
        title: "Order Creation Failed",
        description: error.response?.data?.error || "Could not initialize online paymentgateway. Use manual deposit if issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          
          {/* Add Funds Dialog */}
          <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <PlusCircle className="h-4 w-4" /> Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Deposit Request</DialogTitle>
                <DialogDescription>
                  Submit a request after sending funds to our official accounts.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Deposit Method</Label>
                  <div className="flex bg-muted p-1 rounded-lg gap-1">
                    <Button 
                      variant={paymentType === "online" ? "secondary" : "ghost"} 
                      size="sm" 
                      className={`flex-1 h-8 ${paymentType === "online" ? "bg-white shadow-sm" : ""}`}
                      onClick={() => setPaymentType("online")}
                    >
                      Instant Payment (Online)
                    </Button>
                    <Button 
                      variant={paymentType === "manual" ? "secondary" : "ghost"} 
                      size="sm" 
                      className={`flex-1 h-8 ${paymentType === "manual" ? "bg-white shadow-sm" : ""}`}
                      onClick={() => setPaymentType("manual")}
                    >
                      Manual Deposit
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="Enter amount" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                
                {paymentType === "manual" ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="method">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="method">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upi">UPI (GPay/PhonePe/Paytm)</SelectItem>
                          <SelectItem value="bank">Bank Transfer (IMPS/NEFT)</SelectItem>
                          <SelectItem value="cash">Cash Deposit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ref">Transaction Reference / ID</Label>
                      <Input 
                        id="ref" 
                        placeholder="e.g. TRX12345678" 
                        value={txnRef} 
                        onChange={(e) => setTxnRef(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/50 text-[11px] text-blue-700 leading-relaxed">
                    <p className="font-bold mb-1 underline">Safe & Secure Payment</p>
                    <p>Funds will be instantly added to your wallet upon successful transaction via Razorpay. Supported: UPI, Cards, Netbanking.</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitDeposit} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : (paymentType === "online" ? "Pay Now" : "Submit Request")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Set PIN Dialog */}
          <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Lock className="h-4 w-4" /> PIN Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Transaction PIN</DialogTitle>
                <DialogDescription>
                  Set a 6-digit PIN to secure your wallet payments.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="space-y-2 text-center">
                  <Label>Enter 6-Digit PIN</Label>
                  <InputOTP maxLength={6} value={pinValue} onChange={setPinValue}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPinDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSetPin} disabled={isSubmitting || pinValue.length !== 6}>
                  {isSubmitting ? "Saving..." : "Save PIN"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button asChild size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white">
            <Link to="/businessman/wallet/withdrawal-request">
              <Banknote className="h-4 w-4" /> Withdraw
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Last Transaction Summary</CardTitle>
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-normal">
             <Link to="/businessman/wallet/transaction-ledger" className="flex items-center gap-1">
               Full Ledger <ArrowRightLeft className="h-3 w-3" />
             </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {lastTxn ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-md border p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="mt-1 font-mono text-sm">TXN-{lastTxn.id.split('-')[0].toUpperCase()}</p>
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

      {/* Deposit Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4" /> Recent Deposit Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Method</th>
                  <th className="px-4 py-2 border text-right">Amount</th>
                  <th className="px-4 py-2 border">Reference</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {depositRequests.length > 0 ? (
                  depositRequests.slice(0, 5).map((req) => (
                    <tr key={req.id}>
                      <td className="px-4 py-2 border whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border capitalize">{req.payment_method}</td>
                      <td className="px-4 py-2 border text-right font-mono text-blue-600">
                        {formatCurrency(req.amount)}
                      </td>
                      <td className="px-4 py-2 border font-mono text-xs truncate max-w-[120px]">
                        {req.transaction_ref || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        <Badge variant="outline" className={
                          req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }>
                          {req.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                      No deposit requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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


