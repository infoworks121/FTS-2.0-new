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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Landmark, ArrowUpCircle, CheckCircle2, Info, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface DepositRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DepositRequestModal({ 
  open, 
  onOpenChange,
  onSuccess 
}: DepositRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: "",
    payment_method: "Bank Transfer",
    transaction_ref: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.transaction_ref) {
      toast({
        title: "Reference Required",
        description: "Please provide a transaction reference (UTR/ID).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/wallet/me/deposit-request", {
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        transaction_ref: formData.transaction_ref,
        slip_url: formData.notes
      });

      toast({
        title: "Request Submitted",
        description: "Your deposit request has been sent for admin approval.",
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        amount: "",
        payment_method: "Bank Transfer",
        transaction_ref: "",
        notes: ""
      });
    } catch (error: any) {
      console.error("Deposit request error:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.error || "Failed to submit deposit request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-blue-600" />
            Deposit Funds to Wallet
          </DialogTitle>
          <DialogDescription>
            Submit your transfer details for manual verification.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-4">
          {/* Bank Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-700 mb-1">
                <Landmark className="h-3.5 w-3.5" />
                BANK ACCOUNT
              </div>
              <div className="space-y-1">
                <p className="text-blue-900 font-semibold">HDFC Bank</p>
                <p className="text-blue-800 font-mono">50200012345678</p>
                <p className="text-blue-800 font-mono">HDFC0001234</p>
                <p className="text-blue-600 text-[10px] italic">FTS Global Solutions Pvt Ltd</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 mb-1">
                <Info className="h-3.5 w-3.5" />
                GUIDELINES
              </div>
              <ul className="text-amber-800 space-y-1 list-disc pl-3">
                <li>Use registered bank account only</li>
                <li>Enter UTR/Ref number accurately</li>
                <li>Approval takes 2-6 business hours</li>
              </ul>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(val) => setFormData({ ...formData, payment_method: val })}
                >
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI (GPay/PhonePe)</SelectItem>
                    <SelectItem value="IMPS">IMPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref">Transaction Reference (UTR / ID)</Label>
              <Input
                id="ref"
                placeholder="12-digit UTR or Transaction ID"
                value={formData.transaction_ref}
                onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
                required
                className="font-mono uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Submit Deposit Request"}
                {!isSubmitting && <ArrowUpCircle className="ml-2 h-4 w-4" />}
              </Button>
            </DialogFooter>
          </form>
        </div>
        
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          Verified Submission Secure
        </div>
      </DialogContent>
    </Dialog>
  );
}
