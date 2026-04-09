import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
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

type CBStatus = "Active" | "Inactive";

type CoreBody = {
  id: string;
  coreBodyId: string;
  name: string;
  type: string;
  joinedDate: string;
  status: CBStatus;
  investment_amount: number;
  ytd_earnings: number;
  annual_cap: number;
};

const ITEMS_PER_PAGE = 6;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export function AllCoreBodiesContent({ data }: { data?: any[] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CBStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const actualData = data || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actualData.filter((cb) => {
      const matchesQuery = !q || cb.name.toLowerCase().includes(q) || cb.coreBodyId.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || cb.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, actualData]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const openProfile = (cb: any) => {
    navigate(`/corebody/directory/corebody/${cb.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">All Core Body Members</h1>
        <p className="text-sm text-muted-foreground">
          District-scoped Core Body directory for operational monitoring.
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
              placeholder="e.g. Rakesh or CB-1001"
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
              onValueChange={(v: "all" | CBStatus) => {
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
          <CardTitle className="text-sm">Core Body List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Annual Cap</TableHead>
                  <TableHead>YTD Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((cb) => (
                  <TableRow key={cb.coreBodyId}>
                    <TableCell>{cb.name}</TableCell>
                    <TableCell>Type {cb.type}</TableCell>
                    <TableCell>{cb.district || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{formatCurrency(cb.investment_amount)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatCurrency(cb.annual_cap)}</TableCell>
                    <TableCell className="font-mono text-xs text-profit">{formatCurrency(cb.ytd_earnings)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          cb.status === "Active"
                            ? "border-green-500/40 text-green-600"
                            : "border-amber-500/40 text-amber-600"
                        }
                      >
                        {cb.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="outline" title="View Profile" onClick={() => openProfile(cb)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                      No core body records match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {paginated.length} of {filtered.length} members
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
