import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { 
  useMemo, 
  useState, 
  useEffect,
  useCallback 
} from "react";
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
  UsersRound,
  Warehouse,
  Receipt,
  ShieldCheck,
  History,
  Fingerprint,
  Ban,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Bell,
  Activity,
  UserCheck,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { sidebarNavItems } from "@/config/sidebarConfig";
import { adminApi, AdminDashboardStats } from "@/lib/adminApi";

// Static fallbacks removed - handled in state initialization or fetching logic



export default function AdminDashboard() {
  const { theme } = useTheme();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.full_name || 'Admin');

    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchAlerts = async () => {
      try {
        const data = await adminApi.getLowStockAlerts(5);
        if (data && data.alerts) {
          setLowStockAlerts(data.alerts);
        }
      } catch (err) {
        console.error("Failed to load low stock alerts", err);
      }
    };
    
    fetchStats();
    fetchAlerts();
  }, []);
  
  // Theme-aware chart colors
  const chartColors = useMemo(() => {
    const isDark = theme === "dark";
    return {
      profit: "hsl(152, 69%, 46%)",
      profitGradient: isDark ? "hsl(152, 69%, 46%)" : "hsl(152, 69%, 40%)",
      trust: "hsl(239, 84%, 67%)",
      trustGradient: isDark ? "hsl(239, 84%, 67%)" : "hsl(239, 84%, 55%)",
      cap: isDark ? "hsl(192, 91%, 50%)" : "hsl(192, 91%, 40%)",
      grid: isDark ? "hsl(224, 15%, 18%)" : "hsl(220, 13%, 85%)",
      axis: isDark ? "hsl(215, 15%, 55%)" : "hsl(220, 10%, 40%)",
      tooltipBg: isDark ? "hsl(224, 25%, 10%)" : "hsl(0, 0%, 100%)",
      tooltipBorder: isDark ? "hsl(224, 15%, 18%)" : "hsl(220, 13%, 85%)",
    };
  }, [theme]);

  return (
    <DashboardLayout role="admin" navItems={sidebarNavItems as NavItem[]} roleLabel="Super Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Good Morning, {userName} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's your business summary for today</p>
        </div>

        {/* Low Stock Warning Banner */}
        {lowStockAlerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-4 shadow-sm dark:bg-red-500/10 dark:border-red-500/50">
            <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-800 dark:text-red-400 uppercase tracking-wide">Action Required: Low Stock Detected</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                You have <strong>{lowStockAlerts.length}</strong> items that have fallen below the critical threshold (5 units).
                <br />
                <span className="text-xs opacity-80 mt-1 block">
                  Affected: {lowStockAlerts.slice(0, 3).map(a => `${a.product_name} (${a.quantity_on_hand})`).join(', ')}
                  {lowStockAlerts.length > 3 && ` ...and ${lowStockAlerts.length - 3} more.`}
                </span>
              </p>
            </div>
            <Button variant="outline" size="sm" className="bg-white border-red-200 text-red-700 hover:bg-red-50 dark:bg-red-950 dark:border-red-800 dark:text-red-400" onClick={() => window.location.href = '/admin/products'}>
              Manage Inventory
            </Button>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard 
            title="Total Revenue" 
            value={isLoading ? "Loading..." : `₹${(parseFloat(stats?.kpis?.total_revenue?.toString() || '0') / 100000).toFixed(1)}L`} 
            change="+12.3%" 
            changeType="positive" 
            icon={TrendingUp} 
            variant="profit" 
          />
          <KPICard 
            title="Trust Fund" 
            value={isLoading ? "Loading..." : `₹${(parseFloat(stats?.kpis?.trust_fund?.toString() || '0') / 100000).toFixed(1)}L`} 
            change="+5.1%" 
            changeType="positive" 
            icon={DollarSign} 
            variant="trust" 
            subtitle="Reserve: ₹2.1L" 
          />
          <KPICard 
            title="Active Districts" 
            value={isLoading ? "Loading..." : `${stats?.kpis?.active_districts || 0} / 20`} 
            icon={Building2} 
            variant="cap" 
            subtitle="Live coverage" 
          />
          <KPICard 
            title="Fraud Alerts" 
            value={isLoading ? "Loading..." : (stats?.kpis?.fraud_alerts || 0).toString()} 
            change={stats?.kpis?.fraud_alerts && stats.kpis.fraud_alerts > 0 ? "+"+stats.kpis.fraud_alerts : "0"} 
            changeType="negative" 
            icon={ShieldAlert} 
            variant="warning" 
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 transition-colors duration-300">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Profit Flow</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats?.profitData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.profitGradient} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.profitGradient} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.trustGradient} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.trustGradient} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="month" stroke={chartColors.axis} fontSize={11} />
                <YAxis stroke={chartColors.axis} fontSize={11} tickFormatter={(v) => `₹${v/1000}K`} />
                <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 12, color: theme === 'dark' ? '#fff' : '#000' }} />
                <Area type="monotone" dataKey="revenue" stroke={chartColors.profit} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="trust" stroke={chartColors.trust} fill="url(#colorTrust)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 transition-colors duration-300">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">District Activity</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.districtData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" stroke={chartColors.axis} fontSize={11} />
                <YAxis stroke={chartColors.axis} fontSize={11} />
                <Tooltip contentStyle={{ background: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: 8, fontSize: 12, color: theme === 'dark' ? '#fff' : '#000' }} />
                <Bar dataKey="orders" fill={chartColors.cap} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Table */}
        <DataTable
          title="Recent Transactions"
          columns={[
            { header: "ID", accessor: "id", className: "font-mono text-xs" },
            { header: "Type", accessor: "type" },
            { header: "User", accessor: "user" },
            { header: "Amount", accessor: "amount", className: "font-mono" },
            { header: "Status", accessor: (row) => <StatusBadge status={row.status as any} /> },
            { header: "Time", accessor: "time", className: "text-muted-foreground text-xs" },
          ]}
          data={stats?.recentActivity || []}
        />
      </div>
    </DashboardLayout>
  );
}
