import { useState } from "react";
import { Warehouse, MapPin, Package, TrendingUp, AlertTriangle, Search, Pause, Play } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { 
  UsersLayout, 
  UsersKPIGrid, 
  UsersFilterBar, 
  UsersFilters, 
  UsersSearch,
  UsersActions
} from "@/components/users/UsersLayout";
import { UserStatusBadge, SLAScore, InventoryWarning } from "@/components/users/UserComponents";
import { UserConfirmationModal } from "@/components/users/UserConfirmationModal";
import { StockPoint, UserStatus, mockDistricts } from "@/types/users";

// Mock data
const mockStockPoints: StockPoint[] = [
  {
    id: "sp001",
    name: "Dhaka Central Warehouse",
    district: "Dhaka North",
    districtId: "d1",
    inventoryLevel: 15000,
    minInventoryThreshold: 5000,
    slaScore: 95,
    ordersFulfilled: 25000,
    status: "active",
    performanceTrend: "up",
    managerName: "Mr. Rahman",
    contactPhone: "+880 1234 567890",
    createdAt: "2023-06-15",
  },
  {
    id: "sp002",
    name: "Chittagong Hub",
    district: "Chittagong",
    districtId: "d2",
    inventoryLevel: 3500,
    minInventoryThreshold: 4000,
    slaScore: 88,
    ordersFulfilled: 18000,
    status: "active",
    performanceTrend: "stable",
    managerName: "Mr. Khan",
    contactPhone: "+880 2345 678901",
    createdAt: "2023-08-20",
  },
  {
    id: "sp003",
    name: "Sylhet Distribution Center",
    district: "Sylhet",
    districtId: "d3",
    inventoryLevel: 8000,
    minInventoryThreshold: 3000,
    slaScore: 92,
    ordersFulfilled: 12000,
    status: "active",
    performanceTrend: "up",
    managerName: "Mr. Ali",
    contactPhone: "+880 3456 789012",
    createdAt: "2023-09-10",
  },
  {
    id: "sp004",
    name: "Khulna Fulfillment Point",
    district: "Khulna",
    districtId: "d4",
    inventoryLevel: 1500,
    minInventoryThreshold: 3000,
    slaScore: 65,
    ordersFulfilled: 5500,
    status: "active",
    performanceTrend: "down",
    managerName: "Mr. Islam",
    contactPhone: "+880 4567 890123",
    createdAt: "2023-11-01",
  },
  {
    id: "sp005",
    name: "Barisal Storage Unit",
    district: "Barisal",
    districtId: "d5",
    inventoryLevel: 4200,
    minInventoryThreshold: 2000,
    slaScore: 78,
    ordersFulfilled: 8000,
    status: "inactive",
    performanceTrend: "stable",
    managerName: "Mr. Hossain",
    contactPhone: "+880 5678 901234",
    createdAt: "2024-01-05",
  },
  {
    id: "sp006",
    name: "Rangpur Northern Depot",
    district: "Rangpur",
    districtId: "d6",
    inventoryLevel: 6000,
    minInventoryThreshold: 2500,
    slaScore: 90,
    ordersFulfilled: 9500,
    status: "active",
    performanceTrend: "up",
    managerName: "Mr. Ahmed",
    contactPhone: "+880 6789 012345",
    createdAt: "2023-10-15",
  },
];

