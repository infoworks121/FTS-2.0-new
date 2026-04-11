import { useState, useEffect, useCallback } from "react";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickFilterChip, CoreBodyTypeBadge, StatCard } from "@/components/districts";
import { useTheme } from "@/hooks/useTheme";
import { Link } from "react-router-dom";
import { coreBodyApi, CoreBodySummary } from "@/lib/coreBodyApi";
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
  Filter,
  Download,
  MoreVertical,
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
  Loader2,
} from "lucide-react";


export default function CoreBodyList() {
  const { theme } = useTheme();
  const [coreBodies, setCoreBodies] = useState<CoreBodySummary[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await coreBodyApi.getAllCoreBodies({
        type: typeFilter,
        status: statusFilter
      });
      setCoreBodies(data.coreBodies);
      setKpis(data.kpis);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch core bodies:", err);
      setError("Failed to load core bodies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Table columns
  const columns = [
    {
      header: "Core Body Name",
      accessor: (row: CoreBodySummary) => (
        <div>
          <Link 
            to={`/admin/corebody/${row.type.toLowerCase()}?id=${row.id}`}
            className="font-semibold text-card-foreground hover:text-primary hover:underline"
          >
            {row.name}
          </Link>
          <p className="text-xs text-muted-foreground">{row.id}</p>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row: CoreBodySummary) => <CoreBodyTypeBadge type={row.type} />,
    },
    {
      header: "District",
      accessor: (row: CoreBodySummary) => (
        <Link 
          to={`/admin/districts/performance?id=${row.district_id}`}
          className="text-sm hover:text-primary"
        >
          {row.district}
        </Link>
      ),
    },
    {
      header: "Investment",
      accessor: (row: CoreBodySummary) => (
        <span className="font-mono text-sm">₹{row.investment_amount.toLocaleString()}</span>
      ),
    },
    {
      header: "Earnings (YTD)",
      accessor: (row: CoreBodySummary) => (
        <span className="font-mono text-sm font-semibold text-profit">
          ₹{row.ytd_earnings.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Cap Usage",
      accessor: (row: CoreBodySummary) => (
        <div className="w-24">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">{row.cap_usage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.cap_usage >= 100 ? "bg-destructive" :
                row.cap_usage >= 80 ? "bg-warning" : "bg-cap"
              }`}
              style={{ width: `${row.cap_usage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: CoreBodySummary) => <StatusBadge status={row.status} />,
    },
    {
      header: "Action",
      accessor: (row: CoreBodySummary) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/admin/corebody/${row.type.toLowerCase()}?id=${row.id}`}>
              <MoreVertical className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  if (loading && coreBodies.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Synchronizing Core Body Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Core Body List</h1>
            <p className="text-sm text-muted-foreground">
              Master list of all district authorities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Core Bodies"
              value={kpis.total_core_bodies.toString()}
              icon={Users}
              variant="default"
              subtitle={`Type A: ${kpis.type_a}, Type B: ${kpis.type_b}`}
            />
            <KPICard
              title="Active Hubs"
              value={kpis.active.toString()}
              icon={TrendingUp}
              variant="profit"
              subtitle="Currently operational"
            />
            <KPICard
              title="Total Investment"
              value={`₹${(kpis.total_investment / 100000).toFixed(1)}L`}
              icon={DollarSign}
              variant="default"
              subtitle="System total"
            />
            <KPICard
              title="Total Earnings (YTD)"
              value={`₹${(kpis.total_earnings / 100000).toFixed(1)}L`}
              icon={TrendingUp}
              variant="profit"
              subtitle="Hub total performance"
            />
          </div>
        )}

        {/* Quick Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Operational Filters</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fetchList()}>
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <QuickFilterChip 
                label="All Hubs" 
                active={typeFilter === null && statusFilter === null} 
                count={coreBodies.length}
                onClick={() => { setTypeFilter(null); setStatusFilter(null); }}
              />
              <div className="w-px h-8 bg-border mx-2" />
              <QuickFilterChip 
                label="Type A" 
                active={typeFilter === "A"}
                onClick={() => setTypeFilter(typeFilter === "A" ? null : "A")}
              />
              <QuickFilterChip 
                label="Type B" 
                active={typeFilter === "B"}
                onClick={() => setTypeFilter(typeFilter === "B" ? null : "B")}
              />
              <div className="w-px h-8 bg-border mx-2" />
              <QuickFilterChip 
                label="Active" 
                active={statusFilter === "active"}
                onClick={() => setStatusFilter(statusFilter === "active" ? null : "active")}
              />
              <QuickFilterChip 
                label="Inactive" 
                active={statusFilter === "inactive"}
                onClick={() => setStatusFilter(statusFilter === "inactive" ? null : "inactive")}
              />
              <QuickFilterChip 
                label="Cap Warning" 
                active={statusFilter === "warning"}
                onClick={() => setStatusFilter(statusFilter === "warning" ? null : "warning")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <DataTable 
          columns={columns as any} 
          data={coreBodies as any}
          title={`Core Bodies (${coreBodies.length})`}
        />

        {/* Bottom Performance Grid */}
        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Avg Invest (A)" value="₹1.0L" />
            <StatCard title="Avg Invest (B)" value="₹0.5L" />
            <StatCard title="Cap Alerts" value={kpis.cap_warning.toString()} trend={kpis.cap_warning > 0 ? "down" : "up"} trendValue="Action Req" />
            <StatCard title="System Integrity" value="100%" subtitle="Verified" />
          </div>
        )}
      </div>
  );
}
