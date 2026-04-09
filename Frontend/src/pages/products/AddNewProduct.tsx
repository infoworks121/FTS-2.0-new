import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { productApi } from "@/lib/productApi";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Package, 
  DollarSign, 
  Tag,
  AlertTriangle,
  Save,
  Eye,
  Upload,
  Loader2,
  Layers,
  Settings2,
  Trash2,
  PlusCircle,
  X,
} from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";
import { ProductsLayout } from "@/components/products";
import { Product, ProductFormData } from "@/types/product";
import { IMAGE_BASE_URL } from "@/lib/api";


export default function AddNewProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingProduct = location.state?.product as Product | undefined;
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productApi.getCategories()
      .then((data) => {
        const cats = (data.categories || []).map((c: { id: number; name: string }) => ({
          id: String(c.id),
          name: c.name,
        }));
        setCategories(cats);
      })
      .catch((err) => {
        console.error('Categories fetch error:', err?.response?.data || err.message);
        setCategories([]);
      });
  }, []);
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: editingProduct?.name || "",
    sku: editingProduct?.sku || "",
    categoryId: editingProduct?.category_id || "",
    type: editingProduct?.product_type || "physical",
    mrp: editingProduct?.mrp || 0,
    basePrice: editingProduct?.base_price || 0,
    sellingPrice: editingProduct?.selling_price || 0,
    bulkPrice: editingProduct?.bulk_price || 0,
    adminMarginPct: editingProduct?.admin_margin_pct || 0,
    profitChannel: editingProduct?.profit_channel || "B2C",
    minMarginPercent: editingProduct?.min_margin_percent || 15,
    stockRequired: editingProduct?.stock_required ?? true,
    stockQuantity: editingProduct?.stock_quantity ?? 1,
    isDigital: editingProduct?.is_digital ?? false,
    isService: editingProduct?.is_service ?? false,
    description: editingProduct?.description || "",
    thumbnailUrl: editingProduct?.thumbnail_url || "",
    imageUrls: editingProduct?.image_urls || [],
    variants: [], // Initial state for new product
  });

  // Derived calculations
  const marginPercent = formData.sellingPrice > 0 
    ? ((formData.sellingPrice - formData.basePrice) / formData.sellingPrice) * 100 
    : 0;
  const marginWarning = marginPercent < formData.minMarginPercent;

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    handleInputChange("variants", newVariants);
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      variant_name: "",
      sku_suffix: "",
      attributes: { "Weight": "" },
      mrp: formData.mrp || 0,
      basePrice: formData.basePrice || 0,
      sellingPrice: formData.sellingPrice || 0,
      bulkPrice: formData.bulkPrice || 0,
    };
    handleInputChange("variants", [...(formData.variants || []), newVariant]);
  };

  const removeVariant = (index: number) => {
    const newVariants = (formData.variants || []).filter((_, i) => i !== index);
    handleInputChange("variants", newVariants);
  };

  const handleAttributeChange = (vIdx: number, key: string, value: string) => {
    const newVariants = [...(formData.variants || [])];
    const newAttrs = { ...newVariants[vIdx].attributes };
    delete newAttrs[Object.keys(newVariants[vIdx].attributes)[0]]; // Replace existing or support multiple
    newAttrs[key] = value;
    newVariants[vIdx].attributes = newAttrs;
    handleInputChange("variants", newVariants);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingProduct?.id) {
        await productApi.update(editingProduct.id, { ...formData, status: 'active' });
      } else {
        await productApi.create({ ...formData, status: 'active' });
      }
      setHasChanges(false);
      navigate("/admin/products");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to publish product';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingProduct?.id) {
        await productApi.update(editingProduct.id, { ...formData, status: 'draft' });
      } else {
        await productApi.create({ ...formData, status: 'draft' });
      }
      navigate("/admin/products");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save draft';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [activeBasicTab, setActiveBasicTab] = useState<"identity" | "pricing">("identity");
  const [activeAdvancedTab, setActiveAdvancedTab] = useState<"media" | "variants" | "inventory">("media");
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleFileUpload = async (file: File, field: "thumbnailUrl" | "imageUrls", index?: number) => {
    try {
      const uploadId = index !== undefined ? `${field}-${index}` : field;
      setIsUploading(uploadId);
      const res = await uploadApi.uploadSingle(file);
      
      // The backend returns a relative URL like /uploads/filename.jpg
      const fileUrl = res.url; 
      
      if (field === "thumbnailUrl") {
        handleInputChange("thumbnailUrl", fileUrl);
      } else if (field === "imageUrls" && index !== undefined) {
        const newUrls = [...(formData.imageUrls || [])];
        newUrls[index] = fileUrl;
        handleInputChange("imageUrls", newUrls);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(null);
    }
  };

  const canProceed = () => {
    return formData.name && 
           formData.sku && 
           formData.categoryId && 
           formData.type &&
           formData.mrp > 0 && 
           formData.basePrice >= 0 && 
           (formData.profitChannel === 'B2B' || formData.sellingPrice > 0);
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-600 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-muted-foreground">Fill in the basic details to publish immediately, or explore advanced settings.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "basic" | "advanced")} className="w-full space-y-6">


        <TabsContent value="basic" className="space-y-0 outline-none">
          <Tabs value={activeBasicTab} onValueChange={(val) => setActiveBasicTab(val as "identity" | "pricing")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6 bg-muted/50 rounded-lg p-1">
              <TabsTrigger value="identity" className="font-bold">1. Identity & Info</TabsTrigger>
              <TabsTrigger value="pricing" className="font-bold">2. Pricing & Margin</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-6">
              {/* Card: Basic Info */}
              <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                  <CardTitle className="text-lg">Product Identity</CardTitle>
                  <CardDescription>
                    Essential details required to create the product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Premium Basmati Rice"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="focus-visible:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                      <Input
                        id="sku"
                        placeholder="e.g. BR-PB-001"
                        value={formData.sku}
                        onChange={(e) => handleInputChange("sku", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => handleInputChange("categoryId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Product Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleInputChange("type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">Physical Product</SelectItem>
                          <SelectItem value="digital">Digital Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-2">
                 <Button type="button" onClick={() => setActiveBasicTab("pricing")}>
                    Next: Pricing & Margin <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              {/* Card: Pricing */}
              <Card className="border-t-4 border-t-emerald-500 shadow-md">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-emerald-500" /> Primary Pricing
                  </CardTitle>
                  <CardDescription>
                    Set your main product pricing and margin settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="mrp">Maximum Retail Price (MRP) ₹ *</Label>
                      <Input
                        id="mrp"
                        type="number"
                        placeholder="0.00"
                        value={formData.mrp || ""}
                        onChange={(e) => handleInputChange("mrp", parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="basePrice">Base/Landing Price (Cost) ₹ *</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        placeholder="0.00"
                        value={formData.basePrice || ""}
                        onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)}
                      />
                      <p className="text-[10px] text-muted-foreground">The actual purchase cost of the item.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price (B2C) ₹ *</Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        placeholder="0.00"
                        value={formData.sellingPrice || ""}
                        onChange={(e) => handleInputChange("sellingPrice", parseFloat(e.target.value) || 0)}
                      />
                      <p className="text-[10px] text-muted-foreground">Price shown to Customers in marketplace.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulkPrice">Bulk Price (B2B) ₹</Label>
                      <Input
                        id="bulkPrice"
                        type="number"
                        placeholder="0.00"
                        value={formData.bulkPrice || ""}
                        onChange={(e) => handleInputChange("bulkPrice", parseFloat(e.target.value) || 0)}
                      />
                      <p className="text-[10px] text-muted-foreground">Discounted price for Businessman/Core Body.</p>
                    </div>
                  </div>

                  {/* Profit Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                     <div className="space-y-2">
                       <Label htmlFor="profitChannel">Profit Distribution Channel *</Label>
                       <Select
                         value={formData.profitChannel}
                         onValueChange={(value) => handleInputChange("profitChannel", value)}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select channel" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="B2C">B2C (Retail Direct to Customer)</SelectItem>
                           <SelectItem value="B2B">B2B (Bulk to Core Body/Businessman)</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     
                     <div className="space-y-2">
                       <Label htmlFor="adminMarginPct">Admin Specific Margin %</Label>
                       <Input
                         id="adminMarginPct"
                         type="number"
                         placeholder="0.00"
                         value={formData.adminMarginPct || ""}
                         onChange={(e) => handleInputChange("adminMarginPct", parseFloat(e.target.value) || 0)}
                       />
                     </div>
                     
                     <div className="space-y-2">
                       <Label htmlFor="minMargin">Minimum Allowed Margin (%)</Label>
                       <Input
                         id="minMargin"
                         type="number"
                         value={formData.minMarginPercent}
                         onChange={(e) => handleInputChange("minMarginPercent", parseFloat(e.target.value) || 0)}
                       />
                     </div>
                  </div>

                  {/* Margin Display */}
                  <div className={cn(
                    "p-4 rounded-lg border",
                    marginWarning 
                    ? "border-amber-500/30 bg-amber-500/10" 
                    : "border-green-500/30 bg-green-500/10"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Customer (B2C) Gross Margin</p>
                        <p className="text-xs text-muted-foreground">Based on Selling Price and Base Price</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-2xl font-bold",
                          marginWarning ? "text-amber-600" : "text-green-600"
                        )}>
                          {marginPercent.toFixed(1)}%
                        </p>
                        {marginWarning && (
                          <p className="text-xs text-amber-600 font-bold">Below minimum {formData.minMarginPercent}%</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between pt-2">
                 <Button type="button" variant="outline" onClick={() => setActiveBasicTab("identity")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Identity
                 </Button>
                 <Button 
                   type="button"
                   variant="outline" 
                   className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                   onClick={() => setActiveTab("advanced")}
                 >
                   Configure Advanced Settings (Optional) <ArrowRight className="h-4 w-4" />
                 </Button>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-0 outline-none">
          <Tabs value={activeAdvancedTab} onValueChange={(val) => setActiveAdvancedTab(val as "media" | "variants" | "inventory")} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mb-6 bg-muted/50 rounded-lg p-1">
              <TabsTrigger value="media" className="font-bold">Media Assets</TabsTrigger>
              <TabsTrigger value="variants" className="font-bold">Variations</TabsTrigger>
              <TabsTrigger value="inventory" className="font-bold">Inventory Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="media" className="space-y-6">
              {/* Card: Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-500" /> Product Media
                  </CardTitle>
                  <CardDescription>Add a main thumbnail and gallery images. (Optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Thumbnail */}
                  <div className="flex gap-6 items-start">
                     <div className="relative group h-40 w-40 rounded-xl bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden transition-all hover:border-blue-500/50 shrink-0">
                        {formData.thumbnailUrl ? (
                          <img 
                            src={formData.thumbnailUrl.startsWith('data:') || formData.thumbnailUrl.startsWith('http') ? formData.thumbnailUrl : `${IMAGE_BASE_URL}${formData.thumbnailUrl}`} 
                            alt="Thumbnail" 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Thumbnail</p>
                          </div>
                        )}
                        {isUploading === "thumbnailUrl" && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        )}
                     </div>
                     <div className="flex-1 space-y-4 pt-2">
                        <Label>Main Thumbnail URL</Label>
                        <div className="flex gap-2">
                           <Input
                             placeholder="Paste image URL here..."
                             value={formData.thumbnailUrl}
                             onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)}
                             className="flex-1"
                           />
                           <Button type="button" variant="outline" className="relative shrink-0">
                              <Upload className="h-4 w-4 mr-2" /> Upload
                              <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, "thumbnailUrl");
                                }}
                              />
                           </Button>
                        </div>
                        {formData.thumbnailUrl && (
                          <Button variant="ghost" size="sm" className="text-red-500 px-0" onClick={() => handleInputChange("thumbnailUrl", "")}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Image
                          </Button>
                        )}
                     </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your product features, benefits, etc."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end pt-2">
                 <Button type="button" onClick={() => setActiveAdvancedTab("variants")}>
                    Next: Variations <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
            </TabsContent>

            <TabsContent value="variants" className="space-y-6">
              {/* Card: Variants */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-indigo-500" /> Product Variations
                    </CardTitle>
                    <CardDescription>Create different sizes, weights, or colors with custom pricing. (Optional)</CardDescription>
                  </div>
                  <Button onClick={addVariant} variant="outline" size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Variant
                  </Button>
                </CardHeader>
                <CardContent>
                  {(formData.variants || []).length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/10">
                      <p className="text-sm text-muted-foreground mb-4">No variations added. The product will be sold as a single item.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.variants?.map((v, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-card/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <Badge variant="outline">#{idx + 1}</Badge>
                               <Input 
                                 placeholder="Variant Name (e.g. 5kg Pack)" 
                                 className="h-8 w-64 font-bold"
                                 value={v.variant_name}
                                 onChange={(e) => handleVariantChange(idx, "variant_name", e.target.value)}
                               />
                            </div>
                            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => removeVariant(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase">SKU Suffix</Label>
                              <Input className="h-8" placeholder="-5KG" value={v.sku_suffix} onChange={(e) => handleVariantChange(idx, "sku_suffix", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase">Attribute</Label>
                              <Select value={Object.keys(v.attributes)[0]} onValueChange={(val) => handleAttributeChange(idx, val, Object.values(v.attributes)[0] || "")}>
                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Weight">Weight</SelectItem>
                                  <SelectItem value="Size">Size</SelectItem>
                                  <SelectItem value="Volume">Volume</SelectItem>
                                  <SelectItem value="Color">Color</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase">Value</Label>
                              <Input className="h-8" placeholder="e.g. 5kg" value={Object.values(v.attributes)[0]} onChange={(e) => handleAttributeChange(idx, Object.keys(v.attributes)[0], e.target.value)} />
                            </div>
                            <div className="space-y-1">
                               <Label className="text-[10px] uppercase">MRP ₹</Label>
                               <Input className="h-8" type="number" value={v.mrp} onChange={(e) => handleVariantChange(idx, "mrp", parseFloat(e.target.value) || 0)} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                               <Label className="text-[10px] uppercase">Base/Cost ₹</Label>
                               <Input className="h-8" type="number" value={v.basePrice} onChange={(e) => handleVariantChange(idx, "basePrice", parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="space-y-1">
                               <Label className="text-[10px] uppercase">Selling (B2C) ₹</Label>
                               <Input className="h-8" type="number" value={v.sellingPrice} onChange={(e) => handleVariantChange(idx, "sellingPrice", parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="space-y-1">
                               <Label className="text-[10px] uppercase">Bulk (B2B) ₹</Label>
                               <Input className="h-8" type="number" value={v.bulkPrice} onChange={(e) => handleVariantChange(idx, "bulkPrice", parseFloat(e.target.value) || 0)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex justify-between pt-2">
                 <Button type="button" variant="outline" onClick={() => setActiveAdvancedTab("media")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Media
                 </Button>
                 <Button type="button" onClick={() => setActiveAdvancedTab("inventory")}>
                    Next: Inventory <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              {/* Card: Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-orange-500" /> Inventory & Trackability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="stockRequired" checked={formData.stockRequired} onCheckedChange={(checked) => handleInputChange("stockRequired", checked)} />
                    <Label htmlFor="stockRequired" className="font-medium">Track inventory for this product</Label>
                  </div>

                  {formData.stockRequired && (
                    <div className="space-y-2 max-w-xs pl-6">
                      <Label htmlFor="stockQuantity" className="text-xs">Initial Admin Stock Quantity</Label>
                      <Input id="stockQuantity" type="number" min="0" value={formData.stockQuantity} onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value) || 0)} />
                      <p className="text-[10px] text-muted-foreground">Default is 1. Can be updated later via stock addition.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex justify-start pt-2">
                 <Button type="button" variant="outline" onClick={() => setActiveAdvancedTab("variants")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Variations
                 </Button>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Persistent Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="container max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             {activeTab === "advanced" && (
               <Button variant="ghost" onClick={() => setActiveTab("basic")}>
                 <ArrowLeft className="h-4 w-4 mr-2" /> Back to Basic
               </Button>
             )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/products")}>
               Discard
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" /> Save Draft
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!canProceed() || isSaving}
              className={cn(
                "min-w-[140px] font-bold shadow-md",
                canProceed() ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {isSaving ? (
                 <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> {editingProduct ? "Update Product" : "Publish Product"}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

