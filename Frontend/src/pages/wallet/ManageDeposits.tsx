import React, { useState, useEffect } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ExternalLink,
  Search,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import walletApi, { DepositRequest } from "@/lib/walletApi";

export default function ManageDeposits() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<(DepositRequest & { full_name: string, email: string })[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await walletApi.getAllDepositRequests('pending');
      setRequests(res.requests);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load deposit requests", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedReq) return;
    setIsSubmitting(true);
    try {
      await walletApi.updateDepositStatus(selectedReq.id, status, adminNote);
      toast({ 
        title: status === 'approved' ? "Deposit Approved" : "Deposit Rejected", 
        description: `Wallet for ${selectedReq.full_name} has been processed.`
      });
      setIsApproveOpen(false);
      setIsRejectOpen(false);
      setAdminNote("");
      fetchData();
    } catch (error: any) {
      toast({ 
        title: "Action Failed", 
        description: error.response?.data?.error || "Failed to update status", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.transaction_ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <FinanceLayout
      title="Deposit Requests"
      description="Review and approve manual fund recharge requests"
      icon="wallet"
    >
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or reference..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No pending deposit requests found.</div>
        ) : (
          filteredRequests.map((req) => (
            <Card key={req.id} className="overflow-hidden border-l-4 border-l-blue-500">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-5 flex-1 border-r border-dashed">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg leading-none">{req.full_name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{req.email}</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {req.payment_method.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase font-semibold">Reference ID</p>
                        <p className="font-mono mt-1">{req.transaction_ref || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase font-semibold">Date Submitted</p>
                        <p className="mt-1">{new Date(req.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-muted/20 w-full md:w-64 flex flex-col justify-center items-center border-r">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Amount</p>
                    <p className="text-3xl font-mono font-bold text-blue-600">
                      ₹{parseFloat(req.amount.toString()).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-5 w-full md:w-48 flex flex-col justify-center gap-2">
                    {req.slip_url && (
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <a href={req.slip_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-2" /> View Slip
                        </a>
                      </Button>
                    )}
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white" 
                      size="sm"
                      onClick={() => { setSelectedReq(req); setIsApproveOpen(true); }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" 
                      size="sm"
                      onClick={() => { setSelectedReq(req); setIsRejectOpen(true); }}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approval Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Deposit</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this deposit? This will credit ₹{selectedReq?.amount} to {selectedReq?.full_name}'s wallet immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note">Admin Note (Optional)</Label>
              <Textarea 
                id="note" 
                placeholder="e.g. Funds verified via Bank statement"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('approved')} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm & Credit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Deposit</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this deposit. The user will see this note.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reject-note">Rejection Reason</Label>
              <Textarea 
                id="reject-note" 
                placeholder="e.g. Invalid transaction reference / Slip not readable"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleAction('rejected')} disabled={isSubmitting || !adminNote}>
              {isSubmitting ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FinanceLayout>
  );
}
