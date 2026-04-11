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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const openUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const fetchPendingUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await api.get("/admin/pending-users");
      setPendingUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      toast({ title: "Error", description: "Failed to fetch pending users", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to approve user", variant: "destructive" });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await api.delete(`/admin/reject-user/${userId}`);
      toast({ title: "Success", description: "User rejected and removed" });
      fetchPendingUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Reject error:", error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to reject user", variant: "destructive" });
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
    else users = businessmanUsers;

    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u: any) =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.district_name?.toLowerCase().includes(q)
    );
  }, [pendingUsers, activeTab, searchQuery]);

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
          onClick={() => fetchPendingUsers(true)}
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
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Registered</TableHead>
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
                      <span className="text-xs text-muted-foreground tabular-nums">{formatDate(user.created_at)}</span>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                          onClick={() => handleApprove(user.id)}
                          title="Approve"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          onClick={() => handleReject(user.id)}
                          title="Reject"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
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
              <span className="font-semibold text-foreground">{pendingUsers.length}</span> pending requests
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
              <Button
                variant="outline"
                size="sm"
                className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-500/10 gap-1.5"
                onClick={() => {
                  handleReject(selectedUser.id);
                }}
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 gap-1.5 shadow-sm"
                onClick={() => {
                  handleApprove(selectedUser.id);
                }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve User
              </Button>
            </div>
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
