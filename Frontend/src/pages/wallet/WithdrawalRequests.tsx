import React, { useState, useEffect, useCallback } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, CheckCircle, XCircle, 
  Clock, Loader2
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
import api from "@/lib/api";

interface WithdrawalRequest {
  id: string;
  full_name: string;
  email: string;
  role_code: string;
  requested_amount: number;
  status: "pending" | "approved" | "rejected";
  upi_id?: string;
  bank_account_id?: string;
  notes?: string;
  created_at: string;
  current_wallet_balance: number;
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/wallet/admin/withdrawals?status=${statusFilter}&limit=50`);
      setRequests(res.data.requests || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load withdrawal requests");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleSelectAll = () =>
    setSelectedRequests(selectedRequests.length === requests.length ? [] : requests.map(r => r.id));

  const handleSelect = (id: string) =>
    setSelectedRequests(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await Promise.all(
        selectedRequests.map(id =>
          api.put(`/wallet/admin/withdrawals/${id}/approve`, { notes: "Approved via bulk action" })
        )
      );
      setShowApproveModal(false);
      setSelectedRequests([]);
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || "Approval failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await Promise.all(
        selectedRequests.map(id =>
          api.put(`/wallet/admin/withdrawals/${id}/reject`, { reason: "Rejected via bulk action" })
        )
      );
      setShowRejectModal(false);
      setSelectedRequests([]);
      await fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || "Rejection failed");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedTotal = requests
    .filter(r => selectedRequests.includes(r.id))
    .reduce((sum, r) => sum + parseFloat(r.requested_amount as any), 0);

  const stats = [
    { label: "Pending Requests", value: String(requests.length), type: "warning" as const, icon: "neutral" as const },
    { label: "Total Amount", value: `₹${formatAmount(requests.reduce((s, r) => s + parseFloat(r.requested_amount as any), 0))}`, type: "neutral" as const, icon: "neutral" as const },
    { label: "Selected", value: String(selectedRequests.length), type: "positive" as const, icon: "up" as const },
    { label: "Min Threshold", value: "₹500", type: "neutral" as const, icon: "neutral" as const },
  ];

  return (
    <FinanceLayout
      title="Withdrawal Requests"
      description="Incoming payout requests requiring admin approval"
      icon="withdrawal"
      stats={stats}
    >
      {/* Filter + Refresh Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              {requests.filter(r => r.status === "pending").length} Pending
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {["pending","approved","rejected"].map(s => (
              <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={fetchRequests} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRequests.length > 0 && statusFilter === "pending" && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{selectedRequests.length} selected</span>
              <span className="text-lg font-bold">Total: ₹{formatAmount(selectedTotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowApproveModal(true)} disabled={actionLoading}>
                <CheckCircle className="w-4 h-4 mr-2" /> Approve All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading withdrawal requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No {statusFilter} withdrawal requests found.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
              <TableRow className="hover:bg-transparent">
                {statusFilter === "pending" && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRequests.length === requests.length && requests.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </TableHead>
                )}
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold text-right">Amount</TableHead>
                <TableHead className="font-semibold text-right">Wallet Balance</TableHead>
                <TableHead className="font-semibold">Payment To</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(request => (
                <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  {statusFilter === "pending" && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelect(request.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{request.full_name}</span>
                      <span className="text-xs text-muted-foreground">{request.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.role_code?.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900 dark:text-gray-100">
                    ₹{formatAmount(parseFloat(request.requested_amount as any))}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    ₹{formatAmount(parseFloat(request.current_wallet_balance as any))}
                  </TableCell>
                  <TableCell className="text-sm">
                    {request.upi_id ? `UPI: ${request.upi_id}` : request.bank_account_id ? `Bank Account` : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(request.created_at).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <FinanceStatusBadge status={request.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Approve Modal */}
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

      {/* Reject Modal */}
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
        warningText="Rejected withdrawals will be credited back to user wallets."
      />
    </FinanceLayout>
  );
}
