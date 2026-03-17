import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { CapProgressBar } from "@/components/CapProgressBar";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Package, Users, Wallet, TrendingUp, ArrowUpDown,
  DollarSign, UserCheck, AlertCircle, BarChart3, Clock, PackageCheck,
  History, RotateCcw, UserPlus, BarChart2, ShoppingBag, CheckCircle,
  Truck, AlertTriangle, CreditCard, BookOpen, TrendingDown, Award,
  CheckSquare, FileText, Download, Bell, ShieldAlert, UserX, Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

import { getCoreBodyFlatNavItems } from "@/config/coreBodySidebarConfig";

export const navItems = getCoreBodyFlatNavItems("A");

const earningsData = [
  { week: "W1", earnings: 8200 },
  { week: "W2", earnings: 12400 },
  { week: "W3", earnings: 9800 },
  { week: "W4", earnings: 15600 },
  { week: "W5", earnings: 11200 },
  { week: "W6", earnings: 18400 },
];

const todayActivity = [
  { time: "10:45 AM", action: "Stock issued to Arjun Traders", type: "stock" },
  { time: "11:20 AM", action: "New order from Priya Agencies", type: "order" },
  { time: "02:15 PM", action: "Cap warning triggered", type: "alert" },
  { time: "03:30 PM", action: "Dealer performance review completed", type: "review" },
];

const dealers = [
  { name: "Arjun Traders", zone: "Zone A", orders: 45, revenue: "₹1.8L", status: "active" as const },
  { name: "Priya Agencies", zone: "Zone B", orders: 32, revenue: "₹1.2L", status: "active" as const },
  { name: "Kumar Dist.", zone: "Zone A", orders: 12, revenue: "₹48K", status: "warning" as const },
  { name: "Singh & Co", zone: "Zone C", orders: 0, revenue: "₹0", status: "inactive" as const },
  { name: "Mehta Supply", zone: "Zone B", orders: 58, revenue: "₹2.1L", status: "cap-reached" as const },
];

export default function CoreBodyDashboard() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.full_name || 'Core Body');
  }, []);

  return (
    <DashboardLayout role="corebody" navItems={navItems as any} roleLabel="Core Body — District North">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Good Morning, {userName} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's your business summary for today</p>
        </div>

        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">District</span>
                <span className="font-medium">North</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Core Body Type</span>
                <span className="font-medium">Type A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Since</span>
                <span className="font-medium">Jan 2024</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                Earnings vs Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current</span>
                  <span className="font-mono font-medium">₹1,84,200</span>
                </div>
                <CapProgressBar current={184200} max={250000} label="Monthly Cap" />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Cap Limit</span>
                  <span className="font-mono">₹2,50,000</span>
                </div>
                <Badge variant="secondary" className="w-full justify-center text-xs">73.7% utilized</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Active Network
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dealers</span>
                <span className="font-medium">12 / 15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Businessmen</span>
                <span className="font-medium">45 / 50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Network</span>
                <span className="font-medium">57</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground shrink-0">{item.time}</span>
                    <span className="text-foreground line-clamp-1">{item.action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Earnings" value="₹1,84,200" change="+18.2%" changeType="positive" icon={DollarSign} variant="profit" />
          <KPICard title="Active Dealers" value="12" icon={UserCheck} variant="cap" subtitle="3 inactive" />
          <KPICard title="Businessmen" value="45" change="+4" changeType="positive" icon={Users} />
          <KPICard title="Pending Orders" value="23" icon={Package} variant="warning" />
        </div>

        {/* Cap Progress + Chart */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 space-y-5">
            <h3 className="text-sm font-semibold text-card-foreground">Cap & Limits</h3>
            <CapProgressBar current={184200} max={250000} label="Monthly Earnings Cap" />
            <CapProgressBar current={45} max={50} label="Businessman Slots" />
            <CapProgressBar current={12} max={15} label="Active Dealer Limit" />
            <div className="mt-4 rounded-md bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">Upgrade Eligibility</p>
              <p className="text-sm font-semibold text-profit mt-1">✓ Eligible for Tier 2 upgrade</p>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Weekly Earnings Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 15%, 18%)" />
                <XAxis dataKey="week" stroke="hsl(215, 15%, 55%)" fontSize={11} />
                <YAxis stroke="hsl(215, 15%, 55%)" fontSize={11} tickFormatter={(v) => `₹${v/1000}K`} />
                <Tooltip contentStyle={{ background: "hsl(224, 25%, 10%)", border: "1px solid hsl(224, 15%, 18%)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="earnings" stroke="hsl(192, 91%, 50%)" strokeWidth={2.5} dot={{ fill: "hsl(192, 91%, 50%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dealers Table */}
        <DataTable
          title="Dealers & Businessmen"
          columns={[
            { header: "Name", accessor: "name" },
            { header: "Zone", accessor: "zone" },
            { header: "Orders", accessor: (row) => <span className="font-mono">{String(row.orders)}</span> },
            { header: "Revenue", accessor: "revenue", className: "font-mono" },
            { header: "Status", accessor: (row) => <StatusBadge status={row.status as any} /> },
          ]}
          data={dealers}
        />
      </div>
    </DashboardLayout>
  );
}
