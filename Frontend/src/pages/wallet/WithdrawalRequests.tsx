import React, { useState } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Download, Filter, RefreshCw, CheckCircle, XCircle, 
  AlertTriangle, Eye, Clock, ArrowUpRight 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FinanceStatusBadge from "@/components/finance/FinanceStatusBadge";
import FinanceConfirmationModal from "@/components/finance/FinanceConfirmationModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WithdrawalRequest {
  id: string;
  userName: string;
  walletType: string;
  requestedAmount: number;
  tds: number;
  processingFee: number;
  netPayable: number;
  requestDate: string;
  requestTime: string;
  status: "pending" | "approved" | "rejected";
  riskLevel: "low" | "medium" | "high";
  bankName?: string;
  accountNumber?: string;
  upiId?: string;
}

// Mock data
const mockRequests: WithdrawalRequest[] = [
  {
    id: "WTH001",
    userName: "John Businessman",
    walletType: "Main Wallet",
    requestedAmount: 25000.00,
    tds: 1250.00,
    processingFee: 25.00,
    netPayable: 23725.00,
    requestDate: "2026-02-19",
    requestTime: "10:30:45",
    status: "pending",
    riskLevel: "low",
    bankName: "State Bank of India",
    accountNumber: "****4567",
  },
  {
    id: "WTH002",
    userName: "Jane Distributor",
    walletType: "Referral Wallet",
    requestedAmount: 50000.00,
    tds: 2500.00,
    processingFee: 50.00,
    netPayable: 47450.00,
    requestDate: "2026-02-19",
    requestTime: "09:15:30",
    status: "pending",
    riskLevel: "medium",
    upiId: "jane@upi",
  },
  {
    id: "WTH003",
    userName: "Mike Stock Point",
    walletType: "Main Wallet",
    requestedAmount: 100000.00,
    tds: 5000.00,
    processingFee: 100.00,
    netPayable: 94900.00,
    requestDate: "2026-02-18",
    requestTime: "16:45:00",
    status: "pending",
    riskLevel: "high",
    bankName: "HDFC Bank",
    accountNumber: "****8901",
  },
  {
    id: "WTH004",
    userName: "Sarah Core Body",
    walletType: "Main Wallet",
    requestedAmount: 15000.00,
    tds: 750.00,
    processingFee: 15.00,
    netPayable: 14235.00,
    requestDate: "2026-02-18",
    requestTime: "14:22:10",
    status: "pending",
    riskLevel: "low",
    bankName: "ICICI Bank",
    accountNumber: "****2345",
  },
  {
    id: "WTH005",
    userName: "Alex Partner",
    walletType: "Referral Wallet",
    requestedAmount: 7500.00,
    tds: 375.00,
    processingFee: 10.00,
    netPayable: 7115.00,
    requestDate: "2026-02-17",
    requestTime: "11:20:15",
    status: "pending",
    riskLevel: "low",
    upiId: "alex@upi",
  },
];

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const riskStyles = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function WithdrawalRequests() {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<WithdrawalRequest | null>(null);

  const stats = [
    { label: "Pending Requests", value: "5", type: "warning" as const, icon: "neutral" as const },
    { label: "Total Amount", value: "₹1,82,500.00", type: "neutral" as const, icon: "neutral" as const },
    { label: "High Risk", value: "1", type: "negative" as const, icon: "down" as const },
    { label: "Min Threshold", value: "₹500", type: "neutral" as const, icon: "neutral" as const },
  ];

  const handleSelectAll = () => {
    if (selectedRequests.length === mockRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(mockRequests.map((r) => r.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter((r) => r !== id));
    } else {
      setSelectedRequests([...selectedRequests, id]);
    }
  };

  const handleApprove = () => {
    console.log("Approving requests:", selectedRequests);
    setShowApproveModal(false);
    setSelectedRequests([]);
  };

  const handleReject = () => {
    console.log("Rejecting requests:", selectedRequests);
    setShowRejectModal(false);
    setSelectedRequests([]);
  };

  const handleExport = () => {
    console.log("Exporting withdrawal requests...");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const selectedTotal = mockRequests
    .filter((r) => selectedRequests.includes(r.id))
    .reduce((sum, r) => sum + r.netPayable, 0);

  return (
    <FinanceLayout
      title="Withdrawal Requests"
      description="Incoming payout requests requiring admin approval"
      icon="withdrawal"
      stats={stats}
    >
      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              {mockRequests.filter(r => r.status === "pending").length} Pending
            </Badge>
            <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {mockRequests.filter(r => r.riskLevel === "high").length} High Risk
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {selectedRequests.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedRequests.length} selected
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Total: ₹{formatAmount(selectedTotal)}
              </span>
              {mockRequests.some(r => selectedRequests.includes(r.id) && r.riskLevel === "high") && (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Contains High Risk
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={() => setShowRejectModal(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowApproveModal(true)}
                disabled={mockRequests.some(r => selectedRequests.includes(r.id) && r.riskLevel === "high")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-6">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedRequests.length === mockRequests.length && mockRequests.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">User</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Wallet</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-right">Requested</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-right">TDS</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-right">Fee</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300 text-right">Net Payable</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Request Date</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Risk</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Status</TableHead>
              <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRequests.map((request) => (
              <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.id)}
                    onChange={() => handleSelect(request.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {request.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {request.bankName || request.upiId}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{request.walletType}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100">
                  ₹{formatAmount(request.requestedAmount)}
                </TableCell>
                <TableCell className="text-right text-red-600 dark:text-red-400">
                  -₹{formatAmount(request.tds)}
                </TableCell>
                <TableCell className="text-right text-gray-600 dark:text-gray-400">
                  -₹{formatAmount(request.processingFee)}
                </TableCell>
                <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                  ₹{formatAmount(request.netPayable)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{request.requestDate}</span>
                    <span className="text-xs text-gray-500">{request.requestTime}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={riskStyles[request.riskLevel]}>
                    {request.riskLevel.charAt(0).toUpperCase() + request.riskLevel.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <FinanceStatusBadge status={request.status} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Approve Confirmation Modal */}
      <FinanceConfirmationModal
        open={showApproveModal}
        onOpenChange={setShowApproveModal}
        actionType="approve"
        title="Confirm Withdrawal Approval"
        items={[
          { label: "Selected Requests", value: selectedRequests.length, type: "text" },
          { label: "Total Amount", value: selectedTotal, type: "amount" },
        ]}
        totalAmount={selectedTotal}
        onConfirm={handleApprove}
        warningText="This action will initiate fund transfer to the selected users. Ensure all details are verified."
      />

      {/* Reject Confirmation Modal */}
      <FinanceConfirmationModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        actionType="reject"
        title="Confirm Withdrawal Rejection"
        items={[
          { label: "Selected Requests", value: selectedRequests.length, type: "text" },
          { label: "Total Amount", value: selectedTotal, type: "amount" },
        ]}
        totalAmount={selectedTotal}
        onConfirm={handleReject}
        warningText="Rejected withdrawals will be credited back to user wallets. Users will be notified of the rejection reason."
      />

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>
              <strong>Minimum Withdrawal:</strong> ₹500
            </span>
            <span>
              <strong>TDS Rate:</strong> 5%
            </span>
            <span>
              <strong>Processing Fee:</strong> 0.1% (Min ₹10, Max ₹100)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span>All actions are logged permanently</span>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
}
