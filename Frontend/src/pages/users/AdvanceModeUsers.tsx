import { useState } from "react";
import { Users, Wallet, TrendingUp, AlertTriangle, History, Search, ChevronRight, X } from "lucide-react";
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
import { UserStatusBadge, OverExposureBadge } from "@/components/users/UserComponents";
import { AdvanceModeUser, AdvanceHistory, UserStatus } from "@/types/users";
import { cn } from "@/lib/utils";

// Mock data
const mockAdvanceUsers: AdvanceModeUser[] = [
  {
    id: "am001",
    name: "Ahmed Trading Co.",
    advanceAmount: 50000,
    marginPercent: 15,
    activeProducts: 45,
    earnings: 125000,
    status: "active",
    isOverExposed: false,
    advanceHistory: [
      { id: "ah1", amount: 20000, date: "2024-02-01", type: "issued" },
      { id: "ah2", amount: 20000, date: "2024-02-10", type: "settled" },
      { id: "ah3", amount: 30000, date: "2024-02-15", type: "issued" },
    ],
  },
  {
    id: "am002",
    name: "Islam Stores",
    advanceAmount: 35000,
    marginPercent: 12,
    activeProducts: 28,
    earnings: 85000,
    status: "active",
    isOverExposed: true,
    advanceHistory: [
      { id: "ah4", amount: 40000, date: "2024-01-20", type: "issued" },
      { id: "ah5", amount: 5000, date: "2024-02-01", type: "adjusted" },
    ],
  },
  {
    id: "am003",
    name: "New Age Commerce",
    advanceAmount: 75000,
    marginPercent: 18,
    activeProducts: 62,
    earnings: 210000,
    status: "active",
    isOverExposed: false,
    advanceHistory: [
      { id: "ah6", amount: 75000, date: "2024-02-05", type: "issued" },
    ],
  },
  {
    id: "am004",
    name: "Premium Traders",
    advanceAmount: 120000,
    marginPercent: 20,
    activeProducts: 85,
    earnings: 320000,
    status: "active",
    isOverExposed: true,
    advanceHistory: [
      { id: "ah7", amount: 100000, date: "2024-01-15", type: "issued" },
      { id: "ah8", amount: 20000, date: "2024-02-01", type: "adjusted" },
    ],
  },
  {
    id: "am005",
    name: "Business Solutions Ltd",
    advanceAmount: 25000,
    marginPercent: 10,
    activeProducts: 15,
    earnings: 45000,
    status: "inactive",
    isOverExposed: false,
    advanceHistory: [
      { id: "ah9", amount: 25000, date: "2024-01-10", type: "issued" },
      { id: "ah10", amount: 25000, date: "2024-01-25", type: "settled" },
    ],
  },
];

export default function AdvanceModeUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<AdvanceModeUser | null>(null);

  // Calculate KPIs
  const totalAdvanceUsers = mockAdvanceUsers.length;
  const activeAdvanceUsers = mockAdvanceUsers.filter(u => u.status === "active").length;
  const totalAdvanceAmount = mockAdvanceUsers.reduce((sum, u) => sum + u.advanceAmount, 0);
  const totalEarnings = mockAdvanceUsers.reduce((sum, u) => sum + u.earnings, 0);
  const overExposedCount = mockAdvanceUsers.filter(u => u.isOverExposed).length;

  // Filter users
  const filteredUsers = mockAdvanceUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getHistoryTypeColor = (type: AdvanceHistory["type"]) => {
    switch (type) {
      case "issued": return "bg-blue-500/10 text-blue-400";
      case "settled": return "bg-profit/10 text-profit";
      case "adjusted": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <UsersLayout
      title="Advance Mode Users"
      description="Advance-based sellers control and monitoring"
    >
      {/* KPIs */}
      <UsersKPIGrid>
        <KPICard
          title="Advance Users"
          value={totalAdvanceUsers.toLocaleString()}
          icon={Users}
        />
        <KPICard
          title="Active Users"
          value={activeAdvanceUsers.toLocaleString()}
          icon={TrendingUp}
          variant="profit"
        />
        <KPICard
          title="Total Advance"
          value={`₹${(totalAdvanceAmount / 100000).toFixed(2)}L`}
          icon={Wallet}
          variant="warning"
        />
        <KPICard
          title="Total Earnings"
          value={`₹${(totalEarnings / 100000).toFixed(2)}L`}
          icon={TrendingUp}
          variant="profit"
        />
      </UsersKPIGrid>

      {/* Over-exposure Warning */}
      {overExposedCount > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Over-exposure Warning
            </p>
            <p className="text-xs text-muted-foreground">
              {overExposedCount} users have advance amounts exceeding safe limits
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <UsersFilterBar>
        <UsersFilters>
          <UsersSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or ID..."
          />
          
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus | "all")}>
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
        </UsersFilters>
      </UsersFilterBar>

      {/* Table + Detail Drawer Layout */}
      <div className="flex gap-4">
        {/* Main Table */}
        <div className={cn(
          "flex-1 rounded-lg border border-border bg-card transition-colors duration-300",
          selectedUser && "max-w-[70%]"
        )}>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  User Name
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Advance Amount
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Margin %
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Products
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Earnings
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow 
                  key={user.id} 
                  className={cn(
                    "border-border hover:bg-muted/50 cursor-pointer",
                    selectedUser?.id === user.id && "bg-muted"
                  )}
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        ₹{user.advanceAmount.toLocaleString()}
                      </span>
                      <OverExposureBadge isOverExposed={user.isOverExposed} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-semibold text-foreground">
                      {user.marginPercent}%
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {user.activeProducts}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-semibold text-profit">
                      ₹{user.earnings.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Detail Drawer */}
        {selectedUser && (
          <div className="w-[30%] min-w-[300px] rounded-lg border border-border bg-card p-4 space-y-4 animate-slide-in">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">User Details</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                <p className="font-medium text-foreground">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">ID</p>
                <p className="font-mono text-sm text-foreground">{selectedUser.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Advance</p>
                  <p className="font-mono font-semibold text-foreground">
                    ₹{selectedUser.advanceAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Earnings</p>
                  <p className="font-mono font-semibold text-profit">
                    ₹{selectedUser.earnings.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Advance vs Earning Comparison */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Advance vs Earnings</p>
                <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                  <div 
                    className="h-full bg-warning"
                    style={{ width: `${Math.min((selectedUser.advanceAmount / selectedUser.earnings) * 100, 100)}%` }}
                  />
                  <div 
                    className="h-full bg-profit"
                    style={{ width: `${100 - Math.min((selectedUser.advanceAmount / selectedUser.earnings) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-warning">Advance</span>
                  <span className="text-profit">Earnings</span>
                </div>
              </div>
            </div>

            {/* Advance History - Read Only */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Advance History</p>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {selectedUser.advanceHistory.map((history) => (
                  <div 
                    key={history.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={getHistoryTypeColor(history.type)}>
                        {history.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{history.date}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-foreground">
                      ₹{history.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </UsersLayout>
  );
}
