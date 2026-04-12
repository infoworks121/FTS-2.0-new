import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PackageCheck,
  Search,
  ArrowRight,
  Info,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import fulfillmentApi, { FulfillmentAssignment } from "@/lib/fulfillmentApi";

export default function DealerOrders() {
  const navItems = getDealerNavItems();
  const [assignments, setAssignments] = useState<FulfillmentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<FulfillmentAssignment | null>(null);
  
  // Dispatch Form State
  const [isDispatching, setIsDispatching] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await fulfillmentApi.getAssignments();
      setAssignments(data.fulfillments || []);
    } catch (error) {
      toast.error("Failed to load order assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, extraData = {}) => {
    try {
      await fulfillmentApi.updateStatus(id, status, extraData);
      toast.success(`Order marked as ${status}`);
      loadAssignments();
      setSelectedOrder(null);
      setIsDispatching(false);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    handleUpdateStatus(selectedOrder.id, "dispatched", {
      carrier: courierName,
      tracking_number: trackingNumber
    });
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = 
      a.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "pending") return matchesSearch && (a.status === "assigned" || a.status === "accepted");
    if (activeTab === "active") return matchesSearch && a.status === "dispatched";
    if (activeTab === "completed") return matchesSearch && a.status === "delivered";
    return matchesSearch;
  });

  return (
    <DashboardLayout role="dealer" navItems={navItems as any} roleLabel="Subdivision Agent">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Fulfillment</h1>
            <p className="text-muted-foreground">Manage your assigned B2B orders and shipments.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
              <Input 
                placeholder="Search order or customer..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={loadAssignments}>Refresh</Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending ({assignments.filter(a => ["assigned", "accepted"].includes(a.status)).length})</TabsTrigger>
            <TabsTrigger value="active">Active ({assignments.filter(a => a.status === "dispatched").length})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="p-12 text-center animate-pulse">Loading queue...</div>
            ) : filteredAssignments.length === 0 ? (
              <div className="p-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-slate-50/50">
                <Truck className="h-16 w-16 mb-4 opacity-10" />
                <p className="text-lg">No {activeTab} orders found.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-slate-200 overflow-hidden hover:border-blue-300 transition-colors">
                    <CardHeader className="pb-3 bg-slate-50/50 border-b">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="font-mono bg-white uppercase text-[10px]">
                          {assignment.order_number}
                        </Badge>
                        <Badge variant={assignment.is_shortage_fulfillment ? "warning" : "default"} className="text-[10px]">
                          {assignment.is_shortage_fulfillment ? "PARTIAL (SPLIT)" : "FULL FULFILLMENT"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{assignment.customer_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {/* Items to ship */}
                      <div className="space-y-2">
                         <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Items in your dispatch:</p>
                         <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <Package className="h-4 w-4 text-blue-600" />
                               <span className="text-sm font-medium">{assignment.items?.[0]?.product_name || "Product"}</span>
                            </div>
                            <span className="text-sm font-bold text-blue-700">{assignment.items?.[0]?.quantity || 0} Bosta</span>
                         </div>
                      </div>

                      {assignment.is_shortage_fulfillment && (
                         <div className="flex items-start gap-2 p-2 bg-orange-50 rounded text-[11px] text-orange-800 border border-orange-100">
                           <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                           <p><b>Note:</b> This is a partial fulfillment. The central hub is handling the remaining stock balance.</p>
                         </div>
                      )}

                      <div className="pt-2">
                        {assignment.status === "assigned" && (
                          <Button className="w-full" onClick={() => handleUpdateStatus(assignment.id, "accepted")}>
                            Accept Order
                          </Button>
                        )}
                        {assignment.status === "accepted" && (
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => {
                            setSelectedOrder(assignment);
                            setIsDispatching(true);
                          }}>
                            Mark as Dispatched <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                        {assignment.status === "dispatched" && (
                          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(assignment.id, "delivered")}>
                            Confirm Delivery
                          </Button>
                        )}
                        {assignment.status === "delivered" && (
                           <div className="flex items-center justify-center gap-2 text-green-600 font-bold py-2">
                              <CheckCircle2 className="h-5 w-5" />
                              <span>Completed</span>
                           </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dispatch Modal */}
        <Dialog open={isDispatching} onOpenChange={setIsDispatching}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Shipment Information</DialogTitle>
              <DialogDescription>
                Provide tracking details for Order {selectedOrder?.order_number}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDispatchSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Courier Name</label>
                <Input 
                  placeholder="e.g. Ecom Express, Local Pickup" 
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tracking # / Reference</label>
                <Input 
                  placeholder="Enter tracking number" 
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDispatching(false)}>Cancel</Button>
                <Button type="submit">Confirm Dispatch</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
