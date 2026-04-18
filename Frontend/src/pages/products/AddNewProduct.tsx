import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  X,
  Upload,
  Loader2,
  Trash2,
  PlusCircle,
  Layers,
} from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";
import { Product, ProductFormData, ProductVariant } from "@/types/product";
import { IMAGE_BASE_URL } from "@/lib/api";

// Steps configuration
const steps = [
  { id: 1, title: "Basic Info", description: "Details, Stock & Variants", icon: Package },
  { id: 2, title: "Media", description: "Thumbnail and gallery images", icon: Eye },
  { id: 3, title: "Pricing", description: "Price, cost, margin settings", icon: DollarSign },
  { id: 4, title: "Review", description: "Confirm and publish", icon: Check },
];

export default function AddNewProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editingProduct = location.state?.product as Product | undefined;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const getRedirectPath = () => {
    const basePath = window.location.pathname;
    if (basePath.startsWith('/stockpoint')) return "/stockpoint/b2c-manager/listings";
    if (basePath.startsWith('/corebody')) return "/corebody/b2c-manager/listings";
    if (basePath.startsWith('/businessman')) return "/businessman/b2c-manager/listings";
    if (user?.is_sph) return "/stockpoint/b2c-manager/listings";
    return "/admin/products"; // Default
  };

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
    minOrderQuantity: editingProduct?.min_order_quantity || 1,
    adminMarginPct: editingProduct?.admin_margin_pct || 0,
    profitChannel: editingProduct?.profit_channel || "B2B",
    minMarginPercent: editingProduct?.min_margin_percent || 15,
    stockRequired: editingProduct?.stock_required ?? true,
    stockQuantity: editingProduct?.stock_quantity || 0,
    isDigital: editingProduct?.is_digital ?? false,
    isService: editingProduct?.is_service ?? false,
    is_dealer_routed: editingProduct?.is_dealer_routed ?? false,
    description: editingProduct?.description || "",
    thumbnailUrl: editingProduct?.thumbnail_url || "",
    imageUrls: editingProduct?.image_urls || [],
    variants: editingProduct?.variants || [],
  });

  // Handle pre-fill from URL params
  useEffect(() => {
    const channelParam = searchParams.get("channel");
    if (channelParam && (channelParam === "B2B" || channelParam === "B2C") && !editingProduct) {
      setFormData(prev => ({ ...prev, profitChannel: channelParam }));
    }
  }, [searchParams, editingProduct]);

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
      minOrderQuantity: formData.minOrderQuantity || 1,
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

    // Replace existing attribute as per consistent behavior
    const existingKeys = Object.keys(newAttrs);
    existingKeys.forEach(k => delete newAttrs[k]);

    newAttrs[key] = value;
    newVariants[vIdx].attributes = newAttrs;
    handleInputChange("variants", newVariants);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingProduct?.id) {
        await productApi.update(editingProduct.id, { ...formData, mrp: formData.mrp || 0, status: 'active' });
      } else {
        const isAdmin = window.location.pathname.startsWith('/admin');
        const finalData = { ...formData, mrp: formData.mrp || 0, status: 'active' };
        if (isAdmin) {
          await productApi.create(finalData);
        } else {
          await productApi.createSPH(finalData);
        }
      }
      setHasChanges(false);
      navigate(getRedirectPath());
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
        await productApi.update(editingProduct.id, { ...formData, mrp: formData.mrp || 0, status: 'draft' });
      } else {
        const isAdmin = window.location.pathname.startsWith('/admin');
        const finalData = { ...formData, mrp: formData.mrp || 0, status: 'draft' };
        if (isAdmin) {
          await productApi.create(finalData);
        } else {
          await productApi.createSPH(finalData);
        }
      }
      navigate(getRedirectPath());
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to save draft';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleFileUpload = async (file: File, field: "thumbnailUrl" | "imageUrls", index?: number) => {
    try {
      const uploadId = index !== undefined ? `${field}-${index}` : field;
      setIsUploading(uploadId);
      const res = await uploadApi.uploadSingle(file);
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
    switch (currentStep) {
      case 1:
        return formData.name && formData.sku && formData.categoryId && formData.type;
      case 2:
        return true;
      case 3:
        const isB2BValid = formData.profitChannel === 'B2B' && (formData.bulkPrice || 0) > 0;
        const isB2CValid = formData.profitChannel === 'B2C' && (formData.sellingPrice || 0) > 0;
        return formData.mrp > 0 && formData.basePrice >= 0 && (isB2BValid || isB2CValid);
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="border-t-4 border-t-primary shadow-md">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Enter the basic identification details about your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Target Channel *</Label>
                    <Select value={formData.profitChannel} onValueChange={(val) => handleInputChange("profitChannel", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B2C">B2C Retail (Primary)</SelectItem>
                        <SelectItem value="B2B">B2B Bulk (Wholesale)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU / Code *</Label>
                    <Input
                      id="sku"
                      placeholder="e.g., WBH-001"
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
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Product Type *</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "physical", label: "Physical", icon: Package },
                        { value: "digital", label: "Digital", icon: DollarSign },
                        { value: "service", label: "Service", icon: Tag },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange("type", type.value)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                            formData.type === type.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <type.icon className={cn("h-6 w-6", formData.type === type.value ? "text-primary" : "text-muted-foreground")} />
                          <span className={cn("text-sm font-medium", formData.type === type.value ? "text-primary" : "text-muted-foreground")}>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Product description..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Inventory Section (Merged) */}
            <Card className="border-t-4 border-t-orange-500 shadow-sm">
              <CardHeader className="bg-muted/30 pb-3 border-b flex flex-row items-center gap-2">
                <Tag className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-sm">Inventory & Stock Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="stockRequired" checked={formData.stockRequired} onCheckedChange={(checked) => handleInputChange("stockRequired", checked)} />
                  <Label htmlFor="stockRequired">Track inventory for this product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="isDealerRouted" checked={formData.is_dealer_routed} onCheckedChange={(checked) => handleInputChange("is_dealer_routed", checked)} />
                  <div className="space-y-1">
                    <Label htmlFor="isDealerRouted" className="font-medium">Dealer Routed Product (B2B Auto-assignment)</Label>
                    <p className="text-[10px] text-muted-foreground">B2B orders will be auto-assigned to the nearest Dealer.</p>
                  </div>
                </div>
                {formData.stockRequired && (
                  <div className="space-y-1.5 max-w-xs pl-6">
                    <Label className="text-xs">Initial Stock Quantity</Label>
                    <Input className="h-8" type="number" min="0" value={formData.stockQuantity} onChange={(e) => handleInputChange("stockQuantity", parseInt(e.target.value) || 0)} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Variations Section (Merged) */}
            <Card className="border-t-4 border-t-indigo-500 shadow-sm">
              <CardHeader className="bg-muted/30 pb-3 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <CardTitle className="text-sm">Product Variations</CardTitle>
                </div>
                <Button onClick={addVariant} variant="outline" size="xs" className="gap-1 h-7 text-[10px]"><PlusCircle className="h-3 w-3" /> Add Variant</Button>
              </CardHeader>
              <CardContent className="pt-4">
                {(formData.variants || []).length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic text-center py-2">No variations added. Product sold as single item.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.variants?.map((v, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-card/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <Input className="h-7 max-w-[180px] font-bold text-xs" value={v.variant_name} placeholder="Variant Name" onChange={(e) => handleVariantChange(idx, "variant_name", e.target.value)} />
                          <Button variant="ghost" size="icon" className="text-red-500 h-6 w-6" onClick={() => removeVariant(idx)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                          <div className="space-y-1"><Label className="text-[9px] uppercase">SKU Suffix</Label><Input className="h-7 text-[10px]" value={v.sku_suffix} onChange={(e) => handleVariantChange(idx, "sku_suffix", e.target.value)} /></div>
                          <div className="space-y-1"><Label className="text-[9px] uppercase">Attribute</Label>
                            <Select value={Object.keys(v.attributes)[0]} onValueChange={(val) => handleAttributeChange(idx, val, Object.values(v.attributes)[0] || "")}>
                              <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Weight">Weight</SelectItem><SelectItem value="Size">Size</SelectItem><SelectItem value="Color">Color</SelectItem></SelectContent>
                            </Select></div>
                          <div className="space-y-1"><Label className="text-[9px] uppercase">Value</Label><Input className="h-7 text-[10px]" value={Object.values(v.attributes)[0]} onChange={(e) => handleAttributeChange(idx, Object.keys(v.attributes)[0], e.target.value)} /></div>
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-blue-600 font-bold">MRP ₹</Label>
                            <Input className="h-7 text-[10px] border-blue-100" type="number" value={v.mrp} onChange={(e) => handleVariantChange(idx, "mrp", parseFloat(e.target.value) || 0)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-emerald-600 font-bold">Selling Price ₹</Label>
                            <Input className="h-7 text-[10px] border-emerald-100" type="number" value={v.sellingPrice} onChange={(e) => handleVariantChange(idx, "sellingPrice", parseFloat(e.target.value) || 0)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <Card className="border-t-4 border-t-blue-500 shadow-md">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-500" /> Product Media
              </CardTitle>
              <CardDescription>Add a main thumbnail and gallery images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 pt-6">
              <div className="space-y-4">
                <Label className="text-base font-bold">Main Thumbnail</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="upload" className="flex gap-2"><Upload className="h-4 w-4" /> Upload</TabsTrigger>
                    <TabsTrigger value="link" className="flex gap-2"><Tag className="h-4 w-4" /> Paste Link</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-4 pt-4">
                    <div className="flex items-center gap-6">
                      <div className="relative group h-32 w-32 rounded-xl bg-muted border-2 border-dashed flex items-center justify-center overflow-hidden transition-all hover:border-blue-500/50">
                        {formData.thumbnailUrl ? (
                          <img src={formData.thumbnailUrl.startsWith('data:') || formData.thumbnailUrl.startsWith('http') ? formData.thumbnailUrl : `${IMAGE_BASE_URL}${formData.thumbnailUrl}`} alt="Thumbnail" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Preview</p>
                          </div>
                        )}
                        {isUploading === "thumbnailUrl" && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <Button type="button" variant="outline" className="relative h-10 px-6 font-bold overflow-hidden">
                          <Upload className="h-4 w-4 mr-2" /> Choose File
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"
                            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file, "thumbnailUrl"); }} />
                        </Button>
                        {formData.thumbnailUrl && <Button variant="ghost" size="icon" className="text-red-500 ml-2" onClick={() => handleInputChange("thumbnailUrl", "")}><X className="h-4 w-4" /></Button>}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="link" className="pt-4">
                    <Input placeholder="https://example.com/image.jpg" value={formData.thumbnailUrl} onChange={(e) => handleInputChange("thumbnailUrl", e.target.value)} />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-4 pt-10 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Product Gallery</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleInputChange("imageUrls", [...(formData.imageUrls || []), ""])}>+ Add New Image</Button>
                </div>
                <div className="grid gap-4">
                  {(formData.imageUrls || []).map((url, idx) => (
                    <div key={idx} className="p-4 rounded-xl border bg-muted/30 flex items-center gap-4">
                      <div className="relative h-16 w-16 bg-background rounded border overflow-hidden">
                        {url ? <img src={url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url}`} className="h-full w-full object-cover" /> : <Upload className="h-4 w-4 m-auto mt-6 opacity-20" />}
                      </div>
                      <Input className="flex-1" placeholder="Gallery image URL" value={url} onChange={(e) => { const newUrls = [...(formData.imageUrls || [])]; newUrls[idx] = e.target.value; handleInputChange("imageUrls", newUrls); }} />
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { const newUrls = (formData.imageUrls || []).filter((_, i) => i !== idx); handleInputChange("imageUrls", newUrls); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-t-4 border-t-emerald-500 shadow-md">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-emerald-500" /> Pricing & Commission
              </CardTitle>
              <CardDescription>Set your product pricing and margin settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                <div className="space-y-2">
                  <Label>Admin Specific Margin %</Label>
                  <Input type="number" value={formData.adminMarginPct || ""} onChange={(e) => handleInputChange("adminMarginPct", parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base/Landing Price (Cost) ₹ *</Label>
                  <Input id="basePrice" type="number" value={formData.basePrice || ""} onChange={(e) => handleInputChange("basePrice", parseFloat(e.target.value) || 0)} />
                </div>

                {formData.profitChannel === "B2C" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Label htmlFor="sellingPrice" className="text-blue-600 font-bold">Selling Price (B2C) ₹ *</Label>
                    <Input id="sellingPrice" type="number" className="border-blue-200 focus:ring-blue-500" value={formData.sellingPrice || ""} onChange={(e) => handleInputChange("sellingPrice", parseFloat(e.target.value) || 0)} />
                  </div>
                )}

                {formData.profitChannel === "B2B" && (
                  <>
                    <div className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-300">
                      <Label htmlFor="bulkPrice" className="text-emerald-600 font-bold">Bulk Price (B2B) ₹ *</Label>
                      <Input id="bulkPrice" type="number" className="border-emerald-200 focus:ring-emerald-500" value={formData.bulkPrice || ""} onChange={(e) => handleInputChange("bulkPrice", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2 animate-in fade-in slide-in-from-right-3 duration-400">
                      <Label htmlFor="minOrderQuantity" className="text-emerald-600 font-bold">Min Order Quantity (B2B) *</Label>
                      <Input id="minOrderQuantity" type="number" min="1" className="border-emerald-200 focus:ring-emerald-500" value={formData.minOrderQuantity || 1} onChange={(e) => handleInputChange("minOrderQuantity", parseInt(e.target.value) || 1)} />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="mrp" className="text-slate-900 font-bold">Maximum Retail Price (MRP) ₹ *</Label>
                  <Input id="mrp" type="number" placeholder="0.00" value={formData.mrp || ""} onChange={(e) => handleInputChange("mrp", parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              {formData.profitChannel === "B2C" && (
                <div className={cn("p-4 rounded-lg border mt-4 animate-in zoom-in-95 duration-300", marginWarning ? "border-amber-500/30 bg-amber-500/10" : "border-green-500/30 bg-green-500/10")}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Customer Gross Margin: <span className={cn("text-xl font-bold ml-2", marginWarning ? "text-amber-600" : "text-green-600")}>{marginPercent.toFixed(1)}%</span></p>
                    {marginWarning && <p className="text-xs text-amber-600 font-bold">Below min {formData.minMarginPercent}%</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-t-4 border-t-blue-600 shadow-md">
            <CardHeader className="bg-muted/30 pb-4 border-b">
              <CardTitle className="text-lg">Review & Publish</CardTitle>
              <CardDescription>Final check of your product configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-4 rounded-lg bg-blue-50/20 border border-blue-100 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1"><p className="text-[10px] text-muted-foreground font-bold font-mono">SELLING PRICE</p><p className="font-black text-blue-600">₹{formData.sellingPrice.toFixed(2)}</p></div>
                <div className="space-y-1"><p className="text-[10px] text-muted-foreground font-bold font-mono">CATEGORY</p><p className="text-xs font-bold line-clamp-1">{categories.find(c => c.id === formData.categoryId)?.name || 'N/A'}</p></div>
                <div className="space-y-1"><p className="text-[10px] text-muted-foreground font-bold font-mono">VARIANTS</p><p className="text-xs font-bold">{formData.variants?.length || 0} Added</p></div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Confirmation</p>
                <div className="p-4 rounded-xl border bg-muted/20 flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <p className="text-sm">Ready to push product to live marketplace.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-600 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-muted-foreground/10">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center group">
            <button
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                currentStep >= step.id ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
              )}>
                {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <div className="hidden md:block text-left">
                <p className={cn("text-xs font-bold", currentStep >= step.id ? "text-foreground" : "text-muted-foreground")}>{step.title}</p>
                <p className="text-[10px] text-muted-foreground opacity-60">{step.description.split(',')[0]}</p>
              </div>
            </button>
            {idx < steps.length - 1 && <div className={cn("w-6 h-[2px] mx-4", currentStep > step.id ? "bg-primary" : "bg-muted-foreground/20")} />}
          </div>
        ))}
      </div>

      {renderStepContent()}

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="container max-w-5xl mx-auto flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" type="button" onClick={() => navigate(getRedirectPath())}>Discard</Button>
            <Button variant="outline" type="button" onClick={handleSaveDraft} disabled={isSaving}><Save className="h-4 w-4 mr-2" /> Save Draft</Button>
            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext} disabled={!canProceed()}>Next Step <ArrowRight className="h-4 w-4 ml-2" /></Button>
            ) : (
              <Button type="button" onClick={handleSave} disabled={!canProceed() || isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]">
                {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Check className="h-4 w-4 mr-2" /> Publish Product</>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
