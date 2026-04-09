import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Wallet, TrendingUp, Activity, Download, Pause, Play, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { KPICard } from "@/components/KPICard";
import {
  UsersLayout, UsersKPIGrid, UsersFilterBar, UsersFilters, UsersSearch, UsersActions
} from "@/components/users/UsersLayout";
import { ModeBadge, UserStatusBadge } from "@/components/users/UserComponents";
import { UserConfirmationModal } from "@/components/users/UserConfirmationModal";
import { UserMode, UserStatus } from "@/types/users";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface BusinessmanRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  mode: UserMode;
  type: string;
  district: string;
  district_id: string;
  status: UserStatus;
  total_earnings: number;
  created_at: string;
}

interface KPIs {
  total: string;
  active: string;
  total_earnings: string;
}

export default function AllBusinessmen() {
  const navigate = useNavigate();
  const [businessmen, setBusinessmen] = useState<BusinessmanRow[]>([]);
  const [kpis, setKpis] = useState<KPIs>({ total: "0", active: "0", total_earnings: "0" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<UserMode | "all">("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: "default" | "danger" | "warning";
    userName?: string;
  } | null>(null);

  const fetchBusinessmen = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (modeFilter !== "all") params.append("mode", modeFilter);
      if (districtFilter !== "all") params.append("district", districtFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`${API_BASE}/admin/businessmen?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch businessmen");

      const data = await res.json();
      setBusinessmen(data.businessmen);
      setKpis(data.kpis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessmen();
  }, [searchQuery, modeFilter, districtFilter, statusFilter]);

  // Unique districts from fetched data
  const districts = [...new Set(businessmen.map((b) => b.district).filter(Boolean))];

  const handleSuspend = (user: BusinessmanRow) => {
    setConfirmModal({
      isOpen: true,
      title: "Suspend User",
      description: `Are you sure you want to suspend ${user.name}? They will lose access immediately.`,
      action: () => { console.log("Suspending:", user.id); setConfirmModal(null); },
      variant: "danger",
      userName: user.name,
    });
  };

  const handleActivate = (user: BusinessmanRow) => {
    setConfirmModal({
      isOpen: true,
      title: "Activate User",
      description: `Are you sure you want to activate ${user.name}?`,
      action: () => { console.log("Activating:", user.id); setConfirmModal(null); },
      variant: "warning",
      userName: user.name,
    });
  };

  const handleBulkSuspend = () => {
    setConfirmModal({
      isOpen: true,
      title: "Bulk Suspend Users",
      description: `Suspend ${selectedUsers.length} selected users?`,
      action: () => { setSelectedUsers([]); setConfirmModal(null); },
      variant: "danger",
    });
  };

  const handleBulkActivate = () => {
    setConfirmModal({
      isOpen: true,
      title: "Bulk Activate Users",
      description: `Activate ${selectedUsers.length} selected users?`,
      action: () => { setSelectedUsers([]); setConfirmModal(null); },
      variant: "warning",
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllSelection = () => {
    setSelectedUsers(
      selectedUsers.length === businessmen.length ? [] : businessmen.map((b) => b.id)
    );
  };

  return (
    <UsersLayout
      title="All Businessmen"
      description="Master list of all business participants in the platform"
      actions={
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      }
    >
      {/* KPIs */}
      <UsersKPIGrid>
        <KPICard title="Total Businessmen" value={Number(kpis.total).toLocaleString()} icon={Users} change="+12%" changeType="positive" />
        <KPICard title="Active Businessmen" value={Number(kpis.active).toLocaleString()} icon={Activity} variant="profit" change="+8%" changeType="positive" />
        <KPICard title="Total Earnings" value={`₹${(Number(kpis.total_earnings || 0) / 100000).toFixed(2)}L`} icon={TrendingUp} variant="profit" change="+15%" changeType="positive" />
      </UsersKPIGrid>

      {/* Filters */}
      <UsersFilterBar>
        <UsersFilters>
          <UsersSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, ID, or email..." />

          <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as UserMode | "all")}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Modes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="entry">Entry</SelectItem>
              <SelectItem value="advance">Advance</SelectItem>
              <SelectItem value="bulk">Bulk</SelectItem>
            </SelectContent>
          </Select>

          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Districts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus | "all")}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </UsersFilters>

        {selectedUsers.length > 0 && (
          <UsersActions>
            <Badge variant="secondary" className="mr-2">{selectedUsers.length} selected</Badge>
            <Button variant="outline" size="sm" onClick={handleBulkActivate}><Play className="mr-1 h-3.5 w-3.5" />Activate</Button>
            <Button variant="outline" size="sm" onClick={handleBulkSuspend}><Pause className="mr-1 h-3.5 w-3.5" />Suspend</Button>
          </UsersActions>
        )}
      </UsersFilterBar>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card transition-colors duration-300">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <input type="checkbox"
                    checked={selectedUsers.length === businessmen.length && businessmen.length > 0}
                    onChange={toggleAllSelection}
                    className="h-4 w-4 rounded border-border"
                  />
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name & ID</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Mode</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">District</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Earnings</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businessmen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No businessmen found</TableCell>
                </TableRow>
              ) : businessmen.map((b) => (
                <TableRow key={b.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <input type="checkbox"
                      checked={selectedUsers.includes(b.id)}
                      onChange={() => toggleUserSelection(b.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{b.id}</p>
                    </div>
                  </TableCell>
                  <TableCell><ModeBadge mode={b.mode} /></TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px] font-bold border-slate-200">
                      {b.type?.replace('_', ' ') || 'Businessman'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{b.district || "—"}</TableCell>
                  <TableCell>
                    <span className="font-mono font-semibold text-foreground">
                      ₹{Number(b.total_earnings || 0).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell><UserStatusBadge status={b.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/users/businessmen/${b.id}/settings`)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      {b.status === "active" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleSuspend(b)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-profit hover:text-profit" onClick={() => handleActivate(b)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {confirmModal && (
        <UserConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
          sensitiveAction={confirmModal.variant === "danger"}
        />
      )}
    </UsersLayout>
  );
}
