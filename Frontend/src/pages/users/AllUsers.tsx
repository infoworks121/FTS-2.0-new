import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Activity, Download, Eye, Settings, ShieldCheck, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { KPICard } from "@/components/KPICard";
import {
  UsersLayout, UsersKPIGrid, UsersFilterBar, UsersFilters, UsersSearch
} from "@/components/users/UsersLayout";
import { UserStatusBadge } from "@/components/users/UserComponents";
import { UserStatus } from "@/types/users";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  role_name: string;
  status: UserStatus;
  is_sph: boolean;
  created_at: string;
}

interface KPIs {
  total: number;
  active: number;
  pending: number;
  sph_active: number;
}

export default function AllUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [kpis, setKpis] = useState<KPIs>({ total: 0, active: 0, pending: 0, sph_active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.users);
      setKpis(data.kpis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const handleToggleSPH = async (userId: string, currentStatus: boolean) => {
    setTogglingId(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/users/${userId}/is-sph`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ is_sph: !currentStatus })
      });

      if (!res.ok) throw new Error("Failed to update SPH status");

      // Optimistic update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_sph: !currentStatus } : u));
      toast.success(`SPH status ${!currentStatus ? 'enabled' : 'disabled'} for user`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleNavigateToSettings = (user: UserRow) => {
    if (user.role === 'businessman' || user.role === 'stock_point') {
        navigate(`/admin/users/businessmen/${user.id}/settings`);
    } else if (user.role === 'corebody') {
        navigate(`/admin/corebody/${user.id}`);
    } else {
        // Fallback or generic user view If implemented
        // navigate(`/admin/users/${user.id}`); 
    }
  };

  return (
    <UsersLayout
      title="User Directory"
      description="Comprehensive list of all platform participants and administrative roles"
      actions={
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      }
    >
      {/* KPIs */}
      <UsersKPIGrid>
        <KPICard title="Total Users" value={kpis.total.toLocaleString()} icon={Users} change="+5%" changeType="positive" />
        <KPICard title="Active Accounts" value={kpis.active.toLocaleString()} icon={Activity} variant="profit" />
        <KPICard title="SPH Verified" value={kpis.sph_active.toLocaleString()} icon={ShieldCheck} variant="warning" />
      </UsersKPIGrid>

      {/* Filters */}
      <UsersFilterBar>
        <UsersFilters>
          <UsersSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, ID, phone..." />

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="businessman">Businessman</SelectItem>
              <SelectItem value="corebody">Core Body</SelectItem>
              <SelectItem value="stock_point">Stock Point</SelectItem>
              <SelectItem value="retailer">Retailer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </UsersFilters>
      </UsersFilterBar>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            <span>Synchronizing user data...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-destructive">{error}</div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground pl-6">Identifier</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">User Name</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Role / Designation</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Verification</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">SPH Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">No matching users found in the directory</TableCell>
                </TableRow>
              ) : users.map((u) => (
                <TableRow key={u.id} className="border-border hover:bg-muted/20 group h-16">
                  <TableCell className="pl-6">
                    <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded">#{u.id.substring(0, 8)}...</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">{u.name}</span>
                      <span className="text-[10px] text-muted-foreground">{u.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/5 rounded-md text-primary">
                        <UserIcon className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium capitalize">{u.role_name || u.role}</span>
                    </div>
                  </TableCell>
                  <TableCell><UserStatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Switch 
                        checked={u.is_sph} 
                        disabled={togglingId === u.id}
                        onCheckedChange={() => handleToggleSPH(u.id, u.is_sph)}
                      />
                      {u.is_sph && (
                        <span className="text-[9px] font-bold text-emerald-600 uppercase">Active</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleNavigateToSettings(u)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </UsersLayout>
  );
}
