import { useState, useEffect, useCallback } from "react";
import { Users, TrendingUp, Clock, ArrowUpCircle, Search, Filter, Loader2, AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KPICard } from "@/components/KPICard";
import { 
  UsersLayout, 
  UsersKPIGrid, 
  UsersFilterBar, 
  UsersFilters, 
  UsersSearch 
} from "@/components/users/UsersLayout";
import { UserStatusBadge, InactivityBadge, UpgradeEligibleBadge } from "@/components/users/UserComponents";
import { userApi, EntryModeUser, EntryModeUsersResponse } from "@/lib/userApi";

export default function EntryModeUsers() {
  const [data, setData] = useState<EntryModeUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended" | "pending">("all");
  const [eligibilityFilter, setEligibilityFilter] = useState<"all" | "eligible" | "not-eligible">("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userApi.getEntryModeUsers();
      setData(res);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch entry mode users:", err);
      setError("Failed to load users data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <UsersLayout title="Entry Mode Users" description="Entry-level participants monitoring">
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading Entry Mode Users...</p>
        </div>
      </UsersLayout>
    );
  }

  if (error || !data) {
    return (
      <UsersLayout title="Entry Mode Users" description="Entry-level participants monitoring">
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div>
            <h2 className="text-xl font-bold">Data Access Error</h2>
            <p className="text-muted-foreground">{error || "Could not retrieve user list."}</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </UsersLayout>
    );
  }

  const { kpis, users } = data;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesEligibility = eligibilityFilter === "all" || 
      (eligibilityFilter === "eligible" && user.isUpgradeEligible) ||
      (eligibilityFilter === "not-eligible" && !user.isUpgradeEligible);
    
    return matchesSearch && matchesStatus && matchesEligibility;
  });

  const inactiveCount = users.filter(u => u.inactivityDays > 30).length;

  return (
    <UsersLayout
      title="Entry Mode Users"
      description="Entry-level participants monitoring and management"
    >
      {/* KPIs */}
      <UsersKPIGrid>
        <KPICard
          title="Entry Mode Users"
          value={kpis.totalUsers.toLocaleString()}
          icon={Users}
          variant="default"
        />
        <KPICard
          title="Active Users"
          value={kpis.activeUsers.toLocaleString()}
          icon={TrendingUp}
          variant="profit"
          subtitle="Active in last 30d"
        />
        <KPICard
          title="Total Earnings"
          value={`₹${(kpis.totalEarnings / 1000).toFixed(1)}K`}
          icon={TrendingUp}
          variant="profit"
        />
        <KPICard
          title="Upgrade Eligible"
          value={kpis.upgradeEligible.toLocaleString()}
          icon={ArrowUpCircle}
          variant="cap"
          subtitle="Target: ₹10K+"
        />
      </UsersKPIGrid>

      {/* Filters */}
      <UsersFilterBar>
        <UsersFilters>
          <UsersSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search name, phone or ID..."
          />
          
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
 
          <Select value={eligibilityFilter} onValueChange={(v) => setEligibilityFilter(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Upgrade Eligibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="eligible">Eligible for Upgrade</SelectItem>
              <SelectItem value="not-eligible">Not Eligible</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchData} title="Refresh data">
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </UsersFilters>
        
        {inactiveCount > 0 && (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="mr-1 h-3 w-3" />
            {inactiveCount} inactive users
          </Badge>
        )}
      </UsersFilterBar>

      {/* Data Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                User Name
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Referrer / Hub
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Earnings
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Activity Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Last Transaction
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground font-mono">
                        <span>{user.id}</span>
                        <span>•</span>
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">{user.referralSource}</p>
                      <p className="text-xs text-muted-foreground">{user.linkedHub || "No Hub Assigned"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-semibold text-foreground">
                      ₹{user.earnings.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <InactivityBadge days={user.inactivityDays} />
                      <UpgradeEligibleBadge eligible={user.isUpgradeEligible} />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {user.lastTransaction ? new Date(user.lastTransaction).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <Users className="h-8 w-8 opacity-20" />
                    <p>No entry mode users found matching your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </UsersLayout>
  );
}
