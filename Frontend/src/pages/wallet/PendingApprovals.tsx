import React, { useState, useEffect } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Flag, LayoutDashboard, Shield, TrendingUp } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("corebody");
  const [installments, setInstallments] = useState<any[]>([]);
  const [businessmanInstallments, setBusinessmanInstallments] = useState<any[]>([]);
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

  const fetchBusinessmanInstallments = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getPendingBusinessmanInstallments();
      setBusinessmanInstallments(data.pendingInstallments || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load businessman installments");
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
    if (activeTab === "corebody") fetchInstallments();
    if (activeTab === "businessman") fetchBusinessmanInstallments();
    if (activeTab === "deposits") fetchDeposits();
  }, [activeTab]);

  const handleApprove = async () => {
    try {
      if (activeTab === "corebody") {
        await adminApi.approveCoreBodyInstallment(selectedRequest.installment_id, "approve");
        toast.success("Installment approved and profile activated!");
        fetchInstallments();
      } else if (activeTab === "businessman") {
        await adminApi.approveBusinessmanInstallment(selectedRequest.installment_id, "approve");
        toast.success("Businessman installment approved!");
        fetchBusinessmanInstallments();
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

  const handleReject = async (remarks?: string) => {
    try {
      if (activeTab === "corebody") {
        await adminApi.approveCoreBodyInstallment(selectedRequest.installment_id, "reject");
        toast.success("Installment rejected successfully!");
        fetchInstallments();
      } else if (activeTab === "businessman") {
        await adminApi.approveBusinessmanInstallment(selectedRequest.installment_id, "reject");
        toast.success("Businessman installment rejected!");
        fetchBusinessmanInstallments();
      } else if (activeTab === "deposits") {
        await adminApi.updateDepositStatus(selectedRequest.id, "rejected", remarks);
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
          <Tabs defaultValue="corebody" onValueChange={setActiveTab} value={activeTab}>
            <TabsList>
              <TabsTrigger value="corebody">Core Body Installments</TabsTrigger>
              <TabsTrigger value="businessman">Businessman Installments</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="deposits">Wallet Deposits</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              if (activeTab === "corebody") fetchInstallments();
              if (activeTab === "businessman") fetchBusinessmanInstallments();
              if (activeTab === "deposits") fetchDeposits();
            }} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
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

        {activeTab === "deposits" && deposits.length === 0 && (
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

        {activeTab === "corebody" && installments.length === 0 && (
          <div className="flex flex-col items-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Shield className="w-12 h-12 mb-4 opacity-10 text-blue-500" />
            <p className="text-lg font-medium">No pending Core Body installments</p>
            <p className="text-sm opacity-60">All investment payments have been processed.</p>
          </div>
        )}

        {activeTab === "corebody" && installments.map((inst) => (
          <Card key={inst.installment_id} className="border-blue-200 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{inst.name}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Core Body {inst.core_body_type}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{inst.email} • {inst.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    Installment #{inst.installment_no}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount to Verify</p>
                  <p className="text-2xl font-bold text-blue-600">₹{formatAmount(inst.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Reference</p>
                  <p className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 inline-block w-full">{inst.payment_ref}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">District</p>
                  <p className="text-sm font-semibold">{inst.district_name || 'Global'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1.5 opacity-60" />
                  Submitted: {new Date(inst.created_at).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSelectedRequest(inst); setShowRejectModal(true); }}>
                    <XCircle className="w-4 h-4 mr-2" />Reject
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 hover:text-white shadow-sm" onClick={() => { setSelectedRequest(inst); setShowApproveModal(true); }}>
                    <CheckCircle className="w-4 h-4 mr-2" />Verify & Activate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {activeTab === "businessman" && businessmanInstallments.length === 0 && (
          <div className="flex flex-col items-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <TrendingUp className="w-12 h-12 mb-4 opacity-10 text-orange-500" />
            <p className="text-lg font-medium">No pending Businessman installments</p>
            <p className="text-sm opacity-60">All businessmen investment payments are processed.</p>
          </div>
        )}

        {activeTab === "businessman" && businessmanInstallments.map((inst) => (
          <Card key={inst.installment_id} className="border-orange-200 shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{inst.name}</CardTitle>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">{inst.businessman_mode?.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{inst.email} • {inst.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1">
                    Installment #{inst.installment_no}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount to Verify</p>
                  <p className="text-2xl font-bold text-orange-600">₹{formatAmount(inst.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Reference</p>
                  <p className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 inline-block w-full">{inst.payment_ref}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">District</p>
                  <p className="text-sm font-semibold">{inst.district_name || 'Global'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1.5 opacity-60" />
                  Submitted: {new Date(inst.created_at).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSelectedRequest(inst); setShowRejectModal(true); }}>
                    <XCircle className="w-4 h-4 mr-2" />Reject
                  </Button>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 hover:text-white shadow-sm" onClick={() => { setSelectedRequest(inst); setShowApproveModal(true); }}>
                    <CheckCircle className="w-4 h-4 mr-2" />Verify & Approve
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
        description="Verify the payment reference number matches your bank statement before approving."
        items={selectedRequest ? [
          { label: "User", value: selectedRequest.userName || selectedRequest.name || selectedRequest.full_name, type: "text" },
          { label: "Reference", value: selectedRequest.payment_ref || selectedRequest.transaction_ref || selectedRequest.id, type: "text" },
          { label: "Amount", value: selectedRequest.netPayable || selectedRequest.amount, type: "amount" },
        ] : []}
        totalAmount={selectedRequest?.netPayable || selectedRequest?.amount || 0}
        onConfirm={handleApprove}
        warningText={activeTab === 'corebody' ? "Approving this will activate the Core Body profile and grant them system access." : "Approving this will update the investment status and wallet balance."}
      />

      <FinanceConfirmationModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        actionType="reject"
        title="Confirm Rejection"
        items={selectedRequest ? [
          { label: "User", value: selectedRequest.userName || selectedRequest.name || selectedRequest.full_name, type: "text" },
          { label: "Amount", value: selectedRequest.requestedAmount || selectedRequest.amount, type: "amount" },
        ] : []}
        totalAmount={selectedRequest?.requestedAmount || selectedRequest?.amount || 0}
        onConfirm={handleReject}
        warningText="The user will be notified and will need to resubmit the payment details with a valid reference."
      />
    </FinanceLayout>
  );
}
