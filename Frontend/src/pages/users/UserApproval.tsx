import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Building,
  ShieldCheck,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export default function UserApprovalPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const openUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get("/admin/pending-users");
      setPendingUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      toast({ title: "Error", description: "Failed to fetch pending users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await api.post(`/admin/approve-user/${userId}`);
      toast({ title: "Success", description: "User approved successfully" });
      fetchPendingUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to approve user", variant: "destructive" });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.delete(`/admin/reject-user/${userId}`);
      toast({ title: "Success", description: "User rejected and removed" });
      fetchPendingUsers();
    } catch (error: any) {
      console.error("Reject error:", error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to reject user", variant: "destructive" });
    }
  };

  const coreBodyUsers = pendingUsers.filter((u: any) => 
    ["core_body_a", "core_body_b", "dealer"].includes(u.role_code)
  );
  const businessmanUsers = pendingUsers.filter((u: any) => u.role_code === "businessman");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Paid</Badge>;
      case 'pending_approval':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white animate-pulse">Pending Review</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-slate-400">Unpaid</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Approvals</h1>
        <div className="flex gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            Total Pending: {pendingUsers.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Core Body / Dealer Approvals
              <Badge variant="outline" className="ml-auto font-normal text-indigo-600 border-indigo-200 bg-indigo-50">
                {coreBodyUsers.length} Pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : coreBodyUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Clock className="w-12 h-12 mb-2 opacity-20" />
                <p>No pending approvals here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {coreBodyUsers.map((user: any) => (
                  <div 
                    key={user.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all group" 
                    onClick={() => openUserDetails(user)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500 font-medium">{user.role_code.replace('_', ' ').toUpperCase()}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {user.district_name && (
                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 bg-white">
                              <MapPin className="w-3 h-3" /> {user.district_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleApprove(user.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleReject(user.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              Businessman Approvals
              <Badge variant="outline" className="ml-auto font-normal text-amber-600 border-amber-200 bg-amber-50">
                {businessmanUsers.length} Pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : businessmanUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Clock className="w-12 h-12 mb-2 opacity-20" />
                <p>No pending approvals here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {businessmanUsers.map((user: any) => (
                  <div 
                    key={user.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:border-amber-400 hover:bg-amber-50/30 cursor-pointer transition-all group" 
                    onClick={() => openUserDetails(user)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-xs text-slate-500 font-medium capitalize">{user.businessman_type?.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Building className="w-3 h-3" /> {user.business_name || 'No business name'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleApprove(user.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleReject(user.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-0 gap-0 rounded-2xl shadow-2xl">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">{selectedUser?.full_name}</DialogTitle>
                  <DialogDescription className="text-slate-300 mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-white border-white/30 bg-white/5 font-semibold">
                      {selectedUser?.role_code.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span>Member since {new Date(selectedUser?.created_at).toLocaleDateString()}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="bg-white p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Details Column */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" /> Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Mail className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Email Address</p>
                        <p className="text-sm font-semibold text-slate-700 break-all">{selectedUser?.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Phone className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Phone Number</p>
                        <p className="text-sm font-semibold text-slate-700">{selectedUser?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <MapPin className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Jurisdiction</p>
                        <p className="text-sm font-semibold text-slate-700">{selectedUser?.district_name || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Govt ID (PAN)</p>
                        <p className="text-sm font-semibold text-slate-700">{selectedUser?.pan_number || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedUser?.businessman_type && (
                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest flex items-center gap-2">
                      <Building className="w-3 h-3" /> Business Profile
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Organization Name</p>
                        <p className="text-sm font-semibold text-slate-700">{selectedUser?.business_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">GST Identification</p>
                        <p className="text-sm font-semibold text-slate-700">{selectedUser?.gst_number || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Data Column */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                    <CreditCard className="w-3 h-3" /> Financial Commitment Breakdown
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Investment</p>
                      <p className="text-2xl font-black text-slate-900 italic tracking-tight">
                        ₹{(selectedUser?.investment_amount || selectedUser?.advance_amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Structure</p>
                      <p className="text-xl font-bold text-slate-700">
                        {selectedUser?.core_body_installments?.length || selectedUser?.businessman_installments?.length || 1} Installments
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider">Inst #</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider">Amount</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider">Ref ID</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedUser?.core_body_installments || selectedUser?.businessman_installments || []).length > 0 ? (
                          (selectedUser?.core_body_installments || selectedUser?.businessman_installments).map((inst: any) => (
                            <TableRow key={inst.id} className="hover:bg-slate-50/50">
                              <TableCell className="font-bold text-slate-600">{inst.installment_no}</TableCell>
                              <TableCell className="font-bold text-slate-900">₹{parseFloat(inst.amount).toLocaleString('en-IN')}</TableCell>
                              <TableCell className="font-mono text-[10px] text-slate-400">{inst.payment_ref || 'N/A'}</TableCell>
                              <TableCell className="text-right">{getStatusBadge(inst.status)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-slate-400 italic">
                              No specific installment records found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900 text-sm">Review Policy</h4>
                    <p className="text-indigo-700/70 text-xs mt-1 leading-relaxed font-medium">
                      By approving this user, you verify that their financial commitments have been vetted and appropriate documentation has been provided. Core Body members gain access to the distribution network immediately upon approval.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 p-6 border-t border-slate-100 flex sm:justify-between items-center gap-4">
            <Button variant="ghost" className="font-semibold text-slate-500 px-6 py-6" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none border-rose-200 text-rose-600 hover:bg-rose-50 px-8 py-6 font-bold"
                onClick={() => {
                  setIsDialogOpen(false);
                  handleReject(selectedUser.id);
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject & Archive
              </Button>
              <Button 
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-lg px-8 py-6 font-bold"
                onClick={() => {
                  setIsDialogOpen(false);
                  handleApprove(selectedUser.id);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Authorize User Access
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

