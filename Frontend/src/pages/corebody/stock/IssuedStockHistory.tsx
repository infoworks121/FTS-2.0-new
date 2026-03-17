import { DashboardLayout } from "@/components/DashboardLayout";
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
import { DataTable } from "@/components/DataTable";
import { Download } from "lucide-react";
import { navItems } from "@/pages/CoreBodyDashboard";

const issueHistoryRows = [
  {
    issueId: "ISS-240215-001",
    date: "2026-02-15",
    recipient: "Arjun Traders",
    product: "Hybrid Rice Seed",
    quantity: "120 Bag",
    status: "Issued",
  },
  {
    issueId: "ISS-240214-007",
    date: "2026-02-14",
    recipient: "Priya Agencies",
    product: "NPK 20:20:20",
    quantity: "70 Sack",
    status: "Adjusted",
  },
  {
    issueId: "ISS-240213-004",
    date: "2026-02-13",
    recipient: "Mehta Supply",
    product: "Bio Shield",
    quantity: "50 Bottle",
    status: "Returned",
  },
  {
    issueId: "ISS-240211-009",
    date: "2026-02-11",
    recipient: "Arjun Traders",
    product: "Sprayer Pump",
    quantity: "12 Piece",
    status: "Issued",
  },
];

export default function IssuedStockHistory() {
  return (
    <DashboardLayout role="corebody" navItems={navItems} roleLabel="Core Body — District North">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Issued Stock History</h1>
          <p className="text-sm text-muted-foreground">
            Read-only stock issuance log for district operations, ledger review, and audit traceability.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filter Bar</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input type="date" defaultValue="2026-02-01" />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input type="date" defaultValue="2026-02-22" />
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="hybrid-rice-seed">Hybrid Rice Seed</SelectItem>
                  <SelectItem value="npk">NPK 20:20:20</SelectItem>
                  <SelectItem value="bio-shield">Bio Shield</SelectItem>
                  <SelectItem value="sprayer-pump">Sprayer Pump</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipients</SelectItem>
                  <SelectItem value="arjun-traders">Arjun Traders</SelectItem>
                  <SelectItem value="priya-agencies">Priya Agencies</SelectItem>
                  <SelectItem value="mehta-supply">Mehta Supply</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Issue Status</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="adjusted">Adjusted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Issued Stock Data</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { header: "Issue ID", accessor: "issueId", className: "font-mono text-xs" },
                { header: "Date", accessor: "date", className: "font-mono text-xs" },
                { header: "Recipient", accessor: "recipient" },
                { header: "Product", accessor: "product" },
                { header: "Quantity", accessor: "quantity", className: "font-mono text-xs" },
                {
                  header: "Current Status",
                  accessor: (row: (typeof issueHistoryRows)[number]) => (
                    <Badge
                      variant={
                        row.status === "Issued"
                          ? "default"
                          : row.status === "Returned"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {row.status}
                    </Badge>
                  ),
                },
              ]}
              data={issueHistoryRows}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

