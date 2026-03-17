import { DashboardLayout, NavItem } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { useMemo, useState, useEffect } from "react";
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

const profitData = [
  { month: "Jan", revenue: 420000, commission: 38000, trust: 15000 },
  { month: "Feb", revenue: 510000, commission: 45000, trust: 18000 },
  { month: "Mar", revenue: 490000, commission: 42000, trust: 17000 },
  { month: "Apr", revenue: 620000, commission: 55000, trust: 22000 },
  { month: "May", revenue: 580000, commission: 51000, trust: 20000 },
  { month: "Jun", revenue: 710000, commission: 63000, trust: 25000 },
];

const districtData = [
  { name: "North", businessmen: 45, orders: 1230, revenue: "₹4.2L" },
  { name: "South", businessmen: 38, orders: 980, revenue: "₹3.5L" },
  { name: "East", businessmen: 52, orders: 1450, revenue: "₹5.1L" },
  { name: "West", businessmen: 41, orders: 1100, revenue: "₹3.9L" },
];

const recentActivity = [
  { id: "TXN-4521", type: "Withdrawal", user: "Ramesh K.", amount: "₹15,000", status: "pending" as const, time: "2 min ago" },
  { id: "TXN-4520", type: "Commission", user: "District North", amount: "₹8,200", status: "active" as const, time: "15 min ago" },
  { id: "TXN-4519", type: "Fraud Alert", user: "Unknown", amount: "₹52,000", status: "warning" as const, time: "1 hr ago" },
  { id: "TXN-4518", type: "Order", user: "Suresh M.", amount: "₹3,400", status: "active" as const, time: "2 hr ago" },
  { id: "TXN-4517", type: "Suspension", user: "Dealer X", amount: "—", status: "suspended" as const, time: "3 hr ago" },
];



export default function AdminDashboard() {
  const { theme } = useTheme();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.full_name || 'Admin');
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

        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Revenue" value="₹27.1L" change="+12.3%" changeType="positive" icon={TrendingUp} variant="profit" />
          <KPICard title="Trust Fund" value="₹4.8L" change="+5.1%" changeType="positive" icon={DollarSign} variant="trust" subtitle="Reserve: ₹2.1L" />
          <KPICard title="Active Districts" value="18 / 20" icon={Building2} variant="cap" subtitle="2 slots available" />
          <KPICard title="Fraud Alerts" value="3" change="+2" changeType="negative" icon={AlertTriangle} variant="warning" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 transition-colors duration-300">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Profit Flow</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={profitData}>
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
              <BarChart data={districtData}>
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
          data={recentActivity}
        />
      </div>
    </DashboardLayout>
  );
}