export default function StockPointList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
    variant: "default" | "danger" | "warning";
    stockPointName?: string;
  } | null>(null);

  // Calculate KPIs
  const totalStockPoints = mockStockPoints.length;
  const activeStockPoints = mockStockPoints.filter(s => s.status === "active").length;
  const totalOrders = mockStockPoints.reduce((sum, s) => sum + s.ordersFulfilled, 0);
  const averageSla = Math.round(mockStockPoints.reduce((sum, s) => sum + s.slaScore, 0) / totalStockPoints);
  const lowInventoryCount = mockStockPoints.filter(s => s.inventoryLevel <= s.minInventoryThreshold).length;

  // Filter stock points
  const filteredStockPoints = mockStockPoints.filter(sp => {
    const matchesSearch = sp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sp.managerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || sp.status === statusFilter;
    const matchesDistrict = districtFilter === "all" || sp.district === districtFilter;
    
    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const handleToggleStatus = (stockPoint: StockPoint) => {
    const newStatus = stockPoint.status === "active" ? "inactive" : "active";
    setConfirmModal({
      isOpen: true,
      title: newStatus === "active" ? "Activate Stock Point" : "Deactivate Stock Point",
      description: newStatus === "active" 
        ? `Are you sure you want to activate ${stockPoint.name}?`
        : `Are you sure you want to deactivate ${stockPoint.name}? This will affect order fulfillment.`,
      action: () => {
        console.log(`${newStatus === "active" ? "Activating" : "Deactivating"} stock point:`, stockPoint.id);
        setConfirmModal(null);
      },
      variant: newStatus === "active" ? "warning" : "danger",
      stockPointName: stockPoint.name,
    });
  };

  return (
    <UsersLayout
      title="Stock Point List"
      description="Fulfilment authority control and management"
    >
      {/* KPIs */}
      <UsersKPIGrid>
        <KPICard
          title="Total Stock Points"
          value={totalStockPoints.toLocaleString()}
          icon={Warehouse}
        />
        <KPICard
          title="Active Stock Points"
          value={activeStockPoints.toLocaleString()}
          icon={TrendingUp}
          variant="profit"
        />
        <KPICard
          title="Orders Fulfilled"
          value={(totalOrders / 1000).toFixed(1) + "K"}
          icon={Package}
          variant="trust"
        />
        <KPICard
          title="Avg SLA Score"
          value={`${averageSla}%`}
          icon={TrendingUp}
          variant="profit"
        />
      </UsersKPIGrid>

      {/* Low Inventory Warning */}
      {lowInventoryCount > 0 && (
        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">
              Low Inventory Alert
            </p>
            <p className="text-xs text-muted-foreground">
              {lowInventoryCount} stock points below minimum inventory threshold
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
            placeholder="Search by name, ID, or manager..."
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

          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {mockDistricts.map(district => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </UsersFilters>
      </UsersFilterBar>

      {/* Card + Table Hybrid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStockPoints.map((stockPoint) => (
          <Card key={stockPoint.id} className="hover:border-border/80 transition-colors">
            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{stockPoint.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{stockPoint.id}</p>
                </div>
                <UserStatusBadge status={stockPoint.status} />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">District</p>
                  <p className="flex items-center gap-1 text-foreground">
                    <MapPin className="h-3 w-3" />
                    {stockPoint.district}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Manager</p>
                  <p className="text-foreground">{stockPoint.managerName}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Inventory</p>
                  <p className="font-mono font-semibold text-foreground">
                    {stockPoint.inventoryLevel.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">SLA</p>
                  <SLAScore score={stockPoint.slaScore} showTrend={stockPoint.performanceTrend} />
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
                  <p className="font-mono font-semibold text-foreground">
                    {(stockPoint.ordersFulfilled / 1000).toFixed(1)}K
                  </p>
                </div>
              </div>

              {/* Warning & Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <InventoryWarning 
                  level={stockPoint.inventoryLevel} 
                  threshold={stockPoint.minInventoryThreshold} 
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggleStatus(stockPoint)}
                  className={stockPoint.status === "active" ? "text-warning hover:text-warning" : "text-profit hover:text-profit"}
                >
                  {stockPoint.status === "active" ? (
                    <>
                      <Pause className="mr-1 h-3.5 w-3.5" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-3.5 w-3.5" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
          sensitiveAction={confirmModal.variant === "danger"}
        />
      )}
    </UsersLayout>
  );
}
