import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { navItems } from "@/pages/CoreBodyDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DealerStatus = "Active" | "Inactive";

type Dealer = {
  dealerId: string;
  dealerName: string;
  categorySpecialization: string;
  joinedDate: string;
  currentStatus: DealerStatus;
  totalOrdersHandled: number;
  currentMonthVolume: number;
  lastActivityDate: string;
};

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 6;

const dealersData: Dealer[] = [
  {
    dealerId: "DLR-1001",
    dealerName: "Arjun Traders",
    categorySpecialization: "Seeds",
    joinedDate: "2024-01-12",
    currentStatus: "Active",
    totalOrdersHandled: 186,
    currentMonthVolume: 342000,
    lastActivityDate: "2026-02-21",
  },
  {
    dealerId: "DLR-1002",
    dealerName: "Priya Agencies",
    categorySpecialization: "Fertilizer",
    joinedDate: "2024-03-08",
    currentStatus: "Active",
    totalOrdersHandled: 142,
    currentMonthVolume: 287500,
    lastActivityDate: "2026-02-20",
  },
  {
    dealerId: "DLR-1003",
    dealerName: "Kumar Distribution",
    categorySpecialization: "Equipment",
    joinedDate: "2024-02-01",
    currentStatus: "Inactive",
    totalOrdersHandled: 61,
    currentMonthVolume: 0,
    lastActivityDate: "2026-01-28",
  },
  {
    dealerId: "DLR-1004",
    dealerName: "Mehta Supply",
    categorySpecialization: "Pesticides",
    joinedDate: "2024-05-22",
    currentStatus: "Active",
    totalOrdersHandled: 214,
    currentMonthVolume: 396200,
    lastActivityDate: "2026-02-22",
  },
  {
    dealerId: "DLR-1005",
    dealerName: "Singh & Co",
    categorySpecialization: "Mixed Agri Inputs",
    joinedDate: "2024-07-14",
    currentStatus: "Inactive",
    totalOrdersHandled: 27,
    currentMonthVolume: 0,
    lastActivityDate: "2026-01-19",
  },
  {
    dealerId: "DLR-1006",
    dealerName: "Sunrise Agro",
    categorySpecialization: "Seeds",
    joinedDate: "2024-09-05",
    currentStatus: "Active",
    totalOrdersHandled: 95,
    currentMonthVolume: 174000,
    lastActivityDate: "2026-02-18",
  },
  {
    dealerId: "DLR-1007",
    dealerName: "Green Valley Stores",
    categorySpecialization: "Fertilizer",
    joinedDate: "2024-10-10",
    currentStatus: "Active",
    totalOrdersHandled: 119,
    currentMonthVolume: 221300,
    lastActivityDate: "2026-02-19",
  },
  {
    dealerId: "DLR-1008",
    dealerName: "Rural Connect",
    categorySpecialization: "Equipment",
    joinedDate: "2025-01-20",
    currentStatus: "Inactive",
    totalOrdersHandled: 13,
    currentMonthVolume: 0,
    lastActivityDate: "2026-01-11",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export function AllDealersContent({ data }: { data?: any[] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DealerStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const actualData = data || dealersData;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actualData.filter((dealer) => {
      const matchesQuery = !q || dealer.dealerName.toLowerCase().includes(q) || dealer.dealerId.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || dealer.currentStatus === statusFilter;
      const joinedAt = new Date(dealer.joinedDate).getTime();
      const matchesFrom = !fromDate || joinedAt >= new Date(fromDate).getTime();
      const matchesTo = !toDate || joinedAt <= new Date(toDate).getTime();

      return matchesQuery && matchesStatus && matchesFrom && matchesTo;
    });
  }, [query, statusFilter, fromDate, toDate, actualData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const openProfile = (dealer: Dealer) => {
    navigate(`/corebody/directory/dealers/${dealer.dealerId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">All Dealers</h1>
        <p className="text-sm text-muted-foreground">
          District-scoped dealer directory for monitoring activity and operational health.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2 lg:col-span-2">
            <Label>Search by Dealer Name / ID</Label>
            <Input
              placeholder="e.g. Arjun or DLR-1001"
              value={query}
              onChange={(e) => {
                setCurrentPage(1);
                setQuery(e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v: "all" | DealerStatus) => {
                setCurrentPage(1);
                setStatusFilter(v);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Joined (From)</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setCurrentPage(1);
                setFromDate(e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Date Joined (To)</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setCurrentPage(1);
                setToDate(e.target.value);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dealer List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Category Specialization</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Total Orders Handled</TableHead>
                  <TableHead>Current Month Volume</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((dealer) => (
                  <TableRow key={dealer.dealerId}>
                    <TableCell>{dealer.dealerName}</TableCell>
                    <TableCell>{dealer.district || "—"}</TableCell>
                    <TableCell>{dealer.categorySpecialization}</TableCell>
                    <TableCell className="font-mono text-xs">{dealer.joinedDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          dealer.currentStatus === "Active"
                            ? "border-green-500/40 text-green-600"
                            : "border-amber-500/40 text-amber-600"
                        }
                      >
                        {dealer.currentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{dealer.totalOrdersHandled}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(dealer.currentMonthVolume)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="icon" variant="outline" title="View Profile" onClick={() => openProfile(dealer)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      No dealer records match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {paginated.length} of {filtered.length} dealers
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">Page {safePage} of {totalPages}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AllDealers() {
  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <AllDealersContent />
    </DashboardLayout>
  );
}

