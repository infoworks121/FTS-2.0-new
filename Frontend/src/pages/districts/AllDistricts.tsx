import { useState, useEffect } from "react";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickFilterChip, CapacityBar, StatCard } from "@/components/districts";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";
import { geographyApi, DistrictSummary } from "@/lib/geographyApi";
import {
  LayoutDashboard,
  Package,
  Percent,
  MapPin,
  Users,
  Wallet,
  ShoppingCart,
  ShieldAlert,
  FileText,
  Settings,
  TrendingUp,
  DollarSign,
  Building2,
  AlertTriangle,
  BarChart3,
  Plus,
  Eye,
  Pencil,
  Filter,
  Download,
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
  Loader2,
} from "lucide-react";


export default function AllDistricts() {
  const { theme } = useTheme();
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = (await geographyApi.getDistrictsSummary()) as any;
        setDistricts(data.districts);
        setKpiData(data.kpiData);
        setError(null);
      } catch (err) {
        console.error("Failed to load district summary:", err);
        setError("Failed to load districts. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Get unique states
  const states = [...new Set(districts.map(d => d.state_name))];

  // Filter data based on selected filters
  const filteredData = districts.filter(d => {
    const status = d.current_count >= d.max_limit ? "warning" : d.is_active ? "active" : "inactive";
    if (statusFilter && status !== statusFilter) return false;
    if (stateFilter && d.state_name !== stateFilter) return false;
    return true;
  });

  // Count by status for filters
  const activeCount = districts.filter(d => d.is_active && d.current_count < d.max_limit).length;
  const warningCount = districts.filter(d => d.current_count >= d.max_limit).length;
  const inactiveCount = districts.filter(d => !d.is_active).length;

  const columns = [
    {
      header: "District Name",
      accessor: (row: DistrictSummary) => (
        <div>
          <Link 
            to={`/admin/districts/performance?id=${row.id}`}
            className="font-semibold text-card-foreground hover:text-primary hover:underline"
          >
            {row.name} {row.code && <span className="text-xs font-normal text-muted-foreground ml-1">({row.code})</span>}
          </Link>
          <p className="text-xs text-muted-foreground">ID: {row.id}</p>
        </div>
      ),
    },
    {
      header: "State",
      accessor: (row: DistrictSummary) => row.state_name,
    },
    {
      header: "Core Bodies (A / B)",
      accessor: (row: DistrictSummary) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            A: {row.core_body_count_a}
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            B: {row.core_body_count_b}
          </Badge>
        </div>
      ),
    },
    {
      header: "Capacity",
      accessor: (row: DistrictSummary) => (
        <CapacityBar 
          used={row.current_count} 
          max={row.max_limit}
          showLabel={false}
          size="sm"
        />
      ),
    },
    {
      header: "Total Orders",
      accessor: (row: DistrictSummary) => (
        <span className="font-mono text-sm">{row.total_orders.toLocaleString()}</span>
      ),
    },
    {
      header: "Total Revenue",
      accessor: (row: DistrictSummary) => (
        <span className="font-mono text-sm font-semibold">₹{(row.total_revenue / 100000).toFixed(1)}L</span>
      ),
    },
    {
      header: "Status",
      accessor: (row: DistrictSummary) => {
        const districtStatus = row.current_count >= row.max_limit ? "warning" : row.is_active ? "active" : "inactive";
        return <StatusBadge status={districtStatus} />;
      },
    },
    {
      header: "Action",
      accessor: (row: DistrictSummary) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild title="View Performance">
            <Link to={`/admin/districts/performance?id=${row.id}`}>
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild title="Edit District">
            <Link to={`/admin/districts/manage?id=${row.id}`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading Strategic Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">District Management</h1>
            <p className="text-sm text-muted-foreground">
              Strategic oversight across territorial distribution hubs
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/districts/manage">
              <Plus className="h-4 w-4 mr-2" />
              Add District
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Districts"
            value={kpiData?.totalDistricts?.toString() || "0"}
            icon={MapPin}
            variant="default"
            subtitle={`Active: ${kpiData?.activeDistricts || 0}`}
          />
          <KPICard
            title="Total Core Bodies"
            value={kpiData?.totalCoreBodies?.toString() || "0"}
            icon={Users}
            variant="cap"
            subtitle="Across all districts"
          />
          <KPICard
            title="Total Revenue"
            value={`₹${(kpiData?.totalRevenue / 10000000).toFixed(2)}Cr`}
            icon={DollarSign}
            variant="profit"
            subtitle="System Total"
          />
          <KPICard
            title="Avg Orders/District"
            value={parseInt(kpiData?.avgOrdersPerDistrict || 0).toLocaleString()}
            icon={ShoppingCart}
            variant="default"
            subtitle="Overall performance"
          />
        </div>

        {/* Strategic Controls */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Strategic Filters</CardTitle>
                <p className="text-xs text-muted-foreground">Isolate hubs by state or operational status</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  Advanced
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <QuickFilterChip 
                label="All Hubs" 
                active={statusFilter === null} 
                count={districts.length}
                onClick={() => setStatusFilter(null)}
              />
              <QuickFilterChip 
                label="Active" 
                active={statusFilter === "active"} 
                count={activeCount}
                onClick={() => setStatusFilter("active")}
              />
              <QuickFilterChip 
                label="At Capacity" 
                active={statusFilter === "warning"} 
                count={warningCount}
                onClick={() => setStatusFilter("warning")}
              />
              <QuickFilterChip 
                label="Inactive" 
                active={statusFilter === "inactive"} 
                count={inactiveCount}
                onClick={() => setStatusFilter("inactive")}
              />
              <div className="w-px h-8 bg-border mx-2" />
              {states.map(state => (
                <QuickFilterChip 
                  key={state}
                  label={state} 
                  active={stateFilter === state}
                  onClick={() => setStateFilter(stateFilter === state ? null : state)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hubs Table */}
        <DataTable 
          columns={columns as any} 
          data={filteredData as any}
          title={`Distribution Hubs (${filteredData.length})`}
        />

        {/* Strategic Performance Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard title="Policy Limit" value="20" subtitle="Max CB/Hub" />
          <StatCard title="Slot Avail." value={((kpiData?.totalDistricts || 0) * 20 - (kpiData?.totalCoreBodies || 0)).toString()} subtitle="System vacancy" />
          <StatCard title="Core Body A" value={districts.reduce((s,d) => s + d.core_body_count_a, 0).toString()} trend="up" trendValue="Growth" />
          <StatCard title="Core Body B" value={districts.reduce((s,d) => s + d.core_body_count_b, 0).toString()} trend="up" trendValue="Growth" />
          <StatCard title="Yield/Hub" value={`₹${((kpiData?.totalRevenue || 0) / (kpiData?.totalDistricts || 1) / 10000000).toFixed(2)}Cr`} trend="up" trendValue="Target" />
          <StatCard title="Integrity" value="98%" subtitle="Audit-grade" />
        </div>
      </div>
  );
}
