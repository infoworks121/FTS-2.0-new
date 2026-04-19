import { useEffect, useState } from "react";
import { fulfillmentApi, FulfillmentAssignment } from "@/lib/fulfillmentApi";
import { DataTable } from "@/components/DataTable";
import { KPICard } from "@/components/KPICard";
import { Truck, Clock, CheckCircle2, AlertCircle, Search, Info, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { format } from "date-fns";

export default function B2CFulfillment() {
  const [fulfillments, setFulfillments] = useState<FulfillmentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState<FulfillmentAssignment | null>(null);

  const fetchFulfillments = async () => {
    try {
      setLoading(true);
      const data = await fulfillmentApi.getDistrictFulfillments({
        status: statusFilter === "all" ? undefined : statusFilter,
        order_type: "B2C"
      });
      setFulfillments(data.fulfillments);
    } catch (error) {
      console.error("Error fetching fulfillments:", error);
      toast.error("Failed to load fulfillment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFulfillments();
  }, [statusFilter]);

  const filteredFulfillments = fulfillments.filter(
    (f) =>
      f.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: fulfillments.length,
    pending: fulfillments.filter(f => f.status === 'assigned' || f.status === 'accepted').length,
    dispatched: fulfillments.filter(f => f.status === 'dispatched').length,
    delivered: fulfillments.filter(f => f.status === 'delivered').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned': return <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/5">Assigned</Badge>;
      case 'accepted': return <Badge variant="outline" className="border-indigo-500/50 text-indigo-500 bg-indigo-500/5">Accepted</Badge>;
      case 'dispatched': return <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/5">Dispatched</Badge>;
      case 'delivered': return <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/5">Delivered</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">B2C Fulfillment Management</h1>
        <p className="text-muted-foreground">
          Monitor last-mile delivery performance and stock point assignments across your district.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Fulfillments"
          value={String(stats.total)}
          icon={Package}
          variant="neutral"
        />
        <KPICard
          title="Awaiting Action"
          value={String(stats.pending)}
          icon={Clock}
          variant="warning"
        />
        <KPICard
          title="In Transit"
          value={String(stats.dispatched)}
          icon={Truck}
          variant="profit"
        />
        <KPICard
          title="Completed"
          value={String(stats.delivered)}
          icon={CheckCircle2}
          variant="neutral"
        />
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Order # or Customer..."
                className="pl-9 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-background/50">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <DataTable
          loading={loading}
          columns={[
            {
              header: "Order Detail",
              accessor: (row: any) => (
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-foreground font-mono text-xs">{row.order_number}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(row.assigned_at), "MMM dd, yyyy • HH:mm")}
                  </span>
                </div>
              ),
            },
            {
              header: "Customer",
              accessor: (row: any) => (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{row.customer_name}</span>
                  <span className="text-xs text-muted-foreground">{row.customer_phone}</span>
                </div>
              ),
            },
            {
              header: "Fulfiller",
              accessor: (row: any) => (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {row.fulfiller_name || "Unassigned"}
                  </span>
                  <Badge variant="secondary" className="w-fit text-[9px] uppercase px-1.5 h-4">
                    {row.fulfiller_type?.replace('_', ' ')}
                  </Badge>
                </div>
              ),
            },
            {
              header: "Value",
              accessor: (row: any) => (
                <span className="font-mono text-sm font-bold">
                  ₹{Number(row.total_amount).toLocaleString()}
                </span>
              ),
            },
            {
              header: "Status",
              accessor: (row: any) => getStatusBadge(row.status),
            },
            {
              header: "Actions",
              accessor: (row: any) => (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 gap-2"
                  onClick={() => setSelectedAssignment(row)}
                >
                  <Info className="h-4 w-4" />
                  Details
                </Button>
              ),
            },
          ]}
          data={filteredFulfillments}
        />
      </div>

      {/* Details Sheet */}
      <Sheet open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-500" />
              Fulfillment Assignment
            </SheetTitle>
            <SheetDescription>
              Detailed overview of B2C Order {selectedAssignment?.order_number}
            </SheetDescription>
          </SheetHeader>

          {selectedAssignment && (
            <div className="mt-8 space-y-8">
              {/* Primary Info */}
              <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Order Date</p>
                  <p className="text-sm font-semibold">{format(new Date(selectedAssignment.order_date), "dd MMM yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                  {getStatusBadge(selectedAssignment.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Value</p>
                  <p className="text-sm font-mono font-bold text-profit">₹{Number(selectedAssignment.total_amount).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Type</p>
                  <p className="text-sm font-semibold">B2C Fulfillment</p>
                </div>
              </div>

              {/* Fulfiller Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Fulfiller Identification
                </h3>
                <div className="space-y-3 pl-6 border-l-2 border-amber-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Entity Name</span>
                    <span className="text-sm font-bold">{(selectedAssignment as any).fulfiller_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Entity Type</span>
                    <Badge variant="outline" className="capitalize">
                      {selectedAssignment.fulfiller_type?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  Order Items
                </h3>
                <div className="bg-background rounded-lg border divide-y divide-border">
                  {Array.isArray(selectedAssignment.items) ? selectedAssignment.items.map((item: any, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center bg-card">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{item.product_name}</span>
                        <span className="text-[10px] text-muted-foreground">Qty: {item.quantity}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold">₹{(item.unit_price * item.quantity).toLocaleString()}</span>
                    </div>
                  )) : (
                    <p className="p-4 text-xs text-center text-muted-foreground">No item details available</p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t flex flex-col gap-3">
                <Button className="w-full gap-2 font-bold" variant="default" onClick={() => toast.info("History tracking for B2C coming soon")}>
                  <Clock className="h-4 w-4" />
                  View Status Timeline
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
