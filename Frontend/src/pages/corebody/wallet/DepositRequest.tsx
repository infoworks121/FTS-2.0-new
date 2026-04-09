import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Landmark, ArrowUpCircle, CheckCircle2, AlertCircle, Info } from "lucide-react";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function DepositRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        slip_url: formData.notes // Using notes field for extra info as backend expects slip_url/notes logic
      });

      toast({
        title: "Request Submitted",
        description: "Your deposit request has been sent for admin approval.",
      });
      
      // Redirect to main wallet
      navigate("/corebody/wallet/main-wallet");
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
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — Deposit Funds">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deposit Funds</h1>
          <p className="text-muted-foreground">
            Submit a request to top up your wallet balance via manual transfer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Instructions Column */}
          <div className="md:col-span-1 space-y-4">
            <Card className="bg-blue-50/50 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                  <Landmark className="h-4 w-4" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <p className="font-semibold text-blue-900">Account Name</p>
                  <p className="text-blue-800">FTS Global Solutions Private Limited</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Bank Name</p>
                  <p className="text-blue-800">HDFC Bank</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Account Number</p>
                  <p className="text-blue-800 font-mono">50200012345678</p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">IFSC Code</p>
                  <p className="text-blue-800 font-mono">HDFC0001234</p>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-blue-600 italic">Please include your User ID in the transfer remarks.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50/50 border-amber-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                  <Info className="h-4 w-4" />
                  Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-amber-800 space-y-2">
                <p>• Only transfers from your registered bank account will be accepted.</p>
                <p>• Ensure the UTR/Reference number is clearly typed.</p>
                <p>• Admin approval usually takes 2-6 business hours.</p>
              </CardContent>
            </Card>
          </div>

          {/* Form Column */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submit Deposit Details</CardTitle>
                <CardDescription>Enter the details of your successful transfer below.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Deposit Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                      >
                        <SelectTrigger id="payment_method">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank Transfer">Bank Transfer (NEFT/RTGS)</SelectItem>
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
                      placeholder="Enter 12-digit UTR or Transaction ID"
                      value={formData.transaction_ref}
                      onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
                      required
                      className="font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Mention branch details or any specific info..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Processing Request..."
                      ) : (
                        <>
                          Submit Deposit Request
                          <ArrowUpCircle className="ml-2 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-start gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold text-center justify-center pt-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Identity Verified Submission
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
