import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { sidebarNavItems } from "@/config/sidebarConfig";
import { 
  AlertCircle, 
  ArrowRight, 
  Package, 
  Search, 
  Truck, 
  Users, 
  CheckCircle2, 
  Info,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import adminApi from "@/lib/adminApi";
import { format } from "date-fns";

export default function ShortageFulfillment() {
  const navItems = sidebarNavItems;
  const [shortages, setShortages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShortage, setSelectedShortage] = useState<any>(null);
  const [coreBodies, setCoreBodies] = useState<any[]>([]);
  const [loadingCB, setLoadingCB] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadShortages();
  }, []);

  const loadShortages = async () => {
    try {
      const data = await adminApi.getShortages();
      setShortages(data.shortages || []);
    } catch (error) {
      toast.error("Failed to load shortages");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRouting = async (shortage: any) => {
    setSelectedShortage(shortage);
    setLoadingCB(true);
    try {
      const productId = shortage.items?.[0]?.product_id;
      if (productId) {
        const data = await adminApi.getCoreBodyStock(productId);
        setCoreBodies(data.inventory || []);
      }
    } catch (error) {
      toast.error("Failed to load potential suppliers");
    } finally {
      setLoadingCB(false);
    }
  };

  const handleRouteReplenishment = async (cb: any) => {
    if (!selectedShortage) return;

    try {
      const payload = {
        from_core_body_id: cb.entity_id,
        to_dealer_id: selectedShortage.fulfiller_id,
        product_id: selectedShortage.items[0].product_id,
        quantity: selectedShortage.items[0].quantity,
        order_id: selectedShortage.order_id,
        note: `Admin directed replenishment for order shortage.`
      };

      await adminApi.requestDirectedDispatch(payload);
      toast.success("Replenishment request sent to Core Body");
      setSelectedShortage(null);
      loadShortages();
    } catch (error) {
      toast.error("Failed to route replenishment");
    }
  };

  return (
    <DashboardLayout role="admin" navItems={navItems as any} roleLabel="Administrator">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Shortage Control Center</h1>
          <p className="text-muted-foreground">
            Manage and resolve inventory shortages by routing stock from remote districts.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-orange-50/50 border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Active Shortages</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shortages.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Requiring replenishment</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Shortage Resolution</CardTitle>
            <CardDescription>
              Orders that could not be fully fulfilled by the local subdivision dealer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center animate-pulse">Loading shortage queue...</div>
            ) : shortages.length === 0 ? (
              <div className="p-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-4 opacity-20" />
                <p>No active shortages found. All orders are covered.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Local Dealer</TableHead>
                    <TableHead>Missing Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shortages.map((shortage) => (
                    <TableRow key={shortage.id}>
                      <TableCell className="font-medium text-blue-600 font-mono text-xs">{shortage.order_number}</TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                           <span className="font-medium">{shortage.dealer_name || "Unknown"}</span>
                           <span className="text-[10px] text-muted-foreground uppercase">{shortage.subdivision_id}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Package className="h-3 w-3 opacity-40" />
                           <span className="text-sm">{shortage.items?.[0]?.product_name || "Unknown Item"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-mono">
                          {shortage.items?.[0]?.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Pending Resolution</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => handleOpenRouting(shortage)}>
                             Resolve <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl sm:max-w-[700px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-xl">
                                <Truck className="h-6 w-6 text-blue-600" />
                                Route Replenishment
                              </DialogTitle>
                              <DialogDescription>
                                Find a Core Body with available stock to satisfy the shortage for Dealer: <b>{shortage.dealer_name}</b>
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-6 mt-4">
                              <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-blue-900 leading-none">Shortage Specs</p>
                                  <p className="text-xs text-blue-700/70">Ref: {shortage.order_number}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <p className="text-sm font-bold">{shortage.items?.[0]?.quantity} Bosta</p>
                                    <p className="text-[10px] text-muted-foreground">{shortage.items?.[0]?.product_name}</p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 opacity-30" />
                                  <div className="text-left">
                                    <p className="text-sm font-bold">{shortage.subdivision_id}</p>
                                    <p className="text-[10px] text-muted-foreground italic">Target Hub</p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                                  <Input 
                                    placeholder="Search by District or Hub name..." 
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                  />
                                </div>

                                <ScrollArea className="h-[300px] border border-dashed rounded-xl p-2 bg-slate-50/30">
                                  {loadingCB ? (
                                    <div className="p-12 text-center">
                                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                       <p className="text-sm text-muted-foreground">Scanning Hubs across districts...</p>
                                    </div>
                                  ) : coreBodies.length === 0 ? (
                                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                      <Info className="h-8 w-8 mb-2 opacity-20" />
                                      <p className="text-sm">No hubs found with available stock for this product.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {coreBodies
                                        .filter(cb => 
                                          cb.district_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          cb.cb_name?.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((cb) => (
                                          <div 
                                            key={cb.entity_id} 
                                            className="group flex items-center justify-between p-4 bg-white border rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-default"
                                          >
                                            <div className="flex items-start gap-4">
                                               <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                 {cb.district_name?.[0] || "D"}
                                               </div>
                                               <div>
                                                  <p className="font-bold group-hover:text-blue-600 transition-colors">{cb.cb_name}</p>
                                                  <div className="flex items-center gap-2 mt-1">
                                                    <Badge className="bg-blue-50 text-blue-700 border-none px-2 h-5 text-[10px] uppercase font-bold tracking-wider">{cb.district_name}</Badge>
                                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="text-xs text-muted-foreground">Avail: <b className="text-slate-900">{cb.quantity}</b> Units</span>
                                                  </div>
                                               </div>
                                            </div>
                                            <Button 
                                              size="sm" 
                                              className="bg-blue-600 hover:bg-blue-700"
                                              onClick={() => handleRouteReplenishment(cb)}
                                            >
                                              Directed Send
                                            </Button>
                                          </div>
                                        ))
                                      }
                                    </div>
                                  )}
                                </ScrollArea>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
