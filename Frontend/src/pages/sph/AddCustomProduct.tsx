import { useState, useEffect } from "react";
import { Plus, Upload, Trash2, Loader2, Package, ArrowLeft, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
}

export default function AddCustomProduct({ onProductCreated }: { onProductCreated?: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    description: "",
    thumbnail_url: "",
    retail_price: "",
    mrp: "",
    cost_price: "",
    stock_quantity: "0"
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/catalog/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        toast.error("Failed to load categories");
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.category_id || !formData.retail_price || !formData.mrp) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/sph/products/custom", formData);
      toast.success("Custom product created and listed!");
      
      if (onProductCreated) onProductCreated();
      else navigate("/businessman/b2c-manager/listings");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Button>
        <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight">List a Unique Product</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Can't find your product in our catalog? Create a custom listing. 
              This product will be uniquely yours and managed exclusively in your shop.
            </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base tracking-tight">Product Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Product Title *</label>
                <Input 
                  placeholder="e.g. Premium Handcrafted Organic Honey" 
                  className="h-11 text-base font-medium"
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Unique SKU / Model No. *</label>
                  <Input 
                    placeholder="e.g. HON-PREM-500" 
                    value={formData.sku} 
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Product Category *</label>
                  <select 
                    className="w-full h-10 px-3 bg-muted/30 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">Choose Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Detailed Description</label>
                <Textarea 
                  placeholder="Tell your customers what makes this product special..." 
                  className="min-h-[160px] resize-none leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                <Upload className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-base tracking-tight">Product Media</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Thumbnail Image URL</label>
                <div className="flex gap-2">
                    <Input 
                        placeholder="https://example.com/image.jpg" 
                        value={formData.thumbnail_url} 
                        onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                    />
                </div>
                <p className="text-[10px] text-muted-foreground italic">Tip: Use high-quality 1:1 aspect ratio images for best visibility.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Sidebar Settings */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 sticky top-20">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                <Plus className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-base tracking-tight">Pricing & Inventory</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">MRP (Tax Incl.) *</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-bold">₹</span>
                    <Input 
                      type="number"
                      className="pl-7 h-10 font-bold"
                      placeholder="0.00" 
                      value={formData.mrp} 
                      onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Selling Price *</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-emerald-600 text-sm font-bold">₹</span>
                    <Input 
                      type="number"
                      className="pl-7 h-10 font-bold border-emerald-500/50 focus-visible:ring-emerald-500/20 text-emerald-700 bg-emerald-50/10"
                      placeholder="0.00" 
                      value={formData.retail_price} 
                      onChange={(e) => setFormData({...formData, retail_price: e.target.value})}
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Initial Stock *</label>
                <Input 
                  type="number"
                  placeholder="0" 
                  value={formData.stock_quantity} 
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                />
              </div>

              <div className="pt-4 space-y-3">
                 <Button type="submit" disabled={loading} className="w-full h-11 font-bold gap-2 shadow-lg">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Publish Listing</>}
                 </Button>
                 <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="w-full gap-2 font-medium text-muted-foreground h-11">
                    <XCircle className="h-4 w-4" /> Cancel & Discard
                 </Button>
              </div>
              
              <div className="p-3 bg-muted/40 rounded-lg border border-border/50">
                 <p className="text-[10px] text-muted-foreground text-center">
                    By publishing, you agree that this product complies with our marketplace policies.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
