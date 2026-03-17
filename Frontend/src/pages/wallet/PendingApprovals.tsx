import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Filter, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FinanceConfirmationModal from "@/components/finance/FinanceConfirmationModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  },
  {
    id: "APR002",
    userName: "Jane Distributor",
    walletType: "Referral Wallet",
    requestedAmount: 50000.00,
    tds: 2500.00,
    processingFee: 50.00,
    netPayable: 47450.00,
    requestDate: "2026-02-19",
    requestTime: "09:15:30",
    priority: "medium",
    riskLevel: "medium",
    upiId: "jane@upi",
  },
  {
    id: "APR003",
    userName: "John Businessman",
    walletType: "Main Wallet",
    requestedAmount: 25000.00,
    tds: 1250.00,
    processingFee: 25.00,
    netPayable: 23725.00,
    requestDate: "2026-02-19",
    requestTime: "10:30:45",
    priority: "normal",
    riskLevel: "low",
    bankName: "State Bank of India",
    accountNumber: "****4567",
  },
];

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

const priorityStyles = {
  high: "border-l-4 border-l-red-500",
  medium: "border-l-4 border-l-yellow-500",
  normal: "border-l-4 border-l-green-500",
};

const riskStyles = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function PendingApprovals() {
  const [isLoading, setIsLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  const stats = [
    { label: "High Priority", value: "1", type: "negative" as const, icon: "down" as const },
    { label: "Medium Priority", value: "1", type: "warning" as const, icon: "neutral" as const },
    { label: "Normal Priority", value: "1", type: "positive" as const, icon: "up" as const },
    { label: "Avg. Processing Time", value: "4.2 hrs", type: "neutral" as const, icon: "neutral" as const },
  ];

  const sortedRequests = [...mockRequests].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleApprove = () => {
    console.log("Approving request:", selectedRequest?.id);
    setShowApproveModal(false);
  };

  const handleReject = () => {
    console.log("Rejecting request:", selectedRequest?.id);
    setShowRejectModal(false);
  };

  const openApproveModal = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const openRejectModal = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  return (
    <FinanceLayout
      title="Pending Approvals"
      description="Admin decision queue - sorted by priority"
      icon="approval"
      stats={stats}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200">
              <Flag className="w-3 h-3 mr-1" />1 High Priority
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200">
              <Clock className="w-3 h-3 mr-1" />Avg. 4.2 hrs
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 1000); }}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />Refresh
            </Button>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filter</Button>
            <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-2" />Date Range</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {sortedRequests.map((request) => (
          <Card key={request.id} className={`${priorityStyles[request.priority]} border-gray-200 dark:border-gray-700`}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{request.userName}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{request.walletType} • {request.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={riskStyles[request.riskLevel]}>{request.riskLevel.charAt(0).toUpperCase() + request.riskLevel.slice(1)} Risk</Badge>
                  <Badge variant="outline" className={request.priority === "high" ? "border-red-300 text-red-700" : request.priority === "medium" ? "border-yellow-300 text-yellow-700" : "border-green-300 text-green-700"}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Requested Amount</p>
                  <p className="text-lg font-semibold">₹{formatAmount(request.requestedAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">TDS (5%)</p>
                  <p className="text-sm text-red-600">-₹{formatAmount(request.tds)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Processing Fee</p>
                  <p className="text-sm">-₹{formatAmount(request.processingFee)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Net Payable</p>
                  <p className="text-lg font-bold text-green-600">₹{formatAmount(request.netPayable)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Requested: {request.requestDate} {request.requestTime}</span>
                  <span>•</span>
                  <span>{request.bankName || request.upiId}</span>
                  {request.remarks && <><span>•</span><span className="text-yellow-600">{request.remarks}</span></>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => openRejectModal(request)}>
                    <XCircle className="w-4 h-4 mr-2" />Reject
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => openApproveModal(request)} disabled={request.riskLevel === "high"}>
                    <CheckCircle className="w-4 h-4 mr-2" />Approve
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
          { label: "User", value: selectedRequest.userName, type: "text" },
          { label: "Wallet Type", value: selectedRequest.walletType, type: "text" },
          { label: "Net Payable", value: selectedRequest.netPayable, type: "amount" },
        ] : []}
        totalAmount={selectedRequest?.netPayable || 0}
        onConfirm={handleApprove}
        warningText="This action will initiate the fund transfer to the user's account."
      />

      <FinanceConfirmationModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        actionType="reject"
        title="Confirm Rejection"
        items={selectedRequest ? [
          { label: "User", value: selectedRequest.userName, type: "text" },
          { label: "Amount", value: selectedRequest.requestedAmount, type: "amount" },
        ] : []}
        totalAmount={selectedRequest?.requestedAmount || 0}
        onConfirm={handleReject}
        warningText="The rejected amount will be credited back to the user's wallet."
      />

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span>High-value requests require additional verification before approval</span>
        </div>
      </div>
    </FinanceLayout>
  );
}
