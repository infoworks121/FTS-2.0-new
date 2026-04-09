import React, { useState, useEffect } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Flag, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FinanceConfirmationModal from "@/components/finance/FinanceConfirmationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

interface ApprovalRequest {
  id: string;
  userName: string;
  walletType: string;
  requestedAmount: number;
  tds: number;
  processingFee: number;
  netPayable: number;
  requestDate: string;
  requestTime: string;
  priority: "high" | "medium" | "normal";
  riskLevel: "low" | "medium" | "high";
  bankName?: string;
  accountNumber?: string;
  upiId?: string;
  remarks?: string;
}

const mockRequests: ApprovalRequest[] = [
  {
    id: "APR001",
    userName: "Mike Stock Point",
    walletType: "Main Wallet",
    requestedAmount: 100000.00,
    tds: 5000.00,
    processingFee: 100.00,
    netPayable: 94900.00,
    requestDate: "2026-02-18",
    requestTime: "16:45:00",
    priority: "high",
    riskLevel: "high",
    bankName: "HDFC Bank",
    accountNumber: "****8901",
    remarks: "Large withdrawal - requires verification",
  }
];

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

export default function PendingApprovals() {
  const [isLoading, setIsLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("withdrawals");
  const [installments, setInstallments] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);

  const fetchInstallments = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getPendingCoreBodyInstallments();
      setInstallments(data.pendingInstallments || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load installments");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeposits = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getPendingDeposits();
      setDeposits(data.requests || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load deposit requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallments();
    fetchDeposits();
  }, []);

  const handleApprove = async () => {
    try {
      if (activeTab === "corebody") {
        await adminApi.approveCoreBodyInstallment(selectedRequest.installment_id, "approve");
        toast.success("Installment approved successfully!");
        fetchInstallments();
      } else if (activeTab === "deposits") {
        await adminApi.updateDepositStatus(selectedRequest.id, "approved");
        toast.success("Deposit approved successfully!");
        fetchDeposits();
      } else {
        toast.success("Withdrawal approved (Mock)");
      }
    } catch (e) {
      toast.error("Approval failed");
    }
    setShowApproveModal(false);
  };

  const handleReject = async () => {
    try {
      if (activeTab === "corebody") {
        await adminApi.approveCoreBodyInstallment(selectedRequest.installment_id, "reject");
        toast.success("Installment rejected successfully!");
        fetchInstallments();
      } else if (activeTab === "deposits") {
        await adminApi.updateDepositStatus(selectedRequest.id, "rejected");
        toast.success("Deposit rejected successfully!");
        fetchDeposits();
      } else {
        toast.success("Withdrawal rejected (Mock)");
      }
    } catch (e) {
      toast.error("Rejection failed");
    }
    setShowRejectModal(false);
  };

  return (
    <FinanceLayout
      title="Pending Approvals"
      description="Admin decision queue for Withdrawals and Core Body Invests."
      icon="approval"
      stats={[]}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs defaultValue="withdrawals" onValueChange={setActiveTab} value={activeTab}>
            <TabsList>
              <TabsTrigger value="withdrawals">Withdrawals {mockRequests.length > 0 && `(${mockRequests.length})`}</TabsTrigger>
              <TabsTrigger value="corebody">Core Body Installments {installments.length > 0 && `(${installments.length})`}</TabsTrigger>
              <TabsTrigger value="deposits">Wallet Deposits {deposits.length > 0 && `(${deposits.length})`}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              if (activeTab === "corebody") fetchInstallments();
              if (activeTab === "deposits") fetchDeposits();
            }} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-50 mb-3" />
            <p className="text-sm text-muted-foreground italic">Fetching pending requests...</p>
          </div>
        )}

        {activeTab === "withdrawals" && mockRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <CardTitle className="text-lg">{request.userName}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => { setSelectedRequest(request); setShowRejectModal(true); }}><XCircle className="w-4 h-4 mr-2"/>Reject</Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setSelectedRequest(request); setShowApproveModal(true); }}><CheckCircle className="w-4 h-4 mr-2"/>Approve</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>Amount: ₹{formatAmount(request.requestedAmount)} (Net: ₹{formatAmount(request.netPayable)})</p>
              <p className="text-sm text-gray-500">Ref: {request.id}</p>
            </CardContent>
          </Card>
        ))}

        {activeTab === "deposits" && !isLoading && deposits.length === 0 && (
          <div className="flex flex-col items-center py-10 text-gray-500">
            <CheckCircle className="w-10 h-10 mb-2 opacity-20" />
            <p>No pending wallet deposit requests.</p>
          </div>
        )}

        {activeTab === "deposits" && deposits.map((deposit) => (
          <Card key={deposit.id} className="border-emerald-200 shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{deposit.full_name}</CardTitle>
                  <p className="text-sm text-gray-500">{deposit.email} • {deposit.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Deposit: {deposit.payment_method}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Deposit Amount</p>
                  <p className="text-xl font-bold text-emerald-600">₹{formatAmount(deposit.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reference (UTR)</p>
                  <p className="text-sm font-mono bg-gray-100 p-1 rounded inline-block">{deposit.transaction_ref}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                <div className="text-sm text-gray-500">
                  Requested: {new Date(deposit.created_at).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSelectedRequest(deposit); setShowRejectModal(true); }}>
                    <XCircle className="w-4 h-4 mr-2" />Reject
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 hover:text-white" onClick={() => { setSelectedRequest(deposit); setShowApproveModal(true); }}>
                    <CheckCircle className="w-4 h-4 mr-2" />Approve Deposit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {activeTab === "corebody" && !isLoading && installments.length === 0 && (
          <div className="flex flex-col items-center py-10 text-gray-500">
            <LayoutDashboard className="w-10 h-10 mb-2 opacity-20" />
            <p>No pending core body installments found.</p>
          </div>
        )}

        {activeTab === "corebody" && installments.map((inst) => (
          <Card key={inst.installment_id} className="border-blue-200 shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{inst.name}</CardTitle>
                  <p className="text-sm text-gray-500">District: {inst.district_name || 'N/A'} • Type {inst.core_body_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Installment #{inst.installment_no}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Investment Amount Paid</p>
                  <p className="text-xl font-bold text-green-600">₹{formatAmount(inst.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Ref</p>
                  <p className="text-sm font-mono bg-gray-100 p-1 rounded inline-block">{inst.payment_ref}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                <div className="text-sm text-gray-500">
                  Submitted: {new Date(inst.created_at).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSelectedRequest(inst); setShowRejectModal(true); }}>
                    <XCircle className="w-4 h-4 mr-2" />Reject
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 hover:text-white" onClick={() => { setSelectedRequest(inst); setShowApproveModal(true); }}>
                    <CheckCircle className="w-4 h-4 mr-2" />Verify & Activate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FinanceConfirmationModal
        open={showApproveModal}
        onOpenChange={setShowApproveModal}
        actionType="approve"
        title="Confirm Approval"
        items={selectedRequest ? [
          { label: "User", value: selectedRequest.userName || selectedRequest.name, type: "text" },
          { label: "Amount", value: selectedRequest.netPayable || selectedRequest.amount, type: "amount" },
        ] : []}
        totalAmount={selectedRequest?.netPayable || selectedRequest?.amount || 0}
        onConfirm={handleApprove}
        warningText="Approving this will transfer the funds / activate the profile."
      />

      <FinanceConfirmationModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        actionType="reject"
        title="Confirm Rejection"
        items={selectedRequest ? [
          { label: "User", value: selectedRequest.userName || selectedRequest.name, type: "text" },
          { label: "Amount", value: selectedRequest.requestedAmount || selectedRequest.amount, type: "amount" },
        ] : []}
        totalAmount={selectedRequest?.requestedAmount || selectedRequest?.amount || 0}
        onConfirm={handleReject}
        warningText="The user will need to resubmit the payment details."
      />
    </FinanceLayout>
  );
}
