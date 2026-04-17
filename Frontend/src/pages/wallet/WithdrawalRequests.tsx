import React, { useState, useEffect, useCallback } from "react";
import FinanceLayout from "@/components/finance/FinanceLayout";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, CheckCircle, XCircle, 
  Clock, Loader2, User, Mail, CreditCard,
  Target, Calculator, Calendar, FileText,
  ShieldCheck, Info, ExternalLink, DollarSign
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/api";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role_code: string;
  requested_amount: number;
  tds_amount?: number;
  processing_fee?: number;
  net_payable?: number;
  status: "pending" | "approved" | "rejected";
  upi_id?: string;
  bank_account_id?: string;
  notes?: string;
  admin_notes?: string;
  transaction_ref?: string;
  created_at: string;
  updated_at?: string;
  processed_at?: string;
  current_wallet_balance: number;
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR",
    minimumFractionDigits: 2 
  }).format(amount);

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [viewRequest, setViewRequest] = useState<WithdrawalRequest | null>(null);
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedRequests(selectedRequests.length === requests.length ? [] : requests.map(r => r.id));
  };

  const handleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedRequests(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      if (viewRequest) {
        await api.put(`/wallet/admin/withdrawals/${viewRequest.id}/approve`, { notes: "Approved individual request" });
        setViewRequest(null);
      } else {
        await Promise.all(
          selectedRequests.map(id =>
            api.put(`/wallet/admin/withdrawals/${id}/approve`, { notes: "Approved via bulk action" })
          )
        );
        setSelectedRequests([]);
      }
      setShowApproveModal(false);
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
      if (viewRequest) {
        await api.put(`/wallet/admin/withdrawals/${viewRequest.id}/reject`, { reason: "Rejected individual request" });
        setViewRequest(null);
      } else {
        await Promise.all(
          selectedRequests.map(id =>
            api.put(`/wallet/admin/withdrawals/${id}/reject`, { reason: "Rejected via bulk action" })
          )
        );
        setSelectedRequests([]);
      }
      setShowRejectModal(false);
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
    { label: "Pending Requests", value: String(requests.filter(r => r.status === 'pending').length), type: "warning" as const, icon: "neutral" as const },
    { label: "Total Pending", value: formatAmount(requests.filter(r => r.status === 'pending').reduce((s, r) => s + parseFloat(r.requested_amount as any), 0)), type: "neutral" as const, icon: "neutral" as const },
    { label: "Selected", value: String(selectedRequests.length), type: "positive" as const, icon: "up" as const },
    { label: "Selected Value", value: formatAmount(selectedTotal), type: "neutral" as const, icon: "neutral" as const },
  ];

  return (
    <FinanceLayout
      title="Withdrawal Requests"
      description="Incoming payout requests requiring admin approval"
      icon="withdrawal"
      stats={stats}
    >
      {/* Filter + Refresh Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 px-3 py-1 text-sm">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              {requests.filter(r => r.status === "pending").length} Pending Requests
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {["pending","approved","rejected"].map(s => (
                <button 
                  key={s} 
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${statusFilter === s ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={fetchRequests} disabled={isLoading} className="h-9">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRequests.length > 0 && statusFilter === "pending" && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 animate-in slide-in-from-top duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{selectedRequests.length} Transactions Selected</span>
                <span className="text-xl font-bold text-emerald-900 dark:text-white">Total: {formatAmount(selectedTotal)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-white hover:bg-red-50 text-red-600 border-red-200 shadow-sm"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject Selected
              </Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-md px-6" onClick={() => setShowApproveModal(true)} disabled={actionLoading}>
                <CheckCircle className="w-4 h-4 mr-2" /> Approve All Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-0">
        {error && (
          <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
            <p className="font-medium">Fetching withdrawal requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-32 text-slate-400 bg-slate-50/50 flex flex-col items-center gap-3">
            <Clock className="w-12 h-12 opacity-20" />
            <p className="text-lg font-medium">No {statusFilter} withdrawal requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-transparent border-b">
                  {statusFilter === "pending" && (
                    <TableHead className="w-[50px] pl-6">
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === requests.length && requests.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900"
                      />
                    </TableHead>
                  )}
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 py-4">User Details</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Role</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right">Requested Amount</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Payment Channel</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Requested On</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(request => (
                  <TableRow 
                    key={request.id} 
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                    onClick={() => setViewRequest(request)}
                  >
                    {statusFilter === "pending" && (
                      <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.id)}
                          onChange={(e) => handleSelect(e as any, request.id)}
                          className="w-4 h-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900 cursor-pointer"
                        />
                      </TableCell>
                    )}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white leading-tight">{request.full_name}</span>
                          <span className="text-xs text-slate-500 font-medium">{request.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold tracking-wider">
                        {request.role_code?.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-900 dark:text-white text-base">
                      {formatAmount(parseFloat(request.requested_amount as any))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {request.upi_id ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                            <span>UPI: {request.upi_id}</span>
                          </>
                        ) : request.bank_account_id ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                            <span>Bank Account</span>
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium whitespace-nowrap">
                      {new Date(request.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="pr-6">
                      <FinanceStatusBadge status={request.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={!!viewRequest} onOpenChange={(open) => !open && setViewRequest(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
          {viewRequest && (
            <>
              <DialogHeader className="p-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <DollarSign className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight">{viewRequest.full_name}</DialogTitle>
                    <DialogDescription className="text-slate-400 font-medium flex items-center gap-1.5 italic">
                      <Mail className="w-3.5 h-3.5" /> {viewRequest.email}
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 relative z-10">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1 uppercase text-[10px] font-bold tracking-widest leading-none">
                    {viewRequest.role_code?.replace(/_/g, " ")}
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md px-3 py-1 uppercase text-[10px] font-bold tracking-widest leading-none">
                    {viewRequest.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="p-8 grid grid-cols-2 gap-8 bg-white dark:bg-slate-900 border-x border-gray-100 dark:border-slate-800">
                <div className="col-span-2 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5" /> Payment Breakdown
                  </h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Requested Amount</span>
                        <span className="font-bold text-slate-800 dark:text-white">{formatAmount(viewRequest.requested_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">TDS Deduction (0%)</span>
                        <span className="font-bold text-red-500">-{formatAmount(viewRequest.tds_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Processing Fee</span>
                        <span className="font-bold text-red-500">-{formatAmount(viewRequest.processing_fee || 0)}</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Net Payable</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                          {formatAmount(viewRequest.net_payable || viewRequest.requested_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Withdrawal Target
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Method</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{viewRequest.upi_id ? 'UPI Transfer' : 'Bank Transfer'}</span>
                      </div>
                    </div>
                    {viewRequest.upi_id && (
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">UPI ID</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white select-all">{viewRequest.upi_id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Audit Details
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Requested At</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {new Date(viewRequest.created_at).toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current Balance</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">{formatAmount(viewRequest.current_wallet_balance)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {viewRequest.notes && (
                  <div className="col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> User Notes
                    </h3>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 italic">
                      "{viewRequest.notes}"
                    </div>
                  </div>
                )}
                
                {viewRequest.admin_notes && (
                  <div className="col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-blue-500">
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Remarks
                    </h3>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-sm text-blue-700 dark:text-blue-300">
                      {viewRequest.admin_notes}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 flex-row justify-between sm:justify-between items-center border-t border-gray-100 dark:border-slate-800">
                <Button variant="ghost" className="text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => setViewRequest(null)}>
                  Close
                </Button>
                {viewRequest.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg" onClick={() => setShowApproveModal(true)} disabled={actionLoading}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve Request
                    </Button>
                  </div>
                )}
                {viewRequest.transaction_ref && (
                   <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                      <ShieldCheck className="w-4 h-4" /> 
                      REF: {viewRequest.transaction_ref}
                   </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <FinanceConfirmationModal
        open={showApproveModal}
        onOpenChange={setShowApproveModal}
        actionType="approve"
        title="Confirm Withdrawal Approval"
        items={[
          { label: "Selected Requests", value: viewRequest ? 1 : selectedRequests.length, type: "text" },
          { label: "Total Amount", value: viewRequest ? viewRequest.requested_amount : selectedTotal, type: "amount" },
        ]}
        totalAmount={viewRequest ? viewRequest.requested_amount : selectedTotal}
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
          { label: "Selected Requests", value: viewRequest ? 1 : selectedRequests.length, type: "text" },
          { label: "Total Amount", value: viewRequest ? viewRequest.requested_amount : selectedTotal, type: "amount" },
        ]}
        totalAmount={viewRequest ? viewRequest.requested_amount : selectedTotal}
        onConfirm={handleReject}
        warningText="Rejected withdrawals will be credited back to user wallets."
      />
    </FinanceLayout>
  );
}
