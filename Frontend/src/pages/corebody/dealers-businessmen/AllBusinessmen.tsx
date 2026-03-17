import { useMemo, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BusinessmanStatus = "Active" | "Inactive";
type ModeType = "Entry" | "Advance" | "Bulk" | "Stock Point";

type Businessman = {
  businessmanId: string;
  name: string;
  modeType: ModeType;
  associatedDealer: string;
  status: BusinessmanStatus;
  totalOrders: number;
  walletBalance: number;
  lastOrderDate: string;
};

const DISTRICT_NAME = "District North";
const ITEMS_PER_PAGE = 6;

const businessmenData: Businessman[] = [
  {
    businessmanId: "BSM-2001",
    name: "Rakesh Enterprise",
    modeType: "Entry",
    associatedDealer: "Arjun Traders",
    status: "Active",
    totalOrders: 83,
    walletBalance: 48200,
    lastOrderDate: "2026-02-21",
  },
  {
    businessmanId: "BSM-2002",
    name: "AgroKart Point",
    modeType: "Advance",
    associatedDealer: "Priya Agencies",
    status: "Active",
    totalOrders: 126,
    walletBalance: 71300,
    lastOrderDate: "2026-02-20",
  },
  {
    businessmanId: "BSM-2003",
    name: "Village Supply Hub",
    modeType: "Bulk",
    associatedDealer: "Mehta Supply",
    status: "Active",
    totalOrders: 174,
    walletBalance: 128900,
    lastOrderDate: "2026-02-22",
  },
  {
    businessmanId: "BSM-2004",
    name: "Kisan Connect",
    modeType: "Stock Point",
    associatedDealer: "-",
    status: "Inactive",
    totalOrders: 35,
    walletBalance: 9800,
    lastOrderDate: "2026-01-30",
  },
  {
    businessmanId: "BSM-2005",
    name: "Naman Agro Mart",
    modeType: "Entry",
    associatedDealer: "Sunrise Agro",
    status: "Active",
    totalOrders: 59,
    walletBalance: 37500,
    lastOrderDate: "2026-02-18",
  },
  {
    businessmanId: "BSM-2006",
    name: "FarmEdge Distributor",
    modeType: "Bulk",
    associatedDealer: "Green Valley Stores",
    status: "Inactive",
    totalOrders: 22,
    walletBalance: 6600,
    lastOrderDate: "2026-01-18",
  },
  {
    businessmanId: "BSM-2007",
    name: "AgriNova Desk",
    modeType: "Advance",
    associatedDealer: "Arjun Traders",
    status: "Active",
    totalOrders: 107,
    walletBalance: 51200,
    lastOrderDate: "2026-02-19",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export default function AllBusinessmen() {
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | ModeType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BusinessmanStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [selectedBusinessman, setSelectedBusinessman] = useState<Businessman | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return businessmenData.filter((entity) => {
      const matchesQuery = !q || entity.name.toLowerCase().includes(q) || entity.businessmanId.toLowerCase().includes(q);
      const matchesMode = modeFilter === "all" || entity.modeType === modeFilter;
      const matchesStatus = statusFilter === "all" || entity.status === statusFilter;
      return matchesQuery && matchesMode && matchesStatus;
    });
  }, [query, modeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const openProfile = (entity: Businessman) => {
    setSelectedBusinessman(entity);
    setProfileOpen(true);
  };

  const openOrders = (entity: Businessman) => {
    setSelectedBusinessman(entity);
    setOrdersOpen(true);
  };

  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel={`Core Body — ${DISTRICT_NAME}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">All Businessmen</h1>
          <p className="text-sm text-muted-foreground">
            District-scoped businessman operations with read-only wallet and order summaries.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2 lg:col-span-2">
              <Label>Search by Name / ID</Label>
              <Input
                placeholder="e.g. Rakesh or BSM-2001"
                value={query}
                onChange={(e) => {
                  setCurrentPage(1);
                  setQuery(e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Mode</Label>
              <Select
                value={modeFilter}
                onValueChange={(v: "all" | ModeType) => {
                  setCurrentPage(1);
                  setModeFilter(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Entry">Entry</SelectItem>
                  <SelectItem value="Advance">Advance</SelectItem>
                  <SelectItem value="Bulk">Bulk</SelectItem>
                  <SelectItem value="Stock Point">Stock Point</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v: "all" | BusinessmanStatus) => {
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Businessman List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Businessman ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mode Type</TableHead>
                    <TableHead>Associated Dealer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Wallet Balance (Summary)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((entity) => (
                    <TableRow key={entity.businessmanId}>
                      <TableCell className="font-mono text-xs">{entity.businessmanId}</TableCell>
                      <TableCell>{entity.name}</TableCell>
                      <TableCell>{entity.modeType}</TableCell>
                      <TableCell>{entity.associatedDealer}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            entity.status === "Active"
                              ? "border-green-500/40 text-green-600"
                              : "border-amber-500/40 text-amber-600"
                          }
                        >
                          {entity.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{entity.totalOrders}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(entity.walletBalance)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openProfile(entity)}>
                          View Profile
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openOrders(entity)}>
                          View Order Summary
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                        No businessman records match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {paginated.length} of {filtered.length} businessmen
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

        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Businessman Profile (Read-only)</DialogTitle>
              <DialogDescription>District-level profile details for monitoring only.</DialogDescription>
            </DialogHeader>
            {selectedBusinessman && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Businessman ID</span><span className="font-mono">{selectedBusinessman.businessmanId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{selectedBusinessman.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Mode Type</span><span>{selectedBusinessman.modeType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Associated Dealer</span><span>{selectedBusinessman.associatedDealer}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{selectedBusinessman.status}</span></div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={ordersOpen} onOpenChange={setOrdersOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Summary</DialogTitle>
              <DialogDescription>System-calculated summary without editable controls.</DialogDescription>
            </DialogHeader>
            {selectedBusinessman && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{selectedBusinessman.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Orders</span><span className="font-mono">{selectedBusinessman.totalOrders}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last Order Date</span><span className="font-mono">{selectedBusinessman.lastOrderDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Wallet (Summary)</span><span className="font-mono">{formatCurrency(selectedBusinessman.walletBalance)}</span></div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

