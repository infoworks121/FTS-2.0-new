import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { Package, TrendingUp, IndianRupee, ShieldCheck } from "lucide-react";

interface QuickListModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickListModal({ product, isOpen, onClose, onSuccess }: QuickListModalProps) {
  const [retailPrice, setRetailPrice] = useState(product?.recommended_retail_price || product?.selling_price || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleListToB2C = async () => {
    if (!retailPrice || isNaN(parseFloat(retailPrice))) {
      toast.error("Please enter a valid retail price");
      return;
    }

    const price = parseFloat(retailPrice);
    const bulkPrice = parseFloat(product.selling_price || product.base_price || 0);
    const mrp = parseFloat(product.mrp || 0);

    if (price < bulkPrice) {
      toast.error(`Retail price cannot be lower than bulk cost (₹${bulkPrice})`);
      return;
    }
    if (price > mrp && mrp > 0) {
      toast.error(`Retail price cannot exceed MRP (₹${mrp})`);
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/sph/listings/link", {
        product_id: product.id,
        retail_price: price,
        stock_quantity: 0 // Default to zero, they can update in inventory
      });

      toast.success("Product listed in B2C Marketplace successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to list product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="p-8 bg-slate-900 text-white">
          <div className="flex items-center gap-4 mb-4">
             <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="h-6 w-6 text-white" />
             </div>
             <div>
                <DialogTitle className="text-2xl font-black tracking-tight">Quick B2C Listing</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                  Directly post this product to your customer shop
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6 bg-slate-50">
          <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
             <div className="h-16 w-16 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                {product.thumbnail_url ? (
                  <img src={product.thumbnail_url} alt="" className="w-full h-full object-contain" />
                ) : <Package className="h-8 w-8 text-slate-200" />}
             </div>
             <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{product.name}</p>
                <p className="text-[10px] font-mono text-slate-400 uppercase">{product.sku}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Bulk Cost</p>
                <p className="text-lg font-black text-blue-900">₹{product.selling_price || product.base_price}</p>
             </div>
             <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">MRP Limit</p>
                <p className="text-lg font-black text-orange-900">₹{product.mrp}</p>
             </div>
          </div>

          <div className="space-y-3">
             <Label htmlFor="retail_price" className="text-xs font-black text-slate-500 uppercase tracking-[0.1em]">Set Your Customer Retail Price</Label>
             <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                   <IndianRupee className="h-5 w-5" />
                </div>
                <Input 
                  id="retail_price"
                  type="number"
                  placeholder="0.00"
                  className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl focus-visible:ring-emerald-500 focus-visible:bg-white text-xl font-black transition-all"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                />
             </div>
             <p className="text-[10px] text-slate-400 font-medium italic">* Your profit margin is calculated based on this price vs bulk cost.</p>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 bg-slate-50 gap-3">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button 
            onClick={handleListToB2C} 
            disabled={isLoading}
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "Posting Listing..." : "Instant Post to B2C"}
            <TrendingUp className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
