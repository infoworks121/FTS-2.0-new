import { useState } from "react";
import { Users, TrendingUp, Clock, ArrowUpCircle, Search, Filter } from "lucide-react";
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
import { EntryModeUser } from "@/types/users";

// Mock data
const mockEntryUsers: EntryModeUser[] = [
  {
    id: "eu001",
    name: "New Trader Bangladesh",
    referralSource: "Ahmed Trading Co.",
    earnings: 15000,
    status: "active",
    lastTransaction: "2024-02-18",
    isUpgradeEligible: true,
    inactivityDays: 5,
  },
  {
    id: "eu002",
    name: "Local Shop Owner",
    referralSource: "Rahim Enterprise",
    earnings: 8500,
    status: "active",
    lastTransaction: "2024-02-15",
    isUpgradeEligible: true,
    inactivityDays: 12,
  },
  {
    id: "eu003",
    name: "Small Retailer",
    referralSource: "Khan Wholesale",
    earnings: 5200,
    status: "active",
    lastTransaction: "2024-02-10",
    isUpgradeEligible: false,
    inactivityDays: 25,
  },
  {
    id: "eu004",
    name: "Street Vendor",
    referralSource: "Direct",
    earnings: 3200,
    status: "inactive",
    lastTransaction: "2024-01-20",
    isUpgradeEligible: false,
    inactivityDays: 45,
  },
  {
    id: "eu005",
    name: "Home Business",
    referralSource: "Islam Stores",
    earnings: 12000,
    status: "active",
    lastTransaction: "2024-02-17",
    isUpgradeEligible: true,
    inactivityDays: 3,
  },
  {
    id: "eu006",
    name: "Part Time Seller",
    referralSource: "Hossain Industries",
    earnings: 2800,
    status: "active",
    lastTransaction: "2024-02-12",
    isUpgradeEligible: false,
    inactivityDays: 18,
  },
  {
    id: "eu007",
    name: "Newbie Trader",
    referralSource: "Ali & Sons",
    earnings: 1500,
    status: "suspended",
    lastTransaction: "2024-01-05",
    isUpgradeEligible: false,
    inactivityDays: 65,
  },
];

export default function EntryModeUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [eligibilityFilter, setEligibilityFilter] = useState<"all" | "eligible" | "not-eligible">("all");

  // Calculate KPIs
  const totalEntryUsers = mockEntryUsers.length;
  const activeEntryUsers = mockEntryUsers.filter(u => u.status === "active").length;
  const totalEarnings = mockEntryUsers.reduce((sum, u) => sum + u.earnings, 0);
  const upgradeEligible = mockEntryUsers.filter(u => u.isUpgradeEligible && u.status === "active").length;
  const inactiveUsers = mockEntryUsers.filter(u => u.inactivityDays > 30).length;

  // Filter users
  const filteredUsers = mockEntryUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesEligibility = eligibilityFilter === "all" || 
      (eligibilityFilter === "eligible" && user.isUpgradeEligible) ||
      (eligibilityFilter === "not-eligible" && !user.isUpgradeEligible);
    
    return matchesSearch && matchesStatus && matchesEligibility;
  });

  return (
    <UsersLayout
      title="Entry Mode Users"
      description="Entry-level participants monitoring and management"
    >
      {/* KPIs - Low risk visual styling */}
      <UsersKPIGrid>
        <KPICard
          title="Entry Mode Users"
          value={totalEntryUsers.toLocaleString()}
          icon={Users}
          change="+5%"
          changeType="positive"
        />
        <KPICard
          title="Active Users"
          value={activeEntryUsers.toLocaleString()}
          icon={TrendingUp}
          variant="profit"
        />
        <KPICard
          title="Total Earnings"
          value={`₹${(totalEarnings / 1000).toFixed(1)}K`}
          icon={TrendingUp}
          variant="profit"
        />
        <KPICard
          title="Upgrade Eligible"
          value={upgradeEligible.toLocaleString()}
          icon={ArrowUpCircle}
          variant="default"
        />
      </UsersKPIGrid>

      {/* Filters */}
      <UsersFilterBar>
        <UsersFilters>
          <UsersSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or ID..."
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
        </UsersFilters>
        
        {inactiveUsers > 0 && (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="mr-1 h-3 w-3" />
            {inactiveUsers} inactive users
          </Badge>
        )}
      </UsersFilterBar>

      {/* Data Table - Simplified view */}
      <div className="rounded-lg border border-border bg-card transition-colors duration-300">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                User Name
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Referral Source
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
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.referralSource}
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
                <TableCell className="text-sm text-muted-foreground">
                  {user.lastTransaction}
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </UsersLayout>
  );
}
