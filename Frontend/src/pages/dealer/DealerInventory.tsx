import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getDealerNavItems } from "@/config/dealerSidebarConfig";
import { 
  Boxes, 
  History, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  Info
} from "lucide-react";
import { dealerApi } from "@/lib/dealerApi";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DealerInventory() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    product_id: "",
    requested_qty: "",
    request_note: "",
    urgency_level: "normal"
  });

  const navItems = getDealerNavItems();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ledgerRes, signalsRes, productsRes] = await Promise.all([
        dealerApi.getInventoryLedger(),
        dealerApi.getDemandSignals(),
        dealerApi.getMyProducts()
      ]);
      setLedger(ledgerRes.ledger || []);
      setSignals(signalsRes.stock_requests || []);
      setMyProducts(productsRes.products || []);
    } catch (err) {
      console.error("Failed to load inventory data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitSignal = async () => {
    if (!formData.product_id || !formData.request_note) {
      toast.error("Please select a product and provide a message.");
      return;
    }

    try {
      setRequestLoading(true);
      await dealerApi.sendDemandSignal({
        ...formData,
        requested_qty: formData.requested_qty ? parseInt(formData.requested_qty) : null
      });
      toast.success("Demand signal sent to Core Body!");
      setIsModalOpen(false);
      setFormData({ product_id: "", requested_qty: "", request_note: "", urgency_level: "normal" });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send signal");
    } finally {
      setRequestLoading(false);
    }
  };

  const ledgerColumns = [
    {
      header: "Date & Time",
      accessorKey: "created_at",
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">{format(new Date(row.original.created_at), 'dd MMM yyyy')}</span>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">{format(new Date(row.original.created_at), 'hh:mm a')}</span>
        </div>
      )
    },
    {
      header: "Product",
      accessorKey: "product_name",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Boxes className="h-4 w-4 text-slate-300" />
          </div>
          <p className="font-bold text-slate-900 text-sm line-clamp-1">{row.original.product_name}</p>
        </div>
      )
    },
    {
      header: "Type",
      accessorKey: "transaction_type",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.transaction_type === 'IN' ? (
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
          )}
          <span className={`text-[10px] font-black uppercase tracking-widest ${row.original.transaction_type === 'IN' ? 'text-emerald-600' : 'text-blue-600'}`}>
            {row.original.transaction_type === 'IN' ? 'Stock Received' : 'Stock Issued'}
          </span>
        </div>
      )
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: ({ row }: any) => (
        <span className={`font-black text-sm ${row.original.transaction_type === 'IN' ? 'text-emerald-600' : 'text-slate-900'}`}>
          {row.original.transaction_type === 'IN' ? '+' : '-'}{row.original.quantity}
        </span>
      )
    },
    {
        header: "Note",
        accessorKey: "note",
        cell: ({ row }: any) => <span className="text-[10px] text-slate-500 font-medium italic">{row.original.note || "N/A"}</span>
    }
  ];

  const signalColumns = [
    {
      header: "Urgency",
      accessorKey: "urgency_level",
      cell: ({ row }: any) => {
        const levels: any = {
          critical: "bg-red-50 text-red-600 border-red-100",
          high: "bg-orange-50 text-orange-600 border-orange-100",
          normal: "bg-emerald-50 text-emerald-600 border-emerald-100"
        };
        return (
          <Badge className={`${levels[row.original.urgency_level]} font-black text-[10px] uppercase shadow-none`}>
            {row.original.urgency_level}
          </Badge>
        );
      }
    },
    {
      header: "Product Demand",
      accessorKey: "product_name",
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <p className="font-bold text-slate-900 text-sm">{row.original.product_name}</p>
          {row.original.requested_qty && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">Estimate: {row.original.requested_qty} units</p>
          )}
        </div>
      )
    },
    {
      header: "Message",
      accessorKey: "request_note",
      cell: ({ row }: any) => (
        <div className="max-w-[300px] py-1">
          <p className="text-xs font-medium text-slate-600 leading-relaxed italic line-clamp-2">
            "{row.original.request_note}"
          </p>
        </div>
      )
    },
    {
      header: "Response",
      accessorKey: "reply_note",
      cell: ({ row }: any) => (
        <div className="max-w-[250px]">
          {row.original.reply_note ? (
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 flex gap-2 items-start shrink-0">
              <MessageSquare className="h-3 w-3 text-indigo-500 mt-1 shrink-0" />
              <p className="text-[11px] font-bold text-indigo-700 leading-tight italic">
                {row.original.reply_note}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest italic">Awaiting response</span>
            </div>
          )}
        </div>
      )
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: any) => (
          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-200">
            {row.original.status}
          </Badge>
        )
      }
  ];

  return (
    <DashboardLayout role="dealer" navItems={navItems as any} roleLabel="Subdivision Agent">
      <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <Boxes className="h-3 w-3" />
              <span>Logistics & Replenishment</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Operations</h1>
            <p className="text-slate-500 font-medium">Monitor your stock ledger and signal high market demand to your District Core Body.</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100 gap-2">
                <Send className="h-4 w-4" />
                Signal High Demand
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-0 rounded-2xl shadow-2xl p-0 overflow-hidden">
              <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                <DialogHeader className="relative z-10 space-y-2">
                  <DialogTitle className="text-2xl font-black">Notify High Demand</DialogTitle>
                  <DialogDescription className="text-indigo-100 font-bold opacity-80">
                    Send a demand signal to the District Core Body to prioritize stock arrival.
                  </DialogDescription>
                </DialogHeader>
                <div className="absolute right-[-20px] bottom-[-20px] h-32 w-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Product</Label>
                  <Select onValueChange={(val) => setFormData(p => ({ ...p, product_id: val }))}>
                    <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold">
                      <SelectValue placeholder="Which product has high demand?" />
                    </SelectTrigger>
                    <SelectContent className="border-0 shadow-2xl rounded-xl">
                      {myProducts.map(p => (
                        <SelectItem key={p.id} value={p.id} className="font-bold py-3">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Urgency Level</Label>
                    <Select defaultValue="normal" onValueChange={(val) => setFormData(p => ({ ...p, urgency_level: val }))}>
                      <SelectTrigger className="h-12 border-slate-200 rounded-xl font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-0 shadow-2xl rounded-xl">
                        <SelectItem value="normal" className="font-bold py-3 text-emerald-600">Normal</SelectItem>
                        <SelectItem value="high" className="font-bold py-3 text-orange-600">High Demand</SelectItem>
                        <SelectItem value="critical" className="font-bold py-3 text-red-600">Critical / Stock Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Est. Quantity (Optional)</Label>
                    <Input 
                      placeholder="e.g. 100" 
                      className="h-12 border-slate-200 rounded-xl font-bold" 
                      type="number"
                      value={formData.requested_qty}
                      onChange={(e) => setFormData(p => ({ ...p, requested_qty: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Market Context / Message</Label>
                  <Textarea 
                    placeholder="Describe why demand is high (e.g. Local festival next week, high business queries...)" 
                    className="min-h-[120px] rounded-2xl border-slate-200 font-medium resize-none p-4"
                    value={formData.request_note}
                    onChange={(e) => setFormData(p => ({ ...p, request_note: e.target.value }))}
                  />
                  <p className="text-[10px] font-medium text-slate-400 italic italic">The Core Body will see this to help them buy more stock for the district.</p>
                </div>

                <DialogFooter className="pt-4">
                  <Button 
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl gap-2 shadow-lg shadow-indigo-100"
                    onClick={handleSubmitSignal}
                    disabled={requestLoading}
                  >
                    {requestLoading ? "Sending Signal..." : "Submit Demand Notification"}
                    <Send className="h-4 w-4" />
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="ledger" className="space-y-6">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl gap-2 border border-slate-200/50">
            <TabsTrigger value="ledger" className="rounded-xl px-8 h-10 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
              <History className="h-3.5 w-3.5 mr-2" />
              Stock Ledger
            </TabsTrigger>
            <TabsTrigger value="signals" className="rounded-xl px-8 h-10 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">
              <MessageSquare className="h-3.5 w-3.5 mr-2" />
              Demand History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ledger">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <DataTable columns={ledgerColumns} data={ledger} loading={loading} noDataMessage="No inventory movements found." />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <DataTable columns={signalColumns} data={signals} loading={loading} noDataMessage="No demand signals found. Notify your Core Body when demand increases!" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900 mb-1">How Demand Signaling works</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    By signaling high demand, you help the District Core Body understand which products are trending in your subdivision. 
                    This allows them to purchase larger quantities from the company, ensuring you always have stock to auto-fulfill your customer orders.
                </p>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
