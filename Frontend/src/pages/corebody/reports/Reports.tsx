import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Calendar } from "lucide-react";
import { navItems } from "@/pages/CoreBodyDashboard";
import { DataTable } from "@/components/DataTable";

const earningsData = [
  { date: "2024-05-15", source: "B2B Commission", amount: "₹12,400", capImpact: "4.96%", wallet: "Main" },
  { date: "2024-05-14", source: "Referral Bonus", amount: "₹8,200", capImpact: "3.28%", wallet: "Referral" },
  { date: "2024-05-13", source: "B2B Commission", amount: "₹15,600", capImpact: "6.24%", wallet: "Main" },
  { date: "2024-05-12", source: "Stock Point Share", amount: "₹9,800", capImpact: "3.92%", wallet: "Main" },
  { date: "2024-05-11", source: "B2B Commission", amount: "₹11,200", capImpact: "4.48%", wallet: "Main" },
];

const stockMovementData = [
  { product: "Product A - SKU001", issued: "500", returned: "20", net: "+480", date: "2024-05-15" },
  { product: "Product B - SKU002", issued: "300", returned: "15", net: "+285", date: "2024-05-14" },
  { product: "Product C - SKU003", issued: "200", returned: "50", net: "+150", date: "2024-05-13" },
  { product: "Product D - SKU004", issued: "450", returned: "10", net: "+440", date: "2024-05-12" },
  { product: "Product E - SKU005", issued: "350", returned: "25", net: "+325", date: "2024-05-11" },
];

const orderData = [
  { orderId: "ORD-2024-1523", type: "B2B", status: "Completed", value: "₹45,200", date: "2024-05-15" },
  { orderId: "ORD-2024-1522", type: "Internal", status: "Completed", value: "₹32,800", date: "2024-05-14" },
  { orderId: "ORD-2024-1521", type: "B2B", status: "Processing", value: "₹58,400", date: "2024-05-13" },
  { orderId: "ORD-2024-1520", type: "B2B", status: "Completed", value: "₹41,600", date: "2024-05-12" },
  { orderId: "ORD-2024-1519", type: "Internal", status: "Completed", value: "₹28,900", date: "2024-05-11" },
];

const dealerPerformanceData = [
  { dealer: "Arjun Traders", orders: "45", volume: "₹1,84,200", sla: "92%", status: "Active" },
  { dealer: "Priya Agencies", orders: "32", volume: "₹1,28,400", sla: "88%", status: "Active" },
  { dealer: "Mehta Supply", orders: "58", volume: "₹2,12,800", sla: "85%", status: "Active" },
  { dealer: "Kumar Dist.", orders: "12", volume: "₹48,600", sla: "76%", status: "Warning" },
  { dealer: "Singh & Co", orders: "0", volume: "₹0", sla: "—", status: "Inactive" },
];

export default function Reports() {
  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — District North">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">View and export district-level reports</p>
        </div>

        {/* Common Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Date Range</label>
                <div className="flex gap-2">
                  <Input type="date" className="text-xs" defaultValue="2024-05-01" />
                  <Input type="date" className="text-xs" defaultValue="2024-05-15" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Dealer / Businessman</label>
                <Select defaultValue="all">
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="arjun">Arjun Traders</SelectItem>
                    <SelectItem value="priya">Priya Agencies</SelectItem>
                    <SelectItem value="mehta">Mehta Supply</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Order Type</label>
                <Select defaultValue="all">
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="b2b">B2B</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">&nbsp;</label>
                <Button className="w-full text-xs">Apply Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Earnings Report</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: "Date", accessor: "date", className: "font-mono text-xs" },
                { header: "Source", accessor: "source" },
                { header: "Amount", accessor: "amount", className: "font-mono font-medium" },
                { header: "Cap Impact", accessor: "capImpact", className: "font-mono text-xs" },
                { header: "Wallet Type", accessor: "wallet" },
              ]}
              data={earningsData}
            />
            <div className="mt-4 p-3 rounded-md bg-muted flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Earnings (Period)</span>
              <span className="font-mono font-bold text-lg">₹57,200</span>
            </div>
          </CardContent>
        </Card>

        {/* Stock Movement Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Stock Movement Report</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: "Product", accessor: "product" },
                { header: "Issued Qty", accessor: "issued", className: "font-mono text-xs" },
                { header: "Returned Qty", accessor: "returned", className: "font-mono text-xs" },
                { header: "Net Movement", accessor: (row) => (
                  <span className={`font-mono font-medium ${row.net.startsWith('+') ? 'text-profit' : 'text-destructive'}`}>
                    {row.net}
                  </span>
                )},
                { header: "Date", accessor: "date", className: "font-mono text-xs" },
              ]}
              data={stockMovementData}
            />
          </CardContent>
        </Card>

        {/* Order Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Order Report</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: "Order ID", accessor: "orderId", className: "font-mono text-xs" },
                { header: "Type", accessor: (row) => (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    row.type === 'B2B' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    {row.type}
                  </span>
                )},
                { header: "Status", accessor: (row) => (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    row.status === 'Completed' ? 'bg-profit/10 text-profit' : 'bg-warning/10 text-warning'
                  }`}>
                    {row.status}
                  </span>
                )},
                { header: "Value", accessor: "value", className: "font-mono font-medium" },
                { header: "Date", accessor: "date", className: "font-mono text-xs" },
              ]}
              data={orderData}
            />
          </CardContent>
        </Card>

        {/* Dealer Performance Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Dealer Performance Report</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: "Dealer Name", accessor: "dealer" },
                { header: "Orders Handled", accessor: "orders", className: "font-mono text-xs" },
                { header: "Volume", accessor: "volume", className: "font-mono font-medium" },
                { header: "SLA Score", accessor: (row) => (
                  <span className={`font-mono font-medium ${
                    row.sla === '—' ? 'text-muted-foreground' :
                    parseInt(row.sla) >= 90 ? 'text-profit' :
                    parseInt(row.sla) >= 80 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {row.sla}
                  </span>
                )},
                { header: "Status", accessor: (row) => (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    row.status === 'Active' ? 'bg-profit/10 text-profit' :
                    row.status === 'Warning' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {row.status}
                  </span>
                )},
              ]}
              data={dealerPerformanceData}
            />
            <div className="mt-4 p-3 rounded-md bg-muted text-xs text-muted-foreground">
              ℹ️ Performance metrics are informational only. No ranking or gamification applied.
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
