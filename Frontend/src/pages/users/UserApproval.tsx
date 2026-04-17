import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building,
  ShieldCheck,
  FileText,
  Search,
  RefreshCw,
  Users,
  ChevronRight,
  Calendar,
  Hash,
  Eye,
  AlertCircle,
  RotateCcw,
  FileCheck,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserApprovalPage() {
   const [pendingUsers, setPendingUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKycDialogOpen, setIsKycDialogOpen] = useState(false);
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | "restore";
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    type: "approve",
    userId: "",
    userName: "",
  });
  const { toast } = useToast();

  const openUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [pendingRes, rejectedRes] = await Promise.all([
        api.get("/admin/pending-users"),
        api.get("/admin/rejected-users")
      ]);

      setPendingUsers(pendingRes.data.users || []);
      setRejectedUsers(rejectedRes.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to fetch user data", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

   const handleAction = (type: "approve" | "reject" | "restore", user: any) => {
    setConfirmDialog({
      isOpen: true,
      type,
      userId: user.id,
      userName: user.full_name,
    });
  };

  const executeAction = async () => {
    const { type, userId } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));

    try {
      if (type === "approve") {
        await api.post(`/admin/approve-user/${userId}`);
        toast({ title: "Approved", description: "User has been approved successfully" });
      } else if (type === "reject") {
        await api.delete(`/admin/reject-user/${userId}`);
        toast({ title: "Rejected", description: "User has been moved to rejection list" });
      } else if (type === "restore") {
        await api.post(`/admin/restore-user/${userId}`);
        toast({ title: "Restored", description: "User has been restored to pending status" });
      }
      fetchData();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || `Failed to ${type} user`, 
        variant: "destructive" 
      });
    }
  };
  const fetchUserKyc = async (userId: string) => {
    try {
      setLoadingKyc(true);
      const res = await api.get(`/kyc/admin/user/${userId}`);
      setKycDocs(res.data);
    } catch (error) {
      console.error("Error fetching KYC:", error);
      toast({ title: "Error", description: "Failed to fetch KYC documents", variant: "destructive" });
    } finally {
      setLoadingKyc(false);
    }
  };

  const handleReviewKyc = async (docId: string, status: "approved" | "rejected", note: string = "") => {
    try {
      await api.post("/kyc/review", { doc_id: docId, status, note });
      toast({ title: "Success", description: `Document ${status}` });
      if (selectedUser) fetchUserKyc(selectedUser.id);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to review document", variant: "destructive" });
    }
  };
  const coreBodyUsers = pendingUsers.filter((u: any) =>
    ["core_body_a", "core_body_b", "dealer"].includes(u.role_code)
  );
  const businessmanUsers = pendingUsers.filter((u: any) => u.role_code === "businessman");

  const filteredUsers = useMemo(() => {
    let users: any[] = [];
    if (activeTab === "all") users = pendingUsers;
    else if (activeTab === "corebody") users = coreBodyUsers;
    else if (activeTab === "businessman") users = businessmanUsers;
    else if (activeTab === "rejected") users = rejectedUsers;

    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u: any) =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.district_name?.toLowerCase().includes(q)
    );
  }, [pendingUsers, rejectedUsers, activeTab, searchQuery]);

  const getRoleBadge = (roleCode: string) => {
    const map: Record<string, { label: string; className: string }> = {
      core_body_a: { label: "Core Body A", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
      core_body_b: { label: "Core Body B", className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800" },
      dealer: { label: "Dealer", className: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800" },
      businessman: { label: "Businessman", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" },
    };
    const entry = map[roleCode] || { label: roleCode, className: "bg-slate-50 text-slate-600 border-slate-200" };
    return <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${entry.className}`}>{entry.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-200 hover:bg-emerald-500/10 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-800">Paid</Badge>;
      case 'pending_approval':
        return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-200 hover:bg-amber-500/10 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-800">Pending Review</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-slate-400 dark:text-slate-500">Unpaid</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/10 text-rose-600 border border-rose-200 hover:bg-rose-500/10 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ─── Skeleton Rows ─────────────────────────────────────
  const SkeletonRows = () => (
    <>
      {[1, 2, 3, 4].map((i) => (
        <TableRow key={i}>
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <TableCell key={j}>
              <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage pending registration requests</p>
        </div>
        <Button
           variant="outline"
          size="sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="self-start sm:self-auto gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border bg-card shadow-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{pendingUsers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Core Body / Dealer</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{coreBodyUsers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border bg-card shadow-none">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
              <Building className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Businessman</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{businessmanUsers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Table Card ─────────────────────────────────── */}
      <Card className="border border-border bg-card shadow-none overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3 h-7">
                All
                <span className="ml-1.5 text-[10px] tabular-nums opacity-60">{pendingUsers.length}</span>
              </TabsTrigger>
              <TabsTrigger value="corebody" className="text-xs px-3 h-7">
                Core Body / Dealer
                <span className="ml-1.5 text-[10px] tabular-nums opacity-60">{coreBodyUsers.length}</span>
              </TabsTrigger>
               <TabsTrigger value="businessman" className="text-xs px-3 h-7">
                Businessman
                <span className="ml-1.5 text-[10px] tabular-nums opacity-60">{businessmanUsers.length}</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs px-3 h-7 text-rose-600 data-[state=active]:text-rose-600">
                Rejected
                <span className="ml-1.5 text-[10px] tabular-nums opacity-60">{rejectedUsers.length}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="sm:ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 w-full sm:w-64 text-xs bg-muted/40 border-border"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                 <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-[280px]">User</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">District</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{activeTab === 'rejected' ? 'Rejected' : 'Registered'}</TableHead>
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <SkeletonRows />
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                        <Clock className="w-5 h-5 opacity-40" />
                      </div>
                      <p className="text-sm font-medium">No pending approvals</p>
                      <p className="text-xs mt-0.5 opacity-60">
                        {searchQuery ? "Try adjusting your search criteria" : "All user registrations have been reviewed"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow
                    key={user.id}
                    className="group cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => openUserDetails(user)}
                  >
                    {/* User */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{user.full_name}</p>
                          {user.business_name && (
                            <p className="text-[11px] text-muted-foreground truncate">{user.business_name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>{getRoleBadge(user.role_code)}</TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs text-foreground truncate max-w-[180px]">{user.email || "—"}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{user.phone || "—"}</p>
                      </div>
                    </TableCell>

                    {/* District */}
                    <TableCell>
                      {user.district_name ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{user.district_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>

                     {/* Date */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(activeTab === 'rejected' ? user.rejected_at : user.created_at)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => openUserDetails(user)}
                           title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                         {activeTab === 'rejected' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                            onClick={() => handleAction("restore", user)}
                            title="Restore User"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                              onClick={() => handleAction("approve", user)}
                              title="Approve"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                              onClick={() => handleAction("reject", user)}
                              title="Reject"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-5 py-3 border-t border-border bg-muted/20">
            <p className="text-[11px] text-muted-foreground">
               Showing <span className="font-semibold text-foreground">{filteredUsers.length}</span> of{" "}
              <span className="font-semibold text-foreground">
                {activeTab === 'rejected' ? rejectedUsers.length : pendingUsers.length}
              </span>{" "}
              {activeTab === 'rejected' ? 'rejected' : 'pending'} requests
            </p>
          </div>
        )}
      </Card>

      {/* ─── Detail Dialog ──────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border border-border gap-0 rounded-xl shadow-xl">
          {/* Header */}
          <div className="bg-card border-b border-border p-6">
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                 <div className="min-w-0 flex-1">
                  <DialogTitle className="text-lg font-bold text-foreground">{selectedUser?.full_name}</DialogTitle>
                  <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                    {selectedUser && getRoleBadge(selectedUser.role_code)}
                    <span className="text-xs text-muted-foreground">
                      Registered {formatDate(selectedUser?.created_at)}
                    </span>
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/20 hover:border-primary/50 text-primary"
                  onClick={() => {
                    if (selectedUser) {
                      fetchUserKyc(selectedUser.id);
                      setIsKycDialogOpen(true);
                    }
                  }}
                >
                  <FileCheck className="w-4 h-4" />
                  Review KYC
                </Button>
              </div>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            {/* Contact & Identity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">Contact Information</h3>
                <div className="space-y-3">
                  <DetailRow icon={Mail} label="Email" value={selectedUser?.email || "N/A"} />
                  <DetailRow icon={Phone} label="Phone" value={selectedUser?.phone || "N/A"} />
                  <DetailRow icon={MapPin} label="District" value={selectedUser?.district_name || "N/A"} />
                  <DetailRow icon={FileText} label="PAN Number" value={selectedUser?.pan_number || "N/A"} mono />
                </div>
              </div>

              {/* Business Info (if applicable) */}
              {selectedUser?.businessman_type && (
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">Business Profile</h3>
                  <div className="space-y-3">
                    <DetailRow icon={Building} label="Organization" value={selectedUser?.business_name || "N/A"} />
                    <DetailRow icon={FileText} label="GST Number" value={selectedUser?.gst_number || "N/A"} mono />
                    <DetailRow icon={Hash} label="Type" value={selectedUser?.businessman_type?.replace('_', ' ') || "N/A"} capitalize />
                  </div>
                </div>
              )}
            </div>

            {/* Financial Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Financial Details
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl p-4 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-1">Total Investment</p>
                  <p className="text-xl font-bold text-foreground tabular-nums">
                    ₹{(selectedUser?.investment_amount || selectedUser?.advance_amount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-xl p-4 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-1">Installment Plan</p>
                  <p className="text-xl font-bold text-foreground tabular-nums">
                    {selectedUser?.core_body_installments?.length || selectedUser?.businessman_installments?.length || 1}
                    <span className="text-sm font-normal text-muted-foreground ml-1">installments</span>
                  </p>
                </div>
              </div>

              {/* Installments Table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">#</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reference</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedUser?.core_body_installments || selectedUser?.businessman_installments || []).length > 0 ? (
                      (selectedUser?.core_body_installments || selectedUser?.businessman_installments).map((inst: any) => (
                        <TableRow key={inst.id} className="hover:bg-muted/20">
                          <TableCell className="text-sm font-medium text-muted-foreground">{inst.installment_no}</TableCell>
                          <TableCell className="text-sm font-semibold text-foreground tabular-nums">₹{parseFloat(inst.amount).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">{inst.payment_ref || '—'}</TableCell>
                          <TableCell className="text-right">{getStatusBadge(inst.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-xs">
                          No installment records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Policy Notice */}
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                By approving this user, you confirm that financial commitments have been verified and documentation is in order. Access will be granted immediately upon approval.
              </p>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="bg-muted/30 border-t border-border p-4 flex sm:justify-between items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setIsDialogOpen(false)}
             >
              Cancel
            </Button>
             <div className="flex gap-2">
              {activeTab === 'rejected' ? (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 gap-1.5 shadow-sm"
                  onClick={() => handleAction("restore", selectedUser)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore User
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-500/10 gap-1.5"
                    onClick={() => handleAction("reject", selectedUser)}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 gap-1.5 shadow-sm"
                    onClick={() => handleAction("approve", selectedUser)}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve User
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Confirmation Dialog ────────────────────────── */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-md p-6 border border-border rounded-xl shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                confirmDialog.type === 'approve' ? 'bg-emerald-500/10 text-emerald-600' :
                confirmDialog.type === 'reject' ? 'bg-rose-500/10 text-rose-600' :
                'bg-blue-500/10 text-blue-600'
              }`}>
                {confirmDialog.type === 'approve' ? <CheckCircle className="w-5 h-5" /> : 
                 confirmDialog.type === 'reject' ? <XCircle className="w-5 h-5" /> :
                 <RotateCcw className="w-5 h-5" />}
              </div>
              <DialogTitle className="text-xl font-bold">
                Confirm {confirmDialog.type.charAt(0).toUpperCase() + confirmDialog.type.slice(1)}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Are you sure you want to <strong>{confirmDialog.type}</strong> registration for <strong>{confirmDialog.userName}</strong>?
              {confirmDialog.type === 'approve' && " This will grant them immediate access to the platform."}
              {confirmDialog.type === 'reject' && " They will be moved to the rejection list and won't be able to log in."}
              {confirmDialog.type === 'restore' && " This user will be moved back to the pending list for review."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-8 flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 ${
                confirmDialog.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' :
                confirmDialog.type === 'reject' ? 'bg-rose-600 hover:bg-rose-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={executeAction}
            >
              Confirm {confirmDialog.type.charAt(0).toUpperCase() + confirmDialog.type.slice(1)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── KYC Review Dialog ──────────────────────────── */}
      <Dialog open={isKycDialogOpen} onOpenChange={setIsKycDialogOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border gap-0 rounded-xl shadow-xl">
          <div className="bg-muted/30 border-b border-border p-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">KYC Documents Review</DialogTitle>
                  <DialogDescription>Verify uploaded identity and business documents</DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            {loadingKyc ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <RefreshCw className="w-8 h-8 animate-spin opacity-20" />
                <p className="text-sm">Fetching documents...</p>
              </div>
            ) : kycDocs.length === 0 ? (
              <div className="py-12 bg-muted/20 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ShieldAlert className="w-8 h-8 opacity-20" />
                <p className="text-sm font-medium">No KYC documents uploaded yet</p>
              </div>
            ) : (
              kycDocs.map((doc) => (
                <div key={doc.id} className="p-4 border border-border rounded-xl bg-card transition-all hover:border-primary/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                        {doc.doc_url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                          <img src={doc.doc_url} alt={doc.doc_type} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold uppercase tracking-tight">{doc.doc_type.replace(/_/g, " ")}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Uploaded on {formatDate(doc.uploaded_at)}</p>
                        <div className="mt-2">
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest ${
                            doc.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            doc.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs gap-1.5"
                        asChild
                      >
                        <a href={doc.doc_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                          View Document
                        </a>
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleReviewKyc(doc.id, "rejected")}
                          title="Reject Document"
                          disabled={doc.status === 'rejected'}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleReviewKyc(doc.id, "approved")}
                          title="Approve Document"
                          disabled={doc.status === 'approved'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {doc.review_note && (
                    <div className="mt-3 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground flex gap-2 italic">
                      <span className="font-semibold text-[10px] uppercase tracking-wider not-italic">Note:</span>
                      "{doc.review_note}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter className="bg-muted/30 border-t border-border p-4">
            <Button variant="ghost" size="sm" onClick={() => setIsKycDialogOpen(false)} className="w-full sm:w-auto">
              Close KYC Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** A reusable row for the detail dialog. */
function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  capitalize,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 border border-border">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{label}</p>
        <p className={`text-sm font-medium text-foreground truncate ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
