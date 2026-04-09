import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Landmark, ArrowUpCircle, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

interface BusinessmanInvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installmentNo: number;
  amount: number;
  onSuccess?: () => void;
}

export default function BusinessmanInvestmentModal({
  open,
  onOpenChange,
  installmentNo,
  amount,
  onSuccess
}: BusinessmanInvestmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentRef) {
      toast({
        title: "Reference Required",
        description: "Please provide a transaction reference (UTR/ID).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/businessman-profile/investment/pay", {
        installment_no: installmentNo,
        payment_ref: paymentRef
      });

      toast({
        title: "Payment Submitted",
        description: `Installment #${installmentNo} has been sent for admin verification.`,
      });

      onOpenChange(false);
      setPaymentRef("");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Businessman investment payment error:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit installment payment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-indigo-600" />
            Submit Product Advance - Level {installmentNo}
          </DialogTitle>
          <DialogDescription>
            Enter the transaction details for your product advance payment.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-700">Installment Amount</span>
            <span className="text-xl font-bold text-indigo-900">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>

          <form id="businessman-investment-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment_ref">Transaction Reference (UTR / ID)</Label>
              <Input
                id="payment_ref"
                placeholder="Enter 12-digit UTR number"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                required
                className="font-mono uppercase"
              />
              <p className="text-[10px] text-muted-foreground italic">
                * Please ensure the Transaction ID matches your bank statement for quick approval.
              </p>
            </div>
          </form>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="businessman-investment-form"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit Payment"}
            {!isSubmitting && <ArrowUpCircle className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>

        <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-muted-foreground uppercase font-bold text-center">
          <ShieldCheck className="h-3 w-3 text-green-500" />
          Financial Submission Secure & Encrypted
        </div>
      </DialogContent>
    </Dialog>
  );
}
