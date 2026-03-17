import { useState } from "react";
import { Users, TrendingUp, DollarSign, Star, Search, CheckCircle, XCircle, Clock } from "lucide-react";
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
import { UserStatusBadge, NegotiationStatusBadge, RiskBadge } from "@/components/users/UserComponents";
import { UserConfirmationModal } from "@/components/users/UserConfirmationModal";
import { BulkUser, UserStatus } from "@/types/users";

// Mock data
const mockBulkUsers: BulkUser[] = [
  {
    id: "bu001",
    businessName: "Khan Wholesale",
    contactPerson: "Mr. Khan",
    negotiationStatus: "approved",
    approvedMargin: 25,
    monthlyVolume: 5000000,
    slaRating: 95,
    status: "active",
    isAdminApproved: true,
    riskLevel: "low",
    negotiationHistory: [
      { id: "n1", date: "2024-02-01", requestedMargin: 25, approvedMargin: 25, status: "approved" },
    ],
  },
  {
    id: "bu002",
    businessName: "Hossain Industries",
    contactPerson: "Mr. Hossain",
    negotiationStatus: "pending",
    approvedMargin: 20,
    monthlyVolume: 3500000,
    slaRating: 88,
    status: "active",
    isAdminApproved: false,
    riskLevel: "medium",
    negotiationHistory: [
      { id: "n2", date: "2024-02-10", requestedMargin: 22, approvedMargin: 20, status: "approved", notes: "Partial approval" },
      { id: "n3", date: "2024-02-15", requestedMargin: 25, approvedMargin: 20, status: "pending" },
    ],
  },
  {
    id: "bu003",
    businessName: "Premium Trading Co.",
    contactPerson: "Mr. Rahman",
    negotiationStatus: "negotiating",
    approvedMargin: 18,
    monthlyVolume: 2800000,
    slaRating: 72,
    status: "active",
    isAdminApproved: true,
    riskLevel: "high",
    negotiationHistory: [
      { id: "n4", date: "2024-02-05", requestedMargin: 30, approvedMargin: 18, status: "rejected", notes: "Volume too low" },
      { id: "n5", date: "2024-02-12", requestedMargin: 25, approvedMargin: 18, status: "rejected" },
      { id: "n6", date: "2024-02-18", requestedMargin: 22, approvedMargin: 18, status: "pending" },
    ],
  },
  {
    id: "bu004",
    businessName: "City Distributors",
    contactPerson: "Mr. Ali",
    negotiationStatus: "approved",
    approvedMargin: 22,
    monthlyVolume: 4200000,
    slaRating: 91,
    status: "active",
    isAdminApproved: true,
    riskLevel: "low",
    negotiationHistory: [],
  },
  {
    id: "bu005",
    businessName: "Regional Supplies",
    contactPerson: "Mr. Islam",
    negotiationStatus: "rejected",
    approvedMargin: 15,
    monthlyVolume: 1500000,
    slaRating: 65,
    status: "inactive",
    isAdminApproved: false,
    riskLevel: "high",
    negotiationHistory: [
      { id: "n7", date: "2024-01-20", requestedMargin: 28, approvedMargin: 15, status: "rejected", notes: "Compliance issues" },
    ],
  },
];

export default function BulkUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [negotiationFilter, setNegotiationFilter] = useState<"all" | "pending" | "approved" | "rejected" | "negotiating">("all");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: "default" | "danger" | "warning";
  } | null>(null);

  // Calculate KPIs
  const totalBulkUsers = mockBulkUsers.length;
  const activeBulkUsers = mockBulkUsers.filter(u => u.status === "active").length;
  const totalVolume = mockBulkUsers.reduce((sum, u) => sum + u.monthlyVolume, 0);
  const averageSla = Math.round(mockBulkUsers.reduce((sum, u) => sum + u.slaRating, 0) / totalBulkUsers);
  const pendingApprovals = mockBulkUsers.filter(u => !u.isAdminApproved && u.negotiationStatus === "pending").length;
  const highRiskCount = mockBulkUsers.filter(u => u.riskLevel === "high").length;

  // Filter users
  const filteredUsers = mockBulkUsers.filter(user => {
    const matchesSearch = user.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesNegotiation = negotiationFilter === "all" || user.negotiationStatus === negotiationFilter;
    
    return matchesSearch && matchesStatus && matchesNegotiation;
  });

  const handleApprove = (user: BulkUser) => {
    setConfirmModal({
      isOpen: true,
      title: "Approve User",
      description: `Are you sure you want to approve ${user.businessName} for bulk trading? This grants them access to high-volume trade features.`,
      action: () => {
        console.log("Approving user:", user.id);
        setConfirmModal(null);
      },
      variant: "warning",
    });
  };

  return (
    <UsersLayout
      title="Bulk Users"
      description="High-volume trade participants management"
    >
      {/* KPIs */}
      <UsersKPIGrid>
        <KPICard
          title="Bulk Users"
          value={totalBulkUsers.toLocaleString()}
          icon={Users}
        />
        <KPICard
          title="Active Users"
          value={activeBulkUsers.toLocaleString()}
          icon={TrendingUp}
          variant="profit"
        />
        <KPICard
          title="Monthly Volume"
          value={`₹${(totalVolume / 10000000).toFixed(2)}Cr`}
          icon={DollarSign}
          variant="trust"
        />
        <KPICard
          title="Avg SLA Rating"
          value={`${averageSla}%`}
          icon={Star}
          variant="profit"
        />
      </UsersKPIGrid>

      {/* Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingApprovals > 0 && (
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning">
                Pending Approvals
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingApprovals} users awaiting admin approval
              </p>
            </div>
          </div>
        )}
        
        {highRiskCount > 0 && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">
                High Risk Users
              </p>
              <p className="text-xs text-muted-foreground">
                {highRiskCount} users flagged as high risk
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <UsersFilterBar>
        <UsersFilters>
          <UsersSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, ID, or contact..."
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

          <Select value={negotiationFilter} onValueChange={(v) => setNegotiationFilter(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Negotiation Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="negotiating">Negotiating</SelectItem>
            </SelectContent>
          </Select>
        </UsersFilters>
      </UsersFilterBar>

      {/* Data Table - Data Dense */}
      <div className="rounded-lg border border-border bg-card transition-colors duration-300">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Business Name
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Contact
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Negotiation Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Approved Margin
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Volume
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                SLA Rating
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Risk
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Admin
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{user.businessName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.contactPerson}
                </TableCell>
                <TableCell>
                  <NegotiationStatusBadge status={user.negotiationStatus} />
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold text-foreground">
                    {user.approvedMargin}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-semibold text-foreground">
                    ₹{(user.monthlyVolume / 100000).toFixed(1)}L
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className={`h-3.5 w-3.5 ${user.slaRating >= 90 ? 'text-profit' : user.slaRating >= 70 ? 'text-warning' : 'text-destructive'}`} />
                    <span className="font-mono font-semibold text-foreground">
                      {user.slaRating}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <RiskBadge level={user.riskLevel} />
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell>
                  {user.isAdminApproved ? (
                    <CheckCircle className="h-5 w-5 text-profit" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-warning" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleApprove(user)}
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <UserConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          description={confirmModal.description}
          variant={confirmModal.variant}
        />
      )}
    </UsersLayout>
  );
}
