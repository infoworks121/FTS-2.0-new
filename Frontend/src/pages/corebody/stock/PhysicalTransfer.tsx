import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Truck, 
  Send, 
  Search, 
  Package, 
  User, 
  ArrowRight, 
  History,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { coreBodyApi } from "@/lib/coreBodyApi";
import { dealerApi } from "@/lib/dealerApi";

export default function PhysicalTransfer() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedDealer, setSelectedDealer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get dealers from district
        const dealersRes = await coreBodyApi.getDistrictDealers();
        setDealers(dealersRes.dealers || []);

        // 2. Get my inventory
        const dashRes = await coreBodyApi.getMyDashboard();
        // Since getMyDashboard might not have full product list, ideally we have a dedicated inventory endpoint
        // For now, let's assume we fetch products they actually have
        const inventoryRes = await coreBodyApi.getCoreBodyInventory();
        setProducts(inventoryRes.inventory || []); 
      } catch (err) {
        toast.error("Failed to load transfer data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer || !selectedProduct || !quantity) {
        return toast.error("Please fill in all required fields");
    }

    try {
        setSubmitting(true);
        await dealerApi.sendPhysicalTransfer({
            to_dealer_id: selectedDealer,
            product_id: selectedProduct,
            quantity: parseFloat(quantity),
            note: note
        });
        toast.success("Physical shipment recorded successfully!");
        // Reset form
        setSelectedProduct("");
        setQuantity("");
        setNote("");
    } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to initiate transfer");
    } finally {
        setSubmitting(false);
    }
  };

  const selectedProductData = products.find(p => p.product_id === selectedProduct);

  return (
    <DashboardLayout role="dealer" navItems={[]} roleLabel="Core Body Dashboard">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <Truck className="h-3 w-3" />
            <span>Physical Logistics</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dispatch Stock to Dealer</h1>
          <p className="text-slate-500 font-medium">Record the physical movement of units from your hub to a subdivision dealer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-900 text-white p-8">
                        <CardTitle className="text-xl font-black italic flex items-center gap-3">
                            <Box className="h-6 w-6 text-indigo-400" />
                            Transfer Details
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-bold text-sm">
                            Ensure physical counts match before hitting dispatch.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Dealer Hub</Label>
                                    <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                                            <SelectValue placeholder="Select Destination Dealer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dealers.map(d => (
                                                <SelectItem key={d.id} value={d.id} className="font-medium">
                                                    {d.full_name} ({d.subdivision_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Product</Label>
                                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                        <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                                            <SelectValue placeholder="Pick Product to Ship" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.product_id} value={p.product_id} className="font-medium">
                                                    {p.product_name} (Available: {p.quantity})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Physical Quantity to Send</Label>
                                    <Input 
                                        type="number"
                                        placeholder="0.00"
                                        className="h-12 rounded-xl border-slate-200 font-bold text-lg"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        max={selectedProductData?.quantity}
                                    />
                                    {selectedProductData && (
                                        <p className="text-[10px] font-bold text-slate-400 italic">Remaining in Hub: {selectedProductData.quantity - (parseFloat(quantity) || 0)}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logistics Note (Optional)</Label>
                                    <Input 
                                        placeholder="Driver details, vehicle no..."
                                        className="h-12 rounded-xl border-slate-200 font-medium text-sm"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button 
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100 gap-3 group transition-all"
                                disabled={submitting || !quantity || parseFloat(quantity) > (selectedProductData?.quantity || 0)}
                            >
                                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                DISPATCH PHYSICAL SHIPMENT
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                 {/* Guide Card */}
                 <Card className="border-0 shadow-lg border-l-4 border-l-amber-500 rounded-2xl overflow-hidden bg-amber-50">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest">
                            <Info className="h-3 w-3" />
                            Handshake Protocol
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-amber-600 font-black text-xs shrink-0 shadow-sm border border-amber-100">1</div>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">Fill this form when the physical stock leaves your hub.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-amber-600 font-black text-xs shrink-0 shadow-sm border border-amber-100">2</div>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">The Dealer will see this as "Stock on the way".</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-amber-600 font-black text-xs shrink-0 shadow-sm border border-amber-100">3</div>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">The Audit Ledger will only close when the Dealer clicks "Confirmed Receipt".</p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>

                 {/* Verification Alert */}
                 <div className="p-6 rounded-2xl bg-indigo-600 text-white space-y-3 shadow-xl">
                    <CheckCircle2 className="h-8 w-8 text-indigo-300" />
                    <h4 className="font-black text-sm italic">Immutable Verification</h4>
                    <p className="text-[11px] font-medium text-indigo-100 leading-relaxed">
                        This process prevents ghost stock claims. Ensure you get a delivery signature before dispatching from your hub.
                    </p>
                 </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { Box } from "lucide-react";
